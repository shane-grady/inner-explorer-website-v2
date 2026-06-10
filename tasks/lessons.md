# Lessons

Patterns learned while building this repo. Review at session start; add to it after
any correction or surprise.

## Environment

- **Subagent spawning is environment-dependent — it failed again 2026-06.** A trivial
  Explore agent returned "Prompt is too long" (the large inherited MCP tool surface
  overflows the prompt) while building the Platform page. It reportedly worked in
  2026-05. Treat it as flaky: try a subagent if useful, but be ready to **do research +
  work in the main context** when the spawn fails — that's the reliable path here.

## Toolchain (pnpm / Node)

- **pnpm 11 moved build-script approval** out of `package.json`. Put it in
  `pnpm-workspace.yaml` as `allowBuilds: { esbuild: true, sharp: true, '@tailwindcss/oxide': true }`.
  The `package.json` "pnpm" field is ignored (warns).
- `pnpm` and `corepack` were not preinstalled; `npm i -g pnpm` works.

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
  (`import type { Cover } from './types'`). See `blocks/newsroom/types.ts`.

## ESLint (flat, v10)

- **Don't double-register a plugin.** `eslint-plugin-astro`'s `jsx-a11y-recommended`
  already registers the `jsx-a11y` plugin; adding `jsxA11y.flatConfigs.recommended`
  (which also registers it) errors "Cannot redefine plugin." For React files, add
  only the RULES (`rules: jsxA11y.flatConfigs.recommended.rules`), scoped to `**/*.{jsx,tsx}`.
- `no-empty` flags empty `catch {}` even in `is:inline` scripts — add a comment inside.

## React islands

- **`.tsx` requires camelCase SVG attrs** (`strokeWidth`, not `stroke-width`) — `.astro`
  uses HTML-style kebab-case. Mixing them up is a type error in React.
- **Don't ship React for trivial interactions.** A theme toggle built as a React
  island pulled the ~184KB React runtime onto EVERY page (it lived in the Header).
  Rebuilt as a vanilla Astro component (icon swap via the `dark:` variant) → marketing
  pages dropped to ~4KB JS. After adding any island, verify per-page JS:
  `grep -o '/_astro/[^"]*\.js' dist/<page>/index.html`.

## Design system

- Clearing Tailwind defaults (`--color-*: initial; --text-*: initial`) is the strongest
  drift lever — off-system utilities simply don't exist. Pair with the drift guard
  (`pnpm lint:drift`) to also block arbitrary values + raw hex.
- **The drift guard scans `<style>` blocks too** (it's a regex over whole `.astro/.tsx`
  files), but it only flags raw hex, `rgb()/hsl()/hsla()/oklch()/oklab(`, and
  `utility-[arbitrary]`. Plain CSS dimensions (px/vw/%/clamp/grid templates) and
  `var(--token)` PASS. `.css` files aren't scanned. So bespoke editorial layout belongs
  in component-scoped `<style>` that references colors via `var(--color-*)`/`var(--brand-*)`
  and expresses geometry as plain CSS. `color-mix(in oklab, …)` is allowed (the regex
  needs `oklab(` with a paren; the colorspace keyword has a comma after it).
- **`@theme` token indirection + subtree theme override = footgun.** `@theme` emits
  `--color-card: var(--card)` on `:root`, so the indirection is _computed at the root_
  and inherited. Overriding only `--card` on a descendant (e.g. an `.appearance-light`
  wrapper to pin a page light under `.dark`) does NOT re-resolve `--color-card` — you get
  the root's value. Dark mode works site-wide only because `.dark` lives on the same
  element (`html`) where `--color-*` is declared. Fix: re-declare the `--color-*` set on
  the overriding selector so they re-substitute in that scope. See `.appearance-light`.
- **`.appearance-light` must paint its own `background-color` too.** Re-declaring the
  `--color-*` tokens for the subtree only retunes utilities used by descendants — but the
  `body { background-color: var(--color-background) }` rule lives on `<body>`, which is
  outside the `.appearance-light` wrapper. So under global dark mode, the body bg
  resolves to dark and bleeds through any gap between contained blocks on the light page.
  About hides this because its hero is `100vh` and subsequent sections fill their bg
  (`var(--color-card)` / `var(--color-background)` — which inside the wrapper resolves to
  light). Detail pages with contained, in-column blocks reveal the gap. Fix:
  `.appearance-light` itself sets `background-color: var(--color-background); color:
var(--color-foreground)` so the wrapper paints its surface in the pinned tones.
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

- **Scroll-reveal must NOT cover above-the-fold / LCP content.** A page-level reveal
  (opacity:0 → fade-in on intersect, gated by `html[data-js-ready]`) is great for below-fold
  sections, but if the hero opts in too, the LCP element starts hidden and fades on first
  paint (visible jank; caught faded in preview). The Claude Design prototypes do this right —
  `render.js` explicitly hides ONLY items below `vh * 0.88`. Mirror that: don't put the
  reveal hook (`data-cs-reveal`) on the hero; let it paint immediately. Below-fold blocks
  reveal on scroll via `lib/intersect.ts` (`observe()`), which is already reduced-motion- and
  no-JS-safe.
- **Glass pill nav item count drives the burger breakpoint.** The floating `Header` nav is a
  single content-sized row (brand + links + sign-in + demo). Each top-level link adds ~80-90px;
  by the time the nav reached 8 items (after `/platform` + `/case-studies` both landed) the
  intrinsic row was ~1209px (fits a ~1243px viewport), so it overflowed the pill anywhere below
  that — the old 920px (and an interim 1100px) breakpoint left a broken band. Set the collapse
  point to `@media (max-width: 1260px)` so the full row only shows when it actually fits (1280px+)
  and the mobile menu carries the links below. **Measuring gotcha:** `nav.scrollWidth` caps at
  the container width when content fits, so it under-reports — measure the intrinsic width by
  summing the children (`padding + brand + gap + links + gap + right`) instead.

## Skills (skill-creator)

- **`implement-design-handoff` skill** lives at `.claude/skills/implement-design-handoff/`
  (SKILL.md + `scripts/extract_handoff.sh` + `references/component-system.md`). It
  encodes the reuse-first handoff workflow: map a Claude Design handoff onto SHARED
  components/tokens and extend the system globally, rather than bespoke per-page blocks.
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
- `woff2_compress` (Homebrew) converts the brand `.otf` faces to small `.woff2`
  (Inter ~100KB, Libre Caslon ~40KB each). Self-host from `public/fonts/` with
  `font-display: swap`. The hero's Inter weight-200 isn't shipped → falls back to 300.

## Astro / handoff build patterns (Platform page, 2026-06)

- **Exporting a block's props type? Keep a `Props` alias.** Astro types `Astro.props`
  from a type/interface literally named `Props`. Renaming it to `export interface FooProps`
  makes `Astro.props` fall back to `Record<string, any>` → `ts(2739) missing properties`
  on the destructure. Fix: `export interface FooProps {…}` **plus** `type Props = FooProps;`
  then `const {…}: Props = Astro.props`. The page imports `FooProps` and annotates its
  structured-data const so union fields (discriminated covers, `'+'|'−'`, theme names)
  contextually resolve — no `as const` sprinkles. (`import type { X } from './Foo.astro'`
  works; the repo already does it, e.g. `BarDatum`/`Study`.)
- **Third-party brand logos with exact hex → put SVG data in a `.ts` module + `set:html`.**
  The drift guard scans `.astro/.tsx/.jsx` (incl. `<style>` AND markup attrs) for raw hex,
  so `fill="#436CF6"` in an `.astro` fails it. Vendor colors aren't ours to tokenize;
  keep the logo SVG strings in a `.ts` (data files aren't scanned) and render via
  `set:html`. Same trick used for the practice-theme mesh gradients (raw stops live in
  `global.css`, also unscanned).
- **An icon component in a `Button` slot renders unsized.** Components that rely on a
  parent `:global(svg){width…}` rule break when slotted into another component — scoped
  styles don't cross the boundary. Give the icon an explicit intrinsic `size` prop
  (sets `width`/`height` attrs) for those cases; CSS still overrides where present.
- **A fixed-height "showcase panel" with absolutely-positioned swappable views needs a
  dedicated mobile layout per view — don't just clip.** The Platform hero packs three
  desktop-proportioned mockups (practice arc, dashboard bento, TuneIn sync) into one
  `overflow:hidden` panel. On phones the first cut at "just let the panel clip it" left
  the dashboard cut off mid-word and the arc showing only one card. Fix per view at
  ≤880/≤600: grow the panel height, give the arc a `translateX`-based "primary + two
  even peeks" layout, rebuild the dashboard as a compact card stack (hide the densest
  cards), and stack the TuneIn sync vertically so its story survives. Measure fit with
  `getBoundingClientRect()` (`el.bottom - panel.bottom`) rather than eyeballing — that's
  how the phone-clip + 5th-row-clip were dialed in exactly.
- **Claude Preview screenshots come back blank/stale at non-zero scroll** in this env (hit-test
  - computed styles confirm the content is there and styled — it's a capture quirk). For
    below-the-fold verification, drive interactions with `preview_click` and read state /
    computed styles with `preview_eval` + `preview_snapshot` instead of screenshotting.
    Top-anchored screenshots (scrollY≈0) capture fine.

## 2026-06-09 — Webb School case study build

- `sr-only` on a `<table>` does NOT collapse it: tables refuse width below
  min-content, leaving an invisible page-wide overflow on mobile. Wrap tables in
  a `div.sr-only` instead.
- In a column flex container, `flex: 1` (basis 0) overrides an explicit `height`
  on the child for main-axis sizing — the child collapses to min-content if the
  container is auto-height. Drop the `flex` shorthand when the child has a fixed
  height.
- The preview screenshot tool intermittently captures `data-cs-reveal` content
  as hidden (IntersectionObserver doesn't fire in its capture context). Verify
  via DOM eval (classList/computed opacity), not pixels, for reveal-gated UI.
- Workflow-tool subagents DO spawn successfully in this Cowork env now
  (10-agent SEO audit ran 2026-06-09) — the prompt-overflow note may be stale
  for Workflow specifically; Task/Explore agents still unverified.

## 2026-06-09 — Dwight Morrow case study build

- **Don't append rows to a prompts CSV while `submit_queue.sh` is mid-run.** The
  inner-explorer-covers submit script indexes result files by CSV row position at
  write time, so a mid-run append shifted the last results: two result JSONs were
  never written (timing.tsv still said ok) and a later 2-prompt run saved under
  wrong numbers. Recovery that works: `higgsfield generate list --json` and match
  jobs by prompt prefix, then download `result_url` directly. Always byte-compare
  (md5) before trusting a recovered mapping.
- **GPT Image 2 inserts real brand logos and real org names unprompted** (Nike
  swoosh, North Face logo, "Key Club" on a whiteboard). For marketing imagery,
  bake "plain unbranded clothing/bags, no visible logos" and "clean whiteboard
  with no writing" into prompts up front — regens cost ~7 credits each; reviewing
  for trademarks is part of the per-image review pass.
- **The preview eval context can detach from the rendering surface**: eval reports
  `clientWidth 0` / images `naturalWidth 0` while a screenshot of the same server
  renders perfectly. A `preview_resize` (any preset) reattaches it; after that,
  overflow/geometry readings are trustworthy. Don't conclude "broken images" from
  a 0-width eval context — fetch the image URL and check the bytes.
- **Legacy case-study PDFs hide content the web page dropped** (again): the
  Dwight Morrow PDF held a real anonymous student-leader quote + the two research
  citations — which meant NO student quotes needed inventing (better E-E-A-T than
  Webb's gated placeholders). Always mine the PDF before deciding fidelity gaps.
- **Parallel case-study sessions collide on shared integration points** (newsroom
  story id/date, case-study `order:`, launch.json ports, this file). When another
  story merges first, expect conflicts exactly there; renumber your `order`/story
  id after theirs and keep both lesson sections — content files never conflict.

## 2026-06-09 — Goddard Middle School case study transfer (skill eval run)

- **Legacy PDFs with Type0/CIDFontType2 fonts defeat the bundled regex extractor**
  (`extract_pdf_text.py` returns empty — Tj/TJ strings are binary glyph indices,
  not ASCII). Fix: `pip3 install --user pypdf`, then `PdfReader(...).pages[i]
.extract_text()` — pypdf follows ToUnicode CMaps and recovers full text. To
  RENDER such PDFs page-by-page without poppler: split to single-page PDFs with
  pypdf, then `sips -s format png -Z 1400 pg1.pdf` (sips converts only a PDF's
  first page — splitting first is the workaround).
- **`.next-stat` in CaseStudyExplore had a fixed `max-width: 30ch` + `flex: none`**
  — it can't shrink, so EVERY case-study page overflowed horizontally at ≤345px
  viewports (pre-existing on main; both existing stories' stat labels exceed
  30ch). Fix: `max-width: min(30ch, 100%)`. Lesson: a fixed `ch` cap on a flex
  item needs a `100%` guard or `min-width: 0` to survive narrow wrapped rows.
- **Cross-worktree preview-server collision:** `preview_start` found port 4427
  already serving a _different_ worktree (the prior session's). Always check
  `preview_list` cwd matches the current worktree before trusting a "reused"
  server — stop the stale one and restart, or pages show the wrong branch.
- **Overwritten source images keep showing old pixels in the dev preview** — the
  dev `/_image` endpoint sends `Cache-Control: public, max-age=31536000`, so the
  preview browser caches transforms for a year and a server restart (or even
  clearing `node_modules/.astro`) changes nothing the browser will re-request.
  Verify swapped imagery with `fetch(src, {cache:'no-store'})` (compare bytes /
  blit blob URLs into the `img`s), not with reloads or screenshots.

## 2026-06-10 — John Marshall HS case study build

- **GPT Image 2 invents school names on banners/pennants.** Two of 11 school-scene
  generations carried legible wrong-school lettering ("DUNBAR" pennant, "WESTLAKE
  HIGH WELLNESS CLUB" banner) that would assert a different school's identity on a
  named-school case-study page. Catch it in the per-image vision review; fix by
  regenerating with explicit "plain solid-color pennants with no lettering / no
  school names or mascot text anywhere". On-image text it's ASKED to render (SAY HEY
  DAY, YOU HAVE A FRIEND, agendas, correct algebra on whiteboards) comes out
  correctly spelled — the risk is specifically the unrequested ambient signage.
- **Higgsfield result JSONs put the image URL in `result_url`** (not `url`/
  `image_url`). And the system Python (3.13 framework build) lacks SSL root certs —
  `urllib` fails on every https download; extract URLs with Python, download with
  curl.
- **Fact-check legacy stats against their actual instruments before citing.** Three
  upstream-paraphrase traps in one legacy page: "CASEL-approved" (actual current
  designation: "Designated SEL-Supportive Program"), "70% of teens report
  depression and anxiety are major problems in their lives" (Pew's instrument is
  "among people their age"), and a companion "only 35% know how to cope" with NO
  locatable canonical source (don't cite Pew for it). Also de-presentize legacy
  scale claims ("now serves all 1,100 LAUSD schools" — NCES counts 784 LAUSD
  schools in 2024–25; anchor as "roughly 1,100 at the time").
- **Cross-scope verifier conflicts are real and need a main-context referee.** Two
  Workflow verify agents disagreed on the same surfaces (add quote-wrapping fields
  vs. reject as duplicate-quote filler; assert "2021" vs. year-unverifiable).
  Resolution principle that worked: prefer the verdict grounded in a re-verified
  source/QRG rule over the one grounded in a tactic's average effect.
- **Parallel case-study worktrees collide on shared counters.** Goddard (PR #16)
  and John Marshall (PR #19) were built simultaneously in separate worktrees; both
  took `order: 3` in their YAML and story id 18 in newsroom.astro. Git only
  conflicts on newsroom.astro — the duplicate `order:` is silent and scrambles the
  next-card chain. After any merge of a parallel story, re-check `grep "^order:"
src/content/case-studies/*.yaml` for duplicates and renumber.

## 2026-06-10 — Parallel case-study sessions collide on shared slots

- Three sessions transferred stories simultaneously and ALL claimed `order: 3`/
  newsroom `id: 18`. Before picking a YAML `order` or newsroom card id, check
  `origin/main` AND open PRs (`gh pr list`) for claims; expect a merge race
  anyway and re-fetch right before pushing. Resolution pattern: keep both cards
  with unique ids, re-sequence `order` by merge arrival, keep every session's
  lessons/launch.json entries.

## 2026-06-09 — Kaiser Elementary case study build

- **Verify third-party quotes against the PRIMARY source, not the legacy site.**
  The legacy innerexplorer.com/case-study1 page misquoted its own press coverage
  (The Nation): added "intense" inside quotation marks, truncated, and
  mis-attributed to the principal alone. A workflow verifier caught it by reading
  the live article. Legacy pages are authoritative for the school's own data only.
- **inner-explorer-covers `submit_queue.sh` has a printf octal bug**: prompt
  numbers `008`/`009` fail `printf %03d` (invalid octal) and get mangled to `000`,
  cross-wiring result JSONs. Number prompts to avoid 008/009 (e.g. 001–007, then
  101+), and treat `timing.tsv` as the authoritative success record, not stdout.
  Also: instant `rate_limit_reached` on first submit means OTHER jobs hold account
  slots — resubmit in waves of ≤4, not 7.
- **The Claude Preview browser can open with a 0×0 viewport** — `innerWidth 0`,
  bogus `scrollWidth`, and `naturalWidth: 0` on perfectly served images (false
  "broken image" readings). `preview_resize` to explicit dimensions, reload, THEN
  trust layout/image metrics. Confirm a suspect image via
  `fetch(src, {cache:'no-store'})` status/bytes, not element state.
- **Astro dedupes identical image bytes across source files**: copying webb-school
  photos as kaiser placeholders renamed WEBB's emitted `/_astro/` asset URLs to
  the kaiser filenames (alphabetical winner), tripping the byte-diff gate on a
  page that wasn't edited. Transient — it resolves when real (unique) imagery
  replaces the placeholders; don't chase it as a bug.
- **An optional Astro slot expression (`{x && <p/>}`) leaves one whitespace char**
  in pages where it renders nothing — a deliberate shared-component change
  therefore shifts other pages' HTML by a space + the CSS bundle hash. Compare
  baselines with asset-hash + whitespace normalization.
