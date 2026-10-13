"use client";

import React, { useEffect, useRef } from "react";

import { cn } from "@/lib/utils";

export type CheckboxProps = React.ComponentProps<"input"> & {
  indeterminate?: boolean;
};

export function Checkbox({
  className,
  ref,
  indeterminate,
  ...props
}: CheckboxProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.indeterminate = Boolean(indeterminate);
    }
  }, [indeterminate]);

  return (
    <span className="relative inline-flex size-4 shrink-0">
      <input
        {...props}
        ref={(node) => {
          inputRef.current = node;

          if (typeof ref === "function") {
            ref(node);
          } else if (ref) {
            ref.current = node;
          }
        }}
        type="checkbox"
        className={cn(
          "peer border-input bg-background accent-primary checked:border-primary checked:bg-primary indeterminate:border-primary indeterminate:bg-primary focus-visible:border-primary focus-visible:ring-ring focus-visible:ring-offset-background size-4 cursor-pointer appearance-none rounded-lg border focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
      />
      <svg
        viewBox="0 0 16 16"
        aria-hidden="true"
        className="text-primary-foreground pointer-events-none absolute inset-0 opacity-0 peer-checked:opacity-100 peer-indeterminate:opacity-0"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M3.5 8.5 6.5 11.5 12.5 4.5" />
      </svg>
      <span
        aria-hidden="true"
        className="bg-primary-foreground pointer-events-none absolute top-1/2 left-1/2 h-px w-2 -translate-x-1/2 -translate-y-1/2 opacity-0 peer-indeterminate:opacity-100"
      />
    </span>
  );
}
