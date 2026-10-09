// Helpers shared by the build checkers (check-dist.mjs, compare-builds.mjs).
import { readdir } from 'node:fs/promises';
import { join } from 'node:path';

/** Every file under `dir`, as full paths, sorted. */
export async function walk(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(full)));
    else out.push(full);
  }
  return out.sort();
}

// A CSS escape is `\` plus 1–6 hex digits and one optional whitespace character (Tailwind
// writes a leading digit that way: `.\32 xl\:flex` is the class `2xl:flex`), or `\` plus
// any other character, which stands for itself.
const CSS_ESCAPE = /\\(?:([0-9a-fA-F]{1,6})[ \t\n\r\f]?|(.))/gs;
const unescapeCss = (s) =>
  s.replace(CSS_ESCAPE, (_, hex, char) => (hex ? String.fromCodePoint(parseInt(hex, 16)) : char));

/** Every class name the stylesheet has a selector for, unescaped. */
export function cssClassSet(css) {
  const classes = new Set();
  const noComments = css.replace(/\/\*[\s\S]*?\*\//g, '');
  // Selector text is whatever precedes a `{` back to the previous `{`, `}` or `;`.
  for (const m of noComments.matchAll(/([^{};]*)\{/g)) {
    const selector = m[1];
    if (selector.trim().startsWith('@')) continue;
    for (const c of selector.matchAll(/\.((?:\\[0-9a-fA-F]{1,6}[ \t\n\r\f]?|\\.|[\w-])+)/g)) {
      if (/^\d/.test(c[1])) continue; // a number like .5 inside a value, not a class
      classes.add(unescapeCss(c[1]));
    }
  }
  return classes;
}
