import { NextRequest, NextResponse } from "next/server";

import { getUserBySession } from "@/app/api/utils";

import cleanHtml from "./utils";

export async function POST(req: NextRequest) {
  const user = await getUserBySession();
  if (!user)
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { url } = await req.json();
  let target: URL;
  try {
    target = new URL(url);
    if (!["http:", "https:"].includes(target.protocol)) throw new Error();
  } catch {
    return NextResponse.json(
      { message: "A valid http(s) URL is required" },
      { status: 400 }
    );
  }

  const response = await fetch(target, { signal: AbortSignal.timeout(10_000) });
  const text = cleanHtml(await response.text());

  return NextResponse.json(
    { message: "Scraped data successfully", data: text },
    { status: 200 }
  );
}
