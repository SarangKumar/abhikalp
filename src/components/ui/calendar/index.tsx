"use client";

import * as React from "react";
import {
  DayPicker,
  type DayPickerProps,
  type DropdownProps,
} from "react-day-picker";

import { cn } from "@/lib/utils";
import { buttonVariants } from "../button";

export type CalendarProps = DayPickerProps;

/**
 * Accessible month calendar built on react-day-picker.
 * Supports single and range selection with Vinyaas tokens,
 * native month/year selects, and previous/next navigation.
 */
export function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = "dropdown",
  formatters,
  components,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      captionLayout={captionLayout}
      className={cn(
        "border-border bg-background text-foreground w-fit rounded-md p-3",
        className,
      )}
      formatters={{
        // Abbreviated months keep caption selects readable beside prev/next.
        formatMonthDropdown: (month) =>
          month.toLocaleString("en-US", { month: "short" }),
        ...formatters,
      }}
      classNames={{
        root: cn("w-fit", classNames?.root),
        months: cn(
          "relative flex flex-col gap-4 sm:flex-row",
          classNames?.months,
        ),
        month: cn(
          // Exactly seven size-9 day columns — caption must fit this width.
          "flex w-[15.75rem] flex-col gap-3",
          classNames?.month,
        ),
        month_caption: cn(
          "relative flex h-9 w-full items-center justify-center gap-1.5 px-8",
          classNames?.month_caption,
        ),
        caption_label: cn(
          "text-foreground text-sm font-medium",
          classNames?.caption_label,
        ),
        dropdowns: cn(
          // Single caption row with nav arrows; stay above the nav overlay.
          "relative z-30 flex h-9 min-w-0 flex-1 items-center justify-center gap-1.5",
          classNames?.dropdowns,
        ),
        dropdown_root: cn("relative min-w-0", classNames?.dropdown_root),
        dropdown: cn(classNames?.dropdown),
        months_dropdown: cn(classNames?.months_dropdown),
        years_dropdown: cn(classNames?.years_dropdown),
        nav: cn(
          "pointer-events-none absolute inset-x-0 top-0 z-20 flex h-9 items-center justify-between",
          classNames?.nav,
        ),
        button_previous: cn(
          buttonVariants({ variant: "outline", size: "icon-sm" }),
          "pointer-events-auto relative z-20 size-8 shrink-0",
          classNames?.button_previous,
        ),
        button_next: cn(
          buttonVariants({ variant: "outline", size: "icon-sm" }),
          "pointer-events-auto relative z-20 size-8 shrink-0",
          classNames?.button_next,
        ),
        month_grid: cn("w-[15.75rem] border-collapse", classNames?.month_grid),
        weekdays: cn("flex w-[15.75rem]", classNames?.weekdays),
        weekday: cn(
          "text-muted-foreground size-9 shrink-0 text-center text-xs font-normal",
          classNames?.weekday,
        ),
        week: cn("mt-1.5 flex w-[15.75rem]", classNames?.week),
        day: cn(
          // Fixed square cell — keeps selected/hover fills the same size.
          "relative size-9 shrink-0 p-0 text-center text-sm focus-within:relative focus-within:z-20",
          "[&:has([aria-selected])]:bg-accent [&:has([aria-selected])]:rounded-md",
          "[&:has([aria-selected].day-range-end)]:rounded-r-md",
          "[&:has([aria-selected].day-range-start)]:rounded-l-md",
          "[&:has([aria-selected].day-outside)]:bg-accent/50",
          "first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md",
          classNames?.day,
        ),
        day_button: cn(
          buttonVariants({ variant: "ghost" }),
          // Explicit square — avoid icon-sm max-* clamps that fight size-9.
          "size-9 min-h-9 min-w-9 max-h-9 max-w-9 rounded-md p-0 font-normal aria-selected:opacity-100",
          "hover:bg-accent hover:text-accent-foreground",
          "focus-visible:rounded-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          classNames?.day_button,
        ),
        range_start: cn(
          "day-range-start bg-primary text-primary-foreground rounded-l-md",
          classNames?.range_start,
        ),
        range_end: cn(
          "day-range-end bg-primary text-primary-foreground rounded-r-md",
          classNames?.range_end,
        ),
        range_middle: cn(
          "aria-selected:bg-accent aria-selected:text-accent-foreground rounded-none",
          classNames?.range_middle,
        ),
        selected: cn(
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground rounded-md",
          classNames?.selected,
        ),
        today: cn(
          "bg-accent text-accent-foreground rounded-md",
          classNames?.today,
        ),
        outside: cn(
          "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-40",
          classNames?.outside,
        ),
        disabled: cn("text-muted-foreground opacity-40", classNames?.disabled),
        hidden: cn("invisible", classNames?.hidden),
        focused: cn(
          "relative z-10 rounded-md ring-2 ring-ring ring-offset-2 ring-offset-background",
          classNames?.focused,
        ),
      }}
      components={{
        Dropdown: CalendarDropdown,
        Chevron: ({
          orientation,
          className: chevronClassName,
          ...chevronProps
        }) => {
          if (orientation === "left") {
            return (
              <ChevronLeftIcon
                className={cn("size-4", chevronClassName)}
                {...chevronProps}
              />
            );
          }

          if (orientation === "right") {
            return (
              <ChevronRightIcon
                className={cn("size-4", chevronClassName)}
                {...chevronProps}
              />
            );
          }

          return (
            <ChevronDownIcon
              className={cn("size-4", chevronClassName)}
              {...chevronProps}
            />
          );
        },
        ...components,
      }}
      {...props}
    />
  );
}

/**
 * Native month/year <select> for the caption row.
 * Widths are tuned so "Sep"/"2026" never clip beside the chevron,
 * while still fitting between the prev/next buttons on a 7×size-9 grid.
 */
function CalendarDropdown({
  options,
  className,
  "aria-label": ariaLabel,
  value,
  ...selectProps
}: DropdownProps) {
  const isYear = /year/i.test(ariaLabel ?? "");

  return (
    <div
      data-slot={isYear ? "calendar-year-select" : "calendar-month-select"}
      className={cn(
        "border-input bg-background relative inline-flex h-8 shrink-0 items-center rounded-md border",
        className,
        // Force readable widths after any DayPicker-injected className.
        isYear ? "w-[5.5rem]" : "w-[5rem]",
      )}
    >
      <select
        {...selectProps}
        aria-label={ariaLabel}
        value={
          value === undefined || value === null ? undefined : String(value)
        }
        className={cn(
          "text-foreground h-full w-full cursor-pointer bg-transparent py-0 text-sm outline-none",
          // Reserve chevron gutter; keep label fully visible.
          "appearance-none [-moz-appearance:none] [-webkit-appearance:none]",
          "pr-6 pl-2.5",
          "focus-visible:ring-ring focus-visible:ring-offset-background focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
          "disabled:cursor-not-allowed disabled:opacity-50",
        )}
      >
        {options?.map((option) => (
          <option
            key={option.value}
            value={String(option.value)}
            disabled={option.disabled}
          >
            {option.label}
          </option>
        ))}
      </select>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-0 flex w-6 items-center justify-center"
      >
        <ChevronDownIcon className="text-muted-foreground size-3.5 opacity-70" />
      </span>
    </div>
  );
}

function ChevronLeftIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="m15 6-6 6 6 6" />
    </svg>
  );
}

function ChevronRightIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="m9 6 6 6-6 6" />
    </svg>
  );
}

function ChevronDownIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}
