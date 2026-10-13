import type { CSSProperties } from "react";
import type { TaskPriority, TaskStatus } from "@prisma/client";

export const STATUS_META: Record<
  TaskStatus,
  { label: string; dot: string; color: string }
> = {
  PENDING: {
    label: "To do",
    dot: "bg-muted-foreground",
    color: "var(--muted-foreground)",
  },
  IN_PROGRESS: {
    label: "In progress",
    dot: "bg-warning",
    color: "var(--warning)",
  },
  COMPLETED: { label: "Done", dot: "bg-success", color: "var(--success)" },
};

export const PRIORITY_META: Record<
  TaskPriority,
  { label: string; className: string }
> = {
  HIGH: {
    label: "High",
    className: "border-destructive/30 bg-destructive/10 text-destructive",
  },
  MEDIUM: {
    label: "Medium",
    className: "border-primary/30 bg-primary/10 text-primary",
  },
  LOW: { label: "Low", className: "border-border text-muted-foreground" },
};

export const PROJECT_STATUS_LABEL = {
  PLANNING: "Planning",
  ACTIVE: "Active",
  ON_HOLD: "On hold",
  COMPLETED: "Completed",
  ARCHIVED: "Archived",
} as const;

export const HEALTH_META = {
  ON_TRACK: {
    label: "On track",
    className: "border-success/30 bg-success/10 text-success",
  },
  AT_RISK: {
    label: "At risk",
    className: "border-warning/30 bg-warning/10 text-warning",
  },
  OFF_TRACK: {
    label: "Off track",
    className: "border-destructive/30 bg-destructive/10 text-destructive",
  },
} as const;

export const startOfDay = (d: Date) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate());

export function isOverdue(
  t: { status: TaskStatus; dueDate: Date | string | null },
  now = new Date()
) {
  return (
    !!t.dueDate &&
    t.status !== "COMPLETED" &&
    new Date(t.dueDate) < startOfDay(now)
  );
}

export function progress(tasks: { status: TaskStatus }[]) {
  const total = tasks.length;
  const done = tasks.filter((t) => t.status === "COMPLETED").length;
  return { total, done, percent: total ? Math.round((done / total) * 100) : 0 };
}

export function initials(name: string | null | undefined) {
  return (name || "?")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join("");
}

/** Stable, readable label colours derived from the label text. */
const LABEL_HUES = [295, 250, 200, 160, 120, 60, 25, 340];
export function labelStyle(label: string): CSSProperties {
  let h = 0;
  for (const c of label) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  const hue = LABEL_HUES[h % LABEL_HUES.length];
  return {
    color: `oklch(0.55 0.15 ${hue})`,
    backgroundColor: `oklch(0.6 0.15 ${hue} / 12%)`,
    borderColor: `oklch(0.6 0.15 ${hue} / 30%)`,
  };
}
