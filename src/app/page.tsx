import { BellRing } from "lucide-react";
import Link from "next/link";

import AiAssistantCard from "@/components/card/ai-assistant-card";
import AuthenticationCard from "@/components/card/authentication-card";
import ColabCard from "@/components/card/colab-card";
import TaskManagementCard from "@/components/card/task-management-card";
import WebScrapeCard from "@/components/card/web-scrape-card";
import { EncryptButton } from "@/components/dev/encryption-button";
import { Footer } from "@/components/footer";
import Hero from "@/components/hero";
import Navbar from "@/components/navbar/navbar";
import { buttonVariants } from "@/components/ui/button";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="relative mx-auto max-w-352 overflow-hidden px-6 py-16 pt-8 md:py-24 md:pt-16">
        <Hero />
        <div className="flex flex-wrap items-center justify-center gap-2 py-8">
          <Link href="/auth/sign-up" className={buttonVariants({ size: "lg" })}>
            <BellRing className="animate-wave mr-2 size-4 stroke-2" />
            Get Started
          </Link>
          <Link
            href="/pricing"
            className={buttonVariants({ size: "lg", variant: "outline" })}
          >
            View Pricing
          </Link>
          <EncryptButton targetText="SarangKumar" />
        </div>
        <div className="relative grid w-full grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
          <TaskManagementCard className="lg:col-span-2" />
          <AuthenticationCard />
          <ColabCard />
          <WebScrapeCard />
          <AiAssistantCard />
        </div>
      </main>
      <Footer />
    </>
  );
}
