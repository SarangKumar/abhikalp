import { CardSkeleton, DashboardBarSkeleton } from "@/components/skeletons";
import { Skeleton } from "@/components/ui/skeleton";

/** Account settings: stacked cards in a max-w-3xl column. */
export default function AccountSettingsLoading() {
  return (
    <div aria-busy="true">
      <DashboardBarSkeleton />
      <div className="mx-auto w-full max-w-3xl space-y-6 px-4 py-6">
        <CardSkeleton>
          <div className="flex gap-2">
            <Skeleton className="h-9 w-32" />
            <Skeleton className="h-9 w-36" />
          </div>
        </CardSkeleton>
        <CardSkeleton lines={4} />
        <CardSkeleton lines={2} />
      </div>
    </div>
  );
}
