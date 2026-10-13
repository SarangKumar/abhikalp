import Link from "next/link";

import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

const markClass =
  "bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-lg font-extrabold uppercase shadow-[0_0_16px_var(--logo-glow)]";

const Logo = ({
  className,
  asLink = false,
}: {
  className?: string;
  asLink?: boolean;
}) => {
  if (asLink) {
    return (
      <Link
        href="/"
        aria-label={`${siteConfig.name} home`}
        className={cn(markClass, className)}
      >
        {siteConfig.logoMark}
      </Link>
    );
  }
  return (
    <span className={cn(markClass, className)}>{siteConfig.logoMark}</span>
  );
};

export default Logo;
