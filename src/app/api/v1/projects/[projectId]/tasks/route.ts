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

export async function POST(req: Request, { params }: RouteCtx) {
  const ctx = await requireProject((await params).projectId, "edit");
  if ("error" in ctx) return ctx.error;
  const body = await parseBody(req, createSchema);
  if ("error" in body) return body.error;

  const task = await prisma.task.create({
    data: { ...body.data, projectId: ctx.access.project.id },
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
  const { count } = await prisma.task.updateMany({
    where: { id, projectId: ctx.access.project.id },
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
