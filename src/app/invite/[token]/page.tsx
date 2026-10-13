import { MailWarning, Users } from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { getUserBySession } from "@/app/api/utils";
import AcceptInviteButton from "@/components/dashboad/accept-invite-button";
import Logo from "@/components/logo";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ROLE_DESCRIPTION, ROLE_LABEL } from "@/config/roles";
import { siteConfig } from "@/config/site";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: `Project invite | ${siteConfig.name}`,
  robots: { index: false },
};

export default async function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const user = await getUserBySession();
  if (!user)
    redirect(
      `/auth/sign-in?callbackUrl=${encodeURIComponent(`/invite/${token}`)}`
    );

  const invite = await prisma.projectInvite.findUnique({
    where: { token },
    include: {
      project: { select: { id: true, title: true, description: true } },
      invitedBy: { select: { name: true } },
    },
  });

  const problem = !invite
    ? "This invite link is not valid."
    : invite.acceptedAt
      ? null
      : invite.expiresAt < new Date()
        ? "This invite has expired. Ask the project owner for a new one."
        : invite.email !== user.email.toLowerCase()
          ? `This invite was sent to ${invite.email}, but you're signed in as ${user.email}.`
          : null;

  return (
    <main className="mesh flex min-h-dvh items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="items-center text-center">
          <Logo className="mb-2 size-10" />
          {invite && !problem ? (
            <>
              <CardTitle className="flex items-center gap-2">
                <Users className="text-primary size-5" /> Join{" "}
                {invite.project.title}
              </CardTitle>
              <CardDescription>
                {invite.invitedBy.name} invited you as{" "}
                <strong>{ROLE_LABEL[invite.role]}</strong>:{" "}
                {ROLE_DESCRIPTION[invite.role].toLowerCase()}.
              </CardDescription>
            </>
          ) : (
            <>
              <CardTitle className="flex items-center gap-2">
                <MailWarning className="text-destructive size-5" /> Invite
                unavailable
              </CardTitle>
              <CardDescription>{problem}</CardDescription>
            </>
          )}
        </CardHeader>
        {invite && !problem && invite.project.description && (
          <CardContent>
            <p className="text-muted-foreground line-clamp-4 text-sm">
              {invite.project.description}
            </p>
          </CardContent>
        )}
        <CardFooter className="justify-center gap-2">
          <Link
            href="/dashboard"
            className={buttonVariants({ variant: "ghost" })}
          >
            Go to dashboard
          </Link>
          {invite && !problem && (
            <AcceptInviteButton token={token}>
              {invite.acceptedAt ? "Open project" : "Accept invite"}
            </AcceptInviteButton>
          )}
        </CardFooter>
      </Card>
    </main>
  );
}
