# Visual editing — section census

Updated 2026-08-25. Supersedes the 2026-07-14 census, which predated the Help Center
subdomain split and described `src/pages/help/*` routes that no longer exist.

Coverage is verified mechanically, not by inspection: `pnpm lint:editables`
(`scripts/check-editables.mjs`) replays CloudCannon's own resolver over the built HTML
and fails on any `data-prop` that would render an error card in the Visual Editor.

**Current state — 8,353 regions across 90 pages, all resolving.**

## Coverage by surface

| Surface           | Pages | Regions | Backing source                       | Treatment                             |
| ----------------- | ----: | ------: | ------------------------------------ | ------------------------------------- |
| `/case-studies/*` |     9 |   2,270 | `caseStudies` collection             | text · image · array                  |
| `/narrators/*`    |    31 |   2,187 | `narrators` collection               | text · image · array                  |
| `/series/*`       |     4 |     796 | `series` collection                  | text · image · array                  |
| `/districts/`     |     1 |     492 | `pages/districts.yml`                | text · image · array                  |
| `/faq/`           |     1 |     412 | `pages/faq.yml`                      | text · array                          |
| `/blog/*`         |     5 |     354 | `blog` collection                    | text · image · `@content`             |
| `/about/`         |     1 |     350 | `pages/about.yml`                    | text · image · array                  |
| `/platform/`      |     1 |     270 | `pages/platform.yml`                 | text · array                          |
| `/` (home)        |     1 |     261 | `pages/home.yml`                     | text · image · array                  |
| `/research/`      |     1 |     202 | `pages/research.yml`                 | text · array                          |
| `/help/*`         |    15 |     187 | `help` collection + `@data[help-ui]` | text · `@content`                     |
| `/pricing/`       |     1 |     157 | `pages/pricing.yml`                  | text · array                          |
| `/contact/`       |     1 |      79 | `pages/contact.yml`                  | text · array                          |
| `/newsroom/`      |     1 |      75 | `pages/newsroom.yml`                 | text                                  |
| Header / footer   |   all | 34/page | `@data[navigation]`, `@data[footer]` | registered components                 |
| `/styleguide/`    |     1 |      66 | —                                    | chrome only; out of scope by decision |
| `/404`            |     1 |       0 | —                                    | out of scope by decision              |

## What is deliberately not editable

These are exceptions with technical reasons, not gaps.

| Kind                                                                                                | Why                                                                                                                                                  |
| --------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `*Html` fields (`titleHtml`, `headingHtml`, `quoteHtml`, …)                                         | Carry inline markup rendered via `set:html`. A plain-text region strips it. Sidebar-editable.                                                        |
| Numbers (`stats[].value` where numeric, chart data, `durationSec`, `practiceCount`)                 | A text region must resolve to a **string**; a number renders an error card.                                                                          |
| Token enums (`tone`, `icon`, `variant`, `kind`)                                                     | Vocabularies the templates switch on, constrained by `_select_data` / structures.                                                                    |
| Per-word / per-line span copy (`whyNow.manifesto`, `research.hero.lines`, About's timeline reveals) | Pre-split into spans that carry scroll-reveal windows; a region would flatten them.                                                                  |
| Script-rewritten nodes (count-ups, the LiveNow caption rotator)                                     | A script rewrites the text node; a region fights it. On `/districts/` the count-ups were given their own `[data-count]` host so they _are_ editable. |
| Derived values (newsroom stories, JSON-LD, sibling-entry grids, computed counts)                    | Sourced from collections; making them editable would let them drift from the truth.                                                                  |
| `aria-hidden` product mockups (`/platform/`)                                                        | Illustrations. Making "41,540 min" editable would imply it is a real figure.                                                                         |
| Help group labels                                                                                   | The nav model in `src/lib/help.ts`, mirrored by `_select_data.help_groups`.                                                                          |

## Architecture

Marketing routes keep their art-directed layout, animation and imported assets in
`.astro`; only their copy moved into `src/content/pages/<route>.yml`, validated by a
per-route module under `src/lib/page-schemas/` and discriminated on `_schema`.
CloudCannon maps each entry to its URL with `url: '{permalink}'` — a data placeholder in
braces, which is what lets the homepage resolve to `/` rather than `/index/`.

Blocks are shared between converted and unconverted routes, so editables are **opt-in**
via an `editablePrefix` prop threaded from the page; see `src/lib/editable.ts`. The full
procedure is in [page-conversion-recipe.md](page-conversion-recipe.md).

## Guardrails

- `pnpm lint:editables` — resolves every binding against its backing file; also fails if
  an `_inputs` key name is ambiguous within one file (CloudCannon matches by name at any
  depth, so `stats` in `about.yml`/`home.yml` and `items` in `districts.yml` cannot be
  declared).
- `npx @cloudcannon/cli validate` — catches invalid config keys and icon names.
- Both run in CI after `pnpm build:all`.

## Known follow-ups

- `_structures` are not yet defined for the `pages` collection's arrays. Regions and
  sidebar editing work; "add item" creates a blank row rather than a shaped one. Each
  schema module's header comment records the structure its route would want.
- Four pages carry regions but are not collection entries, so they cannot be _opened_ in
  the Visual Editor: `/help/` and `/styleguide/` in `dist`, and `/` and `/404` in
  `dist-help`. The Help Center home's copy is still editable — via `@data[help-ui]` in
  the Data editor — because its regions use absolute dataset paths.
