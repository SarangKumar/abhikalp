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

import "./sheet.css";

export type SheetSide = "left" | "right" | "top" | "bottom";

type SheetContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
  titleId: string;
  descriptionId: string;
  triggerRef: React.RefObject<HTMLElement | null>;
};

const SheetContext = React.createContext<SheetContextValue | null>(null);

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

function useSheet() {
  const context = useContext(SheetContext);

  if (!context) {
    throw new Error("Sheet components must render inside Sheet.");
  }

  return context;
}

function motionClasses(side: SheetSide, exiting: boolean) {
  const inClass = `vinyaas-sheet-in-${side}`;
  const outClass = `vinyaas-sheet-out-${side}`;
  return exiting ? outClass : inClass;
}

function contentLayout(side: SheetSide) {
  switch (side) {
    case "left":
      return "inset-y-0 left-0 h-full w-3/4 max-w-sm border-r sm:max-w-md";
    case "top":
      return "inset-x-0 top-0 w-full max-h-[85dvh] border-b";
    case "bottom":
      return "inset-x-0 bottom-0 w-full max-h-[85dvh] border-t";
    case "right":
    default:
      return "inset-y-0 right-0 h-full w-3/4 max-w-sm border-l sm:max-w-md";
  }
}

function CloseIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="size-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

export function Sheet({
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
    <SheetContext.Provider
      value={{
        open: isOpen,
        setOpen,
        titleId,
        descriptionId,
        triggerRef,
      }}
    >
      {children}
    </SheetContext.Provider>
  );
}

type TriggerElementProps = React.HTMLAttributes<HTMLElement> & {
  ref?: React.Ref<HTMLElement>;
};

export function SheetTrigger({
  children,
}: {
  children: React.ReactElement<TriggerElementProps>;
}) {
  const { open, setOpen, triggerRef } = useSheet();

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

export type SheetContentProps = React.HTMLAttributes<HTMLDivElement> & {
  side?: SheetSide;
  /** When false, hides the built-in close control. Defaults to true. */
  showCloseButton?: boolean;
};

const SHEET_EXIT_MS = 220;

export function SheetContent({
  className,
  children,
  side = "right",
  showCloseButton = true,
  ...props
}: SheetContentProps) {
  const { open, setOpen, titleId, descriptionId } = useSheet();
  const contentRef = useRef<HTMLDivElement>(null);
  const [present, setPresent] = useState(open);
  const [exiting, setExiting] = useState(false);
  const presentRef = useRef(open);

  useEffect(() => {
    if (open) {
      const timeout = window.setTimeout(() => {
        presentRef.current = true;
        setPresent(true);
        setExiting(false);
      }, 0);

      return () => window.clearTimeout(timeout);
    }

    // Already unmounted — do not flip into an exit class before the first open.
    if (!presentRef.current) {
      return;
    }

    const hide = window.setTimeout(
      () => {
        presentRef.current = false;
        setPresent(false);
        setExiting(false);
      },
      reducedMotion() ? 0 : SHEET_EXIT_MS,
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
        data-slot="sheet-overlay"
        className={cn(
          "absolute inset-0 bg-black/50",
          exiting ? "vinyaas-sheet-overlay-out" : "vinyaas-sheet-overlay-in",
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
        data-slot="sheet-content"
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
        {showCloseButton ? (
          <button
            type="button"
            data-slot="sheet-close"
            aria-label="Close"
            className="border-border text-muted-foreground hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring absolute top-4 right-4 inline-flex size-8 items-center justify-center rounded-md border bg-transparent transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
            onClick={() => setOpen(false)}
          >
            <CloseIcon />
          </button>
        ) : null}
        {children}
      </div>
    </div>,
    document.body,
  );
}

export function SheetHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  return (
    <header
      data-slot="sheet-header"
      className={cn("flex flex-col gap-2 pr-8 text-left", className)}
      {...props}
    />
  );
}

export function SheetFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  return (
    <footer
      data-slot="sheet-footer"
      className={cn(
        "mt-auto flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        className,
      )}
      {...props}
    />
  );
}

export function SheetTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  const { titleId } = useSheet();

  return (
    <p
      id={titleId}
      data-slot="sheet-title"
      className={cn("text-lg leading-none font-semibold", className)}
      {...props}
    />
  );
}

export function SheetDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  const { descriptionId } = useSheet();

  return (
    <p
      id={descriptionId}
      data-slot="sheet-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  );
}

export function SheetClose({
  children,
}: {
  children: React.ReactElement<TriggerElementProps>;
}) {
  const { setOpen } = useSheet();

  return React.cloneElement(children, {
    onClick: (event: React.MouseEvent<HTMLElement>) => {
      children.props.onClick?.(event);

      if (!event.defaultPrevented) {
        setOpen(false);
      }
    },
  });
}
