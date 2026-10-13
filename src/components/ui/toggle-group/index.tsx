"use client";

import React, { createContext, useContext, useState } from "react";

import { cn } from "@/lib/utils";
import { toggleVariants } from "../toggle";

type ToggleGroupContextValue = {
  value: readonly string[];
  toggle: (itemValue: string) => void;
  variant: "default" | "outline";
  size: "default" | "sm" | "lg";
  disabled: boolean;
  multiple: boolean;
};

const ToggleGroupContext = createContext<ToggleGroupContextValue | null>(null);

function useToggleGroup() {
  const context = useContext(ToggleGroupContext);

  if (!context) {
    throw new Error("ToggleGroupItem must render inside ToggleGroup.");
  }

  return context;
}

export type ToggleGroupProps = Omit<
  React.ComponentProps<"div">,
  "defaultValue" | "onChange"
> & {
  /** Allow several items pressed at once. Defaults to a single selection. */
  multiple?: boolean;
  /** Controlled pressed item values. */
  value?: readonly string[];
  /** Initial pressed item values when uncontrolled. */
  defaultValue?: readonly string[];
  onValueChange?: (value: string[]) => void;
  variant?: "default" | "outline";
  size?: "default" | "sm" | "lg";
  /** Gap between items in 4px steps. 0 joins the items into one bar. */
  spacing?: number;
  orientation?: "horizontal" | "vertical";
  disabled?: boolean;
};

/**
 * A set of toggles. Single mode (default) behaves like a segmented control
 * and lets the pressed item be turned off; `multiple` allows any combination.
 * Arrow keys move focus between items; every item stays in the Tab order.
 */
export function ToggleGroup({
  multiple = false,
  value,
  defaultValue = [],
  onValueChange,
  variant = "default",
  size = "default",
  spacing = 0,
  orientation = "horizontal",
  disabled = false,
  className,
  style,
  ref,
  onKeyDown,
  ...props
}: ToggleGroupProps) {
  const [uncontrolled, setUncontrolled] =
    useState<readonly string[]>(defaultValue);
  const current = value ?? uncontrolled;

  function toggle(itemValue: string) {
    const pressed = current.includes(itemValue);
    let next: string[];

    if (multiple) {
      next = pressed
        ? current.filter((entry) => entry !== itemValue)
        : [...current, itemValue];
    } else {
      next = pressed ? [] : [itemValue];
    }

    if (value === undefined) {
      setUncontrolled(next);
    }

    onValueChange?.(next);
  }

  return (
    <ToggleGroupContext.Provider
      value={{ value: current, toggle, variant, size, disabled, multiple }}
    >
      <div
        {...props}
        ref={ref}
        role="group"
        data-slot="toggle-group"
        data-orientation={orientation}
        data-spacing={spacing}
        data-variant={variant}
        style={{ gap: spacing * 4, ...style }}
        className={cn(
          "flex w-fit items-center",
          orientation === "vertical" && "flex-col items-stretch",
          // Joined bars share one border and only round the outer corners.
          spacing === 0 &&
            (orientation === "horizontal"
              ? "[&>[data-slot=toggle-group-item]]:rounded-none [&>[data-slot=toggle-group-item]:first-child]:rounded-s-md [&>[data-slot=toggle-group-item]:last-child]:rounded-e-md"
              : "[&>[data-slot=toggle-group-item]]:rounded-none [&>[data-slot=toggle-group-item]:first-child]:rounded-t-md [&>[data-slot=toggle-group-item]:last-child]:rounded-b-md"),
          spacing === 0 &&
            variant === "outline" &&
            (orientation === "horizontal"
              ? "[&>[data-slot=toggle-group-item]:not(:first-child)]:-ml-px"
              : "[&>[data-slot=toggle-group-item]:not(:first-child)]:-mt-px"),
          className,
        )}
        onKeyDown={(event) => {
          onKeyDown?.(event);

          if (event.defaultPrevented) {
            return;
          }

          const previousKey =
            orientation === "vertical" ? "ArrowUp" : "ArrowLeft";
          const nextKey =
            orientation === "vertical" ? "ArrowDown" : "ArrowRight";

          if (![previousKey, nextKey, "Home", "End"].includes(event.key)) {
            return;
          }

          const items = [
            ...event.currentTarget.querySelectorAll<HTMLButtonElement>(
              "[data-slot=toggle-group-item]:not(:disabled)",
            ),
          ];
          const index = items.indexOf(
            document.activeElement as HTMLButtonElement,
          );

          if (items.length === 0 || index === -1) {
            return;
          }

          event.preventDefault();

          const target =
            event.key === "Home"
              ? 0
              : event.key === "End"
                ? items.length - 1
                : event.key === nextKey
                  ? (index + 1) % items.length
                  : (index - 1 + items.length) % items.length;

          items[target]?.focus();
        }}
      />
    </ToggleGroupContext.Provider>
  );
}

export type ToggleGroupItemProps = Omit<
  React.ComponentProps<"button">,
  "value" | "aria-pressed"
> & {
  /** Unique value reported in the group's `value`. */
  value: string;
};

export function ToggleGroupItem({
  value,
  disabled,
  className,
  ref,
  onClick,
  ...props
}: ToggleGroupItemProps) {
  const group = useToggleGroup();
  const pressed = group.value.includes(value);
  const isDisabled = group.disabled || disabled;

  return (
    <button
      {...props}
      ref={ref}
      type="button"
      aria-pressed={pressed}
      data-slot="toggle-group-item"
      data-state={pressed ? "on" : "off"}
      data-value={value}
      disabled={isDisabled}
      className={cn(
        toggleVariants({ variant: group.variant, size: group.size }),
        // Raise the focused/pressed item so its ring and border sit above neighbors.
        "focus-visible:z-10",
        className,
      )}
      onClick={(event) => {
        onClick?.(event);

        if (!event.defaultPrevented && !isDisabled) {
          group.toggle(value);
        }
      }}
    />
  );
}
