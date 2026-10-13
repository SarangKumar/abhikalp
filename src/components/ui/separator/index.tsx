import React from "react";

import { cn } from "@/lib/utils";

export type SeparatorProps = {
  orientation?: "horizontal" | "vertical";
} & React.ComponentProps<"div">;

export function Separator({
  orientation = "horizontal",
  className,
  ref,
  ...props
}: SeparatorProps) {
  if (orientation === "vertical") {
    return (
      <div
        ref={ref}
        {...props}
        role="separator"
        aria-orientation="vertical"
        className={cn("bg-border inline-block h-4 w-px shrink-0", className)}
      />
    );
  }

  return (
    <hr
      {...props}
      ref={ref as React.Ref<HTMLHRElement>}
      className={cn("bg-border my-0 h-px w-full shrink-0 border-0", className)}
    />
  );
}
