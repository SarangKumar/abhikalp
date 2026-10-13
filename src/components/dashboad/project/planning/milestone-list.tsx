"use client";

import { CalendarRange, Flag, MoreHorizontal, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { DateField } from "@/components/date-field";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Progress } from "@/components/ui/progress";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/fetcher";
import { notify } from "@/lib/notify";
import { startOfDay } from "@/lib/planning";

export type MilestoneItem = {
  id: string;
  title: string;
  description: string | null;
  startDate: string | null;
  dueDate: string | null;
  total: number;
  done: number;
};

type Draft = {
  id?: string;
  title: string;
  description: string;
  startDate: Date | null;
  dueDate: Date | null;
};
const empty: Draft = {
  title: "",
  description: "",
  startDate: null,
  dueDate: null,
};
const fmt = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

export function MilestoneList({
  projectId,
  milestones,
  canEdit,
}: {
  projectId: string;
  milestones: MilestoneItem[];
  canEdit: boolean;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [draft, setDraft] = useState<Draft | null>(null);
  const [saving, setSaving] = useState(false);
  const endpoint = `/api/v1/projects/${projectId}/milestones`;
  const refresh = () => startTransition(() => router.refresh());
  const invalid =
    !!draft?.startDate && !!draft.dueDate && draft.startDate > draft.dueDate;

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!draft || invalid) return;
    setSaving(true);
    try {
      await api(endpoint, {
        method: draft.id ? "PATCH" : "POST",
        body: {
          ...draft,
          description: draft.description || null,
          startDate: draft.startDate?.toISOString() ?? null,
          dueDate: draft.dueDate?.toISOString() ?? null,
        },
      });
      notify.success(draft.id ? "Milestone updated" : "Milestone created");
      setDraft(null);
      refresh();
    } catch (error) {
      notify.error("Could not save milestone", (error as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function remove(m: MilestoneItem) {
    if (!confirm(`Delete milestone "${m.title}"? Its tasks are kept.`)) return;
    try {
      await api(`${endpoint}?id=${m.id}`, { method: "DELETE" });
      notify.success("Milestone deleted");
      refresh();
    } catch (error) {
      notify.error("Could not delete milestone", (error as Error).message);
    }
  }

  const today = startOfDay(new Date());

  return (
    <div className="space-y-4">
      {canEdit && milestones.length > 0 && (
        <div className="flex justify-end">
          <Button onClick={() => setDraft(empty)}>
            <Plus className="size-4" /> New milestone
          </Button>
        </div>
      )}
      {milestones.length === 0 ? (
        <Empty className="rounded-xl border border-dashed py-16">
          <EmptyTitle>No milestones yet</EmptyTitle>
          <EmptyDescription>
            Group tasks into milestones with due dates to track progress towards
            releases.
          </EmptyDescription>
          {canEdit && (
            <EmptyActions>
              <Button onClick={() => setDraft(empty)}>
                Create the first milestone
              </Button>
            </EmptyActions>
          )}
        </Empty>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {milestones.map((m) => {
            const pct = m.total ? Math.round((m.done / m.total) * 100) : 0;
            const complete = m.total > 0 && m.done === m.total;
            const late = !complete && m.dueDate && new Date(m.dueDate) < today;
            return (
              <Card key={m.id}>
                <CardHeader>
                  <CardTitle className="flex items-start justify-between gap-2">
                    <span className="flex min-w-0 items-center gap-2">
                      <Flag className="text-primary size-4 shrink-0" />
                      <span className="truncate">{m.title}</span>
                    </span>
                    {canEdit && (
                      <DropdownMenu>
                        <DropdownMenuTrigger>
                          <Button
                            size="icon-xs"
                            variant="ghost"
                            aria-label={`Actions for ${m.title}`}
                          >
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() =>
                              setDraft({
                                id: m.id,
                                title: m.title,
                                description: m.description ?? "",
                                startDate: m.startDate
                                  ? new Date(m.startDate)
                                  : null,
                                dueDate: m.dueDate ? new Date(m.dueDate) : null,
                              })
                            }
                          >
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => remove(m)}
                          >
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-1.5">
                    <CalendarRange className="size-3.5" />
                    {m.startDate ? fmt(m.startDate) : "—"} →{" "}
                    {m.dueDate ? fmt(m.dueDate) : "No due date"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {m.description && (
                    <p className="text-muted-foreground line-clamp-2 text-sm">
                      {m.description}
                    </p>
                  )}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">
                        {m.done}/{m.total} tasks
                      </span>
                      {complete ? (
                        <Badge
                          variant="outline"
                          className="border-success/30 bg-success/10 text-success"
                        >
                          Complete
                        </Badge>
                      ) : late ? (
                        <Badge
                          variant="outline"
                          className="border-destructive/30 bg-destructive/10 text-destructive"
                        >
                          Overdue
                        </Badge>
                      ) : (
                        <span>{pct}%</span>
                      )}
                    </div>
                    <Progress value={pct} aria-label={`${m.title} progress`} />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={Boolean(draft)} onOpenChange={(o) => !o && setDraft(null)}>
        <DialogContent>
          {draft && (
            <form onSubmit={save} className="space-y-4">
              <DialogHeader>
                <DialogTitle>
                  {draft.id ? "Edit milestone" : "New milestone"}
                </DialogTitle>
                <DialogDescription>
                  Link tasks to it from the task dialog.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-1.5">
                <Label htmlFor="ms-title">Title</Label>
                <Input
                  id="ms-title"
                  required
                  autoFocus
                  maxLength={120}
                  value={draft.title}
                  onChange={(e) =>
                    setDraft({ ...draft, title: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ms-desc">Description</Label>
                <Textarea
                  id="ms-desc"
                  rows={3}
                  maxLength={2000}
                  value={draft.description}
                  onChange={(e) =>
                    setDraft({ ...draft, description: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="ms-start">Start date</Label>
                  <DateField
                    id="ms-start"
                    placeholder="No start date"
                    value={draft.startDate}
                    onChange={(d) => setDraft({ ...draft, startDate: d })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="ms-due">Due date</Label>
                  <DateField
                    id="ms-due"
                    placeholder="No due date"
                    value={draft.dueDate}
                    disabledDates={
                      draft.startDate ? { before: draft.startDate } : undefined
                    }
                    onChange={(d) => setDraft({ ...draft, dueDate: d })}
                  />
                </div>
              </div>
              {invalid && (
                <p className="text-destructive text-xs">
                  The due date must be on or after the start date.
                </p>
              )}
              <DialogFooter>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setDraft(null)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={saving || invalid}>
                  {saving && <Spinner />}
                  {draft.id ? "Save changes" : "Create milestone"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
