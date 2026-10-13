import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import TaskBoard from "@/components/dashboad/project/todo/task-board";
import { siteConfig } from "@/config/site";
import { can, getProjectAccess } from "@/lib/access";
import { loadBoardTasks, loadMilestones } from "@/lib/planning-data";
import { assignableMembers } from "@/lib/project-members";

export const metadata: Metadata = {
  title: "To-Do",
  description: `Manage your tasks and to-do lists efficiently within ${siteConfig.name}.`,
};

export default async function ProjectTodoPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const access = await getProjectAccess((await params).projectId);
  if (!access) notFound();
  const projectId = access.project.id;
  const [tasks, milestones] = await Promise.all([
    loadBoardTasks(projectId),
    loadMilestones(projectId),
  ]);
  return (
    <div className="space-y-4 p-4 md:p-6">
      <div>
        <h1 className="page-title">Tasks</h1>
        <p className="text-muted-foreground text-sm">
          Plan, prioritise and track the work for {access.project.title}.
        </p>
      </div>
      <Suspense>
        <TaskBoard
          projectId={projectId}
          canEdit={can.edit(access.role)}
          canModerate={can.manageMembers(access.role)}
          currentUserId={access.user.id}
          members={assignableMembers(access)}
          milestones={milestones.map((m) => ({ id: m.id, title: m.title }))}
          tasks={tasks}
        />
      </Suspense>
    </div>
  );
}
