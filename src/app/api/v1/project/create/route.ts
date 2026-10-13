import { NextRequest, NextResponse } from "next/server";

import { getUserBySession, ServerResponse } from "@/app/api/utils";
import { getSubscriptionConfig } from "@/config/subscription";
import prisma from "@/lib/prisma";
import { createProjectSchema } from "@/types/schema";

export async function POST(req: NextRequest) {
  const user = await getUserBySession({ project: true });
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

  const parsed = createProjectSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      ServerResponse(
        null,
        false,
        "INVALID",
        {
          title: parsed.error.issues[0]?.message ?? "Invalid project",
          description: "",
        },
        400
      ),
      { status: 400 }
    );
  }

  if (
    user.projects.length >= getSubscriptionConfig(user.subscription).maxProjects
  ) {
    return NextResponse.json(
      ServerResponse(
        null,
        false,
        "LIMIT",
        {
          title: "Project Limit Reached",
          description: "Upgrade your subscription to create more projects.",
        },
        403
      ),
      { status: 403 }
    );
  }

  const { title, description, isFavourite, isPrivate, githubUrl, deployedUrl } =
    parsed.data;

  try {
    const project = await prisma.project.create({
      data: {
        title,
        description,
        isFavourite,
        isPrivate,
        githubUrl: githubUrl || null,
        deployedUrl: deployedUrl || null,
        ownerId: user.id,
      },
    });
    return NextResponse.json(
      ServerResponse(
        project,
        true,
        false,
        {
          title: "Project Created Successfully",
          description: "Project Created Successfully",
        },
        201
      ),
      { status: 201 }
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
