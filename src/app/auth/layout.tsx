import Logo from "@/components/logo";
import { siteConfig } from "@/config/site";
import { Metadata } from "next";
import React from "react";

import { ThemeToggle } from "@/components/theme-toggle";

export const metadata: Metadata = {
  title: {
    template: `%s | Authentication | ${siteConfig.name}`,
    default: `Authentication | ${siteConfig.name}`,
  },
  description: `Sign in or sign up securely on ${siteConfig.name}. Manage your account and access your projects with ease.`,
  openGraph: {
    title: `Authentication | ${siteConfig.name}`,
    description: `Sign in or sign up securely on ${siteConfig.name}. Manage your account and access your projects with ease.`,
    url: `${siteConfig.url}/auth/sign-in`,
    siteName: siteConfig.name,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `Authentication | ${siteConfig.name}`,
    description: `Sign in or sign up securely on ${siteConfig.name}. Manage your account and access your projects with ease.`,
    creator: "Sarang Kumar",
  },
  alternates: {
    canonical: `${siteConfig.url}/auth/sign-in`,
  },
};

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="grid h-dvh grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      <div className="border-border/60 flex flex-col justify-between gap-12 border-r p-4 md:px-8">
        <div className="flex items-center justify-between">
          <Logo asLink={true} />
          <ThemeToggle />
        </div>
        {children}
      </div>
      <div className="bg-card mesh hidden justify-center p-16 md:col-span-1 md:flex lg:col-span-2">
        <div className="text-muted-foreground mx-auto flex max-w-[480px] items-center justify-center text-sm leading-relaxed md:text-base lg:text-lg">
          {siteConfig.name} is a collaborative platform that allows users to
          create and manage projects. Users can sign in, create projects, and
          share them with others through a link. The platform also integrates
          Stripe for subscriptions, allowing users to create more projects. Each
          project includes a built-in ChatGPT assistant to help with various
          tasks.
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
