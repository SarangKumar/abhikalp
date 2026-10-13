import { FolderPlus } from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";

import DashboardNavbar from "@/components/dashboad/dashboard-navbar";
import ProjectCard from "@/components/dashboad/project/project-card";
import SearchProject from "@/components/dashboad/search-project";
import { DashboardShell } from "@/components/dashboad/sidebar/dashboard-shell";
import { dashboardNav } from "@/components/dashboad/sidebar/nav";
import { buttonVariants } from "@/components/ui/button";
import {
  Empty,
  EmptyActions,
  EmptyDescription,
  EmptyIcon,
  EmptyTitle,
} from "@/components/ui/empty-state";
import { siteConfig } from "@/config/site";
import { ROLE_LABEL } from "@/config/roles";
import AcceptInviteButton from "@/components/dashboad/accept-invite-button";
import { getPendingInvites } from "@/lib/invites";
import { prisma } from "@/lib/prisma";

import { requireUser } from "@/lib/session";

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
    requireUser("/dashboard", { project: true }),
  ]);

  const [memberships, invites] = await Promise.all([
    prisma.projectMember.findMany({
      where: { userId: user.id },
      include: { project: true },
    }),
    getPendingInvites(user.email),
  ]);
  const matches = (title: string) =>
    !query || title.toLowerCase().includes(query.toLowerCase());
  const filteredProjects = user.projects.filter((p) => matches(p.title));
  const sharedProjects = memberships.filter((m) => matches(m.project.title));

  return (
    <DashboardShell nav={dashboardNav}>
      <div className="min-w-0 flex-1">
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

          {invites.length > 0 && (
            <section className="mb-6 space-y-2">
              <h2 className="meta">Invitations</h2>
              <ul className="grid gap-2 lg:grid-cols-2">
                {invites.map((inv) => (
                  <li
                    key={inv.id}
                    className="bg-primary/5 border-primary/30 flex items-center justify-between gap-3 rounded-xl border p-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium">
                        {inv.project.title}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {inv.invitedBy.name} invited you as{" "}
                        {ROLE_LABEL[inv.role]}
                      </p>
                    </div>
                    <AcceptInviteButton token={inv.token} size="sm" />
                  </li>
                ))}
              </ul>
            </section>
          )}

          {sharedProjects.length > 0 && (
            <h2 className="meta mb-2">Your projects</h2>
          )}
          <ul className="mx-auto grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
            {filteredProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </ul>

          {sharedProjects.length > 0 && (
            <section className="mt-8 space-y-2">
              <h2 className="meta">Shared with you</h2>
              <ul className="mx-auto grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
                {sharedProjects.map((m) => (
                  <ProjectCard
                    key={m.id}
                    project={m.project}
                    sharedRole={m.role}
                  />
                ))}
              </ul>
            </section>
          )}

          {user.projects.length === 0 && memberships.length === 0 && (
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
      </div>
    </DashboardShell>
  );
};

export default DashboardPage;
