import { HeaderSkeleton } from "@/components/skeletons";
import { Skeleton } from "@/components/ui/skeleton";

/** Kanban board: toolbar and three columns of cards. */
export default function TodoLoading() {
  return (
    <div className="space-y-4 p-4 md:p-6" aria-busy="true">
      <HeaderSkeleton />
      <div className="flex flex-col gap-2 sm:flex-row">
        <Skeleton className="h-9 flex-1" />
        <Skeleton className="h-9 sm:w-40" />
        <Skeleton className="h-9 sm:w-28" />
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        {[3, 2, 2].map((n, c) => (
          <section
            key={c}
            className="bg-muted/30 flex min-h-48 flex-col gap-3 rounded-xl border p-3"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="size-6" />
            </div>
            {Array.from({ length: n }, (_, i) => (
              <div key={i} className="bg-card space-y-2 rounded-lg border p-3">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-full" />
                <div className="flex gap-2">
                  <Skeleton className="h-5 w-14 rounded-full" />
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="ml-auto size-5 rounded-full" />
                </div>
              </div>
            ))}
          </section>
        ))}
      </div>
    </div>
  );
}
