"use client";

import type { TaskStatus } from "@prisma/client";
import { Flag } from "lucide-react";
import Link from "next/link";
import { createContext, useContext, useMemo, useState } from "react";
import type { DayButtonProps } from "react-day-picker";

import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { isOverdue, STATUS_META } from "@/lib/planning";
import { cn } from "@/lib/utils";

export type CalendarEntry =
  | {
      kind: "task";
      id: string;
      title: string;
      date: string;
      status: TaskStatus;
    }
  | {
      kind: "milestone";
      id: string;
      title: string;
      date: string;
      done: boolean;
    };

const key = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
const EntriesContext = createContext<Map<string, CalendarEntry[]>>(new Map());

function EntryChip({ e }: { e: CalendarEntry }) {
  return (
    <span
      className={cn(
        "flex w-full items-center gap-1 truncate rounded px-1 py-0.5 text-left text-[11px] leading-tight font-normal",
        e.kind === "milestone"
          ? "bg-primary/10 text-primary"
          : isOverdue({ status: e.status, dueDate: e.date })
            ? "bg-destructive/10 text-destructive"
            : "bg-muted text-foreground",
        e.kind === "task" &&
          e.status === "COMPLETED" &&
          "text-muted-foreground line-through"
      )}
    >
      {e.kind === "milestone" ? (
        <Flag className="size-3 shrink-0" />
      ) : (
        <span
          className={cn(
            "size-1.5 shrink-0 rounded-full",
            STATUS_META[e.status].dot
          )}
        />
      )}
      <span className="truncate">{e.title}</span>
    </span>
  );
}

/** Day cell with the day's tasks and milestones (max 3 + overflow). */
function DayCell({
  day,
  modifiers,
  className,
  children,
  ...props
}: DayButtonProps) {
  const entries = useContext(EntriesContext).get(key(day.date)) ?? [];
  void modifiers;
  return (
    <button
      {...props}
      className={cn(
        className,
        "flex flex-col items-stretch justify-start gap-1"
      )}
    >
      <span className="self-end px-1 text-xs">{children}</span>
      {entries.slice(0, 3).map((e) => (
        <EntryChip key={`${e.kind}-${e.id}`} e={e} />
      ))}
      {entries.length > 3 && (
        <span className="text-muted-foreground px-1 text-left text-[11px]">
          +{entries.length - 3} more
        </span>
      )}
    </button>
  );
}

export function ProjectCalendar({
  projectId,
  entries,
  unscheduled,
}: {
  projectId: string;
  entries: CalendarEntry[];
  unscheduled: number;
}) {
  const [selected, setSelected] = useState<Date | undefined>(() => new Date());
  const [month, setMonth] = useState<Date>(() => new Date());
  const byDay = useMemo(() => {
    const map = new Map<string, CalendarEntry[]>();
    for (const e of entries) {
      const k = key(new Date(e.date));
      map.set(k, [...(map.get(k) ?? []), e]);
    }
    for (const list of map.values())
      list.sort((a, b) =>
        a.kind === b.kind ? 0 : a.kind === "milestone" ? -1 : 1
      );
    return map;
  }, [entries]);
  const dayEntries = selected ? (byDay.get(key(selected)) ?? []) : [];
  const monthCount = entries.filter((e) => {
    const d = new Date(e.date);
    return (
      d.getMonth() === month.getMonth() &&
      d.getFullYear() === month.getFullYear()
    );
  }).length;

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_18rem]">
      <Card className="overflow-x-auto p-0">
        <EntriesContext.Provider value={byDay}>
          <Calendar
            mode="single"
            selected={selected}
            onSelect={setSelected}
            month={month}
            onMonthChange={setMonth}
            showOutsideDays
            fixedWeeks
            startMonth={new Date(2020, 0)}
            endMonth={new Date(new Date().getFullYear() + 5, 11)}
            components={{ DayButton: DayCell }}
            className="w-full min-w-[42rem] p-4"
            classNames={{
              root: "w-full!",
              months: "w-full",
              month: "w-full!",
              month_grid: "w-full! table-fixed",
              weekdays: "w-full!",
              weekday: "flex-1 w-auto! h-8",
              week: "w-full! mt-0!",
              day: "flex-1 w-auto! h-28! border-border/60 border p-0! rounded-none! [&:has([aria-selected])]:bg-transparent!",
              day_button:
                "size-full! max-h-none! max-w-none! min-h-0! min-w-0! rounded-none! p-1! hover:bg-accent/50! aria-selected:bg-primary/5! aria-selected:ring-primary aria-selected:ring-1 aria-selected:ring-inset",
              selected: "bg-transparent! text-foreground!",
              today:
                "bg-transparent! [&_span:first-child]:text-primary [&_span:first-child]:font-semibold",
            }}
          />
        </EntriesContext.Provider>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>
            {selected
              ? selected.toLocaleDateString("en-US", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })
              : "Pick a day"}
          </CardTitle>
          <CardDescription>
            {monthCount} due this month
            {unscheduled
              ? ` · ${unscheduled} open tasks without a due date`
              : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {dayEntries.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              Nothing due on this day.
            </p>
          ) : (
            <ul className="space-y-2">
              {dayEntries.map((e) => (
                <li key={`${e.kind}-${e.id}`}>
                  <Link
                    href={`/dashboard/project/${projectId}/${e.kind === "task" ? "todo" : "milestones"}`}
                    className="hover:bg-accent flex items-center gap-2 rounded-md border p-2 text-sm"
                  >
                    {e.kind === "milestone" ? (
                      <Flag className="text-primary size-4 shrink-0" />
                    ) : (
                      <span
                        className={cn(
                          "size-2 shrink-0 rounded-full",
                          STATUS_META[e.status].dot
                        )}
                      />
                    )}
                    <span className="min-w-0 flex-1 truncate">{e.title}</span>
                    <Badge variant="outline" className="shrink-0">
                      {e.kind === "milestone"
                        ? "Milestone"
                        : STATUS_META[e.status].label}
                    </Badge>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
