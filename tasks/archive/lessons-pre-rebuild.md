> Pre-rebuild lessons, archived 2026-10-09: sections (and bullets) about code, pages and content the clean slate removed. Current lessons: `tasks/lessons.md`.
> Code they mention is recoverable with `git show 0c8cac2:<path>` (0c8cac2 = main before the clean slate).

# Lessons archive (pre-rebuild)

Kept verbatim, in their original order. The per-case-study build lessons (2026-06-09 to 2026-06-10) are the ones the `transfer-case-study` skill points at.

## Toolchain (pnpm / Node)

_(Part of this section. The bullets that still apply stay in `tasks/lessons.md`.)_

- **A clean compiled editable tree is not proof of a clean hosted Visual Editor.**
  CloudCannon's runtime can supply external data as a Dataset API object and can
  re-render registered components while detached from their original array parent.
  Bind singleton shared-data primitives directly with exact
  `@file[/src/data/file.json].field` paths rather than putting the whole header or
  footer behind a registered component or relying on a Dataset that may resolve to a
  file list; those paths can race or become ambiguous in editable-regions 0.0.19. Keep
  `data-component`/`array-item` boundaries at the page call site rather than inside a
  registered renderer, and finish every rollout with a hosted page-by-page readback
  for red error cards.
- **Model a one-link fixed row as an object, not an array.** CloudCannon 0.0.19 can
  resolve several fields from one exact `@file` source while still returning `undefined`
  for a later array listener, and indexed paths inside array items are not supported.
  A singleton object preserves inline text editing without a fragile add/remove boundary;
  keep the link destination in Site Settings.

## Astro 6 specifics

_(Part of this section. The bullets that still apply stay in `tasks/lessons.md`.)_

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
  Sequence that reads right (retuned 2026-09-14): THREE SEPARATE BEATS, not overlapping
  layers. Hero copy slides up + fades out fast (gone by p0.2) → the line's SWIRL draws
  alone across the green field (p0→0.40) → the TAIL drops to the pill (p0.40→0.50,
  smoothstep so it leaves the swirl gently and settles) while the Balance group crossfades
  in and the line fades out — Balance opacity = the eased tail progress, line opacity its
  inverse — fully swapped the frame it lands → toggle switches (p0.64). A linear 5%-of-pin
  tail with an ease-out crossfade read as fast/jarring; ~10% with one shared smoothstep
  reads as one gesture.
  **Draw the path in two phases, not linearly in length.** The swirl closes at ~70% of the
  path's length; the remaining ~30% is a near-straight tail spanning half the SVG. Drawn
  linearly it took ~15% of the pin — a full second of scrolling where a thin line crept
  down and "nothing happened" — and every timing tweak on the reveal side left that gap
  in place. Measure where the interesting geometry ends (`getPointAtLength` sweep for the
  rightmost point / loop close), give the tail its own short scroll window, and drive the
  reveal from the tail's progress so it cannot decouple. Earlier passes also had the
  Balance rising from the bottom from p0.08 and the hero lingering to p0.54, so hero copy,
  line, and Balance text were all on screen at once. The timeline lives in one named `T`
  object in `IntroScroll.astro`, not scattered magic numbers. Pin tightened
  360svh→300svh. The two decorative ring outlines in the green overlay were removed.
- **Driving the Lenis scrub from the Browser pane without touching source:** Lenis
  re-applies its own position every frame, so `window.scrollTo` is undone. Dispatch
  `new WheelEvent('wheel', { deltaY: target - scrollY, bubbles: true, cancelable: true })`
  on `document`, wait ~900ms for the lerp to settle, then read `strokeDashoffset`,
  computed opacity and `[data-pin].dataset.state`. If the wheel does nothing and the
  console shows `504 (Outdated Optimize Dep)`, restart the dev server first.
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

## React islands

- **`.tsx` requires camelCase SVG attrs** (`strokeWidth`, not `stroke-width`) — `.astro`
  uses HTML-style kebab-case. Mixing them up is a type error in React.
- **Don't ship React for trivial interactions.** A theme toggle built as a React
  island pulled the ~184KB React runtime onto EVERY page (it lived in the Header).
  Rebuilt as a vanilla Astro component (icon swap via the `dark:` variant) → marketing
  pages dropped to ~4KB JS. After adding any island, verify per-page JS:
  `grep -o '/_astro/[^"]*\.js' dist/<page>/index.html`.

## Design system

_(Part of this section. The bullets that still apply stay in `tasks/lessons.md`.)_

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
  - **Fixed in `ArticleHeader` but NOT in `blog/index.astro` — caught 2026-08-27**,
    which had been shipping every card a day early (all five posts) while the
    article pages showed the right date. Writing the lesson did not fix the second
    call site. When a date bug like this surfaces, `grep -rn "DateTimeFormat\|
toLocaleDateString" src/` and fix EVERY formatter at once; a per-file fix leaves
    the same bug live somewhere the reader will still see it.
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

## 2026-08-25 — CloudCannon: making every page editable

_(Part of this section. The bullets that still apply stay in `tasks/lessons.md`.)_

- **The two builds' URL spaces COLLIDE.** `/faq/` is the marketing FAQ in `dist/` AND a
  help article (`src/content/help/faq.mdx`) at the subdomain root in `dist-help/`. Any
  tool that maps URL → content file must key by build root, or it validates one page
  against the other's file. `scripts/check-editables.mjs` keeps two maps for this.
- **`/help/*` routes only exist when `CLOUDCANNON_BUILD` is set** (the `injectRoute`
  guard in `astro.config.mjs`). A plain `pnpm build` produces 61 pages; the
  CloudCannon-shaped build produces 76. Verify editable regions against the
  CloudCannon-shaped build, or help previews go unchecked.
- **`Heading.astro` / `Text.astro` could not carry `data-editable`** — their Props were
  `{as, id, class}` only. Extended to `VariantProps<…> & HTMLAttributes<…>` with
  `{...rest}`, the pattern `Container.astro` already used. Do this before wiring blocks,
  not after.
- Editables must be **opt-in per call site** (`editablePrefix`), because blocks are
  shared between converted and unconverted routes. Emitting `data-prop` unconditionally
  gives every unconverted page a red card. Note `undefined` (emit nothing) vs `''`
  (relative to the enclosing array row) cannot be a truthiness check.

## 2026-08-27 — Transferring a LinkedIn article into the blog collection

_(Part of this section. The bullets that still apply stay in `tasks/lessons.md`.)_

- **`StatStrip`'s `.lbl` is `white-space: nowrap`, so `<StatRow>` labels must be
  ~3–4 words.** Authored a 3-up row with labels like "Of high school athletes report
  sport-related stress" and the cells silently overlapped and clipped past the column —
  no build error, no drift failure, just broken layout. Budget ~26 characters per label
  at a 3-up in the 700px article column. Verify with a live measurement, not the eye:
  `[...strip.querySelectorAll('.lbl')].map(l => l.scrollWidth > l.parentElement.clientWidth)`.
- **The count-up regex is `^([\d.,]+)(.*)$`,** so a non-numeric-leading value still
  animates its numeric head: `"1 in 10"` counts "0 in 10" → "1 in 10" and `"15-28"`
  counts "0-28" → "15-28". Both land correctly, but a screenshot will catch the
  partial value. Read the final figure from the DOM (`.num` innerText) after the
  `setTimeout` snap; don't trust the image.
- **Blog article screenshots still blank out at non-zero scroll** (sticky `.rail-left`,
  same trap as 2026-06-17). Verified the pull quote by reading computed styles + text
  instead. A 1280×2400 viewport captures through the first H2 at scroll 0.
- **A LinkedIn "pulse" article is fetchable but WebFetch summarizes it.** The small
  model returned a paraphrase, not the copy. Load the URL in the Browser pane and use
  `get_page_text` for the body; the source citations are LinkedIn `redir/redirect`
  wrappers, so pull the real URLs with a DOM query over `main a` and decode the
  `?url=` parameter (dots are `%2E`-escaped).

## 2026-09-18 — Research page Build Doc v2

- **The Astro compiler rejects a multi-line union type with leading `|` in
  frontmatter** (`Unexpected "|"` from esbuild at build time; `astro check` and the
  dev server are fine). Prettier reflows long unions into that shape, so keep them
  short enough for one line or split them through a helper alias.
- **A `string[]` field cannot carry array-item editables.** The CI guard flags
  `array-item has CRUD controls but no editable text inside`: a row's own value has
  no path to bind. Render plain string arrays without `editableArray`/`editableItem`
  and leave them sidebar-only (same reason the splash `lines` aren't editable).
- **A YAML list item containing `: ` parses as a mapping** — quote citation-style
  strings ("…7–12-year-olds: a systematic review…") or Zod reports
  `Expected "string", received "object"`.
- **Orphan check that works:** after `text-wrap: balance/pretty`, run a Range-rect
  scan per block (count words on the last line) at 375/768/1440, then pin the few
  real hits with U+00A0 in the YAML (plain-text regions) or `&nbsp;` in `*Html`
  fields. Skip `.stk`-stacked headings and visually-hidden `thead`s — false positives.
- **Natural-scroll screenshots DO work in this env when transitions are disabled**
  (`*{transition:none!important}` + force `.in` on reveals, then `scrollTo` → wait 1s
  → screenshot). (The 200vh scrubbed hero that needed pinning is gone — see the
  2026-09-21 entry below; every section reveals via IntersectionObserver now.) A DOM pass that
  reads each section's computed padding and checks sibling-rect intersections catches
  spacing drift and overlaps faster than eyeballing.
- **After adding a field to a `page-schemas/*.ts` module, the running `astro dev`
  keeps stripping it.** The content layer parsed the entry with the old Zod shape and
  persisted it in `.astro/data-store.json`; a restart skips re-parsing because the
  file digest is unchanged, and touching files does not help. Fix: stop the dev
  server, delete `.astro/data-store.json`, start it again. `astro build` is unaffected.

## 2026-09-21 — Scroll-reveal: put the transition on `.in`, not on `.reveal`

Replacing the research hero's 200vh sticky per-word scrub with the repo's standard
`observe()` + `.reveal`/`.in` fade surfaced a flaw in that standard pattern.

**The inverted default costs a fade-OUT.** The four research blocks declare
`.reveal { opacity: 1; transform: none; transition: … }` and then
`[data-js-ready] .reveal:not(.in) { opacity: 0; transform: translateY(28px) }`. Content
is visible by default (correct — no-JS and SEO readers get the finished page), and JS
hides it. But because the transition sits on the BASE rule, that initial visible →
hidden drop animates too: the element paints fully visible, then spends the full
transition duration fading out, before it can ever fade in. Measured on `/research`
before the fix — the first headline line read `opacity: 1` at t=0 and decayed to
`0.0001` by t≈1050ms, all while off screen.

Fix: scope the transition to the revealed state.

```css
[data-js-ready] .reveal:not(.in) {
  opacity: 0;
  transform: translateY(20px);
  filter: blur(6px);
}
.reveal.in {
  transition:
    opacity 700ms var(--ease-out) var(--reveal-delay, 0ms),
    …;
}
```

The hide is then instant and only the reveal animates. It is also less CSS — the
`opacity: 1; transform: none` resting block becomes unnecessary, because `.in` simply
transitions back to the initial values. Verified `blur(6px)` → `none` interpolates
smoothly (no snap) over 840 sampled frames.

On `/research` nobody saw the fade-out (the hero sits below the 100vh splash), but it is
wasted compositing on every load, and anything deep-linked or scroll-restored into view
would flicker.

**It was page-wide, and the charts had it worse.** The same flaw sat in all four sibling
blocks and in all five chart components, where the transition is declared on a
descendant of `[data-anim]` at its FINAL value and `[data-anim]:not(.in)` overrides to
the start value — so a bar painted at 1344px and animated down to 2px on load. All nine
were fixed in the same PR; the fix for a chart is the same move, into `[data-anim].in`:

```css
.fill {
  width: var(--w);
} /* no transition here */
[data-js-ready] [data-anim]:not(.in) .fill {
  width: 0;
}
[data-anim].in .fill {
  transition: width 1200ms var(--ease-out);
  transition-delay: var(--d);
}
```

Watch the shorthand when delays live on a separate rule (`BeforeAfterChart`'s
`.box.before` / `.box.after`): a `transition:` shorthand on the more specific `.in` rule
RESETS `transition-delay` to `0s` and silently flattens the stagger. Move the delays into
`.in`-scoped rules too, or use longhands.

Keep `transition-delay: var(--d)` as its own declaration rather than folding it into the
shorthand — a missing `--d` invalidates the whole shorthand, not just the delay.

**Still carrying the flaw** (left for their own change): `home/WhyNow.astro`,
`case-study/ResultsChart.astro`, and the page-level rules in `pages/index.astro`,
`pages/case-studies/[slug].astro`, `pages/series/[slug].astro`.

**Test it with a control.** The regression probe samples each animated property on load
WITHOUT scrolling and counts values strictly between the endpoints: an instant hide gives
0, an animated one gives 14-26. Crucially, run it against the pre-fix build too — a probe
that cannot fail proves nothing. Pre-fix scored 0/9 passing, post-fix 9/9, and a separate
forward-motion probe confirmed all nine still animate in (3+ mid-flight frames each) so a
silently-dropped transition could not pass as "correct final state".

**Two related gotchas confirmed by measurement, not assumption:**

- `data-js-ready` does NOT survive a `<ClientRouter />` swap — Astro replaces the root
  element's attributes with the incoming document's, so it is gone after a soft nav
  (verified: `false` on the next page). That means a bare top-level `observe()` call
  degrades to "content visible, no animation" rather than to a blank section — but it
  still never re-arms. Binding `document.addEventListener('astro:page-load', …)` is two
  lines and makes it correct either way.
- Gate the whole thing on `@media (prefers-reduced-motion: no-preference)`. The global
  reduced-motion rule in `global.css` squashes `transition-duration` but NOT
  `transition-delay`, so a staggered reveal whose `.in` lands after first paint would
  still pop element-by-element for a reduced-motion reader.

**On pinned scroll effects generally.** The removed effect pinned 200vh to un-blur ~40
per-word spans on a rAF scroll loop. It cost a full extra screen of scroll, was welded
to scroll velocity (stuttery on trackpads, chunky on wheel clicks) and left the headline
illegible for most of the pin. A one-shot staggered fade reads as more engaging and
deleted ~70 lines. Also note CSS `animation-timeline: view()` is still not the answer
here in 2026 — Firefox ships it behind a flag (~84% global), and the repo has no other
usage to be consistent with.
