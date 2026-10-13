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
import { Button, type ButtonProps } from "../button";

import "./alert-dialog.css";

type AlertDialogContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
  titleId: string;
  descriptionId: string;
  triggerRef: React.RefObject<HTMLElement | null>;
};

const AlertDialogContext = React.createContext<AlertDialogContextValue | null>(
  null,
);

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

function useAlertDialog() {
  const context = useContext(AlertDialogContext);

  if (!context) {
    throw new Error("Alert dialog components must render inside AlertDialog.");
  }

  return context;
}

export function AlertDialog({
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
    <AlertDialogContext.Provider
      value={{
        open: isOpen,
        setOpen,
        titleId,
        descriptionId,
        triggerRef,
      }}
    >
      {children}
    </AlertDialogContext.Provider>
  );
}

type TriggerElementProps = React.HTMLAttributes<HTMLElement> & {
  ref?: React.Ref<HTMLElement>;
};

export function AlertDialogTrigger({
  children,
}: {
  children: React.ReactElement<TriggerElementProps>;
}) {
  const { open, setOpen, triggerRef } = useAlertDialog();

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

export function AlertDialogContent({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const { open, setOpen, titleId, descriptionId } = useAlertDialog();
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

    const cancel = node.querySelector<HTMLElement>(
      '[data-slot="alert-dialog-cancel"]',
    );
    const first = cancel ?? node.querySelector<HTMLElement>(focusableSelector);

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
        data-slot="alert-dialog-overlay"
        className="absolute inset-0 bg-black/50"
      />
      <div
        {...props}
        ref={contentRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        tabIndex={-1}
        data-slot="alert-dialog-content"
        data-state={exiting ? "closed" : "open"}
        className={cn(
          "border-border bg-background text-foreground relative z-10 flex max-h-[min(32rem,calc(100dvh-2rem))] w-full max-w-[calc(100%-2rem)] flex-col gap-4 overflow-y-auto rounded-lg border p-6 shadow-lg sm:max-w-md",
          exiting ? "vinyaas-alert-dialog-out" : "vinyaas-alert-dialog-in",
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

export function AlertDialogHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  return (
    <header
      data-slot="alert-dialog-header"
      className={cn("flex flex-col gap-2 text-center sm:text-left", className)}
      {...props}
    />
  );
}

export function AlertDialogFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  return (
    <footer
      data-slot="alert-dialog-footer"
      className={cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        className,
      )}
      {...props}
    />
  );
}

export function AlertDialogTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  const { titleId } = useAlertDialog();

  return (
    <p
      id={titleId}
      data-slot="alert-dialog-title"
      className={cn("text-lg leading-none font-semibold", className)}
      {...props}
    />
  );
}

export function AlertDialogDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  const { descriptionId } = useAlertDialog();

  return (
    <p
      id={descriptionId}
      data-slot="alert-dialog-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  );
}

export function AlertDialogAction({ className, ...props }: ButtonProps) {
  const { setOpen } = useAlertDialog();

  return (
    <Button
      data-slot="alert-dialog-action"
      className={className}
      {...props}
      onClick={(event) => {
        props.onClick?.(event);

        if (!event.defaultPrevented) {
          setOpen(false);
        }
      }}
    />
  );
}

export function AlertDialogCancel({
  className,
  variant = "outline",
  ...props
}: ButtonProps) {
  const { setOpen } = useAlertDialog();

  return (
    <Button
      data-slot="alert-dialog-cancel"
      variant={variant}
      className={className}
      {...props}
      onClick={(event) => {
        props.onClick?.(event);

        if (!event.defaultPrevented) {
          setOpen(false);
        }
      }}
    />
  );
}
