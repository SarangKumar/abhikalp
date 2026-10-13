import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/dashboad/project/planning/page-header";
import { ProjectTimeline } from "@/components/dashboad/project/planning/project-timeline";
import { getProjectAccess } from "@/lib/access";
import { loadBoardTasks, loadMilestones } from "@/lib/planning-data";

export const metadata: Metadata = { title: "Timeline" };

export default async function TimelinePage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const access = await getProjectAccess((await params).projectId);
  if (!access) notFound();
  const [tasks, milestones] = await Promise.all([
    loadBoardTasks(access.project.id),
    loadMilestones(access.project.id),
  ]);
  return (
    <div className="space-y-4 p-4 md:p-6">
      <PageHeader
        title="Timeline"
        description="Roadmap of milestones and scheduled tasks."
      />
      <ProjectTimeline
        tasks={tasks.map((t) => ({
          id: t.id,
          title: t.title,
          status: t.status,
          startDate: t.startDate,
          dueDate: t.dueDate,
          milestoneId: t.milestoneId,
        }))}
        milestones={milestones.map((m) => ({
          id: m.id,
          title: m.title,
          startDate: m.startDate,
          dueDate: m.dueDate,
          percent: m.total ? Math.round((m.done / m.total) * 100) : 0,
        }))}
      />
    </div>
  );
}
