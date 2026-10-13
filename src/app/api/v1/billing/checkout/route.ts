import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { getUserBySession } from "@/app/api/utils";
import { getStripePriceId, isBillingConfigured } from "@/config/subscription";
import { getOrCreateStripeCustomer } from "@/lib/billing";
import { getAppUrl, getStripe } from "@/lib/stripe";

export const runtime = "nodejs";

const bodySchema = z.object({ tier: z.enum(["GOLD", "PLATINUM"]) });

/** Start a Stripe Checkout session for a paid plan. Returns { url }. */
export async function POST(req: NextRequest) {
  if (!isBillingConfigured()) {
    return NextResponse.json(
      { message: "Billing is not set up yet. Please try again later." },
      { status: 503 }
    );
  }
  const user = await getUserBySession();
  if (!user) {
    return NextResponse.json(
      { message: "Please sign in first." },
      { status: 401 }
    );
  }

  const parsed = bodySchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ message: "Unknown plan." }, { status: 400 });
  }

  const price = getStripePriceId(parsed.data.tier);
  if (!price) {
    return NextResponse.json(
      { message: `Stripe price for ${parsed.data.tier} is not configured.` },
      { status: 500 }
    );
  }

  try {
    const stripe = getStripe();
    const appUrl = getAppUrl();
    const customer = await getOrCreateStripeCustomer(user);

    // Already subscribed: plan changes go through the billing portal so
    // Stripe handles proration instead of creating a second subscription.
    if (user.stripeSubscriptionId && user.subscription !== "FREE") {
      const portal = await stripe.billingPortal.sessions.create({
        customer,
        return_url: `${appUrl}/dashboard/settings`,
      });
      return NextResponse.json({ url: portal.url });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer,
      client_reference_id: user.id,
      line_items: [{ price, quantity: 1 }],
      allow_promotion_codes: true,
      subscription_data: { metadata: { userId: user.id } },
      metadata: { userId: user.id },
      success_url: `${appUrl}/dashboard/settings?checkout=success`,
      cancel_url: `${appUrl}/pricing?checkout=cancelled`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("[billing] checkout failed", error);
    return NextResponse.json(
      { message: "Could not start checkout." },
      { status: 500 }
    );
  }
}
