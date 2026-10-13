import { FolderPlus } from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";

import DashboardNavbar from "@/components/dashboad/dashboard-navbar";
import ProjectCard from "@/components/dashboad/project/project-card";
import SearchProject from "@/components/dashboad/search-project";
import DashboardSidebar from "@/components/dashboad/sidebar/dashboard-sidebar";
import { buttonVariants } from "@/components/ui/button";
import {
  Empty,
  EmptyActions,
  EmptyDescription,
  EmptyIcon,
  EmptyTitle,
} from "@/components/ui/empty-state";
import { siteConfig } from "@/config/site";

import { getUserBySession } from "../api/utils";

export const metadata: Metadata = {
  title: "All Projects | Dashboard",
  description: `Welcome to your ${siteConfig.name} dashboard. Here you can manage your projects, track your progress, and access various tools and features to enhance your productivity and collaboration.`,
};

const DashboardPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ query?: string }>;
}) => {
  const [{ query }, user] = await Promise.all([
    searchParams,
    getUserBySession({ project: true }),
  ]);
  if (!user) return null;

  const filteredProjects = user.projects.filter(
    (project) =>
      !query || project.title.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="flex">
      <DashboardSidebar />
      <main className="min-w-0 flex-1">
        <DashboardNavbar title="Projects" />
        <div className="w-full flex-1 px-4 py-4 text-sm md:px-6 md:py-6">
          <div className="flex flex-col items-start gap-4 pb-4 md:flex-row md:items-center">
            <Link
              href="/dashboard/create/project"
              className={buttonVariants({ size: "sm" })}
            >
              New Project
            </Link>
            <SearchProject placeholder="Search Projects" />
          </div>

          <ul className="mx-auto grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
            {filteredProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </ul>

          {user.projects.length === 0 && (
            <Empty className="h-[60dvh]">
              <EmptyIcon>
                <FolderPlus />
              </EmptyIcon>
              <EmptyTitle>No project found</EmptyTitle>
              <EmptyDescription>
                We couldn&apos;t find any projects associated with your account.
                <br />
                It looks like you haven&apos;t started any projects yet. Why not
                create your first project now?
              </EmptyDescription>
              <EmptyActions>
                <Link
                  className={buttonVariants({ className: "w-32" })}
                  href="/dashboard/create/project"
                >
                  Create Project
                </Link>
                <Link
                  href="/docs"
                  className={buttonVariants({
                    variant: "secondary",
                    className: "w-32",
                  })}
                >
                  Docs
                </Link>
              </EmptyActions>
            </Empty>
          )}
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
