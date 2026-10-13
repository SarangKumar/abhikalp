"use client";

import type { TaskPriority, TaskStatus } from "@prisma/client";
import {
  CalendarClock,
  Clock5,
  MoreHorizontal,
  Plus,
  Search,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState, useTransition } from "react";

import MarkdownRender from "@/components/dashboad/project/task/markdown-render";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Label } from "@/components/ui/label";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/fetcher";
import { notify } from "@/lib/notify";
import { cn } from "@/lib/utils";

export type BoardTask = {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  estimatedTimeForCompletion: number | null;
  dueDate: string | null;
  order: number | null;
};

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
const PRIORITY_STYLE: Record<TaskPriority, string> = {
  HIGH: "border-destructive/30 bg-destructive/10 text-destructive",
  MEDIUM: "border-primary/30 bg-primary/10 text-primary",
  LOW: "border-border text-muted-foreground",
};

type Draft = Omit<BoardTask, "id" | "estimatedTimeForCompletion" | "order"> & {
  id?: string;
  estimatedTimeForCompletion: string;
};
const emptyDraft = (status: TaskStatus = "PENDING"): Draft => ({
  title: "",
  description: "",
  status,
  priority: "MEDIUM",
  estimatedTimeForCompletion: "",
  dueDate: null,
});

export default function TaskBoard({
  projectId,
  tasks,
  canEdit,
}: {
  projectId: string;
  tasks: BoardTask[];
  canEdit: boolean;
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

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!draft) return;
    setSaving(true);
    const body = {
      ...draft,
      estimatedTimeForCompletion: draft.estimatedTimeForCompletion
        ? Number(draft.estimatedTimeForCompletion)
        : null,
      dueDate: draft.dueDate || null,
    };
    try {
      await api(endpoint, { method: draft.id ? "PATCH" : "POST", body });
      notify.success(draft.id ? "Task updated" : "Task created");
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
                                onClick={() =>
                                  setDraft({
                                    ...task,
                                    description: task.description ?? "",
                                    estimatedTimeForCompletion:
                                      task.estimatedTimeForCompletion?.toString() ??
                                      "",
                                    dueDate: task.dueDate?.slice(0, 10) ?? null,
                                  })
                                }
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
                        {task.dueDate && (
                          <span
                            className={cn(
                              "flex items-center gap-1",
                              task.status !== "COMPLETED" &&
                                new Date(task.dueDate) < new Date() &&
                                "text-destructive"
                            )}
                          >
                            <CalendarClock className="size-3" />
                            {new Date(task.dueDate).toLocaleDateString()}
                          </span>
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

      <Dialog
        open={Boolean(draft)}
        onOpenChange={(open) => !open && setDraft(null)}
      >
        <DialogContent size="lg">
          {draft && (
            <form onSubmit={save} className="space-y-4">
              <DialogHeader>
                <DialogTitle>{draft.id ? "Edit task" : "New task"}</DialogTitle>
                <DialogDescription>
                  Descriptions support markdown.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-1.5">
                <Label htmlFor="task-title">Title</Label>
                <Input
                  id="task-title"
                  required
                  autoFocus
                  maxLength={140}
                  value={draft.title}
                  onChange={(e) =>
                    setDraft({ ...draft, title: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="task-desc">Description</Label>
                <Textarea
                  id="task-desc"
                  rows={5}
                  value={draft.description ?? ""}
                  onChange={(e) =>
                    setDraft({ ...draft, description: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-4">
                <div className="space-y-1.5">
                  <Label htmlFor="task-status">Status</Label>
                  <NativeSelect
                    id="task-status"
                    value={draft.status}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        status: e.target.value as TaskStatus,
                      })
                    }
                  >
                    {COLUMNS.map((c) => (
                      <NativeSelectOption key={c.status} value={c.status}>
                        {c.label}
                      </NativeSelectOption>
                    ))}
                  </NativeSelect>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="task-priority">Priority</Label>
                  <NativeSelect
                    id="task-priority"
                    value={draft.priority}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        priority: e.target.value as TaskPriority,
                      })
                    }
                  >
                    {PRIORITIES.map((p) => (
                      <NativeSelectOption key={p} value={p}>
                        {p[0] + p.slice(1).toLowerCase()}
                      </NativeSelectOption>
                    ))}
                  </NativeSelect>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="task-est">Estimate (h)</Label>
                  <Input
                    id="task-est"
                    type="number"
                    min={0}
                    max={1000}
                    value={draft.estimatedTimeForCompletion}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        estimatedTimeForCompletion: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="task-due">Due date</Label>
                  <Input
                    id="task-due"
                    type="date"
                    value={draft.dueDate ?? ""}
                    onChange={(e) =>
                      setDraft({ ...draft, dueDate: e.target.value || null })
                    }
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setDraft(null)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving && <Spinner />}
                  {draft.id ? "Save changes" : "Create task"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(viewing)}
        onOpenChange={(open) => !open && setViewing(null)}
      >
        <DialogContent size="lg">
          {viewing && (
            <>
              <DialogHeader>
                <DialogTitle>{viewing.title}</DialogTitle>
                <DialogDescription>
                  {COLUMNS.find((c) => c.status === viewing.status)?.label} ·{" "}
                  {viewing.priority.toLowerCase()} priority
                </DialogDescription>
              </DialogHeader>
              <div className="overflow-y-auto">
                <MarkdownRender>
                  {viewing.description || "_No description._"}
                </MarkdownRender>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
