#!/usr/bin/env node
/**
 * CloudCannon editable-region guard.
 *
 * `@cloudcannon/editable-regions` resolves every `data-prop` at runtime, inside the
 * Visual Editor, against the file backing the page. When a path does not resolve to a
 * string the editor replaces the element with a red "Failed to render text editable
 * region" card — which nobody sees until an editor opens that page.
 *
 * This script reproduces that resolution against the built HTML plus the real content
 * files, so the failure surfaces in CI instead. The logic mirrors the package:
 * `Editable.setupListeners` (relative props bind to the nearest editable ancestor;
 * `@data[...]`/`@collections[...]`/`@file[...]` are absolute) and
 * `Editable.lookupPathAndContext` → `EditableText.validateValue`.
 *
 * Usage: node scripts/check-editables.mjs [dir...]     (default: dist dist-help)
 *        node scripts/check-editables.mjs --report     (census output, never fails)
 */
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';
import { parse as parseYaml } from 'yaml';

const args = process.argv.slice(2);
const REPORT_ONLY = args.includes('--report');
const DIRS = args.filter((a) => !a.startsWith('--'));
const WANTED = DIRS.length ? DIRS : ['dist', 'dist-help'];
const ROOTS = WANTED.filter((d) => existsSync(d));
if (ROOTS.length === 0) {
  // Silently scanning nothing would be a false pass — the whole point of this guard.
  console.error(`No build output found (looked for: ${WANTED.join(', ')}).`);
  console.error('Run `pnpm build:all` first — this checks built HTML, not source.');
  process.exit(1);
}

const MISSING = Symbol('missing');
const TEXT_TYPES = new Set(['span', 'text', 'block']);
const VOID = new Set([
  'img',
  'br',
  'hr',
  'input',
  'meta',
  'link',
  'source',
  'track',
  'area',
  'base',
  'col',
  'embed',
  'param',
  'wbr',
]);
const CUSTOM = {
  'editable-text': 'text',
  'editable-image': 'image',
  'editable-component': 'component',
  'editable-array-item': 'array-item',
  'editable-array': 'array',
  'editable-source': 'source',
};

// ── CloudCannon config ───────────────────────────────────────────────────────
const cc = parseYaml(readFileSync('cloudcannon.config.yml', 'utf8'));
const collections = cc.collections_config ?? {};
const dataConfig = cc.data_config ?? {};

function loadFile(path) {
  const txt = readFileSync(path, 'utf8');
  if (/\.mdx?$/.test(path)) {
    const m = txt.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
    return m ? { data: parseYaml(m[1]) ?? {}, body: m[2] } : { data: {}, body: txt };
  }
  if (/\.ya?ml$/.test(path)) return { data: parseYaml(txt) ?? {}, body: '' };
  if (/\.json$/.test(path)) return { data: JSON.parse(txt), body: '' };
  return { data: {}, body: txt };
}

// url → backing file, built from each collection's `path` + `url` template.
// CloudCannon template strings have two placeholder forms: FIXED placeholders in
// square brackets (`[slug]`, defined by CloudCannon) and DATA placeholders in braces
// (`{permalink}`, read from the file's own front matter). The `pages` collection uses
// the data form so the homepage can resolve to '/' rather than '/index/'.
// Two builds, two URL spaces — and they COLLIDE: /faq/ is the marketing FAQ on the
// main site AND a help article on help.innerexplorer.com. Keep the maps separate or
// one page gets validated against the other's file.
const mainUrlToFile = new Map();
const helpUrlToFile = new Map();
for (const [key, cfg] of Object.entries(collections)) {
  if (!cfg?.path || !cfg?.url || cfg.disable_url) continue;
  if (!existsSync(cfg.path)) continue;
  for (const name of readdirSync(cfg.path)) {
    const full = join(cfg.path, name);
    if (statSync(full).isDirectory()) continue;
    const slug = name.replace(/\.[^.]+$/, '');
    let url = cfg.url.replace(/\[slug\]/g, slug);
    if (url.includes('{')) {
      const { data } = loadFile(full);
      url = url.replace(/\{([^}|]+)(\|[^}]*)?\}/g, (_, k) => String(data?.[k.trim()] ?? ''));
    }
    if (!url) continue;
    mainUrlToFile.set(url, { collection: key, path: full });
    // The standalone Help Center build serves the same files at the subdomain root.
    if (key === 'help') helpUrlToFile.set(`/${slug}/`, { collection: key, path: full });
  }
}
const datasets = Object.fromEntries(
  Object.entries(dataConfig)
    .filter(([, v]) => v?.path && existsSync(v.path))
    .map(([k, v]) => [k, loadFile(v.path).data]),
);

// ── minimal HTML → editable tree ─────────────────────────────────────────────
function parseEditables(html) {
  const root = { kind: 'root', attrs: {}, tag: 'root', kids: [], parent: null };
  const stack = [root];
  const open = [];
  const re =
    /<(\/?)([a-zA-Z][\w-]*)((?:\s+[^\s"'>/=]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s"'>]+))?)*)\s*(\/?)>/g;
  let m;
  while ((m = re.exec(html))) {
    const [, closing, rawTag, rawAttrs, selfClose] = m;
    const tag = rawTag.toLowerCase();
    if (closing) {
      for (let i = open.length - 1; i >= 0; i--) {
        if (open[i].tag === tag) {
          for (let j = open.length - 1; j >= i; j--) if (open[j].node) stack.pop();
          open.length = i;
          break;
        }
      }
      continue;
    }
    const attrs = {};
    const ar = /([^\s"'>/=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+)))?/g;
    let a;
    while ((a = ar.exec(rawAttrs))) attrs[a[1].toLowerCase()] = a[2] ?? a[3] ?? a[4] ?? '';
    const kind = CUSTOM[tag] ?? attrs['data-editable'];
    let node = null;
    if (kind && attrs['data-cloudcannon-ignore'] === undefined) {
      node = { kind, attrs, tag, kids: [], parent: stack.at(-1) };
      stack.at(-1).kids.push(node);
    }
    if (!VOID.has(tag) && !selfClose) {
      open.push({ tag, node });
      if (node) stack.push(node);
    }
    // `<script>`/`<style>` bodies can contain angle brackets; skip to their close tag.
    if ((tag === 'script' || tag === 'style') && !selfClose) {
      const close = html.indexOf(`</${tag}`, re.lastIndex);
      if (close !== -1) {
        re.lastIndex = close;
      }
    }
  }
  return root;
}

function lookup(obj, path) {
  if (!path) return obj;
  let cur = obj;
  for (const k of path.split('.')) {
    if (cur !== null && typeof cur === 'object' && k in cur) cur = cur[k];
    else if (Array.isArray(cur) && /^\d+$/.test(k) && +k < cur.length) cur = cur[+k];
    else return MISSING;
  }
  return cur;
}

function resolve(node, entry, body) {
  const prop = node.attrs['data-prop'];
  const parent = node.parent;
  const parentVal = parent && 'val' in parent ? parent.val : MISSING;

  if (node.kind === 'array-item') {
    const sibs = parent ? parent.kids.filter((k) => k.kind === 'array-item') : [];
    const idx = sibs.indexOf(node);
    node.val = Array.isArray(parentVal) && idx < parentVal.length ? parentVal[idx] : MISSING;
  } else if (prop === undefined) {
    node.val = parent && parent.kind !== 'root' ? parentVal : MISSING;
  } else {
    const abs = prop.match(/^@(data|collections|file)\[([^\]]+)\](?:\.(.+))?$/);
    if (abs) {
      node.val = abs[1] === 'data' ? lookup(datasets[abs[2]] ?? MISSING, abs[3]) : MISSING;
    } else if (prop === '@content') {
      node.val = body ?? MISSING;
    } else if (parent && parent.kind !== 'root') {
      node.val = parentVal === MISSING ? MISSING : lookup(parentVal, prop);
    } else {
      node.val = entry === null ? MISSING : lookup(entry, prop);
    }
  }
  for (const kid of node.kids) resolve(kid, entry, body);
}

function flatten(node, out = []) {
  for (const k of node.kids) {
    out.push(k);
    flatten(k, out);
  }
  return out;
}

// ── _inputs key-name ambiguity ───────────────────────────────────────────────
// CloudCannon matches an `_inputs` key by NAME, at any depth in the file. So a name
// used twice inside one page with DIFFERENT shapes cannot be declared at schema or
// file level without mis-typing one of the uses — e.g. about.yml has `stats` as both
// {value,sup,label,sub} and {n,l}, and home.yml has it in three shapes. Structure-level
// `_inputs` are naturally scoped to their structure and are therefore exempt.
const shapeOf = (v) => {
  if (Array.isArray(v)) {
    if (!v.length) return 'array<empty>';
    const f = v[0];
    return f && typeof f === 'object' && !Array.isArray(f)
      ? `array<{${Object.keys(f).join(',')}}>`
      : `array<${typeof f}>`;
  }
  if (v === null) return 'null';
  if (typeof v === 'object') return 'object';
  return typeof v;
};

function keyShapes(node, map = {}) {
  if (!node || typeof node !== 'object') return map;
  if (Array.isArray(node)) {
    for (const n of node) keyShapes(n, map);
    return map;
  }
  for (const [k, v] of Object.entries(node)) {
    (map[k] ??= new Set()).add(shapeOf(v));
    keyShapes(v, map);
  }
  return map;
}

function checkInputAmbiguity() {
  const found = [];
  const audit = (label, inputs, filePath) => {
    if (!inputs || !existsSync(filePath)) return;
    const shapes = keyShapes(loadFile(filePath).data);
    for (const key of Object.keys(inputs)) {
      const s = shapes[key];
      if (s && s.size > 1) {
        found.push({
          kind: 'AMBIGUOUS_INPUT',
          file: filePath,
          url: label,
          backing: filePath,
          tag: key,
          detail: `_inputs."${key}" matches ${s.size} different shapes: ${[...s].join(' | ')}`,
        });
      }
    }
  };
  for (const [key, cfg] of Object.entries(collections)) {
    for (const [sKey, sCfg] of Object.entries(cfg?.schemas ?? {})) {
      audit(`${key}/${sKey}`, sCfg?._inputs, sCfg?.path);
    }
  }
  for (const fc of cc.file_config ?? []) {
    if (fc?.glob && !fc.glob.includes('*')) audit(fc.glob, fc._inputs, fc.glob);
  }
  return found;
}

// ── walk the builds ──────────────────────────────────────────────────────────
function* htmlFiles(dir) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) yield* htmlFiles(full);
    else if (name.endsWith('.html')) yield full;
  }
}

const errors = checkInputAmbiguity();
const warnings = [];
const stats = { pages: 0, regions: 0, unbacked: 0, byKind: {} };

for (const root of ROOTS) {
  for (const file of htmlFiles(root)) {
    const html = readFileSync(file, 'utf8');
    if (!html.includes('data-editable') && !html.includes('<editable-')) continue;
    const url =
      '/' +
      relative(root, file)
        .replace(/index\.html$/, '')
        .replace(/\\/g, '/');
    const lookupMap = root === 'dist-help' ? helpUrlToFile : mainUrlToFile;
    const backing = lookupMap.get(url) ?? null;
    const { data: entry, body } = backing ? loadFile(backing.path) : { data: null, body: null };
    const tree = parseEditables(html);
    for (const k of tree.kids) resolve(k, entry, body);

    const nodes = flatten(tree);
    stats.pages++;
    stats.regions += nodes.length;
    if (!backing) stats.unbacked++;
    const where = { file, url, backing: backing?.path ?? null };

    for (const n of nodes) {
      stats.byKind[n.kind] = (stats.byKind[n.kind] ?? 0) + 1;
      const prop = n.attrs['data-prop'];
      const propKeys = Object.keys(n.attrs).filter((k) => k.startsWith('data-prop'));

      if (n.kind === 'text') {
        if (propKeys.length === 0) {
          errors.push({
            ...where,
            kind: 'MISSING_DATA_PROP',
            tag: n.tag,
            detail: "text region has no 'data-prop' attribute",
          });
          continue;
        }
        const dt = n.attrs['data-type'];
        if (dt !== undefined && !TEXT_TYPES.has(dt)) {
          errors.push({
            ...where,
            kind: 'INVALID_DATA_TYPE',
            tag: n.tag,
            detail: `data-type="${dt}" (expected span|text|block)`,
          });
          continue;
        }
        if (!backing) continue; // page is not a CMS entry — cannot be opened in the editor
        if (n.val === MISSING) {
          errors.push({
            ...where,
            kind: 'UNRESOLVED',
            tag: n.tag,
            detail: `data-prop="${prop}" resolves to undefined`,
          });
        } else if (n.val !== null && typeof n.val !== 'string') {
          errors.push({
            ...where,
            kind: 'WRONG_TYPE',
            tag: n.tag,
            detail: `data-prop="${prop}" resolves to ${Array.isArray(n.val) ? 'array' : typeof n.val}`,
          });
        }
      } else if (n.kind === 'array') {
        if (!backing) continue;
        if (n.val === MISSING) {
          errors.push({
            ...where,
            kind: 'UNRESOLVED',
            tag: n.tag,
            detail: `array data-prop="${prop}" resolves to undefined`,
          });
        } else if (!Array.isArray(n.val)) {
          errors.push({
            ...where,
            kind: 'WRONG_TYPE',
            tag: n.tag,
            detail: `array data-prop="${prop}" resolves to ${typeof n.val}`,
          });
        }
      } else if (n.kind === 'array-item') {
        if (backing && n.val === MISSING) {
          errors.push({
            ...where,
            kind: 'UNRESOLVED',
            tag: n.tag,
            detail: 'array-item has no matching data item',
          });
        }
        const nested = flatten(n).some((c) => c.kind === 'text' || c.kind === 'image');
        if (!nested) {
          warnings.push({
            ...where,
            kind: 'NO_NESTED_EDITABLE',
            tag: n.tag,
            detail: 'array item has CRUD controls but no editable text/image inside',
          });
        }
      }
    }
  }
}

// ── output ───────────────────────────────────────────────────────────────────
const group = (list) => {
  const byKind = new Map();
  for (const e of list) {
    if (!byKind.has(e.kind)) byKind.set(e.kind, []);
    byKind.get(e.kind).push(e);
  }
  return byKind;
};

console.log(
  `Scanned ${ROOTS.join(', ')} — ${stats.pages} pages, ${stats.regions} editable regions`,
);
console.log(
  `  by kind: ${Object.entries(stats.byKind)
    .map(([k, v]) => `${k}=${v}`)
    .join(' ')}`,
);
if (stats.unbacked)
  console.log(
    `  ${stats.unbacked} page(s) have regions but no CMS entry (not openable in the Visual Editor)`,
  );

for (const [kind, list] of group(errors)) {
  console.log(`\n✗ ${kind} (${list.length})`);
  for (const e of list.slice(0, 25))
    console.log(`    ${e.url}  <${e.tag}>  ${e.detail}\n      ← ${e.backing ?? 'no backing file'}`);
  if (list.length > 25) console.log(`    … +${list.length - 25} more`);
}
for (const [kind, list] of group(warnings)) {
  const pages = [...new Set(list.map((w) => w.url))];
  console.log(`\n! ${kind} (${list.length} across ${pages.length} pages)`);
  for (const p of pages.slice(0, 10)) console.log(`    ${p}`);
  if (pages.length > 10) console.log(`    … +${pages.length - 10} more`);
}

if (errors.length === 0) console.log('\n✓ every editable region resolves');
if (REPORT_ONLY) process.exit(0);
process.exit(errors.length ? 1 : 0);
