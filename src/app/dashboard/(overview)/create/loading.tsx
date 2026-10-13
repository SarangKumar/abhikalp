import { DashboardBarSkeleton, FieldSkeleton } from "@/components/skeletons";
import { Skeleton } from "@/components/ui/skeleton";

/** Create project: title + project form. */
export default function CreateProjectLoading() {
  return (
    <div aria-busy="true">
      <DashboardBarSkeleton />
      <div className="mx-auto max-w-3xl space-y-8 px-4 py-6">
        <Skeleton className="h-7 w-40" />
        <FieldSkeleton />
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-28 w-full" />
        </div>
        <div className="grid gap-6 sm:grid-cols-2">
          <FieldSkeleton />
          <FieldSkeleton />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-5 w-9 rounded-full" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-9 w-36" />
      </div>
    </div>
  );
}
