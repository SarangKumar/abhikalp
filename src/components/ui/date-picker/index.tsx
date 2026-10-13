"use client";

import * as React from "react";
import { format } from "date-fns";

import { cn } from "@/lib/utils";
import { Button } from "../button";
import { Calendar } from "../calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../popover";

export type DatePickerProps = {
  value?: Date;
  defaultValue?: Date;
  onValueChange?: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  /** date-fns format string for the trigger label. */
  formatString?: string;
  id?: string;
  className?: string;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Forwarded to Calendar `disabled` matcher. */
  disabledDates?: React.ComponentProps<typeof Calendar>["disabled"];
  "aria-label"?: string;
  "aria-describedby"?: string;
  "aria-invalid"?: boolean | "true" | "false";
  "data-invalid"?: string;
};

/**
 * Button + Popover + Calendar composition for picking a single date.
 */
export function DatePicker({
  value,
  defaultValue,
  onValueChange,
  placeholder = "Pick a date",
  disabled = false,
  formatString = "PPP",
  id,
  className,
  open,
  defaultOpen,
  onOpenChange,
  disabledDates,
  "aria-label": ariaLabel,
  "aria-describedby": ariaDescribedBy,
  "aria-invalid": ariaInvalid,
  "data-invalid": dataInvalid,
}: DatePickerProps) {
  const [uncontrolled, setUncontrolled] = React.useState<Date | undefined>(
    defaultValue,
  );
  const isControlled = value !== undefined;
  const selected = isControlled ? value : uncontrolled;

  function setSelected(next: Date | undefined) {
    if (!isControlled) {
      setUncontrolled(next);
    }
    onValueChange?.(next);
  }

  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(
    defaultOpen ?? false,
  );
  const isOpenControlled = open !== undefined;
  const isOpen = isOpenControlled ? open : uncontrolledOpen;

  function setOpen(next: boolean) {
    if (!isOpenControlled) {
      setUncontrolledOpen(next);
    }
    onOpenChange?.(next);
  }

  const label = selected ? format(selected, formatString) : placeholder;
  const accessibleName =
    ariaLabel ?? (selected ? `Selected date ${label}` : placeholder);

  return (
    <Popover open={isOpen} onOpenChange={setOpen}>
      <PopoverTrigger>
        <Button
          id={id}
          type="button"
          variant="outline"
          disabled={disabled}
          aria-label={accessibleName}
          aria-describedby={ariaDescribedBy}
          aria-invalid={ariaInvalid}
          data-invalid={dataInvalid}
          data-empty={!selected ? "" : undefined}
          className={cn(
            "inline-flex w-full min-w-0 items-center justify-start gap-2 text-left font-normal",
            !selected && "text-muted-foreground",
            className,
          )}
        >
          <CalendarGlyph className="size-4 shrink-0 opacity-70" />
          <span className="truncate">{label}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selected}
          onSelect={(date) => {
            setSelected(date);
            if (date) {
              setOpen(false);
            }
          }}
          disabled={disabledDates}
          autoFocus
        />
      </PopoverContent>
    </Popover>
  );
}

function CalendarGlyph(props: React.ComponentProps<"svg">) {
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
      <path d="M8 2v4" />
      <path d="M16 2v4" />
      <rect width="18" height="18" x="3" y="4" rx="2" />
      <path d="M3 10h18" />
    </svg>
  );
}
