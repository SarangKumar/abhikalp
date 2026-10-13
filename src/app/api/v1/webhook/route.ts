import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";

import { syncSubscription } from "@/lib/billing";
import { getStripe } from "@/lib/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SUBSCRIPTION_EVENTS = new Set<Stripe.Event.Type>([
  "customer.subscription.created",
  "customer.subscription.updated",
  "customer.subscription.deleted",
  "customer.subscription.paused",
  "customer.subscription.resumed",
]);

/**
 * Stripe webhook. Configure the endpoint as <APP_URL>/api/v1/webhook and
 * subscribe to checkout.session.completed and customer.subscription.*.
 */
export async function POST(req: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = req.headers.get("stripe-signature");
  if (!secret || !signature) {
    return NextResponse.json(
      { error: "Webhook not configured" },
      { status: 400 }
    );
  }

  const stripe = getStripe();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(await req.text(), signature, secret);
  } catch (error) {
    console.error("[webhook] signature verification failed", error);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      if (session.mode === "subscription" && session.subscription) {
        const id =
          typeof session.subscription === "string"
            ? session.subscription
            : session.subscription.id;
        const subscription = await stripe.subscriptions.retrieve(id);
        if (!subscription.metadata?.userId && session.client_reference_id) {
          subscription.metadata = {
            ...subscription.metadata,
            userId: session.client_reference_id,
          };
        }
        await syncSubscription(subscription);
      }
    } else if (SUBSCRIPTION_EVENTS.has(event.type)) {
      await syncSubscription(event.data.object as Stripe.Subscription);
    }
  } catch (error) {
    console.error(`[webhook] failed to handle ${event.type}`, error);
    // 500 makes Stripe retry.
    return NextResponse.json({ error: "Handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
