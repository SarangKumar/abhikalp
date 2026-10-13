/**
 * Single source of truth for branding. The product name has changed before
 * (e.g. Abhikalp today), so never hard-code it in components:
 * import `siteConfig` instead. NEXT_PUBLIC_* overrides let a deployment
 * rebrand without a code change.
 */
const url = (
  process.env.NEXT_PUBLIC_APP_URL || "https://abhikalp.vercel.app"
).replace(/\/$/, "");

const githubRepo = process.env.NEXT_PUBLIC_GITHUB_REPO || "Project-Sphere";

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
  author: { name: "Sarang Kumar", url: "https://github.com/SarangKumar" },
  // GitHub repo for the star count + links. Defaults to the current git remote;
  // set NEXT_PUBLIC_GITHUB_REPO after renaming the repository.
  github: { owner: "SarangKumar", repo: githubRepo },
  links: {
    github: `https://github.com/SarangKumar/${githubRepo}`,
  },
  keywords: ["Project management", "Collaboration", "Tasks", "AI", "OpenAI"],
} as const;

export type SiteConfig = typeof siteConfig;
