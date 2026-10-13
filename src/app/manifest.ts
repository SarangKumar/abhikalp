import { MetadataRoute } from "next";

import { siteConfig } from "@/config/site";

const SIZES = [48, 72, 96, 120, 128, 144, 180, 192, 384, 512];

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteConfig.name,
    short_name: siteConfig.shortName,
    description: siteConfig.description,
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#0b0712",
    theme_color: "#7c3aed",
    icons: [
      ...SIZES.map((size) => ({
        src: `/icons/icon-${size}.png`,
        sizes: `${size}x${size}`,
        type: "image/png",
      })),
      {
        src: "/icons/maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      { src: "/icons/icon.svg", sizes: "any", type: "image/svg+xml" },
    ],
  };
}
