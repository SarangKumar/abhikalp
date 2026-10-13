import { GitHubIcon, GoogleIcon } from "@/components/icons";
import { enabledOAuthProviders } from "@/lib/auth";

import { SignInButton } from "./auth-button";

/** OAuth buttons, rendered only for providers with credentials configured. */
export function OAuthButtons({ callbackUrl }: { callbackUrl?: string }) {
  const { google, github } = enabledOAuthProviders;
  if (!google && !github) return null;

  return (
    <>
      <div className="my-6 space-y-3">
        {google && (
          <SignInButton
            variant="outline"
            size="lg"
            className="w-full gap-x-2"
            provider="google"
            callbackUrl={callbackUrl}
          >
            <GoogleIcon className="text-muted-foreground size-4" />
            Continue with Google
          </SignInButton>
        )}
        {github && (
          <SignInButton
            variant="outline"
            size="lg"
            className="w-full gap-x-2"
            provider="github"
            callbackUrl={callbackUrl}
          >
            <GitHubIcon className="text-muted-foreground size-4" />
            Continue with Github
          </SignInButton>
        )}
      </div>
      <div className="relative my-2 flex items-center gap-3 text-xs">
        <span className="bg-border h-px flex-1" />
        <span className="text-muted-foreground">or</span>
        <span className="bg-border h-px flex-1" />
      </div>
    </>
  );
}
