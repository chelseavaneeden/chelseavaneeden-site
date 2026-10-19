#!/usr/bin/env node
/*
 * DESIGN-SYSTEM GUARDRAIL (runs before every build).
 *
 * Fails the build if a raw value sneaks in outside the design-system definition files:
 *   1. hex colours or colour functions (rgb(), hsl(), oklch()…) in CSS, <style> blocks or style attributes
 *   2. arbitrary Tailwind values like text-[17px] or bg-[#fff] in markup/scripts
 *   3. inline style attributes containing anything other than var(--token) references
 *   4. font-size / font-family / line-height / letter-spacing declared without a token
 *
 * Definition files, the only places raw values may live:
 *   src/styles/tokens.css, src/styles/typography.css
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const srcDir = join(root, 'src');

const DEFINITION_FILES = [/^src\/styles\/tokens\.css$/, /^src\/styles\/typography\.css$/];
const SCANNED_EXT = /\.(astro|css|ts|tsx|js|mjs|md|mdx)$/;

const HEX = /#[0-9a-fA-F]{3,8}\b/;
const COLOR_FN = /\b(?:rgba?|hsla?|oklch|oklab|lab|lch|hwb|color)\(/;
// A Tailwind utility followed by -[...]; optional variants (md:, hover:) and important (!) prefixes.
const ARBITRARY = /(?:^|[\s"'`{])!?(?:[a-z0-9-]+:)*-?[a-z][a-z0-9-]*-\[[^\]\s]+\]/;
const FONT_DECL = /\b(font-size|font-family|line-height|letter-spacing)\s*:\s*([^;}{]+)/g;
const STYLE_ATTR = /\bstyle\s*=\s*(?:"([^"]*)"|'([^']*)'|\{`([^`]*)`\}|\{([^}]*)\})/g;

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    return statSync(p).isDirectory() ? walk(p) : SCANNED_EXT.test(p) ? [p] : [];
  });
}

const violations = [];
const report = (file, index, text, rule, snippet) => {
  const line = text.slice(0, index).split('\n').length;
  violations.push(`${file}:${line}  ${rule}  →  ${snippet.trim().slice(0, 80)}`);
};

/** Returns [{ css, offset }] chunks of CSS-context text within a file. */
function cssChunks(rel, text) {
  if (rel.endsWith('.css')) return [{ css: text, offset: 0 }];
  if (!rel.endsWith('.astro')) return [];
  return [...text.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/g)].map((m) => ({
    css: m[1],
    offset: m.index + m[0].indexOf(m[1]),
  }));
}

for (const abs of walk(srcDir)) {
  const rel = relative(root, abs).split(sep).join('/');
  if (DEFINITION_FILES.some((re) => re.test(rel))) continue;
  const text = readFileSync(abs, 'utf8');

  // 1 + 4: CSS contexts
  for (const { css, offset } of cssChunks(rel, text)) {
    const noComments = css.replace(/\/\*[\s\S]*?\*\//g, (c) => ' '.repeat(c.length));
    for (const re of [HEX, COLOR_FN]) {
      const g = new RegExp(re.source, 'g');
      for (const m of noComments.matchAll(g)) report(rel, offset + m.index, text, 'raw colour', m[0]);
    }
    for (const m of noComments.matchAll(FONT_DECL)) {
      const value = m[2].trim();
      if (!/var\(--/.test(value) && !/^(inherit|initial|unset|normal|1)$/.test(value)) {
        report(rel, offset + m.index, text, `raw ${m[1]}`, m[0]);
      }
    }
  }

  if (/\.(astro|ts|tsx|js|mjs|mdx)$/.test(rel)) {
    // 2: arbitrary Tailwind values
    const g = new RegExp(ARBITRARY.source, 'gm');
    for (const m of text.matchAll(g)) report(rel, m.index, text, 'arbitrary Tailwind value', m[0]);

    // 3: inline styles must only reference tokens
    if (rel.endsWith('.astro')) {
      for (const m of text.matchAll(STYLE_ATTR)) {
        const value = m[1] ?? m[2] ?? m[3] ?? m[4] ?? '';
        const stripped = value.replace(/var\(--[\w-]+\)|\$\{[^}]*\}/g, '');
        if (/[#\d]|\b(?:rgba?|hsla?|oklch)\(/.test(stripped)) report(rel, m.index, text, 'raw inline style', m[0]);
      }
    }
  }
}

if (violations.length) {
  console.error(`\n✖ Design-system check failed: ${violations.length} raw value(s) outside the tokens.\n`);
  console.error(violations.map((v) => '  ' + v).join('\n'));
  console.error('\nUse a token from src/styles/tokens.css or a theme file instead (see /styleguide).\n');
  process.exit(1);
}
console.log('✓ Design-system check passed: no raw colours, sizes or arbitrary values outside the tokens.');
