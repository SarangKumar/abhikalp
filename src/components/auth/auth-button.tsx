"use client";

import { signIn, signOut } from "next-auth/react";
import { useState } from "react";

import { Button, type ButtonProps } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

export interface SignInButtonProps extends ButtonProps {
  provider: "google" | "github";
  callbackUrl?: string;
}

export const SignInButton = ({
  provider,
  callbackUrl = "/dashboard",
  children,
  ...props
}: SignInButtonProps) => {
  const [pending, setPending] = useState(false);
  return (
    <Button
      {...props}
      disabled={pending || props.disabled}
      onClick={() => {
        setPending(true);
        void signIn(provider, { callbackUrl });
      }}
    >
      {pending ? <Spinner /> : children}
    </Button>
  );
};

export const SignOutButton = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <Button
      size="sm"
      variant="secondary"
      className={className}
      onClick={() => signOut({ callbackUrl: "/" })}
    >
      {children}
    </Button>
  );
};
