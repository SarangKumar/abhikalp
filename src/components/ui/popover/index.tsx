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

export type PopoverSide = "top" | "right" | "bottom" | "left";
export type PopoverAlign = "start" | "center" | "end";

type PopoverContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
  contentId: string;
  triggerRef: React.RefObject<HTMLElement | null>;
};

const PopoverContext = React.createContext<PopoverContextValue | null>(null);

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

function usePopover() {
  const context = useContext(PopoverContext);

  if (!context) {
    throw new Error("Popover components must render inside Popover.");
  }

  return context;
}

const focusableSelector = [
  "button:not([disabled])",
  "[href]",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(", ");

export function Popover({
  children,
  open,
  defaultOpen = false,
  onOpenChange,
}: {
  children: React.ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [uncontrolled, setUncontrolled] = useState(defaultOpen);
  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : uncontrolled;
  const triggerRef = useRef<HTMLElement>(null);
  const contentId = useId();
  const setOpen = useCallback(
    (next: boolean) => {
      if (!isControlled) {
        setUncontrolled(next);
      }

      onOpenChange?.(next);

      if (!next) {
        triggerRef.current?.focus();
      }
    },
    [isControlled, onOpenChange],
  );

  return (
    <PopoverContext.Provider
      value={{ open: isOpen, setOpen, contentId, triggerRef }}
    >
      {children}
    </PopoverContext.Provider>
  );
}

type TriggerElementProps = React.HTMLAttributes<HTMLElement> & {
  ref?: React.Ref<HTMLElement>;
};

export function PopoverTrigger({
  children,
}: {
  children: React.ReactElement<TriggerElementProps>;
}) {
  const { open, setOpen, contentId, triggerRef } = usePopover();

  return React.cloneElement(children, {
    "aria-expanded": open,
    "aria-controls": open ? contentId : undefined,
    "aria-haspopup": children.props["aria-haspopup"] ?? "dialog",
    ref: (node: HTMLElement | null) => {
      triggerRef.current = node;
      assignRef(children.props.ref, node);
    },
    onClick: (event: React.MouseEvent<HTMLElement>) => {
      children.props.onClick?.(event);

      if (!event.defaultPrevented) {
        setOpen(!open);
      }
    },
  });
}

export function PopoverContent({
  children,
  className,
  side = "bottom",
  align = "center",
}: {
  children: React.ReactNode;
  className?: string;
  side?: PopoverSide;
  align?: PopoverAlign;
}) {
  const { open, setOpen, contentId, triggerRef } = usePopover();
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
      // Exposed so content can size itself to the trigger (e.g. Combobox
      // uses w-(--popover-trigger-width)). Set before measuring the content.
      contentNode.style.setProperty(
        "--popover-trigger-width",
        `${trigger.width}px`,
      );
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
      } else {
        if (align === "center") {
          top = trigger.top + trigger.height / 2 - content.height / 2;
        }

        if (align === "end") {
          top = trigger.bottom - content.height;
        }
      }

      const fitsBelow =
        trigger.bottom + content.height + gap < window.innerHeight;
      const fitsAbove = trigger.top - content.height - gap > 0;

      if (side === "bottom" && !fitsBelow && fitsAbove) {
        top = trigger.top - content.height - gap;
      }

      if (side === "top" && !fitsAbove && fitsBelow) {
        top = trigger.bottom + gap;
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
    // position:fixed does not follow a scrolling ancestor. Scroll events do
    // not bubble, so listen on each scrollable parent of the trigger.
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

    const content = contentRef.current;
    const focusable = content?.querySelector<HTMLElement>(focusableSelector);

    (focusable ?? content)?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") {
        return;
      }

      event.preventDefault();
      setOpen(false);
    }

    function onPointerDown(event: PointerEvent) {
      const target = event.target;

      if (!(target instanceof Node)) {
        return;
      }

      if (content?.contains(target) || triggerRef.current?.contains(target)) {
        return;
      }

      setOpen(false);
    }

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open, setOpen, triggerRef]);

  if (!open) {
    return null;
  }

  return createPortal(
    <div
      ref={contentRef}
      id={contentId}
      role="dialog"
      tabIndex={-1}
      data-side={side}
      data-align={align}
      style={{
        position: "fixed",
        top: point?.top ?? -9999,
        left: point?.left ?? -9999,
      }}
      className={cn(
        "border-border bg-muted text-foreground z-50 max-h-[min(24rem,calc(100dvh-2rem))] w-72 max-w-[calc(100vw-1rem)] overflow-x-hidden overflow-y-auto rounded-md border p-4 text-sm shadow-sm focus-visible:outline-none",
        className,
      )}
    >
      {children}
    </div>,
    document.body,
  );
}
