#!/usr/bin/env node
/**
 * Generate brand-tinted placeholder portraits for the narrators collection so the
 * page renders end-to-end via astro:assets <Image> before real photography exists.
 * Output: src/assets/images/narrators/*.jpg  (deep-green gradient + serif initials).
 *
 * Run: node scripts/gen-narrator-placeholders.mjs   (sharp is already a dependency)
 * These are stand-ins — swap for real Inner Explorer photos before publishing.
 */
import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import sharp from 'sharp';

const OUT = join(dirname(fileURLToPath(import.meta.url)), '../src/assets/images/narrators');
mkdirSync(OUT, { recursive: true });

// [filename, width, height, initials]
const jobs = [
  ['maya-castellanos-wide.jpg', 1600, 686, 'MC'],
  ['maya-castellanos.jpg', 900, 1125, 'MC'],
  ['jordan-okafor.jpg', 900, 1125, 'JO'],
  ['aisha-rahman.jpg', 900, 1125, 'AR'],
  ['priya-sundaram.jpg', 900, 1125, 'PS'],
];

const svg = (w, h, initials) => `
<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#117a4c"/>
      <stop offset="1" stop-color="#04382a"/>
    </linearGradient>
    <radialGradient id="r" cx="30%" cy="28%" r="75%">
      <stop offset="0" stop-color="#2cb56a" stop-opacity="0.55"/>
      <stop offset="1" stop-color="#2cb56a" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#g)"/>
  <rect width="${w}" height="${h}" fill="url(#r)"/>
  <text x="50%" y="50%" text-anchor="middle" dominant-baseline="central"
    font-family="Georgia, 'Times New Roman', serif" font-style="italic"
    font-size="${Math.round(Math.min(w, h) * 0.34)}" fill="#ffffff" fill-opacity="0.32"
    letter-spacing="-2">${initials}</text>
</svg>`;

for (const [name, w, h, initials] of jobs) {
  await sharp(Buffer.from(svg(w, h, initials)))
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile(join(OUT, name));
  console.log(`✓ ${name}  ${w}×${h}`);
}
console.log('Done. Placeholders are stand-ins — swap for real photography before publishing.');
