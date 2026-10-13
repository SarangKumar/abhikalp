import { CardSkeleton, HeaderSkeleton } from "@/components/skeletons";
import { Skeleton } from "@/components/ui/skeleton";

/** Milestones: card grid with progress bars. */
export default function MilestonesLoading() {
  return (
    <div className="space-y-4 p-4 md:p-6" aria-busy="true">
      <HeaderSkeleton />
      <div className="flex justify-end">
        <Skeleton className="h-9 w-36" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <CardSkeleton key={i}>
            <div className="space-y-2">
              <Skeleton className="h-3.5 w-full" />
              <div className="flex justify-between">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-3 w-8" />
              </div>
              <Skeleton className="h-2 w-full rounded-full" />
            </div>
          </CardSkeleton>
        ))}
      </div>
    </div>
  );
}
