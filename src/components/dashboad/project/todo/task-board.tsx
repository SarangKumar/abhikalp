"use client";

import type { TaskPriority, TaskStatus } from "@prisma/client";
import {
  CalendarClock,
  Clock5,
  ListChecks,
  MessageSquare,
  MoreHorizontal,
  Plus,
  Search,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState, useTransition } from "react";

import { LabelBadge } from "@/components/dashboad/project/planning/label-badge";
import {
  MemberAvatar,
  type Member,
} from "@/components/dashboad/project/planning/member-avatar";
import { Badge } from "@/components/ui/badge";
import {
  DragDrop,
  DragDropHandle,
  DragDropItem,
  DragDropList,
  type DragDropItems,
} from "@/components/ui/drag-and-drop";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Empty,
  EmptyActions,
  EmptyDescription,
  EmptyTitle,
} from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { api } from "@/lib/fetcher";
import { notify } from "@/lib/notify";
import { isOverdue, PRIORITY_META } from "@/lib/planning";
import { cn } from "@/lib/utils";

import { TaskDetailDialog } from "./task-detail-dialog";
import {
  draftFromTask,
  draftToBody,
  emptyDraft,
  TaskFormDialog,
  type Draft,
} from "./task-form-dialog";
import type { BoardTask, MilestoneOption } from "./types";

export type { BoardTask } from "./types";

type Columns = Record<TaskStatus, string[]>;

/** Column -> task ids in board order (legacy tasks without order keep creation order). */
function toColumns(tasks: BoardTask[]): Columns {
  const cols: Columns = { PENDING: [], IN_PROGRESS: [], COMPLETED: [] };
  tasks
    .map((t, i) => ({ t, i }))
    .sort(
      (a, b) =>
        (a.t.order ?? Number.MAX_SAFE_INTEGER) -
          (b.t.order ?? Number.MAX_SAFE_INTEGER) || a.i - b.i
    )
    .forEach(({ t }) => cols[t.status].push(t.id));
  return cols;
}

const COLUMNS: { status: TaskStatus; label: string; dot: string }[] = [
  { status: "PENDING", label: "To do", dot: "bg-muted-foreground" },
  { status: "IN_PROGRESS", label: "In progress", dot: "bg-warning" },
  { status: "COMPLETED", label: "Done", dot: "bg-success" },
];
const PRIORITIES: TaskPriority[] = ["HIGH", "MEDIUM", "LOW"];
const PRIORITY_STYLE = Object.fromEntries(
  Object.entries(PRIORITY_META).map(([k, v]) => [k, v.className])
) as Record<TaskPriority, string>;

export default function TaskBoard({
  projectId,
  tasks,
  canEdit,
  canModerate,
  currentUserId,
  members,
  milestones,
}: {
  projectId: string;
  tasks: BoardTask[];
  canEdit: boolean;
  canModerate: boolean;
  currentUserId: string;
  members: Member[];
  milestones: MilestoneOption[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  const [query, setQuery] = useState("");
  const [priority, setPriority] = useState<TaskPriority | "ALL">("ALL");
  const [draft, setDraft] = useState<Draft | null>(
    canEdit && searchParams.get("new") ? emptyDraft() : null
  );
  const [saving, setSaving] = useState(false);
  const [viewing, setViewing] = useState<BoardTask | null>(null);
  // Optimistic board order (status + position), re-synced from the server.
  const [columns, setColumns] = useState<Columns>(() => toColumns(tasks));
  const [syncedTasks, setSyncedTasks] = useState(tasks);
  if (syncedTasks !== tasks) {
    setSyncedTasks(tasks);
    setColumns(toColumns(tasks));
  }

  const endpoint = `/api/v1/projects/${projectId}/tasks`;
  const refresh = () => startTransition(() => router.refresh());

  const byId = useMemo(() => new Map(tasks.map((t) => [t.id, t])), [tasks]);
  const filtering = query.trim() !== "" || priority !== "ALL";
  const matches = (t: BoardTask) =>
    (priority === "ALL" || t.priority === priority) &&
    `${t.title} ${t.description ?? ""}`
      .toLowerCase()
      .includes(query.toLowerCase());
  const canDrag = canEdit && !filtering;

  async function persist(next: Columns) {
    const previous = columns;
    setColumns(next);
    try {
      await api(endpoint, { method: "PUT", body: { columns: next } });
      refresh();
    } catch (error) {
      setColumns(previous);
      notify.error("Could not move task", (error as Error).message);
    }
  }

  function move(task: BoardTask, status: TaskStatus) {
    const next = Object.fromEntries(
      Object.entries(columns).map(([k, ids]) => [
        k,
        ids.filter((id) => id !== task.id),
      ])
    ) as Columns;
    next[status] = [...next[status], task.id];
    void persist(next);
  }

  async function remove(task: BoardTask) {
    if (!confirm(`Delete "${task.title}"?`)) return;
    try {
      await api(`${endpoint}?id=${task.id}`, { method: "DELETE" });
      notify.success("Task deleted");
      refresh();
    } catch (error) {
      notify.error("Could not delete task", (error as Error).message);
    }
  }

  async function save(d: Draft) {
    setSaving(true);
    try {
      await api(endpoint, {
        method: d.id ? "PATCH" : "POST",
        body: draftToBody(d),
      });
      notify.success(d.id ? "Task updated" : "Task created");
      setDraft(null);
      if (searchParams.get("new"))
        router.replace(`/dashboard/project/${projectId}/todo`);
      refresh();
    } catch (error) {
      notify.error("Could not save task", (error as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            aria-label="Search tasks"
            placeholder="Search tasks"
            className="pl-9"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <NativeSelect
          aria-label="Filter by priority"
          className="sm:w-40"
          value={priority}
          onChange={(e) => setPriority(e.target.value as TaskPriority | "ALL")}
        >
          <NativeSelectOption value="ALL">All priorities</NativeSelectOption>
          {PRIORITIES.map((p) => (
            <NativeSelectOption key={p} value={p}>
              {p[0] + p.slice(1).toLowerCase()}
            </NativeSelectOption>
          ))}
        </NativeSelect>
        {canEdit && (
          <Button onClick={() => setDraft(emptyDraft())}>
            <Plus className="size-4" /> New task
          </Button>
        )}
      </div>

      {filtering && canEdit && tasks.length > 0 && (
        <p className="text-muted-foreground text-xs">
          Clear the search and priority filter to drag tasks.
        </p>
      )}
      {tasks.length === 0 ? (
        <Empty className="rounded-xl border border-dashed py-16">
          <EmptyTitle>No tasks yet</EmptyTitle>
          <EmptyDescription>
            Break the project into tasks, set priorities and track progress from
            To do to Done.
          </EmptyDescription>
          {canEdit && (
            <EmptyActions>
              <Button onClick={() => setDraft(emptyDraft())}>
                Create the first task
              </Button>
            </EmptyActions>
          )}
        </Empty>
      ) : (
        <DragDrop
          id="task-board"
          items={columns}
          onReorder={(next: DragDropItems) => void persist(next as Columns)}
          disabledIds={canDrag ? [] : tasks.map((t) => t.id)}
          className="grid gap-4 lg:grid-cols-3"
        >
          {COLUMNS.map((col) => {
            const items = columns[col.status]
              .map((id) => byId.get(id))
              .filter((t): t is BoardTask => Boolean(t) && matches(t!));
            return (
              <section
                key={col.status}
                className="bg-muted/30 flex min-h-48 flex-col gap-3 rounded-xl border p-3"
              >
                <header className="flex items-center justify-between">
                  <h2 className="flex items-center gap-2 text-sm font-medium">
                    <span className={cn("size-2 rounded-full", col.dot)} />
                    {col.label}
                    <span className="text-muted-foreground text-xs">
                      {items.length}
                    </span>
                  </h2>
                  {canEdit && (
                    <Button
                      size="icon-xs"
                      variant="ghost"
                      aria-label={`Add task to ${col.label}`}
                      onClick={() => setDraft(emptyDraft(col.status))}
                    >
                      <Plus className="size-4" />
                    </Button>
                  )}
                </header>
                <DragDropList
                  id={col.status}
                  items={items.map((t) => t.id)}
                  className="min-h-24 flex-1 gap-2"
                >
                  {items.map((task) => (
                    <DragDropItem
                      key={task.id}
                      id={task.id}
                      className="bg-card hover:border-primary/40 group space-y-2 rounded-lg border p-3 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        {canDrag && (
                          <DragDropHandle
                            aria-label={`Move ${task.title}`}
                            className="-ml-1 shrink-0"
                          />
                        )}
                        <button
                          type="button"
                          className="min-w-0 flex-1 text-left text-sm font-medium hover:underline"
                          onClick={() => setViewing(task)}
                        >
                          {task.title}
                        </button>
                        {canEdit && (
                          <DropdownMenu>
                            <DropdownMenuTrigger>
                              <Button
                                size="icon-xs"
                                variant="ghost"
                                aria-label={`Actions for ${task.title}`}
                              >
                                <MoreHorizontal className="size-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="end"
                              className="min-w-40"
                            >
                              <DropdownMenuLabel>Move to</DropdownMenuLabel>
                              {COLUMNS.filter(
                                (c) => c.status !== task.status
                              ).map((c) => (
                                <DropdownMenuItem
                                  key={c.status}
                                  onClick={() => move(task, c.status)}
                                >
                                  {c.label}
                                </DropdownMenuItem>
                              ))}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => setDraft(draftFromTask(task))}
                              >
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                variant="destructive"
                                onClick={() => remove(task)}
                              >
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                      {task.description && (
                        <p className="text-muted-foreground line-clamp-2 text-xs">
                          {task.description}
                        </p>
                      )}
                      {task.labels.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {task.labels.map((l) => (
                            <LabelBadge key={l} label={l} />
                          ))}
                        </div>
                      )}
                      <div className="text-muted-foreground flex flex-wrap items-center gap-2 text-[11px]">
                        <Badge
                          variant="outline"
                          className={PRIORITY_STYLE[task.priority]}
                        >
                          {task.priority.toLowerCase()}
                        </Badge>
                        {task.estimatedTimeForCompletion ? (
                          <span className="flex items-center gap-1">
                            <Clock5 className="size-3" />{" "}
                            {task.estimatedTimeForCompletion}h
                          </span>
                        ) : null}
                        {task.checklist.length > 0 && (
                          <span className="flex items-center gap-1">
                            <ListChecks className="size-3" />
                            {task.checklist.filter((c) => c.done).length}/
                            {task.checklist.length}
                          </span>
                        )}
                        {task.commentCount > 0 && (
                          <span className="flex items-center gap-1">
                            <MessageSquare className="size-3" />
                            {task.commentCount}
                          </span>
                        )}
                        {task.dueDate && (
                          <span
                            className={cn(
                              "flex items-center gap-1",
                              isOverdue(task) && "text-destructive"
                            )}
                          >
                            <CalendarClock className="size-3" />
                            {new Date(task.dueDate).toLocaleDateString()}
                          </span>
                        )}
                        {task.assignee && (
                          <MemberAvatar
                            member={task.assignee}
                            className="ml-auto"
                          />
                        )}
                      </div>
                    </DragDropItem>
                  ))}
                </DragDropList>
              </section>
            );
          })}
        </DragDrop>
      )}

      <TaskFormDialog
        draft={draft}
        setDraft={setDraft}
        members={members}
        milestones={milestones}
        saving={saving}
        onSubmit={(d) => void save(d)}
      />
      <TaskDetailDialog
        projectId={projectId}
        task={viewing ? (byId.get(viewing.id) ?? viewing) : null}
        onClose={() => setViewing(null)}
        canEdit={canEdit}
        canModerate={canModerate}
        currentUserId={currentUserId}
        milestones={milestones}
        onChanged={refresh}
      />
    </div>
  );
}
