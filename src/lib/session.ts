import "server-only";

import { redirect } from "next/navigation";

import { getUserBySession } from "@/app/api/utils";

/**
 * The signed-in user for a protected page. A valid JWT whose user no longer
 * exists in the database (e.g. after switching databases) is treated as
 * signed out instead of rendering a blank page.
 */
export async function requireUser(
  callbackUrl = "/dashboard",
  opts: { project?: boolean } = {}
) {
  const user = await getUserBySession(opts);
  if (!user) {
    redirect(
      `/auth/sign-in?error=SessionExpired&callbackUrl=${encodeURIComponent(callbackUrl)}`
    );
  }
  return user;
}
