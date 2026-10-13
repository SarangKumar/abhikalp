import React from "react";

import { cn } from "@/lib/utils";

export type ScrollAreaOrientation = "vertical" | "horizontal" | "both";

const overflowClass: Record<ScrollAreaOrientation, string> = {
  vertical: "overflow-y-auto overflow-x-hidden",
  horizontal: "overflow-x-auto overflow-y-hidden",
  both: "overflow-auto",
};

const scrollbarClass =
  "[scrollbar-width:thin] [scrollbar-color:var(--border)_transparent] [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-md [&::-webkit-scrollbar-thumb]:bg-border";

export function ScrollArea({
  className,
  orientation = "vertical",
  tabIndex,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  orientation?: ScrollAreaOrientation;
}) {
  return (
    <div
      data-scroll-area=""
      data-orientation={orientation}
      tabIndex={tabIndex ?? 0}
      className={cn(
        "relative min-h-0 min-w-0 overscroll-contain focus-visible:outline-none",
        overflowClass[orientation],
        scrollbarClass,
        className,
      )}
      {...props}
    >
      {children}
      <ScrollBar
        orientation={orientation === "horizontal" ? "horizontal" : "vertical"}
      />
    </div>
  );
}

export function ScrollBar({
  className,
  orientation = "vertical",
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  orientation?: "vertical" | "horizontal";
}) {
  return (
    <div
      aria-hidden="true"
      data-scroll-bar=""
      data-orientation={orientation}
      className={cn("pointer-events-none", className)}
      {...props}
    />
  );
}
