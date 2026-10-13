import { getUserBySession } from "@/app/api/utils";
import { ThemeToggle } from "@/components/theme-toggle";
import { SidebarTrigger } from "@/components/ui/sidebar";

import { AvatarHoverCard } from "../navbar/user-profile";

const DashboardNavbar = async ({ title }: { title: string }) => {
  const user = await getUserBySession({ project: false });
  if (!user) return null;

  return (
    <div className="bg-background/70 sticky top-0 z-20 backdrop-blur-xl">
      <header className="border-border/60 flex h-12 items-center justify-between border-b px-4 md:px-6">
        <span className="flex items-center gap-x-2">
          <SidebarTrigger aria-label="Toggle navigation" />
          <p className="section-title text-muted-foreground">{title}</p>
        </span>
        <span className="flex items-center gap-x-1.5">
          <ThemeToggle />
          <AvatarHoverCard
            name={user.name}
            email={user.email}
            image={user.image}
            size="sm"
          />
        </span>
      </header>
    </div>
  );
};

export default DashboardNavbar;
