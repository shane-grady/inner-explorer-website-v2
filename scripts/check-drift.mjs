#!/usr/bin/env node
/**
 * Design-drift guard. Fails if component source uses off-system styling.
 *
 * WHY: AI agents (and humans in a hurry) reach for one-off values — bg-[#3b82f6],
 * mt-[13px], inline hex colors, a <style> block — instead of design tokens. Those silently
 * erode the system until every screen is "almost" consistent. This makes that a hard error
 * so every color / size / space comes from the design tokens (see DESIGN.md).
 *
 * Markup (src and src-help): no arbitrary Tailwind values, no raw colors.
 * Markup (src only): no <style> blocks; a style="…" attribute may only set custom
 * properties (--x) or object-position.
 * Stylesheets (src/styles/base.css and components.css): no raw colors, and no lengths
 * other than 0, 1px and 2px outside var() — everything else is a token (tokens.css and
 * theme.css are the definitions and are exempt).
 *
 * Escape hatch (use sparingly): put a `drift-ignore-next-line` comment on the line above.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join, extname } from 'node:path';

const SCAN_DIRS = ['src', 'src-help'];
const EXTS = new Set(['.astro', '.tsx', '.jsx']);
const GUARDED_CSS = ['src/styles/base.css', 'src/styles/components.css'];
const IGNORE = 'drift-ignore-next-line';

// `utility-[value]` NOT followed by ':' — so arbitrary *variants* (data-[state=open]:,
// min-[600px]:, supports-[...]:) stay allowed; only arbitrary *values* are flagged.
const ARBITRARY_VALUE = /(?:^|[\s"'`])((?:[a-z][a-z0-9]*-)+\[[^\]]+\])(?!:)/g;
// raw color literals that should instead be color tokens
const RAW_HEX = /#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\b/g;
const RAW_COLOR_FN = /\b(?:rgb|rgba|hsl|hsla|oklch|oklab)\s*\(/g;
const STYLE_TAG = /<style\b/g;
// style="--x: …; object-position: …" in its string, template or object form.
const STYLE_ATTR = /\sstyle=(?:"([^"]*)"|\{`([^`]*)`\}|\{\{([^}]*)\}\})/g;
const STYLE_PROP = /^(--[\w-]+|object-position)$/;
// A length with a unit, outside var(): 0, 1px and 2px are the allowed literals (lh counts lines, not a length).
const RAW_LENGTH = /(?<![\w.-])\d*\.?\d+(?:px|rem|em|vw|vh|svh|dvh|ch)\b/g;
const LENGTH_ALLOW = new Set(['0', '1px', '2px']);

function walk(dir) {
  const out = [];
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const entry of entries) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(p));
    else if (EXTS.has(extname(entry.name))) out.push(p);
  }
  return out;
}

function styleAttrViolations(line) {
  const out = [];
  for (const m of line.matchAll(STYLE_ATTR)) {
    const value = m[1] ?? m[2] ?? '';
    const names =
      m[3] !== undefined
        ? [...m[3].matchAll(/['"]?([\w-]+)['"]?\s*:/g)].map((n) => n[1])
        : value
            .split(';')
            .map((d) => d.split(':')[0].trim())
            .filter(Boolean);
    for (const name of names) if (!STYLE_PROP.test(name)) out.push(name);
  }
  return out;
}

const markupChecks = [
  [ARBITRARY_VALUE, 'arbitrary Tailwind value (use a token / scale step)'],
  [RAW_HEX, 'raw hex color (use a color token)'],
  [RAW_COLOR_FN, 'raw color function (use a color token)'],
];
const srcOnlyChecks = [[STYLE_TAG, '<style> block (use utilities, type-* or an ie-* class)']];
const cssChecks = [
  [RAW_HEX, 'raw hex color (use a color token)'],
  [RAW_COLOR_FN, 'raw color function (use a color token)'],
];

const violations = [];
const scan = (file, lines, checks, extra) => {
  lines.forEach((line, i) => {
    if (i > 0 && lines[i - 1].includes(IGNORE)) return;
    for (const [re, msg] of checks) {
      re.lastIndex = 0;
      let m;
      while ((m = re.exec(line)) !== null) {
        violations.push({ file, line: i + 1, match: (m[1] ?? m[0]).trim(), msg });
      }
    }
    extra?.(line, i);
  });
};

for (const dir of SCAN_DIRS) {
  const srcOnly = dir === 'src';
  for (const file of walk(dir)) {
    const lines = readFileSync(file, 'utf8').split('\n');
    scan(file, lines, srcOnly ? [...markupChecks, ...srcOnlyChecks] : markupChecks, (line, i) => {
      if (!srcOnly) return;
      for (const name of styleAttrViolations(line)) {
        violations.push({
          file,
          line: i + 1,
          match: name,
          msg: 'style= may only set --custom properties or object-position',
        });
      }
    });
  }
}
for (const file of GUARDED_CSS) {
  const lines = readFileSync(file, 'utf8').split('\n');
  scan(file, lines, cssChecks, (line, i) => {
    if (i > 0 && lines[i - 1].includes(IGNORE)) return;
    // Type sizes come from the boards' CSS; spacing, radii and shadows are tokens.
    if (/^\s*(font|font-size|line-height|letter-spacing)\s*:/.test(line)) return;
    const outsideVar = line.replace(/var\([^)]*\)/g, '').replace(/\/\*.*?\*\//g, '');
    for (const m of outsideVar.matchAll(RAW_LENGTH)) {
      if (LENGTH_ALLOW.has(m[0])) continue;
      violations.push({
        file,
        line: i + 1,
        match: m[0],
        msg: 'raw length (use a spacing or size token)',
      });
    }
  });
}

if (violations.length > 0) {
  console.error(`\n✖ Design-drift check failed — ${violations.length} off-system value(s):\n`);
  for (const v of violations) {
    console.error(`  ${v.file}:${v.line}  ${v.msg}\n      → ${v.match}`);
  }
  console.error(`\nFix: use the design tokens instead. See DESIGN.md.`);
  console.error(`If genuinely unavoidable, add a "${IGNORE}" comment on the line above.\n`);
  process.exit(1);
}
console.log('✓ Design-drift check passed — all styling uses system tokens.');
