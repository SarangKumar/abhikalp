import { NextResponse } from "next/server";
import { z } from "zod";

import { getUserBySession } from "@/app/api/utils";
import { jsonError, parseBody } from "@/lib/api";
import { acceptInvite } from "@/lib/invites";

const MESSAGES = {
  invalid: "This invite link is not valid.",
  expired: "This invite has expired. Ask for a new one.",
  "wrong-email": "This invite was sent to a different email address.",
} as const;

export async function POST(req: Request) {
  const user = await getUserBySession();
  if (!user) return jsonError("Please sign in first.", 401);
  const body = await parseBody(req, z.object({ token: z.string().min(10) }));
  if ("error" in body) return body.error;

  const result = await acceptInvite(body.data.token, user);
  if (!result.ok) return jsonError(MESSAGES[result.reason], 400);
  return NextResponse.json({ projectId: result.projectId });
}
