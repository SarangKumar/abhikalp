import "server-only";

import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

/**
 * Filter for invites not yet accepted. On MongoDB an optional field that was
 * never written is "unset", which `acceptedAt: null` alone does not match.
 */
export const notAccepted = {
  OR: [{ acceptedAt: null }, { acceptedAt: { isSet: false } }],
} satisfies Prisma.ProjectInviteWhereInput;

type AcceptResult =
  | { ok: true; projectId: string }
  | { ok: false; reason: "invalid" | "expired" | "wrong-email" };

/**
 * Accept an invite for a signed-in user. Token links are bound to the invited
 * email so a forwarded link cannot be used by someone else.
 */
export async function acceptInvite(
  token: string,
  user: { id: string; email: string }
): Promise<AcceptResult> {
  const invite = await prisma.projectInvite.findUnique({
    where: { token },
    include: { project: true },
  });
  if (!invite) return { ok: false, reason: "invalid" };
  if (invite.project.ownerId === user.id)
    return { ok: true, projectId: invite.projectId };
  if (invite.email !== user.email.toLowerCase())
    return { ok: false, reason: "wrong-email" };
  if (invite.acceptedAt) return { ok: true, projectId: invite.projectId };
  if (invite.expiresAt < new Date()) return { ok: false, reason: "expired" };

  await prisma.projectMember.upsert({
    where: {
      projectId_userId: { projectId: invite.projectId, userId: user.id },
    },
    create: { projectId: invite.projectId, userId: user.id, role: invite.role },
    update: { role: invite.role },
  });
  await prisma.projectInvite.update({
    where: { id: invite.id },
    data: { acceptedAt: new Date() },
  });
  return { ok: true, projectId: invite.projectId };
}

/** Pending, unexpired invites addressed to this email. */
export function getPendingInvites(email: string) {
  return prisma.projectInvite.findMany({
    where: {
      email: email.toLowerCase(),
      ...notAccepted,
      expiresAt: { gt: new Date() },
    },
    include: {
      project: { select: { title: true } },
      invitedBy: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}
