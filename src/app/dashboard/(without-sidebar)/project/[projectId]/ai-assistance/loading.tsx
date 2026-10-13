import { Skeleton } from "@/components/ui/skeleton";

/** AI chat: message column and composer. */
export default function AiLoading() {
  return (
    <div className="flex h-[calc(100dvh-3rem)] flex-col" aria-busy="true">
      <div className="mx-auto w-full max-w-3xl flex-1 space-y-6 px-4 py-6 md:px-6">
        <Skeleton className="h-48 w-full rounded-2xl" />
      </div>
      <div className="mx-auto flex w-full max-w-3xl gap-2 px-4 pb-6 md:px-6">
        <Skeleton className="h-16 flex-1" />
        <Skeleton className="size-9" />
      </div>
    </div>
  );
}
