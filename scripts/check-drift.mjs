#!/usr/bin/env node
/**
 * Design-drift guard. Fails if component source uses off-system styling.
 *
 * WHY: AI agents (and humans in a hurry) reach for one-off values — bg-[#3b82f6],
 * mt-[13px], inline hex colors — instead of design tokens. Those silently erode the
 * system until every screen is "almost" consistent. This makes that a hard error so
 * every color / size / space comes from the @theme token scale in global.css.
 *
 * Escape hatch (use sparingly): put a `drift-ignore-next-line` comment on the line above.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join, extname } from 'node:path';

const SCAN_DIRS = ['src'];
const EXTS = new Set(['.astro', '.tsx', '.jsx']);
const IGNORE = 'drift-ignore-next-line';

// `utility-[value]` NOT followed by ':' — so arbitrary *variants* (data-[state=open]:,
// min-[600px]:, supports-[...]:) stay allowed; only arbitrary *values* are flagged.
const ARBITRARY_VALUE = /(?:^|[\s"'`])((?:[a-z][a-z0-9]*-)+\[[^\]]+\])(?!:)/g;
// raw color literals that should instead be color tokens
const RAW_HEX = /#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\b/g;
const RAW_COLOR_FN = /\b(?:rgb|rgba|hsl|hsla|oklch|oklab)\s*\(/g;

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

const checks = [
  [ARBITRARY_VALUE, 'arbitrary Tailwind value (use a token / scale step)'],
  [RAW_HEX, 'raw hex color (use a color token)'],
  [RAW_COLOR_FN, 'raw color function (use a color token)'],
];

const violations = [];
for (const dir of SCAN_DIRS) {
  for (const file of walk(dir)) {
    const lines = readFileSync(file, 'utf8').split('\n');
    lines.forEach((line, i) => {
      if (i > 0 && lines[i - 1].includes(IGNORE)) return;
      for (const [re, msg] of checks) {
        re.lastIndex = 0;
        let m;
        while ((m = re.exec(line)) !== null) {
          violations.push({ file, line: i + 1, match: (m[1] ?? m[0]).trim(), msg });
        }
      }
    });
  }
}

if (violations.length > 0) {
  console.error(`\n✖ Design-drift check failed — ${violations.length} off-system value(s):\n`);
  for (const v of violations) {
    console.error(`  ${v.file}:${v.line}  ${v.msg}\n      → ${v.match}`);
  }
  console.error(`\nFix: use design tokens from src/styles/global.css (@theme). See DESIGN.md.`);
  console.error(`If genuinely unavoidable, add a "${IGNORE}" comment on the line above.\n`);
  process.exit(1);
}
console.log('✓ Design-drift check passed — all styling uses system tokens.');
