import {
  CheckCircle2,
  Flag,
  MessageSquare,
  MoveRight,
  Pencil,
  Plus,
  Settings2,
  Trash2,
  type LucideIcon,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { MemberAvatar } from "@/components/dashboad/project/planning/member-avatar";
import { PageHeader } from "@/components/dashboad/project/planning/page-header";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyTitle,
} from "@/components/ui/empty-state";
import { getProjectAccess } from "@/lib/access";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Activity" };

const PAGE = 50;

function iconFor(action: string): LucideIcon {
  if (action.endsWith("created"))
    return action.startsWith("milestone") ? Flag : Plus;
  if (action.endsWith("deleted")) return Trash2;
  if (action.endsWith("moved")) return MoveRight;
  if (action.endsWith("completed")) return CheckCircle2;
  if (action.endsWith("commented")) return MessageSquare;
  if (action.startsWith("project")) return Settings2;
  return Pencil;
}

export default async function ActivityPage({
  params,
  searchParams,
}: {
  params: Promise<{ projectId: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const access = await getProjectAccess((await params).projectId);
  if (!access) notFound();
  const page = Math.max(1, Number((await searchParams).page) || 1);
  const items = await prisma.activityLog.findMany({
    where: { projectId: access.project.id },
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * PAGE,
    take: PAGE + 1,
    include: { actor: { select: { id: true, name: true, image: true } } },
  });
  const hasMore = items.length > PAGE;
  const groups = new Map<string, typeof items>();
  for (const a of items.slice(0, PAGE)) {
    const day = a.createdAt.toLocaleDateString("en-US", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    groups.set(day, [...(groups.get(day) ?? []), a]);
  }
  const href = (p: number) =>
    `/dashboard/project/${access.project.id}/activity?page=${p}`;

  return (
    <div className="mx-auto w-full max-w-3xl space-y-4 p-4 md:p-6">
      <PageHeader
        title="Activity"
        description="Everything that changed in this project."
      />
      {groups.size === 0 ? (
        <Empty className="rounded-xl border border-dashed py-16">
          <EmptyTitle>No activity yet</EmptyTitle>
          <EmptyDescription>
            Changes to tasks, milestones and the plan will show up here.
          </EmptyDescription>
        </Empty>
      ) : (
        [...groups].map(([day, list]) => (
          <section key={day} className="space-y-2">
            <h2 className="text-muted-foreground text-xs font-medium">{day}</h2>
            <Card className="p-0">
              <CardContent className="divide-y p-0">
                {list.map((a) => {
                  const Icon = iconFor(a.action);
                  return (
                    <div
                      key={a.id}
                      className="flex items-center gap-3 px-4 py-3 text-sm"
                    >
                      <span className="bg-muted text-muted-foreground flex size-7 shrink-0 items-center justify-center rounded-full">
                        <Icon className="size-3.5" />
                      </span>
                      <p className="min-w-0 flex-1">
                        <span className="inline-flex items-center gap-1.5 align-middle font-medium">
                          {a.actor && (
                            <MemberAvatar member={a.actor} className="size-4" />
                          )}
                          {a.actor?.name ?? "Someone"}
                        </span>{" "}
                        {a.summary}
                      </p>
                      <time
                        className="text-muted-foreground shrink-0 text-xs"
                        dateTime={a.createdAt.toISOString()}
                      >
                        {a.createdAt.toLocaleTimeString("en-US", {
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </time>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </section>
        ))
      )}
      {(page > 1 || hasMore) && (
        <div className="flex justify-between">
          {page > 1 ? (
            <Link
              className={buttonVariants({ variant: "outline", size: "sm" })}
              href={href(page - 1)}
            >
              Newer
            </Link>
          ) : (
            <span />
          )}
          {hasMore && (
            <Link
              className={buttonVariants({ variant: "outline", size: "sm" })}
              href={href(page + 1)}
            >
              Older
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
