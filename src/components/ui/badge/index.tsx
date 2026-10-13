import React from "react";

import { cn } from "@/lib/utils";

const badgeVariants = {
  default: "border-transparent bg-primary text-primary-foreground",
  secondary: "border-border bg-secondary text-secondary-foreground",
  destructive:
    "border-transparent bg-destructive/10 text-destructive dark:bg-destructive/20",
  outline: "border-border text-foreground",
  ghost:
    "border-transparent text-foreground hover:bg-accent hover:text-accent-foreground",
  link: "border-transparent text-primary underline-offset-4 hover:underline",
} as const;

export type BadgeVariant = keyof typeof badgeVariants;

export function Badge({
  className,
  variant = "default",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant;
}) {
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium whitespace-nowrap [&>svg]:size-3",
        badgeVariants[variant],
        className,
      )}
      {...props}
    />
  );
}
