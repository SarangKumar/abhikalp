import Link from "next/link";

import { GitHubIcon } from "@/components/icons";
import { ThemeToggle } from "@/components/theme-toggle";
import { buttonVariants } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import { navLinks } from "@/constants";
import { formatCompactNumber } from "@/lib/formatters";
import { cn } from "@/lib/utils";

import Logo from "../logo";
import NavAuth from "./nav-auth";

async function getGithubStars(): Promise<string | null> {
  try {
    const res = await fetch(
      `https://api.github.com/repos/${siteConfig.github.owner}/${siteConfig.github.repo}`,
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) return null;
    const data = (await res.json()) as { stargazers_count?: number };
    return typeof data.stargazers_count === "number"
      ? formatCompactNumber(data.stargazers_count)
      : null;
  } catch {
    return null;
  }
}

const Navbar = async () => {
  const githubStars = await getGithubStars();

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
        </div>
        <div className="flex items-center gap-x-1.5">
          <a
            target="_blank"
            rel="noreferrer"
            href={siteConfig.links.github}
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "text-muted-foreground gap-x-2 px-2"
            )}
          >
            <GitHubIcon className="size-4" />
            <span className="sr-only">GitHub</span>
            {githubStars && <span className="text-xxs">{githubStars}</span>}
          </a>
          <ThemeToggle />
          <NavAuth />
        </div>
      </div>
    </header>
  );
};

export default Navbar;
