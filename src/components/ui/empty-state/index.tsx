import * as React from "react";

import { cn } from "@/lib/utils";

const emptySize = {
  default: "gap-4 px-8 py-12",
  sm: "gap-3 px-6 py-8",
} as const;

export type EmptySize = keyof typeof emptySize;

/**
 * Quiet empty-state shell for lists, tables, and dashboard panels.
 */
export function Empty({
  className,
  size = "default",
  ...props
}: React.ComponentProps<"div"> & {
  size?: EmptySize;
}) {
  return (
    <div
      data-slot="empty"
      data-size={size}
      role="status"
      className={cn(
        "border-border/80 bg-background text-card-foreground flex w-full min-w-0 flex-col items-center justify-center rounded-lg border border-dashed text-center",
        emptySize[size],
        className,
      )}
      {...props}
    />
  );
}

export function EmptyIcon({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="empty-icon"
      className={cn(
        "bg-muted text-muted-foreground flex size-11 items-center justify-center rounded-full [&_svg]:size-5",
        className,
      )}
      {...props}
    />
  );
}

export function EmptyTitle({
  className,
  ...props
}: React.ComponentProps<"h3">) {
  return (
    <h3
      data-slot="empty-title"
      className={cn(
        "text-foreground min-w-0 text-base leading-snug font-medium tracking-tight",
        className,
      )}
      {...props}
    />
  );
}

export function EmptyDescription({
  className,
  ...props
}: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="empty-description"
      className={cn(
        "text-muted-foreground max-w-sm min-w-0 text-sm leading-6 text-pretty",
        className,
      )}
      {...props}
    />
  );
}

export function EmptyActions({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="empty-actions"
      className={cn(
        "mt-1 flex flex-wrap items-center justify-center gap-2 pt-1",
        className,
      )}
      {...props}
    />
  );
}
