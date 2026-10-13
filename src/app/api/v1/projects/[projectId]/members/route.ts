import { NextResponse } from "next/server";
import { z } from "zod";

import { ASSIGNABLE_ROLES, isObjectId } from "@/lib/access";
import { jsonError, parseBody, requireProject, type RouteCtx } from "@/lib/api";
import { prisma } from "@/lib/prisma";

/** Change a member's role (owner/admin only). */
export async function PATCH(req: Request, { params }: RouteCtx) {
  const ctx = await requireProject((await params).projectId, "manageMembers");
  if ("error" in ctx) return ctx.error;
  const body = await parseBody(
    req,
    z.object({ memberId: z.string(), role: z.enum(ASSIGNABLE_ROLES) })
  );
  if ("error" in body) return body.error;

  const { access } = ctx;
  const member = access.project.members.find(
    (m) => m.id === body.data.memberId
  );
  if (!member) return jsonError("Member not found", 404);
  // Admins cannot promote/demote other admins; only the owner can.
  if (access.role === "ADMIN" && member.role === "ADMIN") {
    return jsonError("Only the owner can change an admin's role", 403);
  }

  await prisma.projectMember.update({
    where: { id: member.id },
    data: { role: body.data.role },
  });
  return NextResponse.json({ ok: true });
}

/** Remove a member. Members may also remove themselves (leave). */
export async function DELETE(req: Request, { params }: RouteCtx) {
  const ctx = await requireProject((await params).projectId, "read");
  if ("error" in ctx) return ctx.error;
  const memberId = new URL(req.url).searchParams.get("memberId");
  if (!isObjectId(memberId)) return jsonError("Invalid member");

  const { access } = ctx;
  const member = access.project.members.find((m) => m.id === memberId);
  if (!member) return jsonError("Member not found", 404);

  const isSelf = member.userId === access.user.id;
  const canManage =
    access.role === "OWNER" ||
    (access.role === "ADMIN" && member.role !== "ADMIN");
  if (!isSelf && !canManage) return jsonError("Not allowed", 403);

  await prisma.projectMember.delete({ where: { id: member.id } });
  return NextResponse.json({ ok: true });
}
