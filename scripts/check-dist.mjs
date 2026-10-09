#!/usr/bin/env node
// Post-build check of a built site: every link and asset it references must exist.
//
//   node scripts/check-dist.mjs <build-dir>... [--classes]
//
// Checked: href, src, srcset, poster, CSS url(), og:image / twitter:image, and JSON-LD
// logo / image values. A root-relative `/x` resolves to `x`, `x/index.html` or `x.html`
// inside its build. Absolute URLs on our two hosts map to their builds
// (www.innerexplorer.com -> dist, help.innerexplorer.com -> dist-help); a URL whose build
// is not one of the arguments is skipped, so `check-dist dist-help` runs on its own.
//
// --classes (marketing build): every class in a class="" attribute must exist as a
// selector in the built CSS. Catches old utility names, Tailwind defaults that don't
// exist in our theme, and typos, with no deny-list to maintain.
import { existsSync } from 'node:fs';
import { readdir, readFile } from 'node:fs/promises';
import { basename, dirname, join, relative, resolve } from 'node:path';

const args = process.argv.slice(2);
const dirs = args.filter((a) => !a.startsWith('--'));
const checkClasses = args.includes('--classes');
if (dirs.length === 0) {
  console.error('Usage: node scripts/check-dist.mjs <build-dir>... [--classes]');
  process.exit(2);
}

const HOSTS = { 'www.innerexplorer.com': 'dist', 'help.innerexplorer.com': 'dist-help' };
// Classes that never carry CSS of their own (state hooks for group-*/peer-* variants).
const CLASS_ALLOW = new Set(['group', 'peer']);

async function walk(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(full)));
    else out.push(full);
  }
  return out;
}

const decode = (s) =>
  s
    .replace(/&amp;/g, '&')
    .replace(/&#x2F;/gi, '/')
    .replace(/&quot;/g, '"');

function urlsFromHtml(html, file) {
  const urls = [];
  // A 404 page's canonical names a URL that by definition has no page.
  if (basename(file) === '404.html') html = html.replace(/<link rel="canonical"[^>]*>/g, '');
  for (const m of html.matchAll(/\s(?:href|src|poster)="([^"]*)"/g)) urls.push(m[1]);
  for (const m of html.matchAll(/\ssrcset="([^"]*)"/g))
    for (const part of m[1].split(',')) urls.push(part.trim().split(/\s+/)[0]);
  for (const m of html.matchAll(/<meta[^>]+>/g)) {
    const tag = m[0];
    if (/(property|name)="(og:image|twitter:image)"/.test(tag)) {
      const c = tag.match(/\scontent="([^"]*)"/);
      if (c) urls.push(c[1]);
    }
  }
  for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try {
      collectJsonLd(JSON.parse(m[1]), urls);
    } catch {
      // Malformed JSON-LD is a different bug; the SEO checks report it.
    }
  }
  for (const m of html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g))
    urls.push(...urlsFromCss(m[1]));
  return urls.map(decode);
}

function collectJsonLd(node, urls) {
  if (Array.isArray(node)) return node.forEach((n) => collectJsonLd(n, urls));
  if (!node || typeof node !== 'object') return;
  for (const [key, value] of Object.entries(node)) {
    if ((key === 'logo' || key === 'image') && typeof value === 'string') urls.push(value);
    else if ((key === 'logo' || key === 'image') && value && typeof value.url === 'string')
      urls.push(value.url);
    else collectJsonLd(value, urls);
  }
}

function urlsFromCss(css) {
  // Drop data: URIs first; an inline SVG can contain its own url(#id) references.
  const noData = css.replace(/url\(\s*(['"])data:.*?\1\s*\)|url\(\s*data:[^)]*\)/g, '');
  return [...noData.matchAll(/url\(\s*(['"]?)([^'")]+)\1\s*\)/g)].map((m) => m[2]);
}

/** Map a URL to the [buildDir, path] it should resolve in, or null to skip it. */
function target(url, fromFile, root) {
  if (!url || /^(#|mailto:|tel:|javascript:|data:|blob:)/i.test(url)) return null;
  let path;
  let dir = root;
  if (/^https?:\/\//i.test(url) || url.startsWith('//')) {
    const parsed = new URL(url.startsWith('//') ? `https:${url}` : url);
    const build = HOSTS[parsed.host];
    if (!build) return null; // external site
    dir = dirs.find((d) => basename(resolve(d)) === build);
    if (!dir) return null; // that build isn't part of this run
    path = parsed.pathname;
  } else if (url.startsWith('/')) {
    path = url;
  } else {
    path = '/' + relative(root, resolve(dirname(fromFile), url));
  }
  path = decodeURIComponent(path.split(/[?#]/)[0]);
  return [dir, path];
}

function exists(dir, path) {
  const p = join(dir, path);
  if (path.endsWith('/')) return existsSync(join(p, 'index.html'));
  return existsSync(p) || existsSync(join(p, 'index.html')) || existsSync(`${p}.html`);
}

function cssClassSet(css) {
  const classes = new Set();
  for (const m of css.replace(/\/\*[\s\S]*?\*\//g, '').matchAll(/([^{};]*)\{/g)) {
    if (m[1].trim().startsWith('@')) continue;
    for (const c of m[1].matchAll(/\.((?:\\.|[A-Za-z0-9_-])+)/g))
      if (!/^\d/.test(c[1])) classes.add(c[1].replace(/\\(.)/g, '$1'));
  }
  return classes;
}

let failures = 0;
for (const root of dirs) {
  if (!existsSync(root)) {
    console.error(`check-dist: ${root} does not exist. Build it first.`);
    process.exit(2);
  }
  const files = await walk(root);
  const missing = new Map(); // "path" -> first file that references it
  let css = '';
  const classUse = new Map();
  for (const file of files) {
    if (!/\.(html|css)$/.test(file)) continue;
    const text = await readFile(file, 'utf8');
    const urls = file.endsWith('.css') ? urlsFromCss(text) : urlsFromHtml(text, file);
    for (const url of urls) {
      const t = target(url, file, root);
      if (t && !exists(...t)) {
        const key = `${t[0]}${t[1]}`;
        if (!missing.has(key)) missing.set(key, relative(root, file));
      }
    }
    if (checkClasses) {
      if (file.endsWith('.css')) css += text;
      else {
        for (const m of text.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)) css += m[1];
        for (const m of text.matchAll(/\sclass="([^"]*)"/g))
          for (const c of m[1].split(/\s+/).filter(Boolean))
            if (!classUse.has(c)) classUse.set(c, relative(root, file));
      }
    }
  }
  for (const [path, from] of missing) {
    console.error(`  missing: ${path}  (referenced from ${from})`);
    failures++;
  }
  if (checkClasses) {
    const known = cssClassSet(css);
    for (const [c, from] of classUse) {
      if (known.has(c) || CLASS_ALLOW.has(c)) continue;
      console.error(
        `  unknown class: .${c}  (e.g. ${from}). It has no CSS; use a token utility or an ie-* class.`,
      );
      failures++;
    }
  }
  console.log(`check-dist: ${root} — ${files.length} files scanned.`);
}
if (failures) {
  console.error(`check-dist: ${failures} problem(s).`);
  process.exit(1);
}
console.log('check-dist: all references resolve.');
