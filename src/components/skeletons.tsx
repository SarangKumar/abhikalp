import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/** Building blocks for route-level loading.tsx files (mirror real layouts). */

export function HeaderSkeleton({ action = false }: { action?: boolean }) {
  return (
    <div className="flex items-end justify-between gap-3">
      <div className="space-y-2">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-4 w-72 max-w-full" />
      </div>
      {action && <Skeleton className="h-9 w-28" />}
    </div>
  );
}

export function CardSkeleton({
  className,
  lines = 3,
  children,
}: {
  className?: string;
  lines?: number;
  children?: React.ReactNode;
}) {
  return (
    <div className={cn("bg-card space-y-4 rounded-xl border p-5", className)}>
      <div className="space-y-2">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-3.5 w-48 max-w-full" />
      </div>
      {children ?? (
        <div className="space-y-2">
          {Array.from({ length: lines }, (_, i) => (
            <Skeleton
              key={i}
              className={cn("h-4", i % 3 === 2 ? "w-2/3" : "w-full")}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function FieldSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-4 w-20" />
      <Skeleton className="h-9 w-full" />
    </div>
  );
}

/** Top bar used by dashboard (overview) pages. */
export function DashboardBarSkeleton() {
  return (
    <div className="border-border/60 flex h-12 items-center justify-between border-b px-4 md:px-6">
      <Skeleton className="h-5 w-28" />
      <div className="flex items-center gap-2">
        <Skeleton className="size-8 rounded-md" />
        <Skeleton className="size-8 rounded-full" />
      </div>
    </div>
  );
}

export function ProjectCardSkeleton() {
  return (
    <div className="bg-card flex h-[184px] flex-col gap-y-2 rounded-xl border p-5 pb-4">
      <div className="flex items-center gap-x-4">
        <Skeleton className="size-8 rounded-full" />
        <div className="flex flex-1 flex-col gap-y-1.5">
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-3.5 w-36" />
        </div>
        <Skeleton className="size-7" />
      </div>
      <div className="flex-1 space-y-1.5 pt-1">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
      </div>
      <div className="flex justify-between">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-5 w-20 rounded-full" />
      </div>
    </div>
  );
}

export function SidebarSkeleton() {
  return (
    <aside className="bg-sidebar hidden h-dvh w-64 shrink-0 flex-col gap-6 border-r p-3 md:flex">
      <div className="flex items-center gap-2 p-1">
        <Skeleton className="size-8 rounded-lg" />
        <div className="flex-1 space-y-1.5">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
      {[4, 2].map((n, g) => (
        <div key={g} className="space-y-2">
          <Skeleton className="h-3 w-16" />
          {Array.from({ length: n }, (_, i) => (
            <div key={i} className="flex items-center gap-2 px-2 py-1">
              <Skeleton className="size-4" />
              <Skeleton className="h-4 w-28" />
            </div>
          ))}
        </div>
      ))}
    </aside>
  );
}
