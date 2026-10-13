"use client";

import { signOut } from "next-auth/react";
import { useEffect } from "react";

import { Alert } from "@/components/ui/alert";

// next-auth v4 error codes (+ our SessionExpired) → friendly copy.
const MESSAGES: Record<string, string> = {
  SessionExpired: "Your session has expired. Please sign in again.",
  CredentialsSignin: "Incorrect email or password.",
  OAuthAccountNotLinked:
    "This email is already linked to another sign-in method. Use the method you signed up with.",
  OAuthSignin: "Could not start sign-in with that provider. Please try again.",
  OAuthCallback: "The provider rejected the sign-in. Please try again.",
  Callback: "Something went wrong finishing sign-in. Please try again.",
  OAuthCreateAccount: "Could not create your account. Please try again.",
  AccessDenied: "Access was denied.",
  Configuration:
    "Sign-in is misconfigured on the server. Check the auth environment variables.",
  Verification: "This sign-in link is no longer valid.",
};

export function AuthError({ error }: { error?: string }) {
  // A stale session cookie (user no longer exists) must be cleared, otherwise
  // the proxy keeps treating the visitor as signed in.
  useEffect(() => {
    if (error === "SessionExpired") void signOut({ redirect: false });
  }, [error]);

  if (!error) return null;
  return (
    <Alert variant="destructive" className="my-4" role="alert">
      {MESSAGES[error] ?? "Sign-in failed. Please try again."}
    </Alert>
  );
}
