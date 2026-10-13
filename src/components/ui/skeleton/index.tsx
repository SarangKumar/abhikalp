import React from "react";

import { cn } from "@/lib/utils";

export type SkeletonProps = React.ComponentProps<"div">;

export function Skeleton({ className, ref, ...props }: SkeletonProps) {
  return (
    <div
      ref={ref}
      {...props}
      aria-hidden="true"
      className={cn(
        "bg-muted animate-pulse rounded-md motion-reduce:animate-none",
        className,
      )}
    />
  );
}
