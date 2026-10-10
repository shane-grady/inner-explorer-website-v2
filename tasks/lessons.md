# Lessons

Patterns learned while building this repo. Review at session start; add to it after
any correction or surprise.

Sections about code the 2026-10 clean slate removed (the Framer homepage intro, React islands,
the dark-mode and glass-nav hacks, the page and case-study builds, marketing CloudCannon
editing) are in `tasks/archive/lessons-pre-rebuild.md`; general points from them are under
"Carried over from the archived build logs" below.

## Design foundation (2026-10)

- **Simplify a plan before presenting it.** The first foundation plan carried a tokens.json
  plus generator, nine components that were one element with one class, and variants no board
  drew. The user asked for a fresh-eyes pass; an advisor review then removed all of it for
  free. Ask "what is the single source of truth, and what renders markup a class can't?"
  before adding a file.
- **Read the boards, not the systems.** Both design systems disagreed with the FINAL V boards
  on real values (a green-400 "surface", 12px inputs, a 16px accent-bar gap, 13 fonts). Tally
  values across every board with a script first, then read patterns by hand.
- **Tailwind v4 bridge:** reset only `--color-*`, `--font-*`, `--text-*`, `--radius-*`,
  `--shadow-*` (never `--spacing-*`: it deletes `--spacing`); alias colors with `@theme inline`
  so `[data-on-brand]` remaps work; alias same-named families with `@theme inline reference`
  to avoid `--radius-sm: var(--radius-sm)`; write `@utility type-*` with longhands so
  `font-medium` can override; list utility names as literals (the styleguide) or they are not
  emitted.
- **Full-page screenshots don't scroll:** lazy images below the fold never load, so a CTA photo
  rendered empty in `pnpm shots`. Set `img.loading = 'eager'`, then await each `img.decode()`:
  `complete` can read true before a just-promoted image loads (About's Journey and CTA photos
  shot blank that way, 2026-10-10).
- **Compare against the rendered board, not memory (Home, 2026-10-10).** Eyeballing screenshots
  missed real drift (a 30px statement snapped to 28, 16/1.45 checklists drawn at 17/1.6, a
  borderless CTA card, a zoomed photo, a tinted testimonial). Render the board's own HTML in
  Playwright (inline its `<helmet>` CSS, swap `/_blob/` ids for the assets read with the Artifact
  tool, fill the `{{…}}` slots), measure each section's height against the build, and set crops
  side by side. A snap the board can see is drift: add the variant or type step instead.
- **Mobile boards restructure, not just restack (Platform, 2026-10-10).** Desktop's stacked metric
  cards and ruled privacy items become icon-left rows on mobile (one rule for the list), which a
  desktop-first build ran 250–350px long. Measure every section at 390 too before calling a page
  done, and read the mobile board's markup for each section that differs.
- **Board assets:** the Artifact tool reads a `/_blob/<id>` image by its bare 32-hex id with
  `path`, one call per id; `paths` and the `_blob/` prefix both fail.
- **Copy casing stays as drawn.** Sentence-casing the boards' title case read as drift to the
  owner; keep headings and buttons verbatim and raise casing as a question, not a change.
- **axe `link-in-text-block`:** the preflight removes link underlines; running-text links need
  `text-decoration: underline` in `base.css`, with the chrome classes opting out.

## Environment

- **Subagent spawning depends on the environment.** In the 2026-06 Cowork environment,
  Explore/Task agents failed with "Prompt is too long" (the large inherited MCP tool surface
  overflowed the prompt) while Workflow-tool subagents ran (a 10-agent SEO audit, 2026-06-09).
  Parallel subagents worked throughout the 2026-10 rebuild planning. Try one when it helps; if
  the spawn fails, do the research and the work in the main context.
- **`preview_screenshot` desyncs from programmatic scroll on long, reveal-animated
  pages.** Two compounding traps (seen on the pre-rebuild case-study pages): (1) a scroll-reveal
  hides content at `opacity:0` until the IntersectionObserver fires, so jumping to a
  deep section with `scrollTop` captures blank; (2) deep `scrollTop` jumps don't reliably
  reflect in the capture (if `scroll-behavior` is `smooth`, force it to `auto`
  first). Reliable way to screenshot one section: pin it with inline
  `position:fixed;top:0;left:0;right:0;z-index:99999` via a live-DOM `preview_eval`
  mutation (not a file edit) and shoot at scroll 0. Verify structure/styles with
  `preview_eval` (computed styles, `compareDocumentPosition`) rather than trusting the image.
- **Claude Preview quirks** (2026-06 to 2026-09; full write-ups in the archive): the hidden
  preview tab produces no animation frames, so CSS transitions freeze at their start value and
  IntersectionObservers, count-ups and lazy `<Image>`s never fire (to test a reveal, inject
  `transition: none` and toggle the class; natural-scroll screenshots work once
  `*{transition:none!important}` is set). Screenshots can come back blank at non-zero scroll
  on pages with sticky rails or reveals: verify with `preview_eval`, or use a tall viewport at
  scroll 0. The viewport can open at 0×0, or the eval context can detach (`innerWidth 0`,
  `naturalWidth 0` on good images): `preview_resize`, reload, then measure. A reused preview
  server may belong to another worktree, so check `preview_list`'s cwd first.

## Toolchain (pnpm / Node)

- **Clear retired CloudCannon schemas explicitly on provisioned Sites.** Removing a
  collection `schemas` map from source was not enough for a long-lived hosted editing
  session: it still inserted `_schema: default` and a creation-template SEO value into
  an existing Help article. Use `schemas: null` on single-shape collections, keep the
  `_schema` input scoped to collections that genuinely use schemas, and verify a fresh
  hosted no-op edit after every schema migration. Optional snippet arguments must not
  define serializer defaults; pair genuinely optional text/media values with
  `remove_empty: true`. Do not rely on Select `allow_empty` inside an MDX snippet:
  hosted testing proved CloudCannon still hydrates an omitted Select to its first
  option while parsing the full document. Make semantic Select arguments explicit,
  required, and insertion-defaulted in the snippet contract instead.
- **Use `add_options.default_content_file`, not a one-entry `schemas` map, for a
  uniform CloudCannon collection.** Hosted readback showed that `schemas` is an
  ongoing maintenance contract for existing entries, not merely a creation template;
  it can reorder, hide, or remove fields. Keep `_inputs` and `_structures` on the
  collection and reserve `schemas` for genuinely different content shapes. Include
  optional Zod fields in the default content file as well: an absent key is not an
  editor control. Seed an optional object with `null` and normalize that placeholder
  to `undefined` when the runtime must not render an empty section.
- **Pin `create.path` for every creatable CloudCannon collection.** Its default ends
  in `.md`; that silently creates files outside an Astro loader that accepts only
  YAML/JSON, and it prevents MDX snippets on authored collections. Match the extension
  to the loader and include `[count]` so a repeated title cannot overwrite a file.
- **CloudCannon's `.cloudcannon/initial-site-settings.json` only applies when a Site is
  first created.** Adding it to a repository that is already connected does not update
  the live Site's build configuration. For an existing Site, explicitly set the install
  command, build command, output path, and Node version in **Site Settings > Builds >
  Configuration** (or with `cloudcannon sites update-build-config`), then trigger and
  inspect a real CloudCannon build before calling the migration live.
- **pnpm 11 moved build-script approval** out of `package.json`. Put it in
  `pnpm-workspace.yaml` as `allowBuilds: { esbuild: true, sharp: true, '@tailwindcss/oxide': true }`.
  The `package.json` "pnpm" field is ignored (warns).
- `pnpm` and `corepack` were not preinstalled; `npm i -g pnpm` works.
- **netlify-cli resolves the project root past a git worktree** (worktrees have a
  `.git` _file_; the CLI walks up to the main checkout's `.git/` dir), so
  `netlify serve`/`dev` in a `.claude/worktrees/*` worktree silently skips
  `netlify/edge-functions/` — no error, the functions just never load. `--cwd`
  doesn't fix it. To exercise edge functions locally from a worktree, stage a
  minimal copy outside the repo (`netlify.toml` with `command = "true"`, the
  `netlify/` dir, prebuilt `dist/`) and run `netlify serve` there; spoof hosts
  with `curl -H "Host: …"`.
- **Netlify auto-noindexes deploy previews/branch deploys** (`X-Robots-Tag` is
  added by the platform) but NOT the production deploy on the `*.netlify.app`
  subdomain. So a deploy-preview curl can't prove your own noindex logic works —
  verify via the local edge runtime instead. A tell that an edge function ran on
  a response: strong `etag` becomes weak (`W/"…-df"`), `content-length` dropped,
  `vary: Accept-Encoding` added.

## Astro 6 specifics

- **Content config changes require a dev-server restart** — collections won't
  hot-reload; you'll see empty `getCollection()` results until you restart.
- **`z` from `astro:content` AND `astro:schema` is deprecated** in Astro 6. Import
  `z` from `zod` directly, pinned to the SAME version Astro resolves (here 4.4.3) to
  avoid a dual-instance mismatch with the `image()` schema helper.
- Astro components that render a **dynamic `<Tag>`** trip a TS hint "'Props' declared
  but never used." Fix by annotating the destructure: `const { ... }: Props = Astro.props`.
- Tailwind v4 in Astro uses the **`@tailwindcss/vite`** plugin in `vite.plugins`
  (not the deprecated `@astrojs/tailwind` integration).
- **A multi-line `export type X = | {…} | {…}` discriminated union in `.astro`
  frontmatter passes `astro check` but FAILS `astro build`** — esbuild errors
  `Unexpected "|"` (the type-aware checker tolerates it; the build-time transform
  doesn't). `export interface` from frontmatter is fine; a multi-line union is not.
  Fix: put shared union types in a plain `.ts` module and import them
  (`import type { Cover } from './types'`). Prettier reflows a long union into exactly that
  shape (2026-09), so keep unions on one line or in the `.ts` module.
- **Marketing pages no longer ship `<ClientRouter />`** (removed in the 2026-10 clean slate),
  so every navigation is a full page load and component scripts run on every page. **The
  frozen Help Center still does** (`src-help/layouts/HelpBaseLayout.astro`). There, component
  `<script>`s run once and do not re-run after a soft navigation: bind setup on
  `document.addEventListener('astro:page-load', init)`, tear down `window`/`document`
  listeners on `astro:before-swap`, and expect attributes set on `<html>` (such as
  `data-js-ready`) to be replaced on each swap. The original write-up is in the archive.
- **Exporting a component's props type? Keep a `Props` alias.** Astro types `Astro.props`
  from a type or interface literally named `Props`; rename it to `export interface FooProps`
  and `Astro.props` falls back to `Record<string, any>` (`ts(2739)` on the destructure). Use
  `export interface FooProps {…}` plus `type Props = FooProps;` (Platform build, 2026-06).
- **A mid-edit SSR error ("X is not defined") or a deleted component import can wedge the
  Vite dev server**: it keeps serving a stale render, even after a hard reload, while
  `pnpm check` and `build` are clean. Restart the dev server; don't trust the browser after a
  transient SSR error (homepage intro, 2026-06).

## ESLint (flat, v10)

- **Don't double-register a plugin.** `eslint-plugin-astro`'s `jsx-a11y-recommended`
  already registers the `jsx-a11y` plugin; adding `jsxA11y.flatConfigs.recommended`
  (which also registers it) errors "Cannot redefine plugin."
- `no-empty` flags empty `catch {}` even in `is:inline` scripts — add a comment inside.

## Design system

- Clearing Tailwind defaults (`--color-*: initial; --text-*: initial`) is the strongest
  drift lever — off-system utilities simply don't exist. Pair with the drift guard
  (`pnpm lint:drift`) to also block arbitrary values + raw hex.
- **Plain `@theme` resolves `var()` aliases at `:root`.** It emits `--color-card: var(--card)`
  on `:root`, so overriding `--card` on a descendant does not re-resolve the utility. The
  pre-rebuild light-pinned pages hit this under dark mode (archived). It is why the rebuild
  declares its color utilities in `@theme inline`, which puts the `var(--…)` in each utility so
  scoped overrides (`[data-on-brand]`, a later dark theme) work (`rebuild-plan.md` › Next PR: the design foundation).
- **`<audio>` needs a `<track kind="captions">`** for `astro/jsx-a11y/media-has-caption`,
  even for placeholder/silent audio. Always render the track inside the audio element;
  the rule accepts an empty `src` (or omitted attribute). Author components with a
  `captionsSrc?` prop so real captions can drop in unchanged later. Pair audio with a
  minimal WebVTT (`WEBVTT\n`) until real captions exist.
- **Dynamic Astro element via `const Tag = ...`** needs a capitalized variable name
  (Astro treats lowercase as native elements via string literal — capitalized lets you
  switch between `<a>` and `<div>` cleanly). Render with `<Tag href={...}>`; passing
  `href={undefined}` simply omits the attribute. Avoids nested-interactive HTML when
  some rows are links and others are static.
- **Measure a nav row's intrinsic width by summing its children**, not with
  `nav.scrollWidth`, which caps at the container width when the content fits and so
  under-reports. The old glass-pill header's collapse breakpoint came from this (archived);
  the new `SiteHeader` breakpoint is computed from the same measurement.

## Skills (skill-creator)

- **`implement-design-handoff` skill** lives at `.claude/skills/implement-design-handoff/`
  (SKILL.md + `scripts/extract_handoff.sh` + `references/component-system.md`). It
  encodes the reuse-first handoff workflow: map a Claude Design handoff onto SHARED
  components/tokens and extend the system globally, rather than bespoke per-page blocks.
  **Stale:** it describes the pre-rebuild component system and gets rewritten for the rebuild
  (`rebuild-plan.md` › Docs and agent files). `transfer-case-study` is stale too until the
  Case Studies PR; the case-study lessons it points at are in the archive.
- **Trigger-eval recall via `claude -p` under-measures.** Both the full description-
  optimization loop (3 iters) and a hand-tuned pushier description scored 0/9 on
  should-trigger queries while passing 9/9 should-NOT — even for an explicit "here's the
  Claude Design handoff [api URL], build it." That's the documented under-trigger
  tendency amplified in headless one-shots (Claude figures it can just do the task), not
  a wording flaw. Optimize for **precision** (no false triggers) and write a pushy
  description; don't chase the recall number in that harness. Package validation also
  rejects `<`/`>` in the description and caps it at 1024 chars.

## Fonts / images / build deps

- **Sharp must be installed explicitly** for `<Image>` optimization, even though it's in
  `pnpm-workspace.yaml` `allowBuilds`. Build fails `MissingSharp` until `pnpm add sharp`.
- **`pnpm dev --port N` doesn't forward the flag to Astro** — it gets swallowed and the
  server falls through to busy default ports. Use `pnpm dev -- --port N` (the `--`
  separator) or set the port in `astro.config`.
- `woff2_compress` (Homebrew) converts `.otf` faces to small `.woff2` (Inter ~100KB, Libre
  Caslon ~40KB each). `public/fonts/` now serves only the frozen Help Center; the rebuild
  takes the design system's woff2 files into `src/assets/fonts/` (`rebuild-plan.md` › Next PR: the design foundation).

## Carried over from the archived build logs

Short versions of general lessons from sections now in `tasks/archive/lessons-pre-rebuild.md`;
the archive has the full story.

- **CSS:** `sr-only` on a `<table>` does not collapse it (tables refuse to shrink below
  min-content), so wrap the table in a `div.sr-only` (Webb). In a column flex container,
  `flex: 1` overrides a child's explicit `height`; drop the shorthand (Webb). A fixed `ch` cap
  on a flex item needs `min(30ch, 100%)` or `min-width: 0` to survive narrow rows (Goddard).
- **Images:** the preview browser caches the dev `/_image` endpoint for a year, so check a
  swapped image with `fetch(src, {cache: 'no-store'})`, not a reload (Goddard). Astro dedupes
  identical image bytes across source files, so placeholder copies can rename another page's
  emitted asset; it clears once the images differ (Kaiser).
- **Build diffs:** an optional slot expression (`{x && <p/>}`) leaves a whitespace character
  where it renders nothing, so a shared-component change shifts other pages by a space;
  normalize whitespace when diffing builds (Kaiser).
- **MDX:** MDX wraps a component's slotted text in `<p>`, so a component must not wrap
  `<slot/>` in its own `<p>` (Blog Article).
- **Dates:** date-only frontmatter parses as UTC midnight; format it with `timeZone: 'UTC'`,
  and when fixing one formatter, `grep -rn "DateTimeFormat\|toLocaleDateString" src/` and fix
  them all (Blog Article).
- **Animation:** guarantee an animation's end state outside the rAF loop (a `setTimeout`
  snap); throttled rAF can freeze a count-up on a partial value (Blog Article). For a reveal,
  put the transition on the revealed state (`.in`), not the base rule, or content fades out
  on load; a reduced-motion rule that zeroes `transition-duration` must also zero
  `transition-delay` (Scroll-reveal).
- **Verification:** run a regression probe against the broken build too; a probe that can't
  fail proves nothing (Scroll-reveal). Pick button sizes by measuring the designed column, not
  by matching pixel height (Series). Orphan check: after `text-wrap`, scan each block's last
  line with Range rects at 375/768/1440 and pin real hits with U+00A0 (Research).
- **YAML:** a list item containing `: ` parses as a mapping, so quote citation-style strings
  (Research).
- **Sources:** legacy innerexplorer.com pages are authoritative for a school's own data only.
  Check third-party quotes against the primary source and product names against the live
  product, and mine legacy PDFs for content the page dropped. pypdf
  (`PdfReader(...).pages[i].extract_text()`) reads PDFs with CID fonts that regex extractors
  can't (case-study builds; see also `tasks/seo-playbook.md`).

## 2026-06-30 — Help Center (docs hub) build

- **A closed `<details>` can't be force-shown with CSS `display:block` in modern
  Chromium.** It now renders closed content through `::details-content` with
  `content-visibility: hidden`, which skips layout regardless of the child's `display`
  (the child reports a 0×0 box even with `display:block`). So a "collapse on mobile,
  always-open on desktop" sidebar can't rely on a desktop `display` override. Fix:
  ship the `<details open>` in markup (no-JS friendly) and toggle `open` by breakpoint
  in JS (`matchMedia('(max-width:880px)')` → `det.open = !mq.matches`); hide the
  `<summary>` on desktop so it can't be closed. Fingerprint: an element whose
  `getComputedStyle(...).display` is `block` yet `getBoundingClientRect()` is all zeros,
  and which only renders once the details is `open`.
- **Author MDX bodies + a small set of shared doc components beat one big page.** Help
  articles live in a `help` content collection (MDX); the article route passes the doc
  modules via `<Content components={{Callout, Steps, Step, CardGrid, Card, LinkCards,
Accordion, HelpFigure, Button}} />` (same seam as the blog). Reading time reuses
  `lib/reading-time`, the TOC reuses `blog/ArticleToc` (added a `numbered={false}`
  variant for the plain help list), breadcrumbs reuse the `Breadcrumb` primitive. Since the
  2026-10 seal these are frozen copies in `src-help/` (`components/ArticleToc.astro`,
  `components/Breadcrumb.astro`, `lib/reading-time.ts`).
- **Scope a prose body's link styling to `a:not([class])`.** `.prose-help a {…}` would
  otherwise paint border-bottoms under component links (Button pills, LinkCards,
  Accordion answers) that live inside the prose wrapper. `:not([class])` hits only
  markdown links; module links keep their own treatment.
- **CSS counters cross Astro component scopes.** `<Steps>` sets `counter-reset` on its
  `<ol>` and `<Step>` does `counter-increment` + `content: counter(help-step)` in a
  separate scoped `<style>` — the counter name is global, so step numbers stay correct
  without threading an index prop.
- **Content-config changes need a dev restart**, but the build picks them up fine. The
  `/support`→`/faq` move uses Astro `redirects` (dev/preview) + a netlify.toml 301
  (prod, `force = true` to beat the static redirect page Astro also emits for `/support`).
  Today `/faq` and `/support` both 301 to `help.innerexplorer.com/faq/` the same way.

## 2026-07-14 — CloudCannon live verification

- **A successful CloudCannon build is not proof that Visual Editing works.** Registered
  Astro components are rendered again in the browser and can fail on server-only globals.
  Test every collection entry in the actual Visual Editor and scan for both component
  and editable-region error cards before calling a migration complete.
- **Use `Astro.request.url` inside registered components, not `Astro.url`.** CloudCannon's
  Astro client renderer provides the request shim but does not provide `Astro.url`.
- **Do not bind an HTML input to a plain-text editable region.** Keep structured/styled
  HTML editable in the sidebar, and expose a visual text region only when the backing
  value is guaranteed to be a string with matching semantics.

## Verifying that something is centered (2026-08-25)

Measuring an element's own `getBoundingClientRect()` does not tell you whether its
**text** is centered. For a block element the box is the container width, so its centre
matches the page centre even when the glyphs inside overflow and sit visibly off-centre.

On the Contact page an H1 with `white-space: nowrap` overflowed its container by 146px;
the element box centred on 720 (correct) while the rendered text centred on 793 (wrong).
I measured the box, concluded it was fine, and shipped a bug the user then spotted.

Measure the text ink instead:

```js
const r = document.createRange();
r.selectNodeContents(el);
r.getBoundingClientRect(); // the glyphs, not the box
```

Related: `text-align: center` does not centre content wider than its line box. The
browser aligns overflow to the start edge, so over-wide centred text always spills
right in LTR, never symmetrically. Any `nowrap` headline is one copy change away from
this. Prefer wrapping and size the container, rather than pinning `nowrap`.

## 2026-08-25 — CloudCannon: editable regions and config

_(Was "making every page editable". Marketing pages left the CMS in the 2026-10 clean slate;
the bullets that only concerned them are archived. These still apply to the Help Center.)_

- **The red "Failed to render text editable region" card has exactly THREE causes**, all
  in `nodes/editable-text.ts` of `@cloudcannon/editable-regions`: a missing `data-prop`,
  a `data-type` outside `span|text|block`, or a value that is not a string (`undefined`
  is the common one). Because all three are deterministic, they are **statically
  checkable** — you do not need the hosted editor to find them. `scripts/check-editables.mjs`
  replays the package's own resolver (`Editable.setupListeners` →
  `lookupPathAndContext` → `EditableText.validateValue`) over the built HTML and the
  backing content files. Use it instead of clicking through pages.
- **A relative `data-prop` binds to the nearest editable ANCESTOR, not to the file.**
  This is the subtle one. `ArticleHeader.astro` (the pre-rebuild blog header) had the hero
  caption nested inside the `data-editable="image"` div, so `data-prop="heroCaption"`
  resolved against that region's `{src, alt}` value → `undefined` → red card on every
  post with a caption.
  Fix: keep sibling fields OUTSIDE the region. Here `.hero-image` stayed the positioned
  frame and the image region moved to an inner `.hero-image-media` wrapper, so the
  absolutely-positioned caption still anchors to the frame and the layout is unchanged.
- **CloudCannon template strings: data placeholders use `{braces}`, fixed placeholders
  use `[brackets]`.** `url: '{permalink}'` reads a front-matter key; `[slug]` is
  CloudCannon-defined. This is what lets a `pages` collection put the homepage at `/`
  instead of `/index/` — `url: /[slug]/` would give `/index/`.
- **Array inputs use `min_items` / `max_items`, NOT `min` / `max`.** `min`/`max` are
  number-input keys. The configuration skill's warning is accurate — training data
  hallucinates these keys. Download the schema and query it before writing any key:
  `curl -sL https://github.com/cloudcannon/configuration-types/releases/latest/download/cloudcannon-config.latest.schema.json`
  then resolve `$ref`s through `allOf`/`anyOf` to get the real key list. `.gitignore`
  already excludes `.cloudcannon/migration/*.schema.json`.
- **`@cloudcannon/cli validate` catches invalid config keys locally** and is now in CI.
  It needs Node ≥24; it warns but still runs on 22.
- **Adding a dependency wedges the running Vite dev server** with `504 (Outdated
Optimize Dep)` on every module. Restart the dev server after `pnpm add` — the same
  class of wedge as a mid-edit SSR error (see Astro 6 specifics).
- **Astro's content-layer cache ignores schema changes.** Only a content FILE's digest
  invalidates it, so filling in a collection schema leaves `getEntry` serving the old
  parsed shape and the route throws "Cannot read properties of undefined". Delete
  `node_modules/.astro/data-store.json` — NOT `.astro/data-store.json`, which does not
  exist in Astro 6.
- **CloudCannon `_inputs` match by key NAME at any depth, not by path.** A name used
  twice in one file with different shapes therefore cannot be declared without
  mis-typing one use — `about.yml` has `stats` as both `{value,sup,label,sub}` and
  `{n,l}`; `home.yml` has three `stats` shapes; `districts.yml` has three `items`
  shapes. Structure-level `_inputs` are scoped and exempt. `scripts/check-editables.mjs`
  now fails the build on an ambiguous declaration. (Those YAML files were pre-rebuild
  marketing pages; the rule holds for the Help Center config.)
- **YAML 1.1 booleans eat comparison tables.** `yes`/`no`/`on`/`off` cells dump as bare
  scalars and re-parse as booleans, silently destroying a pricing matrix. Force-quote
  them when generating YAML and assert they survive the round trip.
- **Concurrent agents sharing one worktree race on `dist/`.** Parallel `pnpm build` runs
  produce torn output and phantom failures on pages nobody touched. Give agents disjoint
  FILES (that part works well), but treat any build-output check as unreliable while
  others are building — rebuild before believing an error.

## 2026-08-25 — HubSpot embedded forms

- **A HubSpot form embedded with the stock v2 snippet renders inside an `<iframe>`, and
  `css: ''` is what stops it.** The snippet HubSpot's UI hands you (`hbspt.forms.create({
portalId, formId, region })`) produced `<iframe class="hs-form-iframe">` for our form —
  and parent CSS and custom properties cannot cross an iframe boundary, so the form would
  have been permanently unstyleable. Reading the minified embed script, the decision is a
  single predicate whose live term is `css === undefined`; passing ANY string, `''`
  included, renders the form inline in the host document instead, with `.hs-form`,
  `.hs-input`, `.hs_<propertyname>` hooks available and (with `cssRequired: ''` too) zero
  HubSpot stylesheets injected. Verified both ways in a browser before building anything.
  This is not in HubSpot's docs. If the form ever appears unstyled, check that option first.
  The form-level equivalent (`displayOptions.renderRawHtml`) exists but is portal-wide for
  that form, so it would restyle every other embed of it — prefer the per-embed option.
- **Read a form's real field set before planning against it.** The public endpoint
  `https://forms.hsforms.com/embed/v3/form/<portalId>/<formId>/json` returns the whole
  definition — fields, required flags, option lists, theme, `scopes` — with no auth. The
  form we were handed turned out to contain one field (Email) rather than the eight the
  design needed, which changed the shape of the whole task.
- **Before rewriting any HubSpot form, prove it is not the one collecting production
  leads.** Contacts carry `recent_conversion_event_name` / `first_conversion_event_name`,
  which name the form each contact converted on — sorting contacts by
  `recent_conversion_date` shows exactly which forms are live. Ours were HubSpot _captured_
  forms (`"<Page Title>: #contactForm"`), plus Meetings links and a content-download form;
  captured forms cannot be embedded at all, so a new regular form was the only option.
  Scripts that rewrite a form should also refuse to delete fields they did not expect —
  cheap insurance against a wrong form id.
- **`getComputedStyle` read in the same tick as a class mutation returns pre-recalc
  values.** After `el.classList.add('invalid')` plus an `insertAdjacentHTML`, the border
  colour still read as the old token and I briefly reported a styling bug that did not
  exist. Style resolution had simply not run yet. Read computed styles in a _later_ tool
  call (or force a reflow first) before concluding a rule does not apply.
- **`.focus()` does not match `:focus-visible`.** Script focus on a button leaves
  `outline-style: none`, so a focus-ring check done that way always "fails". Drive a real
  Tab keypress and assert `el.matches(':focus-visible')`.
- **`display: contents` is the clean way to own a third-party form's layout.** HubSpot wraps
  rows in `fieldset.form-columns-N`. Flattening those wrappers lets one CSS grid on the
  `<form>` place every field, so the design survives however the fields are grouped on the
  HubSpot side — no per-group special-casing, and regrouping in HubSpot cannot break it.
- **Pseudo-elements do not generate on `<input>`.** HubSpot's submit is
  `<input type="submit">`, so a design with an icon inside the button cannot use
  `.hs-button::after`. Put the icon on the wrapping `.actions` as an absolutely positioned
  masked `::after` with `pointer-events: none`, and pad the input to make room — the input
  stays the only focusable, clickable element.
- **HubSpot's Forms GET does not echo back what you PATCH, so never diff raw JSON to decide
  whether a write is needed.** `PATCH /marketing/v3/forms/{id}` requires `dependentFields`
  on every field and `defaultValues` on every dropdown, but the subsequent GET omits both,
  adds `description: ''` to every enumerated option, and does not preserve key order. A
  `JSON.stringify` comparison therefore ALWAYS reports a difference — the script looked
  idempotent in review and silently re-wrote the form on every run. Compare a canonical
  projection of only the properties you control, in a fixed key order.
- **A private app token is the credential that works, and the near-misses fail in
  distinguishable ways.** Worth knowing when someone hands you the wrong one: a legacy
  `hapikey` (bare UUID) authenticates but 403s with `MISSING_SCOPES`; an OAuth _refresh_
  token (long, base64-ish, starts `Ci`) 401s with `EXPIRED_AUTHENTICATION` and an expiry of
  `1970-01-01`; only a `pat-na1-…` private app token works as a Bearer. Also validate the
  token is ASCII before calling fetch — a placeholder run literally fails deep inside undici
  with "Cannot convert argument to a ByteString", which names nothing useful.
- **Do not put a placeholder in a fenced shell command.** The terminal renders a Run button
  on `bash` blocks, so `TOKEN=… node script.mjs` gets executed verbatim, ellipsis included.
  Put the secret in a separate `export` line with an ASCII placeholder, and keep the
  runnable fence free of anything that must be substituted.
- **HubSpot form validation rejects reserved domains**, so `…@example.com` fails a test
  submission with "Please enter a valid email address" before anything reaches the CRM. Use a
  real domain with an obviously-test local part (`contact-form-test-<date>@yourdomain.com`).
  Silver lining: the rejection is a free check of the live error styling.
- **A HubSpot embedded form is React-controlled, so `el.value = x` does not register.**
  Assign through the native property setter
  (`Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(el, v)`)
  then dispatch `input` and `change` with `bubbles: true`. Separately, the FIRST field set
  right after the form renders can be wiped by a re-render — fill everything, then read the
  values back and re-set any that came back empty before submitting.
- **HubSpot names a conversion `"<page title>: <form name>"`.** The page title is prepended,
  so a descriptive form name produces a very long event name in reporting. Keep form names
  short.

## Git and content hygiene (2026-08)

- **Never run a formatter AFTER `git add` and then `git commit` without re-staging.**
  `git commit` writes the INDEX, not the working tree, so a `prettier --write` run
  between staging and committing is silently discarded — the working tree looks clean,
  `pnpm check` passes locally, and CI fails on the version you actually committed. This
  cost a red `format:check` on main. Either format before staging, or `git add -A` again
  right before committing. Verify with `git diff <sha> -- <file>`, which shows the gap;
  `git status` alone is easy to skim past.

- **Never write or edit legal copy. Move it verbatim.** Asked to turn the Help Center
  privacy policy into its own page and make it "a standard privacy policy page that
  would pass all inspection," I read "pass inspection" as a licence to fill gaps and
  added four sections (request handling, extra state-law rights, international
  transfers, Do Not Track) plus moved the effective date out of the body table into
  frontmatter. All of it had to come back out. A privacy policy is a legal instrument
  that has been reviewed and, in this case, is referenced by signed district DPAs; new
  commitments in it are a legal change, not a copy improvement, and I cannot know what
  counsel already decided to leave out. "Pass inspection" means the PAGE is sound
  (canonical URL, valid structured data, reachable from the footer, accessible,
  editable), not that the DOCUMENT is rewritten. Treat policy text as read-only:
  transfer it byte for byte, verify with a body-only diff
  (`git show HEAD:<file> | awk 'f{print} /^---$/{c++; if(c==2) f=1}'` against the same
  on the working copy), and put any suggested additions in the summary as a question
  instead of in the file. This generalizes past legal text: any reviewed, quoted, or
  signed-off content (research claims, testimonial quotes, district-approved copy) is
  content to move, not to improve.
- **When Juliana hands over an article to publish, DO NOT TOUCH THE COPY.** Corrected
  2026-08-27, after I transferred a LinkedIn piece into the blog and rewrote the headline, all five
  H2s, a grammatically broken McIlroy sentence, and the outcomes sentence (folding its
  figures into a `<StatRow>`). All of it had to come back out. Her rule: "If you have to
  adjust some things to fit the design, fine, but do not change my copy."
  - **Copy** = headline, subhead, every H2, every sentence, quotes, attributions, and
    the typos and fragments in them. Not mine to improve, even when a sentence is
    ungrammatical, even when an SEO skill says to keep headings keyword-led, and even
    when a claim is time-relative ("this year and last") on an evergreen page. Verifying
    that a fact is TRUE is not a licence to restate it — flag it in the summary instead
    and let her decide.
  - **Design adjustment** = the wrapper: which component holds the words (`PullQuote`
    carrying her quote + attribution), where a link points, frontmatter/SEO fields,
    taxonomy, and stripping the source platform's markup artifacts (LinkedIn @mention
    residue: `"Jack Sullivan ,"` → `"Jack Sullivan,"`, `"Inner Explorer 's"` → `"Inner
Explorer's"`).
  - **Do not invent new prose under her byline either.** A Quick Read summary and an
    FAQ are template features here, but the words in them would be mine, published as
    hers. Offer them; don't add them unasked.
  - **Verify verbatim mechanically, not by eye.** Save the source to the scratchpad and
    diff normalized word lists with `difflib.SequenceMatcher`, stripping markdown links
    and JSX tags. It caught all four remaining deltas in seconds and proves the claim;
    re-reading my own draft is how I missed them in the first place.

## 2026-09-03 — Group CloudCannon test confirmations once

- When a reversible CloudCannon acceptance test needs several related external actions,
  prepare the whole isolated sequence first and request one precise confirmation covering
  its save, verification, and cleanup. Once the user confirms that bounded sequence, finish
  it without asking again at each intermediate step. Repeated permission prompts after the
  user has already said to proceed create needless friction and obscure the actual test.

## 2026-09-22 — Claude Design canvases: preview the way the canvas renders

- **The Design canvas runtime drops `<colgroup>`/`<col>` widths.** A `table-layout: fixed`
  table that relies on `<col style="width">` renders as equal columns in the canvas, while a
  plain headless-Chrome preview honours the colgroup and looks correct. I shipped a sticky
  header whose rows (a separate table with no header row) drifted off-centre because of
  this, and my "verification" missed it. Put explicit widths on the cells themselves
  (header cells AND every body cell of any table that has no header row), and make local
  previews strip `<colgroup>` so they fail the same way the canvas does.
- **Verify alignment by measurement, not by eye.** After rendering, dump each row's cell
  `getBoundingClientRect().left` values and assert every table on the board shares one
  column layout. A screenshot at thumbnail scale hides 2px overflows and off-centre columns.
- **Mobile CTAs belong at the bottom.** For a long comparison table on mobile, the persistent
  recommended-plan CTA is a bar that slides up from the bottom of the viewport while the
  table is on screen, not an extra row in the sticky top header.
- **Porting a site component into the design-system bundle: add `box-sizing: border-box`.**
  The site gets it from Tailwind's preflight; the DS preview frame does not. Without it,
  percentage cell widths plus padding overflow and `table-layout: fixed` rescales every
  column, so the table and its sticky header drift apart. Scope it to the component root
  (`.ie-cmp, .ie-cmp *`). Also: `calc()` percentage widths on table cells are ignored, so pass
  plain percentages.

## 2026-10-09 — Sealing the Help Center (rebuild PR A1)

- **Tailwind v4 scans the whole repo by default** (`@import 'tailwindcss'` with no
  `source()`): a Markdown file in `tasks/` that mentions "isolate" adds `.isolate` to BOTH
  sites' CSS. A site that must not change gets `source(none)` plus `@source` for its own
  markup only. Tailwind then emits only the theme variables its scan sees used, so after
  scoping, confirm every `var(--x)` (without a fallback) in the build is still defined.
- **A dynamic `import()` in a layout ships the imported module's CSS as a render-blocking
  `<link>` on every page.** The old BaseLayout's editor-only import of the CloudCannon
  component registry put a 150KB stylesheet of marketing component CSS on all 16 help
  pages. Gate heavy editor-only code by build, not just at runtime.
- **Prove "nothing changed" with a normalized build diff, not screenshots.**
  `scripts/compare-builds.mjs` strips hashes and Astro scope ids so `diff -ru` shows only
  real changes; number scope ids from the HTML first, or a CSS-only change renumbers every
  page. Full-page screenshots of the SAME build differ run to run (sub-threshold
  antialiasing), so a byte compare is useless; count pixels over a threshold, and compare
  against a baseline-vs-baseline noise run.
- **Random ids differ every build** (`randomUUID()` newsletter field ids, SVG gradient ids,
  island `uid`s). Expect them in any marketing diff; they are not changes.

- **A remap reaches everything inside it (Research, 2026-10-10).** The mobile menu `<dialog>`
  lives inside the header, so the dark header's `[data-on-brand]` turned its ink white on a white
  dialog. Anything with its own light ground inside a green region needs `data-on-surface`.
- **Check the raw board before trusting a summary of it (Research, 2026-10-10).** A condensed
  outline that kept only some style properties dropped `border-top`, and a review built on it said
  the study cards had no rule; the raw HTML and the render both draw one. Measure or read the
  source markup before changing a shared component on a claim.
- **Board `fr` splits are not flex ratios (Why, 2026-10-10).** `flex: 5` / `flex: 7` on padded
  boxes counts the padding before sharing the space, so a 5fr/7fr split drawn with 40px padding
  came out 12px wide on one side, and a 12-column grid with a 96px gap overflowed at 1024. Use
  fractional bases (`lg:basis-5/12` with the default shrink): the gap comes off both sides in
  proportion, exactly as `fr` does. Measuring every text element's box against the board, not
  only section heights, is what found it (and a flattened shadow the board clearly draws).
