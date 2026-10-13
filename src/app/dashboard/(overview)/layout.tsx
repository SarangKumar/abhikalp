import React from "react";
import { DashboardShell } from "@/components/dashboad/sidebar/dashboard-shell";
import { dashboardNav } from "@/components/dashboad/sidebar/nav";
import { Metadata } from "next";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: {
    template: `%s | Dashboard | ${siteConfig.name}`,
    default: `Dashboard | ${siteConfig.name}`,
  },
  description: `Explore your projects and manage them efficiently on ${siteConfig.name}'s dashboard. Collaborate with your team seamlessly.`,
  alternates: {
    canonical: `${siteConfig.url}/dashboard/project`,
  },
};

const DashboardLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return <DashboardShell nav={dashboardNav}>{children}</DashboardShell>;
};

export default DashboardLayout;
