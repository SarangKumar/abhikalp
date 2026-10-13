import { HeaderSkeleton } from "@/components/skeletons";
import { Skeleton } from "@/components/ui/skeleton";

/** Activity: day groups of feed rows. */
export default function ActivityLoading() {
  return (
    <div
      className="mx-auto w-full max-w-3xl space-y-4 p-4 md:p-6"
      aria-busy="true"
    >
      <HeaderSkeleton />
      {[4, 3].map((n, g) => (
        <section key={g} className="space-y-2">
          <Skeleton className="h-3 w-40" />
          <div className="bg-card divide-y rounded-xl border">
            {Array.from({ length: n }, (_, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3">
                <Skeleton className="size-7 rounded-full" />
                <Skeleton className="h-4 flex-1" />
                <Skeleton className="h-3 w-14" />
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
