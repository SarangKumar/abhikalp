"use client";

import React, {
  useCallback,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

import { cn } from "@/lib/utils";

export type TextareaProps = React.ComponentProps<"textarea"> & {
  /** Show a `length/maxLength` counter below the field, aligned right. */
  showCount?: boolean;
  /** Classes for the wrapper rendered when `showCount` is set. */
  containerClassName?: string;
  /**
   * Grow with the content up to this many rows, then scroll. `rows` sets the
   * starting (minimum) height and defaults to 1 while auto-growing.
   */
  maxRows?: number;
};

const textareaClasses =
  "border-input bg-background text-foreground placeholder:text-muted-foreground focus-visible:ring-ring focus-visible:ring-offset-background aria-invalid:border-destructive aria-invalid:ring-destructive/20 flex min-h-20 w-full resize-y rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50";

function assignRef<T>(ref: React.Ref<T> | undefined, node: T | null) {
  if (typeof ref === "function") {
    ref(node);
  } else if (ref) {
    ref.current = node;
  }
}

export function Textarea({
  className,
  containerClassName,
  showCount = false,
  maxRows,
  rows,
  ref,
  onChange,
  ...props
}: TextareaProps) {
  const countId = useId();
  const innerRef = useRef<HTMLTextAreaElement | null>(null);
  const { value, defaultValue, maxLength } = props;
  const [uncontrolledLength, setUncontrolledLength] = useState(
    () => String(defaultValue ?? "").length,
  );
  const autoGrow = maxRows !== undefined && maxRows > 0;
  const minRows = autoGrow ? Math.min(rows ?? 1, maxRows) : rows;

  // Measure in rows of the computed line height so the cap follows the font
  // size; height includes padding and border (box-sizing: border-box).
  const resize = useCallback(() => {
    const node = innerRef.current;

    if (!node || !autoGrow) {
      return;
    }

    const style = window.getComputedStyle(node);
    const fontSize = parseFloat(style.fontSize) || 14;
    const lineHeight = parseFloat(style.lineHeight) || fontSize * 1.5;
    const border =
      (parseFloat(style.borderTopWidth) || 0) +
      (parseFloat(style.borderBottomWidth) || 0);
    const padding =
      (parseFloat(style.paddingTop) || 0) +
      (parseFloat(style.paddingBottom) || 0);
    const minHeight = lineHeight * (minRows ?? 1) + padding + border;
    const maxHeight = lineHeight * maxRows + padding + border;

    node.style.height = "auto";
    const contentHeight = node.scrollHeight + border;
    node.style.height = `${Math.min(Math.max(contentHeight, minHeight), maxHeight)}px`;
    node.style.overflowY = contentHeight > maxHeight ? "auto" : "hidden";
  }, [autoGrow, maxRows, minRows]);

  useLayoutEffect(() => {
    resize();
  }, [resize, value]);

  const field = (
    <textarea
      ref={(node) => {
        innerRef.current = node;
        assignRef(ref, node);
      }}
      rows={minRows}
      data-auto-grow={autoGrow ? "" : undefined}
      className={cn(
        textareaClasses,
        autoGrow && "min-h-0 resize-none",
        className,
      )}
      {...props}
      aria-describedby={
        showCount
          ? [props["aria-describedby"], countId].filter(Boolean).join(" ")
          : props["aria-describedby"]
      }
      onChange={(event) => {
        setUncontrolledLength(event.target.value.length);
        resize();
        onChange?.(event);
      }}
    />
  );

  if (!showCount) {
    return field;
  }

  const length =
    value !== undefined ? String(value).length : uncontrolledLength;
  const atLimit = maxLength !== undefined && length >= maxLength;

  return (
    <div className={cn("flex w-full flex-col gap-1.5", containerClassName)}>
      {field}
      <p
        id={countId}
        data-slot="textarea-count"
        className={cn(
          "text-muted-foreground self-end text-xs tabular-nums",
          atLimit && "text-destructive",
        )}
      >
        {length}
        {maxLength !== undefined ? `/${maxLength}` : null}
      </p>
    </div>
  );
}
