import Link from "next/link";

import { siteConfig } from "@/config/site";
import { navLinks } from "@/constants";

export function Footer() {
  return (
    <footer className="border-border/60 mt-auto border-t">
      <div className="mx-auto flex max-w-352 flex-col gap-4 px-4 py-6 sm:flex-row sm:items-center sm:justify-between md:px-6 md:py-8">
        <div className="space-y-1">
          <p className="text-foreground/90 text-[13px] font-medium tracking-tight">
            {siteConfig.name}
          </p>
          <p className="text-muted-foreground text-[13px] leading-relaxed text-pretty">
            Built by{" "}
            <a
              href={siteConfig.author.url}
              target="_blank"
              rel="noreferrer"
              className="text-foreground font-medium underline underline-offset-4"
            >
              Sarang
            </a>{" "}
            with lots of effort, debugging skills.
          </p>
        </div>
        <nav className="text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[12px]">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="hover:text-foreground inline-flex min-h-8 items-center transition-colors"
            >
              {link.title}
            </Link>
          ))}
          <a
            href={siteConfig.links.github}
            target="_blank"
            rel="noreferrer"
            className="hover:text-foreground inline-flex min-h-8 items-center transition-colors"
          >
            GitHub
          </a>
        </nav>
      </div>
    </footer>
  );
}
