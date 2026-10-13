// Plan limits and Stripe price mapping. Display copy lives in src/constants.

export const SUBSCRIPTION_TIERS = ["FREE", "GOLD", "PLATINUM"] as const;
export type SUBSCRIPTION_TIER = (typeof SUBSCRIPTION_TIERS)[number];
export type PaidTier = Exclude<SUBSCRIPTION_TIER, "FREE">;

export interface SubscriptionConfig {
  tier: SUBSCRIPTION_TIER;
  maxProjects: number;
  chatModel: string;
}

export const subscriptions: Record<SUBSCRIPTION_TIER, SubscriptionConfig> = {
  FREE: { tier: "FREE", maxProjects: 3, chatModel: "gpt-3.5-turbo" },
  GOLD: { tier: "GOLD", maxProjects: 10, chatModel: "gpt-3.5-turbo" },
  PLATINUM: { tier: "PLATINUM", maxProjects: 30, chatModel: "gpt-4" },
};

export const getSubscriptionConfig = (
  tier: SUBSCRIPTION_TIER
): SubscriptionConfig => subscriptions[tier];

export function isPaidTier(tier: string): tier is PaidTier {
  return tier === "GOLD" || tier === "PLATINUM";
}

/**
 * Stripe Price IDs per paid tier (server-side only). Create one recurring
 * price per plan in the Stripe dashboard and put its id in the env.
 */
export function getStripePriceId(tier: PaidTier): string | undefined {
  return {
    GOLD: process.env.STRIPE_PRICE_GOLD,
    PLATINUM: process.env.STRIPE_PRICE_PLATINUM,
  }[tier];
}

export function getTierForPriceId(
  priceId: string | null | undefined
): PaidTier | null {
  if (!priceId) return null;
  if (priceId === process.env.STRIPE_PRICE_GOLD) return "GOLD";
  if (priceId === process.env.STRIPE_PRICE_PLATINUM) return "PLATINUM";
  return null;
}
