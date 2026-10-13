import type { Task, TaskStatus } from "@prisma/client";
import {
  AlertTriangle,
  CalendarRange,
  CheckCircle2,
  Flag,
  ListTodo,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  BreakdownChart,
  BurndownChart,
  type Breakdown,
  type BurndownPoint,
} from "@/components/dashboad/project/planning/overview-charts";
import { PageHeader } from "@/components/dashboad/project/planning/page-header";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getProjectAccess } from "@/lib/access";
import {
  HEALTH_META,
  isOverdue,
  PRIORITY_META,
  progress,
  PROJECT_STATUS_LABEL,
  startOfDay,
} from "@/lib/planning";
import { loadMilestones } from "@/lib/planning-data";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Overview" };

const DAY = 86_400_000;
const fmt = (d: Date) =>
  d.toLocaleDateString("en-US", { day: "numeric", month: "short" });
const fmtLong = (d: Date | null) =>
  d
    ? d.toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "Not set";

function tally(name: string, tasks: Pick<Task, "status">[]): Breakdown {
  const c = (s: TaskStatus) => tasks.filter((t) => t.status === s).length;
  return {
    name,
    todo: c("PENDING"),
    inProgress: c("IN_PROGRESS"),
    done: c("COMPLETED"),
  };
}

/** Remaining open tasks per day, with an ideal line towards the target date. */
function burndown(
  tasks: Task[],
  start: Date,
  target: Date | null
): BurndownPoint[] {
  const today = startOfDay(new Date());
  const end = target && target > today ? startOfDay(target) : today;
  const days = Math.min(
    120,
    Math.max(7, Math.round((end.getTime() - start.getTime()) / DAY))
  );
  const first = new Date(end.getTime() - days * DAY);
  const doneAt = (t: Task) =>
    t.status === "COMPLETED" ? (t.completedAt ?? t.updatedAt) : null;
  const total = tasks.length;
  const startRemaining = tasks.filter((t) => {
    const d = doneAt(t);
    return t.createdAt <= first && !(d && d <= first);
  }).length;
  return Array.from({ length: days + 1 }, (_, i) => {
    const day = new Date(first.getTime() + i * DAY);
    const eod = new Date(day.getTime() + DAY - 1);
    const remaining =
      day > today
        ? null
        : tasks.filter((t) => {
            const d = doneAt(t);
            return t.createdAt <= eod && !(d && d <= eod);
          }).length;
    const ideal = target
      ? Math.max(
          0,
          Math.round((((startRemaining || total) * (days - i)) / days) * 10) /
            10
        )
      : null;
    return { day: fmt(day), remaining: remaining as number, ideal };
  });
}

export default async function OverviewPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const access = await getProjectAccess((await params).projectId);
  if (!access) notFound();
  const { project } = access;
  const [tasks, milestones, activity] = await Promise.all([
    prisma.task.findMany({
      where: { projectId: project.id },
      include: { assignee: { select: { name: true } } },
    }),
    loadMilestones(project.id),
    prisma.activityLog.findMany({
      where: { projectId: project.id },
      orderBy: { createdAt: "desc" },
      take: 6,
      include: { actor: { select: { name: true } } },
    }),
  ]);

  const now = new Date();
  const { total, done, percent } = progress(tasks);
  const overdue = tasks.filter((t) => isOverdue(t, now));
  const inProgress = tasks.filter((t) => t.status === "IN_PROGRESS").length;
  const weekEnd = new Date(startOfDay(now).getTime() + 7 * DAY);
  const dueSoon = tasks.filter(
    (t) =>
      t.dueDate &&
      t.status !== "COMPLETED" &&
      t.dueDate >= startOfDay(now) &&
      t.dueDate < weekEnd
  ).length;

  const byPriority = (["HIGH", "MEDIUM", "LOW"] as const).map((p) =>
    tally(
      PRIORITY_META[p].label,
      tasks.filter((t) => t.priority === p)
    )
  );
  const assignees = new Map<string, typeof tasks>();
  for (const t of tasks) {
    const key = t.assignee?.name ?? "Unassigned";
    assignees.set(key, [...(assignees.get(key) ?? []), t]);
  }
  const byAssignee = [...assignees].map(([name, list]) => tally(name, list));
  const firstTask = tasks.reduce<Date | null>(
    (m, t) => (!m || t.createdAt < m ? t.createdAt : m),
    null
  );
  const chart = burndown(
    tasks,
    startOfDay(project.startDate ?? firstTask ?? project.createdAt),
    project.targetDate
  );
  const health = HEALTH_META[project.health ?? "ON_TRACK"];
  const href = (p: string) => `/dashboard/project/${project.id}${p}`;

  const stats = [
    {
      label: "Completion",
      value: `${percent}%`,
      hint: `${done} of ${total} tasks done`,
      icon: CheckCircle2,
    },
    {
      label: "In progress",
      value: inProgress,
      hint: `${dueSoon} due in the next 7 days`,
      icon: ListTodo,
    },
    {
      label: "Overdue",
      value: overdue.length,
      hint: "open tasks past their due date",
      icon: AlertTriangle,
      danger: overdue.length > 0,
    },
    {
      label: "Milestones",
      value: milestones.length,
      hint: `${milestones.filter((m) => m.total && m.done === m.total).length} complete`,
      icon: Flag,
    },
  ];

  return (
    <div className="space-y-4 p-4 md:p-6">
      <PageHeader
        title="Overview"
        description={`Progress and health of ${project.title}.`}
      >
        <Badge variant="outline">
          {PROJECT_STATUS_LABEL[project.status ?? "ACTIVE"]}
        </Badge>
        <Badge variant="outline" className={health.className}>
          {health.label}
        </Badge>
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label} size="sm">
            <CardHeader>
              <CardDescription className="flex items-center justify-between">
                {s.label}
                <s.icon
                  className={
                    s.danger
                      ? "text-destructive size-4"
                      : "text-muted-foreground size-4"
                  }
                />
              </CardDescription>
              <CardTitle
                className={s.danger ? "text-destructive text-2xl" : "text-2xl"}
              >
                {s.value}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground text-xs">
              {s.hint}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Burndown</CardTitle>
            <CardDescription>
              Open tasks per day
              {project.targetDate
                ? " against an ideal line to the target date"
                : ""}
              .
            </CardDescription>
          </CardHeader>
          <CardContent>
            {total ? (
              <BurndownChart data={chart} />
            ) : (
              <p className="text-muted-foreground py-16 text-center text-sm">
                Add tasks to see the burndown.
              </p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarRange className="size-4" /> Schedule
            </CardTitle>
            <CardDescription>Project dates and completion.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <dl className="grid grid-cols-2 gap-3">
              <div>
                <dt className="text-muted-foreground text-xs">Start</dt>
                <dd>{fmtLong(project.startDate)}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground text-xs">Target</dt>
                <dd>{fmtLong(project.targetDate)}</dd>
              </div>
            </dl>
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Tasks complete</span>
                <span>{percent}%</span>
              </div>
              <Progress value={percent} aria-label="Project completion" />
            </div>
            {project.targetDate && (
              <p className="text-muted-foreground text-xs">
                {project.targetDate < now
                  ? "Target date has passed."
                  : `${Math.ceil((project.targetDate.getTime() - now.getTime()) / DAY)} days to target.`}
              </p>
            )}
            <Link
              href={href("/settings")}
              className="text-primary text-xs hover:underline"
            >
              Edit plan in settings
            </Link>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>By status</CardTitle>
            <CardDescription>Where work sits on the board.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {(
              [
                ["To do", "PENDING", "bg-chart-2"],
                ["In progress", "IN_PROGRESS", "bg-chart-4"],
                ["Done", "COMPLETED", "bg-chart-3"],
              ] as const
            ).map(([label, status, color]) => {
              const n = tasks.filter((t) => t.status === status).length;
              return (
                <div key={status} className="space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span>{label}</span>
                    <span className="text-muted-foreground">{n}</span>
                  </div>
                  <div className="bg-muted h-2 overflow-hidden rounded-full">
                    <div
                      className={`${color} h-full rounded-full`}
                      style={{ width: `${total ? (n / total) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>By priority</CardTitle>
            <CardDescription>Status split per priority.</CardDescription>
          </CardHeader>
          <CardContent>
            <BreakdownChart data={byPriority} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>By assignee</CardTitle>
            <CardDescription>Workload per person.</CardDescription>
          </CardHeader>
          <CardContent>
            {total ? (
              <BreakdownChart
                data={byAssignee}
                height={Math.max(220, byAssignee.length * 40 + 60)}
              />
            ) : (
              <p className="text-muted-foreground py-16 text-center text-sm">
                No tasks yet.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Milestones</CardTitle>
            <CardDescription>
              <Link href={href("/milestones")} className="hover:underline">
                View all milestones
              </Link>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {milestones.length === 0 && (
              <p className="text-muted-foreground text-sm">
                No milestones yet.
              </p>
            )}
            {milestones.slice(0, 5).map((m) => {
              const pct = m.total ? Math.round((m.done / m.total) * 100) : 0;
              return (
                <div key={m.id} className="space-y-1.5">
                  <div className="flex justify-between gap-2 text-sm">
                    <span className="truncate font-medium">{m.title}</span>
                    <span className="text-muted-foreground shrink-0 text-xs">
                      {m.dueDate ? fmt(new Date(m.dueDate)) : "No due date"} ·{" "}
                      {pct}%
                    </span>
                  </div>
                  <Progress value={pct} aria-label={`${m.title} progress`} />
                </div>
              );
            })}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Recent activity</CardTitle>
            <CardDescription>
              <Link href={href("/activity")} className="hover:underline">
                View the full log
              </Link>
            </CardDescription>
          </CardHeader>
          <CardContent>
            {activity.length === 0 ? (
              <p className="text-muted-foreground text-sm">Nothing yet.</p>
            ) : (
              <ul className="space-y-2.5 text-sm">
                {activity.map((a) => (
                  <li key={a.id} className="flex justify-between gap-3">
                    <span className="min-w-0 truncate">
                      <span className="font-medium">
                        {a.actor?.name ?? "Someone"}
                      </span>{" "}
                      {a.summary}
                    </span>
                    <span className="text-muted-foreground shrink-0 text-xs">
                      {fmt(a.createdAt)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
