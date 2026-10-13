import "server-only";

import type { ProjectAccess } from "@/lib/access";

/** Everyone who can be assigned work: owner + members (viewers excluded). */
export function assignableMembers(access: ProjectAccess) {
  const { project } = access;
  return [
    {
      id: project.owner.id,
      name: project.owner.name,
      image: project.owner.image,
    },
    ...project.members
      .filter((m) => m.role !== "VIEWER")
      .map((m) => ({ id: m.user.id, name: m.user.name, image: m.user.image })),
  ];
}

export function allMembers(access: ProjectAccess) {
  const { project } = access;
  return [
    {
      id: project.owner.id,
      name: project.owner.name,
      image: project.owner.image,
    },
    ...project.members.map((m) => ({
      id: m.user.id,
      name: m.user.name,
      image: m.user.image,
    })),
  ];
}
