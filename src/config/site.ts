/**
 * Single source of truth for branding. The product name has changed before
 * (e.g. Abhikalp today), so never hard-code it in components:
 * import `siteConfig` instead. NEXT_PUBLIC_* overrides let a deployment
 * rebrand without a code change.
 */
const url = (
  process.env.NEXT_PUBLIC_APP_URL || "https://abhikalp.vercel.app"
).replace(/\/$/, "");

const appName = process.env.NEXT_PUBLIC_APP_NAME || "Abhikalp";

export const siteConfig = {
  name: appName,
  shortName: process.env.NEXT_PUBLIC_APP_SHORT_NAME || appName,
  /** Letter shown in the square logo mark. */
  logoMark: appName.trim()[0]?.toUpperCase() ?? "A",
  tagline: "Transform Your Project Workflow",
  description:
    "Abhikalp is a collaborative platform that allows users to create and manage projects. Users can sign in, create projects, share, manage it and more",
  url,
  ogImage: `${url}/og.jpg`,
  author: { name: "Sarang Kumar", url: "https://sarangkumar.vercel.app" },
  links: {
    portfolio: "https://sarangkumar.vercel.app",
  },
  keywords: ["Project management", "Collaboration", "Tasks", "AI", "OpenAI"],
} as const;

export type SiteConfig = typeof siteConfig;
