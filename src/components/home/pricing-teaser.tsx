import { Check } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { pricingPlans } from "@/constants";
import { cn } from "@/lib/utils";

export function PricingTeaser() {
  return (
    <div className="mx-auto grid max-w-5xl gap-4 md:grid-cols-3">
      {pricingPlans.map((plan) => (
        <div
          key={plan.tier}
          className={cn(
            "bg-card flex flex-col rounded-xl border p-6",
            plan.isPopular &&
              "border-primary/50 shadow-[0_0_32px_-8px_var(--logo-glow)]"
          )}
        >
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">{plan.name}</h3>
            {plan.isPopular && <Badge>Popular</Badge>}
          </div>
          <p className="text-muted-foreground mt-1 text-sm">
            {plan.description}
          </p>
          <p className="mt-4">
            <span className="font-mono text-3xl">₹{plan.price}</span>
            <span className="text-muted-foreground text-sm"> / month</span>
          </p>
          <ul className="text-muted-foreground mt-4 flex-1 space-y-2 text-sm">
            {plan.features.slice(0, 3).map((f) => (
              <li key={f.title} className="flex gap-2">
                <Check className="text-primary mt-0.5 size-4 shrink-0" />
                {f.title}
              </li>
            ))}
          </ul>
        </div>
      ))}
      <div className="flex justify-center pt-2 md:col-span-3">
        <Link
          href="/pricing"
          className={buttonVariants({ variant: "outline" })}
        >
          Compare all plans
        </Link>
      </div>
    </div>
  );
}
