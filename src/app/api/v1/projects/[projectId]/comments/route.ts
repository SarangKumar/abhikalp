import { NextResponse } from "next/server";
import { z } from "zod";

import { isObjectId } from "@/lib/access";
import { logActivity } from "@/lib/activity";
import { jsonError, parseBody, requireProject, type RouteCtx } from "@/lib/api";
import { prisma } from "@/lib/prisma";

const createSchema = z.object({
  taskId: z.string().refine(isObjectId, "Invalid task"),
  body: z.string().trim().min(1, "Comment is empty").max(2000),
});

async function taskInProject(taskId: string, projectId: string) {
  return prisma.task.findFirst({
    where: { id: taskId, projectId },
    select: { id: true, title: true },
  });
}

/** Readers may view comments. */
export async function GET(req: Request, { params }: RouteCtx) {
  const ctx = await requireProject((await params).projectId, "read");
  if ("error" in ctx) return ctx.error;
  const taskId = new URL(req.url).searchParams.get("taskId");
  if (!isObjectId(taskId)) return jsonError("Invalid task");
  if (!(await taskInProject(taskId, ctx.access.project.id)))
    return jsonError("Task not found", 404);
  const comments = await prisma.taskComment.findMany({
    where: { taskId },
    orderBy: { createdAt: "asc" },
    include: { author: { select: { id: true, name: true, image: true } } },
  });
  return NextResponse.json(comments);
}

/** Editors may comment (viewers are read-only). */
export async function POST(req: Request, { params }: RouteCtx) {
  const ctx = await requireProject((await params).projectId, "edit");
  if ("error" in ctx) return ctx.error;
  const body = await parseBody(req, createSchema);
  if ("error" in body) return body.error;
  const projectId = ctx.access.project.id;
  const task = await taskInProject(body.data.taskId, projectId);
  if (!task) return jsonError("Task not found", 404);
  const comment = await prisma.taskComment.create({
    data: { ...body.data, authorId: ctx.access.user.id },
    include: { author: { select: { id: true, name: true, image: true } } },
  });
  await logActivity({
    projectId,
    actorId: ctx.access.user.id,
    action: "task.commented",
    summary: `commented on “${task.title}”`,
    entityId: task.id,
  });
  return NextResponse.json(comment, { status: 201 });
}

/** Authors delete their own comments; owners/admins can delete any. */
export async function DELETE(req: Request, { params }: RouteCtx) {
  const ctx = await requireProject((await params).projectId, "read");
  if ("error" in ctx) return ctx.error;
  const id = new URL(req.url).searchParams.get("id");
  if (!isObjectId(id)) return jsonError("Invalid comment");
  const comment = await prisma.taskComment.findUnique({
    where: { id },
    include: { task: { select: { projectId: true } } },
  });
  if (!comment || comment.task.projectId !== ctx.access.project.id)
    return jsonError("Comment not found", 404);
  const { role, user } = ctx.access;
  if (comment.authorId !== user.id && role !== "OWNER" && role !== "ADMIN")
    return jsonError("You can only delete your own comments", 403);
  await prisma.taskComment.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
