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

import "./dialog.css";

type DialogContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
  titleId: string;
  descriptionId: string;
  triggerRef: React.RefObject<HTMLElement | null>;
};

const DialogContext = React.createContext<DialogContextValue | null>(null);

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

function useDialog() {
  const context = useContext(DialogContext);

  if (!context) {
    throw new Error("Dialog components must render inside Dialog.");
  }

  return context;
}

export function Dialog({
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
    <DialogContext.Provider
      value={{
        open: isOpen,
        setOpen,
        titleId,
        descriptionId,
        triggerRef,
      }}
    >
      {children}
    </DialogContext.Provider>
  );
}

type TriggerElementProps = React.HTMLAttributes<HTMLElement> & {
  ref?: React.Ref<HTMLElement>;
};

export function DialogTrigger({
  children,
}: {
  children: React.ReactElement<TriggerElementProps>;
}) {
  const { open, setOpen, triggerRef } = useDialog();

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

export type DialogSize = "sm" | "default" | "lg" | "xl" | "full";

// Width and max height per size. "default" keeps the original 32rem / max-w-lg box.
const dialogSizeClasses: Record<DialogSize, string> = {
  sm: "max-h-[min(24rem,calc(100dvh-2rem))] sm:max-w-sm",
  default: "max-h-[min(32rem,calc(100dvh-2rem))] sm:max-w-lg",
  lg: "max-h-[min(40rem,calc(100dvh-2rem))] sm:max-w-3xl",
  xl: "max-h-[min(48rem,calc(100dvh-2rem))] sm:max-w-5xl",
  // Leaves a 4rem band on every side (2rem on phones) so a site header stays visible.
  full: "h-[calc(100dvh-4rem)] max-h-[calc(100dvh-4rem)] sm:h-[calc(100dvh-8rem)] sm:max-h-[calc(100dvh-8rem)] sm:max-w-[min(80rem,calc(100%-8rem))]",
};

export type DialogContentProps = React.HTMLAttributes<HTMLDivElement> & {
  /** Dialog box width and maximum height. */
  size?: DialogSize;
};

export function DialogContent({
  className,
  children,
  size = "default",
  ...props
}: DialogContentProps) {
  const { open, setOpen, titleId, descriptionId } = useDialog();
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
      reducedMotion() ? 0 : 160,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        data-dialog-overlay=""
        className="absolute inset-0 bg-black/50"
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
        data-dialog-content=""
        data-size={size}
        data-state={exiting ? "closed" : "open"}
        className={cn(
          "border-border bg-background text-foreground relative z-10 flex w-full max-w-[calc(100%-2rem)] flex-col gap-4 overflow-y-auto rounded-lg border p-6 shadow-lg",
          dialogSizeClasses[size],
          exiting ? "vinyaas-dialog-out" : "vinyaas-dialog-in",
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

export function DialogHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  return (
    <header
      className={cn("flex flex-col gap-2 text-center sm:text-left", className)}
      {...props}
    />
  );
}

export function DialogFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  return (
    <footer
      className={cn(
        // mt-auto pins the actions to the bottom of tall dialogs; sm:justify-end keeps them right.
        "mt-auto flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        className,
      )}
      {...props}
    />
  );
}

export function DialogTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  const { titleId } = useDialog();

  return (
    <p
      id={titleId}
      className={cn("text-lg leading-none font-semibold", className)}
      {...props}
    />
  );
}

export function DialogDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  const { descriptionId } = useDialog();

  return (
    <p
      id={descriptionId}
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  );
}

export function DialogClose({
  children,
}: {
  children: React.ReactElement<TriggerElementProps>;
}) {
  const { setOpen } = useDialog();

  return React.cloneElement(children, {
    onClick: (event: React.MouseEvent<HTMLElement>) => {
      children.props.onClick?.(event);

      if (!event.defaultPrevented) {
        setOpen(false);
      }
    },
  });
}
