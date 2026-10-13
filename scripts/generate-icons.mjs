// Generates PWA / favicon PNGs from a brand SVG.
// Usage: node scripts/generate-icons.mjs   (re-run after renaming the app)
// The glyph is the first letter of NEXT_PUBLIC_APP_NAME (default "Abhikalp").
import { mkdir, writeFile } from "node:fs/promises";

import sharp from "sharp";

const name = process.env.NEXT_PUBLIC_APP_NAME || "Abhikalp";
const letter = name.trim()[0]?.toUpperCase() ?? "A";
const SIZES = [48, 72, 96, 120, 128, 144, 180, 192, 384, 512];

const svg = (padding = 0) => `
<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#a855f7"/>
      <stop offset="1" stop-color="#5b21b6"/>
    </linearGradient>
    <radialGradient id="h" cx="0.3" cy="0.2" r="0.8">
      <stop offset="0" stop-color="#ffffff" stop-opacity="0.35"/>
      <stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect x="${padding}" y="${padding}" width="${512 - padding * 2}" height="${512 - padding * 2}" rx="${padding ? 0 : 112}" fill="url(#g)"/>
  <rect x="${padding}" y="${padding}" width="${512 - padding * 2}" height="${512 - padding * 2}" rx="${padding ? 0 : 112}" fill="url(#h)"/>
  <text x="256" y="256" dy="0.35em" text-anchor="middle" font-family="Helvetica, Arial, sans-serif"
        font-size="${padding ? 260 : 300}" font-weight="700" fill="#ffffff">${letter}</text>
</svg>`;

await mkdir("public/icons", { recursive: true });
const base = Buffer.from(svg());
for (const size of SIZES) {
  await sharp(base)
    .resize(size, size)
    .png()
    .toFile(`public/icons/icon-${size}.png`);
}
// Maskable: full-bleed background so launchers can crop to any shape.
await sharp(Buffer.from(svg(1)))
  .resize(512, 512)
  .png()
  .toFile("public/icons/maskable-512.png");
// Next.js file conventions: favicon/app icon + Apple touch icon.
await sharp(base).resize(64, 64).png().toFile("src/app/icon.png");
await sharp(base).resize(180, 180).png().toFile("src/app/apple-icon.png");
await writeFile("public/icons/icon.svg", svg());
console.log(`Generated icons for "${name}" (${letter}).`);
