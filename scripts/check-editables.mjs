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
import { basename, extname, join, relative } from 'node:path';
import { parse as parseYaml } from 'yaml';
import ts from 'typescript';

const args = process.argv.slice(2);
const REPORT_ONLY = args.includes('--report');
const DIRS = args.filter((a) => !a.startsWith('--'));
const WANTED = DIRS.length ? DIRS : ['dist', 'dist-help'];
const missingRoots = WANTED.filter((d) => !existsSync(d));
if (missingRoots.length) {
  // Scanning only one half of the two-site build is also a false pass.
  console.error(`Missing build output: ${missingRoots.join(', ')}.`);
  console.error('Run `pnpm build:all` first — this checks built HTML, not source.');
  process.exit(1);
}
const ROOTS = WANTED;

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

function* filesBelow(dir, extensions = null) {
  if (!existsSync(dir)) return;
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) yield* filesBelow(full, extensions);
    else if (!extensions || extensions.has(extname(name))) yield full;
  }
}

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
const mappingErrors = [];
const CONTENT_EXTENSIONS = new Set(['.md', '.mdx', '.yml', '.yaml', '.json']);

function addUrlMapping(map, url, backing, surface) {
  const prior = map.get(url);
  if (prior && prior.path !== backing.path) {
    mappingErrors.push({
      kind: 'DUPLICATE_OUTPUT_URL',
      file: 'cloudcannon.config.yml',
      url,
      backing: backing.path,
      tag: surface,
      detail: `also maps to ${prior.path}`,
    });
    return;
  }
  map.set(url, backing);
}

for (const [key, cfg] of Object.entries(collections)) {
  if (!cfg?.path || !cfg?.url || cfg.disable_url) continue;
  if (!existsSync(cfg.path)) continue;
  for (const full of filesBelow(cfg.path, CONTENT_EXTENSIONS)) {
    const slug = relative(cfg.path, full)
      .replace(/\\/g, '/')
      .replace(/\.[^.]+$/, '');
    let url = cfg.url.replace(/\[slug\]/g, slug);
    if (url.includes('{')) {
      const { data } = loadFile(full);
      url = url.replace(/\{([^}|]+)(\|[^}]*)?\}/g, (_, k) => String(data?.[k.trim()] ?? ''));
    }
    if (!url) continue;
    const backing = { collection: key, path: full };
    addUrlMapping(mainUrlToFile, url, backing, 'marketing');
    // The standalone Help Center build serves the same files at the subdomain root.
    if (key === 'help') addUrlMapping(helpUrlToFile, `/${slug}/`, backing, 'help');
  }
}
const datasets = Object.fromEntries(
  Object.entries(dataConfig)
    .filter(([, v]) => v?.path && existsSync(v.path))
    .map(([k, v]) => [k, loadFile(v.path).data]),
);

// ── input reachability ──────────────────────────────────────────────────────
// An editable path is only useful when CloudCannon can expose the same field in
// the data panel. Top-level inputs are inherited, while object/array structures
// declare the fields available inside their values. Preserve that structure while
// walking nested editables so a same-named field in an unrelated structure cannot
// conceal a typo.
const rootInputs = cc._inputs ?? {};
const structures = cc._structures ?? {};
const entryInputScopeCache = new Map();
const dataInputScopeCache = new Map();
const inputScopeCache = new WeakMap();

function structureRefs(input) {
  const raw = input?.options?.structures;
  const values = Array.isArray(raw) ? raw : raw ? [raw] : [];
  return values
    .filter((v) => typeof v === 'string' && v.startsWith('_structures.'))
    .map((v) => v.slice('_structures.'.length));
}

function mergeInputGroups(...groups) {
  return Object.assign({}, ...groups.filter(Boolean));
}

function mergeScopes(target, source) {
  for (const key of source.keys) target.keys.add(key);
  Object.assign(target.inputs, source.inputs);
  for (const [key, child] of source.children) {
    const current = target.children.get(key) ?? {
      keys: new Set(),
      inputs: {},
      children: new Map(),
    };
    mergeScopes(current, child);
    target.children.set(key, current);
  }
  return target;
}

function scopeFromValue(value, inputs = {}) {
  const scope = { keys: new Set(), inputs: { ...inputs }, children: new Map() };
  if (!value || typeof value !== 'object') return scope;
  if (Array.isArray(value)) {
    for (const item of value) mergeScopes(scope, scopeFromValue(item));
    return scope;
  }
  for (const [key, child] of Object.entries(value)) {
    scope.keys.add(key);
    if (child && typeof child === 'object') scope.children.set(key, scopeFromValue(child));
  }
  return scope;
}

function scopeForInput(input, seen = new Set()) {
  if (!input || typeof input !== 'object')
    return { keys: new Set(), inputs: {}, children: new Map() };
  if (inputScopeCache.has(input)) return inputScopeCache.get(input);
  const refs = structureRefs(input);
  const scope = { keys: new Set(), inputs: {}, children: new Map() };
  inputScopeCache.set(input, scope);
  for (const ref of refs) {
    if (seen.has(ref)) continue;
    const nextSeen = new Set([...seen, ref]);
    for (const option of structures[ref]?.values ?? []) {
      mergeScopes(scope, scopeFromValue(option?.value, option?._inputs ?? {}));
      for (const nested of Object.values(option?._inputs ?? {})) scopeForInput(nested, nextSeen);
    }
  }
  return scope;
}

function rootInputScope(...groups) {
  const inputs = mergeInputGroups(...groups);
  const scope = { keys: new Set(Object.keys(inputs)), inputs, children: new Map() };
  if (inputs.$) mergeScopes(scope, scopeForInput(inputs.$));
  return scope;
}

function entryInputScope(backing) {
  if (!backing) return rootInputScope();
  if (entryInputScopeCache.has(backing.path)) return entryInputScopeCache.get(backing.path);
  const cfg = collections[backing.collection] ?? {};
  const data = loadFile(backing.path).data;
  const schemaKey = cfg.schema_key ?? '_schema';
  const fileInputs = (cc.file_config ?? [])
    .filter((file) => file?.glob === backing.path)
    .map((file) => file._inputs);
  const scope = rootInputScope(
    cfg._inputs,
    cfg.schemas?.[data?.[schemaKey]]?._inputs,
    ...fileInputs,
  );
  entryInputScopeCache.set(backing.path, scope);
  return scope;
}

function dataInputScope(key) {
  if (dataInputScopeCache.has(key)) return dataInputScopeCache.get(key);
  const path = dataConfig[key]?.path;
  const groups = (cc.file_config ?? [])
    .filter((cfg) => cfg?.glob === path)
    .map((cfg) => cfg._inputs);
  const scope = rootInputScope(...groups);
  dataInputScopeCache.set(key, scope);
  return scope;
}

function inputPathParts(path) {
  return path
    .replace(/\[(?:\*|\d+)\]/g, '')
    .split('.')
    .filter((part) => part && part !== '$');
}

function matchingPathInput(inputs, parts, offset) {
  let match = null;
  for (const [path, input] of Object.entries(inputs ?? {})) {
    const pathParts = inputPathParts(path);
    const score = pathParts.length * 10 - (path.match(/\[/g)?.length ?? 0);
    if (!pathParts.length || score <= (match?.score ?? -1)) continue;
    if (pathParts.every((part, index) => part === parts[offset + index])) {
      match = { input, length: pathParts.length, score };
    }
  }
  return match;
}

function inputScopeForBinding(node, prop, fallback) {
  if (!prop) return { valid: false, scope: fallback };
  if (prop === '@content')
    return { valid: true, scope: { keys: new Set(), inputs: {}, children: new Map() } };
  const absolute = prop.match(/^@(data|collections|file)\[([^\]]+)\](?:\.(.+))?$/);
  let scope =
    absolute?.[1] === 'data'
      ? dataInputScope(absolute[2])
      : node.parent && node.parent.kind !== 'root'
        ? node.parent.inputScope
        : fallback;
  const inherited = absolute?.[1] === 'data' ? scope : fallback;
  const path = absolute ? absolute[3] : prop;
  if (absolute && absolute[1] !== 'data') return { valid: false, scope };
  const parts = (path ?? '').split('.').filter((part) => part && !/^\d+$/.test(part));
  for (let index = 0; index < parts.length; ) {
    const scopedPath = matchingPathInput(scope?.inputs, parts, index);
    const inheritedPath = index === 0 ? matchingPathInput(inherited?.inputs, parts, index) : null;
    const pathInput =
      (scopedPath?.score ?? -1) >= (inheritedPath?.score ?? -1) ? scopedPath : inheritedPath;
    if (pathInput) {
      const next = { keys: new Set(), inputs: {}, children: new Map() };
      mergeScopes(next, scopeForInput(pathInput.input));
      let valueScope = scope;
      for (const part of parts.slice(index, index + pathInput.length)) {
        valueScope = valueScope?.children?.get(part);
      }
      if (valueScope) mergeScopes(next, valueScope);
      scope = next;
      index += pathInput.length;
      continue;
    }
    const key = parts[index];
    const input = scope?.inputs?.[key] ?? inherited?.inputs?.[key] ?? rootInputs[key];
    if (!scope?.keys?.has(key) && !input) return { valid: false, scope };
    const next = { keys: new Set(), inputs: {}, children: new Map() };
    mergeScopes(next, scopeForInput(input));
    if (scope?.children?.has(key)) mergeScopes(next, scope.children.get(key));
    scope = next;
    index++;
  }
  return { valid: true, scope };
}

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

function resolveBinding(node, prop, entry, body) {
  const parent = node.parent;
  const parentVal = parent && 'val' in parent ? parent.val : MISSING;
  const abs = prop?.match(/^@(data|collections|file)\[([^\]]+)\](?:\.(.+))?$/);
  if (abs) {
    return abs[1] === 'data' ? lookup(datasets[abs[2]] ?? MISSING, abs[3]) : MISSING;
  }
  if (prop === '@content') return body ?? MISSING;
  if (parent && parent.kind !== 'root') {
    return parentVal === MISSING ? MISSING : lookup(parentVal, prop);
  }
  return entry === null ? MISSING : lookup(entry, prop);
}

function sourceForBinding(node, prop, hasEntry) {
  const abs = prop?.match(/^@(data|collections|file)\[([^\]]+)\]/);
  if (abs) return `${abs[1]}:${abs[2]}`;
  if (prop === '@content') return hasEntry ? 'entry' : null;
  if (node.parent && node.parent.kind !== 'root') return node.parent.bindingSource ?? null;
  return hasEntry ? 'entry' : null;
}

function resolve(node, entry, body, fallbackInputScope) {
  const prop = node.attrs['data-prop'];
  const parent = node.parent;
  const parentVal = parent && 'val' in parent ? parent.val : MISSING;

  if (node.kind === 'array-item') {
    const sibs = parent ? parent.kids.filter((k) => k.kind === 'array-item') : [];
    const idx = sibs.indexOf(node);
    node.val = Array.isArray(parentVal) && idx < parentVal.length ? parentVal[idx] : MISSING;
    node.inputScope = parent?.inputScope ?? fallbackInputScope;
    node.bindingSource = parent?.bindingSource ?? null;
  } else if (prop === undefined) {
    node.val = parent && parent.kind !== 'root' ? parentVal : MISSING;
    node.inputScope = parent?.inputScope ?? fallbackInputScope;
    node.bindingSource = parent?.bindingSource ?? null;
  } else {
    node.val = resolveBinding(node, prop, entry, body);
    node.inputScope = inputScopeForBinding(node, prop, fallbackInputScope).scope;
    node.bindingSource = sourceForBinding(node, prop, entry !== null);
  }
  for (const kid of node.kids) resolve(kid, entry, body, fallbackInputScope);
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
    const data = loadFile(filePath).data;
    const shapes = keyShapes(data);
    const exactShapes = (path) => {
      let values = [data];
      for (const part of inputPathParts(path)) {
        values = values.flatMap((value) => {
          if (Array.isArray(value)) {
            return value.flatMap((item) =>
              item && typeof item === 'object' && part in item ? [item[part]] : [],
            );
          }
          return value && typeof value === 'object' && part in value ? [value[part]] : [];
        });
      }
      return new Set(values.map(shapeOf));
    };
    for (const key of Object.keys(inputs)) {
      const s = key === '$' || key.startsWith('$.') ? exactShapes(key) : shapes[key];
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

// ── schema registration ──────────────────────────────────────────────────────
// A collection that uses a schema key (default `_schema`) resolves each entry to a
// SCHEMA by that value. If the value has no matching entry under the collection's
// `schemas`, CloudCannon refuses to open the file at all — "Schema not found", no
// sidebar, no preview. The page still builds and every data-prop still resolves, so
// nothing else here catches it; only opening the page in the editor would.
function checkSchemaRegistration() {
  const found = [];
  for (const [key, cfg] of Object.entries(collections)) {
    const schemas = cfg?.schemas;
    if (!schemas || !cfg?.path || !existsSync(cfg.path)) continue;
    const schemaKey = cfg.schema_key ?? '_schema';
    const declared = new Set(Object.keys(schemas));

    for (const name of readdirSync(cfg.path)) {
      const full = join(cfg.path, name);
      if (statSync(full).isDirectory()) continue;
      const value = loadFile(full).data?.[schemaKey];
      if (value === undefined || declared.has(value)) continue;
      found.push({
        kind: 'UNREGISTERED_SCHEMA',
        file: full,
        url: `${key}/${name}`,
        backing: full,
        tag: schemaKey,
        detail:
          `${schemaKey}: "${value}" has no entry under collections_config.${key}.schemas ` +
          `— CloudCannon shows "Schema not found" and the page cannot be opened`,
      });
    }

    for (const [sKey, sCfg] of Object.entries(schemas)) {
      if (sCfg?.path && !existsSync(sCfg.path)) {
        found.push({
          kind: 'ORPHANED_SCHEMA',
          file: 'cloudcannon.config.yml',
          url: `${key}/${sKey}`,
          backing: sCfg.path,
          tag: sKey,
          detail: `schema "${sKey}" points at ${sCfg.path}, which does not exist`,
        });
      }
    }
  }
  return found;
}

// ── data_config reachability ─────────────────────────────────────────────────
// A file in `data_config` is bindable on a page via @data[key], but that only makes
// the fields that are RENDERED somewhere editable. Anything else in the file — SEO
// copy, a 404's text — is reachable only through the sidebar collection that browses
// src/data. If the file is not in that collection's glob, those fields cannot be
// edited at all, and nothing else reports it.
function checkDataReachability() {
  const found = [];
  const dataColl = Object.entries(collections).find(
    ([, cfg]) => cfg?.path && Object.values(dataConfig).some((d) => d?.path?.startsWith(cfg.path)),
  );
  if (!dataColl) return found;
  const [collKey, collCfg] = dataColl;
  const globbed = collCfg.glob;
  if (!Array.isArray(globbed)) return found;

  for (const [key, cfg] of Object.entries(dataConfig)) {
    if (!cfg?.path) continue;
    const base = cfg.path.split('/').pop();
    if (globbed.some((g) => g === base || g === '*' || g === cfg.path)) continue;
    found.push({
      kind: 'UNREACHABLE_DATA_FILE',
      file: cfg.path,
      url: `@data[${key}]`,
      backing: cfg.path,
      tag: key,
      detail:
        `registered in data_config but missing from collections_config.${collKey}.glob ` +
        `— editors cannot open it in the sidebar, so any field not rendered on a page is uneditable`,
    });
  }
  return found;
}

// ── MDX snippet coverage ─────────────────────────────────────────────────────
// Components inside MDX bodies are editable only if a `_snippets` entry matches BOTH
// the component name and the attributes used. An attribute the snippet does not
// declare makes the whole element unmatched, and the Content Editor renders
// "<component> cannot be edited — Unexpected element" instead of the snippet. The
// page still builds correctly, so nothing else catches it.
function checkSnippetCoverage() {
  const found = [];
  const byComponent = {};
  for (const [key, snip] of Object.entries(cc._snippets ?? {})) {
    const def = snip?.definitions;
    if (!def?.component_name) continue;
    const args = new Set();
    const required = new Set();
    for (const a of def.named_args ?? []) {
      if (!a?.editor_key) continue;
      args.add(a.editor_key);
      // `optional: true` governs MATCHING, not just validation. An arg without it must
      // appear in the markup or the snippet does not match — a `default` does not help.
      if (a.optional !== true) required.add(a.editor_key);
    }
    (byComponent[def.component_name] ??= []).push({ key, args, required });
  }

  const dirs = Object.values(collections)
    .map((c) => c?.path)
    .filter((p) => p && existsSync(p));
  const seen = new Set();

  for (const dir of dirs) {
    for (const name of readdirSync(dir)) {
      if (!/\.mdx?$/.test(name)) continue;
      const full = join(dir, name);
      const src = readFileSync(full, 'utf8');
      const tag =
        /<([A-Z][A-Za-z0-9]*)((?:\s+[a-zA-Z][\w-]*(?:=(?:"[^"]*"|'[^']*'|\{[^}]*\}))?)*)\s*\/?>/g;
      let m;
      while ((m = tag.exec(src))) {
        const component = m[1];
        const attrs = [...(m[2] ?? '').matchAll(/([a-zA-Z][\w-]*)=/g)].map((a) => a[1]);
        const defs = byComponent[component];
        let detail;
        if (!defs) {
          detail = `no _snippets entry declares component_name: ${component}`;
        } else {
          // A usage is fine if ANY definition for this component accepts it: every
          // attribute declared, and every required arg supplied.
          const ok = defs.some(
            (d) =>
              attrs.every((a) => d.args.has(a)) && [...d.required].every((r) => attrs.includes(r)),
          );
          if (!ok) {
            const unknown = attrs.filter((a) => !defs.some((d) => d.args.has(a)));
            const missing = [...(defs[0].required ?? [])].filter((r) => !attrs.includes(r));
            detail = unknown.length
              ? `uses ${unknown.map((u) => `"${u}"`).join(', ')}, which no snippet declares`
              : `omits required arg ${missing.map((r) => `"${r}"`).join(', ')} ` +
                `(mark it \`optional: true\` in the snippet if the component defaults it)`;
          }
        }
        if (!detail) continue;
        const dedupe = `${full}|${component}|${detail}`;
        if (seen.has(dedupe)) continue;
        seen.add(dedupe);
        found.push({
          kind: 'UNMATCHED_SNIPPET',
          file: full,
          url: full,
          backing: full,
          tag: component,
          detail: `${detail} — the editor shows "cannot be edited: Unexpected element"`,
        });
      }
    }
  }
  return found;
}

// ── registered component coverage ───────────────────────────────────────────
const componentRegistrationErrors = [];

function registeredComponentKeys() {
  const found = new Set();
  for (const file of filesBelow('src/cloudcannon', new Set(['.ts', '.js', '.mjs']))) {
    const source = ts.createSourceFile(
      file,
      readFileSync(file, 'utf8'),
      ts.ScriptTarget.Latest,
      true,
    );
    const visit = (node) => {
      if (
        ts.isCallExpression(node) &&
        ts.isIdentifier(node.expression) &&
        /^(?:registerAstroComponent|registerReactComponent)$/.test(node.expression.text) &&
        node.arguments[0] &&
        ts.isStringLiteralLike(node.arguments[0])
      ) {
        const key = node.arguments[0].text;
        if (found.has(key)) {
          componentRegistrationErrors.push({
            kind: 'DUPLICATE_COMPONENT_REGISTRATION',
            file,
            url: key,
            backing: file,
            tag: key,
            detail: 'component key is registered more than once',
          });
        }
        found.add(key);
      }
      ts.forEachChild(node, visit);
    };
    visit(source);
  }
  return found;
}

const registeredComponents = registeredComponentKeys();

const EXPECTED_MARKETING_PAGE_IDS = new Set([
  'about',
  'blog-index',
  'case-studies-index',
  'contact',
  'districts',
  'faq',
  'home',
  'narrators-index',
  'newsroom',
  'platform',
  'pricing',
  'privacy-policy',
  'research',
]);

// ── fixed marketing-page contract ───────────────────────────────────────────
function routeUrlForSource(file) {
  let route = relative('src/pages', file)
    .replace(/\\/g, '/')
    .replace(/\.astro$/, '');
  if (route.includes('[')) return null;
  if (route === 'index') return '/';
  if (route.endsWith('/index')) route = route.slice(0, -'/index'.length);
  return `/${route}/`.replace(/\/{2,}/g, '/');
}

function pageSchemaRegistry() {
  const registryPath = 'src/lib/page-schemas/index.ts';
  const result = { ids: new Map(), errors: [] };
  if (!existsSync(registryPath)) return result;
  const source = ts.createSourceFile(
    registryPath,
    readFileSync(registryPath, 'utf8'),
    ts.ScriptTarget.Latest,
    true,
  );
  const imports = new Map();
  for (const statement of source.statements) {
    if (!ts.isImportDeclaration(statement) || !ts.isStringLiteral(statement.moduleSpecifier))
      continue;
    const module = statement.moduleSpecifier.text;
    for (const element of statement.importClause?.namedBindings?.elements ?? []) {
      imports.set(element.name.text, module);
    }
  }
  let registryArray = null;
  const findRegistry = (node) => {
    if (
      ts.isVariableDeclaration(node) &&
      ts.isIdentifier(node.name) &&
      node.name.text === 'pageSchemas' &&
      node.initializer
    ) {
      const findArray = (candidate) => {
        if (!registryArray && ts.isArrayLiteralExpression(candidate)) registryArray = candidate;
        else ts.forEachChild(candidate, findArray);
      };
      findArray(node.initializer);
    }
    if (!registryArray) ts.forEachChild(node, findRegistry);
  };
  findRegistry(source);
  if (!registryArray) return result;

  for (const element of registryArray.elements) {
    const call = ts.isCallExpression(element) ? element : null;
    const name = call && ts.isIdentifier(call.expression) ? call.expression.text : null;
    const module = name ? imports.get(name) : null;
    const file = module?.startsWith('./')
      ? join('src/lib/page-schemas', `${module.slice(2)}.ts`)
      : null;
    if (!name || !file || !existsSync(file)) {
      result.errors.push({
        kind: 'UNREADABLE_ZOD_REGISTRY',
        file: registryPath,
        url: name ?? 'pageSchemas',
        backing: file,
        tag: name ?? 'pageSchemas',
        detail: 'pageSchemas contains an entry that cannot be traced to an imported schema module',
      });
      continue;
    }
    const moduleSource = ts.createSourceFile(
      file,
      readFileSync(file, 'utf8'),
      ts.ScriptTarget.Latest,
      true,
    );
    let exportedInitializer = null;
    for (const statement of moduleSource.statements) {
      if (!ts.isVariableStatement(statement)) continue;
      const declaration = statement.declarationList.declarations.find(
        (item) => ts.isIdentifier(item.name) && item.name.text === name,
      );
      if (declaration?.initializer) {
        exportedInitializer = declaration.initializer;
        break;
      }
    }
    const literals = [];
    const visit = (node) => {
      if (
        ts.isPropertyAssignment(node) &&
        propertyName(node.name) === '_schema' &&
        ts.isCallExpression(node.initializer) &&
        ts.isPropertyAccessExpression(node.initializer.expression) &&
        ts.isIdentifier(node.initializer.expression.expression) &&
        node.initializer.expression.expression.text === 'z' &&
        node.initializer.expression.name.text === 'literal' &&
        node.initializer.arguments[0] &&
        ts.isStringLiteralLike(node.initializer.arguments[0])
      ) {
        literals.push(node.initializer.arguments[0].text);
      }
      ts.forEachChild(node, visit);
    };
    if (exportedInitializer) visit(exportedInitializer);
    if (literals.length !== 1) {
      result.errors.push({
        kind: 'INVALID_ZOD_SCHEMA_MODULE',
        file,
        url: name,
        backing: file,
        tag: name,
        detail: `registered schema module must declare exactly one _schema literal (found ${literals.length})`,
      });
      continue;
    }
    const id = literals[0];
    const uses = result.ids.get(id) ?? [];
    uses.push(file);
    result.ids.set(id, uses);
  }
  return result;
}

function marketingEntriesInRoute(file) {
  const source = readFileSync(file, 'utf8');
  const frontmatter = source.match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1];
  if (!frontmatter) return [];
  const ast = ts.createSourceFile(file, frontmatter, ts.ScriptTarget.Latest, true);
  const ids = [];
  const visit = (node) => {
    if (
      ts.isCallExpression(node) &&
      ts.isIdentifier(node.expression) &&
      node.expression.text === 'getEntry' &&
      node.arguments[0] &&
      ts.isStringLiteralLike(node.arguments[0]) &&
      node.arguments[0].text === 'pages' &&
      node.arguments[1] &&
      ts.isStringLiteralLike(node.arguments[1])
    ) {
      ids.push(node.arguments[1].text);
    }
    ts.forEachChild(node, visit);
  };
  visit(ast);
  return ids;
}

function checkMarketingPageContract() {
  const found = [];
  const pagesCfg = collections.pages;
  if (!pagesCfg) {
    found.push({
      kind: 'MISSING_PAGES_COLLECTION',
      file: 'cloudcannon.config.yml',
      url: 'pages',
      backing: null,
      tag: 'pages',
      detail: 'the fixed-layout Marketing pages collection is required',
    });
    return found;
  }
  if (!pagesCfg.path || !existsSync(pagesCfg.path)) {
    found.push({
      kind: 'MISSING_PAGES_PATH',
      file: 'cloudcannon.config.yml',
      url: 'pages',
      backing: pagesCfg.path ?? null,
      tag: 'path',
      detail: 'the Marketing pages content directory does not exist',
    });
    return found;
  }
  if (pagesCfg.disable_add !== true) {
    found.push({
      kind: 'UNSAFE_PAGES_COLLECTION',
      file: 'cloudcannon.config.yml',
      url: 'pages',
      backing: pagesCfg.path,
      tag: 'disable_add',
      detail: 'fixed-layout Marketing pages must keep disable_add: true',
    });
  }
  if (pagesCfg.url !== '{permalink}') {
    found.push({
      kind: 'INVALID_PAGES_URL',
      file: 'cloudcannon.config.yml',
      url: 'pages',
      backing: pagesCfg.path,
      tag: 'url',
      detail: 'Marketing pages must use url: "{permalink}"',
    });
  }

  const pageFiles = [...filesBelow(pagesCfg.path, new Set(['.yml', '.yaml', '.json']))];
  const entries = pageFiles.map((path) => ({
    path,
    id: path.slice(path.lastIndexOf('/') + 1).replace(/\.[^.]+$/, ''),
    data: loadFile(path).data,
  }));

  const permalinks = new Map();
  for (const entry of entries) {
    const permalink = entry.data?.permalink;
    if (typeof permalink !== 'string' || !permalink.startsWith('/') || !permalink.endsWith('/')) {
      found.push({
        kind: 'MISSING_PERMALINK',
        file: entry.path,
        url: entry.id,
        backing: entry.path,
        tag: 'permalink',
        detail: 'marketing page needs a non-empty permalink with leading and trailing slashes',
      });
    } else {
      const prior = permalinks.get(permalink);
      if (prior) {
        found.push({
          kind: 'DUPLICATE_PERMALINK',
          file: entry.path,
          url: permalink,
          backing: entry.path,
          tag: 'permalink',
          detail: `also used by ${prior}`,
        });
      } else {
        permalinks.set(permalink, entry.path);
      }
    }
    if (entry.data?._schema !== entry.id) {
      found.push({
        kind: 'PAGE_ID_MISMATCH',
        file: entry.path,
        url: String(permalink ?? entry.id),
        backing: entry.path,
        tag: '_schema',
        detail: `filename id "${entry.id}" does not match _schema "${entry.data?._schema ?? ''}"`,
      });
    }
  }

  const entryById = new Map(entries.map((entry) => [entry.id, entry]));
  for (const id of EXPECTED_MARKETING_PAGE_IDS) {
    if (entryById.has(id)) continue;
    found.push({
      kind: 'MISSING_MARKETING_PAGE',
      file: pagesCfg.path,
      url: id,
      backing: null,
      tag: id,
      detail: 'required fixed-layout marketing page is missing',
    });
  }
  for (const [id, entry] of entryById) {
    if (EXPECTED_MARKETING_PAGE_IDS.has(id)) continue;
    found.push({
      kind: 'UNEXPECTED_MARKETING_PAGE',
      file: entry.path,
      url: id,
      backing: entry.path,
      tag: id,
      detail: 'marketing page is not part of the fixed thirteen-page contract',
    });
  }
  const configured = pagesCfg.schemas ?? {};
  for (const entry of entries) {
    const schema = configured[entry.id];
    if (!schema) {
      found.push({
        kind: 'MISSING_PAGE_CONFIG',
        file: 'cloudcannon.config.yml',
        url: entry.id,
        backing: entry.path,
        tag: entry.id,
        detail: `collections_config.pages.schemas has no "${entry.id}" entry`,
      });
    } else if (typeof schema.path !== 'string' || !existsSync(schema.path)) {
      found.push({
        kind: 'MISSING_PAGE_SCHEMA_TEMPLATE',
        file: 'cloudcannon.config.yml',
        url: entry.id,
        backing: schema.path ?? null,
        tag: entry.id,
        detail: `schema template ${schema.path ?? '(missing)'} does not exist`,
      });
    } else if (
      schema.path === pagesCfg.path ||
      schema.path.startsWith(`${pagesCfg.path.replace(/\/$/, '')}/`)
    ) {
      found.push({
        kind: 'PAGE_SCHEMA_TEMPLATE_IN_COLLECTION',
        file: 'cloudcannon.config.yml',
        url: entry.id,
        backing: schema.path,
        tag: entry.id,
        detail:
          'schema templates must live outside the Marketing pages collection or CloudCannon hides them from the collection listing',
      });
    }
  }
  for (const id of Object.keys(configured)) {
    if (entryById.has(id)) continue;
    found.push({
      kind: 'ORPHANED_PAGE_CONFIG',
      file: 'cloudcannon.config.yml',
      url: id,
      backing: configured[id]?.path ?? null,
      tag: id,
      detail: 'CloudCannon page schema has no matching marketing content file',
    });
  }

  const registry = pageSchemaRegistry();
  found.push(...registry.errors);
  const zodIds = new Set(registry.ids.keys());
  for (const [id, files] of registry.ids) {
    if (files.length === 1) continue;
    found.push({
      kind: 'DUPLICATE_ZOD_DISCRIMINANT',
      file: files[1],
      url: id,
      backing: files[0],
      tag: id,
      detail: `pageSchemas registers _schema "${id}" ${files.length} times`,
    });
  }
  for (const entry of entries) {
    if (zodIds.has(entry.id)) continue;
    found.push({
      kind: 'MISSING_ZOD_DISCRIMINANT',
      file: 'src/lib/page-schemas',
      url: entry.id,
      backing: entry.path,
      tag: entry.id,
      detail: 'marketing page id is absent from the page-schema discriminated union',
    });
  }
  for (const id of zodIds) {
    if (entryById.has(id)) continue;
    found.push({
      kind: 'ORPHANED_ZOD_DISCRIMINANT',
      file: 'src/lib/page-schemas',
      url: id,
      backing: null,
      tag: id,
      detail: 'Zod page discriminant has no matching marketing content file',
    });
  }

  const routes = new Map();
  for (const file of filesBelow('src/pages', new Set(['.astro']))) {
    const url = routeUrlForSource(file);
    for (const id of marketingEntriesInRoute(file)) {
      const uses = routes.get(id) ?? [];
      uses.push({ file, url });
      routes.set(id, uses);
    }
  }
  for (const [id, uses] of routes) {
    if (uses.length === 1) continue;
    found.push({
      kind: 'DUPLICATE_PAGE_ROUTE',
      file: uses[1].file,
      url: uses[1].url ?? id,
      backing: uses[0].file,
      tag: id,
      detail: `marketing page id is loaded by ${uses.length} fixed routes`,
    });
  }
  for (const entry of entries) {
    const route = routes.get(entry.id)?.[0];
    if (!route) {
      found.push({
        kind: 'MISSING_PAGE_ROUTE',
        file: 'src/pages',
        url: entry.id,
        backing: entry.path,
        tag: entry.id,
        detail: 'no fixed Astro route loads this marketing page id',
      });
    } else if (route.url !== entry.data?.permalink) {
      found.push({
        kind: 'PAGE_ROUTE_MISMATCH',
        file: route.file,
        url: route.url ?? entry.id,
        backing: entry.path,
        tag: entry.id,
        detail: `route URL "${route.url}" does not match permalink "${entry.data?.permalink ?? ''}"`,
      });
    }
  }
  for (const [id, uses] of routes) {
    if (entryById.has(id)) continue;
    const route = uses[0];
    found.push({
      kind: 'ORPHANED_PAGE_ROUTE',
      file: route.file,
      url: route.url ?? id,
      backing: null,
      tag: id,
      detail: 'Astro route loads a marketing page id with no matching content file',
    });
  }

  const marketingRoot = ROOTS.find((root) => !/(^|[/\\])dist-help[/\\]?$/.test(root));
  if (marketingRoot) {
    for (const entry of entries) {
      const permalink = entry.data?.permalink;
      if (typeof permalink !== 'string' || !permalink.startsWith('/')) continue;
      const relativeOutput =
        permalink === '/' ? 'index.html' : join(permalink.slice(1), 'index.html');
      const output = join(marketingRoot, relativeOutput);
      if (existsSync(output)) continue;
      found.push({
        kind: 'MISSING_OUTPUT_PAGE',
        file: output,
        url: permalink,
        backing: entry.path,
        tag: entry.id,
        detail: 'the marketing page contract has no generated HTML output',
      });
    }
  }

  return found;
}

// ── creation-schema completeness ────────────────────────────────────────────
// Parse the Zod object with the TypeScript compiler API. This intentionally checks
// object fields recursively but treats an empty array as a complete seed: its item
// shape is governed by the CloudCannon structure and is checked separately.
function propertyName(node) {
  if (ts.isIdentifier(node) || ts.isStringLiteral(node) || ts.isNumericLiteral(node)) {
    return node.text;
  }
  return null;
}

function sourceDeclarations(sourceFile, within = sourceFile) {
  const declarations = new Map();
  const visit = (node) => {
    if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.initializer) {
      declarations.set(node.name.text, node.initializer);
    }
    ts.forEachChild(node, visit);
  };
  visit(within);
  return declarations;
}

function zodShape(node, declarations, seen = new Set()) {
  if (!node) return { kind: 'leaf' };
  if (ts.isParenthesizedExpression(node)) return zodShape(node.expression, declarations, seen);
  if (ts.isIdentifier(node)) {
    if (seen.has(node.text)) return { kind: 'leaf' };
    const resolved = declarations.get(node.text);
    return resolved
      ? zodShape(resolved, declarations, new Set([...seen, node.text]))
      : { kind: 'leaf' };
  }
  if (!ts.isCallExpression(node)) return { kind: 'leaf' };

  const callee = node.expression;
  if (
    ts.isPropertyAccessExpression(callee) &&
    ts.isIdentifier(callee.expression) &&
    callee.expression.text === 'z' &&
    callee.name.text === 'object'
  ) {
    const object = node.arguments[0];
    if (!object || !ts.isObjectLiteralExpression(object))
      return { kind: 'object', fields: new Map() };
    const fields = new Map();
    for (const prop of object.properties) {
      if (!ts.isPropertyAssignment(prop)) continue;
      const name = propertyName(prop.name);
      if (name) fields.set(name, zodShape(prop.initializer, declarations, seen));
    }
    return { kind: 'object', fields };
  }
  if (
    ts.isPropertyAccessExpression(callee) &&
    ts.isIdentifier(callee.expression) &&
    callee.expression.text === 'z' &&
    callee.name.text === 'array'
  ) {
    return { kind: 'array', item: zodShape(node.arguments[0], declarations, seen) };
  }
  if (ts.isPropertyAccessExpression(callee) && callee.name.text === 'optional') {
    return { ...zodShape(callee.expression, declarations, seen), optional: true };
  }
  // optional/default/min/max/url/etc. preserve the underlying shape.
  if (ts.isPropertyAccessExpression(callee)) {
    return zodShape(callee.expression, declarations, seen);
  }
  return { kind: 'leaf' };
}

function collectionZodShape(file, variableName) {
  if (!existsSync(file)) return null;
  const sourceText = readFileSync(file, 'utf8');
  const sourceFile = ts.createSourceFile(file, sourceText, ts.ScriptTarget.Latest, true);
  const globals = sourceDeclarations(sourceFile);
  let declaration = null;
  for (const statement of sourceFile.statements) {
    if (!ts.isVariableStatement(statement)) continue;
    declaration = statement.declarationList.declarations.find(
      (item) => ts.isIdentifier(item.name) && item.name.text === variableName,
    );
    if (declaration) break;
  }
  const init = declaration?.initializer;
  if (!init || !ts.isCallExpression(init)) return null;
  const config = init.arguments[0];
  if (!config || !ts.isObjectLiteralExpression(config)) return null;
  const schemaProp = config.properties.find(
    (prop) => ts.isPropertyAssignment(prop) && propertyName(prop.name) === 'schema',
  );
  if (!schemaProp || !ts.isPropertyAssignment(schemaProp)) return null;

  let schemaExpr = schemaProp.initializer;
  const declarations = new Map(globals);
  if (ts.isArrowFunction(schemaExpr) || ts.isFunctionExpression(schemaExpr)) {
    for (const [key, value] of sourceDeclarations(sourceFile, schemaExpr))
      declarations.set(key, value);
    if (ts.isBlock(schemaExpr.body)) {
      let returned = null;
      const findReturn = (node) => {
        if (!returned && ts.isReturnStatement(node) && node.expression) returned = node.expression;
        else ts.forEachChild(node, findReturn);
      };
      findReturn(schemaExpr.body);
      schemaExpr = returned;
    } else {
      schemaExpr = schemaExpr.body;
    }
  }
  return zodShape(schemaExpr, declarations);
}

function missingCreationFields(shape, value, prefix = '', inputs = {}) {
  if (!shape || shape.kind !== 'object') return [];
  const missing = [];
  for (const [key, child] of shape.fields) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (!value || typeof value !== 'object' || !(key in value)) {
      if (child.optional && (inputs[key] || rootInputs[key])) continue;
      missing.push(path);
      continue;
    }
    if (value[key] == null && child.optional && (inputs[key] || rootInputs[key])) continue;
    if (child.kind === 'object')
      missing.push(...missingCreationFields(child, value[key], path, inputs));
    if (child.kind === 'array' && Array.isArray(value[key]) && value[key].length > 0) {
      for (const [index, item] of value[key].entries()) {
        if (child.item?.kind === 'object') {
          missing.push(...missingCreationFields(child.item, item, `${path}.${index}`, inputs));
        }
      }
    }
  }
  return missing;
}

function checkStructuredCreationFields(shape, inputs, context, prefix = '') {
  if (!shape || shape.kind !== 'object') return [];
  const found = [];
  for (const [key, child] of shape.fields) {
    if (child.kind !== 'object' && child.kind !== 'array') continue;
    const path = prefix ? `${prefix}.${key}` : key;
    const input = inputs?.[key] ?? rootInputs[key];
    const expectsObjects = child.kind === 'object' || child.item?.kind === 'object';
    const allowedTypes =
      child.kind === 'object' ? ['object'] : expectsObjects ? ['array'] : ['array', 'multiselect'];
    if (!input || !allowedTypes.includes(input.type)) {
      found.push({
        kind: 'INVALID_CREATION_INPUT',
        file: 'cloudcannon.config.yml',
        url: context,
        backing: 'cloudcannon.config.yml',
        tag: path,
        detail: `Zod ${child.kind} "${path}" needs a matching ${allowedTypes.join(' or ')} input`,
      });
      continue;
    }

    const refs = structureRefs(input);
    if (!expectsObjects && input.type === 'multiselect') continue;
    if (!refs.length) {
      found.push({
        kind: 'MISSING_CREATION_STRUCTURE',
        file: 'cloudcannon.config.yml',
        url: context,
        backing: 'cloudcannon.config.yml',
        tag: path,
        detail: `structured creation field "${path}" has no _structures reference`,
      });
      continue;
    }

    for (const ref of refs) {
      const structure = structures[ref];
      if (!structure?.values?.length) {
        found.push({
          kind: 'MISSING_CREATION_STRUCTURE',
          file: 'cloudcannon.config.yml',
          url: context,
          backing: 'cloudcannon.config.yml',
          tag: path,
          detail: `structured creation field "${path}" references missing or empty _structures.${ref}`,
        });
        continue;
      }
      for (const [index, option] of structure.values.entries()) {
        const nestedShape = child.kind === 'object' ? child : child.item;
        if (nestedShape?.kind !== 'object') continue;
        const template = option?.value;
        for (const missing of missingCreationFields(
          nestedShape,
          template,
          path,
          option?._inputs ?? {},
        )) {
          found.push({
            kind: 'MISSING_CREATION_STRUCTURE_FIELD',
            file: 'cloudcannon.config.yml',
            url: context,
            backing: `_structures.${ref}.values.${index}`,
            tag: missing,
            detail: `creation structure omits Zod field "${missing}"`,
          });
        }
        found.push(
          ...checkStructuredCreationFields(nestedShape, option?._inputs ?? {}, context, path),
        );
      }
    }
  }
  return found;
}

function checkCreationSchemas() {
  const found = [];
  const contracts = {
    blog: ['src/content.config.ts', 'blog'],
    caseStudies: ['src/content.config.ts', 'caseStudies'],
    help: ['src/lib/help-collection.ts', 'helpCollection'],
    narrators: ['src/content.config.ts', 'narrators'],
    series: ['src/content.config.ts', 'series'],
  };
  for (const [collection, [source, variable]] of Object.entries(contracts)) {
    const cfg = collections[collection];
    if (!cfg) {
      found.push({
        kind: 'MISSING_CREATABLE_COLLECTION',
        file: 'cloudcannon.config.yml',
        url: collection,
        backing: null,
        tag: collection,
        detail: 'required creatable collection is missing',
      });
      continue;
    }
    if (cfg.disable_add) {
      found.push({
        kind: 'DISABLED_CREATABLE_COLLECTION',
        file: 'cloudcannon.config.yml',
        url: collection,
        backing: cfg.path ?? null,
        tag: 'disable_add',
        detail: 'editors must be able to create entries in this collection',
      });
    }
    const schemaEntries = Object.entries(cfg.schemas ?? {});
    if (!schemaEntries.length) {
      found.push({
        kind: 'MISSING_CREATION_SCHEMA',
        file: 'cloudcannon.config.yml',
        url: collection,
        backing: cfg.path ?? null,
        tag: 'schemas',
        detail: 'creatable collection needs at least one creation schema',
      });
      continue;
    }
    const shape = collectionZodShape(source, variable);
    if (!shape) {
      found.push({
        kind: 'UNREADABLE_CREATION_CONTRACT',
        file: source,
        url: collection,
        backing: source,
        tag: collection,
        detail: `could not find the Zod object for ${variable}`,
      });
      continue;
    }
    for (const [schemaName, schema] of schemaEntries) {
      if (!schema?.path || !existsSync(schema.path)) {
        found.push({
          kind: 'MISSING_CREATION_SCHEMA',
          file: 'cloudcannon.config.yml',
          url: `${collection}/${schemaName}`,
          backing: schema?.path ?? null,
          tag: 'path',
          detail: 'creation schema path is missing or does not exist',
        });
        continue;
      }
      const seed = loadFile(schema.path).data;
      const creationInputs = { ...(cfg._inputs ?? {}), ...(schema._inputs ?? {}) };
      for (const field of missingCreationFields(shape, seed, '', creationInputs)) {
        found.push({
          kind: 'MISSING_CREATION_FIELD',
          file: schema.path,
          url: `${collection}/${schemaName}`,
          backing: source,
          tag: field,
          detail: `creation schema omits Zod field "${field}"`,
        });
      }
      found.push(
        ...checkStructuredCreationFields(shape, creationInputs, `${collection}/${schemaName}`),
      );
    }
  }
  return found;
}

// ── Help article link portability ───────────────────────────────────────────
function checkHelpLinks() {
  const found = [];
  const dir = collections.help?.path ?? 'src/content/help';
  if (!existsSync(dir)) return found;
  const articles = [...filesBelow(dir, new Set(['.md', '.mdx']))];
  const known = new Set(
    articles.map((file) => file.slice(file.lastIndexOf('/') + 1).replace(/\.[^.]+$/, '')),
  );
  for (const file of articles) {
    const source = readFileSync(file, 'utf8');
    const patterns = [
      /(?<!!)\]\(\s*<?(\/(?!\/)[^\s)>]+)/g,
      /href\s*=\s*['"`](\/(?!\/)[^'"`]+)['"`]/g,
      /href\s*=\s*\{\s*['"`](\/(?!\/)[^'"`]+)['"`]\s*\}/g,
      /href\s*=\s*(\/(?!\/)[^\s>]+)/g,
      /^\s*\[[^\]]+\]:\s*<?(\/(?!\/)[^\s>]+)>?/gm,
    ];
    const seen = new Set();
    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(source))) {
        const href = match.slice(1).find(Boolean);
        const segments = href.split(/[?#]/, 1)[0].split('/').filter(Boolean);
        const slug = segments[0] === 'help' ? segments[1] : segments[0];
        if (!known.has(slug)) continue;
        const line = source.slice(0, match.index).split('\n').length;
        const dedupe = `${line}|${href}`;
        if (seen.has(dedupe)) continue;
        seen.add(dedupe);
        found.push({
          kind: 'ROOT_RELATIVE_HELP_LINK',
          file,
          url: `${file}:${line}`,
          backing: file,
          tag: slug,
          detail:
            `root-relative link "${href}" targets Help article "${slug}" and cannot work on both sites; ` +
            'use a relative sibling URL',
        });
      }
    }
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

const errors = [
  ...mappingErrors,
  ...componentRegistrationErrors,
  ...checkInputAmbiguity(),
  ...checkSchemaRegistration(),
  ...checkDataReachability(),
  ...checkSnippetCoverage(),
  ...checkMarketingPageContract(),
  ...checkCreationSchemas(),
  ...checkHelpLinks(),
];
const warnings = [];
const stats = { pages: 0, regions: 0, unbacked: 0, byKind: {} };
const ALLOWED_UNBACKED_PAGES = new Set([
  'dist|/help/',
  'dist|/styleguide/',
  'dist-help|/',
  'dist-help|/404.html',
]);

for (const root of ROOTS) {
  for (const file of htmlFiles(root)) {
    const html = readFileSync(file, 'utf8');
    if (!html.includes('data-editable') && !html.includes('<editable-')) continue;
    const url =
      '/' +
      relative(root, file)
        .replace(/index\.html$/, '')
        .replace(/\\/g, '/');
    const lookupMap = basename(root) === 'dist-help' ? helpUrlToFile : mainUrlToFile;
    const backing = lookupMap.get(url) ?? null;
    const { data: entry, body } = backing ? loadFile(backing.path) : { data: null, body: null };
    const tree = parseEditables(html);
    const fallbackInputScope = entryInputScope(backing);
    for (const k of tree.kids) resolve(k, entry, body, fallbackInputScope);

    const nodes = flatten(tree);
    stats.pages++;
    stats.regions += nodes.length;
    const where = { file, url, backing: backing?.path ?? null };
    if (!backing) {
      stats.unbacked++;
      const key = `${basename(root)}|${url}`;
      if (!ALLOWED_UNBACKED_PAGES.has(key)) {
        errors.push({
          ...where,
          kind: 'UNBACKED_EDITABLE_PAGE',
          tag: 'page',
          detail: 'page has editable regions but no matching CloudCannon entry',
        });
      }
    }

    for (const n of nodes) {
      stats.byKind[n.kind] = (stats.byKind[n.kind] ?? 0) + 1;
      const prop = n.attrs['data-prop'];
      const propKeys = Object.keys(n.attrs).filter((k) => k.startsWith('data-prop'));

      const component = n.attrs['data-component'];
      if (n.kind === 'component' && !component) {
        errors.push({
          ...where,
          kind: 'MISSING_COMPONENT_KEY',
          tag: n.tag,
          detail: 'component region has no data-component key',
        });
      } else if (component && !registeredComponents.has(component)) {
        errors.push({
          ...where,
          kind: 'UNKNOWN_COMPONENT',
          tag: n.tag,
          detail: `data-component="${component}" is not registered`,
        });
      }

      const checkInput = (binding) => {
        if (!binding || binding === '@content') return;
        if (inputScopeForBinding(n, binding, fallbackInputScope).valid) return;
        errors.push({
          ...where,
          kind: 'MISSING_INPUT',
          tag: n.tag,
          detail: `editable binding "${binding}" has no matching CloudCannon input`,
        });
      };

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
        if (!n.bindingSource) continue; // page is not backed by an entry or data file
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
        checkInput(prop);
      } else if (n.kind === 'image') {
        const srcProp = n.attrs['data-prop-src'] ?? prop;
        if (srcProp === undefined) {
          errors.push({
            ...where,
            kind: 'MISSING_IMAGE_SOURCE_BINDING',
            tag: n.tag,
            detail: "image region has neither 'data-prop-src' nor 'data-prop'",
          });
        } else if (sourceForBinding(n, srcProp, entry !== null)) {
          const value = resolveBinding(n, srcProp, entry, body);
          if (value === MISSING) {
            errors.push({
              ...where,
              kind: 'INVALID_IMAGE_BINDING',
              tag: n.tag,
              detail: `image source binding "${srcProp}" resolves to undefined`,
            });
          } else if (
            value !== null &&
            typeof value !== 'string' &&
            !(typeof value === 'object' && typeof value.src === 'string')
          ) {
            errors.push({
              ...where,
              kind: 'INVALID_IMAGE_BINDING',
              tag: n.tag,
              detail: `image source binding "${srcProp}" resolves to ${Array.isArray(value) ? 'array' : typeof value}`,
            });
          }
          checkInput(srcProp);
        }
        const altProp = n.attrs['data-prop-alt'];
        if (altProp !== undefined && sourceForBinding(n, altProp, entry !== null)) {
          const value = resolveBinding(n, altProp, entry, body);
          if (value === MISSING || (value !== null && typeof value !== 'string')) {
            errors.push({
              ...where,
              kind: 'INVALID_IMAGE_BINDING',
              tag: n.tag,
              detail: `image alt binding "${altProp}" resolves to ${
                value === MISSING ? 'undefined' : Array.isArray(value) ? 'array' : typeof value
              }`,
            });
          }
          checkInput(altProp);
        }
      } else if (n.kind === 'array') {
        if (!n.bindingSource) continue;
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
        checkInput(prop);
      } else if (n.kind === 'array-item') {
        if (n.bindingSource && n.val === MISSING) {
          errors.push({
            ...where,
            kind: 'UNRESOLVED',
            tag: n.tag,
            detail: 'array-item has no matching data item',
          });
        }
        const nested = flatten(n).some((c) => c.kind === 'text' || c.kind === 'image');
        if (!nested) {
          errors.push({
            ...where,
            kind: 'MISSING_ARRAY_ITEM_BINDING',
            tag: n.tag,
            detail: 'array item has CRUD controls but no editable text/image inside',
          });
        }
      } else if (n.kind === 'component') {
        if (prop !== undefined && n.val === MISSING && n.bindingSource) {
          errors.push({
            ...where,
            kind: 'UNRESOLVED',
            tag: n.tag,
            detail: `component data-prop="${prop}" resolves to undefined`,
          });
        }
        if (n.bindingSource) checkInput(prop);
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
