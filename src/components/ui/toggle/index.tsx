"use client";

import React, { useState } from "react";

import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// Heights match Button (xs h-7, sm h-8, default h-9, lg h-10) so a Toggle
// lines up with buttons and inputs of the same size. The border stays inside
// the box, so default and outline toggles are the same size.
export const toggleVariants = cva(
  "inline-flex box-border shrink-0 cursor-pointer items-center justify-center gap-2 rounded-md border border-transparent text-sm leading-none font-medium whitespace-nowrap transition-[color,background-color,border-color] duration-200 hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 aria-pressed:bg-accent aria-pressed:text-accent-foreground motion-reduce:transition-none [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        outline:
          "border-input bg-transparent hover:bg-accent hover:text-accent-foreground",
      },
      size: {
        default: "h-9 min-w-9 px-2.5",
        sm: "h-8 min-w-8 px-2",
        lg: "h-10 min-w-10 px-3",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export type ToggleProps = Omit<
  React.ComponentProps<"button">,
  "aria-pressed" | "onChange"
> &
  VariantProps<typeof toggleVariants> & {
    /** Controlled pressed state. */
    pressed?: boolean;
    /** Initial pressed state when uncontrolled. */
    defaultPressed?: boolean;
    onPressedChange?: (pressed: boolean) => void;
  };

/**
 * A two-state button. It is a native `<button>` with `aria-pressed`, so give
 * icon-only toggles an `aria-label`.
 */
export function Toggle({
  pressed,
  defaultPressed = false,
  onPressedChange,
  variant,
  size,
  disabled,
  className,
  ref,
  onClick,
  ...props
}: ToggleProps) {
  const [uncontrolled, setUncontrolled] = useState(defaultPressed);
  const isPressed = pressed ?? uncontrolled;

  return (
    <button
      {...props}
      ref={ref}
      type="button"
      aria-pressed={isPressed}
      data-slot="toggle"
      data-state={isPressed ? "on" : "off"}
      disabled={disabled}
      className={cn(toggleVariants({ variant, size }), className)}
      onClick={(event) => {
        onClick?.(event);

        if (event.defaultPrevented || disabled) {
          return;
        }

        const next = !isPressed;

        if (pressed === undefined) {
          setUncontrolled(next);
        }

        onPressedChange?.(next);
      }}
    />
  );
}
