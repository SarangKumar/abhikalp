import { Metadata } from "next";

import { siteConfig } from "@/config/site";

const description = `Explore ${siteConfig.name}'s documentation to learn about features, API references, and how-tos. Start using ${siteConfig.name} effectively.`;

export const metadata: Metadata = {
  title: {
    template: `%s | Documentation | ${siteConfig.name}`,
    default: `Documentation | ${siteConfig.name}`,
  },
  description,
  openGraph: {
    title: `Documentation | ${siteConfig.name}`,
    description,
    url: `${siteConfig.url}/docs`,
    siteName: siteConfig.name,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `Documentation | ${siteConfig.name}`,
    description,
  },
  alternates: { canonical: `${siteConfig.url}/docs` },
};

// TODO(docs): real documentation content.
const DocumentationPage = () => {
  return (
    <div className="text-muted-foreground p-6">
      Documentation is coming soon.
    </div>
  );
};

export default DocumentationPage;
