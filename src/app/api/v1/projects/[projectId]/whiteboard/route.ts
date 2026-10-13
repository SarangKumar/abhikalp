import { NextResponse } from "next/server";
import { z } from "zod";

import { jsonError, requireProject, type RouteCtx } from "@/lib/api";
import { getUserBySession } from "@/app/api/utils";
import { prisma } from "@/lib/prisma";

/** Mongo documents cap at 16 MB; keep scenes well under it. */
const MAX_BYTES = 8 * 1024 * 1024;

const sceneSchema = z.object({
  elements: z.array(z.record(z.string(), z.unknown())).max(20000),
  files: z.record(z.string(), z.record(z.string(), z.unknown())).default({}),
  appState: z
    .object({ viewBackgroundColor: z.string().max(32).optional() })
    .default({}),
});

export async function GET(_req: Request, { params }: RouteCtx) {
  const ctx = await requireProject((await params).projectId, "read");
  if ("error" in ctx) return ctx.error;
  const board = await prisma.whiteboard.findUnique({
    where: { projectId: ctx.access.project.id },
  });
  return NextResponse.json({
    scene: board?.scene ?? null,
    updatedAt: board?.updatedAt ?? null,
  });
}

export async function PUT(req: Request, { params }: RouteCtx) {
  const ctx = await requireProject((await params).projectId, "edit");
  if ("error" in ctx) return ctx.error;

  const raw = await req.text();
  if (raw.length > MAX_BYTES)
    return jsonError("Whiteboard is too large to save (8 MB max).", 413);
  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    return jsonError("Invalid JSON");
  }
  const parsed = sceneSchema.safeParse(json);
  if (!parsed.success) return jsonError("Invalid whiteboard scene");

  const user = await getUserBySession({ project: false });
  const projectId = ctx.access.project.id;
  const scene = parsed.data as unknown as object;
  const board = await prisma.whiteboard.upsert({
    where: { projectId },
    create: { projectId, scene, updatedById: user?.id },
    update: { scene, updatedById: user?.id },
    select: { updatedAt: true },
  });
  return NextResponse.json({ ok: true, updatedAt: board.updatedAt });
}

/** `navigator.sendBeacon` on page hide can only POST. */
export const POST = PUT;
