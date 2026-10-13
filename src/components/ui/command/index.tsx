"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useId,
  useState,
} from "react";

import { cn } from "@/lib/utils";
import { Kbd, type KbdProps } from "../kbd";

type CommandContextValue = {
  query: string;
  setQuery: (query: string) => void;
  listId: string;
  inputId: string;
  activeId: string;
  setActiveId: (id: string) => void;
};

const CommandContext = createContext<CommandContextValue | null>(null);

function useCommand() {
  const context = useContext(CommandContext);

  if (!context) {
    throw new Error("Command parts must render inside Command.");
  }

  return context;
}

function visibleOptions(list: HTMLElement | null) {
  return [
    ...(list?.querySelectorAll<HTMLElement>(
      '[role="option"]:not([aria-disabled="true"]):not(:disabled)',
    ) ?? []),
  ];
}

export type CommandProps = React.ComponentProps<"div"> & {
  onQueryChange?: (query: string) => void;
};

export function Command({
  className,
  children,
  onQueryChange,
  ...props
}: CommandProps) {
  const [query, setQueryState] = useState("");
  const [activeId, setActiveId] = useState("");
  const listId = useId();
  const inputId = useId();

  function setQuery(next: string) {
    setQueryState(next);
    onQueryChange?.(next);
  }

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const first = visibleOptions(document.getElementById(listId))[0];

      setActiveId(first?.id ?? "");
    }, 0);

    return () => window.clearTimeout(timeout);
  }, [query, listId]);

  return (
    <CommandContext.Provider
      value={{
        query,
        setQuery,
        listId,
        inputId,
        activeId,
        setActiveId,
      }}
    >
      <div
        data-slot="command"
        className={cn(
          "border-border/80 bg-popover text-popover-foreground flex w-full flex-col overflow-hidden rounded-xl border shadow-md dark:shadow-[0_14px_32px_-10px_oklch(0_0_0/0.4)]",
          className,
        )}
        {...props}
      >
        {children}
      </div>
    </CommandContext.Provider>
  );
}

export type CommandInputProps = React.ComponentProps<"input">;

export function CommandInput({ className, ...props }: CommandInputProps) {
  const command = useCommand();

  function options() {
    return visibleOptions(document.getElementById(command.listId));
  }

  function move(direction: 1 | -1, { wrap = true } = {}) {
    const list = options();
    if (list.length === 0) {
      return false;
    }

    const index = list.findIndex((option) => option.id === command.activeId);
    const nextIndex = index + direction;

    if (nextIndex < 0 || nextIndex >= list.length) {
      if (!wrap) {
        return false;
      }
    }

    const next =
      list[
        nextIndex < 0
          ? list.length - 1
          : nextIndex >= list.length
            ? 0
            : nextIndex
      ];

    if (next) {
      command.setActiveId(next.id);
      next.scrollIntoView?.({ block: "nearest" });
      return true;
    }

    return false;
  }

  function focusOption(option: HTMLElement | undefined) {
    if (!option) {
      return;
    }

    command.setActiveId(option.id);
    option.focus();
    option.scrollIntoView?.({ block: "nearest" });
  }

  function activate() {
    if (!command.activeId) {
      return;
    }

    options()
      .find((option) => option.id === command.activeId)
      ?.click();
  }

  return (
    <div className="p-px">
      {/* h-9 + box-border: the bordered field is 36px, the same as Input and Button. */}
      <div className="border-border/80 bg-muted/40 focus-within:border-ring/50 focus-within:ring-ring/30 m-0.5 box-border flex h-9 items-center gap-2 rounded-lg border px-3 focus-within:ring-1">
        <SearchGlyph />
        <input
          {...props}
          id={command.inputId}
          role="combobox"
          aria-expanded="true"
          aria-controls={command.listId}
          aria-autocomplete="list"
          aria-activedescendant={command.activeId || undefined}
          value={command.query}
          className={cn(
            "placeholder:text-muted-foreground/70 text-foreground h-full w-full min-w-0 bg-transparent text-sm outline-none",
            className,
          )}
          onChange={(event) => {
            command.setQuery(event.currentTarget.value);
            props.onChange?.(event);
          }}
          onKeyDown={(event) => {
            if (event.key === "ArrowDown") {
              event.preventDefault();
              move(1);
            }

            if (event.key === "ArrowUp") {
              event.preventDefault();
              move(-1);
            }

            if (event.key === "Home") {
              const first = options()[0];

              if (first) {
                event.preventDefault();
                command.setActiveId(first.id);
                first.scrollIntoView?.({ block: "nearest" });
              }
            }

            if (event.key === "End") {
              const list = options();
              const last = list[list.length - 1];

              if (last) {
                event.preventDefault();
                command.setActiveId(last.id);
                last.scrollIntoView?.({ block: "nearest" });
              }
            }

            if (event.key === "Enter" && command.activeId) {
              event.preventDefault();
              activate();
            }

            // Tab into the result list only when results exist; otherwise leave
            // the control so page Tab order continues normally.
            if (event.key === "Tab" && !event.shiftKey) {
              const list = options();
              if (list.length > 0) {
                event.preventDefault();
                focusOption(
                  list.find((option) => option.id === command.activeId) ??
                    list[0],
                );
              }
            }

            props.onKeyDown?.(event);
          }}
        />
      </div>
    </div>
  );
}

function SearchGlyph() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="text-muted-foreground size-4 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

export type CommandListProps = React.ComponentProps<"div">;

export function CommandList({ className, ...props }: CommandListProps) {
  const command = useCommand();

  return (
    <div
      {...props}
      id={command.listId}
      role="listbox"
      aria-labelledby={command.inputId}
      className={cn(
        "bg-popover max-h-80 overflow-y-auto overscroll-contain p-1.5",
        className,
      )}
    />
  );
}

export type CommandEmptyProps = React.ComponentProps<"p">;

export function CommandEmpty({ className, ...props }: CommandEmptyProps) {
  const command = useCommand();
  const [empty, setEmpty] = useState(false);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setEmpty(
        visibleOptions(document.getElementById(command.listId)).length === 0,
      );
    }, 0);

    return () => window.clearTimeout(timeout);
  }, [command]);

  if (!empty) {
    return null;
  }

  return (
    <p
      className={cn(
        "text-muted-foreground px-3 py-6 text-center text-sm",
        className,
      )}
      {...props}
    />
  );
}

export type CommandGroupProps = React.ComponentProps<"div"> & {
  heading: string;
};

export function CommandGroup({
  heading,
  className,
  children,
  ...props
}: CommandGroupProps) {
  return (
    <div
      role="group"
      aria-label={heading}
      className={cn(
        "grid gap-0.5 py-1 [:not(:has([role=option]))]:hidden",
        className,
      )}
      {...props}
    >
      <p className="text-muted-foreground px-2 pt-2 pb-1 text-xs font-semibold">
        {heading}
      </p>
      {children}
    </div>
  );
}

export type CommandItemProps = Omit<React.ComponentProps<"button">, "value"> & {
  value: string;
};

export function CommandItem({
  value,
  className,
  disabled,
  children,
  onClick,
  onFocus,
  onMouseEnter,
  onKeyDown,
  ...props
}: CommandItemProps) {
  const command = useCommand();
  const id = useId();
  const selected = command.activeId === id;
  const visible = value
    .toLowerCase()
    .includes(command.query.trim().toLowerCase());

  if (!visible) {
    return null;
  }

  function highlight() {
    if (!disabled) {
      command.setActiveId(id);
    }
  }

  return (
    <button
      {...props}
      id={id}
      type="button"
      role="option"
      tabIndex={-1}
      aria-selected={selected}
      aria-disabled={disabled || undefined}
      disabled={disabled}
      data-selected={selected ? "" : undefined}
      className={cn(
        "text-foreground data-selected:bg-accent data-selected:text-accent-foreground hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent focus-visible:text-accent-foreground data-selected:hover:bg-accent flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm outline-none disabled:cursor-not-allowed disabled:opacity-50 [&>svg]:shrink-0",
        className,
      )}
      onMouseEnter={(event) => {
        highlight();
        onMouseEnter?.(event);
      }}
      onFocus={(event) => {
        highlight();
        onFocus?.(event);
      }}
      onKeyDown={(event) => {
        const list = visibleOptions(document.getElementById(command.listId));
        const index = list.findIndex((option) => option.id === id);

        if (event.key === "ArrowDown" || event.key === "ArrowUp") {
          event.preventDefault();
          const direction = event.key === "ArrowDown" ? 1 : -1;
          const next =
            list[index + direction] ??
            list[direction === 1 ? 0 : list.length - 1];

          if (next) {
            command.setActiveId(next.id);
            next.focus();
          }
        }

        if (event.key === "Home") {
          event.preventDefault();
          const first = list[0];
          if (first) {
            command.setActiveId(first.id);
            first.focus();
          }
        }

        if (event.key === "End") {
          event.preventDefault();
          const last = list[list.length - 1];
          if (last) {
            command.setActiveId(last.id);
            last.focus();
          }
        }

        if (event.key === "Enter") {
          event.preventDefault();
          event.currentTarget.click();
        }

        if (event.key === "Escape") {
          event.preventDefault();
          document.getElementById(command.inputId)?.focus();
        }

        // Tab through results while open; leave the list at the ends so the
        // browser resumes normal document Tab order (no focus trap).
        if (event.key === "Tab") {
          if (event.shiftKey) {
            if (index <= 0) {
              event.preventDefault();
              document.getElementById(command.inputId)?.focus();
              return;
            }

            event.preventDefault();
            const previous = list[index - 1];
            if (previous) {
              command.setActiveId(previous.id);
              previous.focus();
            }
            return;
          }

          if (index >= list.length - 1) {
            return;
          }

          event.preventDefault();
          const next = list[index + 1];
          if (next) {
            command.setActiveId(next.id);
            next.focus();
          }
        }

        onKeyDown?.(event);
      }}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export type CommandShortcutProps = KbdProps;

/** A key hint at the end of an item. Renders Kbd so symbols size like letters. */
export function CommandShortcut({ className, ...props }: CommandShortcutProps) {
  return (
    <Kbd
      data-slot="command-shortcut"
      className={cn("text-muted-foreground ml-auto shrink-0", className)}
      {...props}
    />
  );
}

export type CommandFooterProps = React.ComponentProps<"div">;

/** Compact action/footer strip below Command results. */
export function CommandFooter({ className, ...props }: CommandFooterProps) {
  return (
    <div
      data-slot="command-footer"
      className={cn(
        "border-border/80 bg-muted/30 text-muted-foreground flex items-center gap-3 border-t px-3 py-2 text-xs",
        className,
      )}
      {...props}
    />
  );
}
