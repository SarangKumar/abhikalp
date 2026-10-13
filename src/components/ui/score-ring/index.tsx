import React from "react";

import { cn } from "@/lib/utils";

export type ScoreRingSize = "xs" | "sm" | "default" | "lg";

// Pixel diameter and stroke width per size. The ring is drawn in a 100-unit
// viewBox, so `stroke` is a share of the diameter, not px.
const sizes: Record<
  ScoreRingSize,
  { box: string; stroke: number; text: string }
> = {
  xs: { box: "size-8", stroke: 12, text: "text-[10px]" },
  sm: { box: "size-12", stroke: 10, text: "text-xs" },
  default: { box: "size-16", stroke: 9, text: "text-base" },
  lg: { box: "size-24", stroke: 8, text: "text-2xl" },
};

export type ScoreRingProps = Omit<
  React.ComponentProps<"div">,
  "children" | "role"
> & {
  /** Score from 0 to `max`. Values outside the range are clamped. */
  value: number;
  /** Score that fills the whole ring. Defaults to 100. */
  max?: number;
  size?: ScoreRingSize;
  /** Ring color at a score of 0. Any CSS color. Defaults to red. */
  fromColor?: string;
  /** Ring color at the maximum score. Any CSS color. Defaults to green. */
  toColor?: string;
  /** Show the score in the middle of the ring. Defaults to true. */
  showValue?: boolean;
  /** Replaces the default score text in the middle of the ring. */
  children?: React.ReactNode;
  /** Accessible name, e.g. "Performance score". */
  label?: string;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

/**
 * A circular score meter. The stroke color is mixed between `fromColor` and
 * `toColor` by the score (`color-mix` in oklch, which passes through orange
 * and yellow for the default red to green), so 0 is `fromColor` and the max
 * is `toColor`. Pass `label` so the meter has an accessible name.
 */
export function ScoreRing({
  value,
  max = 100,
  size = "default",
  fromColor = "var(--color-red-500, #ef4444)",
  toColor = "var(--color-green-500, #22c55e)",
  showValue = true,
  label,
  children,
  className,
  style,
  ref,
  ...props
}: ScoreRingProps) {
  const safeMax = max > 0 ? max : 100;
  const score = clamp(Number.isFinite(value) ? value : 0, 0, safeMax);
  const ratio = score / safeMax;
  const { box, stroke, text } = sizes[size];
  const radius = 50 - stroke / 2;
  const circumference = 2 * Math.PI * radius;
  const color = `color-mix(in oklch, ${toColor} ${Math.round(ratio * 100)}%, ${fromColor})`;

  return (
    <div
      {...props}
      ref={ref}
      role="meter"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={safeMax}
      aria-valuenow={score}
      data-slot="score-ring"
      data-size={size}
      style={style}
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center",
        box,
        className,
      )}
    >
      <svg
        viewBox="0 0 100 100"
        aria-hidden="true"
        className="size-full -rotate-90"
        fill="none"
      >
        <circle
          cx="50"
          cy="50"
          r={radius}
          stroke="currentColor"
          strokeWidth={stroke}
          className="text-muted"
        />
        <circle
          data-slot="score-ring-indicator"
          cx="50"
          cy="50"
          r={radius}
          // Inline style (not the stroke attribute) so var() colors resolve.
          style={{ stroke: color }}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - ratio)}
          className="transition-[stroke-dashoffset,stroke] duration-500 ease-out motion-reduce:transition-none"
        />
      </svg>
      {children !== undefined || showValue ? (
        <span
          className={cn(
            "text-foreground absolute inset-0 flex items-center justify-center leading-none font-semibold tabular-nums",
            text,
          )}
        >
          {children ?? Math.round(score)}
        </span>
      ) : null}
    </div>
  );
}
