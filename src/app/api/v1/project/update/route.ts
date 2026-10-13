import { NextRequest, NextResponse } from "next/server";

import { getUserBySession, ServerResponse } from "@/app/api/utils";
import prisma from "@/lib/prisma";
import { createProjectSchema } from "@/types/schema";

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

  const body = await req.json();
  const parsed = createProjectSchema.safeParse(body);
  const projectId = typeof body?.projectId === "string" ? body.projectId : "";
  if (!parsed.success || !projectId) {
    return NextResponse.json(
      ServerResponse(
        null,
        false,
        "INVALID",
        {
          title: parsed.error?.issues[0]?.message ?? "Invalid project",
          description: "",
        },
        400
      ),
      { status: 400 }
    );
  }

  // Only the owner may edit.
  const owned = await prisma.project.findFirst({
    where: { id: projectId, ownerId: user.id },
  });
  if (!owned) {
    return NextResponse.json(
      ServerResponse(
        null,
        false,
        "NOT FOUND",
        { title: "Project not found", description: "" },
        404
      ),
      { status: 404 }
    );
  }

  const { title, description, isFavourite, isPrivate, githubUrl, deployedUrl } =
    parsed.data;
  try {
    const project = await prisma.project.update({
      where: { id: projectId },
      data: {
        title,
        description,
        isFavourite,
        isPrivate,
        githubUrl: githubUrl || null,
        deployedUrl: deployedUrl || null,
      },
    });
    return NextResponse.json(
      ServerResponse(
        project,
        true,
        false,
        {
          title: "Project Updated Successfully",
          description: "Project Updated Successfully",
        },
        200
      )
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      ServerResponse(
        null,
        false,
        "SERVER ERROR",
        {
          title: "Something went wrong with the server",
          description:
            "Something went wrong with the server, please try again later.",
        },
        500
      ),
      { status: 500 }
    );
  }
}
