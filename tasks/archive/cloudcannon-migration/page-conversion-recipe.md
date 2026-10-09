# Converting a marketing route to the `pages` collection

The worked example is `/faq/` — read these four files together before starting:

| File                          | Role                                         |
| ----------------------------- | -------------------------------------------- |
| `src/content/pages/faq.yml`   | the copy, one file per route                 |
| `src/lib/page-schemas/faq.ts` | that file's Zod shape                        |
| `src/pages/faq.astro`         | the route: reads the entry, keeps the layout |
| `src/lib/editable.ts`         | the attribute helpers every block uses       |

## Why this shape

CloudCannon's Visual Editor resolves each `data-prop` at runtime against **the file
backing the page**. Copy living as `const` objects inside an `.astro` file has no
backing file, so nothing on those pages can be edited. Moving only the copy into a
collection entry gives the editor a real file to write to, while the art-directed
layout, animation, and imported assets stay in code.

## Steps

**1. Extract the copy.** Do this mechanically, not by retyping — 500-line objects are
too easy to corrupt by hand. Evaluate the route's `const` declarations and dump YAML
(see the extractor used for faq.yml; `yaml`'s `stringify` with `lineWidth: 0`).

Extract only what an editor should change. Leave behind anything **derived** — values
computed from collections, JSON-LD builders, sort helpers, `Astro.site` lookups. A
route like `newsroom.astro` is mostly derivation and has a small copy surface.

Every file starts with:

```yaml
_schema: <route> # discriminant + CloudCannon schema key
permalink: /<route>/ # the URL; '/' for the homepage
pageTitle: …
pageDescription: …
```

**2. Add the schema.** Create `src/lib/page-schemas/<route>.ts` exporting
`<route>Page`, spreading `pageBase` and reusing shapes from `shared.ts` where the
route feeds a shared block. Append it to the array in `page-schemas/index.ts`.

Images: use the `image()` helper (`schema: ({ image }) => …`), the pattern
`caseStudies` already uses. Replace `import photo from '…jpg'` with a repo-relative
path string in the YAML.

**3. Rewrite the route.**

```text
const entry = await getEntry('pages', '<route>');
if (!entry || entry.data._schema !== '<route>') {
  throw new Error('Missing or malformed src/content/pages/<route>.yml');
}
const { hero, … } = entry.data;
```

The `_schema` check is what narrows the discriminated union for TypeScript.

**4. Thread `editablePrefix`.** Blocks are shared between converted and unconverted
routes, so editables are **opt-in**. Never emit `data-prop` unconditionally — an
unresolvable path renders a red error card in the editor.

```text
<EditorialMasthead … editablePrefix="hero" />
```

Inside a block, build attributes with the helpers — never hand-write the attributes:

```text
<h2 {...editableText(editablePrefix, 'title')}>{title}</h2>
<p {...editableText(editablePrefix, 'intro', 'text')}>{intro}</p>
<img {...editableImage(editablePrefix, 'src', 'alt')} />
```

`editablePrefix` is `undefined` (emit nothing), `''` (paths relative to the enclosing
array row), or a dotted path. The `undefined` vs `''` distinction cannot be a
truthiness check — see `src/lib/editable.ts`.

**5. Arrays.** Every list needs all three levels, or an editor gets add/remove
controls with no way to edit a row's text:

```text
<ul {...editableArray(editablePrefix, 'items')}>      {/* container */}
  {items.map((it) => (
    <li {...editableItem(editablePrefix)}>            {/* row */}
      <span {...editableText('', 'label')}>{it.label}</span>  {/* field, relative */}
    </li>
  ))}
</ul>
```

The container must hold **only** rows — no headings or "see all" links inside it.

## Two traps that cost real time

**Astro's content-layer cache does not notice a schema change.** Filling in a page
schema does not change the YAML file's digest, so `getEntry` keeps serving the
previously-parsed (stub-stripped) data and the route dies with "Cannot read properties
of undefined". Delete `node_modules/.astro/data-store.json` and rebuild — note the path
is under `node_modules`, not `.astro/data-store.json`, which does not exist in Astro 6.

**YAML 1.1 turns `yes`/`no` cells into booleans.** Comparison tables are full of them.
When dumping YAML, force-quote any scalar matching `y|n|yes|no|on|off|true|false`, and
assert in the round-trip check that they survive as strings.

## Rules that cause red error cards if broken

- **Scope.** A relative `data-prop` binds to its nearest editable _ancestor_, not the
  file. A caption nested inside an `data-editable="image"` region resolves against
  that region's `{src, alt}` value and fails. Keep sibling fields outside.
- **Optional fields.** Guard anything that can be absent: `{x && <p …>{x}</p>}`.
  A region bound to a missing field is an error card.
- **HTML fields.** Never bind a `*Html` field to a text region — it loses the inline
  markup. Leave it sidebar-editable (see `ArticleHeader.astro`).
- **Types.** A region must resolve to a **string**. Numbers, objects, and arrays all
  error.

## Verify

```bash
pnpm check
CLOUDCANNON_BUILD=1 pnpm build && pnpm build:help
pnpm lint:editables
```

`lint:editables` replays CloudCannon's resolver over the built HTML and fails on any
binding that would show an error card. A clean `pnpm build` proves nothing about the
Visual Editor — this is the check that does.

## `_inputs` key names must be unambiguous

CloudCannon matches an `_inputs` key by NAME, at any depth in the file — not by path.
So a name used twice inside one page with different shapes cannot be declared at schema
level without mis-typing one use. Real examples on this site: `about.yml` has `stats` as
both `{value,sup,label,sub}` and `{n,l}`; `home.yml` has it in three shapes;
`districts.yml` has `items` in three. `pnpm lint:editables` fails on this, so you cannot
introduce one by accident. Structure-level `_inputs` are naturally scoped and exempt —
put shape-specific config there.

## Do not touch

`cloudcannon.config.yml` and `src/content.config.ts` are shared across every route and
are merged centrally. Record any `_inputs` / `_structures` a route needs in its
schema module's comments instead.
