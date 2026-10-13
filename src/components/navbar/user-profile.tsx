"use client";

import { SignOutButton } from "@/components/auth/auth-button";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

import Avatar from "./avatar";

export const UserProfile = ({
  name,
  email,
  image,
}: {
  name: string;
  email: string;
  image: string;
}) => {
  return (
    <div className="flex items-center gap-x-2">
      <Avatar image={image} name={name} size="base" />
      <div className="flex min-w-0 flex-col items-start">
        <span className="truncate text-sm font-medium">{name}</span>
        <span className="text-muted-foreground truncate text-xs">{email}</span>
      </div>
    </div>
  );
};

export const AvatarHoverCard = ({
  name,
  email,
  image,
  size = "base",
}: {
  name: string | null | undefined;
  email: string | null | undefined;
  image: string | null | undefined;
  size?: "sm" | "base" | "lg";
}) => {
  const n = name || "";
  return (
    <HoverCard>
      <HoverCardTrigger>
        <button type="button" className="rounded-full">
          <Avatar image={image || ""} name={n} size={size} />
          <span className="sr-only">{n}&apos;s profile</span>
        </button>
      </HoverCardTrigger>
      <HoverCardContent align="end" className="w-64">
        <UserProfile name={n} email={email || ""} image={image || ""} />
        <div className="mt-4 flex justify-end">
          <SignOutButton>Sign Out</SignOutButton>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};
