import { Metadata } from "next";
import Link from "next/link";

import { getUserBySession } from "@/app/api/utils";
import DashboardNavbar from "@/components/dashboad/dashboard-navbar";
import { ManageBillingButton } from "@/components/pricing/checkout-button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  getSubscriptionConfig,
  isBillingConfigured,
} from "@/config/subscription";

export const metadata: Metadata = {
  title: "Settings",
  description:
    "Manage your account settings, subscription details, and preferences. Customize your experience and ensure your projects are secure and well-organized.",
};

const SettingsPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ checkout?: string }>;
}) => {
  const [{ checkout }, user] = await Promise.all([
    searchParams,
    getUserBySession({ project: true }),
  ]);
  if (!user) return null;

  const plan = getSubscriptionConfig(user.subscription);
  const renews = user.stripeCurrentPeriodEnd?.toLocaleDateString("en-IN", {
    dateStyle: "medium",
  });

  return (
    <div>
      <DashboardNavbar title="Settings" />
      <div className="mx-auto w-full max-w-3xl space-y-6 px-4 py-6 text-sm">
        {checkout === "success" && (
          <Alert>
            Thanks! Your payment went through. Your plan updates as soon as
            Stripe confirms it (usually a few seconds).
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Subscription <Badge>{user.subscription}</Badge>
            </CardTitle>
            <CardDescription>
              {user.projects.length} of {plan.maxProjects} projects used · AI
              model: {plan.chatModel}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {user.stripeStatus && (
              <p className="text-muted-foreground">
                Status:{" "}
                <span className="text-foreground">{user.stripeStatus}</span>
                {renews && (
                  <>
                    {" · "}
                    {user.stripeCancelAtPeriodEnd ? "Ends" : "Renews"} on{" "}
                    <span className="text-foreground">{renews}</span>
                  </>
                )}
              </p>
            )}
            <div className="flex flex-wrap gap-2">
              <Link href="/pricing" className={buttonVariants()}>
                {user.subscription === "FREE"
                  ? "Upgrade plan"
                  : "Compare plans"}
              </Link>
              {user.stripeCustomerId && isBillingConfigured() && (
                <ManageBillingButton />
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>{user.email}</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <span className="text-muted-foreground">Theme</span>
            <ThemeToggle />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SettingsPage;
