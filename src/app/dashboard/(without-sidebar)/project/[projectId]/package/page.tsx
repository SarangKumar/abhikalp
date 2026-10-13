import { Metadata } from "next";
import React from "react";

import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Package Search",
  description: `Search and discover npm packages based on your prompts to enhance your projects in ${siteConfig.name}.`,
};

const ProjectPackagePage = () => {
  return <div>ProjectPackagePage</div>;
};

export default ProjectPackagePage;
