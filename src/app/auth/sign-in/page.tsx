import { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { OAuthButtons } from "@/components/auth/oauth-buttons";
import SignInForm from "@/components/auth/signin-form";
import { buttonVariants } from "@/components/ui/button";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = { title: "Sign in" };

export default function SignInPage() {
  return (
    <div className="flex flex-1 flex-col gap-y-4">
      <main className="mx-auto w-full flex-1 px-6 sm:max-w-[640px]">
        <h1 className="display my-2 text-2xl lg:text-3xl">Welcome back</h1>
        <p className="text-muted-foreground text-sm">Sign in to your account</p>

        <OAuthButtons />
        <Suspense>
          <SignInForm />
        </Suspense>

        <p className="text-center text-xs">
          Don&apos;t have an account?{" "}
          <Link
            className={buttonVariants({ variant: "link", size: "xs" })}
            href="/auth/sign-up"
          >
            Sign Up Now
          </Link>
        </p>
      </main>
      <p className="text-muted-foreground mx-auto w-full px-6 text-center text-xs text-balance sm:max-w-[640px]">
        By continuing, you agree to {siteConfig.name}&apos;s Terms of Service
        and Privacy Policy, and to receive periodic emails with updates.
      </p>
    </div>
  );
}
