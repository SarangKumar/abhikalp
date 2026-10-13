import { CardSkeleton, HeaderSkeleton } from "@/components/skeletons";
import { Skeleton } from "@/components/ui/skeleton";

/** Overview: stat cards, burndown + schedule, breakdowns, lists. */
export default function OverviewLoading() {
  return (
    <div className="space-y-4 p-4 md:p-6" aria-busy="true">
      <HeaderSkeleton />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="bg-card space-y-3 rounded-xl border p-4">
            <div className="flex justify-between">
              <Skeleton className="h-3.5 w-20" />
              <Skeleton className="size-4" />
            </div>
            <Skeleton className="h-7 w-16" />
            <Skeleton className="h-3 w-32" />
          </div>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <CardSkeleton className="lg:col-span-2">
          <Skeleton className="h-64 w-full" />
        </CardSkeleton>
        <CardSkeleton lines={4} />
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        {Array.from({ length: 3 }, (_, i) => (
          <CardSkeleton key={i}>
            <Skeleton className="h-52 w-full" />
          </CardSkeleton>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <CardSkeleton lines={5} />
        <CardSkeleton lines={5} />
      </div>
    </div>
  );
}
