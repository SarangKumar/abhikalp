import "server-only";

import Stripe from "stripe";

let client: Stripe | null = null;

/**
 * Lazily created so `next build` works without Stripe keys.
 * Throws at request time if STRIPE_SECRET_KEY is missing.
 */
export function getStripe(): Stripe {
  if (client) return client;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY is not set (see .env.example).");
  }
  client = new Stripe(key, { appInfo: { name: "project-sphere" } });
  return client;
}

export function getAppUrl() {
  return (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(
    /\/$/,
    ""
  );
}
