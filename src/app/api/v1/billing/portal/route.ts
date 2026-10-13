import { NextResponse } from "next/server";

import { getUserBySession } from "@/app/api/utils";
import { getAppUrl, getStripe } from "@/lib/stripe";

export const runtime = "nodejs";

/** Open the Stripe customer portal (manage card, cancel, switch plan). */
export async function POST() {
  const user = await getUserBySession();
  if (!user) {
    return NextResponse.json(
      { message: "Please sign in first." },
      { status: 401 }
    );
  }
  if (!user.stripeCustomerId) {
    return NextResponse.json(
      { message: "No billing account yet." },
      { status: 400 }
    );
  }

  try {
    const session = await getStripe().billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${getAppUrl()}/dashboard/settings`,
    });
    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("[billing] portal failed", error);
    return NextResponse.json(
      { message: "Could not open billing portal." },
      { status: 500 }
    );
  }
}
