import { HeaderSkeleton } from "@/components/skeletons";
import { Skeleton } from "@/components/ui/skeleton";

const BARS = [
  [0, 40, true],
  [4, 18],
  [12, 22],
  [28, 30, true],
  [30, 12],
  [38, 16],
  [8, 26],
] as const;

/** Timeline: legend/zoom bar and Gantt rows. */
export default function TimelineLoading() {
  return (
    <div className="space-y-4 p-4 md:p-6" aria-busy="true">
      <HeaderSkeleton />
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-72" />
        <Skeleton className="h-8 w-48" />
      </div>
      <div className="bg-card overflow-hidden rounded-xl border">
        <div className="flex h-9 border-b">
          <div className="w-56 shrink-0 border-r" />
        </div>
        {BARS.map(([left, width, ms], i) => (
          <div
            key={i}
            className={
              ms ? "bg-muted/40 flex h-9 border-b" : "flex h-9 border-b"
            }
          >
            <div className="flex w-56 shrink-0 items-center gap-2 border-r px-3">
              <Skeleton className="size-3 rounded-full" />
              <Skeleton className="h-3.5 w-32" />
            </div>
            <div className="relative flex-1">
              <Skeleton
                className="absolute top-2 h-5 rounded-md"
                style={{ left: `${left * 2}%`, width: `${width * 1.2}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
