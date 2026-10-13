import { Skeleton } from "@/components/ui/skeleton";

/** Whiteboard: status strip, floating toolbar and canvas. */
export default function PlaygroundLoading() {
  return (
    <div
      className="bg-background flex h-[calc(100svh-3rem)] flex-col"
      aria-busy="true"
    >
      <div className="flex h-10 shrink-0 items-center justify-between border-b px-4">
        <Skeleton className="h-3.5 w-64" />
        <Skeleton className="h-3.5 w-16" />
      </div>
      <div className="relative flex-1">
        <div className="absolute top-4 left-1/2 flex -translate-x-1/2 gap-1 rounded-lg border p-1">
          {Array.from({ length: 9 }, (_, i) => (
            <Skeleton key={i} className="size-8" />
          ))}
        </div>
        <Skeleton className="absolute top-4 left-4 size-9" />
        <div className="absolute bottom-4 left-4 flex gap-1">
          <Skeleton className="h-9 w-28" />
          <Skeleton className="h-9 w-20" />
        </div>
      </div>
    </div>
  );
}
