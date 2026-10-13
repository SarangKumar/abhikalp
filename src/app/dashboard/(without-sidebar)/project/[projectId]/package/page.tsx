import { Metadata } from "next";

import PackageFinder from "@/components/dashboad/project/package-finder";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Package Finder",
  description: `Find the right npm package for your ${siteConfig.name} project.`,
};

export default function PackagePage() {
  return (
    <div className="mx-auto max-w-6xl space-y-4 p-4 md:p-6">
      <div>
        <h1 className="page-title">Package Finder</h1>
        <p className="text-muted-foreground text-sm">
          Search the npm registry in plain words and compare packages by
          popularity, freshness and quality.
        </p>
      </div>
      <PackageFinder />
    </div>
  );
}
