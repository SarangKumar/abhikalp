"use client";

import React, { useState } from "react";

import { cn } from "@/lib/utils";

export type SwitchProps = Omit<
  React.ComponentProps<"button">,
  "children" | "role" | "aria-checked" | "onChange"
> & {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
};

export function Switch({
  checked,
  defaultChecked = false,
  onCheckedChange,
  disabled,
  className,
  ref,
  onClick,
  ...props
}: SwitchProps) {
  const [uncontrolled, setUncontrolled] = useState(defaultChecked);
  const isChecked = checked ?? uncontrolled;

  return (
    <button
      {...props}
      ref={ref}
      type="button"
      role="switch"
      aria-checked={isChecked}
      data-state={isChecked ? "checked" : "unchecked"}
      disabled={disabled}
      className={cn(
        "border-input bg-muted focus-visible:ring-ring focus-visible:ring-offset-background data-[state=checked]:bg-primary inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transition-none",
        className,
      )}
      onClick={(event) => {
        onClick?.(event);

        if (event.defaultPrevented || disabled) {
          return;
        }

        const next = !isChecked;

        if (checked === undefined) {
          setUncontrolled(next);
        }

        onCheckedChange?.(next);
      }}
    >
      <span
        aria-hidden="true"
        className={cn(
          "bg-background pointer-events-none block size-4 rounded-full transition-transform motion-reduce:transition-none",
          isChecked ? "translate-x-4" : "translate-x-0.5",
        )}
      />
    </button>
  );
}
