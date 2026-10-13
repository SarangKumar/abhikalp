import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import TaskBoard from "@/components/dashboad/project/todo/task-board";
import { siteConfig } from "@/config/site";
import { can, getProjectAccess } from "@/lib/access";
import { prisma } from "@/lib/prisma";

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
  const tasks = await prisma.task.findMany({
    where: { projectId: access.project.id },
    orderBy: { createdAt: "asc" },
  });

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
          projectId={access.project.id}
          canEdit={can.edit(access.role)}
          tasks={tasks.map((t) => ({
            id: t.id,
            title: t.title,
            description: t.description,
            status: t.status,
            priority: t.priority,
            estimatedTimeForCompletion: t.estimatedTimeForCompletion,
            dueDate: t.dueDate?.toISOString() ?? null,
            order: t.order,
          }))}
        />
      </Suspense>
    </div>
  );
}
