import type { TaskStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";

import { isObjectId, type ProjectAccess } from "@/lib/access";
import { logActivity } from "@/lib/activity";
import { jsonError, parseBody, requireProject, type RouteCtx } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { assignableMembers } from "@/lib/project-members";

const STATUSES = ["PENDING", "IN_PROGRESS", "COMPLETED"] as const;
const STATUS_LABEL: Record<TaskStatus, string> = {
  PENDING: "To do",
  IN_PROGRESS: "In progress",
  COMPLETED: "Done",
};

const objectId = z.string().refine(isObjectId, "Invalid id");
const fields = {
  title: z.string().trim().min(1, "Title is required").max(140),
  description: z.string().max(5000).optional(),
  status: z.enum(STATUSES),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]),
  estimatedTimeForCompletion: z.coerce
    .number()
    .int()
    .min(0)
    .max(1000)
    .nullable(),
  dueDate: z.coerce.date().nullable(),
  startDate: z.coerce.date().nullable(),
  assigneeId: objectId.nullable(),
  milestoneId: objectId.nullable(),
  labels: z
    .array(z.string().trim().min(1).max(24))
    .max(8)
    .transform((l) => [...new Set(l.map((x) => x.toLowerCase()))]),
  checklist: z
    .array(
      z.object({
        id: z.string().min(1).max(40),
        text: z.string().trim().min(1).max(200),
        done: z.boolean(),
      })
    )
    .max(50),
};
const createSchema = z.object({
  ...fields,
  status: fields.status.default("PENDING"),
  priority: fields.priority.default("MEDIUM"),
  estimatedTimeForCompletion: fields.estimatedTimeForCompletion.optional(),
  dueDate: fields.dueDate.optional(),
  startDate: fields.startDate.optional(),
  assigneeId: fields.assigneeId.optional(),
  milestoneId: fields.milestoneId.optional(),
  labels: fields.labels.optional(),
  checklist: fields.checklist.optional(),
});
const updateSchema = z
  .object({ id: z.string() })
  .extend(z.object(fields).partial().shape);

const reorderSchema = z.object({
  columns: z.object(
    Object.fromEntries(
      STATUSES.map((s) => [s, z.array(z.string()).max(1000)])
    ) as Record<(typeof STATUSES)[number], z.ZodArray<z.ZodString>>
  ),
});

/** Assignee must be able to edit the project; milestone must belong to it. */
async function validateRefs(
  access: ProjectAccess,
  data: { assigneeId?: string | null; milestoneId?: string | null }
) {
  if (
    data.assigneeId &&
    !assignableMembers(access).some((m) => m.id === data.assigneeId)
  )
    return "Assignee is not a project member";
  if (data.milestoneId) {
    const ok = await prisma.milestone.count({
      where: { id: data.milestoneId, projectId: access.project.id },
    });
    if (!ok) return "Milestone not found";
  }
  if (
    "startDate" in data &&
    "dueDate" in data &&
    data.startDate instanceof Date &&
    data.dueDate instanceof Date &&
    data.startDate > data.dueDate
  )
    return "Start date must be before the due date";
  return null;
}

/** Next position at the end of a status column. */
async function nextOrder(projectId: string, status: TaskStatus) {
  const last = await prisma.task.findFirst({
    where: { projectId, status },
    orderBy: { order: "desc" },
    select: { order: true },
  });
  return (last?.order ?? -1) + 1;
}

export async function POST(req: Request, { params }: RouteCtx) {
  const ctx = await requireProject((await params).projectId, "edit");
  if ("error" in ctx) return ctx.error;
  const body = await parseBody(req, createSchema);
  if ("error" in body) return body.error;
  const invalid = await validateRefs(ctx.access, body.data);
  if (invalid) return jsonError(invalid);

  const projectId = ctx.access.project.id;
  const task = await prisma.task.create({
    data: {
      ...body.data,
      completedAt: body.data.status === "COMPLETED" ? new Date() : null,
      order: await nextOrder(projectId, body.data.status),
      projectId,
    },
  });
  await logActivity({
    projectId,
    actorId: ctx.access.user.id,
    action: "task.created",
    summary: `created task “${task.title}”`,
    entityId: task.id,
  });
  return NextResponse.json(task, { status: 201 });
}

export async function PATCH(req: Request, { params }: RouteCtx) {
  const ctx = await requireProject((await params).projectId, "edit");
  if ("error" in ctx) return ctx.error;
  const body = await parseBody(req, updateSchema);
  if ("error" in body) return body.error;

  const { id, ...data } = body.data;
  if (!isObjectId(id)) return jsonError("Invalid task");
  const projectId = ctx.access.project.id;
  const current = await prisma.task.findFirst({ where: { id, projectId } });
  if (!current) return jsonError("Task not found", 404);
  const invalid = await validateRefs(ctx.access, {
    ...data,
    startDate:
      data.startDate !== undefined ? data.startDate : current.startDate,
    dueDate: data.dueDate !== undefined ? data.dueDate : current.dueDate,
  } as Parameters<typeof validateRefs>[1]);
  if (invalid) return jsonError(invalid);

  const statusChanged = data.status && data.status !== current.status;
  await prisma.task.update({
    where: { id },
    data: {
      ...data,
      ...(statusChanged && {
        order: await nextOrder(projectId, data.status!),
        completedAt: data.status === "COMPLETED" ? new Date() : null,
      }),
    },
  });

  const changes: string[] = [];
  if (statusChanged) changes.push(`moved to ${STATUS_LABEL[data.status!]}`);
  if (data.assigneeId !== undefined && data.assigneeId !== current.assigneeId)
    changes.push(data.assigneeId ? "reassigned" : "unassigned");
  if (data.dueDate !== undefined) changes.push("rescheduled");
  await logActivity({
    projectId,
    actorId: ctx.access.user.id,
    action: statusChanged ? "task.moved" : "task.updated",
    summary: `${changes.length ? changes.join(", ") : "updated"} “${current.title}”`,
    entityId: id,
  });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request, { params }: RouteCtx) {
  const ctx = await requireProject((await params).projectId, "edit");
  if ("error" in ctx) return ctx.error;
  const id = new URL(req.url).searchParams.get("id");
  if (!isObjectId(id)) return jsonError("Invalid task");
  const projectId = ctx.access.project.id;
  const task = await prisma.task.findFirst({ where: { id, projectId } });
  if (!task) return jsonError("Task not found", 404);
  await prisma.task.delete({ where: { id } });
  await logActivity({
    projectId,
    actorId: ctx.access.user.id,
    action: "task.deleted",
    summary: `deleted task “${task.title}”`,
  });
  return NextResponse.json({ ok: true });
}

/** Persist board order: every task id per status column, in display order. */
export async function PUT(req: Request, { params }: RouteCtx) {
  const ctx = await requireProject((await params).projectId, "edit");
  if ("error" in ctx) return ctx.error;
  const body = await parseBody(req, reorderSchema);
  if ("error" in body) return body.error;

  const projectId = ctx.access.project.id;
  const entries = STATUSES.flatMap((status) =>
    body.data.columns[status].map((id, order) => ({ id, status, order }))
  );
  const ids = entries.map((e) => e.id);
  if (new Set(ids).size !== ids.length || !ids.every(isObjectId))
    return jsonError("Invalid task list");
  const existing = await prisma.task.findMany({
    where: { id: { in: ids }, projectId },
    select: { id: true, title: true, status: true },
  });
  if (existing.length !== ids.length) return jsonError("Task not found", 404);
  const before = new Map(existing.map((t) => [t.id, t]));

  try {
    await prisma.$transaction(
      entries.map(({ id, status, order }) => {
        const prev = before.get(id)!;
        const moved = prev.status !== status;
        return prisma.task.update({
          where: { id },
          data: {
            status,
            order,
            ...(moved && {
              completedAt: status === "COMPLETED" ? new Date() : null,
            }),
          },
        });
      })
    );
  } catch (error) {
    console.error("[tasks:reorder]", (error as Error).message);
    return jsonError("Could not save the board order. Please try again.", 500);
  }
  for (const { id, status } of entries) {
    const prev = before.get(id)!;
    if (prev.status !== status)
      await logActivity({
        projectId,
        actorId: ctx.access.user.id,
        action: "task.moved",
        summary: `moved “${prev.title}” to ${STATUS_LABEL[status]}`,
        entityId: id,
      });
  }
  return NextResponse.json({ ok: true });
}
