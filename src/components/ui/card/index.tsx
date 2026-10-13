import React from "react";

import { cn } from "@/lib/utils";

const cardSize = {
  default: "gap-4 p-4",
  sm: "gap-2 p-3",
} as const;

export type CardSize = keyof typeof cardSize;

export function Card({
  className,
  size = "default",
  ...props
}: React.ComponentProps<"div"> & {
  size?: CardSize;
}) {
  return (
    <div
      data-size={size}
      className={cn(
        "bg-card text-card-foreground border-border flex flex-col rounded-md border",
        cardSize[size],
        className,
      )}
      {...props}
    />
  );
}

export function CardHeader({
  className,
  ...props
}: React.ComponentProps<"header">) {
  return (
    <header
      className={cn(
        "grid grid-cols-1 items-start gap-1 has-[[data-slot=card-action]]:grid-cols-[minmax(0,1fr)_auto] has-[[data-slot=card-action]]:gap-x-3",
        className,
      )}
      {...props}
    />
  );
}

export function CardTitle({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "min-w-0 text-sm leading-none font-semibold break-words",
        className,
      )}
      {...props}
    />
  );
}

export function CardDescription({
  className,
  ...props
}: React.ComponentProps<"p">) {
  return (
    <p
      className={cn(
        "text-muted-foreground min-w-0 text-sm leading-5 break-words",
        className,
      )}
      {...props}
    />
  );
}

export function CardAction({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className,
      )}
      {...props}
    />
  );
}

export function CardContent({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return <div className={cn("flex flex-col gap-3", className)} {...props} />;
}

export function CardFooter({
  className,
  ...props
}: React.ComponentProps<"footer">) {
  return (
    <footer className={cn("flex items-center gap-2", className)} {...props} />
  );
}
