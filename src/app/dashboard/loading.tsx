import DashboardSidebar from "@/components/dashboad/sidebar/dashboard-sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import React from "react";

const DashboardLoading = () => {
  return (
    <div className="flex">
      <DashboardSidebar className="border-t" />
      <main className="flex-1">
        <div className="h-dvh w-full">
          <header className="bg-background text-muted-foreground sticky top-0 flex h-[49px] items-center justify-between gap-x-2 border-b px-6 py-4 text-xs">
            <Skeleton className="h-6 w-28 rounded" />
            <Skeleton className="h-7 w-7 rounded-full" />
          </header>
          <div className="mx-auto grid grid-cols-1 gap-4 p-4 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
            <SkeletonProjectCard />
            <SkeletonProjectCard />
            <SkeletonProjectCard />
            <SkeletonProjectCard />
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardLoading;

const SkeletonProjectCard = () => {
  return (
    <div className="group bg-secondary/40 hover:border-foreground/20 hover:bg-secondary/80 relative flex h-[184px] cursor-pointer rounded-md border p-5 pb-4 text-left transition duration-150 ease-in-out">
      <div className="flex w-full flex-col gap-y-2">
        <div className="flex items-center justify-between gap-x-4 gap-y-2">
          <Skeleton className="h-8 w-8 rounded-full" />
          <div className="flex flex-1 flex-col gap-y-1">
            <Skeleton className="h-5 w-28 rounded" />
            <Skeleton className="h-4 w-36 rounded" />
          </div>
          <Skeleton className="h-7 w-7 rounded" />
        </div>
        <div className="flex-1 space-y-1">
          <Skeleton className="h-4 w-full rounded" />
          <Skeleton className="h-4 w-4/5 rounded" />
          <Skeleton className="h-4 w-3/4 rounded" />
        </div>
        <div className="">
          <Skeleton className="h-4 w-16 rounded" />
        </div>
      </div>
    </div>
  );
};
