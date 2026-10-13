"use client";

import React, {
  useCallback,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";

import { cn } from "@/lib/utils";

export type HoverCardSide = "top" | "right" | "bottom" | "left";
export type HoverCardAlign = "start" | "center" | "end";

type HoverCardContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
  scheduleOpen: () => void;
  scheduleClose: () => void;
  cancelTimers: () => void;
  contentId: string;
  triggerRef: React.RefObject<HTMLElement | null>;
};

const HoverCardContext = React.createContext<HoverCardContextValue | null>(
  null,
);

function assignRef(
  ref: React.Ref<HTMLElement> | undefined,
  node: HTMLElement | null,
) {
  if (typeof ref === "function") {
    ref(node);
    return;
  }

  if (ref) {
    ref.current = node;
  }
}

function useHoverCard() {
  const context = useContext(HoverCardContext);

  if (!context) {
    throw new Error("Hover card components must render inside HoverCard.");
  }

  return context;
}

export function HoverCard({
  children,
  open,
  defaultOpen = false,
  openDelay = 200,
  closeDelay = 150,
  onOpenChange,
}: {
  children: React.ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  openDelay?: number;
  closeDelay?: number;
  onOpenChange?: (open: boolean) => void;
}) {
  const [uncontrolled, setUncontrolled] = useState(defaultOpen);
  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : uncontrolled;
  const triggerRef = useRef<HTMLElement>(null);
  const contentId = useId();
  const openTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setOpen = useCallback(
    (next: boolean) => {
      if (!isControlled) {
        setUncontrolled(next);
      }

      onOpenChange?.(next);
    },
    [isControlled, onOpenChange],
  );

  const cancelTimers = useCallback(() => {
    if (openTimer.current) {
      clearTimeout(openTimer.current);
      openTimer.current = null;
    }

    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }, []);

  const scheduleOpen = useCallback(() => {
    cancelTimers();

    if (openDelay <= 0) {
      setOpen(true);
      return;
    }

    openTimer.current = setTimeout(() => setOpen(true), openDelay);
  }, [cancelTimers, openDelay, setOpen]);

  const scheduleClose = useCallback(() => {
    cancelTimers();

    if (closeDelay <= 0) {
      setOpen(false);
      return;
    }

    closeTimer.current = setTimeout(() => setOpen(false), closeDelay);
  }, [cancelTimers, closeDelay, setOpen]);

  useEffect(() => cancelTimers, [cancelTimers]);

  return (
    <HoverCardContext.Provider
      value={{
        open: isOpen,
        setOpen,
        scheduleOpen,
        scheduleClose,
        cancelTimers,
        contentId,
        triggerRef,
      }}
    >
      {children}
    </HoverCardContext.Provider>
  );
}

type TriggerElementProps = React.HTMLAttributes<HTMLElement> & {
  ref?: React.Ref<HTMLElement>;
};

export function HoverCardTrigger({
  children,
}: {
  children: React.ReactElement<TriggerElementProps>;
}) {
  const { open, scheduleOpen, scheduleClose, contentId, triggerRef } =
    useHoverCard();

  return React.cloneElement(children, {
    "aria-expanded": open,
    "aria-controls": open ? contentId : undefined,
    "aria-haspopup": "dialog",
    ref: (node: HTMLElement | null) => {
      triggerRef.current = node;
      assignRef(children.props.ref, node);
    },
    onMouseEnter: (event: React.MouseEvent<HTMLElement>) => {
      children.props.onMouseEnter?.(event);

      if (!event.defaultPrevented) {
        scheduleOpen();
      }
    },
    onMouseLeave: (event: React.MouseEvent<HTMLElement>) => {
      children.props.onMouseLeave?.(event);

      if (!event.defaultPrevented) {
        scheduleClose();
      }
    },
    onFocus: (event: React.FocusEvent<HTMLElement>) => {
      children.props.onFocus?.(event);

      if (!event.defaultPrevented) {
        scheduleOpen();
      }
    },
    onBlur: (event: React.FocusEvent<HTMLElement>) => {
      children.props.onBlur?.(event);

      if (!event.defaultPrevented) {
        scheduleClose();
      }
    },
  });
}

export function HoverCardContent({
  children,
  className,
  side = "bottom",
  align = "center",
}: {
  children: React.ReactNode;
  className?: string;
  side?: HoverCardSide;
  align?: HoverCardAlign;
}) {
  const { open, setOpen, scheduleClose, cancelTimers, contentId, triggerRef } =
    useHoverCard();
  const contentRef = useRef<HTMLDivElement>(null);
  const [point, setPoint] = useState<{ top: number; left: number } | null>(
    null,
  );

  useLayoutEffect(() => {
    if (!open) {
      return;
    }

    function place() {
      const triggerNode = triggerRef.current;
      const contentNode = contentRef.current;

      if (!triggerNode || !contentNode) {
        return;
      }

      const trigger = triggerNode.getBoundingClientRect();
      const content = contentNode.getBoundingClientRect();
      const gap = 8;
      let top = trigger.bottom + gap;
      let left = trigger.left;

      if (side === "top") {
        top = trigger.top - content.height - gap;
      }

      if (side === "left") {
        left = trigger.left - content.width - gap;
        top = trigger.top;
      }

      if (side === "right") {
        left = trigger.right + gap;
        top = trigger.top;
      }

      if (side === "top" || side === "bottom") {
        if (align === "center") {
          left = trigger.left + trigger.width / 2 - content.width / 2;
        }

        if (align === "end") {
          left = trigger.right - content.width;
        }
      } else if (align === "center") {
        top = trigger.top + trigger.height / 2 - content.height / 2;
      } else if (align === "end") {
        top = trigger.bottom - content.height;
      }

      left = Math.min(
        Math.max(8, left),
        Math.max(8, window.innerWidth - content.width - 8),
      );
      top = Math.min(
        Math.max(8, top),
        Math.max(8, window.innerHeight - content.height - 8),
      );
      setPoint({ top, left });
    }

    place();
    const scrollers: EventTarget[] = [window];
    let parent = triggerRef.current?.parentElement ?? null;

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
  }, [open, side, align, children, triggerRef]);

  useEffect(() => {
    if (!open) {
      return;
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") {
        return;
      }

      event.preventDefault();
      setOpen(false);
    }

    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, setOpen]);

  if (!open) {
    return null;
  }

  return createPortal(
    <div
      ref={contentRef}
      id={contentId}
      role="dialog"
      aria-modal="false"
      data-side={side}
      data-align={align}
      style={{
        position: "fixed",
        top: point?.top ?? -9999,
        left: point?.left ?? -9999,
      }}
      className={cn(
        "border-border bg-popover text-popover-foreground z-50 w-72 max-w-[calc(100vw-1rem)] rounded-md border p-4 text-sm shadow-md",
        className,
      )}
      onMouseEnter={cancelTimers}
      onMouseLeave={scheduleClose}
    >
      {children}
    </div>,
    document.body,
  );
}
