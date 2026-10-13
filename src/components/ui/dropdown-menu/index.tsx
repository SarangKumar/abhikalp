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

type Align = "start" | "center" | "end";
type Side = "top" | "bottom";

type MenuContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
  contentId: string;
  triggerRef: React.RefObject<HTMLElement | null>;
};

const MenuContext = React.createContext<MenuContextValue | null>(null);

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

function useMenu() {
  const context = useContext(MenuContext);

  if (!context) {
    throw new Error(
      "Dropdown menu components must render inside DropdownMenu.",
    );
  }

  return context;
}

export function DropdownMenu({
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
    },
    [isControlled, onOpenChange],
  );

  return (
    <MenuContext.Provider
      value={{ open: isOpen, setOpen, contentId, triggerRef }}
    >
      {children}
    </MenuContext.Provider>
  );
}

type TriggerProps = React.HTMLAttributes<HTMLElement> & {
  ref?: React.Ref<HTMLElement>;
};

export function DropdownMenuTrigger({
  children,
}: {
  children: React.ReactElement<TriggerProps>;
}) {
  const { open, setOpen, contentId, triggerRef } = useMenu();

  return React.cloneElement(children, {
    "aria-expanded": open,
    "aria-controls": open ? contentId : undefined,
    "aria-haspopup": "menu",
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
    onKeyDown: (event: React.KeyboardEvent<HTMLElement>) => {
      children.props.onKeyDown?.(event);

      if (event.defaultPrevented) {
        return;
      }

      if (
        event.key === "ArrowDown" ||
        event.key === "Enter" ||
        event.key === " "
      ) {
        event.preventDefault();
        setOpen(true);
      }
    },
  });
}

export function DropdownMenuContent({
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
  const { open, setOpen, contentId, triggerRef } = useMenu();
  const contentRef = useRef<HTMLDivElement>(null);
  const wasOpen = useRef(false);
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
      const gap = 4;
      let top =
        side === "top"
          ? trigger.top - content.height - gap
          : trigger.bottom + gap;
      let left = trigger.left;

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
    window.addEventListener("scroll", place, true);

    return () => {
      for (const scroller of scrollers) {
        scroller.removeEventListener("scroll", place);
      }

      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [open, align, side, children, triggerRef]);

  useEffect(() => {
    if (wasOpen.current && !open) {
      triggerRef.current?.focus();
    }

    wasOpen.current = open;

    if (!open) {
      return;
    }

    const content = contentRef.current;

    function items() {
      return [
        ...(content?.querySelectorAll<HTMLElement>(
          '[role="menuitem"]:not([disabled])',
        ) ?? []),
      ];
    }

    const timeout = window.setTimeout(() => {
      items()[0]?.focus();
    }, 0);

    function onKeyDown(event: KeyboardEvent) {
      const list = items();
      const index = list.indexOf(document.activeElement as HTMLElement);

      if (event.key === "Escape" || event.key === "Tab") {
        event.preventDefault();
        setOpen(false);
        return;
      }

      if (list.length === 0) {
        return;
      }

      if (event.key === "ArrowDown") {
        event.preventDefault();
        list[(index + 1) % list.length]?.focus();
      }

      if (event.key === "ArrowUp") {
        event.preventDefault();
        list[(index - 1 + list.length) % list.length]?.focus();
      }

      if (event.key === "Home") {
        event.preventDefault();
        list[0]?.focus();
      }

      if (event.key === "End") {
        event.preventDefault();
        list[list.length - 1]?.focus();
      }
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
      window.clearTimeout(timeout);
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
      role="menu"
      aria-orientation="vertical"
      data-align={align}
      data-side={side}
      style={{
        position: "fixed",
        top: point?.top ?? -9999,
        left: point?.left ?? -9999,
      }}
      className={cn(
        "border-border bg-popover text-popover-foreground z-50 min-w-44 rounded-md border p-1 text-sm shadow-md motion-reduce:transition-none",
        className,
      )}
    >
      {children}
    </div>,
    document.body,
  );
}

export function DropdownMenuItem({
  className,
  variant = "default",
  disabled,
  onClick,
  ...props
}: React.ComponentProps<"button"> & {
  variant?: "default" | "destructive";
}) {
  const { setOpen } = useMenu();

  return (
    <button
      type="button"
      role="menuitem"
      disabled={disabled}
      data-variant={variant}
      className={cn(
        "hover:bg-accent focus:bg-accent focus-visible:bg-accent data-[highlighted]:bg-accent flex w-full cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm outline-none focus-visible:outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        variant === "destructive" &&
          "text-destructive hover:bg-destructive/10 focus:bg-destructive/10 focus-visible:bg-destructive/10 data-[highlighted]:bg-destructive/10",
        className,
      )}
      {...props}
      onClick={(event) => {
        onClick?.(event);

        if (!event.defaultPrevented && !disabled) {
          setOpen(false);
        }
      }}
    />
  );
}

export function DropdownMenuLabel({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "text-muted-foreground px-2 py-1.5 text-xs font-medium",
        className,
      )}
      {...props}
    />
  );
}

export function DropdownMenuSeparator({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      role="separator"
      className={cn("bg-border my-1 h-px", className)}
      {...props}
    />
  );
}

export function DropdownMenuGroup({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return <div role="group" className={cn("grid", className)} {...props} />;
}

export function DropdownMenuShortcut({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      className={cn(
        "text-muted-foreground ml-auto text-xs tracking-widest",
        className,
      )}
      {...props}
    />
  );
}

type SubContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

const SubContext = React.createContext<SubContextValue | null>(null);

function useSub() {
  const context = useContext(SubContext);

  if (!context) {
    throw new Error(
      "Dropdown submenu parts must render inside DropdownMenuSub.",
    );
  }

  return context;
}

export function DropdownMenuSub({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <SubContext.Provider value={{ open, setOpen }}>
      <div
        className="relative"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
      >
        {children}
      </div>
    </SubContext.Provider>
  );
}

export function DropdownMenuSubTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<"button">) {
  const { open, setOpen } = useSub();

  return (
    <button
      type="button"
      role="menuitem"
      aria-haspopup="menu"
      aria-expanded={open}
      data-state={open ? "open" : "closed"}
      className={cn(
        "hover:bg-accent focus:bg-accent focus-visible:bg-accent data-[state=open]:bg-accent flex w-full cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm outline-none focus-visible:outline-none",
        className,
      )}
      {...props}
      onFocus={(event) => {
        props.onFocus?.(event);
        setOpen(true);
      }}
      onKeyDown={(event) => {
        props.onKeyDown?.(event);

        if (event.key === "ArrowRight" || event.key === "Enter") {
          event.preventDefault();
          setOpen(true);
        }

        if (event.key === "ArrowLeft") {
          event.preventDefault();
          setOpen(false);
        }
      }}
    >
      <span className="min-w-0 flex-1">{children}</span>
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className="text-muted-foreground size-3.5 shrink-0"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="m9 6 6 6-6 6" />
      </svg>
    </button>
  );
}

export function DropdownMenuSubContent({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  const { open } = useSub();

  if (!open) {
    return null;
  }

  return (
    <div
      role="menu"
      data-slot="dropdown-menu-sub-content"
      className={cn(
        "border-border bg-popover text-popover-foreground absolute top-0 left-[calc(100%-0.25rem)] z-50 ml-1 min-w-36 rounded-md border p-1 text-sm shadow-md",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
