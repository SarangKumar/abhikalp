"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import Logo from "@/components/logo";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar";
import { siteConfig } from "@/config/site";

export type NavItem = {
  title: string;
  href: string;
  icon: React.ReactNode;
  /** Match the path exactly instead of as a prefix. */
  exact?: boolean;
};
export type NavSection = { name: string; items: NavItem[] };

/** App navigation built on the Vinyaas Sidebar (icon-collapsible, drawer on mobile). */
export function AppSidebar({
  sections,
  subtitle,
  footer,
}: {
  sections: NavSection[];
  subtitle: string;
  footer?: React.ReactNode;
}) {
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();
  const isActive = (item: NavItem) =>
    item.exact
      ? pathname === item.href
      : pathname === item.href || pathname.startsWith(`${item.href}/`);

  return (
    <Sidebar collapsible="icon" className="fixed h-svh">
      <SidebarHeader>
        <Link
          href="/"
          onClick={() => setOpenMobile(false)}
          className="focus-visible:ring-sidebar-ring flex items-center gap-2 rounded-md px-1 py-1.5 outline-none focus-visible:ring-2"
        >
          <Logo className="size-8 shrink-0 text-sm" />
          <span className="grid min-w-0 group-data-[collapsible=icon]:hidden">
            <span className="truncate text-sm font-semibold tracking-tight">
              {siteConfig.name}
            </span>
            <span className="text-sidebar-foreground/60 truncate text-xs">
              {subtitle}
            </span>
          </span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        {sections.map((section) => (
          <SidebarGroup key={section.name}>
            <SidebarGroupLabel>{section.name}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive(item)}
                      tooltip={item.title}
                    >
                      <Link
                        href={item.href}
                        onClick={() => setOpenMobile(false)}
                      >
                        {item.icon}
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      {footer && (
        <>
          <SidebarSeparator />
          <SidebarFooter className="group-data-[collapsible=icon]:hidden">
            {footer}
          </SidebarFooter>
        </>
      )}
    </Sidebar>
  );
}
