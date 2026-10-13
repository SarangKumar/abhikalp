import Link from "next/link";

import Logo from "@/components/logo";
import { siteConfig } from "@/config/site";

const columns = [
  {
    title: "Product",
    links: [
      { title: "Features", href: "/#features" },
      { title: "Pricing", href: "/pricing" },
      { title: "FAQ", href: "/#faq" },
    ],
  },
  {
    title: "Resources",
    links: [
      { title: "Docs", href: "/docs" },
      { title: "Guides", href: "/docs#guides" },
      { title: "API reference", href: "/docs#api" },
    ],
  },
  {
    title: "Account",
    links: [
      { title: "Sign in", href: "/auth/sign-in" },
      { title: "Sign up", href: "/auth/sign-up" },
      { title: "Dashboard", href: "/dashboard" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-border/60 mt-auto border-t">
      <div className="mx-auto grid max-w-352 gap-10 px-6 py-12 md:grid-cols-[1.5fr_repeat(3,1fr)]">
        <div className="space-y-3">
          <Link href="/" className="flex items-center gap-2">
            <Logo className="size-7 text-xs" />
            <span className="font-semibold tracking-tight">
              {siteConfig.name}
            </span>
          </Link>
          <p className="text-muted-foreground max-w-xs text-sm text-pretty">
            {siteConfig.tagline}. Projects, tasks, docs and your team in one
            calm place.
          </p>
        </div>
        {columns.map((col) => (
          <nav key={col.title} aria-label={col.title} className="space-y-3">
            <p className="text-sm font-medium">{col.title}</p>
            <ul className="text-muted-foreground space-y-2 text-sm">
              {col.links.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="hover:text-foreground transition-colors"
                  >
                    {l.title}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="border-border/60 border-t">
        <div className="text-muted-foreground mx-auto flex max-w-352 flex-col gap-2 px-6 py-5 text-xs sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {siteConfig.name}. Built by{" "}
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
          <a
            href={siteConfig.links.portfolio}
            target="_blank"
            rel="noreferrer"
            className="hover:text-foreground transition-colors"
          >
            Portfolio
          </a>
        </div>
      </div>
    </footer>
  );
}
