import Link from "next/link";

import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

/** Brand mark: same artwork as the favicon (scripts/generate-icons.mjs). */
function Mark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 512 512"
      aria-hidden="true"
      className={cn("size-8 shrink-0", className)}
    >
      <defs>
        <linearGradient id="logo-tile" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#241433" />
          <stop offset="1" stopColor="#120a1c" />
        </linearGradient>
        <linearGradient id="logo-glyph" x1="0.2" y1="0" x2="0.8" y2="1">
          <stop offset="0" stopColor="#f3e8ff" />
          <stop offset="0.45" stopColor="#c4a1ff" />
          <stop offset="1" stopColor="#8b5cf6" />
        </linearGradient>
        <linearGradient id="logo-rim" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#d8b4fe" stopOpacity="0.9" />
          <stop offset="1" stopColor="#7c3aed" stopOpacity="0.5" />
        </linearGradient>
      </defs>
      <rect width="512" height="512" rx="128" fill="url(#logo-tile)" />
      <rect
        x="10"
        y="10"
        width="492"
        height="492"
        rx="120"
        fill="none"
        stroke="url(#logo-rim)"
        strokeWidth="20"
      />
      <g transform="translate(256 262) scale(1.18) translate(-256 -262)">
        <path
          d="M150 360 L256 160 L362 360"
          fill="none"
          stroke="url(#logo-glyph)"
          strokeWidth="92"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M218 330 H294"
          stroke="#e9d5ff"
          strokeOpacity="0.92"
          strokeWidth="39"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
}

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
        className="inline-flex rounded-lg"
      >
        <Mark className={className} />
      </Link>
    );
  }
  return <Mark className={className} />;
};

export default Logo;
