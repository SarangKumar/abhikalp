import { Metadata } from "next";
import React from "react";

import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Web Scrape",
  description: `Utilize web scraping tools to gather data and insights for your projects in ${siteConfig.name}.`,
};

const ProjectWebScrapePage = () => {
  return <div>ProjectWebScrapePage</div>;
};

export default ProjectWebScrapePage;
