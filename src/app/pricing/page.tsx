import { Metadata } from "next";

import { getUserBySession } from "@/app/api/utils";
import { Footer } from "@/components/footer";
import Navbar from "@/components/navbar/navbar";
import Faq from "@/components/pricing/faq";
import PricingCard from "@/components/pricing/pricing-card";
import {
  PricingTablePlanLg,
  PricingTablePlanSm,
} from "@/components/pricing/pricing-table";
import { siteConfig } from "@/config/site";
import { pricingPlans } from "@/constants";

export const metadata: Metadata = {
  title: "Pricing & Fees",
  description: `We offer flexible pricing plans to fit every team's needs. Whether you're just starting or scaling up, ${siteConfig.name} has the perfect plan for you.`,
};

const PricingPage = async () => {
  const user = await getUserBySession().catch(() => null);
  const auth = { isSignedIn: Boolean(user), currentTier: user?.subscription };

  return (
    <>
      <Navbar />
      <div className="relative mx-auto max-w-352 overflow-hidden px-6 py-16 pt-8 md:py-24 md:pt-16">
        <header className="mesh mt-8 mb-16 flex flex-col items-center justify-center space-y-2 rounded-3xl py-10">
          <h1 className="display text-center text-2xl text-balance md:text-4xl">
            Pricing Plans
          </h1>
          <p className="text-muted-foreground max-w-3xl text-center text-base text-balance md:text-lg">
            Find the Perfect Plan for Your Needs
          </p>
        </header>

        <main className="grid grid-cols-1 place-content-around items-stretch gap-5 lg:grid-cols-3">
          {pricingPlans.map((plan) => (
            <PricingCard key={plan.name} {...plan} {...auth} />
          ))}
        </main>

        <div className="my-16 flex flex-col items-center justify-center space-y-2">
          <h2 className="display text-center text-2xl text-balance md:text-3xl">
            Find the Perfect Plan for Your Needs
          </h2>
          <p className="text-muted-foreground max-w-3xl text-center text-base text-balance md:text-lg">
            We offer flexible pricing plans to fit every team&apos;s needs.
            Whether you&apos;re just starting or scaling up, {siteConfig.name}{" "}
            has the perfect plan for you.
          </p>
        </div>

        <PricingTablePlanLg {...auth} />
        <PricingTablePlanSm {...auth} />
      </div>

      <div className="my-16 flex w-full max-w-7xl flex-col items-center justify-center space-y-2 lg:mx-auto">
        <Faq />
      </div>

      <Footer />
    </>
  );
};

export default PricingPage;
