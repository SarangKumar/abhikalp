import {
  CardSkeleton,
  FieldSkeleton,
  HeaderSkeleton,
} from "@/components/skeletons";
import { Skeleton } from "@/components/ui/skeleton";

/** Project settings: plan, members and details cards at one width. */
export default function ProjectSettingsLoading() {
  return (
    <div
      className="mx-auto w-full max-w-4xl space-y-6 p-4 md:p-6"
      aria-busy="true"
    >
      <HeaderSkeleton />
      <CardSkeleton>
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }, (_, i) => (
            <FieldSkeleton key={i} />
          ))}
        </div>
      </CardSkeleton>
      <CardSkeleton>
        <div className="grid gap-3 sm:grid-cols-[1fr_10rem_12rem_auto]">
          <Skeleton className="h-9" />
          <Skeleton className="h-9" />
          <Skeleton className="h-9" />
          <Skeleton className="h-9 w-24" />
        </div>
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="size-8 rounded-full" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-44" />
            </div>
            <Skeleton className="h-8 w-28" />
          </div>
        ))}
      </CardSkeleton>
      <CardSkeleton>
        <div className="space-y-6">
          <FieldSkeleton />
          <Skeleton className="h-24 w-full" />
          <div className="grid gap-4 sm:grid-cols-2">
            <FieldSkeleton />
            <FieldSkeleton />
          </div>
        </div>
      </CardSkeleton>
    </div>
  );
}
