import "server-only";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function getUserByEmail(email: string) {
  return prisma.user.findUnique({ where: { email } });
}

/** The signed-in user (optionally with projects), or null. */
export async function getUserBySession({
  project = false,
}: {
  project?: boolean;
} = {}) {
  const session = await auth();
  const id = session?.user?.id;
  if (!id || !/^[a-f\d]{24}$/i.test(id)) return null;

  return prisma.user.findUnique({
    where: { id },
    include: { projects: project },
  });
}

export function ServerResponse<T>(
  data: T,
  success: boolean,
  error: unknown,
  message: { title: string; description: string },
  status: number
) {
  return { data, success, error, message, status };
}
