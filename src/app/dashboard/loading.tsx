import {
  DashboardBarSkeleton,
  ProjectCardSkeleton,
  SidebarSkeleton,
} from "@/components/skeletons";
import { Skeleton } from "@/components/ui/skeleton";

/** Projects dashboard: sidebar, top bar, toolbar and project card grid. */
export default function DashboardLoading() {
  return (
    <div className="flex" aria-busy="true" aria-label="Loading projects">
      <SidebarSkeleton />
      <div className="min-w-0 flex-1">
        <DashboardBarSkeleton />
        <div className="space-y-4 px-4 py-4 md:px-6 md:py-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-9 w-full md:max-w-sm" />
          </div>
          <Skeleton className="h-3.5 w-24" />
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }, (_, i) => (
              <ProjectCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
