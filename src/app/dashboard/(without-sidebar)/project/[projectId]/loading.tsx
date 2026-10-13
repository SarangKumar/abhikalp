import { Skeleton } from "@/components/ui/skeleton";
import React from "react";

const ProjectLoading = () => {
  return (
    <div className="relative flex w-full">
      <div className="h-auto text-sm">
        <div className="mx-auto grid grid-cols-1 gap-4 p-4 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      </div>
    </div>
  );
};

export default ProjectLoading;
