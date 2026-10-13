import { Metadata } from "next";
import { notFound } from "next/navigation";
import React from "react";

import { getUserBySession } from "@/app/api/utils";
import ProjectHeader from "@/components/dashboad/project/project-header";
import ProjectSidebar from "@/components/dashboad/project/project-sidebar";
import { siteConfig } from "@/config/site";

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
  const user = await getUserBySession({ project: true });
  if (!user) return null;

  const currentProject = user.projects.find(
    (project) => project.id === projectId
  );
  if (!currentProject) notFound();

  return (
    <div className="relative flex">
      <ProjectSidebar projectId={projectId} />
      <div className="w-full min-w-0">
        <ProjectHeader project={currentProject} />
        <div className="h-auto text-sm">{children}</div>
      </div>
    </div>
  );
};

export default DashboardProjectsLayout;
