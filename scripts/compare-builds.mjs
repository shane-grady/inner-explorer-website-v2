#!/usr/bin/env node
// Normalized diff of two Astro build trees: proves a refactor changed nothing a visitor
// gets (or shows exactly what did). Writes normalized copies of both trees to
// <out>/a and <out>/b, then you read `diff -ru <out>/a <out>/b`.
//
//   node scripts/compare-builds.mjs <before-dir> <after-dir> <out-dir> [--exclude=<prefix>]... [--css-classes]
//
// Normalization removes what changes on every build without changing the page:
//   - content hashes in /_astro/ file names and in every reference to them
//     (`Layout.Ab3x_9Kq.css` -> `Layout.css`, `photo.Ab3x_9Kq_Z1d2f.webp` -> `photo.webp`);
//     names that still collide get a short hash of their normalized content
//   - Astro scope ids (`data-astro-cid-<id>`, `astro-<id>-<n>`), renumbered in order of
//     first appearance across the tree
//   - one tag / declaration / statement per line, so `diff` shows the real change
//   - binaries (images, fonts, media, PDFs) become `sha256 <hex> <bytes>`
//
// --css-classes: lists every class that loses all of its CSS rules between the two trees
// but is still used in a class="" attribute of either tree. Empty output means the CSS
// change cannot have changed how any element looks.
//
// Build baselines OUTSIDE the repo (a sibling `git worktree`) so neither tree's source
// is scanned by the other's Tailwind. See src-help/README.md.
import { createHash } from 'node:crypto';
import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, join, relative } from 'node:path';

const args = process.argv.slice(2);
const positional = args.filter((a) => !a.startsWith('--'));
const excludes = args.filter((a) => a.startsWith('--exclude=')).map((a) => a.slice(10));
const cssClasses = args.includes('--css-classes');
if (positional.length !== 3) {
  console.error(
    'Usage: node scripts/compare-builds.mjs <before-dir> <after-dir> <out-dir> [--exclude=<prefix>]... [--css-classes]',
  );
  process.exit(2);
}
const [beforeDir, afterDir, outDir] = positional;

const BINARY =
  /\.(png|jpe?g|webp|avif|gif|ico|svgz|woff2?|ttf|otf|mp4|webm|mov|mp3|wav|ogg|pdf|zip)$/i;
// Astro/Vite hashed asset names: name.<8 url-safe chars>[_<image transform id>].ext
const HASHED = /^(.+?)\.[A-Za-z0-9_-]{8}(?:_[A-Za-z0-9_-]+)?(\.[a-z0-9]+)$/;

async function walk(root, dir = root) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(root, full)));
    else out.push(relative(root, full).split('\\').join('/'));
  }
  return out.sort();
}

function stripHash(path) {
  if (!path.includes('_astro/')) return path;
  const slash = path.lastIndexOf('/');
  const m = path.slice(slash + 1).match(HASHED);
  return m ? path.slice(0, slash + 1) + m[1] + m[2] : path;
}

const sha = (buf) => createHash('sha256').update(buf).digest('hex');

function splitLines(text, file) {
  if (/\.html?$/.test(file)) return text.replace(/>\s*</g, '>\n<');
  if (/\.css$/.test(file)) return text.replace(/([{};])\s*/g, '$1\n');
  if (/\.(m?js)$/.test(file)) return text.replace(/;\s*/g, ';\n');
  return text;
}

async function normalizeTree(root) {
  const files = (await walk(root)).filter((f) => !excludes.some((p) => f.startsWith(p)));
  // Map every hashed asset name to its hash-free name (resolved for collisions below).
  const renamed = new Map();
  for (const f of files) renamed.set(f, stripHash(f));

  const cids = new Map();
  const cid = (id) => {
    if (!cids.has(id)) cids.set(id, `cid${cids.size + 1}`);
    return cids.get(id);
  };
  // Number scope ids by their order in the HTML first, so CSS-only changes (a dropped
  // stylesheet full of other components' ids) can't shift every page's numbering.
  for (const f of files.filter((f) => f.endsWith('.html')))
    for (const m of (await readFile(join(root, f), 'utf8')).matchAll(/data-astro-cid-([a-z0-9]+)/g))
      cid(m[1]);
  // Replace every reference to a hashed asset with its normalized name.
  const hashedBasenames = [...renamed]
    .filter(([from, to]) => from !== to)
    .map(([from, to]) => [
      from.slice(from.lastIndexOf('/') + 1),
      to.slice(to.lastIndexOf('/') + 1),
    ]);
  const refMap = new Map(hashedBasenames);
  const refPattern = hashedBasenames.length
    ? new RegExp(
        hashedBasenames.map(([b]) => b.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'),
        'g',
      )
    : null;

  const result = new Map(); // normalized path -> list of { content }
  for (const f of files) {
    const buf = await readFile(join(root, f));
    let content;
    if (BINARY.test(f)) {
      content = `sha256 ${sha(buf)} ${buf.length}\n`;
    } else {
      let text = buf.toString('utf8');
      if (refPattern) text = text.replace(refPattern, (m) => refMap.get(m));
      text = text
        .replace(/data-astro-cid-([a-z0-9]+)/g, (_, id) => `data-astro-${cid(id)}`)
        .replace(/\bastro-([a-z0-9]{8})-(\d+)\b/g, (_, id, n) => `astro-${cid(id)}-${n}`);
      content = splitLines(text, f);
    }
    const target = renamed.get(f);
    if (!result.has(target)) result.set(target, []);
    result.get(target).push(content);
  }
  // Names that still collide after hash removal get a short content hash.
  const final = new Map();
  for (const [path, contents] of result) {
    if (contents.length === 1) final.set(path, contents[0]);
    else
      for (const c of contents) {
        const dot = path.lastIndexOf('.');
        final.set(`${path.slice(0, dot)}~${sha(c).slice(0, 8)}${path.slice(dot)}`, c);
      }
  }
  return final;
}

async function writeTree(tree, dir) {
  await rm(dir, { recursive: true, force: true });
  for (const [path, content] of tree) {
    const full = join(dir, path);
    await mkdir(dirname(full), { recursive: true });
    await writeFile(full, content);
  }
}

// --- --css-classes -----------------------------------------------------------------
function cssOf(tree) {
  let css = '';
  for (const [path, content] of tree) {
    if (path.endsWith('.css')) css += content + '\n';
    if (path.endsWith('.html'))
      for (const m of content.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)) css += m[1] + '\n';
  }
  return css;
}

export function cssClassSet(css) {
  const classes = new Set();
  const noComments = css.replace(/\/\*[\s\S]*?\*\//g, '');
  // Selector text is whatever precedes a `{` back to the previous `{`, `}` or `;`.
  for (const m of noComments.matchAll(/([^{};]*)\{/g)) {
    const selector = m[1];
    if (selector.trim().startsWith('@')) continue;
    for (const c of selector.matchAll(/\.((?:\\.|[A-Za-z0-9_-])+)/g)) {
      if (/^\d/.test(c[1])) continue; // a number like .5 inside a value, not a class
      classes.add(c[1].replace(/\\(.)/g, '$1'));
    }
  }
  return classes;
}

function htmlClasses(tree) {
  const used = new Map(); // class -> first file using it
  for (const [path, content] of tree) {
    if (!path.endsWith('.html')) continue;
    for (const m of content.matchAll(/\sclass="([^"]*)"/g))
      for (const c of m[1].split(/\s+/).filter(Boolean)) if (!used.has(c)) used.set(c, path);
  }
  return used;
}

const before = await normalizeTree(beforeDir);
const after = await normalizeTree(afterDir);
await writeTree(before, join(outDir, 'a'));
await writeTree(after, join(outDir, 'b'));
console.log(`Normalized ${before.size} + ${after.size} files into ${outDir}/{a,b}.`);
console.log(`Next: diff -ru ${outDir}/a ${outDir}/b`);

if (cssClasses) {
  const afterClasses = cssClassSet(cssOf(after));
  const lost = [...cssClassSet(cssOf(before))].filter((c) => !afterClasses.has(c));
  const used = new Map([...htmlClasses(before), ...htmlClasses(after)]);
  const stillUsed = lost.filter((c) => used.has(c));
  if (stillUsed.length === 0) {
    console.log(`--css-classes: ${lost.length} classes lost their CSS; none is used in the HTML.`);
  } else {
    console.log(`--css-classes: ${stillUsed.length} class(es) lost their CSS but are still used:`);
    for (const c of stillUsed) console.log(`  .${c}  (e.g. ${used.get(c)})`);
    process.exitCode = 1;
  }
}
