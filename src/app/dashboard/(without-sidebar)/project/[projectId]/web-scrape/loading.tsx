import { HeaderSkeleton } from "@/components/skeletons";
import { Skeleton } from "@/components/ui/skeleton";

/** References: URL form, list and preview pane. */
export default function WebScrapeLoading() {
  return (
    <div className="space-y-4 p-4 md:p-6" aria-busy="true">
      <HeaderSkeleton />
      <div className="flex flex-col gap-2 sm:flex-row">
        <Skeleton className="h-9 flex-1" />
        <Skeleton className="h-9 sm:w-40" />
      </div>
      <div className="grid gap-4 lg:grid-cols-[18rem_1fr]">
        <div className="space-y-1">
          {Array.from({ length: 5 }, (_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-lg" />
          ))}
        </div>
        <Skeleton className="h-[50dvh] rounded-xl" />
      </div>
    </div>
  );
}
