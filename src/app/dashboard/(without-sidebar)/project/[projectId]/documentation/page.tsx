import { Metadata } from "next";
import React from "react";

import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Documentation",
  description: `Access comprehensive documentation and guides for using ${siteConfig.name} effectively.`,
};

const ProjectDocsPage = () => {
  return <div>ProjectDocsPage</div>;
};

export default ProjectDocsPage;
