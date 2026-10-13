import React from "react";

import { cn } from "@/lib/utils";

export type ProgressProps = React.ComponentProps<"progress">;

/**
 * Native progress bar. Defaults max to 100 so value maps to a clear fill %.
 */
export function Progress({
  className,
  ref,
  value,
  max = 100,
  ...props
}: ProgressProps) {
  const numericMax =
    typeof max === "number" && Number.isFinite(max) && max > 0 ? max : 100;
  const hasValue = value !== undefined && value !== null && `${value}` !== "";
  const numericValue = hasValue ? Number(value) : undefined;

  return (
    <progress
      ref={ref}
      {...props}
      value={hasValue ? numericValue : undefined}
      max={numericMax}
      className={cn(
        "bg-muted text-primary block h-2 w-full max-w-full min-w-0 appearance-none overflow-hidden rounded-full border-0 align-middle",
        "[&::-webkit-progress-bar]:bg-muted [&::-webkit-progress-bar]:h-full [&::-webkit-progress-bar]:w-full [&::-webkit-progress-bar]:rounded-full",
        "[&::-webkit-progress-value]:bg-primary [&::-webkit-progress-value]:h-full [&::-webkit-progress-value]:rounded-full",
        "[&::-moz-progress-bar]:bg-primary [&::-moz-progress-bar]:rounded-full",
        className,
      )}
    />
  );
}
