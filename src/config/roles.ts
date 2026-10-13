import type { Role } from "@prisma/client";

export const ROLE_LABEL: Record<Role, string> = {
  OWNER: "Owner",
  ADMIN: "Admin",
  COLLABORATOR: "Collaborator",
  VIEWER: "Viewer",
};

export const ROLE_DESCRIPTION: Record<Role, string> = {
  OWNER: "Full control, billing and deletion",
  ADMIN: "Edit everything and manage members",
  COLLABORATOR: "Edit tasks, docs and references",
  VIEWER: "Read-only access",
};

/** Roles that can be granted to a member (owner is never granted). */
export const ASSIGNABLE_ROLES = ["ADMIN", "COLLABORATOR", "VIEWER"] as const;
export type AssignableRole = (typeof ASSIGNABLE_ROLES)[number];
