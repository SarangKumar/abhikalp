import { Skeleton } from "@/components/ui/skeleton";

/** Project home: banner, title row, description + task list. */
export default function ProjectLoading() {
  return (
    <div className="space-y-4 p-4 md:p-6" aria-busy="true">
      <Skeleton className="mb-8 h-60 w-full rounded-xl" />
      <div className="mb-4 flex flex-col justify-between gap-5 md:flex-row md:items-center">
        <Skeleton className="h-7 w-56" />
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
            {Array.from({ length: 3 }, (_, i) => (
              <Skeleton
                key={i}
                className="border-background size-8 rounded-full border-2"
              />
            ))}
          </div>
          <Skeleton className="h-9 w-24" />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 xl:grid-cols-3">
        <div className="space-y-4 xl:col-span-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-28" />
          </div>
        </div>
      </div>
      <div className="bg-card rounded-xl border">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-8 w-24" />
        </div>
        {Array.from({ length: 5 }, (_, i) => (
          <div
            key={i}
            className="flex items-center gap-3 border-b px-5 py-4 last:border-b-0"
          >
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-3 w-1/3" />
            </div>
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
