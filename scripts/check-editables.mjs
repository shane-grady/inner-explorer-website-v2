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
 * CloudCannon edits and builds the Help Center only (cloudcannon.config.yml), so the
 * build it checks is `dist-help`. Besides the built HTML it reads the CloudCannon config,
 * the editor-owned content (src/content/help/, src/data/help-ui.json), the creation
 * templates in .cloudcannon/schemas/ and the help schema in src-help/lib/help-collection.ts.
 *
 * Usage: node scripts/check-editables.mjs [dir...]     (default: dist-help)
 *        node scripts/check-editables.mjs --report     (census output, never fails)
 */
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { extname, join, relative } from 'node:path';
import { parse as parseYaml } from 'yaml';
import ts from 'typescript';

const args = process.argv.slice(2);
const REPORT_ONLY = args.includes('--report');
const DIRS = args.filter((a) => !a.startsWith('--'));
const ROOTS = DIRS.length ? DIRS : ['dist-help'];
const missingRoots = ROOTS.filter((d) => !existsSync(d));
if (missingRoots.length) {
  console.error(`Missing build output: ${missingRoots.join(', ')}.`);
  console.error('Run `pnpm build:help` first — this checks built HTML, not source.');
  process.exit(1);
}

const MISSING = Symbol('missing');
const TEXT_TYPES = new Set(['span', 'text', 'block']);
const CONTENT_EXTENSIONS = new Set(['.md', '.mdx', '.yml', '.yaml', '.json']);
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
const fileBindingDataCache = new Map();

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

function repositoryFileForBinding(binding) {
  if (typeof binding !== 'string' || !binding.startsWith('/')) return null;
  const path = binding.slice(1);
  if (existsSync(path) && !statSync(path).isDirectory()) return path;
  if (extname(path)) return null;
  return [...CONTENT_EXTENSIONS].map((extension) => `${path}${extension}`).find(existsSync) ?? null;
}

function dataForFileBinding(binding) {
  const path = repositoryFileForBinding(binding);
  if (!path) return MISSING;
  if (!fileBindingDataCache.has(path)) fileBindingDataCache.set(path, loadFile(path).data);
  return fileBindingDataCache.get(path);
}

// url → backing file, built from each collection's `path` + `url` template. Only the
// FIXED `[slug]` placeholder is expanded: the help collection's `url: /[slug]/` puts
// every article at the root of the Help Center, which is exactly where dist-help
// serves it. Any other template leaves its pages unbacked, which fails below.
const urlToFile = new Map();
const mappingErrors = [];
function addUrlMapping(url, backing) {
  const prior = urlToFile.get(url);
  if (prior && prior.path !== backing.path) {
    mappingErrors.push({
      kind: 'DUPLICATE_OUTPUT_URL',
      file: 'cloudcannon.config.yml',
      url,
      backing: backing.path,
      tag: backing.collection,
      detail: `also maps to ${prior.path}`,
    });
    return;
  }
  urlToFile.set(url, backing);
}

for (const [key, cfg] of Object.entries(collections)) {
  if (!cfg?.path || !cfg?.url || cfg.disable_url) continue;
  if (!existsSync(cfg.path)) continue;
  for (const full of filesBelow(cfg.path, CONTENT_EXTENSIONS)) {
    const slug = relative(cfg.path, full)
      .replace(/\\/g, '/')
      .replace(/\.[^.]+$/, '');
    addUrlMapping(cfg.url.replace(/\[slug\]/g, slug), { collection: key, path: full });
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
const fileInputScopeCache = new Map();
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

function fileInputScope(binding) {
  if (fileInputScopeCache.has(binding)) return fileInputScopeCache.get(binding);
  const path = repositoryFileForBinding(binding);
  if (!path) return rootInputScope();
  const data = loadFile(path).data;
  const collectionEntry = Object.entries(collections).find(([, cfg]) => {
    const root = cfg?.path?.replace(/\/$/, '');
    return root && (path === root || path.startsWith(`${root}/`));
  });
  const [, collection] = collectionEntry ?? [];
  const schemaKey = collection?.schema_key ?? '_schema';
  const fileInputs = (cc.file_config ?? [])
    .filter((cfg) => cfg?.glob === path)
    .map((cfg) => cfg._inputs);
  const scope = rootInputScope(
    collection?._inputs,
    collection?.schemas?.[data?.[schemaKey]]?._inputs,
    ...fileInputs,
  );
  fileInputScopeCache.set(binding, scope);
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
      : absolute?.[1] === 'file'
        ? fileInputScope(absolute[2])
        : node.parent && node.parent.kind !== 'root'
          ? node.parent.inputScope
          : fallback;
  const inherited = absolute?.[1] === 'data' || absolute?.[1] === 'file' ? scope : fallback;
  const path = absolute ? absolute[3] : prop;
  if (absolute && absolute[1] !== 'data' && absolute[1] !== 'file') {
    return { valid: false, scope };
  }
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
    if (abs[1] === 'data') return lookup(datasets[abs[2]] ?? MISSING, abs[3]);
    if (abs[1] === 'file') return lookup(dataForFileBinding(abs[2]), abs[3]);
    return MISSING;
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
// used twice inside one file with DIFFERENT shapes cannot be declared at schema or
// file level without mis-typing one of the uses — e.g. help-ui.json's `title` is a
// string in every group; making one of them an object would leave a single `title`
// input wrong for the others. Structure-level `_inputs` are naturally scoped to their
// structure and are therefore exempt.
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

// End index of the JSX expression `{…}` that opens at `start`, or -1. Braces inside
// JS strings and template literals do not count, so `items={[{ title: '…' }]}` works.
function jsxExpressionEnd(src, start) {
  let depth = 0;
  for (let i = start; i < src.length; i++) {
    const c = src[i];
    if (c === '"' || c === "'" || c === '`') {
      for (i++; i < src.length && src[i] !== c; i++) if (src[i] === '\\') i++;
    } else if (c === '{') depth++;
    else if (c === '}' && --depth === 0) return i + 1;
  }
  return -1;
}

// Every `<Component …>` opening tag in an MDX body, with its attribute names.
function* mdxComponentTags(src) {
  const open = /<([A-Z][A-Za-z0-9]*)(?=[\s/>])/g;
  let m;
  while ((m = open.exec(src))) {
    const attrs = [];
    let i = open.lastIndex;
    let closed = false;
    while (i !== -1 && i < src.length) {
      while (/\s/.test(src[i] ?? '')) i++;
      if (src[i] === '>' || src.startsWith('/>', i)) {
        closed = true;
        break;
      }
      const name = /^[a-zA-Z][\w-]*/.exec(src.slice(i, i + 100))?.[0];
      if (!name) break;
      attrs.push(name);
      i += name.length;
      if (src[i] !== '=') continue;
      i++;
      if (src[i] === '{') i = jsxExpressionEnd(src, i);
      else if (src[i] === '"' || src[i] === "'") {
        const end = src.indexOf(src[i], i + 1);
        i = end === -1 ? -1 : end + 1;
      } else break;
    }
    if (closed) yield { component: m[1], attrs };
  }
}

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
      for (const { component, attrs } of mdxComponentTags(src)) {
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
    callee.name.text === 'preprocess'
  ) {
    return zodShape(node.arguments[1], declarations, seen);
  }
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

function missingCreationFields(shape, value, prefix = '') {
  if (!shape || shape.kind !== 'object') return [];
  const missing = [];
  for (const [key, child] of shape.fields) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (!value || typeof value !== 'object' || !(key in value)) {
      missing.push(path);
      continue;
    }
    if (value[key] == null && child.optional) continue;
    if (child.kind === 'object') missing.push(...missingCreationFields(child, value[key], path));
    if (child.kind === 'array' && Array.isArray(value[key]) && value[key].length > 0) {
      for (const [index, item] of value[key].entries()) {
        if (child.item?.kind === 'object') {
          missing.push(...missingCreationFields(child.item, item, `${path}.${index}`));
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
    help: {
      source: 'src-help/lib/help-collection.ts',
      variable: 'helpCollection',
      createPath: '[relative_base_path]/{title|slugify}[count].mdx',
      sentinel: { path: 'seoTitle', value: 'New help article | Inner Explorer' },
    },
  };
  if (cc._inputs?._schema) {
    found.push({
      kind: 'GLOBAL_SCHEMA_INPUT',
      file: 'cloudcannon.config.yml',
      url: '_inputs._schema',
      backing: 'cloudcannon.config.yml',
      tag: '_schema',
      detail:
        'a global _schema input lets CloudCannon serialize schema metadata into single-shape collections',
    });
  }
  for (const [collection, contract] of Object.entries(contracts)) {
    const { source, variable, createPath: requiredCreatePath, sentinel } = contract;
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
    if (Object.keys(cfg.schemas ?? {}).length) {
      found.push({
        kind: 'CREATION_SCHEMA_POLLUTION_RISK',
        file: 'cloudcannon.config.yml',
        url: collection,
        backing: cfg.path ?? null,
        tag: 'schemas',
        detail:
          'single-shape collections must seed new entries with add_options.default_content_file; ' +
          'schemas can apply maintenance behavior to existing entries',
      });
    } else if (cfg.schemas !== null) {
      found.push({
        kind: 'MISSING_SCHEMA_TOMBSTONE',
        file: 'cloudcannon.config.yml',
        url: collection,
        backing: cfg.path ?? null,
        tag: 'schemas',
        detail:
          'creatable single-shape collections require schemas: null to clear legacy schema maintenance on provisioned Sites',
      });
    }
    if (cfg.path && existsSync(cfg.path)) {
      for (const file of filesBelow(cfg.path, CONTENT_EXTENSIONS)) {
        const data = loadFile(file).data;
        if (data._schema !== undefined) {
          found.push({
            kind: 'MANAGED_SCHEMA_METADATA',
            file,
            url: collection,
            backing: file,
            tag: '_schema',
            detail:
              'single-shape content must not carry _schema metadata; creation uses a default_content_file only',
          });
        }
        if (sentinel && lookup(data, sentinel.path) === sentinel.value && data.draft !== true) {
          found.push({
            kind: 'CREATION_TEMPLATE_SENTINEL',
            file,
            url: collection,
            backing: file,
            tag: sentinel.path,
            detail: `published content contains creation-only placeholder "${sentinel.value}"`,
          });
        }
      }
    }
    const createPath = typeof cfg.create === 'string' ? cfg.create : cfg.create?.path;
    if (!createPath) {
      found.push({
        kind: 'MISSING_CREATION_PATH',
        file: 'cloudcannon.config.yml',
        url: collection,
        backing: cfg.path ?? null,
        tag: 'create.path',
        detail: `creatable collection needs ${requiredCreatePath}`,
      });
    } else if (createPath !== requiredCreatePath) {
      found.push({
        kind: 'INVALID_CREATION_PATH',
        file: 'cloudcannon.config.yml',
        url: collection,
        backing: cfg.path ?? null,
        tag: 'create.path',
        detail: `creation path must be ${requiredCreatePath}; found ${createPath}`,
      });
    }
    const addOptions = Array.isArray(cfg.add_options)
      ? cfg.add_options.filter((option) => option && typeof option === 'object' && !option.href)
      : [];
    if (!addOptions.length) {
      found.push({
        kind: 'MISSING_CREATION_TEMPLATE',
        file: 'cloudcannon.config.yml',
        url: collection,
        backing: cfg.path ?? null,
        tag: 'add_options',
        detail: 'creatable collection needs an explicit add option with default_content_file',
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
    for (const [index, option] of addOptions.entries()) {
      const context = `${collection}/add_options/${index}`;
      if (option.schema || !option.default_content_file) {
        found.push({
          kind: 'UNCONFIGURED_CREATION_TEMPLATE',
          file: 'cloudcannon.config.yml',
          url: context,
          backing: option.default_content_file ?? null,
          tag: option.schema ? 'schema' : 'default_content_file',
          detail: option.schema
            ? 'creation add option uses schema; use default_content_file to avoid maintaining existing entries'
            : 'creation add option has no default_content_file',
        });
        continue;
      }
      const templatePath = option.default_content_file;
      if (!existsSync(templatePath)) {
        found.push({
          kind: 'MISSING_CREATION_TEMPLATE',
          file: 'cloudcannon.config.yml',
          url: context,
          backing: templatePath,
          tag: 'default_content_file',
          detail: `creation template ${templatePath} does not exist`,
        });
        continue;
      }
      const seed = loadFile(templatePath).data;
      const creationInputs = cfg._inputs ?? {};
      for (const field of missingCreationFields(shape, seed)) {
        found.push({
          kind: 'MISSING_CREATION_FIELD',
          file: templatePath,
          url: context,
          backing: source,
          tag: field,
          detail: `creation template omits Zod field "${field}"`,
        });
      }
      found.push(...checkStructuredCreationFields(shape, creationInputs, context));
    }
  }
  return found;
}

function checkSnippetDefaults() {
  const found = [];
  const requiredSelectArgs = new Map([
    ['Callout.type', 'tip'],
    ['HelpFigure.ratio', '16 / 9'],
    ['HelpVideo.ratio', '16 / 9'],
  ]);
  const occurrences = new Map();
  for (const [snippet, config] of Object.entries(cc._snippets ?? {})) {
    for (const model of config?.definitions?.named_args ?? []) {
      const key = `${config.definitions?.component_name}.${model?.editor_key}`;
      const expectedDefault = requiredSelectArgs.get(key);
      if (expectedDefault !== undefined) {
        occurrences.set(key, (occurrences.get(key) ?? 0) + 1);
        if (model.optional === true || model.remove_empty === true) {
          found.push({
            kind: 'SNIPPET_SELECT_OPTIONAL',
            file: 'cloudcannon.config.yml',
            url: snippet,
            backing: config.definitions?.component_name ?? null,
            tag: model.editor_key ?? '(unknown)',
            detail:
              'semantic Select arguments must remain explicit; CloudCannon hydrates omitted snippet Selects while parsing MDX and dirties unrelated edits',
          });
        }
        if (model.default !== expectedDefault) {
          found.push({
            kind: 'SNIPPET_SELECT_DEFAULT',
            file: 'cloudcannon.config.yml',
            url: snippet,
            backing: config.definitions?.component_name ?? null,
            tag: model.editor_key ?? '(unknown)',
            detail: `new snippets must serialize the same ${JSON.stringify(expectedDefault)} value that Astro uses as its runtime fallback`,
          });
        }
        const input = config?._inputs?.[model.editor_key];
        const values = input?.options?.values ?? [];
        if (input?.type !== 'select' || !values.includes(expectedDefault)) {
          found.push({
            kind: 'SNIPPET_SELECT_INPUT',
            file: 'cloudcannon.config.yml',
            url: snippet,
            backing: config.definitions?.component_name ?? null,
            tag: model.editor_key ?? '(unknown)',
            detail:
              'the required snippet argument must use a closed Select containing its insertion default',
          });
        }
        if (input?.options?.allow_empty === true) {
          found.push({
            kind: 'SNIPPET_SELECT_ALLOW_EMPTY',
            file: 'cloudcannon.config.yml',
            url: snippet,
            backing: config.definitions?.component_name ?? null,
            tag: model.editor_key ?? '(unknown)',
            detail:
              'allow_empty is ineffective for MDX snippet hydration and contradicts this explicit-value contract',
          });
        }
      }
    }
  }
  for (const key of requiredSelectArgs.keys()) {
    const count = occurrences.get(key) ?? 0;
    if (count === 1) continue;
    const [component, field] = key.split('.');
    found.push({
      kind: count === 0 ? 'SNIPPET_SELECT_MISSING' : 'SNIPPET_SELECT_DUPLICATE',
      file: 'cloudcannon.config.yml',
      url: component,
      backing: component,
      tag: field,
      detail:
        count === 0
          ? 'the semantic snippet Select must remain in the explicit CMS contract'
          : `the semantic snippet Select must be declared exactly once (found ${count})`,
    });
  }
  return found;
}

function checkSelectSources() {
  const found = [];
  const visit = (value, path = []) => {
    if (!value || typeof value !== 'object') return;
    if (value._inputs && typeof value._inputs === 'object') {
      for (const [key, input] of Object.entries(value._inputs)) {
        if (!['select', 'multiselect'].includes(input?.type)) continue;
        const values = input?.options?.values;
        if (!Array.isArray(values) || values.length > 0) continue;
        found.push({
          kind: 'EMPTY_SELECT_VALUES',
          file: 'cloudcannon.config.yml',
          url: path.join('.') || '(root)',
          backing: 'cloudcannon.config.yml',
          tag: key,
          detail:
            'Select and Multiselect inputs need a populated values source; an empty array renders as a misconfigured control in CloudCannon',
        });
      }
    }
    for (const [key, child] of Object.entries(value)) visit(child, [...path, key]);
  };
  visit(cc);
  return found;
}

function checkSnippetArgumentOrder() {
  const found = [];
  const config = Object.values(cc._snippets ?? {}).find(
    (snippet) => snippet?.definitions?.component_name === 'HelpVideo',
  );
  const expected = (config?.definitions?.named_args ?? [])
    .map((arg) => arg?.source_key ?? arg?.editor_key)
    .filter(Boolean);
  if (expected.length < 2) return found;
  const contentDirs = new Set(
    Object.values(collections)
      .map((config) => config?.path)
      .filter(Boolean),
  );
  for (const dir of contentDirs) {
    for (const file of filesBelow(dir, new Set(['.md', '.mdx']))) {
      const source = readFileSync(file, 'utf8');
      for (const match of source.matchAll(/<HelpVideo\b([^>]*)\/>/g)) {
        const actual = [...match[1].matchAll(/(?:^|\s)([A-Za-z_$][\w$:.-]*)\s*=/g)]
          .map((attribute) => attribute[1])
          .filter((name) => expected.includes(name));
        const canonical = expected.filter((name) => actual.includes(name));
        if (actual.every((name, index) => name === canonical[index])) continue;
        const line = source.slice(0, match.index).split('\n').length;
        found.push({
          kind: 'NONCANONICAL_SNIPPET_ARG_ORDER',
          file,
          url: `${file}:${line}`,
          backing: 'HelpVideo',
          tag: 'HelpVideo',
          detail: `snippet arguments must follow CloudCannon's serializer order (${canonical.join(', ')})`,
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
  ...checkInputAmbiguity(),
  ...checkSchemaRegistration(),
  ...checkDataReachability(),
  ...checkSnippetCoverage(),
  ...checkCreationSchemas(),
  ...checkSelectSources(),
  ...checkSnippetDefaults(),
  ...checkSnippetArgumentOrder(),
];
const warnings = [];
const stats = { pages: 0, regions: 0, unbacked: 0, byKind: {} };
// Help pages that are not collection entries. Their regions bind with absolute
// `@data[help-ui]…` paths, so they need no backing file.
const ALLOWED_UNBACKED_PAGES = new Set(['/', '/404.html']);

for (const root of ROOTS) {
  for (const file of htmlFiles(root)) {
    const html = readFileSync(file, 'utf8');
    if (!html.includes('data-editable') && !html.includes('<editable-')) continue;
    const url =
      '/' +
      relative(root, file)
        .replace(/index\.html$/, '')
        .replace(/\\/g, '/');
    const backing = urlToFile.get(url) ?? null;
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
      if (!ALLOWED_UNBACKED_PAGES.has(url)) {
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

      // A component region re-renders through a renderer registered in the editor
      // iframe. The Help Center registers none (HelpBaseLayout loads no registration
      // script), so any `data-component` shows "Failed to render component" there.
      const component = n.attrs['data-component'];
      if (n.kind === 'component' && !component) {
        errors.push({
          ...where,
          kind: 'MISSING_COMPONENT_KEY',
          tag: n.tag,
          detail: 'component region has no data-component key',
        });
      } else if (component) {
        errors.push({
          ...where,
          kind: 'UNKNOWN_COMPONENT',
          tag: n.tag,
          detail: `data-component="${component}" is not registered; the Help Center registers no component renderers`,
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
