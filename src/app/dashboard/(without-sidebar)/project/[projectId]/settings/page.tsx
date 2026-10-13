import { Metadata } from "next";
import { notFound } from "next/navigation";

import DangerZone from "@/components/dashboad/project/settings/danger-zone";
import MembersPanel from "@/components/dashboad/project/share-container";
import { getSubscriptionConfig } from "@/config/subscription";
import { siteConfig } from "@/config/site";
import { can, getProjectAccess } from "@/lib/access";
import { notAccepted } from "@/lib/invites";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Settings",
  description: `Manage project details and collaborators in ${siteConfig.name}.`,
};

const person = (u: {
  id: string;
  name: string;
  email: string;
  image: string | null;
}) => ({
  id: u.id,
  name: u.name,
  email: u.email,
  image: u.image,
});

const SettingsPage = async ({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) => {
  const access = await getProjectAccess((await params).projectId);
  if (!access) notFound();
  const { project, role, user } = access;
  const plan = getSubscriptionConfig(project.owner.subscription);

  const invites = can.manageMembers(role)
    ? await prisma.projectInvite.findMany({
        where: {
          projectId: project.id,
          ...notAccepted,
          expiresAt: { gt: new Date() },
        },
        orderBy: { createdAt: "desc" },
      })
    : [];

  return (
    <div>
      <h2 className="page-title border-b p-4 md:p-6">
        Settings · {project.title}
      </h2>
      <div className="mx-auto max-w-5xl space-y-6 p-4 md:p-6">
        <MembersPanel
          projectId={project.id}
          viewerId={user.id}
          viewerRole={role}
          owner={person(project.owner)}
          members={project.members.map((m) => ({
            id: m.id,
            role: m.role,
            user: person(m.user),
          }))}
          invites={invites.map((i) => ({
            id: i.id,
            email: i.email,
            role: i.role,
            expiresAt: i.expiresAt.toISOString(),
          }))}
          maxInviteDays={plan.maxInviteDays}
          maxMembers={plan.maxMembers}
        />
      </div>
      {role === "OWNER" ? (
        <DangerZone project={project} />
      ) : (
        <p className="text-muted-foreground mx-auto max-w-5xl px-4 pb-6 text-xs md:px-6">
          Only the project owner can edit project details.
        </p>
      )}
    </div>
  );
};

export default SettingsPage;
