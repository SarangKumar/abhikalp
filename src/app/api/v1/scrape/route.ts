import { NextRequest, NextResponse } from "next/server";

import { getUserBySession } from "@/app/api/utils";
import { jsonError } from "@/lib/api";
import { ScrapeError, scrapePage } from "@/lib/scrape";

/** Preview a scrape without saving it. */
export async function POST(req: NextRequest) {
  const user = await getUserBySession();
  if (!user) return jsonError("Unauthorized", 401);
  const { url } = await req.json().catch(() => ({}));
  try {
    const page = await scrapePage(url);
    return NextResponse.json({
      message: "Scraped data successfully",
      data: page.content,
      ...page,
    });
  } catch (error) {
    if (error instanceof ScrapeError) return jsonError(error.message);
    console.error("[scrape]", error);
    return jsonError("Scrape failed", 500);
  }
}
