"use client";

import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

export type SwitcherProject = { id: string; title: string; shared: boolean };

function Initial({ title, className }: { title: string; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "bg-primary/10 text-primary ring-primary/20 flex size-8 shrink-0 items-center justify-center rounded-md text-sm font-semibold uppercase ring-1",
        className
      )}
    >
      {title.trim()[0] ?? "?"}
    </span>
  );
}

/** Sidebar header: switch between the user's own and shared projects. */
export function ProjectSwitcher({
  current,
  projects,
}: {
  current: SwitcherProject;
  projects: SwitcherProject[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();
  const [open, setOpen] = useState(false);

  // Keep the sub-page (todo, documentation, playground, …) when switching.
  const base = `/dashboard/project/${current.id}`;
  const rest = pathname.startsWith(base) ? pathname.slice(base.length) : "";

  function go(href: string) {
    setOpen(false);
    setOpenMobile(false);
    router.push(href);
  }

  const groups = [
    { heading: "Your projects", items: projects.filter((p) => !p.shared) },
    { heading: "Shared with you", items: projects.filter((p) => p.shared) },
  ];

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger>
            <SidebarMenuButton
              aria-label={`Switch project (current: ${current.title})`}
              className="h-12 group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:p-0"
            >
              <Initial title={current.title} />
              <span className="grid min-w-0 flex-1 text-left leading-tight">
                <span className="truncate text-sm font-semibold">
                  {current.title}
                </span>
                <span className="text-sidebar-foreground/60 truncate text-xs">
                  {current.shared ? "Shared project" : "Your project"}
                </span>
              </span>
              <ChevronsUpDown className="text-sidebar-foreground/60 ml-auto size-4" />
            </SidebarMenuButton>
          </PopoverTrigger>
          <PopoverContent align="start" side="bottom" className="w-64 p-0">
            <Command>
              <CommandInput placeholder="Search projects…" />
              <CommandList className="max-h-72">
                <CommandEmpty>No projects found.</CommandEmpty>
                {groups.map((group) =>
                  group.items.length ? (
                    <CommandGroup key={group.heading} heading={group.heading}>
                      {group.items.map((p) => (
                        <CommandItem
                          key={p.id}
                          value={p.title}
                          onClick={() =>
                            go(`/dashboard/project/${p.id}${rest}`)
                          }
                        >
                          <Initial title={p.title} className="size-6 text-xs" />
                          <span className="min-w-0 flex-1 truncate">
                            {p.title}
                          </span>
                          {p.id === current.id && (
                            <Check className="text-primary size-4" />
                          )}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  ) : null
                )}
                <CommandGroup heading="Actions">
                  <CommandItem
                    value="New project"
                    onClick={() => go("/dashboard/create/project")}
                  >
                    <span className="flex size-6 items-center justify-center rounded-md border border-dashed">
                      <Plus className="size-3.5" />
                    </span>
                    New project
                  </CommandItem>
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
