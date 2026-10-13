import { NextResponse } from "next/server";
import { z } from "zod";

import { isObjectId } from "@/lib/access";
import { jsonError, parseBody, requireProject, type RouteCtx } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { ScrapeError, scrapePage } from "@/lib/scrape";

/** Scrape a URL and save it as a project reference. */
export async function POST(req: Request, { params }: RouteCtx) {
  const ctx = await requireProject((await params).projectId, "edit");
  if ("error" in ctx) return ctx.error;
  const body = await parseBody(req, z.object({ url: z.string().min(4) }));
  if ("error" in body) return body.error;

  try {
    const page = await scrapePage(body.data.url);
    const ref = await prisma.reference.create({
      data: { ...page, projectId: ctx.access.project.id },
    });
    return NextResponse.json(ref, { status: 201 });
  } catch (error) {
    if (error instanceof ScrapeError) return jsonError(error.message);
    console.error("[references]", error);
    return jsonError("Could not save reference", 500);
  }
}

export async function DELETE(req: Request, { params }: RouteCtx) {
  const ctx = await requireProject((await params).projectId, "edit");
  if ("error" in ctx) return ctx.error;
  const id = new URL(req.url).searchParams.get("id");
  if (!isObjectId(id)) return jsonError("Invalid reference");
  const { count } = await prisma.reference.deleteMany({
    where: { id, projectId: ctx.access.project.id },
  });
  if (!count) return jsonError("Reference not found", 404);
  return NextResponse.json({ ok: true });
}
