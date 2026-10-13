import { Metadata } from "next";
import { notFound } from "next/navigation";

import DangerZone from "@/components/dashboad/project/settings/danger-zone";
import { PageHeader } from "@/components/dashboad/project/planning/page-header";
import { ProjectPlanCard } from "@/components/dashboad/project/settings/project-plan-card";
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
    <div className="mx-auto w-full max-w-4xl space-y-6 p-4 md:p-6">
      <PageHeader
        title="Settings"
        description={`Plan, members and details for ${project.title}.`}
      />
      <ProjectPlanCard
        projectId={project.id}
        canEdit={can.editSettings(role)}
        initial={{
          status: project.status ?? "ACTIVE",
          health: project.health ?? "ON_TRACK",
          startDate: project.startDate?.toISOString() ?? null,
          targetDate: project.targetDate?.toISOString() ?? null,
        }}
      />
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
      {role === "OWNER" ? (
        <DangerZone project={project} />
      ) : (
        <p className="text-muted-foreground text-xs">
          Only the project owner can edit project details.
        </p>
      )}
    </div>
  );
};

export default SettingsPage;
