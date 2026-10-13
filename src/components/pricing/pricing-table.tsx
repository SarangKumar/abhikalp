import { CircleCheck, CircleMinus, Info } from "lucide-react";

import { Tooltip } from "@/components/ui/tooltip";
import type { SUBSCRIPTION_TIER } from "@/config/subscription";
import { pricingFeatures, pricingPlans } from "@/constants";
import { cn } from "@/lib/utils";

import { CheckoutButton } from "./checkout-button";
import type { PricingCardProps } from "./pricing-card";

type AuthProps = {
  isSignedIn: boolean;
  currentTier?: SUBSCRIPTION_TIER;
  billingEnabled?: boolean;
};

export const PricingTablePlanLg = (auth: AuthProps) => {
  return (
    <table className="mt-24 mb-16 hidden w-full table-auto lg:table">
      <thead>
        <tr className="relative">
          <th className="invisible" />
          {pricingPlans.map((plan) => (
            <TableHead key={plan.name} {...plan} {...auth} />
          ))}
        </tr>
      </thead>
      <tbody>
        {pricingFeatures.map((feature, index) => (
          <tr key={index} className="border-t">
            <TableTd
              head
              title={feature.feature.title}
              description={feature.feature.description}
            />
            <TableTd
              title={feature.FREE.title}
              description={feature.FREE.description}
            />
            <TableTd
              title={feature.GOLD.title}
              description={feature.GOLD.description}
            />
            <TableTd
              title={feature.PLATINUM.title}
              description={feature.PLATINUM.description}
            />
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export const PricingTablePlanSm = (auth: AuthProps) => {
  return (
    <div className="mx-auto mt-24 mb-16 max-w-3xl space-y-12 lg:hidden">
      {(["FREE", "GOLD", "PLATINUM"] as const).map((plan) => (
        <PricingTablePlansCol key={plan} plan={plan} {...auth} />
      ))}
    </div>
  );
};

export const PricingTablePlansCol = ({
  plan,
  ...auth
}: { plan: SUBSCRIPTION_TIER } & AuthProps) => {
  const selectedPlan = pricingPlans.find((p) => p.tier === plan);
  if (!selectedPlan) return <>Plan not found</>;

  return (
    <table className="w-full">
      <thead>
        <tr className="relative">
          <TableHead
            {...selectedPlan}
            {...auth}
            colSpan={2}
            className="w-full"
          />
        </tr>
      </thead>
      <tbody>
        {pricingFeatures.map((feature, index) => (
          <tr key={index} className="border-t">
            <TableTd
              head
              title={feature.feature.title}
              description={feature.feature.description}
            />
            <TableTd
              title={feature[plan].title}
              description={feature[plan].description}
            />
          </tr>
        ))}
      </tbody>
    </table>
  );
};

const TableRowToolTip = ({
  title,
  description,
}: {
  title: string;
  description?: string;
}) => {
  return (
    <td className="px-4 lg:pr-12 lg:whitespace-nowrap">
      <span className="text-xs sm:text-sm">{title}</span>
      {description && (
        <Tooltip
          content={<p className="max-w-64 whitespace-normal">{description}</p>}
        >
          <span tabIndex={0} className="ml-2 inline-flex align-middle">
            <Info className="text-muted-foreground shrink-0" size={14} />
            <span className="sr-only">{description}</span>
          </span>
        </Tooltip>
      )}
    </td>
  );
};

export const TableHead = ({
  tier,
  name,
  price,
  colSpan,
  className,
  isSignedIn,
  currentTier,
  billingEnabled,
}: PricingCardProps & AuthProps & { colSpan?: number; className?: string }) => {
  return (
    <th
      colSpan={colSpan}
      className={cn(
        "bg-background sticky top-16 gap-y-1 p-4 text-left",
        className
      )}
    >
      <h3 className="flex flex-row items-center gap-2 font-mono">
        <span className="text-xl font-semibold uppercase">{name}</span>
        <span className="text-muted-foreground my-2 text-sm font-normal">
          <span className="text-foreground text-lg">₹{price}</span>/ month
        </span>
      </h3>
      <CheckoutButton
        tier={tier}
        isSignedIn={isSignedIn}
        currentTier={currentTier}
        billingEnabled={billingEnabled}
        className="w-full"
      />
    </th>
  );
};

export const TableTd = ({
  title,
  description,
  head,
}: {
  title: string;
  description: string;
  head?: boolean;
}) => {
  if (head) return <TableRowToolTip title={title} description={description} />;
  if (title === "-") {
    return (
      <td className="p-4">
        <CircleMinus className="text-muted-foreground/80 shrink-0" size={16} />
      </td>
    );
  }
  if (title.toLowerCase() === "yes") {
    return (
      <td className="p-4">
        <CircleCheck className="text-primary shrink-0" size={16} />
      </td>
    );
  }
  return (
    <td className="p-4">
      <strong className="text-foreground block text-xs font-medium md:text-sm">
        {title}
      </strong>
      {description && (
        <span className="text-muted-foreground text-xs md:text-sm">
          {description}
        </span>
      )}
    </td>
  );
};
