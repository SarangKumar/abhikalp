/**
 * Single source of truth for branding. The product name has changed before
 * (Project Sphere -> Sankalp -> ...), so never hard-code it in components:
 * import `siteConfig` instead. NEXT_PUBLIC_* overrides let a deployment
 * rebrand without a code change.
 */
const url = (
  process.env.NEXT_PUBLIC_APP_URL || "https://project-sphere.vercel.app"
).replace(/\/$/, "");

export const siteConfig = {
  name: process.env.NEXT_PUBLIC_APP_NAME || "Project Sphere",
  shortName: process.env.NEXT_PUBLIC_APP_SHORT_NAME || "Sphere",
  /** Letter shown in the square logo mark. */
  logoMark: "P",
  tagline: "Transform Your Project Workflow",
  description:
    "Project Sphere is a collaborative platform that allows users to create and manage projects. Users can sign in, create projects, share, manage it and more",
  url,
  ogImage: `${url}/og.jpg`,
  author: { name: "Sarang Kumar", url: "https://github.com/SarangKumar" },
  github: { owner: "SarangKumar", repo: "Project-Sphere" },
  links: {
    github: "https://github.com/SarangKumar/Project-Sphere",
  },
  keywords: ["Project management", "Collaboration", "Tasks", "AI", "OpenAI"],
} as const;

export type SiteConfig = typeof siteConfig;
