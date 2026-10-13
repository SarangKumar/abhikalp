"use client";

import React, {
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";

import { cn } from "@/lib/utils";

import "./drawer.css";

type DrawerSide = "left" | "right" | "top" | "bottom";

type DrawerContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
  titleId: string;
  descriptionId: string;
  triggerRef: React.RefObject<HTMLElement | null>;
};

const DrawerContext = React.createContext<DrawerContextValue | null>(null);

const focusableSelector = [
  "button:not([disabled])",
  "[href]",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(", ");

const closers: Array<() => void> = [];
let scrollLocks = 0;
let previousOverflow = "";

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

function reducedMotion() {
  return (
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function lockScroll() {
  if (scrollLocks === 0) {
    previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
  }

  scrollLocks += 1;
}

function unlockScroll() {
  scrollLocks = Math.max(0, scrollLocks - 1);

  if (scrollLocks === 0) {
    document.body.style.overflow = previousOverflow;
  }
}

function useDrawer() {
  const context = useContext(DrawerContext);

  if (!context) {
    throw new Error("Drawer components must render inside Drawer.");
  }

  return context;
}

function motionClasses(side: DrawerSide, exiting: boolean) {
  const inClass = `vinyaas-drawer-in-${side}`;
  const outClass = `vinyaas-drawer-out-${side}`;
  return exiting ? outClass : inClass;
}

function contentLayout(side: DrawerSide) {
  switch (side) {
    case "left":
      return "inset-y-0 left-0 h-full w-full max-w-sm border-r sm:max-w-md";
    case "top":
      return "inset-x-0 top-0 w-full max-h-[85dvh] border-b";
    case "bottom":
      return "inset-x-0 bottom-0 w-full max-h-[85dvh] border-t";
    case "right":
    default:
      return "inset-y-0 right-0 h-full w-full max-w-sm border-l sm:max-w-md";
  }
}

export function Drawer({
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
  const titleId = useId();
  const descriptionId = useId();
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
    <DrawerContext.Provider
      value={{
        open: isOpen,
        setOpen,
        titleId,
        descriptionId,
        triggerRef,
      }}
    >
      {children}
    </DrawerContext.Provider>
  );
}

type TriggerElementProps = React.HTMLAttributes<HTMLElement> & {
  ref?: React.Ref<HTMLElement>;
};

export function DrawerTrigger({
  children,
}: {
  children: React.ReactElement<TriggerElementProps>;
}) {
  const { open, setOpen, triggerRef } = useDrawer();

  return React.cloneElement(children, {
    "aria-haspopup": "dialog",
    "aria-expanded": open,
    ref: (node: HTMLElement | null) => {
      triggerRef.current = node;
      assignRef(children.props.ref, node);
    },
    onClick: (event: React.MouseEvent<HTMLElement>) => {
      children.props.onClick?.(event);

      if (!event.defaultPrevented) {
        setOpen(true);
      }
    },
  });
}

export type DrawerContentProps = React.HTMLAttributes<HTMLDivElement> & {
  side?: DrawerSide;
};

export function DrawerContent({
  className,
  children,
  side = "right",
  ...props
}: DrawerContentProps) {
  const { open, setOpen, titleId, descriptionId } = useDrawer();
  const contentRef = useRef<HTMLDivElement>(null);
  const [present, setPresent] = useState(open);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    if (open) {
      const timeout = window.setTimeout(() => {
        setPresent(true);
        setExiting(false);
      }, 0);

      return () => window.clearTimeout(timeout);
    }

    const hide = window.setTimeout(
      () => {
        setPresent(false);
        setExiting(false);
      },
      reducedMotion() ? 0 : 200,
    );
    const mark = window.setTimeout(() => setExiting(true), 0);

    return () => {
      window.clearTimeout(hide);
      window.clearTimeout(mark);
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    lockScroll();
    const close = () => setOpen(false);
    closers.push(close);

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape" && closers[closers.length - 1] === close) {
        event.preventDefault();
        close();
      }
    }

    document.addEventListener("keydown", onKey);

    return () => {
      document.removeEventListener("keydown", onKey);
      const index = closers.indexOf(close);

      if (index >= 0) {
        closers.splice(index, 1);
      }

      unlockScroll();
    };
  }, [open, setOpen]);

  useEffect(() => {
    if (!open || !present) {
      return;
    }

    const node = contentRef.current;

    if (!node) {
      return;
    }

    const first = node.querySelector<HTMLElement>(focusableSelector);

    if (first) {
      first.focus();
      return;
    }

    node.focus();
  }, [open, present]);

  if (!present || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 z-50">
      <div
        data-drawer-overlay=""
        className={cn(
          "absolute inset-0 bg-black/50",
          exiting ? "vinyaas-drawer-overlay-out" : "vinyaas-drawer-overlay-in",
        )}
        onClick={() => setOpen(false)}
      />
      <div
        {...props}
        ref={contentRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        tabIndex={-1}
        data-drawer-content=""
        data-side={side}
        data-state={exiting ? "closed" : "open"}
        className={cn(
          "border-border bg-background text-foreground fixed z-10 flex flex-col gap-4 overflow-y-auto p-6 shadow-lg",
          contentLayout(side),
          motionClasses(side, exiting),
          className,
        )}
        onClick={(event) => event.stopPropagation()}
        onKeyDown={(event) => {
          if (event.key !== "Tab") {
            return;
          }

          const nodes = [
            ...event.currentTarget.querySelectorAll<HTMLElement>(
              focusableSelector,
            ),
          ];
          const first = nodes[0];
          const last = nodes[nodes.length - 1];

          if (!first || !last) {
            event.preventDefault();
            return;
          }

          if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
          } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
          }
        }}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
}

export function DrawerHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  return (
    <header
      className={cn("flex flex-col gap-2 text-left", className)}
      {...props}
    />
  );
}

export function DrawerFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  return (
    <footer
      className={cn(
        "mt-auto flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        className,
      )}
      {...props}
    />
  );
}

export function DrawerTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  const { titleId } = useDrawer();

  return (
    <p
      id={titleId}
      className={cn("text-lg leading-none font-semibold", className)}
      {...props}
    />
  );
}

export function DrawerDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  const { descriptionId } = useDrawer();

  return (
    <p
      id={descriptionId}
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  );
}

export function DrawerClose({
  children,
}: {
  children: React.ReactElement<TriggerElementProps>;
}) {
  const { setOpen } = useDrawer();

  return React.cloneElement(children, {
    onClick: (event: React.MouseEvent<HTMLElement>) => {
      children.props.onClick?.(event);

      if (!event.defaultPrevented) {
        setOpen(false);
      }
    },
  });
}
