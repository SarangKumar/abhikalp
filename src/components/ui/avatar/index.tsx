"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import { cn } from "@/lib/utils";

type AvatarStatus = "idle" | "loading" | "loaded" | "error";

const AvatarContext = createContext<{
  status: AvatarStatus;
  setStatus: (status: AvatarStatus) => void;
} | null>(null);

function useAvatar() {
  const context = useContext(AvatarContext);

  if (!context) {
    throw new Error(
      "AvatarImage and AvatarFallback must render inside Avatar.",
    );
  }

  return context;
}

export type AvatarProps = React.ComponentProps<"span">;

export function Avatar({ className, ref, ...props }: AvatarProps) {
  const [status, setStatus] = useState<AvatarStatus>("idle");

  return (
    <AvatarContext.Provider value={{ status, setStatus }}>
      <span
        ref={ref}
        className={cn(
          "border-border relative flex size-10 shrink-0 rounded-full border",
          className,
        )}
        {...props}
      />
    </AvatarContext.Provider>
  );
}

export type AvatarImageProps = React.ComponentProps<"img">;

export function AvatarImage({
  className,
  alt,
  src,
  ref,
  onLoad,
  onError,
  ...props
}: AvatarImageProps) {
  const { status, setStatus } = useAvatar();
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const image = imageRef.current;

    if (image?.complete) {
      setStatus(image.naturalWidth > 0 ? "loaded" : "error");
    } else {
      setStatus("loading");
    }

    return () => {
      setStatus("idle");
    };
  }, [setStatus, src]);

  return (
    // The installed component is a native image, not a Next.js image.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      ref={(node) => {
        imageRef.current = node;

        if (typeof ref === "function") {
          ref(node);
        } else if (ref) {
          ref.current = node;
        }
      }}
      alt={alt}
      src={src}
      {...props}
      hidden={status === "error" ? true : undefined}
      className={cn(
        "aspect-square size-full rounded-[inherit] object-cover",
        status === "loaded" ? "block" : "sr-only",
        className,
      )}
      onLoad={(event) => {
        setStatus("loaded");
        onLoad?.(event);
      }}
      onError={(event) => {
        setStatus("error");
        onError?.(event);
      }}
    />
  );
}

export type AvatarFallbackProps = React.ComponentProps<"span">;

export function AvatarFallback({
  className,
  ref,
  ...props
}: AvatarFallbackProps) {
  const { status } = useAvatar();

  if (status === "loaded") {
    return null;
  }

  return (
    <span
      ref={ref}
      {...props}
      aria-hidden={status === "loading" ? true : undefined}
      className={cn(
        "bg-muted text-muted-foreground flex size-full items-center justify-center rounded-[inherit] text-xs font-medium [&_svg]:size-3.5",
        className,
      )}
    />
  );
}

export type AvatarBadgeStatus =
  "online" | "offline" | "away" | "busy" | "default";

const badgeStatusClasses: Record<AvatarBadgeStatus, string> = {
  online: "bg-emerald-500 text-white",
  offline: "bg-muted-foreground text-background",
  away: "bg-amber-500 text-white",
  busy: "bg-destructive text-white",
  default: "bg-primary text-primary-foreground",
};

export type AvatarBadgeProps = React.ComponentProps<"span"> & {
  /** Picks the badge color. Use `default` for tier or role labels. */
  status?: AvatarBadgeStatus;
};

/**
 * Anchors to the bottom-right of the Avatar. Without children it renders a
 * status dot (give it an `aria-label`; it defaults to the status name). With
 * text children it renders a one-line label such as "PRO" or "Admin"; with a
 * single icon child it renders a round dot holding that symbol (add an
 * `aria-label`, since the icon itself is decorative).
 */
export function AvatarBadge({
  className,
  status = "default",
  children,
  ref,
  ...props
}: AvatarBadgeProps) {
  const hasContent =
    children !== undefined && children !== null && children !== false;

  return (
    <span
      ref={ref}
      data-slot="avatar-badge"
      data-status={status}
      // A named badge (dot, or icon with aria-label) is exposed as an image;
      // a plain text label is read as its text.
      {...(!hasContent || props["aria-label"]
        ? { role: "img", "aria-label": props["aria-label"] ?? status }
        : {})}
      className={cn(
        "ring-background absolute flex items-center justify-center ring-2",
        badgeStatusClasses[status],
        hasContent
          ? // whitespace-nowrap keeps labels like "ADMIN" on one line; a lone icon
            // child (a check, crown, …) renders as a round size-4 dot instead.
            "right-0 bottom-0 min-h-4 min-w-4 translate-x-1/4 translate-y-1/4 rounded-full px-1 text-[10px] leading-none font-semibold whitespace-nowrap uppercase has-[>svg:only-child]:size-4 has-[>svg:only-child]:px-0 [&_svg]:size-2.5 [&_svg]:shrink-0"
          : "right-0 bottom-0 size-2.5 rounded-full",
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
