import { NextRequest, NextResponse } from "next/server";

import { getUserBySession } from "@/app/api/utils";

// TODO(share-links): persist share links (needs a ShareLink model) and
// enforce per-plan expiry limits. Currently a no-op stub.
export async function POST(req: NextRequest) {
  const user = await getUserBySession();
  if (!user)
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  await req.json();
  return NextResponse.json({ message: "Not implemented yet" }, { status: 501 });
}
