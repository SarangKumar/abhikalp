"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { cn } from "@/lib/utils";

import "./toast.css";

export type ToastType =
  "default" | "success" | "info" | "warning" | "error" | "loading";

export type ToastPosition =
  | "top-left"
  | "top-center"
  | "top-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right";

export type ToastAction = {
  children: React.ReactNode;
  onClick: () => void;
};

export type ToastInput = {
  title: string;
  description?: string;
  type?: ToastType;
  duration?: number;
  actionProps?: ToastAction;
};

type ToastRecord = ToastInput & {
  id: string;
  type: ToastType;
  exiting?: boolean;
  /** Waiting on toast.promise: no auto-dismiss until the promise settles. */
  pending?: boolean;
};

type ToastListener = (toasts: readonly ToastRecord[]) => void;

const listeners = new Set<ToastListener>();
const timers = new Map<string, ReturnType<typeof setTimeout>>();
const exits = new Map<string, ReturnType<typeof setTimeout>>();
const exitDuration = 160;
let records: ToastRecord[] = [];
let nextId = 0;

function emit() {
  for (const listener of listeners) {
    listener(records);
  }
}

function clearTimer(id: string) {
  const timer = timers.get(id);

  if (timer) {
    clearTimeout(timer);
    timers.delete(id);
  }
}

function schedule(id: string) {
  clearTimer(id);
  const item = records.find((entry) => entry.id === id);

  if (!item || item.pending) {
    return;
  }

  const duration = item.duration ?? 5000;

  if (!Number.isFinite(duration)) {
    return;
  }

  timers.set(
    id,
    setTimeout(() => {
      dismiss(id);
    }, duration),
  );
}

function removeNow(id?: string) {
  if (!id) {
    for (const entry of records) {
      clearTimer(entry.id);
    }

    for (const timer of exits.values()) {
      clearTimeout(timer);
    }

    exits.clear();
    records = [];
    emit();
    return;
  }

  clearTimer(id);
  const exit = exits.get(id);

  if (exit) {
    clearTimeout(exit);
    exits.delete(id);
  }

  records = records.filter((entry) => entry.id !== id);
  emit();
}

function dismiss(id?: string) {
  if (!id) {
    removeNow();
    return;
  }

  const item = records.find((entry) => entry.id === id);

  if (!item || item.exiting) {
    return;
  }

  clearTimer(id);
  records = records.map((entry) =>
    entry.id === id ? { ...entry, exiting: true } : entry,
  );
  emit();
  exits.set(
    id,
    setTimeout(() => {
      exits.delete(id);
      removeNow(id);
    }, exitDuration),
  );
}

function update(id: string, patch: ToastInput) {
  records = records.map((entry) =>
    entry.id === id
      ? {
          ...entry,
          ...patch,
          type: patch.type ?? entry.type,
          pending: false,
        }
      : entry,
  );
  emit();
  schedule(id);
}

function subscribe(listener: ToastListener) {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

function pause(id: string) {
  clearTimer(id);
}

function resume(id: string) {
  schedule(id);
}

/**
 * One icon per state on a shared surface (no per-type backgrounds). The
 * default toast has no icon; loading uses a spinning ring like Spinner.
 */
function ToastIcon({ type }: { type: ToastType }) {
  if (type === "default") {
    return null;
  }

  if (type === "loading") {
    // Same ring-and-arc spinner as the Spinner component.
    return (
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        data-slot="toast-icon"
        data-icon="loading"
        className="mt-0.5 size-4 shrink-0 animate-spin motion-reduce:animate-none"
        fill="none"
      >
        <circle
          cx="12"
          cy="12"
          r="9"
          stroke="currentColor"
          strokeWidth="2.5"
          className="opacity-25"
        />
        <path
          d="M21 12a9 9 0 0 0-9-9"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 20 20"
      aria-hidden="true"
      data-slot="toast-icon"
      data-icon={type}
      className="mt-0.5 size-4 shrink-0"
      fill="currentColor"
    >
      {type === "success" ? (
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z"
        />
      ) : null}
      {type === "info" ? (
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-7-4a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM9 9a.75.75 0 0 0 0 1.5h.253a.25.25 0 0 1 .244.304l-.459 2.066A1.75 1.75 0 0 0 10.747 15H11a.75.75 0 0 0 0-1.5h-.253a.25.25 0 0 1-.244-.304l.459-2.066A1.75 1.75 0 0 0 9.253 9H9Z"
        />
      ) : null}
      {type === "warning" ? (
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495ZM10 5a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 10 5Zm0 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
        />
      ) : null}
      {type === "error" ? (
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
        />
      ) : null}
    </svg>
  );
}

function addRecord(input: ToastInput, pending: boolean) {
  const id = `toast-${nextId++}`;
  const record: ToastRecord = {
    ...input,
    id,
    type: input.type ?? "default",
    pending,
  };

  records = [...records, record];
  emit();
  schedule(id);
  return id;
}

export const toast = {
  /** Every toast, including type "loading", dismisses after `duration`. */
  add(input: ToastInput) {
    return addRecord(input, false);
  },
  dismiss,
  update,
  promise<T>(
    promise: Promise<T>,
    messages: {
      loading: ToastInput;
      success: ToastInput;
      error: ToastInput;
    },
  ) {
    // The loading state stays until the promise settles, then the success or
    // error toast gets the normal duration.
    const id = addRecord({ ...messages.loading, type: "loading" }, true);

    promise.then(
      () => {
        update(id, { ...messages.success, type: "success" });
      },
      () => {
        update(id, { ...messages.error, type: "error" });
      },
    );

    return id;
  },
};

const positionClass: Record<ToastPosition, string> = {
  "top-left": "top-4 left-4 items-start",
  "top-center": "top-4 left-1/2 -translate-x-1/2 items-center",
  "top-right": "top-4 right-4 items-end",
  "bottom-left": "bottom-4 left-4 items-start",
  "bottom-center": "bottom-4 left-1/2 -translate-x-1/2 items-center",
  "bottom-right": "bottom-4 right-4 items-end",
};

export function Toaster({
  position = "bottom-right",
}: {
  position?: ToastPosition;
}) {
  const [items, setItems] = useState<readonly ToastRecord[]>([]);
  // Start false so the server render and the first client render both omit the portal.
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setMounted(true), 0);
    const unsubscribe = subscribe(setItems);

    return () => {
      clearTimeout(timeout);
      unsubscribe();
    };
  }, []);

  if (!mounted) {
    return null;
  }

  const fromTop = position.startsWith("top");

  return createPortal(
    <div
      data-toaster=""
      data-position={position}
      className={cn(
        "pointer-events-none fixed z-50 flex w-[356px] max-w-[calc(100vw-2rem)] gap-2",
        fromTop ? "flex-col" : "flex-col-reverse",
        positionClass[position],
      )}
    >
      {items.map((item) => (
        <div
          key={item.id}
          role={item.type === "error" ? "alert" : "status"}
          data-type={item.type}
          data-exiting={item.exiting ? "true" : undefined}
          aria-busy={item.type === "loading" ? true : undefined}
          // Every state shares one popover surface; only the icon changes.
          className={cn(
            "border-border bg-popover text-popover-foreground pointer-events-auto flex w-full items-start gap-2 rounded-lg border p-4 text-[13px] leading-normal shadow-lg",
            item.exiting ? "vinyaas-toast-out" : "vinyaas-toast-in",
          )}
          onMouseEnter={() => pause(item.id)}
          onMouseLeave={() => resume(item.id)}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              event.stopPropagation();
              dismiss(item.id);
            }
          }}
        >
          <ToastIcon type={item.type} />
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <p data-slot="toast-title" className="font-medium">
              {item.title}
            </p>
            {item.description ? (
              <p
                data-slot="toast-description"
                className="text-muted-foreground"
              >
                {item.description}
              </p>
            ) : null}
          </div>
          {/* Icon and title share the first line; actions stay centered on the toast. */}
          <div className="flex shrink-0 items-center gap-1 self-center">
            {item.actionProps ? (
              <button
                type="button"
                data-slot="toast-action"
                className="bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-ring focus-visible:ring-offset-background inline-flex h-[26px] cursor-pointer items-center rounded-sm px-2.5 text-xs font-semibold whitespace-nowrap focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                onClick={item.actionProps.onClick}
              >
                {item.actionProps.children}
              </button>
            ) : null}
            <button
              type="button"
              aria-label="Dismiss"
              data-slot="toast-close"
              className="text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:ring-ring focus-visible:ring-offset-background inline-flex size-6 cursor-pointer items-center justify-center rounded-md transition-colors duration-150 [corner-shape:squircle] focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
              onClick={() => dismiss(item.id)}
            >
              <svg
                viewBox="0 0 16 16"
                aria-hidden="true"
                className="size-3.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              >
                <path d="m4 4 8 8M12 4l-8 8" />
              </svg>
            </button>
          </div>
        </div>
      ))}
    </div>,
    document.body,
  );
}
