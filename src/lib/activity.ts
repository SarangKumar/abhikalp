import "server-only";

import { prisma } from "@/lib/prisma";

/** Append to a project's activity feed. Never throws: logging must not break writes. */
export async function logActivity(entry: {
  projectId: string;
  actorId?: string | null;
  action: string;
  summary: string;
  entityId?: string | null;
}) {
  try {
    await prisma.activityLog.create({
      data: {
        projectId: entry.projectId,
        actorId: entry.actorId ?? null,
        action: entry.action,
        summary: entry.summary.slice(0, 280),
        entityId: entry.entityId ?? null,
      },
    });
  } catch (error) {
    console.error("[activity]", (error as Error).message);
  }
}
