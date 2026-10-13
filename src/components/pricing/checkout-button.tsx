"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button, type ButtonProps } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import type { SUBSCRIPTION_TIER } from "@/config/subscription";
import { notify } from "@/lib/notify";

async function postForUrl(endpoint: string, body?: unknown) {
  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = (await res.json().catch(() => ({}))) as {
    url?: string;
    message?: string;
  };
  if (!res.ok || !data.url)
    throw new Error(data.message ?? "Something went wrong");
  return data.url;
}

/**
 * Plan CTA. Signed-out users go to sign-in; Free goes to the dashboard;
 * paid tiers start a Stripe Checkout session (or the portal if subscribed).
 */
export function CheckoutButton({
  tier,
  isSignedIn,
  currentTier,
  billingEnabled = true,
  children = "Get Started",
  ...props
}: ButtonProps & {
  tier: SUBSCRIPTION_TIER;
  isSignedIn: boolean;
  currentTier?: SUBSCRIPTION_TIER;
  billingEnabled?: boolean;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const isCurrent = isSignedIn && currentTier === tier;
  const unavailable = tier !== "FREE" && !billingEnabled;

  async function onClick() {
    if (!isSignedIn) {
      router.push(
        `/auth/sign-in?callbackUrl=${encodeURIComponent("/pricing")}`
      );
      return;
    }
    if (tier === "FREE") {
      router.push("/dashboard");
      return;
    }
    setPending(true);
    try {
      window.location.assign(
        await postForUrl("/api/v1/billing/checkout", { tier })
      );
    } catch (error) {
      notify.error("Checkout unavailable", (error as Error).message);
      setPending(false);
    }
  }

  return (
    <Button
      {...props}
      onClick={onClick}
      disabled={pending || isCurrent || unavailable || props.disabled}
    >
      {pending ? (
        <Spinner />
      ) : isCurrent ? (
        "Current plan"
      ) : unavailable ? (
        "Coming soon"
      ) : (
        children
      )}
    </Button>
  );
}

/** Opens the Stripe customer portal. */
export function ManageBillingButton(props: ButtonProps) {
  const [pending, setPending] = useState(false);
  return (
    <Button
      variant="outline"
      {...props}
      disabled={pending || props.disabled}
      onClick={async () => {
        setPending(true);
        try {
          window.location.assign(await postForUrl("/api/v1/billing/portal"));
        } catch (error) {
          notify.error("Billing portal unavailable", (error as Error).message);
          setPending(false);
        }
      }}
    >
      {pending ? <Spinner /> : (props.children ?? "Manage billing")}
    </Button>
  );
}
