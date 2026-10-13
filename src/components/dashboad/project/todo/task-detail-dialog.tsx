"use client";

import { CalendarClock, Flag, Send, Trash2, UserRound } from "lucide-react";
import { useEffect, useState } from "react";

import MarkdownRender from "@/components/dashboad/project/task/markdown-render";
import { LabelBadge } from "@/components/dashboad/project/planning/label-badge";
import {
  MemberAvatar,
  type Member,
} from "@/components/dashboad/project/planning/member-avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/fetcher";
import { notify } from "@/lib/notify";
import { PRIORITY_META, STATUS_META } from "@/lib/planning";
import { cn } from "@/lib/utils";

import type { BoardTask, ChecklistItem, MilestoneOption } from "./types";

type Comment = { id: string; body: string; createdAt: string; author: Member };

const fmt = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

export function TaskDetailDialog({
  projectId,
  task,
  onClose,
  canEdit,
  canModerate,
  currentUserId,
  milestones,
  onChanged,
}: {
  projectId: string;
  task: BoardTask | null;
  onClose: () => void;
  canEdit: boolean;
  canModerate: boolean;
  currentUserId: string;
  milestones: MilestoneOption[];
  onChanged: () => void;
}) {
  const [comments, setComments] = useState<Comment[] | null>(null);
  const [body, setBody] = useState("");
  const [posting, setPosting] = useState(false);
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [shownId, setShownId] = useState<string | null>(null);
  if ((task?.id ?? null) !== shownId) {
    setShownId(task?.id ?? null);
    setChecklist(task?.checklist ?? []);
    setComments(null);
    setBody("");
  }

  const base = `/api/v1/projects/${projectId}`;
  useEffect(() => {
    if (!task) return;
    let live = true;
    api<Comment[]>(`${base}/comments?taskId=${task.id}`)
      .then((c) => live && setComments(c))
      .catch(() => live && setComments([]));
    return () => {
      live = false;
    };
  }, [base, task]);

  async function toggle(item: ChecklistItem, done: boolean) {
    if (!task) return;
    const previous = checklist;
    const next = checklist.map((c) => (c.id === item.id ? { ...c, done } : c));
    setChecklist(next);
    try {
      await api(`${base}/tasks`, {
        method: "PATCH",
        body: { id: task.id, checklist: next },
      });
      onChanged();
    } catch (error) {
      setChecklist(previous);
      notify.error("Could not update checklist", (error as Error).message);
    }
  }

  async function post(e: React.FormEvent) {
    e.preventDefault();
    if (!task || !body.trim()) return;
    setPosting(true);
    try {
      const c = await api<Comment>(`${base}/comments`, {
        method: "POST",
        body: { taskId: task.id, body },
      });
      setComments((prev) => [...(prev ?? []), c]);
      setBody("");
      onChanged();
    } catch (error) {
      notify.error("Could not post comment", (error as Error).message);
    } finally {
      setPosting(false);
    }
  }

  async function removeComment(id: string) {
    try {
      await api(`${base}/comments?id=${id}`, { method: "DELETE" });
      setComments((prev) => prev?.filter((c) => c.id !== id) ?? null);
      onChanged();
    } catch (error) {
      notify.error("Could not delete comment", (error as Error).message);
    }
  }

  const milestone = milestones.find((m) => m.id === task?.milestoneId);
  const done = checklist.filter((c) => c.done).length;

  return (
    <Dialog open={Boolean(task)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent size="lg" className="max-h-[90vh] overflow-y-auto">
        {task && (
          <div className="space-y-4">
            <DialogHeader>
              <DialogTitle>{task.title}</DialogTitle>
              <DialogDescription className="flex flex-wrap items-center gap-2">
                <span className="flex items-center gap-1.5">
                  <span
                    className={cn(
                      "size-2 rounded-full",
                      STATUS_META[task.status].dot
                    )}
                  />
                  {STATUS_META[task.status].label}
                </span>
                <Badge
                  variant="outline"
                  className={PRIORITY_META[task.priority].className}
                >
                  {PRIORITY_META[task.priority].label}
                </Badge>
              </DialogDescription>
            </DialogHeader>

            <dl className="grid gap-3 text-sm sm:grid-cols-3">
              <div className="space-y-1">
                <dt className="text-muted-foreground flex items-center gap-1.5 text-xs">
                  <UserRound className="size-3.5" /> Assignee
                </dt>
                <dd className="flex items-center gap-2">
                  {task.assignee ? (
                    <>
                      <MemberAvatar member={task.assignee} />{" "}
                      {task.assignee.name}
                    </>
                  ) : (
                    <span className="text-muted-foreground">Unassigned</span>
                  )}
                </dd>
              </div>
              <div className="space-y-1">
                <dt className="text-muted-foreground flex items-center gap-1.5 text-xs">
                  <CalendarClock className="size-3.5" /> Dates
                </dt>
                <dd>
                  {task.startDate || task.dueDate ? (
                    <>
                      {task.startDate ? fmt(task.startDate) : "—"} →{" "}
                      {task.dueDate ? fmt(task.dueDate) : "—"}
                    </>
                  ) : (
                    <span className="text-muted-foreground">Not scheduled</span>
                  )}
                </dd>
              </div>
              <div className="space-y-1">
                <dt className="text-muted-foreground flex items-center gap-1.5 text-xs">
                  <Flag className="size-3.5" /> Milestone
                </dt>
                <dd>
                  {milestone?.title ?? (
                    <span className="text-muted-foreground">None</span>
                  )}
                </dd>
              </div>
            </dl>
            {task.labels.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {task.labels.map((l) => (
                  <LabelBadge key={l} label={l} />
                ))}
              </div>
            )}

            <div className="rounded-lg border p-3">
              <MarkdownRender>
                {task.description || "_No description._"}
              </MarkdownRender>
            </div>

            {checklist.length > 0 && (
              <section className="space-y-2">
                <h3 className="text-sm font-medium">
                  Checklist{" "}
                  <span className="text-muted-foreground font-normal">
                    {done}/{checklist.length}
                  </span>
                </h3>
                <ul className="space-y-1.5">
                  {checklist.map((item) => (
                    <li key={item.id}>
                      <label className="flex items-center gap-2 text-sm">
                        <Checkbox
                          checked={item.done}
                          disabled={!canEdit}
                          onChange={(e) => void toggle(item, e.target.checked)}
                        />
                        <span
                          className={cn(
                            item.done && "text-muted-foreground line-through"
                          )}
                        >
                          {item.text}
                        </span>
                      </label>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <Separator />
            <section className="space-y-3">
              <h3 className="text-sm font-medium">
                Comments{" "}
                {comments && (
                  <span className="text-muted-foreground font-normal">
                    {comments.length}
                  </span>
                )}
              </h3>
              {comments === null ? (
                <Spinner />
              ) : comments.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  No comments yet.
                </p>
              ) : (
                <ul className="space-y-3">
                  {comments.map((c) => (
                    <li key={c.id} className="flex gap-2.5">
                      <MemberAvatar
                        member={c.author}
                        className="mt-0.5 size-6"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 text-xs">
                          <span className="font-medium">{c.author.name}</span>
                          <span className="text-muted-foreground">
                            {new Date(c.createdAt).toLocaleString(undefined, {
                              dateStyle: "medium",
                              timeStyle: "short",
                            })}
                          </span>
                          {(c.author.id === currentUserId || canModerate) && (
                            <Button
                              size="icon-xs"
                              variant="ghost"
                              className="ml-auto"
                              aria-label="Delete comment"
                              onClick={() => void removeComment(c.id)}
                            >
                              <Trash2 className="size-3.5" />
                            </Button>
                          )}
                        </div>
                        <p className="text-sm whitespace-pre-wrap">{c.body}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              {canEdit && (
                <form onSubmit={post} className="flex items-end gap-2">
                  <Textarea
                    aria-label="Write a comment"
                    placeholder="Write a comment"
                    rows={2}
                    maxLength={2000}
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                  />
                  <Button
                    type="submit"
                    size="icon"
                    aria-label="Post comment"
                    disabled={posting || !body.trim()}
                  >
                    {posting ? <Spinner /> : <Send className="size-4" />}
                  </Button>
                </form>
              )}
            </section>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
