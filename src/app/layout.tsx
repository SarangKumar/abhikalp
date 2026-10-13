import { Analytics } from "@vercel/analytics/react";
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { TailwindIndicator } from "@/components/dev/tailwind-indicator";
import Providers from "@/components/providers";
import { Toaster } from "@/components/ui/toast";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: `${siteConfig.name} - ${siteConfig.tagline}`,
    template: `%s | ${siteConfig.name}`,
  },
  metadataBase: new URL(siteConfig.url),
  description: siteConfig.description,
  applicationName: siteConfig.name,
  keywords: [siteConfig.name, ...siteConfig.keywords],
  authors: [siteConfig.author],
  creator: siteConfig.author.name,
  openGraph: {
    type: "website",
    siteName: siteConfig.name,
    title: `${siteConfig.name} - ${siteConfig.tagline}`,
    description: siteConfig.description,
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} - ${siteConfig.tagline}`,
    description: siteConfig.description,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0b0812" },
  ],
  colorScheme: "dark light",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={cn(geistSans.variable, geistMono.variable, "h-full")}
      suppressHydrationWarning
    >
      <body
        className="bg-background text-foreground selection:bg-primary/30 min-h-dvh font-sans text-[15px] antialiased"
        suppressHydrationWarning
      >
        <Providers>{children}</Providers>
        <Toaster />
        <TailwindIndicator />
        <Analytics />
      </body>
    </html>
  );
}
