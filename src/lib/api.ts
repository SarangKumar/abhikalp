import "server-only";

import { NextResponse } from "next/server";
import type { z } from "zod";

import { can, getProjectAccess, type ProjectAccess } from "@/lib/access";

export const jsonError = (message: string, status = 400) =>
  NextResponse.json({ message }, { status });

export async function parseBody<T extends z.ZodType>(
  req: Request,
  schema: T
): Promise<{ data: z.infer<T> } | { error: NextResponse }> {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return {
      error: jsonError(parsed.error.issues[0]?.message ?? "Invalid request"),
    };
  }
  return { data: parsed.data };
}

/**
 * Resolve access for a project route. `need` is the permission required;
 * returns either the access object or a ready-made error response.
 */
export async function requireProject(
  projectId: string,
  need: keyof typeof can = "read"
): Promise<{ access: ProjectAccess } | { error: NextResponse }> {
  const access = await getProjectAccess(projectId);
  if (!access) return { error: jsonError("Project not found", 404) };
  if (!can[need](access.role)) {
    return { error: jsonError("You don't have permission to do that", 403) };
  }
  return { access };
}

export type RouteCtx = { params: Promise<{ projectId: string }> };
