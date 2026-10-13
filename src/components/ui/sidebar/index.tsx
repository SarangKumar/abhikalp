"use client";

import React, { useCallback, useContext, useEffect, useState } from "react";

import { cn } from "@/lib/utils";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
} from "../drawer";
import { Tooltip } from "../tooltip";

const SIDEBAR_WIDTH = "16rem";
const SIDEBAR_WIDTH_ICON = "3rem";
const MOBILE_QUERY = "(max-width: 767px)";

type SidebarContextValue = {
  state: "expanded" | "collapsed";
  open: boolean;
  setOpen: (open: boolean | ((value: boolean) => boolean)) => void;
  openMobile: boolean;
  setOpenMobile: (open: boolean | ((value: boolean) => boolean)) => void;
  isMobile: boolean;
  toggleSidebar: () => void;
};

const SidebarContext = React.createContext<SidebarContextValue | null>(null);

export function useSidebar() {
  const context = useContext(SidebarContext);

  if (!context) {
    throw new Error("Sidebar components must render inside SidebarProvider.");
  }

  return context;
}

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window.matchMedia !== "function") {
      return;
    }

    const media = window.matchMedia(MOBILE_QUERY);
    const onChange = () => setIsMobile(media.matches);
    onChange();
    media.addEventListener("change", onChange);

    return () => media.removeEventListener("change", onChange);
  }, []);

  return isMobile;
}

type SlotChildProps = React.HTMLAttributes<HTMLElement>;

function Slot({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLElement> & {
  children: React.ReactElement<SlotChildProps>;
}) {
  if (!React.isValidElement<SlotChildProps>(children)) {
    return null;
  }

  const childProps = children.props;

  return React.cloneElement(children, {
    ...props,
    className: cn(className, childProps.className),
    onClick: (event: React.MouseEvent<HTMLElement>) => {
      props.onClick?.(event);
      childProps.onClick?.(event);
    },
  });
}

function PanelLeftIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <rect width="18" height="18" x="3" y="3" rx="2" />
      <path d="M9 3v18" />
    </svg>
  );
}

export function SidebarProvider({
  children,
  open: openProp,
  defaultOpen = true,
  onOpenChange,
  openMobile: openMobileProp,
  defaultOpenMobile = false,
  onOpenMobileChange,
  keyboardShortcut = "b",
  className,
  style,
  ...props
}: React.ComponentProps<"div"> & {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  openMobile?: boolean;
  defaultOpenMobile?: boolean;
  onOpenMobileChange?: (open: boolean) => void;
  /** Letter used with ⌘/Ctrl to toggle. Pass `false` to disable. */
  keyboardShortcut?: string | false;
}) {
  const isMobile = useIsMobile();
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const [uncontrolledOpenMobile, setUncontrolledOpenMobile] =
    useState(defaultOpenMobile);

  const open = openProp ?? uncontrolledOpen;
  const openMobile = openMobileProp ?? uncontrolledOpenMobile;

  const setOpen = useCallback(
    (value: boolean | ((current: boolean) => boolean)) => {
      const next = typeof value === "function" ? value(open) : value;

      if (openProp === undefined) {
        setUncontrolledOpen(next);
      }

      onOpenChange?.(next);
    },
    [onOpenChange, open, openProp],
  );

  const setOpenMobile = useCallback(
    (value: boolean | ((current: boolean) => boolean)) => {
      const next = typeof value === "function" ? value(openMobile) : value;

      if (openMobileProp === undefined) {
        setUncontrolledOpenMobile(next);
      }

      onOpenMobileChange?.(next);
    },
    [onOpenMobileChange, openMobile, openMobileProp],
  );

  const toggleSidebar = useCallback(() => {
    if (isMobile) {
      setOpenMobile((current) => !current);
      return;
    }

    setOpen((current) => !current);
  }, [isMobile, setOpen, setOpenMobile]);

  useEffect(() => {
    if (!keyboardShortcut) {
      return;
    }

    const key = keyboardShortcut.toLowerCase();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key.toLowerCase() !== key) {
        return;
      }

      if (!(event.metaKey || event.ctrlKey) || event.altKey || event.shiftKey) {
        return;
      }

      const target = event.target;
      if (
        target instanceof HTMLElement &&
        (target.isContentEditable ||
          target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT")
      ) {
        return;
      }

      event.preventDefault();
      toggleSidebar();
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [keyboardShortcut, toggleSidebar]);

  const state = open ? "expanded" : "collapsed";

  return (
    <SidebarContext.Provider
      value={{
        state,
        open,
        setOpen,
        openMobile,
        setOpenMobile,
        isMobile,
        toggleSidebar,
      }}
    >
      <div
        data-slot="sidebar-wrapper"
        style={
          {
            "--sidebar-width": SIDEBAR_WIDTH,
            "--sidebar-width-icon": SIDEBAR_WIDTH_ICON,
            ...style,
          } as React.CSSProperties
        }
        className={cn(
          "group/sidebar-wrapper has-data-[variant=inset]:bg-sidebar relative flex min-h-svh w-full",
          className,
        )}
        {...props}
      >
        {children}
      </div>
    </SidebarContext.Provider>
  );
}

export function Sidebar({
  side = "left",
  variant = "sidebar",
  collapsible = "icon",
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  side?: "left" | "right";
  variant?: "sidebar" | "floating" | "inset";
  collapsible?: "offcanvas" | "icon" | "none";
}) {
  const { isMobile, state, openMobile, setOpenMobile } = useSidebar();

  if (collapsible === "none") {
    return (
      <div
        data-slot="sidebar"
        data-side={side}
        data-variant={variant}
        data-state="expanded"
        className={cn(
          "bg-sidebar text-sidebar-foreground border-sidebar-border flex h-full w-(--sidebar-width) flex-col",
          side === "left" ? "border-r" : "border-l",
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  }

  if (isMobile) {
    return (
      <Drawer open={openMobile} onOpenChange={setOpenMobile}>
        <DrawerContent
          data-slot="sidebar"
          data-mobile="true"
          data-side={side}
          side={side}
          className={cn(
            "bg-sidebar text-sidebar-foreground w-(--sidebar-width) p-0",
            className,
          )}
          {...props}
        >
          <DrawerTitle className="sr-only">Sidebar</DrawerTitle>
          <DrawerDescription className="sr-only">
            Application navigation
          </DrawerDescription>
          <div className="flex h-full w-full flex-col">{children}</div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <div
      data-slot="sidebar"
      data-side={side}
      data-variant={variant}
      data-state={state}
      data-collapsible={state === "collapsed" ? collapsible : ""}
      className="group peer text-sidebar-foreground hidden md:block"
    >
      <div
        data-slot="sidebar-gap"
        className={cn(
          "relative w-(--sidebar-width) bg-transparent transition-[width] duration-200 ease-linear motion-reduce:transition-none",
          "group-data-[collapsible=offcanvas]:w-0",
          "group-data-[side=right]:rotate-180",
          variant === "floating" || variant === "inset"
            ? "group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+1rem)]"
            : "group-data-[collapsible=icon]:w-(--sidebar-width-icon)",
        )}
      />
      <div
        data-slot="sidebar-container"
        className={cn(
          "absolute inset-y-0 z-10 hidden h-full w-(--sidebar-width) transition-[left,right,width] duration-200 ease-linear motion-reduce:transition-none md:flex",
          side === "left"
            ? "left-0 group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)]"
            : "right-0 group-data-[collapsible=offcanvas]:right-[calc(var(--sidebar-width)*-1)]",
          variant === "floating" || variant === "inset"
            ? "p-2 group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+1rem+2px)]"
            : "border-sidebar-border group-data-[collapsible=icon]:w-(--sidebar-width-icon) group-data-[side=left]:border-r group-data-[side=right]:border-l",
          className,
        )}
        {...props}
      >
        <div
          data-sidebar="sidebar"
          data-slot="sidebar-inner"
          className={cn(
            "bg-sidebar flex h-full w-full flex-col overflow-hidden",
            variant === "floating" &&
              "border-sidebar-border rounded-lg border shadow-sm",
          )}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

export function SidebarTrigger({
  className,
  onClick,
  ...props
}: React.ComponentProps<"button">) {
  const { toggleSidebar } = useSidebar();

  return (
    <button
      type="button"
      data-slot="sidebar-trigger"
      data-sidebar="trigger"
      aria-label="Toggle sidebar"
      className={cn(
        "border-border bg-background text-foreground hover:bg-accent hover:text-accent-foreground focus-visible:ring-sidebar-ring focus-visible:ring-offset-background inline-flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-md border transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
        className,
      )}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) {
          toggleSidebar();
        }
      }}
      {...props}
    >
      <PanelLeftIcon className="size-4" />
      <span className="sr-only">Toggle sidebar</span>
    </button>
  );
}

export function SidebarInset({
  className,
  ...props
}: React.ComponentProps<"main">) {
  return (
    <main
      data-slot="sidebar-inset"
      className={cn(
        "bg-background relative flex min-h-full min-w-0 flex-1 flex-col",
        "peer-data-[variant=inset]:md:m-2 peer-data-[variant=inset]:md:ml-0 peer-data-[variant=inset]:md:rounded-xl peer-data-[variant=inset]:md:shadow-sm",
        className,
      )}
      {...props}
    />
  );
}

export function SidebarHeader({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-header"
      data-sidebar="header"
      className={cn(
        "flex flex-col gap-2 p-2 group-data-[collapsible=icon]:items-center",
        className,
      )}
      {...props}
    />
  );
}

export function SidebarFooter({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-footer"
      data-sidebar="footer"
      className={cn(
        "flex flex-col gap-2 p-2 group-data-[collapsible=icon]:items-center",
        className,
      )}
      {...props}
    />
  );
}

export function SidebarContent({
  className,
  ...props
}: React.ComponentProps<"nav">) {
  return (
    <nav
      aria-label="Sidebar"
      data-slot="sidebar-content"
      data-sidebar="content"
      className={cn(
        "flex min-h-0 flex-1 flex-col gap-2 overflow-auto group-data-[collapsible=icon]:overflow-hidden",
        className,
      )}
      {...props}
    />
  );
}

export function SidebarGroup({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-group"
      data-sidebar="group"
      className={cn("relative flex w-full min-w-0 flex-col p-2", className)}
      {...props}
    />
  );
}

export function SidebarGroupLabel({
  className,
  asChild = false,
  children,
  ...props
}: React.ComponentProps<"div"> & { asChild?: boolean }) {
  const classes = cn(
    "text-sidebar-foreground/70 flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium outline-none transition-[margin,opacity] duration-200 ease-linear motion-reduce:transition-none focus-visible:ring-2 focus-visible:ring-sidebar-ring [&>svg]:size-4 [&>svg]:shrink-0",
    "group-data-[collapsible=icon]:-mt-8 group-data-[collapsible=icon]:pointer-events-none group-data-[collapsible=icon]:opacity-0",
    className,
  );

  if (asChild) {
    return (
      <Slot
        data-slot="sidebar-group-label"
        data-sidebar="group-label"
        className={classes}
        {...props}
      >
        {children as React.ReactElement<SlotChildProps>}
      </Slot>
    );
  }

  return (
    <div
      data-slot="sidebar-group-label"
      data-sidebar="group-label"
      className={classes}
      {...props}
    >
      {children}
    </div>
  );
}

export function SidebarGroupContent({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-group-content"
      data-sidebar="group-content"
      className={cn("w-full text-sm", className)}
      {...props}
    />
  );
}

export function SidebarMenu({
  className,
  ...props
}: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="sidebar-menu"
      data-sidebar="menu"
      className={cn("flex w-full min-w-0 flex-col gap-1", className)}
      {...props}
    />
  );
}

export function SidebarMenuItem({
  className,
  ...props
}: React.ComponentProps<"li">) {
  return (
    <li
      data-slot="sidebar-menu-item"
      data-sidebar="menu-item"
      className={cn("group/menu-item relative", className)}
      {...props}
    />
  );
}

const menuButtonClasses =
  "peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-none ring-sidebar-ring transition-[width,height,padding,background-color,color] duration-200 ease-linear motion-reduce:transition-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0 [&>:first-child]:shrink-0 min-h-11 md:min-h-8 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground active:bg-sidebar-accent active:text-sidebar-accent-foreground data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:p-2! group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0 group-data-[collapsible=icon]:[&>:not(:first-child)]:sr-only";

export function SidebarMenuButton({
  asChild = false,
  isActive = false,
  tooltip,
  className,
  children,
  ...props
}: React.ComponentProps<"button"> & {
  asChild?: boolean;
  isActive?: boolean;
  tooltip?: React.ReactNode;
}) {
  const { state, isMobile } = useSidebar();
  const collapsed = state === "collapsed" && !isMobile;
  const classes = cn(menuButtonClasses, className);
  const accessibleName =
    typeof tooltip === "string" && collapsed ? tooltip : undefined;

  const content = asChild ? (
    <Slot
      data-slot="sidebar-menu-button"
      data-sidebar="menu-button"
      data-active={isActive}
      className={classes}
      {...props}
      aria-label={props["aria-label"] ?? accessibleName}
    >
      {children as React.ReactElement<SlotChildProps>}
    </Slot>
  ) : (
    <button
      type="button"
      data-slot="sidebar-menu-button"
      data-sidebar="menu-button"
      data-active={isActive}
      className={classes}
      {...props}
      aria-label={props["aria-label"] ?? accessibleName}
    >
      {children}
    </button>
  );

  if (!tooltip || !collapsed) {
    return content;
  }

  return (
    <Tooltip content={tooltip} side="right" delayDuration={0}>
      {
        content as React.ReactElement<
          React.HTMLAttributes<HTMLElement> & {
            ref?: React.Ref<HTMLElement>;
          }
        >
      }
    </Tooltip>
  );
}

export function SidebarSeparator({
  className,
  ...props
}: React.ComponentProps<"hr">) {
  return (
    <hr
      data-slot="sidebar-separator"
      data-sidebar="separator"
      className={cn(
        "bg-sidebar-border mx-2 h-px w-auto shrink-0 border-0",
        className,
      )}
      {...props}
    />
  );
}
