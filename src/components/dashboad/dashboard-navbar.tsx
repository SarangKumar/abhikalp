import { Menu } from "lucide-react";

import { getUserBySession } from "@/app/api/utils";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import { AvatarHoverCard } from "../navbar/user-profile";
import DashboardSidebar from "./sidebar/dashboard-sidebar";

const DashboardNavbar = async ({ title }: { title: string }) => {
  const user = await getUserBySession({ project: false });
  if (!user) return null;

  return (
    <Sheet>
      <div className="bg-background/70 sticky top-0 z-20 backdrop-blur-xl">
        <header className="border-border/60 flex h-12 items-center justify-between border-b px-4 md:px-6">
          <span className="flex items-center gap-x-2">
            <SheetTrigger>
              <Button
                size="icon-sm"
                variant="ghost"
                className="md:hidden"
                aria-label="Open navigation"
              >
                <Menu className="size-4" />
              </Button>
            </SheetTrigger>
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
      <SheetContent side="left" className="w-[280px] p-0">
        <SheetTitle className="sr-only">Navigation</SheetTitle>
        <DashboardSidebar className="flex h-full w-full max-w-none border-r-0" />
      </SheetContent>
    </Sheet>
  );
};

export default DashboardNavbar;
