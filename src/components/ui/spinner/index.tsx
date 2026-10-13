import React from "react";

import { cn } from "@/lib/utils";

export function Spinner({
  className,
  label = "Loading",
  ...props
}: React.SVGAttributes<SVGSVGElement> & {
  label?: string;
}) {
  return (
    <span className="inline-flex" role={label ? "status" : undefined}>
      {label ? <span className="sr-only">{label}</span> : null}
      <svg
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
        className={cn(
          "size-4 animate-spin text-current motion-reduce:animate-none",
          className,
        )}
        {...props}
      >
        <circle
          cx="12"
          cy="12"
          r="9"
          stroke="currentColor"
          strokeWidth="2"
          className="opacity-25"
        />
        <path
          d="M21 12a9 9 0 0 0-9-9"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}
