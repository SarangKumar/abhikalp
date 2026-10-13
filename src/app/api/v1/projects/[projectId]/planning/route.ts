import { NextResponse } from "next/server";
import { z } from "zod";

import { logActivity } from "@/lib/activity";
import { jsonError, parseBody, requireProject, type RouteCtx } from "@/lib/api";
import { prisma } from "@/lib/prisma";

const schema = z
  .object({
    status: z.enum(["PLANNING", "ACTIVE", "ON_HOLD", "COMPLETED", "ARCHIVED"]),
    health: z.enum(["ON_TRACK", "AT_RISK", "OFF_TRACK"]),
    startDate: z.coerce.date().nullable(),
    targetDate: z.coerce.date().nullable(),
  })
  .partial();

/** Project status, health and schedule (owner/admin). */
export async function PATCH(req: Request, { params }: RouteCtx) {
  const ctx = await requireProject((await params).projectId, "editSettings");
  if ("error" in ctx) return ctx.error;
  const body = await parseBody(req, schema);
  if ("error" in body) return body.error;
  const { project } = ctx.access;
  const start =
    body.data.startDate !== undefined ? body.data.startDate : project.startDate;
  const target =
    body.data.targetDate !== undefined
      ? body.data.targetDate
      : project.targetDate;
  if (start && target && start > target)
    return jsonError("Start date must be before the target date");
  await prisma.project.update({ where: { id: project.id }, data: body.data });
  await logActivity({
    projectId: project.id,
    actorId: ctx.access.user.id,
    action: "project.updated",
    summary: "updated the project plan",
  });
  return NextResponse.json({ ok: true });
}
