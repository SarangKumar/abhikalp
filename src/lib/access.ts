import "server-only";

import type { Role } from "@prisma/client";

export { ASSIGNABLE_ROLES, ROLE_LABEL } from "@/config/roles";
import { getUserBySession } from "@/app/api/utils";
import { prisma } from "@/lib/prisma";

export type ProjectRole = Role;

export const isObjectId = (id: unknown): id is string =>
  typeof id === "string" && /^[a-f\d]{24}$/i.test(id);

/** What each role may do. OWNER is implicit (Project.ownerId). */
export const can = {
  read: (role: ProjectRole) => Boolean(role),
  edit: (role: ProjectRole) => role !== "VIEWER",
  manageMembers: (role: ProjectRole) => role === "OWNER" || role === "ADMIN",
  editSettings: (role: ProjectRole) => role === "OWNER" || role === "ADMIN",
};

/**
 * Resolve the signed-in user's role on a project.
 * Returns null when signed out, the id is invalid, or the user has no access.
 */
export async function getProjectAccess(projectId: string) {
  const user = await getUserBySession();
  if (!user || !isObjectId(projectId)) return null;

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { owner: true, members: { include: { user: true } } },
  });
  if (!project) return null;

  let role: ProjectRole | null = null;
  if (project.ownerId === user.id) role = "OWNER";
  else role = project.members.find((m) => m.userId === user.id)?.role ?? null;
  if (!role) return null;

  return { user, project, role };
}

export type ProjectAccess = NonNullable<
  Awaited<ReturnType<typeof getProjectAccess>>
>;
