"use client";

import type { TaskPriority, TaskStatus } from "@prisma/client";
import { Plus, X } from "lucide-react";
import { useState } from "react";

import { DateField } from "@/components/date-field";
import { LabelBadge } from "@/components/dashboad/project/planning/label-badge";
import type { Member } from "@/components/dashboad/project/planning/member-avatar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { PRIORITY_META, STATUS_META } from "@/lib/planning";

import type { BoardTask, ChecklistItem, MilestoneOption } from "./types";

export type Draft = {
  id?: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  estimatedTimeForCompletion: string;
  startDate: Date | null;
  dueDate: Date | null;
  assigneeId: string | null;
  milestoneId: string | null;
  labels: string[];
  checklist: ChecklistItem[];
};

export const emptyDraft = (status: TaskStatus = "PENDING"): Draft => ({
  title: "",
  description: "",
  status,
  priority: "MEDIUM",
  estimatedTimeForCompletion: "",
  startDate: null,
  dueDate: null,
  assigneeId: null,
  milestoneId: null,
  labels: [],
  checklist: [],
});

export const draftFromTask = (t: BoardTask): Draft => ({
  id: t.id,
  title: t.title,
  description: t.description ?? "",
  status: t.status,
  priority: t.priority,
  estimatedTimeForCompletion: t.estimatedTimeForCompletion?.toString() ?? "",
  startDate: t.startDate ? new Date(t.startDate) : null,
  dueDate: t.dueDate ? new Date(t.dueDate) : null,
  assigneeId: t.assignee?.id ?? null,
  milestoneId: t.milestoneId,
  labels: t.labels,
  checklist: t.checklist,
});

export const draftToBody = (d: Draft) => ({
  ...d,
  estimatedTimeForCompletion: d.estimatedTimeForCompletion
    ? Number(d.estimatedTimeForCompletion)
    : null,
  startDate: d.startDate?.toISOString() ?? null,
  dueDate: d.dueDate?.toISOString() ?? null,
  checklist: d.checklist.filter((c) => c.text.trim()),
});

const NONE = "__none";
const newId = () => Math.random().toString(36).slice(2, 10);

export function TaskFormDialog({
  draft,
  setDraft,
  members,
  milestones,
  saving,
  onSubmit,
}: {
  draft: Draft | null;
  setDraft: (d: Draft | null) => void;
  members: Member[];
  milestones: MilestoneOption[];
  saving: boolean;
  onSubmit: (d: Draft) => void;
}) {
  const [labelInput, setLabelInput] = useState("");
  const [itemInput, setItemInput] = useState("");

  function addLabel() {
    const l = labelInput.trim().toLowerCase().slice(0, 24);
    if (draft && l && !draft.labels.includes(l) && draft.labels.length < 8)
      setDraft({ ...draft, labels: [...draft.labels, l] });
    setLabelInput("");
  }
  function addItem() {
    const text = itemInput.trim().slice(0, 200);
    if (draft && text && draft.checklist.length < 50)
      setDraft({
        ...draft,
        checklist: [...draft.checklist, { id: newId(), text, done: false }],
      });
    setItemInput("");
  }
  const invalidRange =
    !!draft?.startDate && !!draft.dueDate && draft.startDate > draft.dueDate;

  return (
    <Dialog
      open={Boolean(draft)}
      onOpenChange={(open) => !open && setDraft(null)}
    >
      <DialogContent size="lg" className="max-h-[90vh] overflow-y-auto">
        {draft && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!invalidRange) onSubmit(draft);
            }}
            className="space-y-4"
          >
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
                onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="task-desc">Description</Label>
              <Textarea
                id="task-desc"
                rows={4}
                value={draft.description}
                onChange={(e) =>
                  setDraft({ ...draft, description: e.target.value })
                }
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select
                  value={draft.status}
                  onValueChange={(v) =>
                    setDraft({ ...draft, status: v as TaskStatus })
                  }
                >
                  <SelectTrigger aria-label="Status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(STATUS_META) as TaskStatus[]).map((s) => (
                      <SelectItem key={s} value={s}>
                        {STATUS_META[s].label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Priority</Label>
                <Select
                  value={draft.priority}
                  onValueChange={(v) =>
                    setDraft({ ...draft, priority: v as TaskPriority })
                  }
                >
                  <SelectTrigger aria-label="Priority">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(["HIGH", "MEDIUM", "LOW"] as TaskPriority[]).map((p) => (
                      <SelectItem key={p} value={p}>
                        {PRIORITY_META[p].label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                <Label>Assignee</Label>
                <Select
                  value={draft.assigneeId ?? NONE}
                  onValueChange={(v) =>
                    setDraft({ ...draft, assigneeId: v === NONE ? null : v })
                  }
                >
                  <SelectTrigger aria-label="Assignee">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NONE}>Unassigned</SelectItem>
                    {members.map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.name ?? "Unnamed member"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="task-start">Start date</Label>
                <DateField
                  id="task-start"
                  placeholder="No start date"
                  value={draft.startDate}
                  onChange={(d) => setDraft({ ...draft, startDate: d })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="task-due">Due date</Label>
                <DateField
                  id="task-due"
                  placeholder="No due date"
                  value={draft.dueDate}
                  aria-invalid={invalidRange || undefined}
                  disabledDates={
                    draft.startDate ? { before: draft.startDate } : undefined
                  }
                  onChange={(d) => setDraft({ ...draft, dueDate: d })}
                />
              </div>
            </div>
            {invalidRange && (
              <p className="text-destructive text-xs">
                The due date must be on or after the start date.
              </p>
            )}
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Milestone</Label>
                <Select
                  value={draft.milestoneId ?? NONE}
                  onValueChange={(v) =>
                    setDraft({ ...draft, milestoneId: v === NONE ? null : v })
                  }
                >
                  <SelectTrigger aria-label="Milestone">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NONE}>No milestone</SelectItem>
                    {milestones.map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="task-label">Labels</Label>
                <div className="flex gap-2">
                  <Input
                    id="task-label"
                    placeholder="e.g. frontend"
                    maxLength={24}
                    value={labelInput}
                    onChange={(e) => setLabelInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === ",") {
                        e.preventDefault();
                        addLabel();
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    aria-label="Add label"
                    onClick={addLabel}
                  >
                    <Plus className="size-4" />
                  </Button>
                </div>
              </div>
            </div>
            {draft.labels.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {draft.labels.map((l) => (
                  <button
                    key={l}
                    type="button"
                    aria-label={`Remove label ${l}`}
                    onClick={() =>
                      setDraft({
                        ...draft,
                        labels: draft.labels.filter((x) => x !== l),
                      })
                    }
                  >
                    <LabelBadge label={l}>
                      {l} <X className="size-3" />
                    </LabelBadge>
                  </button>
                ))}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="task-item">
                Checklist{" "}
                {draft.checklist.length > 0 && (
                  <span className="text-muted-foreground font-normal">
                    {draft.checklist.filter((c) => c.done).length}/
                    {draft.checklist.length}
                  </span>
                )}
              </Label>
              <ul className="space-y-1">
                {draft.checklist.map((item) => (
                  <li key={item.id} className="flex items-center gap-2">
                    <Checkbox
                      aria-label={`Done: ${item.text}`}
                      checked={item.done}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          checklist: draft.checklist.map((c) =>
                            c.id === item.id
                              ? { ...c, done: e.target.checked }
                              : c
                          ),
                        })
                      }
                    />
                    <span
                      className={
                        item.done
                          ? "text-muted-foreground flex-1 text-sm line-through"
                          : "flex-1 text-sm"
                      }
                    >
                      {item.text}
                    </span>
                    <Button
                      type="button"
                      size="icon-xs"
                      variant="ghost"
                      aria-label={`Remove ${item.text}`}
                      onClick={() =>
                        setDraft({
                          ...draft,
                          checklist: draft.checklist.filter(
                            (c) => c.id !== item.id
                          ),
                        })
                      }
                    >
                      <X className="size-3.5" />
                    </Button>
                  </li>
                ))}
              </ul>
              <div className="flex gap-2">
                <Input
                  id="task-item"
                  placeholder="Add a subtask"
                  maxLength={200}
                  value={itemInput}
                  onChange={(e) => setItemInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addItem();
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  aria-label="Add subtask"
                  onClick={addItem}
                >
                  <Plus className="size-4" />
                </Button>
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
              <Button type="submit" disabled={saving || invalidRange}>
                {saving && <Spinner />}
                {draft.id ? "Save changes" : "Create task"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
