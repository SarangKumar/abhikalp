import { Check } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { SUBSCRIPTION_TIER } from "@/config/subscription";
import { cn } from "@/lib/utils";

import { CheckoutButton } from "./checkout-button";

export interface PricingCardProps {
  tier: SUBSCRIPTION_TIER;
  name: string;
  description: string;
  price: number;
  features: { title: string; description?: string }[];
  isPopular?: boolean;
  footerText?: string;
  pricingHeader?: string;
}

const PricingCard = ({
  tier,
  price,
  features,
  name,
  description,
  footerText,
  pricingHeader,
  isPopular,
  isSignedIn,
  currentTier,
  billingEnabled,
}: PricingCardProps & {
  isSignedIn: boolean;
  currentTier?: SUBSCRIPTION_TIER;
  billingEnabled?: boolean;
}) => {
  return (
    <div
      className={cn(
        "bg-card mx-auto flex w-full max-w-md flex-col gap-y-2 rounded-xl border px-6 pt-4 pb-8 md:px-8",
        isPopular && "border-primary/60 ring-primary/15 ring-4"
      )}
    >
      <h2 className="inline-flex items-center gap-2 font-mono text-xl font-bold uppercase">
        {name}
        {isPopular && <Badge className="font-sans">Most Popular</Badge>}
      </h2>
      <p className="text-muted-foreground text-sm font-medium">{description}</p>
      <CheckoutButton
        tier={tier}
        isSignedIn={isSignedIn}
        currentTier={currentTier}
        billingEnabled={billingEnabled}
        size="lg"
        variant={isPopular ? "default" : "secondary"}
        className="mt-2 w-full"
      />
      <p className="text-muted-foreground text-xxs my-2">
        <span className="text-foreground font-mono text-3xl">₹{price}</span> /
        month
      </p>

      <div className="text-muted-foreground border-t py-6">
        <p className="text-xxs">{pricingHeader}</p>
        <div className="space-y-4 py-4">
          {features.map(({ title, description }) => (
            <div className="flex items-start gap-x-2" key={title}>
              <Check className="stroke-primary mt-0.5 size-4 shrink-0 stroke-2" />
              <div className="flex flex-1 flex-col">
                <p className="text-foreground text-xxs">{title}</p>
                <p className="text-muted-foreground text-xxs">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <p className="text-muted-foreground text-xs font-medium">{footerText}</p>
    </div>
  );
};

export default PricingCard;
