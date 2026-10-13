import "server-only";

import type Stripe from "stripe";

import { getTierForPriceId } from "@/config/subscription";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";

const ACTIVE_STATUSES: Stripe.Subscription.Status[] = ["active", "trialing"];

/** Return the user's Stripe customer id, creating the customer if needed. */
export async function getOrCreateStripeCustomer(user: {
  id: string;
  email: string;
  name: string;
  stripeCustomerId: string | null;
}) {
  if (user.stripeCustomerId) return user.stripeCustomerId;

  const customer = await getStripe().customers.create({
    email: user.email,
    name: user.name,
    metadata: { userId: user.id },
  });
  await prisma.user.update({
    where: { id: user.id },
    data: { stripeCustomerId: customer.id },
  });
  return customer.id;
}

function periodEnd(subscription: Stripe.Subscription): Date | null {
  // Newer API versions moved current_period_end onto subscription items.
  const item = subscription.items.data[0] as
    (Stripe.SubscriptionItem & { current_period_end?: number }) | undefined;
  const legacy = (subscription as unknown as { current_period_end?: number })
    .current_period_end;
  const seconds = item?.current_period_end ?? legacy;
  return seconds ? new Date(seconds * 1000) : null;
}

/**
 * Mirror a Stripe subscription onto the user. The webhook is the only writer,
 * so the DB always reflects Stripe (the source of truth).
 */
export async function syncSubscription(subscription: Stripe.Subscription) {
  const customerId =
    typeof subscription.customer === "string"
      ? subscription.customer
      : subscription.customer.id;

  const userId = subscription.metadata?.userId;
  const user = userId
    ? await prisma.user.findUnique({ where: { id: userId } })
    : await prisma.user.findFirst({ where: { stripeCustomerId: customerId } });

  if (!user) {
    console.warn(`[billing] no user for Stripe customer ${customerId}`);
    return;
  }

  const priceId = subscription.items.data[0]?.price.id ?? null;
  const tier = getTierForPriceId(priceId);
  const isActive = ACTIVE_STATUSES.includes(subscription.status);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscription.id,
      stripePriceId: priceId,
      stripeStatus: subscription.status,
      stripeCurrentPeriodEnd: periodEnd(subscription),
      stripeCancelAtPeriodEnd: subscription.cancel_at_period_end,
      subscription: isActive && tier ? tier : "FREE",
    },
  });
}
