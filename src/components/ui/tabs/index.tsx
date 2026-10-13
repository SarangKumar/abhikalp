"use client";

import React, {
  createContext,
  useContext,
  useId,
  useRef,
  useState,
} from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

type TabsContextValue = {
  value: string;
  orientation: "horizontal" | "vertical";
  disabled: boolean;
  baseId: string;
  setValue: (value: string) => void;
};

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabs() {
  const context = useContext(TabsContext);

  if (!context) {
    throw new Error("Tabs components must render inside Tabs.");
  }

  return context;
}

function triggerId(baseId: string, value: string) {
  return `${baseId}-trigger-${value}`;
}

function contentId(baseId: string, value: string) {
  return `${baseId}-content-${value}`;
}

export type TabsProps = Omit<
  React.ComponentProps<"div">,
  "defaultValue" | "dir"
> & {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  orientation?: "horizontal" | "vertical";
  disabled?: boolean;
};

export function Tabs({
  className,
  value,
  defaultValue,
  onValueChange,
  orientation = "horizontal",
  disabled = false,
  children,
  ...props
}: TabsProps) {
  const controlled = value !== undefined;
  const [uncontrolled, setUncontrolled] = useState(defaultValue ?? "");
  const current = controlled ? (value ?? "") : uncontrolled;
  const baseId = useId();

  function setValue(next: string) {
    if (!controlled) {
      setUncontrolled(next);
    }

    onValueChange?.(next);
  }

  return (
    <TabsContext.Provider
      value={{
        value: current,
        orientation,
        disabled,
        baseId,
        setValue,
      }}
    >
      <div
        data-orientation={orientation}
        className={cn(
          "group/tabs flex gap-2",
          orientation === "vertical" ? "flex-row" : "flex-col",
          className,
        )}
        {...props}
      >
        {children}
      </div>
    </TabsContext.Provider>
  );
}

const tabsListVariants = cva(
  "group/tabs-list text-muted-foreground inline-flex w-fit max-w-full items-center justify-center rounded-lg p-[3px] data-[variant=line]:rounded-none",
  {
    variants: {
      variant: {
        default: "bg-muted",
        line: "gap-1 border-border rounded-none bg-transparent p-0 pb-px",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export type TabsListProps = React.ComponentProps<"div"> &
  VariantProps<typeof tabsListVariants>;

export function TabsList({
  className,
  variant = "default",
  onKeyDown,
  ...props
}: TabsListProps) {
  const { orientation, disabled } = useTabs();
  const listRef = useRef<HTMLDivElement>(null);

  function focusTrigger(triggers: HTMLButtonElement[], index: number) {
    const next = triggers[index];

    if (!next) {
      return;
    }

    next.focus();
  }

  return (
    <div
      {...props}
      ref={listRef}
      role="tablist"
      aria-orientation={orientation}
      data-variant={variant ?? "default"}
      {...(disabled ? { "aria-disabled": true } : {})}
      className={cn(
        tabsListVariants({ variant }),
        orientation === "vertical"
          ? "h-auto min-w-28 shrink-0 flex-col overflow-visible"
          : "h-9 flex-row overflow-x-auto overflow-y-hidden",
        className,
      )}
      onKeyDown={(event) => {
        onKeyDown?.(event);

        if (event.defaultPrevented || disabled) {
          return;
        }

        const key = event.key;
        const forward = orientation === "vertical" ? "ArrowDown" : "ArrowRight";
        const backward = orientation === "vertical" ? "ArrowUp" : "ArrowLeft";

        if (![forward, backward, "Home", "End"].includes(key)) {
          return;
        }

        const triggers = [
          ...(listRef.current?.querySelectorAll<HTMLButtonElement>(
            '[role="tab"]',
          ) ?? []),
        ].filter((trigger) => !trigger.disabled);
        const index = triggers.indexOf(
          document.activeElement as HTMLButtonElement,
        );

        if (index < 0 || triggers.length === 0) {
          return;
        }

        event.preventDefault();

        if (key === "Home") {
          focusTrigger(triggers, 0);
          return;
        }

        if (key === "End") {
          focusTrigger(triggers, triggers.length - 1);
          return;
        }

        const delta = key === forward ? 1 : -1;
        const next = (index + delta + triggers.length) % triggers.length;
        focusTrigger(triggers, next);
      }}
    />
  );
}

export type TabsTriggerProps = Omit<React.ComponentProps<"button">, "value"> & {
  value: string;
};

export function TabsTrigger({
  className,
  value,
  disabled,
  onClick,
  ...props
}: TabsTriggerProps) {
  const tabs = useTabs();
  const selected = tabs.value === value;
  const isDisabled = Boolean(disabled || tabs.disabled);

  return (
    <button
      type="button"
      role="tab"
      id={triggerId(tabs.baseId, value)}
      aria-selected={selected}
      aria-controls={contentId(tabs.baseId, value)}
      data-state={selected ? "active" : "inactive"}
      data-value={value}
      tabIndex={selected ? 0 : -1}
      disabled={isDisabled}
      className={cn(
        "focus-visible:ring-ring relative inline-flex h-[calc(100%-1px)] shrink-0 items-center justify-center gap-1.5 rounded-md border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap transition-[color,background-color,box-shadow,opacity] focus-visible:ring-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
        "text-foreground/60 hover:text-foreground dark:text-muted-foreground dark:hover:text-foreground",
        "data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm",
        "group-data-[variant=line]/tabs-list:data-[state=active]:bg-transparent group-data-[variant=line]/tabs-list:data-[state=active]:shadow-none",
        "after:bg-foreground after:absolute after:opacity-0 after:transition-opacity group-data-[orientation=horizontal]/tabs:after:inset-x-0 group-data-[orientation=horizontal]/tabs:after:bottom-0 group-data-[orientation=horizontal]/tabs:after:h-0.5 group-data-[orientation=vertical]/tabs:after:inset-y-0 group-data-[orientation=vertical]/tabs:after:right-0 group-data-[orientation=vertical]/tabs:after:w-0.5 group-data-[variant=line]/tabs-list:data-[state=active]:after:opacity-100",
        tabs.orientation === "vertical" && "w-full justify-start",
        className,
      )}
      {...props}
      onClick={(event) => {
        onClick?.(event);

        if (event.defaultPrevented || isDisabled) {
          return;
        }

        tabs.setValue(value);
      }}
    />
  );
}

export type TabsContentProps = React.ComponentProps<"div"> & {
  value: string;
  forceMount?: boolean;
};

export function TabsContent({
  className,
  value,
  forceMount = false,
  children,
  ...props
}: TabsContentProps) {
  const tabs = useTabs();
  const selected = tabs.value === value;

  if (!forceMount && !selected) {
    return null;
  }

  return (
    <div
      role="tabpanel"
      id={contentId(tabs.baseId, value)}
      aria-labelledby={triggerId(tabs.baseId, value)}
      data-state={selected ? "active" : "inactive"}
      data-value={value}
      hidden={!selected}
      tabIndex={0}
      className={cn(
        "ring-offset-background focus-visible:ring-ring flex-1 outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
