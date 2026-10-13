import { Metadata } from "next";
import { notFound } from "next/navigation";
import React from "react";

import ProjectHeader from "@/components/dashboad/project/project-header";
import { DashboardShell } from "@/components/dashboad/sidebar/dashboard-shell";
import { projectNav } from "@/components/dashboad/sidebar/nav";
import { ProjectSwitcher } from "@/components/dashboad/sidebar/project-switcher";
import { prisma } from "@/lib/prisma";
import { siteConfig } from "@/config/site";
import { getProjectAccess } from "@/lib/access";
import { requireUser } from "@/lib/session";

export const metadata: Metadata = {
  title: {
    template: `%s | Dashboard | ${siteConfig.name}`,
    default: `Dashboard | ${siteConfig.name}`,
  },
  description: `Explore your projects and manage them efficiently on ${siteConfig.name}'s dashboard. Collaborate with your team seamlessly.`,
};

const DashboardProjectsLayout = async ({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ projectId: string }>;
}>) => {
  const { projectId } = await params;
  const user = await requireUser(`/dashboard/project/${projectId}`);
  const access = await getProjectAccess(projectId);
  if (!access) notFound();

  const [owned, memberships] = await Promise.all([
    prisma.project.findMany({
      where: { ownerId: user.id },
      select: { id: true, title: true },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.projectMember.findMany({
      where: { userId: user.id },
      select: { project: { select: { id: true, title: true } } },
    }),
  ]);
  const projects = [
    ...owned.map((p) => ({ ...p, shared: false })),
    ...memberships
      .map((m) => ({ ...m.project, shared: true }))
      .filter((p) => !owned.some((o) => o.id === p.id)),
  ];
  const current = projects.find((p) => p.id === access.project.id) ?? {
    id: access.project.id,
    title: access.project.title,
    shared: access.role !== "OWNER",
  };

  return (
    <DashboardShell
      nav={projectNav(projectId)}
      subtitle={access.project.title}
      header={<ProjectSwitcher current={current} projects={projects} />}
    >
      <ProjectHeader project={access.project} role={access.role} />
      <div className="h-auto text-sm">{children}</div>
    </DashboardShell>
  );
};

export default DashboardProjectsLayout;
