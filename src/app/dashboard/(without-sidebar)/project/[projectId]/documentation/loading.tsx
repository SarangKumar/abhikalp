import { HeaderSkeleton } from "@/components/skeletons";
import { Skeleton } from "@/components/ui/skeleton";

/** Docs editor: tabs + save bar + editor surface. */
export default function DocsLoading() {
  return (
    <div className="mx-auto max-w-5xl space-y-4 p-4 md:p-6" aria-busy="true">
      <HeaderSkeleton />
      <div className="flex items-center justify-between gap-2">
        <Skeleton className="h-9 w-44" />
        <Skeleton className="h-9 w-24" />
      </div>
      <Skeleton className="min-h-[60dvh] w-full rounded-lg" />
    </div>
  );
}
