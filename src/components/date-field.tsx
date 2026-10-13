"use client";

import { X } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { DatePicker, type DatePickerProps } from "@/components/ui/date-picker";
import { cn } from "@/lib/utils";

/**
 * Vinyaas DatePicker with an optional clear button.
 * The picker treats `value === undefined` as uncontrolled, so clearing remounts it.
 */
export function DateField({
  value,
  onChange,
  clearable = true,
  className,
  ...props
}: Omit<DatePickerProps, "value" | "onValueChange" | "defaultValue"> & {
  value: Date | null | undefined;
  onChange: (date: Date | null) => void;
  clearable?: boolean;
}) {
  const [generation, setGeneration] = useState(0);
  return (
    <div className={cn("relative flex items-center", className)}>
      <DatePicker
        key={value ? "set" : `empty-${generation}`}
        value={value ?? undefined}
        onValueChange={(d) => onChange(d ?? null)}
        formatString="d MMM yyyy"
        className="w-full"
        {...props}
      />
      {clearable && value && !props.disabled && (
        <Button
          type="button"
          size="icon-xs"
          variant="ghost"
          aria-label="Clear date"
          className="absolute right-1.5"
          onClick={() => {
            setGeneration((g) => g + 1);
            onChange(null);
          }}
        >
          <X className="size-3.5" />
        </Button>
      )}
    </div>
  );
}

/** "YYYY-MM-DD"/ISO string <-> Date helpers for API payloads. */
export const toDate = (iso: string | null | undefined) =>
  iso ? new Date(iso) : null;
export const toIso = (d: Date | null) => (d ? d.toISOString() : null);
