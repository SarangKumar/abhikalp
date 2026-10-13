import { NextResponse } from "next/server";
import { z } from "zod";

import { isObjectId } from "@/lib/access";
import { logActivity } from "@/lib/activity";
import { jsonError, parseBody, requireProject, type RouteCtx } from "@/lib/api";
import { prisma } from "@/lib/prisma";

const fields = {
  title: z.string().trim().min(1, "Title is required").max(120),
  description: z.string().max(2000).nullable(),
  startDate: z.coerce.date().nullable(),
  dueDate: z.coerce.date().nullable(),
};
const createSchema = z.object({
  ...fields,
  description: fields.description.optional(),
  startDate: fields.startDate.optional(),
  dueDate: fields.dueDate.optional(),
});
const updateSchema = z
  .object({ id: z.string() })
  .extend(z.object(fields).partial().shape);

const badRange = (s?: Date | null, d?: Date | null) =>
  s instanceof Date && d instanceof Date && s > d;

export async function GET(_req: Request, { params }: RouteCtx) {
  const ctx = await requireProject((await params).projectId, "read");
  if ("error" in ctx) return ctx.error;
  const milestones = await prisma.milestone.findMany({
    where: { projectId: ctx.access.project.id },
    orderBy: [{ dueDate: "asc" }, { createdAt: "asc" }],
    include: { tasks: { select: { status: true } } },
  });
  return NextResponse.json(milestones);
}

export async function POST(req: Request, { params }: RouteCtx) {
  const ctx = await requireProject((await params).projectId, "edit");
  if ("error" in ctx) return ctx.error;
  const body = await parseBody(req, createSchema);
  if ("error" in body) return body.error;
  if (badRange(body.data.startDate, body.data.dueDate))
    return jsonError("Start date must be before the due date");
  const projectId = ctx.access.project.id;
  const milestone = await prisma.milestone.create({
    data: { ...body.data, projectId },
  });
  await logActivity({
    projectId,
    actorId: ctx.access.user.id,
    action: "milestone.created",
    summary: `created milestone “${milestone.title}”`,
    entityId: milestone.id,
  });
  return NextResponse.json(milestone, { status: 201 });
}

export async function PATCH(req: Request, { params }: RouteCtx) {
  const ctx = await requireProject((await params).projectId, "edit");
  if ("error" in ctx) return ctx.error;
  const body = await parseBody(req, updateSchema);
  if ("error" in body) return body.error;
  const { id, ...data } = body.data;
  if (!isObjectId(id)) return jsonError("Invalid milestone");
  const projectId = ctx.access.project.id;
  const current = await prisma.milestone.findFirst({
    where: { id, projectId },
  });
  if (!current) return jsonError("Milestone not found", 404);
  if (
    badRange(
      data.startDate !== undefined ? data.startDate : current.startDate,
      data.dueDate !== undefined ? data.dueDate : current.dueDate
    )
  )
    return jsonError("Start date must be before the due date");
  await prisma.milestone.update({ where: { id }, data });
  await logActivity({
    projectId,
    actorId: ctx.access.user.id,
    action: "milestone.updated",
    summary: `updated milestone “${data.title ?? current.title}”`,
    entityId: id,
  });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request, { params }: RouteCtx) {
  const ctx = await requireProject((await params).projectId, "edit");
  if ("error" in ctx) return ctx.error;
  const id = new URL(req.url).searchParams.get("id");
  if (!isObjectId(id)) return jsonError("Invalid milestone");
  const projectId = ctx.access.project.id;
  const current = await prisma.milestone.findFirst({
    where: { id, projectId },
  });
  if (!current) return jsonError("Milestone not found", 404);
  // Unlink tasks first (Mongo has no FK cascade; Prisma emulates SetNull too).
  await prisma.task.updateMany({
    where: { milestoneId: id, projectId },
    data: { milestoneId: null },
  });
  await prisma.milestone.delete({ where: { id } });
  await logActivity({
    projectId,
    actorId: ctx.access.user.id,
    action: "milestone.deleted",
    summary: `deleted milestone “${current.title}”`,
  });
  return NextResponse.json({ ok: true });
}
