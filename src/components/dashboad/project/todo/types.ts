import type { TaskPriority, TaskStatus } from "@prisma/client";

import type { Member } from "@/components/dashboad/project/planning/member-avatar";

export type ChecklistItem = { id: string; text: string; done: boolean };

export type BoardTask = {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  estimatedTimeForCompletion: number | null;
  dueDate: string | null;
  startDate: string | null;
  order: number | null;
  assignee: Member | null;
  milestoneId: string | null;
  labels: string[];
  checklist: ChecklistItem[];
  commentCount: number;
};

export type MilestoneOption = { id: string; title: string };
