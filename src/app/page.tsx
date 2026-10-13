import { ArrowRight } from "lucide-react";
import Link from "next/link";

import AuthenticationCard from "@/components/card/authentication-card";
import ColabCard from "@/components/card/colab-card";
import TaskManagementCard from "@/components/card/task-management-card";
import { Footer } from "@/components/footer";
import Hero from "@/components/hero";
import { Faq } from "@/components/home/faq";
import { FeaturesGrid } from "@/components/home/features-grid";
import { HowItWorks } from "@/components/home/how-it-works";
import { PricingTeaser } from "@/components/home/pricing-teaser";
import { ProductPreview } from "@/components/home/product-preview";
import { Section } from "@/components/home/section";
import Navbar from "@/components/navbar/navbar";
import { buttonVariants } from "@/components/ui/button";
import { siteConfig } from "@/config/site";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="relative mx-auto max-w-352 overflow-hidden px-6 pt-8 md:pt-16">
        <Hero />
        <div className="px-0 pb-8 md:px-8">
          <ProductPreview />
        </div>

        <Section
          id="features"
          eyebrow="Features"
          title="Everything a project needs, in one place"
          description="Plan the work, keep the docs, share with your team, and research without switching tabs."
        >
          <FeaturesGrid />
        </Section>

        <Section
          eyebrow="In detail"
          title="Built for solo developers and large teams"
        >
          <div className="relative grid w-full grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
            <TaskManagementCard className="lg:col-span-2" />
            <AuthenticationCard />
            <ColabCard />
          </div>
        </Section>

        <Section
          eyebrow="How it works"
          title="From idea to shipped in three steps"
        >
          <HowItWorks />
        </Section>

        <Section
          id="pricing"
          eyebrow="Pricing"
          title="Start free, upgrade when you grow"
        >
          <PricingTeaser />
        </Section>

        <Section id="faq" eyebrow="FAQ" title="Questions, answered">
          <Faq />
        </Section>

        <section className="mesh mb-16 rounded-3xl border px-6 py-14 text-center md:mb-24 md:py-20">
          <h2 className="display text-3xl text-balance md:text-5xl">
            Ready to <span className="text-primary">conquer</span> your next
            project?
          </h2>
          <p className="text-muted-foreground mx-auto mt-3 max-w-lg text-sm md:text-base">
            Join {siteConfig.name} and bring your tasks, docs and team together
            today.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <Link
              href="/auth/sign-up"
              className={buttonVariants({ size: "lg" })}
            >
              Create your first project
              <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/docs"
              className={buttonVariants({ size: "lg", variant: "ghost" })}
            >
              Read the docs
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
