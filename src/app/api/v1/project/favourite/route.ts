import { NextRequest, NextResponse } from "next/server";

import { getUserBySession, ServerResponse } from "@/app/api/utils";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const user = await getUserBySession();
  if (!user) {
    return NextResponse.json(
      ServerResponse(
        null,
        false,
        "UNAUTHORIZED",
        { title: "Please sign in", description: "" },
        401
      ),
      { status: 401 }
    );
  }

  const { projectId } = (await req.json().catch(() => ({}))) as {
    projectId?: unknown;
  };
  const projectExists =
    typeof projectId === "string"
      ? await prisma.project.findFirst({
          where: { id: projectId, ownerId: user.id },
        })
      : null;

  if (!projectExists) {
    return NextResponse.json(
      ServerResponse(
        null,
        false,
        "PROJECT NOT FOUND",
        {
          title: "Project not found",
          description:
            "The project you are trying to mark as favourite does not exist",
        },
        404
      ),
      { status: 404 }
    );
  }

  const project = await prisma.project.update({
    where: { id: projectExists.id },
    data: { isFavourite: !projectExists.isFavourite },
  });

  return NextResponse.json(
    ServerResponse(
      project,
      true,
      "PROJECT MARKED AS FAVOURITE",
      {
        title: "Project marked as favourite",
        description: "The project has been successfully marked as favourite",
      },
      200
    )
  );
}
