import { Metadata } from "next";
import { notFound } from "next/navigation";
import React from "react";

import ProjectHeader from "@/components/dashboad/project/project-header";
import ProjectSidebar from "@/components/dashboad/project/project-sidebar";
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
    <div className="relative flex">
      <ProjectSidebar projectId={projectId} />
      <div className="w-full min-w-0">
        <ProjectHeader project={access.project} role={access.role} />
        <div className="h-auto text-sm">{children}</div>
      </div>
    </div>
  );
};

export default DashboardProjectsLayout;
