import { Metadata } from "next";
import Link from "next/link";

import { OAuthButtons } from "@/components/auth/oauth-buttons";
import SignupForm from "@/components/auth/signup-form";
import { buttonVariants } from "@/components/ui/button";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = { title: "Sign up" };

export default function SignUpPage() {
  return (
    <div className="flex flex-1 flex-col gap-y-4">
      <main className="mx-auto w-full flex-1 px-6 sm:max-w-[640px]">
        <h1 className="display my-2 text-2xl lg:text-3xl">Get started</h1>
        <p className="text-muted-foreground text-sm">Create a new account</p>

        <OAuthButtons />
        <SignupForm />

        <p className="text-center text-xs">
          Have an account?{" "}
          <Link
            className={buttonVariants({ variant: "link", size: "xs" })}
            href="/auth/sign-in"
          >
            Sign In Now
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
