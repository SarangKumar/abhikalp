import React from "react";

import { cn } from "@/lib/utils";

const alertVariants = {
  default: "border-border bg-card text-card-foreground",
  destructive:
    "border-destructive/50 bg-card text-destructive *:data-[slot=alert-description]:text-destructive/90 [&>svg]:text-current",
} as const;

export type AlertVariant = keyof typeof alertVariants;

export function Alert({
  className,
  variant = "default",
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  variant?: AlertVariant;
}) {
  return (
    <div
      role="alert"
      data-slot="alert"
      data-variant={variant}
      className={cn(
        "border-border relative grid w-full grid-cols-[0_minmax(0,1fr)] items-start gap-y-0.5 rounded-lg border px-4 py-3 text-sm has-[>svg]:grid-cols-[--spacing(4)_minmax(0,1fr)] has-[>svg]:gap-x-3 [&>*:not(svg)]:col-start-2 [&>svg]:col-start-1 [&>svg]:row-span-2 [&>svg]:row-start-1 [&>svg]:mt-0.5 [&>svg]:size-4 [&>svg]:shrink-0 [&>svg]:translate-y-0 [&>svg]:text-current",
        alertVariants[variant],
        className,
      )}
      {...props}
    />
  );
}

export function AlertTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="alert-title"
      className={cn(
        "col-start-2 line-clamp-1 min-h-4 font-medium tracking-tight",
        className,
      )}
      {...props}
    />
  );
}

export function AlertDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="alert-description"
      className={cn(
        "text-muted-foreground col-start-2 grid justify-items-start gap-1 text-sm [&_p]:leading-relaxed",
        className,
      )}
      {...props}
    />
  );
}
