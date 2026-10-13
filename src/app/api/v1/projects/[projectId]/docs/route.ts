import { NextResponse } from "next/server";
import { z } from "zod";

import { parseBody, requireProject, type RouteCtx } from "@/lib/api";
import { prisma } from "@/lib/prisma";

/** Save the project's markdown documentation. */
export async function PUT(req: Request, { params }: RouteCtx) {
  const ctx = await requireProject((await params).projectId, "edit");
  if ("error" in ctx) return ctx.error;
  const body = await parseBody(
    req,
    z.object({ docs: z.string().max(100_000) })
  );
  if ("error" in body) return body.error;

  await prisma.project.update({
    where: { id: ctx.access.project.id },
    data: { docs: body.data.docs },
  });
  return NextResponse.json({ ok: true });
}
