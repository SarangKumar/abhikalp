"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";

import { cn } from "@/lib/utils";

type Align = "start" | "center" | "end";
type Side = "top" | "bottom";

type SetOpenOptions = {
  /** When false, closing does not move focus back to the trigger (e.g. Tab). */
  restoreFocus?: boolean;
};

type SelectContextValue = {
  value: string | undefined;
  setValue: (next: string) => void;
  open: boolean;
  setOpen: (open: boolean, options?: SetOpenOptions) => void;
  disabled: boolean;
  triggerRef: React.RefObject<HTMLElement | null>;
  contentId: string;
  listboxId: string;
  activeValue: string | undefined;
  setActiveValue: (value: string | undefined) => void;
  registerLabel: (value: string, label: string) => void;
  unregisterLabel: (value: string) => void;
  labelFor: (value: string | undefined) => string | undefined;
  name?: string;
};

const SelectContext = createContext<SelectContextValue | null>(null);

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

function useSelect() {
  const context = useContext(SelectContext);

  if (!context) {
    throw new Error("Select components must render inside Select.");
  }

  return context;
}

function textContent(node: React.ReactNode): string {
  if (node === null || node === undefined || typeof node === "boolean") {
    return "";
  }

  if (typeof node === "string" || typeof node === "number") {
    return String(node);
  }

  if (Array.isArray(node)) {
    return node.map(textContent).join("");
  }

  if (React.isValidElement<{ children?: React.ReactNode }>(node)) {
    return textContent(node.props.children);
  }

  return "";
}

function SelectChevron({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      data-slot="select-icon"
      className={cn(
        "pointer-events-none absolute inset-y-0 right-0 flex w-9 items-center justify-center",
        className,
      )}
    >
      <svg
        viewBox="0 0 24 24"
        className="text-muted-foreground size-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </span>
  );
}

export function Select({
  children,
  value,
  defaultValue,
  onValueChange,
  open,
  defaultOpen = false,
  onOpenChange,
  disabled = false,
  name,
}: {
  children: React.ReactNode;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
  /** Optional form field name (hidden input). */
  name?: string;
}) {
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const [activeValue, setActiveValue] = useState<string | undefined>();
  const [labels, setLabels] = useState(() => new Map<string, string>());
  const triggerRef = useRef<HTMLElement>(null);
  const contentId = useId();
  const listboxId = useId();

  const isValueControlled = value !== undefined;
  const selectedValue = isValueControlled ? value : uncontrolledValue;
  const isOpenControlled = open !== undefined;
  const isOpen = isOpenControlled ? open : uncontrolledOpen;

  const setValue = useCallback(
    (next: string) => {
      if (!isValueControlled) {
        setUncontrolledValue(next);
      }

      onValueChange?.(next);
    },
    [isValueControlled, onValueChange],
  );

  const setOpen = useCallback(
    (next: boolean, options?: SetOpenOptions) => {
      if (!isOpenControlled) {
        setUncontrolledOpen(next);
      }

      onOpenChange?.(next);

      if (!next) {
        setActiveValue(undefined);

        if (options?.restoreFocus !== false) {
          queueMicrotask(() => {
            triggerRef.current?.focus();
          });
        }
      }
    },
    [isOpenControlled, onOpenChange],
  );

  const registerLabel = useCallback((itemValue: string, label: string) => {
    setLabels((prev) => {
      if (prev.get(itemValue) === label) {
        return prev;
      }

      const next = new Map(prev);
      next.set(itemValue, label);
      return next;
    });
  }, []);

  const unregisterLabel = useCallback((itemValue: string) => {
    setLabels((prev) => {
      if (!prev.has(itemValue)) {
        return prev;
      }

      const next = new Map(prev);
      next.delete(itemValue);
      return next;
    });
  }, []);

  const labelFor = useCallback(
    (itemValue: string | undefined) => {
      if (!itemValue) {
        return undefined;
      }

      return labels.get(itemValue);
    },
    [labels],
  );

  const context = useMemo(
    () => ({
      value: selectedValue,
      setValue,
      open: isOpen,
      setOpen,
      disabled,
      triggerRef,
      contentId,
      listboxId,
      activeValue,
      setActiveValue,
      registerLabel,
      unregisterLabel,
      labelFor,
      name,
    }),
    [
      selectedValue,
      setValue,
      isOpen,
      setOpen,
      disabled,
      contentId,
      listboxId,
      activeValue,
      registerLabel,
      unregisterLabel,
      labelFor,
      name,
    ],
  );

  return (
    <SelectContext.Provider value={context}>
      {name ? (
        <input type="hidden" name={name} value={selectedValue ?? ""} readOnly />
      ) : null}
      {children}
    </SelectContext.Provider>
  );
}

type TriggerProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  ref?: React.Ref<HTMLButtonElement>;
};

export function SelectTrigger({
  className,
  children,
  ref,
  onClick,
  onKeyDown,
  ...props
}: TriggerProps) {
  const {
    open,
    setOpen,
    disabled,
    triggerRef,
    contentId,
    listboxId,
    value,
    labelFor,
  } = useSelect();
  const selectedLabel = labelFor(value);

  return (
    <button
      type="button"
      role="combobox"
      aria-expanded={open}
      aria-controls={open ? listboxId : undefined}
      aria-haspopup="listbox"
      aria-autocomplete="none"
      disabled={disabled}
      data-slot="select-trigger"
      className={cn(
        "border-input bg-background text-foreground focus-visible:ring-ring focus-visible:ring-offset-background aria-invalid:border-destructive aria-invalid:ring-destructive/20 relative box-border flex h-9 max-h-9 min-h-9 w-full min-w-0 items-center justify-between gap-2 rounded-md border px-3 text-sm leading-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      ref={(node) => {
        triggerRef.current = node;
        assignRef(ref, node);
      }}
      {...props}
      onClick={(event) => {
        onClick?.(event);

        if (!event.defaultPrevented && !disabled) {
          setOpen(!open);
        }
      }}
      onKeyDown={(event) => {
        onKeyDown?.(event);

        if (event.defaultPrevented || disabled) {
          return;
        }

        if (
          event.key === "ArrowDown" ||
          event.key === "ArrowUp" ||
          event.key === "Enter" ||
          event.key === " "
        ) {
          event.preventDefault();
          setOpen(true);
        }
      }}
    >
      <span className="flex min-w-0 flex-1 items-center truncate text-left">
        {children}
      </span>
      {/* In flow (not absolute) so a consumer's padding classes can never push text under the arrow. */}
      <SelectChevron className="relative inset-auto w-4 shrink-0" />
      <span className="sr-only">
        {selectedLabel ? `Selected ${selectedLabel}` : "No value selected"}
      </span>
      <span id={contentId} className="sr-only">
        Select listbox
      </span>
    </button>
  );
}

export function SelectValue({
  placeholder,
  className,
}: {
  placeholder?: string;
  className?: string;
}) {
  const { value, labelFor } = useSelect();
  const label = labelFor(value);

  return (
    <span
      data-slot="select-value"
      className={cn("truncate", !label && "text-muted-foreground", className)}
    >
      {label ?? placeholder}
    </span>
  );
}

function collectSelectItems(nodes: React.ReactNode): Array<{
  value: string;
  label: string;
  disabled?: boolean;
}> {
  const items: Array<{ value: string; label: string; disabled?: boolean }> = [];

  React.Children.forEach(nodes, (child) => {
    if (!React.isValidElement(child)) {
      return;
    }

    if (child.type === SelectItem) {
      const props = child.props as SelectItemProps;
      items.push({
        value: props.value,
        label: textContent(props.children),
        disabled: props.disabled,
      });
      return;
    }

    if (child.type === SelectGroup) {
      items.push(
        ...collectSelectItems(
          (child.props as { children?: React.ReactNode }).children,
        ),
      );
    }
  });

  return items;
}

type SelectItemProps = {
  value: string;
  disabled?: boolean;
  children: React.ReactNode;
  className?: string;
};

export function SelectContent({
  children,
  className,
  align = "start",
  side = "bottom",
}: {
  children: React.ReactNode;
  className?: string;
  align?: Align;
  side?: Side;
}) {
  const select = useSelect();
  const contentRef = useRef<HTMLDivElement>(null);
  const [point, setPoint] = useState<{
    top: number;
    left: number;
    width: number;
  } | null>(null);

  useLayoutEffect(() => {
    for (const item of collectSelectItems(children)) {
      select.registerLabel(item.value, item.label);
    }
  }, [children, select]);

  useLayoutEffect(() => {
    if (!select.open) {
      return;
    }

    function place() {
      const triggerNode = select.triggerRef.current;
      const contentNode = contentRef.current;

      if (!triggerNode || !contentNode) {
        return;
      }

      const trigger = triggerNode.getBoundingClientRect();
      const content = contentNode.getBoundingClientRect();
      const gap = 4;
      let top =
        side === "top"
          ? trigger.top - content.height - gap
          : trigger.bottom + gap;
      let left = trigger.left;
      const width = trigger.width;

      if (align === "center") {
        left = trigger.left + trigger.width / 2 - content.width / 2;
      }

      if (align === "end") {
        left = trigger.right - content.width;
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
      setPoint({ top, left, width });
    }

    place();
    const scrollers: EventTarget[] = [window];
    let parent = select.triggerRef.current?.parentElement ?? null;

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
    window.addEventListener("scroll", place, true);

    return () => {
      for (const scroller of scrollers) {
        scroller.removeEventListener("scroll", place);
      }

      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [select.open, align, side, select.triggerRef, children]);

  useEffect(() => {
    if (!select.open || select.disabled) {
      return;
    }

    const timeout = window.setTimeout(() => {
      const options = [
        ...(contentRef.current?.querySelectorAll<HTMLElement>(
          '[role="option"]:not([aria-disabled="true"])',
        ) ?? []),
      ];
      const selected =
        options.find(
          (option) => option.getAttribute("aria-selected") === "true",
        ) ?? options[0];

      if (selected) {
        select.setActiveValue(selected.dataset.value);
        selected.focus();
      } else {
        contentRef.current?.focus();
      }
    }, 0);

    return () => {
      window.clearTimeout(timeout);
    };
    // Intentionally only when the list opens — not on every activeValue change.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- open/disabled gate initial focus
  }, [select.open, select.disabled]);

  useEffect(() => {
    if (!select.open || select.disabled) {
      return;
    }

    function options() {
      return [
        ...(contentRef.current?.querySelectorAll<HTMLElement>(
          '[role="option"]:not([aria-disabled="true"])',
        ) ?? []),
      ];
    }

    function highlight(option: HTMLElement | undefined) {
      if (!option) {
        return;
      }

      select.setActiveValue(option.dataset.value);
      option.focus();
      option.scrollIntoView?.({ block: "nearest" });
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        select.setOpen(false);
        return;
      }

      const list = options();
      const active = list.find(
        (option) => option.dataset.value === select.activeValue,
      );
      const index = active ? list.indexOf(active) : -1;

      if (event.key === "Tab") {
        // Move through options while open. At either end, close without
        // restoring focus so the browser continues normal Tab order.
        if (event.shiftKey) {
          if (index <= 0) {
            select.setOpen(false, { restoreFocus: false });
            return;
          }

          event.preventDefault();
          highlight(list[index - 1]);
          return;
        }

        if (index >= list.length - 1) {
          select.setOpen(false, { restoreFocus: false });
          return;
        }

        event.preventDefault();
        highlight(list[index + 1]);
        return;
      }

      if (event.key === "ArrowDown") {
        event.preventDefault();
        highlight(list[index + 1] ?? list[0]);
      }

      if (event.key === "ArrowUp") {
        event.preventDefault();
        highlight(list[index - 1] ?? list[list.length - 1]);
      }

      if (event.key === "Home") {
        event.preventDefault();
        highlight(list[0]);
      }

      if (event.key === "End") {
        event.preventDefault();
        highlight(list[list.length - 1]);
      }

      if (event.key === "Enter" && select.activeValue) {
        event.preventDefault();
        select.setValue(select.activeValue);
        select.setOpen(false);
      }
    }

    function onPointerDown(event: PointerEvent) {
      const target = event.target;

      if (!(target instanceof Node)) {
        return;
      }

      if (
        contentRef.current?.contains(target) ||
        select.triggerRef.current?.contains(target)
      ) {
        return;
      }

      select.setOpen(false);
    }

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [select]);

  if (!select.open || select.disabled) {
    return null;
  }

  return createPortal(
    <div
      ref={contentRef}
      id={select.contentId}
      data-slot="select-content"
      style={{
        position: "fixed",
        top: point?.top ?? -9999,
        left: point?.left ?? -9999,
        width: point?.width,
        minWidth: point?.width,
      }}
      className={cn(
        "border-border/80 bg-popover text-popover-foreground z-50 flex max-h-[min(20rem,calc(100dvh-2rem))] flex-col overflow-hidden rounded-md border p-0 text-sm shadow-md motion-reduce:transition-none",
        className,
      )}
      tabIndex={-1}
    >
      <div
        id={select.listboxId}
        role="listbox"
        aria-label="Options"
        className="overflow-y-auto overscroll-contain p-1"
      >
        {children}
      </div>
    </div>,
    document.body,
  );
}

export function SelectGroup({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div role="group" className={cn("py-1", className)}>
      {children}
    </div>
  );
}

export function SelectLabel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "text-foreground px-2 py-1.5 text-xs font-semibold tracking-wide",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function SelectSeparator({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      role="separator"
      className={cn("bg-border -mx-1 my-1 h-px", className)}
      {...props}
    />
  );
}

export function SelectItem({
  value,
  disabled,
  children,
  className,
}: SelectItemProps) {
  const select = useSelect();
  const label = textContent(children);
  const selected = select.value === value;
  const highlighted = select.activeValue === value;

  useLayoutEffect(() => {
    select.registerLabel(value, label);
  }, [select, value, label]);

  useEffect(() => {
    if (select.open && !select.activeValue && !disabled && selected) {
      select.setActiveValue(value);
    }
  }, [select, value, disabled, selected]);

  return (
    <div
      role="option"
      tabIndex={-1}
      data-value={value}
      aria-selected={selected}
      aria-disabled={disabled || undefined}
      data-highlighted={highlighted ? "" : undefined}
      className={cn(
        "hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground relative flex w-full cursor-default items-center rounded-sm py-2 pr-8 pl-2 text-sm outline-none select-none",
        disabled && "pointer-events-none opacity-50",
        className,
      )}
      onMouseEnter={() => {
        if (!disabled) {
          select.setActiveValue(value);
        }
      }}
      onClick={() => {
        if (disabled) {
          return;
        }

        select.setValue(value);
        select.setOpen(false);
      }}
    >
      <span className="truncate">{children}</span>
      {selected ? (
        <span className="absolute right-2 flex size-4 items-center justify-center">
          <svg
            viewBox="0 0 24 24"
            className="size-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </span>
      ) : null}
    </div>
  );
}
