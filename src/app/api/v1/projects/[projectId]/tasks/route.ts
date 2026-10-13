import { NextResponse } from "next/server";
import { z } from "zod";

import { isObjectId } from "@/lib/access";
import { jsonError, parseBody, requireProject, type RouteCtx } from "@/lib/api";
import { prisma } from "@/lib/prisma";

const fields = {
  title: z.string().trim().min(1, "Title is required").max(140),
  description: z.string().max(5000).optional(),
  status: z.enum(["PENDING", "IN_PROGRESS", "COMPLETED"]),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]),
  estimatedTimeForCompletion: z.coerce
    .number()
    .int()
    .min(0)
    .max(1000)
    .nullable(),
  dueDate: z.coerce.date().nullable(),
};
const createSchema = z.object({
  ...fields,
  status: fields.status.default("PENDING"),
  priority: fields.priority.default("MEDIUM"),
  estimatedTimeForCompletion: fields.estimatedTimeForCompletion.optional(),
  dueDate: fields.dueDate.optional(),
});
const updateSchema = z
  .object({ id: z.string() })
  .extend(z.object(fields).partial().shape);

const STATUSES = ["PENDING", "IN_PROGRESS", "COMPLETED"] as const;
const reorderSchema = z.object({
  columns: z.object(
    Object.fromEntries(
      STATUSES.map((s) => [s, z.array(z.string()).max(1000)])
    ) as Record<(typeof STATUSES)[number], z.ZodArray<z.ZodString>>
  ),
});

/** Next position at the end of a status column. */
async function nextOrder(projectId: string, status: string) {
  const last = await prisma.task.findFirst({
    where: { projectId, status: status as (typeof STATUSES)[number] },
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

  const task = await prisma.task.create({
    data: {
      ...body.data,
      order: await nextOrder(ctx.access.project.id, body.data.status),
      projectId: ctx.access.project.id,
    },
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
  if (data.status) {
    const current = await prisma.task.findFirst({
      where: { id, projectId },
      select: { status: true },
    });
    if (current && current.status !== data.status)
      Object.assign(data, { order: await nextOrder(projectId, data.status) });
  }
  const { count } = await prisma.task.updateMany({
    where: { id, projectId },
    data,
  });
  if (!count) return jsonError("Task not found", 404);
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request, { params }: RouteCtx) {
  const ctx = await requireProject((await params).projectId, "edit");
  if ("error" in ctx) return ctx.error;
  const id = new URL(req.url).searchParams.get("id");
  if (!isObjectId(id)) return jsonError("Invalid task");
  const { count } = await prisma.task.deleteMany({
    where: { id, projectId: ctx.access.project.id },
  });
  if (!count) return jsonError("Task not found", 404);
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
  const owned = await prisma.task.count({
    where: { id: { in: ids }, projectId },
  });
  if (owned !== ids.length) return jsonError("Task not found", 404);

  try {
    await prisma.$transaction(
      entries.map(({ id, status, order }) =>
        prisma.task.update({ where: { id }, data: { status, order } })
      )
    );
  } catch (error) {
    console.error("[tasks:reorder]", (error as Error).message);
    return jsonError("Could not save the board order. Please try again.", 500);
  }
  return NextResponse.json({ ok: true });
}
