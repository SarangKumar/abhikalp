"use client";

import type { TaskStatus } from "@prisma/client";
import { Flag } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { Card } from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyTitle,
} from "@/components/ui/empty-state";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Tooltip } from "@/components/ui/tooltip";
import { isOverdue, startOfDay, STATUS_META } from "@/lib/planning";
import { cn } from "@/lib/utils";

export type TimelineTask = {
  id: string;
  title: string;
  status: TaskStatus;
  startDate: string | null;
  dueDate: string | null;
  milestoneId: string | null;
};
export type TimelineMilestone = {
  id: string;
  title: string;
  startDate: string | null;
  dueDate: string | null;
  percent: number;
};

const DAY = 86_400_000;
const ZOOM = { week: 40, month: 16, quarter: 6 } as const;
type Zoom = keyof typeof ZOOM;

const BAR: Record<TaskStatus, string> = {
  PENDING: "bg-chart-2/80",
  IN_PROGRESS: "bg-chart-4/85",
  COMPLETED: "bg-chart-3/80",
};

function span(start: string | null, due: string | null) {
  const s = start
    ? startOfDay(new Date(start))
    : due
      ? startOfDay(new Date(due))
      : null;
  const e = due ? startOfDay(new Date(due)) : s;
  return s && e ? { s, e: e < s ? s : e } : null;
}
const fmt = (d: Date) =>
  d.toLocaleDateString("en-US", { day: "numeric", month: "short" });

type Row =
  | { type: "group"; id: string; title: string }
  | { type: "milestone"; m: TimelineMilestone; range: ReturnType<typeof span> }
  | { type: "task"; t: TimelineTask; range: ReturnType<typeof span> };

export function ProjectTimeline({
  tasks,
  milestones,
}: {
  tasks: TimelineTask[];
  milestones: TimelineMilestone[];
}) {
  const [zoom, setZoom] = useState<Zoom>("month");
  const scroller = useRef<HTMLDivElement>(null);
  const px = ZOOM[zoom];

  const { rows, from, days, unscheduled } = useMemo(() => {
    const rows: Row[] = [];
    const dated = (t: TimelineTask) => span(t.startDate, t.dueDate);
    for (const m of milestones) {
      const own = tasks.filter((t) => t.milestoneId === m.id && dated(t));
      rows.push({ type: "milestone", m, range: span(m.startDate, m.dueDate) });
      own.forEach((t) => rows.push({ type: "task", t, range: dated(t) }));
    }
    const loose = tasks.filter(
      (t) =>
        (!t.milestoneId || !milestones.some((m) => m.id === t.milestoneId)) &&
        dated(t)
    );
    if (loose.length) {
      if (milestones.length)
        rows.push({ type: "group", id: "none", title: "No milestone" });
      loose.forEach((t) => rows.push({ type: "task", t, range: dated(t) }));
    }
    const today = startOfDay(new Date());
    const ranges = rows.flatMap((r) =>
      "range" in r && r.range ? [r.range] : []
    );
    const min = new Date(
      Math.min(today.getTime(), ...ranges.map((r) => r.s.getTime())) - 7 * DAY
    );
    const max = new Date(
      Math.max(today.getTime(), ...ranges.map((r) => r.e.getTime())) + 21 * DAY
    );
    // Start on a Monday for clean week columns.
    const from = new Date(min.getTime() - ((min.getDay() + 6) % 7) * DAY);
    return {
      rows,
      from,
      days: Math.round((max.getTime() - from.getTime()) / DAY),
      unscheduled: tasks.filter((t) => !dated(t)).length,
    };
  }, [tasks, milestones]);

  const offset = (d: Date) =>
    Math.round((d.getTime() - from.getTime()) / DAY) * px;
  const todayX = offset(startOfDay(new Date()));

  useEffect(() => {
    scroller.current?.scrollTo({ left: Math.max(0, todayX - 160) });
  }, [todayX]);

  const ticks = useMemo(() => {
    const out: { x: number; label: string }[] = [];
    for (let i = 0; i < days; i++) {
      const d = new Date(from.getTime() + i * DAY);
      const show = zoom === "quarter" ? d.getDate() === 1 : d.getDay() === 1;
      if (show)
        out.push({
          x: i * px,
          label:
            zoom === "quarter"
              ? d.toLocaleDateString("en-US", {
                  month: "short",
                  year: "2-digit",
                })
              : fmt(d),
        });
    }
    return out;
  }, [days, from, px, zoom]);

  if (rows.length === 0)
    return (
      <Empty className="rounded-xl border border-dashed py-16">
        <EmptyTitle>Nothing scheduled yet</EmptyTitle>
        <EmptyDescription>
          Give tasks or milestones a start or due date to see them on the
          roadmap.
        </EmptyDescription>
      </Empty>
    );

  const width = days * px;
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="text-muted-foreground flex flex-wrap items-center gap-3 text-xs">
          {(Object.keys(BAR) as TaskStatus[]).map((s) => (
            <span key={s} className="flex items-center gap-1.5">
              <span className={cn("h-2 w-4 rounded-sm", BAR[s])} />{" "}
              {STATUS_META[s].label}
            </span>
          ))}
          <span className="flex items-center gap-1.5">
            <Flag className="text-primary size-3" /> Milestone
          </span>
          {unscheduled > 0 && (
            <span>· {unscheduled} tasks without dates are hidden</span>
          )}
        </div>
        <ToggleGroup
          variant="outline"
          size="sm"
          value={[zoom]}
          onValueChange={(v) => v[0] && setZoom(v[0] as Zoom)}
          aria-label="Zoom"
        >
          <ToggleGroupItem value="week">Week</ToggleGroupItem>
          <ToggleGroupItem value="month">Month</ToggleGroupItem>
          <ToggleGroupItem value="quarter">Quarter</ToggleGroupItem>
        </ToggleGroup>
      </div>
      <Card className="overflow-hidden p-0">
        <div ref={scroller} className="overflow-x-auto">
          <div className="relative" style={{ width: width + 224 }}>
            <div className="bg-card sticky top-0 z-20 flex h-9 border-b">
              <div className="bg-card sticky left-0 z-30 flex w-56 shrink-0 items-center border-r px-3 text-xs font-medium">
                Item
              </div>
              <div className="relative" style={{ width }}>
                {ticks.map((t) => (
                  <span
                    key={t.x}
                    className="text-muted-foreground absolute top-0 flex h-full items-center border-l pl-1.5 text-[11px] whitespace-nowrap"
                    style={{ left: t.x }}
                  >
                    {t.label}
                  </span>
                ))}
              </div>
            </div>
            <div className="relative">
              <div
                className="bg-primary pointer-events-none absolute top-0 bottom-0 z-10 w-px"
                style={{ left: 224 + todayX + px / 2 }}
                aria-hidden
              />
              {rows.map((r) => {
                if (r.type === "group")
                  return (
                    <div
                      key={`g-${r.id}`}
                      className="bg-muted/40 flex h-8 border-b"
                    >
                      <div className="bg-muted/40 sticky left-0 z-10 flex w-56 shrink-0 items-center border-r px-3 text-xs font-medium">
                        {r.title}
                      </div>
                    </div>
                  );
                const isMs = r.type === "milestone";
                const title = isMs ? r.m.title : r.t.title;
                const range = r.range;
                return (
                  <div
                    key={isMs ? `m-${r.m.id}` : `t-${r.t.id}`}
                    className={cn("flex h-9 border-b", isMs && "bg-muted/40")}
                  >
                    <div
                      className={cn(
                        "bg-card sticky left-0 z-10 flex w-56 shrink-0 items-center gap-2 border-r px-3 text-sm",
                        isMs ? "bg-muted font-medium" : "pl-6"
                      )}
                    >
                      {isMs ? (
                        <Flag className="text-primary size-3.5 shrink-0" />
                      ) : (
                        <span
                          className={cn(
                            "size-2 shrink-0 rounded-full",
                            STATUS_META[r.t.status].dot
                          )}
                        />
                      )}
                      <span className="truncate">{title}</span>
                    </div>
                    <div className="relative" style={{ width }}>
                      {range && (
                        <Tooltip
                          content={
                            <>
                              {title}: {fmt(range.s)} – {fmt(range.e)}
                              {isMs
                                ? ` · ${r.m.percent}%`
                                : ` · ${STATUS_META[r.t.status].label}`}
                            </>
                          }
                        >
                          <div
                            className={cn(
                              "absolute top-1/2 h-5 -translate-y-1/2 rounded-md",
                              isMs
                                ? "bg-primary/20 border-primary/50 border"
                                : BAR[r.t.status],
                              !isMs &&
                                isOverdue({
                                  status: r.t.status,
                                  dueDate: r.t.dueDate,
                                }) &&
                                "ring-destructive ring-2"
                            )}
                            style={{
                              left: offset(range.s) + 1,
                              width: Math.max(
                                px - 2,
                                offset(range.e) - offset(range.s) + px - 2
                              ),
                            }}
                          >
                            {isMs && (
                              <div
                                className="bg-primary/60 h-full rounded-md"
                                style={{ width: `${r.m.percent}%` }}
                              />
                            )}
                          </div>
                        </Tooltip>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
