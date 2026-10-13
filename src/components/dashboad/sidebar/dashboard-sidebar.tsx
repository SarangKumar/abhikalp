import Link from "next/link";

import Logo from "@/components/logo";
import { siteConfig } from "@/config/site";
import { dashboardNavbarLinks } from "@/constants";
import { cn } from "@/lib/utils";

import ActiveLink from "./active-link";
import SidebarStatus from "./sidebar-status";

const DashboardSidebar = ({ className }: { className?: string }) => {
  return (
    <aside
      className={cn(
        "border-border/60 bg-card/40 sticky top-0 hidden h-dvh w-full max-w-[280px] shrink-0 flex-col border-r md:flex",
        className
      )}
    >
      <Link
        href="/"
        className="border-border/60 flex h-12 items-center gap-2 truncate border-b px-6 font-semibold tracking-tight"
      >
        <Logo className="size-6 rounded-md text-xs" />
        Dashboard
        <span className="sr-only">{siteConfig.name}</span>
      </Link>
      <div className="block flex-1 overflow-y-auto text-sm">
        {dashboardNavbarLinks.map((sectionLink) => (
          <ul
            className="border-border/60 space-y-2 border-b p-4 md:p-6"
            key={sectionLink.name}
          >
            <li className="meta text-muted-foreground truncate tracking-wide uppercase">
              {sectionLink.name}
            </li>
            {sectionLink.links.map((link) => (
              <li key={link.title} className="truncate">
                <ActiveLink href={link.href}>{link.title}</ActiveLink>
              </li>
            ))}
          </ul>
        ))}
      </div>
      <SidebarStatus className="p-4" />
    </aside>
  );
};

export default DashboardSidebar;
