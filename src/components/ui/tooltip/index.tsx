"use client";

import React, { useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { cn } from "@/lib/utils";

import "./tooltip.css";

export type TooltipSide = "top" | "right" | "bottom" | "left";

type TriggerProps = React.HTMLAttributes<HTMLElement> & {
  ref?: React.Ref<HTMLElement>;
};

function arrowStyle(side: TooltipSide, arrow = 12): React.CSSProperties {
  const size = 6;

  if (side === "top" || side === "bottom") {
    return {
      left: arrow,
      borderLeftWidth: size,
      borderRightWidth: size,
      borderTopWidth: side === "top" ? size : 0,
      borderBottomWidth: side === "bottom" ? size : 0,
    };
  }

  return {
    top: arrow,
    borderTopWidth: size,
    borderBottomWidth: size,
    borderLeftWidth: side === "left" ? size : 0,
    borderRightWidth: side === "right" ? size : 0,
  };
}

export function Tooltip({
  children,
  content,
  side = "top",
  delayDuration = 400,
  className,
}: {
  children: React.ReactElement<TriggerProps>;
  content: React.ReactNode;
  side?: TooltipSide;
  delayDuration?: number;
  className?: string;
}) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [point, setPoint] = useState<{
    top: number;
    left: number;
    side: TooltipSide;
    arrow: number;
  } | null>(null);
  const rootRef = useRef<HTMLSpanElement>(null);
  const tipRef = useRef<HTMLSpanElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function clearTimer() {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  }

  function show(immediate: boolean) {
    clearTimer();

    if (immediate || delayDuration <= 0) {
      setOpen(true);
      return;
    }

    timer.current = setTimeout(() => setOpen(true), delayDuration);
  }

  function hide(nextFocus: EventTarget | null) {
    clearTimer();

    if (nextFocus instanceof Node && rootRef.current?.contains(nextFocus)) {
      return;
    }

    setOpen(false);
  }

  useLayoutEffect(() => {
    if (!open) {
      return;
    }

    const arrowSize = 6;

    function place() {
      const triggerNode = rootRef.current;
      const tipNode = tipRef.current;

      if (!triggerNode || !tipNode) {
        return;
      }

      const trigger = triggerNode.getBoundingClientRect();
      const tip = tipNode.getBoundingClientRect();
      const gap = arrowSize;
      let nextSide = side;

      if (
        side === "top" &&
        trigger.top - tip.height - gap < 8 &&
        window.innerHeight - trigger.bottom > trigger.top
      ) {
        nextSide = "bottom";
      } else if (
        side === "bottom" &&
        trigger.bottom + tip.height + gap > window.innerHeight - 8 &&
        trigger.top > window.innerHeight - trigger.bottom
      ) {
        nextSide = "top";
      } else if (
        side === "left" &&
        trigger.left - tip.width - gap < 8 &&
        window.innerWidth - trigger.right > trigger.left
      ) {
        nextSide = "right";
      } else if (
        side === "right" &&
        trigger.right + tip.width + gap > window.innerWidth - 8 &&
        trigger.left > window.innerWidth - trigger.right
      ) {
        nextSide = "left";
      }

      let top = trigger.top - tip.height - gap;
      let left = trigger.left + trigger.width / 2 - tip.width / 2;

      if (nextSide === "bottom") {
        top = trigger.bottom + gap;
      }

      if (nextSide === "left") {
        top = trigger.top + trigger.height / 2 - tip.height / 2;
        left = trigger.left - tip.width - gap;
      }

      if (nextSide === "right") {
        top = trigger.top + trigger.height / 2 - tip.height / 2;
        left = trigger.right + gap;
      }

      left = Math.min(Math.max(8, left), window.innerWidth - tip.width - 8);
      top = Math.min(Math.max(8, top), window.innerHeight - tip.height - 8);

      const along =
        nextSide === "left" || nextSide === "right"
          ? trigger.top + trigger.height / 2 - top
          : trigger.left + trigger.width / 2 - left;
      const limit =
        nextSide === "left" || nextSide === "right" ? tip.height : tip.width;
      const arrow = Math.min(Math.max(12, along), Math.max(12, limit - 12));

      setPoint({ top, left, side: nextSide, arrow });
    }

    place();
    const scrollers: EventTarget[] = [window];
    let parent = rootRef.current?.parentElement ?? null;

    while (parent) {
      const style = getComputedStyle(parent);
      const overflow = `${style.overflow}${style.overflowX}${style.overflowY}`;

      if (/(auto|scroll)/.test(overflow)) {
        scrollers.push(parent);
      }

      parent = parent.parentElement;
    }

    for (const scroller of scrollers) {
      scroller.addEventListener("scroll", place);
    }

    window.addEventListener("resize", place);

    return () => {
      for (const scroller of scrollers) {
        scroller.removeEventListener("scroll", place);
      }

      window.removeEventListener("resize", place);
    };
  }, [open, side, content]);

  const child = React.cloneElement(children, {
    "aria-describedby": open ? id : undefined,
    onKeyDown: (event: React.KeyboardEvent<HTMLElement>) => {
      children.props.onKeyDown?.(event);

      if (event.key === "Escape") {
        setOpen(false);
      }
    },
  });

  return (
    <span
      ref={rootRef}
      className="inline-flex"
      onMouseEnter={() => show(false)}
      onMouseLeave={() => {
        if (rootRef.current?.contains(document.activeElement)) {
          return;
        }

        hide(null);
      }}
      onFocus={() => show(true)}
      onBlur={(event) => hide(event.relatedTarget)}
    >
      {child}
      {open
        ? createPortal(
            <span
              ref={tipRef}
              id={id}
              role="tooltip"
              data-side={point?.side ?? side}
              style={{
                position: "fixed",
                top: point?.top ?? -9999,
                left: point?.left ?? -9999,
              }}
              className={cn(
                "bg-foreground text-background vinyaas-tooltip-in pointer-events-none z-50 max-w-xs rounded-md px-2 py-1 text-sm",
                className,
              )}
            >
              {content}
              <span
                data-tooltip-arrow=""
                aria-hidden="true"
                className={cn(
                  "pointer-events-none absolute border-solid",
                  (point?.side ?? side) === "top" &&
                    "border-t-foreground bottom-0 -translate-x-1/2 translate-y-full border-b-0 border-x-transparent",
                  (point?.side ?? side) === "bottom" &&
                    "border-b-foreground top-0 -translate-x-1/2 -translate-y-full border-t-0 border-x-transparent",
                  (point?.side ?? side) === "left" &&
                    "border-l-foreground right-0 translate-x-full -translate-y-1/2 border-r-0 border-y-transparent",
                  (point?.side ?? side) === "right" &&
                    "border-r-foreground left-0 -translate-x-full -translate-y-1/2 border-l-0 border-y-transparent",
                )}
                style={arrowStyle(point?.side ?? side, point?.arrow)}
              />
            </span>,
            document.body,
          )
        : null}
    </span>
  );
}
