import React from "react";
import DashboardSidebar from "@/components/dashboad/sidebar/dashboard-sidebar";
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
  return (
    <div className="flex">
      <DashboardSidebar className="border-t" />
      <main className="flex-1">{children}</main>
    </div>
  );
};

export default DashboardLayout;
