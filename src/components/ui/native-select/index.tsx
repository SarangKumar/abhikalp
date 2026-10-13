import React from "react";

import { cn } from "@/lib/utils";

export type NativeSelectProps = React.ComponentProps<"select">;

/**
 * Decorative chevron. The hit target must stay on the native <select>.
 * Wrap the SVG — Safari/WebKit can ignore pointer-events on bare SVG roots.
 */
function SelectChevron() {
  return (
    <span
      aria-hidden="true"
      data-slot="native-select-icon"
      className="pointer-events-none absolute inset-y-0 right-0 flex w-9 items-center justify-center"
    >
      <svg
        viewBox="0 0 24 24"
        className="text-muted-foreground size-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </span>
  );
}

export function NativeSelect({
  className,
  ref,
  multiple,
  size,
  ...props
}: NativeSelectProps) {
  const listed = Boolean(multiple) || (size !== undefined && Number(size) > 1);

  if (listed) {
    return (
      <select
        ref={ref}
        multiple={multiple}
        size={size}
        className={cn(
          "border-input bg-background text-foreground focus-visible:ring-ring focus-visible:ring-offset-background h-auto w-full min-w-0 rounded-md border px-3 py-1 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        {...props}
      />
    );
  }

  // Width / sizing classes belong on the wrapper so the chevron stays inside
  // the control at narrow widths (className used to land only on <select>).
  return (
    <div
      data-slot="native-select-wrapper"
      className={cn("relative w-full min-w-0", className)}
    >
      <select
        ref={ref}
        multiple={multiple}
        size={size}
        data-slot="native-select"
        className={cn(
          "border-input bg-background text-foreground focus-visible:ring-ring focus-visible:ring-offset-background box-border h-9 max-h-9 min-h-9 w-full min-w-0 rounded-md border py-0 pr-9 pl-3 text-sm leading-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
          // appearance-none alone is not always enough on WebKit — keep the prefix.
          "appearance-none [-webkit-appearance:none]",
        )}
        {...props}
      />
      <SelectChevron />
    </div>
  );
}

export function NativeSelectOption({
  className,
  ...props
}: React.ComponentProps<"option">) {
  return (
    <option
      className={cn("bg-[Canvas] text-[CanvasText]", className)}
      {...props}
    />
  );
}

export function NativeSelectOptGroup({
  className,
  ...props
}: React.ComponentProps<"optgroup">) {
  return (
    <optgroup
      className={cn("bg-[Canvas] text-[CanvasText]", className)}
      {...props}
    />
  );
}
