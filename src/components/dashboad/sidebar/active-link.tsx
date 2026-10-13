"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

interface ActiveLinkProps extends React.HTMLProps<HTMLAnchorElement> {
  href: string;
  children: React.ReactNode;
}

const ActiveLink = ({
  className,
  href,
  children,
  ...props
}: ActiveLinkProps) => {
  const pathname = usePathname();
  const isActive = pathname === href;
  return (
    <Link
      {...props}
      href={href}
      className={cn(
        "text-muted-foreground hover:text-foreground w-full",
        isActive && "text-foreground",
        className
      )}
    >
      {children}
    </Link>
  );
};

export default ActiveLink;
