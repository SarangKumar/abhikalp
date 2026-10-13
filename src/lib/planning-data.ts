import "server-only";

import type { BoardTask } from "@/components/dashboad/project/todo/types";
import { prisma } from "@/lib/prisma";

const memberSelect = { id: true, name: true, image: true } as const;

/** All tasks of a project, shaped for client components. */
export async function loadBoardTasks(projectId: string): Promise<BoardTask[]> {
  const tasks = await prisma.task.findMany({
    where: { projectId },
    orderBy: { createdAt: "asc" },
    include: {
      assignee: { select: memberSelect },
      _count: { select: { comments: true } },
    },
  });
  return tasks.map((t) => ({
    id: t.id,
    title: t.title,
    description: t.description,
    status: t.status,
    priority: t.priority,
    estimatedTimeForCompletion: t.estimatedTimeForCompletion,
    dueDate: t.dueDate?.toISOString() ?? null,
    startDate: t.startDate?.toISOString() ?? null,
    order: t.order,
    assignee: t.assignee,
    milestoneId: t.milestoneId,
    labels: t.labels ?? [],
    checklist: t.checklist ?? [],
    commentCount: t._count.comments,
  }));
}

export async function loadMilestones(projectId: string) {
  const milestones = await prisma.milestone.findMany({
    where: { projectId },
    orderBy: [{ dueDate: "asc" }, { createdAt: "asc" }],
    include: { tasks: { select: { status: true } } },
  });
  return milestones.map((m) => ({
    id: m.id,
    title: m.title,
    description: m.description,
    startDate: m.startDate?.toISOString() ?? null,
    dueDate: m.dueDate?.toISOString() ?? null,
    total: m.tasks.length,
    done: m.tasks.filter((t) => t.status === "COMPLETED").length,
  }));
}
export type MilestoneRow = Awaited<ReturnType<typeof loadMilestones>>[number];
