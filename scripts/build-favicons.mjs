#!/usr/bin/env node
/*
 * Generates the favicons from the logo swoosh (public/brand/logo-mark.svg),
 * coloured with the brand tokens in src/styles/tokens.css. Re-run after a brand change:
 *   npm run brand:favicons
 */
import sharp from 'sharp';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const tokens = readFileSync(`${root}src/styles/tokens.css`, 'utf8');
const token = (name) => {
  const m = tokens.match(new RegExp(`--${name}:\\s*(#[0-9a-fA-F]{6})`));
  if (!m) throw new Error(`Token --${name} not found in tokens.css`);
  return m[1];
};
const mark = token('ochre-600');
const markOnDark = token('linen-100');
const background = token('linen-100');

const markSvg = readFileSync(`${root}public/brand/logo-mark.svg`, 'utf8');
const pathData = [...markSvg.matchAll(/<path[^>]*\sd="([^"]+)"/g)].map((m) => m[1]);

// Find the swoosh's bounds inside the 82×36 logo artwork.
const scale = 20;
const { info } = await sharp(Buffer.from(markSvg), { density: 72 * scale })
  .trim({ threshold: 1 })
  .toBuffer({ resolveWithObject: true });
const x = -info.trimOffsetLeft / scale;
const y = -info.trimOffsetTop / scale;
const w = info.width / scale;
const h = info.height / scale;

// Square viewBox around the swoosh with a little breathing room.
const side = Math.max(w, h) * 1.12;
const vx = (x + w / 2 - side / 2).toFixed(2);
const vy = (y + h / 2 - side / 2).toFixed(2);
const viewBox = `${vx} ${vy} ${side.toFixed(2)} ${side.toFixed(2)}`;
const paths = pathData.map((d) => `<path d="${d}"/>`).join('');

// SVG favicon: ochre on light browser chrome, linen on dark.
writeFileSync(
  `${root}public/favicon.svg`,
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}"><style>g{fill:${mark}}@media (prefers-color-scheme:dark){g{fill:${markOnDark}}}</style><g>${paths}</g></svg>`,
);

// PNG fallbacks: ochre swoosh on the linen brand background.
const tile = (size) => {
  const pad = size * 0.16;
  const inner = size - pad * 2;
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">` +
      `<rect width="${size}" height="${size}" fill="${background}"/>` +
      `<svg x="${pad}" y="${pad}" width="${inner}" height="${inner}" viewBox="${viewBox}"><g fill="${mark}">${paths}</g></svg></svg>`,
  );
};
for (const [file, size] of [
  ['favicon-32.png', 32],
  ['apple-touch-icon.png', 180],
  ['icon-512.png', 512],
]) {
  await sharp(tile(size)).png().toFile(`${root}public/${file}`);
}

console.log(`✓ Favicons written (swoosh bounds ${w.toFixed(1)}×${h.toFixed(1)} at ${x.toFixed(1)},${y.toFixed(1)})`);
