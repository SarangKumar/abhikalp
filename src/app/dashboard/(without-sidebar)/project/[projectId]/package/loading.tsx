import { CardSkeleton, HeaderSkeleton } from "@/components/skeletons";
import { Skeleton } from "@/components/ui/skeleton";

/** Package finder: search, suggestion chips and result cards. */
export default function PackageLoading() {
  return (
    <div className="mx-auto max-w-6xl space-y-4 p-4 md:p-6" aria-busy="true">
      <HeaderSkeleton />
      <Skeleton className="h-9 w-full" />
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 6 }, (_, i) => (
          <Skeleton key={i} className="h-7 w-20 rounded-full" />
        ))}
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {Array.from({ length: 4 }, (_, i) => (
          <CardSkeleton key={i} lines={2} />
        ))}
      </div>
    </div>
  );
}
