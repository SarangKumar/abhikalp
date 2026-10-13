import { randomBytes } from "node:crypto";

import { NextResponse } from "next/server";
import { z } from "zod";

import { getSubscriptionConfig } from "@/config/subscription";
import { ASSIGNABLE_ROLES, isObjectId } from "@/lib/access";
import { jsonError, parseBody, requireProject, type RouteCtx } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { getAppUrl } from "@/lib/url";

const schema = z.object({
  email: z
    .email("Enter a valid email")
    .transform((e) => e.toLowerCase().trim()),
  role: z.enum(ASSIGNABLE_ROLES).default("COLLABORATOR"),
  expiresInDays: z.coerce.number().int().min(1).max(365).default(7),
});

/** Invite someone by email. Returns a shareable accept link. */
export async function POST(req: Request, { params }: RouteCtx) {
  const ctx = await requireProject((await params).projectId, "manageMembers");
  if ("error" in ctx) return ctx.error;
  const body = await parseBody(req, schema);
  if ("error" in body) return body.error;

  const { project } = ctx.access;
  const { email, role, expiresInDays } = body.data;
  // Limits follow the project owner's plan.
  const plan = getSubscriptionConfig(project.owner.subscription);

  if (expiresInDays > plan.maxInviteDays) {
    return jsonError(
      `Your plan allows invite links up to ${plan.maxInviteDays} days.`
    );
  }
  if (project.owner.email.toLowerCase() === email) {
    return jsonError("That's the project owner.");
  }
  if (project.members.some((m) => m.user.email.toLowerCase() === email)) {
    return jsonError("Already a member of this project.");
  }
  const pending = await prisma.projectInvite.count({
    where: {
      projectId: project.id,
      acceptedAt: null,
      expiresAt: { gt: new Date() },
    },
  });
  if (project.members.length + pending >= plan.maxMembers) {
    return jsonError(
      `Your plan allows ${plan.maxMembers} collaborators per project. Upgrade to add more.`,
      402
    );
  }

  // Replace any earlier pending invite for this email.
  await prisma.projectInvite.deleteMany({
    where: { projectId: project.id, email, acceptedAt: null },
  });
  const invite = await prisma.projectInvite.create({
    data: {
      email,
      role,
      token: randomBytes(24).toString("base64url"),
      expiresAt: new Date(Date.now() + expiresInDays * 86_400_000),
      projectId: project.id,
      invitedById: ctx.access.user.id,
    },
  });

  return NextResponse.json(
    { id: invite.id, url: `${getAppUrl()}/invite/${invite.token}` },
    { status: 201 }
  );
}

/** Revoke a pending invite. */
export async function DELETE(req: Request, { params }: RouteCtx) {
  const ctx = await requireProject((await params).projectId, "manageMembers");
  if ("error" in ctx) return ctx.error;
  const inviteId = new URL(req.url).searchParams.get("inviteId");
  if (!isObjectId(inviteId)) return jsonError("Invalid invite");

  const { count } = await prisma.projectInvite.deleteMany({
    where: { id: inviteId, projectId: ctx.access.project.id },
  });
  if (!count) return jsonError("Invite not found", 404);
  return NextResponse.json({ ok: true });
}
