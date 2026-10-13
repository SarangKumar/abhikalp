import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

import { AppSidebar, type NavSection } from "./app-sidebar";
import SidebarStatus from "./sidebar-status";

/** Dashboard chrome: Vinyaas Sidebar + inset content area. */
export function DashboardShell({
  nav,
  subtitle = "Dashboard",
  header,
  children,
}: {
  nav: NavSection[];
  subtitle?: string;
  header?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider className="min-h-svh">
      <AppSidebar
        sections={nav}
        subtitle={subtitle}
        header={header}
        footer={<SidebarStatus className="px-1 py-1" />}
      />
      <SidebarInset className="min-w-0">{children}</SidebarInset>
    </SidebarProvider>
  );
}
