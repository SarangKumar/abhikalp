import { FolderKanban, House, LayoutList, Settings } from "lucide-react";

import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

const lanes = [
  {
    label: "To do",
    dot: "bg-muted-foreground",
    cards: [
      ["Write API docs", "medium"],
      ["Invite the design team", "low"],
    ],
  },
  {
    label: "In progress",
    dot: "bg-warning",
    cards: [
      ["Kanban drag and drop", "high"],
      ["Package finder search", "medium"],
    ],
  },
  { label: "Done", dot: "bg-success", cards: [["Sign-in with GitHub", "low"]] },
] as const;
const prio: Record<string, string> = {
  high: "bg-destructive/10 text-destructive",
  medium: "bg-primary/10 text-primary",
  low: "bg-muted text-muted-foreground",
};

/** Static, decorative mock of the project board (no screenshots to go stale). */
export function ProductPreview() {
  return (
    <div
      aria-hidden
      className="bg-card relative mx-auto max-w-5xl overflow-hidden rounded-2xl border"
    >
      <div className="bg-muted/50 flex items-center gap-1.5 border-b px-4 py-2.5">
        <span className="size-2.5 rounded-full bg-red-400/70" />
        <span className="size-2.5 rounded-full bg-amber-400/70" />
        <span className="size-2.5 rounded-full bg-emerald-400/70" />
        <span className="bg-background text-muted-foreground mx-auto rounded-md border px-3 py-0.5 text-[11px]">
          {siteConfig.url.replace(/^https?:\/\//, "")}/dashboard
        </span>
      </div>
      <div className="flex min-h-80">
        <div className="bg-sidebar hidden w-44 shrink-0 flex-col gap-1 border-r p-3 sm:flex">
          <p className="text-muted-foreground px-2 pb-1 text-[10px] font-medium uppercase">
            Project
          </p>
          {[
            [House, "Home", false],
            [LayoutList, "Todo", true],
            [FolderKanban, "Docs", false],
            [Settings, "Settings", false],
          ].map(([Icon, label, active]) => {
            const I = Icon as typeof House;
            return (
              <span
                key={label as string}
                className={cn(
                  "flex items-center gap-2 rounded-md px-2 py-1.5 text-xs",
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    : "text-muted-foreground"
                )}
              >
                <I className="size-3.5" />
                {label as string}
              </span>
            );
          })}
        </div>
        <div className="grid flex-1 grid-cols-1 gap-3 p-4 md:grid-cols-3">
          {lanes.map((lane) => (
            <div
              key={lane.label}
              className="bg-muted/40 rounded-xl border p-2.5"
            >
              <p className="mb-2 flex items-center gap-2 px-1 text-xs font-medium">
                <span className={cn("size-1.5 rounded-full", lane.dot)} />
                {lane.label}
                <span className="text-muted-foreground">
                  {lane.cards.length}
                </span>
              </p>
              <div className="space-y-2">
                {lane.cards.map(([title, p], i) => (
                  <div
                    key={title}
                    className={cn(
                      "bg-card rounded-lg border p-2.5",
                      lane.label === "In progress" &&
                        i === 0 &&
                        "border-primary/50 -rotate-1"
                    )}
                  >
                    <p className="text-xs font-medium">{title}</p>
                    <span
                      className={cn(
                        "mt-2 inline-block rounded-full px-2 py-0.5 text-[10px] capitalize",
                        prio[p]
                      )}
                    >
                      {p}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
