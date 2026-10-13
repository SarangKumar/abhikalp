import Link from "next/link";

import { ArrowUpRight, LayoutDashboard } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { buttonVariants } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import { navLinks } from "@/constants";
import { auth } from "@/lib/auth";
import { cn } from "@/lib/utils";

import Logo from "../logo";
import NavAuth from "./nav-auth";

const Navbar = async () => {
  const session = await auth();
  return (
    <header className="border-border/60 bg-background/70 sticky top-0 z-40 border-b backdrop-blur-xl">
      <div className="relative mx-auto flex h-16 max-w-352 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-x-3 sm:gap-x-4">
          <Link
            href="/"
            className="group text-foreground flex items-center font-semibold tracking-tight sm:mr-4"
          >
            <Logo className="mr-2" />
            <span className="hidden md:inline">{siteConfig.name}</span>
          </Link>
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors"
            >
              {link.title}
            </Link>
          ))}
          {session && (
            <Link
              href="/dashboard"
              className="text-muted-foreground hover:text-foreground flex items-center gap-1.5 text-sm font-medium transition-colors"
            >
              <LayoutDashboard className="size-4" />
              Dashboard
            </Link>
          )}
        </div>
        <div className="flex items-center gap-x-1.5">
          <a
            target="_blank"
            rel="noreferrer"
            href={siteConfig.links.portfolio}
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "text-muted-foreground hidden gap-x-1 px-2 sm:inline-flex"
            )}
          >
            Portfolio
            <ArrowUpRight className="size-3.5" />
          </a>
          <ThemeToggle />
          <NavAuth />
        </div>
      </div>
    </header>
  );
};

export default Navbar;
