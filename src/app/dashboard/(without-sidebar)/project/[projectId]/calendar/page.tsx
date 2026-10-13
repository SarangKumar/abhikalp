import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/dashboad/project/planning/page-header";
import {
  ProjectCalendar,
  type CalendarEntry,
} from "@/components/dashboad/project/planning/project-calendar";
import { getProjectAccess } from "@/lib/access";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Calendar" };

export default async function CalendarPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const access = await getProjectAccess((await params).projectId);
  if (!access) notFound();
  const projectId = access.project.id;
  const [tasks, milestones] = await Promise.all([
    prisma.task.findMany({
      where: { projectId },
      select: { id: true, title: true, dueDate: true, status: true },
    }),
    prisma.milestone.findMany({
      where: { projectId },
      select: {
        id: true,
        title: true,
        dueDate: true,
        tasks: { select: { status: true } },
      },
    }),
  ]);
  const entries: CalendarEntry[] = [
    ...milestones
      .filter((m) => m.dueDate)
      .map((m) => ({
        kind: "milestone" as const,
        id: m.id,
        title: m.title,
        date: m.dueDate!.toISOString(),
        done:
          m.tasks.length > 0 && m.tasks.every((t) => t.status === "COMPLETED"),
      })),
    ...tasks
      .filter((t) => t.dueDate)
      .map((t) => ({
        kind: "task" as const,
        id: t.id,
        title: t.title,
        date: t.dueDate!.toISOString(),
        status: t.status,
      })),
  ];
  const unscheduled = tasks.filter(
    (t) => !t.dueDate && t.status !== "COMPLETED"
  ).length;
  return (
    <div className="space-y-4 p-4 md:p-6">
      <PageHeader
        title="Calendar"
        description="Task due dates and milestones by month."
      />
      <ProjectCalendar
        projectId={projectId}
        entries={entries}
        unscheduled={unscheduled}
      />
    </div>
  );
}
