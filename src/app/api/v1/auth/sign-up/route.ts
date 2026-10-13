import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

import { ServerResponse } from "@/app/api/utils";
import prisma from "@/lib/prisma";
import { SignupSchema } from "@/types/schema";

function fail(description: string, status: number) {
  return NextResponse.json(
    ServerResponse(
      null,
      false,
      description,
      { title: "Error", description },
      status
    ),
    { status }
  );
}

export async function POST(req: NextRequest) {
  const parsed = SignupSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return fail(
      parsed.error.issues[0]?.message ?? "Please fill all fields",
      400
    );
  }
  const { name, email, password } = parsed.data;

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
    if (existingUser) return fail("User already exists", 400);

    const hashedPassword = await bcrypt.hash(
      password,
      Number(process.env.SALT_ROUNDS ?? 10)
    );

    const user = await prisma.user.create({
      data: { name, email: email.toLowerCase(), password: hashedPassword },
      select: { id: true, name: true, email: true },
    });

    return NextResponse.json(
      ServerResponse(
        user,
        true,
        null,
        {
          title: "Sign Up successful",
          description: "User created successfull, login to continue.",
        },
        201
      ),
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    return fail("Something went wrong, please try again later.", 500);
  }
}
