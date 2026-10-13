// Generates favicon / PWA icons for the brand mark.
// Usage: npm run icons
// Mark: a soft, rounded "A" chevron with a plan bar (a task card) beneath,
// on a deep-plum tile with a lavender rim, in the spirit of Aavedak's icons.
// Small sizes (<= 48px) use a simplified, higher-contrast variant so the glyph
// stays crisp at 16/32px.
import { mkdir, writeFile } from "node:fs/promises";

import sharp from "sharp";

const SIZES = [48, 72, 96, 120, 128, 144, 180, 192, 384, 512];

const defs = `
  <linearGradient id="tile" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#241433"/>
    <stop offset="1" stop-color="#120a1c"/>
  </linearGradient>
  <linearGradient id="glyph" x1="0.2" y1="0" x2="0.8" y2="1">
    <stop offset="0" stop-color="#f3e8ff"/>
    <stop offset="0.45" stop-color="#c4a1ff"/>
    <stop offset="1" stop-color="#8b5cf6"/>
  </linearGradient>
  <linearGradient id="rim" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#d8b4fe" stop-opacity="0.9"/>
    <stop offset="1" stop-color="#7c3aed" stop-opacity="0.5"/>
  </linearGradient>
  <radialGradient id="sheen" cx="0.3" cy="0.15" r="0.75">
    <stop offset="0" stop-color="#c084fc" stop-opacity="0.28"/>
    <stop offset="1" stop-color="#c084fc" stop-opacity="0"/>
  </radialGradient>
  <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
    <feGaussianBlur stdDeviation="14"/>
  </filter>`;

const glyph = (w, bar = 0.62) => `
  <path d="M150 360 L256 160 L362 360" fill="none" stroke="url(#glyph)"
        stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>
  ${bar ? `<path d="M218 330 H294" stroke="#e9d5ff" stroke-opacity="0.92" stroke-width="${Math.round(w * bar)}" stroke-linecap="round"/>` : ""}`;

/** Full-detail mark (app icons, apple icon, manifest). */
const detailed = ({ maskable = false } = {}) => `
<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <defs>${defs}</defs>
  ${
    maskable
      ? `<rect width="512" height="512" fill="url(#tile)"/><rect width="512" height="512" fill="url(#sheen)"/>
         <g transform="translate(51 51) scale(0.8)">${glyph(70)}</g>`
      : `<rect x="28" y="28" width="456" height="456" rx="116" fill="#a855f7" opacity="0.45" filter="url(#glow)"/>
         <rect x="32" y="32" width="448" height="448" rx="112" fill="url(#tile)"/>
         <rect x="32" y="32" width="448" height="448" rx="112" fill="url(#sheen)"/>
         <rect x="34" y="34" width="444" height="444" rx="110" fill="none" stroke="url(#rim)" stroke-width="4"/>
         <g opacity="0.55" filter="url(#glow)">${glyph(70)}</g>
         ${glyph(70)}`
  }
</svg>`;

/** Favicon variant: full-bleed tile, bolder strokes, no blur. 16px drops the bar. */
const favicon = (bar) => `
<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <defs>${defs}</defs>
  <rect width="512" height="512" rx="128" fill="url(#tile)"/>
  <rect x="10" y="10" width="492" height="492" rx="120" fill="none" stroke="url(#rim)" stroke-width="20"/>
  <g transform="translate(256 262) scale(1.18) translate(-256 -262)">${glyph(92, bar)}</g>
</svg>`;
const small = favicon(0.42);
const tiny = favicon(0);

const png = (svg, size) =>
  sharp(Buffer.from(svg), { density: 384 }).resize(size, size).png();

/** ICO containing PNG images (supported by all current browsers). */
async function ico(sizes) {
  const images = await Promise.all(
    sizes.map((s) => png(s <= 16 ? tiny : small, s).toBuffer())
  );
  const header = Buffer.alloc(6 + 16 * images.length);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);
  let offset = header.length;
  images.forEach((img, i) => {
    const e = 6 + i * 16;
    header.writeUInt8(sizes[i] % 256, e);
    header.writeUInt8(sizes[i] % 256, e + 1);
    header.writeUInt16LE(1, e + 4);
    header.writeUInt16LE(32, e + 6);
    header.writeUInt32LE(img.length, e + 8);
    header.writeUInt32LE(offset, e + 12);
    offset += img.length;
  });
  return Buffer.concat([header, ...images]);
}

await mkdir("public/icons", { recursive: true });
for (const size of SIZES) {
  await png(size <= 48 ? small : detailed(), size).toFile(
    `public/icons/icon-${size}.png`
  );
}
await png(detailed({ maskable: true }), 512).toFile(
  "public/icons/maskable-512.png"
);
await png(tiny, 16).toFile("public/icons/favicon-16.png");
await png(small, 32).toFile("public/icons/favicon-32.png");
// Next.js file conventions.
await writeFile("src/app/favicon.ico", await ico([16, 32, 48]));
await png(small, 64).toFile("src/app/icon.png");
await png(detailed(), 180).toFile("src/app/apple-icon.png");
await writeFile("public/icons/icon.svg", small);
// Preview sheet: 512 detailed + 32/16 favicons at 1x and zoomed.
const sheet = sharp({
  create: { width: 880, height: 560, channels: 4, background: "#f6f3fb" },
});
const zoom = (s, z) =>
  png(s <= 16 ? tiny : small, s)
    .toBuffer()
    .then((b) =>
      sharp(b)
        .resize(s * z, s * z, { kernel: "nearest" })
        .png()
        .toBuffer()
    );
await sheet
  .composite([
    { input: await png(detailed(), 512).toBuffer(), left: 24, top: 24 },
    { input: await zoom(32, 6), left: 580, top: 40 },
    { input: await zoom(16, 8), left: 580, top: 300 },
    { input: await png(small, 32).toBuffer(), left: 800, top: 120 },
    { input: await png(tiny, 16).toBuffer(), left: 808, top: 360 },
  ])
  .png()
  .toFile("public/icons/preview.png");
console.log("Generated icons + public/icons/preview.png");
