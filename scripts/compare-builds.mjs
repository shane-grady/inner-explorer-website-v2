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
//     names that still collide (image size variants, same-named files) get a short hash
//     of their normalized content, in the file name AND in every reference, so a page
//     that switches between two same-named assets still shows up in the diff
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
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, join, relative } from 'node:path';
import { cssClassSet, walk } from './lib/build-files.mjs';

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

const escapeRe = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const baseName = (path) => path.slice(path.lastIndexOf('/') + 1);

/** `dir/name.ext` -> `dir/name~<tag>.ext` */
function withTag(path, tag) {
  const dot = path.lastIndexOf('.');
  return dot > path.lastIndexOf('/')
    ? `${path.slice(0, dot)}~${tag}${path.slice(dot)}`
    : `${path}~${tag}`;
}

async function normalizeTree(root) {
  const files = (await walk(root))
    .map((f) => relative(root, f).split('\\').join('/'))
    .filter((f) => !excludes.some((p) => f.startsWith(p)));
  const raw = new Map();
  for (const f of files) raw.set(f, await readFile(join(root, f)));

  const cids = new Map();
  const cid = (id) => {
    if (!cids.has(id)) cids.set(id, `cid${cids.size + 1}`);
    return cids.get(id);
  };
  // Number scope ids by their order in the HTML first, so CSS-only changes (a dropped
  // stylesheet full of other components' ids) can't shift every page's numbering.
  for (const f of files.filter((f) => f.endsWith('.html')))
    for (const m of raw
      .get(f)
      .toString('utf8')
      .matchAll(/data-astro-cid-([a-z0-9]+)/g))
      cid(m[1]);

  // Normalize one file, rewriting every hashed asset reference through `names`
  // (source path -> normalized path).
  const normalizer = (names) => {
    const refMap = new Map(
      [...names]
        .filter(([from, to]) => from !== to)
        .map(([from, to]) => [baseName(from), baseName(to)]),
    );
    const refPattern = refMap.size
      ? new RegExp([...refMap.keys()].map(escapeRe).join('|'), 'g')
      : null;
    return (f) => {
      const buf = raw.get(f);
      if (BINARY.test(f)) return `sha256 ${sha(buf)} ${buf.length}\n`;
      let text = buf.toString('utf8');
      if (refPattern) text = text.replace(refPattern, (m) => refMap.get(m));
      text = text
        .replace(/data-astro-cid-([a-z0-9]+)/g, (_, id) => `data-astro-${cid(id)}`)
        .replace(/\bastro-([a-z0-9]{8})-(\d+)\b/g, (_, id, n) => `astro-${cid(id)}-${n}`);
      return splitLines(text, f);
    };
  };

  // Pass 1: strip hashes, so references point at bare names.
  const stripped = new Map(files.map((f) => [f, stripHash(f)]));
  const pass1 = normalizer(stripped);
  // Names that still collide get a short hash of their pass-1 content (stable across
  // builds, since pass 1 already removed every build-specific hash).
  const byName = new Map();
  for (const f of files) {
    const name = stripped.get(f);
    if (!byName.has(name)) byName.set(name, []);
    byName.get(name).push(f);
  }
  const finalNames = new Map();
  for (const [name, group] of byName)
    for (const f of group)
      finalNames.set(f, group.length === 1 ? name : withTag(name, sha(pass1(f)).slice(0, 8)));

  // Pass 2: references point at the final, collision-free names.
  const pass2 = normalizer(finalNames);
  const result = new Map();
  for (const f of files) result.set(finalNames.get(f), pass2(f));
  return result;
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
