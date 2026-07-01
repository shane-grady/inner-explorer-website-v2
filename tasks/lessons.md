# Lessons

Patterns learned while building this repo. Review at session start; add to it after
any correction or surprise.

## Environment

- **Subagent spawning is environment-dependent — it failed again 2026-06.** A trivial
  Explore agent returned "Prompt is too long" (the large inherited MCP tool surface
  overflows the prompt) while building the Platform page. It reportedly worked in
  2026-05. Treat it as flaky: try a subagent if useful, but be ready to **do research +
  work in the main context** when the spawn fails — that's the reliable path here.
- **`preview_screenshot` desyncs from programmatic scroll on long, reveal-animated
  pages.** Two compounding traps on `.cs` case-study pages: (1) the scroll-reveal hides
  `[data-cs-reveal]` at `opacity:0` until the IntersectionObserver fires, so jumping to a
  deep section with `scrollTop` captures blank; (2) deep `scrollTop` jumps don't reliably
  reflect in the capture (global `scroll-behavior` is `smooth`, so force it to `auto`
  first). Reliable way to screenshot one section: pin it with inline
  `position:fixed;top:0;left:0;right:0;z-index:99999` via a live-DOM `preview_eval`
  mutation (not a file edit) and shoot at scroll 0. Verify structure/styles with
  `preview_eval` (computed styles, `compareDocumentPosition`) rather than trusting the image.

## Toolchain (pnpm / Node)

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
  (`import type { Cover } from './types'`). See `blocks/newsroom/types.ts`.
- **`BaseLayout` ships `<ClientRouter />` (view transitions), so component `<script>`
  tags run ONCE and do NOT re-execute on client-side navigation.** Any page-specific
  script that wires listeners / instantiates libraries (Lenis, IntersectionObservers,
  scroll controllers) silently dies after a soft-nav back to that page — the DOM is
  re-rendered but the script never re-runs (verified: `html.lenis` absent after
  home→about→home). Fix pattern: wrap setup in `init()`, bind on
  `document.addEventListener('astro:page-load', init)` (fires on first load AND every
  nav), and tear down `window`/`document` listeners + `lenis.destroy()` +
  `cancelAnimationFrame` on `astro:before-swap` so nothing leaks onto a stale document.
  `Header.astro` and `blocks/intro/IntroScroll.astro` both use this. Lenis also needs
  its base CSS in `global.css` (incl. `.lenis.lenis-smooth { scroll-behavior: auto }`
  to override the global smooth-scroll).

## Homepage scroll-intro (Framer → Astro port, 2026-06)

- **Extracting assets from a finished Framer site: a "sticky Image" layer can be a
  BLURRED backdrop, not the sharp photo.** The visible classroom hero was a separate
  `data-framer-name="Hero Image"` layer (`CRQ….png`); the layer named "Image" held a
  blurred green gradient (`A6yz8….jpg`). Always read the `<img src>` inside EACH named
  layer (`[data-framer-name]`) and eyeball the downloaded file before wiring it in —
  don't trust the layer name. Framer DOM recon that worked: `document.querySelectorAll(
'[data-framer-name]')` for the layer tree + per-layer `querySelector('img').src`.
- **The wave line is a SCROLL-SCRUBBED SVG draw, not a static overlay.** First pass
  rendered the line as a fixed full-screen layer that just faded — wrong. The source
  ties `stroke-dashoffset` to scroll (measured live: offset `1343→0` over the first
  ~800px = the stroke draws on as you scroll, into a halo around the student), then
  fades opacity `1→0`. Recreate by: measure `path.getTotalLength()`, set
  `strokeDasharray=len`, and per scroll frame set `strokeDashoffset = len*(1-drawn)`
  where `drawn` is a function of pin progress. Drive `--line-opacity` + the CTA reveal
  from the same progress value.
- **The hero and the Balance toggle are ONE combined pinned stage, not two.** The
  source gives the illusion they're a single continuous scene: a shared backdrop stays
  pinned (measured: the blurred `Image` layer's `top` is 0 across the whole y=0→2500
  sweep, as is the `Circles Container`) while the sharp hero scrolls/fades out and the
  Balance content scrolls up + pins over it. Building them as two sequential `sticky`
  scenes (hero pin → release → toggle pin) reads as a hard handoff and was the bug.
  Rebuilt as a single `IntroStage.astro`: one tall section (`~340svh`) with ONE sticky
  `.stage-pin` (100svh) holding layered, absolutely-positioned `.field` (green→cream
  Balance, z1, behind) + `.hero` (photo + line + copy, z2, front). One scroll-progress
  value (`scrollY / (stage.offsetHeight − pin.offsetHeight)`) drives every phase via CSS
  vars: `--hero-out` (copy/photo slide up + fade), per-path `strokeDashoffset` +
  `--line-opacity` (line draws then fades), `--field-in` (green field fades in),
  `--toggle-expand` (the collapsed circle widens 32px→64px into the pill), and a
  `data-state` flip (green→cream / problem→solution). Order matters: line draw + field
  fade-in + hero fade-up overlap early; circle expand mid; toggle switch ~p0.68.
- **In a pinned stage, simulate scroll with transforms — don't just fade.** First combined
  pass faded the hero in place and centred the Balance, which read as static/abrupt. The
  source actually MOVES the content over the pinned backdrop: the hero copy slides the
  full viewport UP (`--hero-up` = `p * vh * 1.4` px) and fades only late (`p 0.5→0.72`),
  while the Balance rises UP FROM THE BOTTOM (`--balance-up` from `~0.42*vh` px → 0). Two
  layers (`.hero` z3, `.balance` z2) over a pinned photo (z0) + green/cream overlay (z1).
- **Connecting a drawn SVG line to a target element — measure the END in SCREEN coords,
  don't eyeball the bounding box.** The path's last-drawn point = `getPointAtLength(len -
dashoffset)`; map it to the page with `getScreenCTM()` (`sx = a*x + c*y + e`,
  `sy = b*x + d*y + f`). Compare THAT point to the target's rect, not the svg's bbox
  (the bbox bottom ≠ the stroke's visual end). Two things made the connection land: (1)
  the line must be sized so most of the swirl is ON-SCREEN while drawing — a small line
  positioned with its body off-viewport reads as a stray tail, not an animating line;
  (2) the target (here the BALANCE pill) must be CENTRED on the viewport so the centred
  line-end lands inside it — the "BALANCE" label has to float `position:absolute` to the
  pill's left (`right: calc(100% + 16px)`) instead of being an in-flow fl/`gap` sibling,
  which had shoved the pill ~45px right of centre. Verified: end `(711,399)` inside pill
  `688–752 × 398–430`. The pill is a CONSTANT-size toggle — it does not expand from a
  circle (an earlier wrong guess); "the button animates" = the knob sliding on switch.
  Sequence that reads right: line draws (visible) → completes as the rising pill reaches
  it (~p0.52, connect) → toggle switches (~p0.62) → line fades (~p0.6→0.74).
- **Tuning a scroll-scrubbed scene: jump Lenis to exact frames + verify in the
  chrome-devtools browser, not `preview_screenshot`.** `lenis.scrollTo(y,{immediate:true})`
  (via a temporary `window.__lenis` handle, removed before ship) plus `lenis.stop()` locks
  a frame; wheel-scrubbing drifts via momentum. `mcp__Claude_Preview__preview_screenshot`
  repeatedly returned BLANK even when `preview_eval` confirmed the right scroll/pin state —
  load `http://localhost:<port>/` in the `chrome-devtools` MCP browser and screenshot
  there for reliable full-res frames.
- **Nav on-dark must be progress-driven, not `#hero`-presence-driven, for a combined
  stage.** Since the pinned `#hero` stays in the viewport the whole time, keying nav
  on-dark off its rect leaves white nav text on the cream "on" surface (unreadable).
  The intro controller toggles `#site-nav.on-dark` only while `p < ~0.34` (photo
  prominent) and clears it on teardown; `Header.astro` no longer touches it.
- **Reduced motion for a pinned scrubbed stage:** unpin it. `@media
(prefers-reduced-motion: reduce)` sets `.stage{height:auto}`, `.stage-pin{position:
static}`, and the layers to `position:relative` so the hero and Balance read as two
  normal stacked blocks; the toggle stays click-operable. The controller skips Lenis +
  scrubbing and just sets the resolved static values.
- **After deleting a component import (or any mid-edit SSR error like "X is not
  defined"), the Astro/Vite dev server can wedge** — it kept serving a stale render
  where the new component's scoped CSS didn't apply (`.hero-pin` computed `static`,
  wrong section height) even after a hard browser reload. `pnpm check`/`build` were
  clean. Fix: restart the dev server (`preview_stop` + `preview_start`) to clear Vite's
  module cache; don't trust the browser after a transient SSR error.
- **CSS mask for a bottom fade with no raw color (drift guard):**
  `mask-image: linear-gradient(var(--color-white) 88%, transparent)` — white = opaque
  alpha, `transparent` = alpha 0; the color is irrelevant to an alpha mask, so it stays
  token-clean. The drift guard scans `.astro/.tsx` for raw hex / `rgb()` even inside
  `<style>`, so never write `#000`/`rgba()` there; SVG path `d=` attrs are fine.

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

## 2026-06-10 — Mindful Michigan case study transfer (case-study7)

- **Higgsfield rate-limits trigger even when YOUR account is otherwise idle:** a
  first wave of 7 simultaneous submits had 2 instant `rate_limit_reached`
  failures whose 30s retries also failed; resubmitting those 2 in a later wave
  of ≤4 succeeded immediately. Treat ≤4-job waves as the reliable submit size
  (refines the Kaiser ≤4 lesson — it applies even with no other jobs holding
  slots).
- **Scholarly source URLs (Sage/Wiley) 403 curl** — verify journal citations
  via `doi.org` HEAD (302 = handle exists) plus `api.crossref.org/works/<doi>`
  for title/journal/year, and cite the `https://doi.org/...` form, not the
  publisher page.
- **Legacy funder reports are a distinct genre:** case-study7 is a first-person
  report TO a funder (Fetzer) with fundraising asks and donor-pipeline claims.
  Reframe as case study; drop the asks deliberately and say so in the YAML
  header; expect press paraphrases inside it to be upward ("proven",
  "best practice") — the fact-verification research angle caught both on this
  page (NPR + Second Wave) and is worth keeping as a standing workflow angle.
- **Media outlets rebrand:** the cited Second Wave article now lives at
  fromcommonground.com with a different title. Re-resolve legacy press URLs and
  cite the current domain + exact title, not the legacy page's description of it.

## 2026-06-10 — La Joya ISD case study transfer

- **A legacy source can disagree with ITSELF on the headline stat.** La Joya's
  page and PDF both print "reduction in behavior issues" twice — 85% (page 1)
  and 80% (page 2) — for the same claim. Neither the fact-verification agent nor
  any first/third-party restatement resolves it. Pattern: feature the
  primary-placement figure, keep the variant off-page entirely, PUBLISH GATE for
  the owner, and make "reported … as observed by educators" load-bearing in
  every occurrence.
- **Verify the SUBJECT's governance before letting the district act in
  headlines.** La Joya ISD has been under TEA intervention (board of managers
  2024 → conservator → authority through 2028). The page was reframed so
  classrooms and named educators are always the acting subject. Check for
  takeovers/conservatorships on every new district BEFORE writing the H1 — it
  changes every "District did X" sentence.
- **Re-verify legacy product naming against the live product.** The 2022 source
  says "@HOME app" and "TuneIn"; current branding is "Inner Explorer HOME" and
  "Tune In" (innerexplorer.com/homeapp). Legacy pages are authoritative for the
  school's story, never for product naming.
- **Funding-stream vocabulary has failure modes worse than omission.** The
  first-draft FAQ implied CEIS funds special-education classrooms — by
  regulation (34 CFR 300.226) CEIS serves students NOT yet identified for
  special education. For special-ed pages: IDEA Part B is the lane, CEIS only as
  scale-beyond-special-ed, and never ESSER/ARP/Title III.
- **Higgsfield NSFW false-positive on "tween boy" + distress posture** ("hands
  pressed to his temples, overwhelmed") — reworded to "young student about 12 …
  eyes downcast at a confusing worksheet" and it cleared. The covers-skill
  guidance (swap the subject noun, soften the distress) works for tweens too.
- **A funder report is not a case study.** Mindful Michigan (legacy
  case-study7) is a first-person Fetzer grant report with fundraising asks and
  internal forecasts — flagged to the user instead of auto-porting; they scoped
  it out. Check the genre of the source before assuming the transfer pattern
  applies.

## 2026-06-10 — Series template build

- **The hidden Claude-Preview tab freezes CSS transitions at their START value**
  (no animation frames are produced; `document.hidden` is true) — `getComputedStyle`
  reports the frozen value, IntersectionObserver never fires, and even injecting an
  `opacity: .5 !important` rule "fails" because the engine starts a transition it
  never advances. So a reveal system can look completely broken here while being
  fine in any visible browser (the Claude Design chats hit the same artifact). To
  verify a hide-then-reveal mechanism in this env: inject `transition: none`, then
  toggle the reveal class and read computed values — that bypasses the frozen
  transition and proves the CSS + selector logic.
- **Pick Button sizes by measuring the designed column, not by matching pixel
  height.** A handoff's 54px/15px buttons sat between our `md` (44px/16-18) and
  `lg` (48px/18-20). At `lg` the hero's two pills measured 538px against a 497px
  content column (55% stage) and wrapped to two rows — a fidelity break worse than
  the 4px height delta. Measure `getBoundingClientRect` sums against the column
  before choosing.

## 2026-06-17 — Blog "Article" template (MDX modules)

- **MDX wraps slot children in a `<p>`.** A module that takes block text via
  `<slot/>` must NOT add its own `<p>` — MDX already wraps the children, so
  `<p><slot/></p>` becomes invalid nested `<p>` (the browser auto-closes the
  outer one, leaving an empty styled paragraph). Fix: render the slot bare and
  style the slotted child with `:global(p)` (see `PullQuote.astro`).
- **A scroll-triggered count-up can freeze on a _wrong_ partial value.** The
  shared `StatStrip` count-up only wrote the final figure in the rAF `p>=1`
  branch; if rAF is throttled/paused mid-animation (backgrounded tab, headless
  preview) the figure sticks at e.g. "0.3×" instead of "4.2×". Added a
  `setTimeout(…, dur+250)` that snaps to the exact value regardless of rAF —
  timers still fire when rAF doesn't. Always guarantee the end state of an
  animation out-of-band, not only inside the rAF loop.
- **Date-only frontmatter slips a day in western TZs.** `z.coerce.date()` parses
  `2026-05-12` as UTC midnight; `Intl.DateTimeFormat` then renders it in local
  time → "May 11". Pass `timeZone: 'UTC'` to the formatter so the calendar date
  shows as authored.
- **Claude Preview screenshots blank out at non-zero scroll** on pages with a
  `position: sticky` rail. DOM/computed-style checks (`preview_inspect`,
  `preview_eval`) are reliable there; for a visual, use a tall viewport so the
  target sits at scroll 0.

## 2026-06-22 — Home v2 build (Claude Design connector)

- **Importing a Claude Design _project_ uses the `DesignSync` connector, not
  WebFetch.** A `claude.ai/design/p/<uuid>?file=<name>` URL 403s on WebFetch (it's
  auth-gated, and not the `claude.ai/code/artifact` exception). The skill's signed-
  `api.anthropic.com/v1/design/h/...` handoff flow is a _different_ entry point. For a
  project URL: `DesignSync({method:'list_files', projectId:<uuid-from-url>})` then
  `get_file` per path (the `.dc.html` target + `colors_and_type.css` + `support.js`).
  Read methods need claude.ai design scopes — if the session token can't carry them the
  tool errors and instructs **`/design-login`** (works even with a provider/API-key
  token; the user runs it, then retry). `support.js` is just the dc-runtime React
  preview shim — ignore it; the `.dc.html` uses `ref=`/`sc-if`/`{{ }}` templating, so
  reproduce intent, don't transliterate.
- **`get_file` returns big files as a persisted JSON blob** (`{"content":"<escaped
html>"}`). Pull the real source out with `jq -r '.content' <blob> > /tmp/x.html`
  (or python `json.load`) before reading — the raw blob is unreadable escaped-newline
  JSON.
- **The hidden-Preview IntersectionObserver freeze hits count-ups too, not just
  reveals.** A scroll-triggered count-up never fires on the page's own scroll in the
  Preview; it only kicked off when I `position:fixed`-pinned the section to the top
  (forcing an intersection), and the screenshot then caught it mid-count ("3%" → settles
  to "60%"). Verify the FINAL value via `preview_eval` (text content) + trust the
  `setTimeout` snap guard; don't read a pinned screenshot as the resting state.
- **Lazy `<Image>` also won't load for a pinned-but-never-scrolled section in the
  hidden tab** (`naturalWidth 0`). Confirm the asset is real by loading the resolved
  `currentSrc` into a fresh `new Image()` (or reassign `img.src = img.src`), then re-read
  `naturalWidth` — a raw 0 is a Preview artifact, not a broken asset.

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
  variant for the plain help list), breadcrumbs reuse the `Breadcrumb` primitive.
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
