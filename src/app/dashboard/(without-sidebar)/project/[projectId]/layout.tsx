import { Metadata } from "next";
import { notFound } from "next/navigation";
import React from "react";

import ProjectHeader from "@/components/dashboad/project/project-header";
import { DashboardShell } from "@/components/dashboad/sidebar/dashboard-shell";
import { projectNav } from "@/components/dashboad/sidebar/nav";
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
  await requireUser(`/dashboard/project/${projectId}`);
  const access = await getProjectAccess(projectId);
  if (!access) notFound();

  return (
    <DashboardShell nav={projectNav(projectId)} subtitle={access.project.title}>
      <ProjectHeader project={access.project} role={access.role} />
      <div className="h-auto text-sm">{children}</div>
    </DashboardShell>
  );
};

export default DashboardProjectsLayout;
