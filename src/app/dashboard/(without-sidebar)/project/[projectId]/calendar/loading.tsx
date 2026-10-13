import { CardSkeleton, HeaderSkeleton } from "@/components/skeletons";
import { Skeleton } from "@/components/ui/skeleton";

/** Calendar: month grid + day agenda. */
export default function CalendarLoading() {
  return (
    <div className="space-y-4 p-4 md:p-6" aria-busy="true">
      <HeaderSkeleton />
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="bg-card space-y-3 rounded-xl border p-4">
          <div className="flex items-center justify-between">
            <Skeleton className="size-8" />
            <Skeleton className="h-8 w-40" />
            <Skeleton className="size-8" />
          </div>
          <div className="grid grid-cols-7 gap-px">
            {Array.from({ length: 7 }, (_, i) => (
              <Skeleton key={`h${i}`} className="mx-auto my-2 h-3 w-8" />
            ))}
            {Array.from({ length: 42 }, (_, i) => (
              <div
                key={i}
                className="border-border/60 h-28 space-y-1 border p-1"
              >
                <Skeleton className="ml-auto h-3 w-4" />
                {i % 5 === 1 && <Skeleton className="h-4 w-full" />}
                {i % 9 === 3 && <Skeleton className="h-4 w-3/4" />}
              </div>
            ))}
          </div>
        </div>
        <CardSkeleton lines={3} />
      </div>
    </div>
  );
}
