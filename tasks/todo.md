# Tasks — Inner Explorer Website

## CloudCannon two-way publishing repair (2026-09-02)

Goal: make GitHub `main` and CloudCannon a reliable two-way content workflow for
fixed-layout marketing pages, with one reproducible verification gate across CI,
CloudCannon, and both Netlify sites.

- [x] Preserve the diverged CloudCannon state on
      `cloudcannon/recovery-2026-09-02` and record tip `051a86a…`.
- [x] Reconcile the four genuine editor changes onto current `main` without losing
      PR #91/#95/#96 content; merge recovery PR #97 after CI and both previews pass.
- [x] Pin Node 24, CloudCannon CLI 0.0.19, and editable-regions 0.0.19.
- [x] Add `validate:cloudcannon` and the authoritative `verify:cms` command; use it
      in CI, both Netlify configurations, and committed initial settings.
- [ ] Change the already-provisioned CloudCannon Site build command to
      `pnpm verify:cms` after this branch merges; initial settings do not update it.
- [x] Exclude CloudCannon-owned serialized content/data from Prettier enforcement;
      keep validation through Astro/Zod and CMS guards.
- [x] Keep redirects site-specific so Help does not inherit marketing redirects.
- [x] Change the already-provisioned Help Netlify Site to repository-root Base,
      Package directory `sites/help`, and `pnpm verify:cms`; read the saved settings
      back without triggering a deployment.
- [x] Complete page/collection inputs and creation schemas, including safe fixed
      arrays, Help video files, series icons, narrator languages/photos, and taxonomy.
- [x] Replace single-shape collection `schemas` with explicit
      `add_options.default_content_file` templates so CloudCannon seeds new entries
      without applying schema maintenance behavior to existing content.
- [x] Add explicit `schemas: null` tombstones for provisioned Sites, scope `_schema`
      to Marketing pages, and reject optional snippet defaults that create no-op
      source changes.
- [x] Add stable Marketing-page previews and update the nontechnical editor guide.
- [x] Complete selective Visual Editor bindings, Help-relative links, and editor-mode
      analytics/session-replay suppression.
- [x] Extend the CMS guard and add negative fixtures for every new contract.
- [x] Run a clean Node 24 frozen install and `pnpm verify:cms`.
- [x] Prove the provisioned technical Site loads Node 24, both exact CloudCannon
      packages, both builds, 8,745 editable regions, and all then-current contract fixtures.
- [x] Prove a repeated no-op HelpVideo edit stays byte-stable after making the three
      semantic snippet Selects explicit in authored MDX.
- [x] Create, reopen, and remove one technical entry in every creatable collection.
- [ ] Re-run both Netlify previews at the final PR head. The prior `0bb8c83` preview
      proof passed, including Help direct 404s, marketing redirects, noindex, and
      security headers.
- [ ] Prove code-to-CMS and reversible CMS-to-GitHub-to-Netlify round trips, then
      confirm the legacy marketing site remains outside this rollout.

### Review

Local implementation is complete. The authoritative Node 24 gate passes both builds,
CloudCannon validation, all 8,745 editable regions, and 59 contract fixtures. The
original dirty checkout remained untouched; work is isolated on
`codex/cloudcannon-reliability`.

The final temporary-Site acceptance pass covered every creatable collection. Blog,
Case Study, Help, Narrator, Practice Series, and Testimonial entries were created in
CloudCannon, saved together in commit `913428b`, reopened from the hosted editor, and
read back with the expected filenames, fields, media, and controls. That exact commit
passed `pnpm verify:cms` under Node 24 locally and in CloudCannon. All six disposable
entries were then deleted through CloudCannon and saved together in cleanup commit
`f2c0f67`; its repository tree is byte-for-byte identical to pre-test head `87be0d8`,
with no remaining `cms-smoke-test` files or pending editor changes.

That cleanup also exposed a CloudCannon platform defect in the documented `[changes]`
commit placeholder: additions included the correct paths, but all six deletions were
rendered as `Updated null`. The final template therefore keeps the required friendly
summary plus automatic author/date and relies on the Git diff for the exact file list,
instead of writing misleading deletion details into repository history.

A temporary CloudCannon branch Site exposed and verified the hosted pnpm cache path;
the repository excludes `.pnpm-store/` so hosted formatting checks inspect source,
not package-cache internals.

The same hosted Site also exposed that using live singleton files as CloudCannon
schema templates hides those files from the Marketing pages collection. All thirteen
schemas now share a dedicated template outside the collection, and the guard rejects
both missing templates and templates placed inside a managed collection.

A subsequent hosted readback exposed a different schema side effect on uniform
content collections: CloudCannon treated the sole schema as an ongoing maintenance
contract for existing entries. Blog, Case Studies, Help, Narrators, Series, and
Testimonials now keep their inputs and structures at collection level and use an
explicit `add_options.default_content_file` only when creating a new entry. The guard
rejects missing, unconfigured, incomplete, or schema-managed creation templates.
Creation templates must include optional fields too: the narrator seed carries a null
`voiceIntro` key so CloudCannon exposes its Add control, while Zod normalizes that
placeholder back to absence until an editor fills it. Every creatable collection now
pins a collision-safe create path whose extension matches its Astro loader (`.mdx`
for authored Blog/Help content and YAML for structured entries).

Hosted no-op testing then exposed retained legacy schema behavior on the technical
Site: opening HelpVideo for editing inserted `_schema: default`, a creation-only SEO
placeholder, and an optional Callout default without any field change. The config now
uses explicit `schemas: null` tombstones for all six single-shape collections, keeps
`_schema` scoped to Marketing pages, and leaves presentation defaults inside Astro
components rather than CloudCannon's serializer. CI rejects reintroduced schema
metadata, published creation placeholders, and optional snippet defaults/empty attrs.
The provisioned technical Site now clears its retained schema state: the final hosted
build at temporary content commit `913428b` passed Node 24, exact dependencies,
both-site builds, all 8,745 editable regions, and 59/59 fixture checks; existing Help
source no longer gained `_schema` or template SEO. That testing also proved generic
Select `allow_empty` is ineffective inside the
full-document MDX snippet serializer: opening HelpVideo still hydrated the separate
omitted Callout type to `tip`. The durable follow-up makes Callout type and media ratio
Selects required with explicit insertion defaults, and materializes `type="tip"` on
the two render-equivalent omissions. Two fresh HelpVideo Edit/close passes then
produced identical 6,345-byte source (FNV `46e5773d`) with every value preserved. The
editor still raises a false dirty flag, but saving that state cannot rewrite the file.

The live Help Netlify configuration is now corrected and read back. Rollout remains
intentionally unmerged until the temporary CloudCannon Site proves that existing
entries no longer gain creation-only placeholder values. GitHub verification and both
Netlify previews pass at exact head `0bb8c83`; the Help preview returns direct branded
404s for `/pricing` and `/resources`, and the marketing preview keeps its intended
redirects and noindex/security headers. Existing public deployments remain on their
last successful versions; the live Help site therefore still demonstrates the old
redirect leak until this PR reaches `main`.

## Home v2 — new home page from Claude Design handoff (2026-06-22)

Goal: replace the placeholder `src/pages/index.astro` with the art-directed
"Inner Explorer Home v2" design (DesignSync project `399af73b…`). Reuse-first onto
tokens + components. Plan: `~/.claude/plans/take-your-time-in-enchanted-quail.md`.

Locked decisions: (1) **omit the splash/hero** — build sections below it + a commented
seam + sr-only `<h1>`; (2) **global Header/Footer** via PageLayout (anchors → real
routes); (3) **real audio** in the Listen section via `VoiceBar` + `maya-hello.mp3`.

- [x] Add `--home-*` deep-forest surface tokens to `global.css` (raw layer).
- [x] `blocks/home/LiveNow.astro` — dark; dot-field + rotating caption + 4 stats.
- [x] `blocks/home/WhyNow.astro` — dark; scroll-lit manifesto + 3 stat-cards.
- [x] `blocks/home/AudienceToggle.astro` — light; educator⇄district toggle + panels.
- [x] `blocks/home/HowItWorks.astro` — light; 3 timestamped steps.
- [x] `blocks/home/GradeBands.astro` — light; Pre-K/K-5/6-8/9-12 ramp.
- [x] `blocks/home/Proof.astro` — light; monumental 60% count-up + trend + 3 stats + pills.
- [x] `blocks/home/Stories.astro` — light; portrait canopy → CTA (reuse Button).
- [x] `blocks/home/SampleListen.astro` — dark; wraps reused `VoiceBar` (tone=dark).
- [x] `blocks/home/Funding.astro` — light; 4 funding-stream cards.
- [x] `blocks/home/BringItCTA.astro` — light; photographic split CTA + trust pills.
- [x] `index.astro` — structured data (CMS-ready) + composition, `.appearance-light`, sr-only h1.
- [x] Verified: `pnpm check` 0 errors + `pnpm build` 58 pages (home JS = ClientRouter + ~150B vanilla, **no React**); Claude Preview every section, toggle (both ways), count-up→60%, audio 0:30, mobile 375 (0 overflow), dark mode (light-pin holds, chrome adapts), no-JS (all reveals opacity 1); /about /districts /research /styleguide 200 + /about renders + no console errors.

### Review

- Implemented as a reuse-first composition: **reused** PageLayout/Header/Footer/JsonLd, `VoiceBar` (tone=dark, real audio), `Button`/primitives, and `lib/intersect.ts`; **added** 10 data-driven `blocks/home/*` (the design's sections are genuinely one-of-a-kind, and `blocks/<page>/` is the established repo convention) + 4 `--home-*` tokens. No shared components modified → zero regression risk, confirmed.
- Deviation from plan: built stats **inline** per section (dark + thin-Inter numerals StatStrip doesn't natively do) instead of reusing StatStrip; Funding is its own block (split header doesn't fit FeatureGrid's centered header). Both keep shared components untouched.
- Drift guard green — all color via tokens / `color-mix(in oklab,…)`, geometry as plain CSS.

### Update (2026-06-22) — Live-now mosaic

- [x] Replaced the green dot-field in `LiveNow.astro` with a field of **circular "dots"**:
      28 provided student/classroom photos (localized + downsampled to
      `src/assets/images/home/mosaic/`, ~2 MB) clipped to circles and **fading in and out**
      on staggered timers, woven with 12 brighter flashing green dots of the same size
      (~30% dots, "mostly faces"). Irregular dot placement (period coprime with column
      counts) so they scatter instead of forming a column on narrow layouts; centered
      flex-wrap, radial vignette, lazy-loaded (text headline stays the LCP); reduced-motion
      rests them visible. Verified: check/drift/build green, desktop + mobile (0 overflow),
      no React added. These photos are the user's intended imagery (not stand-ins).

### Stand-ins to replace before publish

- [ ] Photos are repo stand-ins (educator card, ~7 Stories portraits from `narrators/`,
      demo photo) — swap for verified home imagery.
- [ ] Listen audio is the narrator hello (`maya-hello.mp3`) — swap for a real practice sample.
- [ ] Splash/hero intentionally absent — drop in the real splash at the seam; move the
      visible `<h1>` there and remove the sr-only placeholder.
- [ ] CTA "Free for educators" / Header `/educators` + `/resources` have no routes yet
      (pre-existing) — point at real routes when those pages land.

## Dwight Morrow case study transfer (2026-06-09)

Goal: transfer legacy innerexplorer.com/case-study2 ("Empowering Student Leaders to
Address Youth Mental Health at Dwight Morrow High School") to
`/case-studies/dwight-morrow/` via the transfer-case-study skill.

- [x] Extract legacy page + PDF verbatim (incl. PDF-only student-leader quote and
      JAMA Pediatrics / MHA 2021 citations; chart read via vision: 14.34% → 53.23%).
- [x] `src/content/case-studies/dwight-morrow.yaml` (order 6 after parallel-story
      merges) — no schema changes needed; newsroom story card (id 21); legacy PDF at
      `public/downloads/dwight-morrow-case-study.pdf`.
- [x] 11 brand images generated (Higgsfield GPT Image 2, ~175 credits) — 3 regens
      for brand-logo (Nike/North Face) and "Key Club" whiteboard-text issues; all
      reviewed before install; hero copied to newsroom asset.
- [x] 12-agent content-SEO workflow (5 researchers / synth / 3 appliers / 3
      adversarial verifiers): 30/30 proposals accepted (8 verifier-revised), applied
      with cross-scope dedup (Cardona pull-quote component skipped — embedded in
      challenge body instead).
- [x] Verified: desktop + mobile no overflow; chart/FAQ(7)/3 real voices render;
      Broward dist byte-identical, Webb delta = next-card retarget only; `pnpm check` + build green; title 53 / description 149 chars; 3 linked citations in JSON-LD.

### Publish gates (carry-over for launch review)

- Two stand-in portraits (Conceicao, Suro) need real photos.
- Cardona quote attribution is "in an interview at the time" — source interview URL
  was not found verbatim on the indexed web (NEA's version differs); keep unlinked.
- Staging-domain noindex flagged as a separate task (netlify.app already indexed).

## Case study: Henry J. Kaiser Elementary transfer (2026-06-09)

Transferred innerexplorer.com/case-study1 (+ HJK-Elementary.pdf) to
`/case-studies/kaiser-elementary/` via the transfer-case-study skill.

- [x] Extract legacy page + 3-page PDF (text + vision); fact inventory in plan file.
- [x] `src/content/case-studies/kaiser-elementary.yaml` (order 3) — full story; chart
      from the discipline-by-type table; 6 linked verified sources; 6-item buyer FAQ.
- [x] Newsroom story card; legacy PDF at `public/downloads/kaiser-elementary-case-study.pdf`.
- [x] Higgsfield imagery (11 scenes, GPT Image 2, PreK-2 WV-specific; ~224 credits);
      installed at 1600px; hero copied to newsroom cover.
- [x] Content-SEO workflow (11 agents): 4 researchers → synthesis → 3 appliers →
      3 adversarial verifiers. 15/19 proposals accepted (8 with verifier revisions),
      4 rejected. Headline finding: the LEGACY site misquoted The Nation — fixed
      against the live article. Gallery gained a representative-imagery disclosure
      (`gallery.note`, additive-optional schema + PhotoMosaic slot).
- [x] Verified: checks green, build green, broward byte-identical, webb delta =
      next-card retarget only.

### Launch gates (decide before publish)

- [ ] Real portraits for Trudy Humphreys + Amber Hardman (stand-ins live, alt text
      non-identifying).
- [ ] Student voices: invented (Lily/Mason) kept per content-owner direction, but the
      workflow escalated to DELETE-recommended (fabricated child quotes, ages 4-8,
      opioid-crisis context — QRG Lowest trigger + consent impossibility). Decide:
      real consented quotes w/ guardian sign-off, or delete the two entries.
- [ ] trustRating 4.8/5: back with a named survey instrument + year + n, or delete.
- [ ] At domain migration: 301 BOTH innerexplorer.com/case-study1 AND
      lms.innerexplorer.org/case-study1 (+ /images/HJK-Elementary.pdf on both hosts)
      to /case-studies/kaiser-elementary/.

## Case study snapshot → reuse About-page StatStrip (2026-06)

Goal: the stats band directly beneath the case-study hero should reuse the
About-page stats component (`StatStrip`) instead of the bespoke `SnapshotBar`.

- [x] Extend shared `StatStrip` (backward-compatible — About/Narrators unchanged):
  - [x] Column count derives from `stats.length` (`--cols`), not hardcoded 4-up.
  - [x] Generalize mobile divider removal (`nth-child(even)`, not `nth-child(2)`).
  - [x] Anchor count-up regex (`^…`) so letter-leading values (`PreK–12`) stay static.
  - [x] Add a `size` variant (`display` default | `compact`) so a denser N-up snapshot
        bar fits without the huge hero figure overflowing.
- [x] Swap `SnapshotBar` → `StatStrip` on `case-studies/[slug]` (contained, upper labels,
      compact, 1180px to match the case-study content rhythm; preserve top spacing + reveal).
- [x] Delete now-unused `SnapshotBar.astro`; update `case-study/types.ts` comment.
- [x] Verify: `pnpm check` green; dev-server render of `/case-studies/broward/` — no
      overflow on `PreK–12`, count-up animates numeric cells only, mobile 2-up clean.

### Review

- The "at a glance" band beneath the case-study hero now reuses the About-page
  `StatStrip` instead of the bespoke `case-study/SnapshotBar`. Same italic Libre-Caslon
  figures + hairline rules + tracked-caps labels, fed `district.snapshot` directly
  (`ValueLabel[]` is structurally a `StatStrip` `Stat[]`).
- `StatStrip` gained three backward-compatible levers: `--cols` (data-driven column
  count), a `compact` `size` variant (denser figure/padding for N-up snapshot bands),
  and an anchored count-up regex. Verified About (4-up, full-bleed, 66px display,
  sentence labels, `+`/`%` sup) and the count-up across About/narrator values are
  unchanged.
- Verified on `/case-studies/broward/`: 5-up, no overflow on `PreK–12` even at the
  46px font cap (236px cells); numeric cells count up while `PreK–12` stays static;
  mobile collapses to a clean 2-up with no dangling dividers (incl. the trailing 5th
  cell). `pnpm check` (typecheck + lint + drift + format) green.

## Foundation (complete)

- [x] **Phase 0 — Scaffold + tooling**: Astro 6 (strict TS), Tailwind v4, React,
      sitemap, MDX; ESLint flat + Prettier (astro/tailwind plugins); pnpm + Node 24
      pin; drift-guard script; CI workflow; git init.
- [x] **Phase 1 — Design tokens**: 3-layer token system in `global.css` (raw →
      semantic → `@theme`), fluid type ramp, 8pt spacing, semantic colors (light +
      dark), radius/shadow/motion. Default palette + type scale cleared so only
      system tokens exist. Drift guard wired (`pnpm lint:drift`).
- [x] **Phase 2 — Primitives + layout + `/styleguide`**: Button, Heading, Text,
      Prose, Link, Badge, Container, VisuallyHidden; Section, Grid, Stack, Header,
      Footer, vanilla ThemeToggle; living catalog at `/styleguide`.
- [x] **Phase 3 — Blocks + content + pages**: Hero, FeatureGrid, Testimonials,
      CTABanner; content collections (blog + testimonials) with Zod; example pages
      (home, blog index, blog post).
- [x] **Phase 4 — SEO / a11y / perf**: SEO.astro (meta/OG/Twitter), JsonLd
      (Organization + Article), dynamic robots.txt, sitemap; WCAG 2.2 AA baked into
      primitives; zero-JS marketing pages.
- [x] **Phase 5 — Netlify + verification**: `netlify.toml` + `_redirects` scaffold;
      build/lint/typecheck/drift/format all green; drift guard proven to fail on
      violations; theme toggle + dark mode verified in browser.
- [x] **Docs**: `CLAUDE.md`, `DESIGN.md`, `tasks/todo.md`, `tasks/lessons.md`.

### Review

A production-ready, drift-resistant foundation. Verified: `pnpm check` = 0
errors/warnings/hints; build outputs 5 pages + sitemap; marketing pages ship ~4KB JS
(React loads only on `/styleguide`); home/blog/styleguide confirmed in light + dark.
Drift guard demonstrated catching `bg-[#...]`, `mt-[13px]`, raw hex (exit 1) and
passing once removed. The token + component system is what makes the Claude Design →
Claude Code loop produce consistent output.

## About Us page (Claude Design handoff — complete)

- [x] **Real brand tokens** dropped into `global.css`: IE green palette, cool-gray
      neutrals, Inter + Libre Caslon Condensed (self-hosted woff2), glass/tint/shadow/
      radius tokens. Semantic names unchanged → home/blog/styleguide re-skinned for free.
- [x] **Self-hosted webfonts** (`public/fonts/*.woff2`); added `/logo.png` + `/og-default.png`.
- [x] **Global chrome** rebuilt to brand: theme-aware glass pill nav (`Header.astro`) with
      mobile menu + ThemeToggle; brand `Footer.astro`. `PageLayout` gained `flushTop` for
      hero pages.
- [x] **`/about`** built from 11 `blocks/about/*` components (hero, stats count-up, mission,
      origin, scroll-driven compass timeline, research, voices, team, partners, principles,
      CTA). Content as structured data in the page; all photos localized + via `<Image>`.
      Light-only via `.appearance-light` pin; ~2.2KB vanilla JS, no React; no-JS content
      visible; reduced-motion safe. `pnpm check` green; build clean.

### Review (About Us)

Faithful to the v1 handoff. Verified in-browser (light): hero, scroll timeline (spine fill

- active node + rail sync + click-to-scroll), count-up stats, 5-col team, origin, voices,
  CTA. Dark mode: About content stays light (computed `--card` = #fff) while chrome adapts —
  fixed a `@theme` indirection footgun (see lessons). Regression: home/blog/styleguide all
  200 and coherent. Content (founders, stats, studies, partners) is plausible placeholder
  flagged by Claude Design to fact-check; photos are Unsplash stand-ins to swap for real IE
  imagery. Hero Inter weight-200 falls back to 300 (not shipped in the bundle).

## Narrator detail page (Claude Design handoff — complete)

- [x] **Promoted** `blocks/about/StatsStrip` → `blocks/StatStrip` (+ `labelCase`,
      `contained`, `maxWidth`, `ariaLabel` props; About refactor mechanical, no visual
      change) and `blocks/about/TeamGrid` → `blocks/TeamGrid` (+ `variant: 'voices'`
      serif-italic linked cards; duet `.sans` head support; optional photo + branded
      fallback; `maxWidth` prop). Single source per the `implement-design-handoff` skill.
- [x] **New shared blocks/primitives**: `primitives/Breadcrumb`, `blocks/EditorialMasthead`
      (eyebrow rule + Inter/Caslon duet), `blocks/PhotoQuote` (21:9 hero, `--hero-tint`
      overlay, glass corner pills, serif quote), `blocks/VoiceBar` (real `<audio>` +
      vanilla `<script>` toggle, 64-bar build-time waveform, captions `<track>`,
      progressive enhancement), `blocks/Interview` (numbered Q&A w/ tag pills),
      `blocks/MediaRows` (photo-led practice rows).
- [x] **Narrators content collection** (`content.config.ts` + `src/content/narrators/*.json`):
      Maya Castellanos (full handoff copy, voice intro, 4 facts, 5 Q&A, 4 practices) +
      Jordan/Aisha/Priya for the "more voices" grid. Person + BreadcrumbList JSON-LD.
- [x] **Routes**: `src/pages/narrators/[slug].astro` (collection-driven, pinned light,
      compose blocks in C2 order) + `src/pages/narrators/index.astro` (minimal listing).
- [x] **Placeholder seed media**: brand-tinted JPG portraits + 21:9 hero via
      `scripts/gen-narrator-placeholders.mjs` (sharp + SVG initials); 30-sec gentle
      placeholder MP3 + empty WebVTT captions track in `public/audio/narrators/`.
- [x] **Light-pin fix in `global.css`**: `.appearance-light` now paints its own
      `background-color` so the global dark body bg doesn't bleed through gaps between
      contained blocks on a light-pinned detail page (see lessons).

### Review (narrator page)

Built reuse-first per the `implement-design-handoff` skill: 2 promoted shared blocks,
6 new shared blocks/primitives, 0 page-scoped components. `pnpm check` 0/0/0; build
clean (11 pages); narrator page ships the same shared 2.2KB inline-script bundle —
**no React runtime**. Browser-verified at 1440 desktop + 375 mobile: masthead duet,
photo hero + serif quote, **voice bar plays + waveform fills + time ticks (0:10 ↔
23/64 `.on` bars)**, quick facts, 5× Q&A, photo-led practices, "more voices" grid.
Light pin holds under global dark mode (chrome still adapts). Regress check: home,
blog, styleguide, **About** all coherent in both themes. Stand-ins flagged below.

## For Districts page (Claude Design handoff — Documentary direction — complete)

- [x] **`/districts`** built from the shared `CinematicHero` + `EditorialCTA` plus thirteen
      page-scoped blocks in `src/components/blocks/districts/`: `EditorialLede`,
      `DistrictTrustStrip`, `FieldReports`, `ByTheNumbers`, `DayInside`, `VoicesSelector`,
      `StandardsAlignment` (CASEL radial), `CompareTable` (segmented filter), `FundingGuide`
      (+ inline `ROICalculator`), `ImplementationTimeline`, `SecurityPrivacy`, `FAQAccordion`.
      Three field-report case studies as alternating photo spreads, dark "By the Numbers"
      centerfold, three-image day-in-the-life essay, portrait-driven voices selector, ROI
      sliders + funding selector with live cost math, native `<details>` FAQ accordion, dark
      editorial closing CTA with numbered side card. Decorative "Listen" affordance NOT shipped
      with audio — labelled preview-only.

### Review (Districts)

Ships through `PageLayout flushTop`, wrapped in `.appearance-light` to stay light under global
dark mode. `pnpm check` and `pnpm build` clean. Per-page JS is the same ~2.2KB vanilla bundle
— no React on marketing pages. Interactions verified: voices selector, FAQ details/summary
accordion, ROI sliders with funding switch, CASEL petal selector, compare table privacy filter.
Stayed on the cohesive cool-gray neutral palette per the user's call.

## Research page (Claude Design handoff v2 — "The Quiet Revolution" — complete)

- [x] **Editorial surface tokens** added to `global.css` raw layer:
      `--editorial-night/-soft`, `--editorial-paper/-soft`, `--editorial-ink/-muted`,
      `--editorial-glow/-soft`. Brand-level (not page-scoped) so any future longform
      editorial page can reuse the dark/paper duality.
- [x] **`src/lib/intersect.ts`** — shared one-shot intersection observer with
      reduced-motion + missing-IO fallbacks. Sets `data-js-ready` on `<html>` so
      reveal CSS can opt INTO hide-then-animate behavior only when JS is ready
      (no-JS readers see content fully rendered).
- [x] **`/research`** built from 10 `blocks/research/*` components (opening void,
      hero with ken-burns, six-study receipts wall, animated brain SVG with
      stressed/mindful toggle, 5-tab outcome spreads with custom charts —
      bars/before-after/dial/line/competencies — endorsers grid, auto-rotating
      voices on dark, italic-display CTA, sticky breath meter). Content as
      structured data in the page; light-only via `.appearance-light` pin.
- [x] **Vanilla JS only** — ~3.4KB total per-page JS; zero framework JS. Brain
      toggle, voices rotation, outcome active-nav, breath meter scroll, and
      reveal-on-intersect all hand-rolled. Reduced-motion respected.
- [x] **JSON-LD** on `/research` — Article + Citation[] (ScholarlyArticle for
      each of the 6 studies, with `url` for those with known journal links);
      `datePublished`, `inLanguage`, `about`.
- [x] **A11y**: single `<h1>` (hero); voices uses `role="group"` + `aria-pressed`;
      brain toggle is `role="switch"` with `aria-checked` synced to data-state;
      breath meter aria-hidden; reveals opt-in via `data-js-ready` so no-JS
      readers see fully rendered content.
- [x] `pnpm check` green · `pnpm build` clean.

### Review (Research)

Faithful to the v2 "Quiet Revolution" direction (the user explicitly rejected
the flat v1 in the design chat). Dark/paper alternating chapters, Roman-numeral
marks, giant italic year-and-stat typography, full-bleed ken-burns hero. The
existing pill nav and Footer carry across — no chrome forking. The breath
meter (right-edge fixed dot + chapter label) is present for ≥1024px viewports.

### Research page — follow-ups before publish

- [ ] **Verify all representative stats with the research team** — the Claude
      Design author flagged these as drawn from study results but not
      individually verified: hero counter "15", receipts leadStats (`+14%`,
      `+18%`, `−34%`, `−28%`, `+Math`, `+GPA`), outcome statValues
      (`+18%` GPA, `−42%` referrals, `−34%` teacher stress, `−28%` student
      stress), all chart datapoints (Reading +14 / Math +18 / Science +11 /
      Overall +17; behavior before-after; teacher dial values; 8-week line
      points; CASEL %s).
- [ ] **Swap the Unsplash hero photo** at `src/assets/images/research/hero-classroom.jpg`
      for a verified Inner Explorer classroom photo (calm window light, focused
      students, anonymized as needed).
- [ ] **Confirm study citations + URLs.** Lopez 2020, Stager 2022, Dunlap 2023
      are "Pending publication" in our data — verify the latest journal status
      and add the canonical URLs to `knownUrls` in `src/pages/research.astro`
      so JSON-LD links to them.
- [ ] **(Reuse follow-up)** Consider refactoring `ResearchHero` / `ResearchCTA`
      to consume the shared `CinematicHero` / `EditorialCTA` blocks (used by
      `/districts`) for tighter single-source editorial primitives. Currently
      page-scoped because the v2 handoff's typographic scale and ken-burns
      treatment didn't fit the shared blocks' shape — but worth revisiting.
- [ ] **(Reuse follow-up)** Promote `ResearchEndorsers` 6-cell layout into a
      shared `LogoGrid` block (props: `items[]`, `columns`) if/when a similar
      partner grid is needed on another page. Until then it lives as a
      page-scoped block.

## Contact page (Claude Design handoff — complete)

- [x] **Hero reuse**: extended `blocks/EditorialMasthead` with a `layout: 'stacked' | 'inline'`
      variant (default `stacked` — preserves the existing narrator/index callers; `inline`
      renders the duet as one sentence with the serif word painted brand-green and
      `white-space: nowrap`, matching the user's "no orphan / single-line" call in chat).
- [x] **New shared block** `blocks/ContactCard.astro` — `tone: 'primary' | 'subtle'`,
      optional `badge` prop, title/blurb/icon-slot/body-slot. Drift-safe primary tint via
      `color-mix(in oklab, var(--color-brand) 6%, var(--color-card))` — reusable for any
      future "feature card with chip + body" surface (pricing tiers, plan cards, etc.).
- [x] **Page-local bodies** in `blocks/contact/`: `DemoForm` (Netlify Forms wiring +
      vanilla validation + success-state swap), `PhoneCard` (tel link + pulsing live
      indicator + copy-to-clipboard + mint humans panel), `EmailCard` (3 triaged rows
      with per-row copy). Page-wide toast `<output aria-live="polite">` listens for
      `[data-copy]` clicks via one shared script.
- [x] **`src/pages/contact.astro`** — structured content at the top (CMS seam),
      `PageLayout` (no `flushTop`, hero is small + centered), `.appearance-light` pin,
      `ContactPage` JSON-LD with `contactPoint[]` for support / technical / press. Ambient
      radial gradients fixed behind everything via `color-mix` over tokens.
- [x] **JS budget**: per-page bundle is 2.3KB of vanilla scripts (form intercept +
      clipboard + nav scroll). Zero React on the page. Progressive enhancement: form
      submits to Netlify natively without JS; JS upgrades to in-page success card.

### Review (Contact)

Faithful to the v1 handoff. `pnpm check` green (0/0/1 — the lone hint is the
intentional `document.execCommand` clipboard fallback for older iOS, deprecated
but kept on purpose). `pnpm build` clean. Browser-verified at 1280 desktop +
mobile 375: hero stays one line at all viable widths, primary card border
resolves to `rgb(26, 154, 89)` = #1A9A59 (brand green), form goes single-column
on mobile, copy buttons + form fields wire correctly. Form validation flags
the 4 required fields with `aria-invalid` on empty submit and blocks submission;
filled submission renders the success card with the entered first-name and
email interpolated. Dark mode regression check: `/contact` stays light (computed
`bg` = light surface), header/footer chrome still flips, `/`, `/about`,
`/narrators`, `/styleguide` unchanged. EditorialMasthead stacked callers
preserve the original 28px gap between display and intro.

## Stand-ins to swap before publishing

- [ ] Narrator portraits + 21:9 hero — replace generated initials placeholders with
      real photography (`src/assets/images/narrators/*.jpg`).
- [ ] "Meet the voice" intro audio + captions — replace
      `/audio/narrators/maya-hello.mp3` (30s placeholder tone) + `maya-hello.vtt`
      with a real recording + caption file. (The other 3 narrators omit `voiceIntro`
      until recordings exist — the VoiceBar hides automatically.)
- [ ] Confirm narrator metadata (`role`, `intro`, `quote`) against final brand copy.
- [ ] Full v4 "Meet the Studio" narrator collection page is out of scope — the
      current `narrators/index.astro` is a minimal listing so the breadcrumb resolves.
- [ ] Districts reuses About's existing localized photography. Replace with real
      district imagery — Field Reports needs three distinct district photographs
      (Broward / Newark / Aurora), Day Inside needs three time-of-day classroom shots,
      By-the-Numbers needs a single anchor portrait.
- [ ] Districts placeholder data: ROI per-student pricing ($4.20), funding coverage
      percentages, district names (Broward / Newark / Aurora), testimonials,
      "Field Report № 09" serial, partner district list, awards/certifications.
      Cross-check with the partnerships team.
- [ ] Districts hero "Listen" button is decorative only — wire to a real preview audio
      file or remove if it can't be supported at launch.
- [ ] Districts page omits the design's React multi-step demo modal — primary CTAs
      deep-link to `/contact`. If a modal is desired later, build it as a small vanilla
      island, not a React tree.
- [x] **Contact page placeholders** (designer's stand-ins) removed in the copy pass
      below: phone number, team initials/names, `hello@`/`press@`, the Marlborough
      location line, and the `/schedule` calendar link are all gone. The only contact
      address left is the verified `support@innerexplorer.com`.
- [x] **Contact form delivery**: resolved by moving the form to a native HubSpot embed
      (see "HubSpot contact form" below). Netlify Forms is no longer the destination, so
      there is nothing to configure in the Netlify dashboard — the `demo` form definition
      there is now dead and can be deleted. Notification settings moved to HubSpot.

## Narrator collection page — D2 "Meet the Studio · Full-width headline" (complete)

Replaces the minimal `narrators/index.astro` placeholder shipped with the detail
page. Same content collection drives both pages; new wall-only fields (`langs`,
`since`, `practiceCount`, `isNew`) were added to the unified narrator schema as
optional. Astro 6 `<ClientRouter />` is wired in `BaseLayout` so the wall card
photo morphs into the detail-page hero on navigation (`transition:name` shared on
the portrait `<Image>`).

- [x] **D2 hero** (`blocks/narrator/MeetStudioHero.astro`, page-local): oversized
      duet (~116px sans + ~184px italic serif) on a warm cream-peach-green wash;
      "Vol. IX · Spring 2026" corner anchor positioned below the fixed glass nav.
- [x] **4 new shared blocks** (reuse-first, confirmed up front): `MetaStrip`
      (`dense | feature` variants — dense for the wall meta, feature reserved for
      the detail page's quick facts), `CollectionToolbar` (title + right slot for
      controls), `MomentsRail` (3-up captioned photos, 1.3/1/1), `SplitCTA`
      (large serif pull-quote + brand-tinted action card).
- [x] **2 narrator blocks** in `blocks/narrator/`: `NarratorWall` (5×6 grid +
      vanilla mutually-exclusive play toggle) + `NarratorCard` (overlay name,
      `isNew` pin, hover-reveal play button, accessible link + separate button
      composed via z-index — no React).
- [x] **30 narrator seed JSONs**: Maya + the 3 detail-page seeds shipped in the
      prior PR, plus 26 wall-only narrators (slug, name, role, langs, since,
      practiceCount, photo) so the wall fills out. Detail-page fields are absent
      on those 26 — their detail routes still render via main's `[slug].astro`,
      with optional sections hiding gracefully.
- [x] **Warm tokens** in `global.css` raw layer: `--cream-50/100`, `--peach-200`,
      composed `--studio-hero-wash` and `--studio-card-wash`.
- [x] **Header nav** already exposes "Narrators"; no further nav changes needed.
- [x] **Localized photography**: 26 additional Unsplash portraits + 3 studio
      moment photos in `src/assets/images/narrators/` and `…/moments/` (flagged
      below as stand-ins to swap before publishing).
- [x] **View transitions** verified in Chromium — card photo morphs into the
      detail hero on click; auto-skipped under `prefers-reduced-motion`. Routing
      stays purely SSG (37 pages built; no SSR/edge).

### Follow-ups (collection page)

- [ ] **Search + filter** behaviour on the wall toolbar — currently the search /
      filter pills are visual-only. Likely: a small vanilla `<script>` doing
      client-side text + language filtering against `data-*` attrs on each card.
- [ ] **"Schools listening weekly" (1,840)** in the meta strip is stub copy —
      wire to a real source or remove when the metric is locked.
- [ ] **Languages narrated total** computes to 12 distinct from seed data; D2
      mockup copy said "11" — confirm canonical number with the studio team.
- [ ] **Voice intro audio for the other 29 narrators** (only Maya's
      `voiceIntro` is populated; everyone else's `VoiceBar` is hidden until
      recordings exist).

## 404 page (Claude Design handoff — complete)

- [x] **`src/pages/404.astro`** built from the `Hd2GC8AEElzoXPq4O2fG3g` handoff,
      mapped onto existing tokens — no new tokens, no new shared blocks. Editorial
      direction: italic "404" in `--brand-900` at the center of a full compass
      dial (N/E/S/W cardinals at the rim, 72 hairline ticks, red north-tick that
      rotates "lost" until the cursor moves, then tracks the cursor; hovering /
      focusing "Return home" or pressing `N` snaps it true north; ~7s idle =
      back to lost spin). Single CTA, empty footer, no scroll.
- [x] **Page-local composition** (BaseLayout directly, not PageLayout): the
      minimal editorial header/footer the user iterated to is intentional — the
      glass-pill marketing chrome would fight the calm-moment direction.
- [x] **Light-pinned** via `.appearance-light` wrapper. Verified the editorial
      paper + deep-green type holds under both inline-set `.dark` and OS-level
      `prefers-color-scheme: dark`.
- [x] **Tokens-only styling**: `var(--brand-900/-800/-700)`, `var(--editorial-paper)`,
      `var(--danger)` for the compass red; `color-mix(in oklab, var(--token), transparent)`
      for every opacity tint (rim/ticks/dial-face glow/atmospheric peach + mint).
      Drift guard green.
- [x] **Verified**: `pnpm check` + `pnpm build` clean; `dist/404.html` emits a
      2.3KB bundled vanilla `<script>`, **zero React framework JS**. Browser
      checks via Claude Preview MCP at 1280×900, 375×812 (mobile), 1100×560
      (short) — compass + 404 fit comfortably with no scroll at each size.
      Cursor tracking, CTA-hover snap-to-N, keyboard-`N` snap all confirmed.
      `/`, `/research`, `/about` regression-checked clean.

## Help & Support page (Claude Design handoff — complete)

- [x] **`src/pages/support.astro`** built from the `7k15qYlgQDx9IjYkH_jBWQ` handoff
      (Function Health FAQ replication brief). Reuse-first: extended
      `EditorialMasthead` with a new `display` layout (drops the lead row),
      reused the global `Header`/`Footer`, and added three shared blocks and
      one page-local block so future pages get the system upgrade.
- [x] **System extension** — `EditorialMasthead.astro` now accepts
      `layout="display"` and an optional `lead`. Backward-compatible: existing
      `stacked` (/about, /narrators) and `inline` (/contact) consumers
      verified unchanged.
- [x] **New shared blocks** —
      `FAQSection.astro` (H2 + native `<details>` accordion with plus → ×
      toggle, hairline borders, brand-green active state),
      `PricingCard.astro` (centered headline with optional `.hi` brand-green
      `color-mix` highlight + horizontal price/feature card),
      `QuoteRow.astro` (sans-serif duet headline + CTA pair + 3 quote cards
      with optional star rating). Each is data-driven and reusable on any page.
- [x] **Page-local block** — `blocks/support/FAQSidebar.astro`: sticky
      sidebar (search input + jump-to TOC with scroll-spy). Vanilla `<script>`
      handles smooth-scroll with header offset, scroll-spy, and debounced
      search filter with polite live-region count. Anchor links + accordions
      work without JS; only the search filter is JS-only.
- [x] **Content** — all 12 sections (≈ 80 questions) live as structured data
      at the top of `support.astro`; `FAQPage` JSON-LD is generated from the
      same source (93 `Question` entities verified in `dist/support/index.html`).
- [x] **Verified**: `pnpm check` (typecheck + lint + drift + format) all
      green, `pnpm build` clean (42 pages); `dist/support/index.html` ships
      ~13.6KB of shared chunks (ClientRouter + 40-byte page module), **zero
      React framework JS**. Browser checks via Claude Preview MCP at
      1280×800 desktop, 375×812 mobile, and dark mode — hero, sidebar with
      scroll-spy (`privacy-data` active when scrolled to the privacy section),
      search filter ("spanish" → 2 of 93 matches across 2 sections), accordion
      toggle, brand-green underline highlight on "a dollar a day", pricing
      card 2-col grid (360px + 1fr), 3-up quote row with 5-star rows, mobile
      collapses sidebar above content. `/`, `/about`, `/contact`, `/research`,
      `/districts`, `/styleguide` all regression 200.
- [ ] **Placeholders to swap before publish** — testimonial attributions
      (Mrs. Alvarez · Hialeah, Dr. Robinson · Broward, Mr. Chen · Portland)
      are designer placeholders; pricing copy ("$1/day, $365 annual") + the
      email aliases (security@, hello@, partnerships@, research@) should be
      confirmed; the closer's "Days are _long_." duet is a brand line carried
      from the handoff — confirm with marketing.

## Newsroom page (Claude Design handoff — complete)

Built `/newsroom` (the content hub) from the `Bgn-oGnN6iNdYkdZNWdnzQ` handoff
("Inner Explorer Newsroom"). The footer's existing `Newsroom → /newsroom` link is now
live. Reuse-first per the `implement-design-handoff` skill — the design's "tweaks panel"
is a design-tool artifact, so the single resolved direction was built: editorial cards ·
4 columns · light wash · "Our _Newsroom_" duet hero.

- [x] **System extensions (global, backward-compatible)**: - `primitives/Button` gained a `shape` variant (`rounded` default | `pill`) — the
      component-reference's prescribed extension; all existing callers keep `rounded-md`. - `blocks/EditorialMasthead` gained an optional `glow` (soft brand halo) + an inline
      `size` (`md` default | `lg` hero scale). Contact (`inline`/`md`) + stacked/display
      callers verified unchanged. - 3 raw tokens in `global.css`: `--newsroom-wash` (white→mint page wash),
      `--masthead-glow`, `--newsroom-cta-glow`. Cover gradients reuse `--brand-50…950`.
- [x] **New shared block** `blocks/GlowCTA` — centered duet headline on a brand glow +
      primary/secondary pill `Button`s + trust line (light-surface companion to the
      photo-led `EditorialCTA`; reusable on home/pricing).
- [x] **Newsroom blocks** in `blocks/newsroom/` (mirrors `blocks/narrator/`): `StoryCover`
      (7 generative cover kinds — photo/mesh/compass/quote/stat/report/award, all
      brand-token colours, no SVG illustration), `StoryCard` (editorial body +
      whole-card link + hover lift), `StoryGrid` (responsive 4→2→1, load-more, empty
      state), `NewsroomFilters` (category tabs + count + Newest/Popular sort). Shared
      types in `blocks/newsroom/types.ts` (a `.ts` module — Astro frontmatter trips on
      multi-line `export type` unions; see lessons).
- [x] **`src/pages/newsroom.astro`** — 16 stories as typed `Story[]` structured data (the
      CMS seam), light-pinned `.appearance-light` + `flushTop`, `CollectionPage` +
      `ItemList` JSON-LD. One small vanilla controller `<script>` wires filter/sort/
      load-more via data-attributes (progressive enhancement: no JS → all 16 render).
- [x] **Verified**: `pnpm check` 0 errors / 0 warnings (lone hint is the pre-existing
      contact clipboard fallback); `pnpm build` clean (43 pages). `/newsroom` ships the
      shared ClientRouter + a 40-byte page shim + the inlined controller — **no React**.
      Browser (Claude Preview MCP) at 1280 + 375: duet hero glow, all 7 cover kinds,
      working category filter (Research → 3), Newest/Popular sort (pop desc verified),
      Load more (12→16), 1-col mobile. Dark mode: page stays light (cards #fff, brand
      labels) while the nav flips dark. Regression: `/contact` masthead unchanged.

### Stand-ins to swap before publishing (Newsroom)

- [ ] **All 16 stories are placeholder copy** carried from the handoff (titles, excerpts,
      dates, read times, popularity, and the "30% / 10M / 50,000+ educators / 8,000
      schools" figures). Replace with real newsroom content; confirm stats with the team.
- [ ] **5 cover photos** in `src/assets/images/newsroom/` (broward, morning-circle,
      lincoln, big-feelings, principal) are Unsplash stand-ins — swap for real IE imagery.
- [ ] **Card links are placeholder `#`** — no detail pages exist yet. Wire to real article
      routes (and consider promoting `Story[]` to a `newsroom` content collection then).
- [ ] **CTA links**: "Take a tour" → `/educators` and "Request a demo" → `/contact` —
      confirm the intended targets.

## Broward County Case Study (Claude Design handoff — complete)

Built `/case-studies/broward` from the `case-study-2` handoff. Reuse-first per the skill;
shipped as a **`caseStudies` content collection** (mirrors `narrators`) so more district
stories drop in as data files — no markup. Brand already matched the handoff's
`colors_and_type.css`, so no rebrand: mapped `--ie-*` → existing repo semantic tokens.

- [x] **Asset download**: 11 prototype Unsplash photos localized into
      `src/assets/images/case-studies/broward/` (hero, challenge, approach, 2 portraits,
      6 gallery), optimized at build via `<Image>`. User-authorized.
- [x] **8 shared case-study blocks** in `blocks/case-study/` (+ `types.ts` plain module —
      avoids the multi-line-union frontmatter build bug): `CaseStudyHero` (light editorial
      split + glass district badge, page `<h1>`, eager LCP), `SnapshotBar` (glass at-a-glance
      bar), `StoryBlock` (text + image + glass stat chip, reversible), `Pillars` (gradient
      icon chip + serif index), `Timeline` (rollout rail), `ResultsBand` (dark forest band:
      featured count-up + cited metric grid + numbered sources), `CaseStudyVoices` (featured
      pair side-by-side + student trio), `PhotoMosaic` (deliberate 6-tile composition +
      graceful fallback). Closing CTA **reuses** the shared `GlowCTA`.
- [x] **Reuse note (deviation from plan):** planned to _extend_ `StatStrip` for the
      snapshot, but its band/scale/divider treatment diverged enough that a small dedicated
      `SnapshotBar` was cleaner and zero-risk to existing `StatStrip` callers. Reveal +
      count-up reuse the shared `lib/intersect.ts` pattern; no new JS frameworks.
- [x] **`caseStudies` collection** in `content.config.ts` (Zod, `image()` for every photo) +
      `src/content/case-studies/broward.yaml` (full handoff copy/figures). The CMS seam.
- [x] **Route** `src/pages/case-studies/[slug].astro` — collection-driven `getStaticPaths`,
      light-pinned `.appearance-light`, `Breadcrumb`, Article + BreadcrumbList JSON-LD,
      reading-progress bar + scroll-reveal (one shared `<script>`, progressive enhancement).
- [x] **Wire-ins**: added "Case studies" to `Header` nav (desktop + mobile menu) →
      `/case-studies/broward`; set the existing newsroom Broward story `href` to the route.
      Raised the nav burger breakpoint to **1260px** so the link row never crams. (After
      merging main's `/platform` nav item the row is 8 items, intrinsic width ~1209px /
      fits a ~1243px viewport — full nav shows on 1280px+, mobile menu carries it below.)
- [x] **Hero LCP fix**: the hero is above-the-fold, so it does **not** opt into the
      scroll-reveal (was briefly fading on first paint) — only below-fold sections reveal.
- [x] **Verified**: `pnpm check` 0/0/1 (lone hint is the pre-existing contact
      `execCommand`); `pnpm build` clean (44 pages). `dist/case-studies/broward/index.html`
      ships only the shared ClientRouter + the inlined controller — **no React**. Claude
      Preview (1280 / 1160 / 960 / 375): hero crisp, snapshot, challenge/approach + stat
      chip, pillars, timeline, dark results band (white-on-forest, AA-safe), voices
      side-by-side pair + student trio, 6-tile mosaic, CTA. Geometry confirmed (featured
      cards side-by-side, 3-col metric grid, 2×2 gallery hero). Dark mode: page stays
      light-pinned while the nav flips dark. Reveal settles to opacity 1 (no stuck-hidden).
      Regression: `/newsroom` Broward card now deep-links in; nav fits at >1260 / collapses
      below; no console errors.

### Stand-ins to swap before publishing (Broward case study)

- [ ] **Photos** in `src/assets/images/case-studies/broward/` are the prototype's Unsplash
      stand-ins — swap for real Broward classroom + administrator/teacher photography.
- [ ] **Metrics + sources are representative** (the Claude Design author flagged them as
      framed against IE's published reporting, not individually verified): featured 65%,
      grid (43% / 12% / 1.6× / 27% / 89% / 31%), snapshot (253K / 241 / 18K), the 4
      footnoted sources, and the "4.8/5 from 2,140 educators" trust line. Confirm with the
      district + research team. Voices (Dr. Vega, James Okafor, students) are placeholders.
- [ ] **CTA secondary** "Download the full report (PDF)" points to `/contact` as a stopgap —
      wire a real report PDF (or drop the secondary) before publish.
- [ ] **When a 2nd case study lands**: add a `/case-studies` index, repoint the `Header`
      "Case studies" nav link + the `[slug]` breadcrumb parent from `/newsroom` to it.

## Platform page (`/platform`) — Claude Design handoff (`platform-page-v2`)

Reskin of the ElevenLabs homepage as the Inner Explorer Platform page (Classroom ·
District · Home). New page-scoped folder `src/components/blocks/platform/`; global,
retunable additions to `global.css`; reuse-first throughout.

- [x] **Global (one-file, retunable)**: added practice-theme mesh gradients
      (`--mesh-forest|-nature|-dawn|-dusk|-water|-calm|-space`) + `.mesh-*`/`.grain`
      helpers, a categorical data-viz palette (`--viz-blue|-pink|-purple|-amber`), and
      `--insights-wash` to `global.css` (raw stops are fine — `.css` isn't drift-scanned).
- [x] **Nav**: added `Platform` (first item) to `Header.astro` `navLinks`; flows into the
      mobile menu. Added `ie-dev-platform` (port 4426) to `.claude/launch.json`.
- [x] **Reused**: `PageLayout` (flushTop) + `appearance-light` light-pin + `JsonLd`
      (WebPage), `Button`/`Heading`/`Text`, and the newsroom **`StoryCard`** (mesh covers)
      for "Latest updates". Page copy is typed structured data at the top of
      `src/pages/platform.astro` (blocks export their `Props` types).
- [x] **New blocks** (`blocks/platform/`): `PlatformHero` (two-column hero + showcase with
      3 swappable views — Classroom practice arc on one true pivot, District dashboard
      bento, Home TuneIn), `FeatureSection` (×3, data-driven) + `FeatureVisual` +
      `PhoneMock`, `PlatformTrio`, `TrustLogos`, `SignOn` (+ `providers.ts` for vendor
      logos), `ImpactStories`, `OutcomesExplorer`, `Safety`, `LatestUpdates`,
      `PlatformCTA`, plus shared `PlatformIcon` / `LinkArrow` / `SectionHead`.
- [x] **Verified**: `pnpm check` 0 errors (drift green); `pnpm build` clean (44 pages).
      `/platform` ships the shared ClientRouter + ~4KB of inlined vanilla `<script>` —
      **no React**. Browser (Claude Preview MCP) 1280 + 375: all 3 hero tabs, the 4
      research outcome tabs (count-up + before/after bars), the In-schools/In-research
      toggle, and the 6 CTA chips all work; content visible with the default tab/panel
      pre-rendered (no-JS safe). Dark mode: page stays light-pinned while the nav flips
      dark. Regression: homepage nav + render unchanged.
- [x] **Hero showcase — mobile redesign** (the showcase is a fixed-height panel, so each
      view needed a dedicated compact layout, not a clipped desktop one). At ≤880px the
      panel grows to 660px and: **Classroom** shows one primary card with two evenly-
      spaced peeks at the edges (≤600px); **District** becomes a clean compact dashboard —
      Mindful Minutes hero (all 5 segment rows) + Practice Sessions & Active Educators
      stat cards, dropping the dense User Adoption / Retention / Insights cards; **Home**
      stacks the TuneIn sync vertically (source card → connector → phone) so the
      class→home story stays the point. Added a **TuneIn sync animation** (flowing dashed
      connector + a pulse that travels class→home, horizontal on desktop / vertical on
      mobile, reduced-motion-safe) — pure CSS, no new JS. Verified 390px: zero horizontal
      overflow, nothing clipped; desktop unchanged.

### Stand-ins to swap before publishing (Platform)

- [ ] **All copy is illustrative** from the handoff — district logos (12 text names),
      customer quotes (Broward / Chicago / a Broward family), the dashboard numbers, the
      research outcomes + citations (+28% grades, −15% absences, −77% incidents, −43%
      educator stress), and the "Latest updates" posts. Confirm every stat/citation with
      the team before publishing.
- [ ] **SSO provider marks** (`providers.ts`) are clean recreations of Clever, Schoology,
      ClassLink, Google Classroom, Canvas, Gmail — swap for official logo assets.
- [ ] **Links**: feature CTAs → `/educators` and `/districts`; egress/quotes → `/newsroom`,
      `/research`; CTAs → `/contact`. `/educators` doesn't exist yet (already in Header).
      Confirm targets; "Explore the full platform" jumps to `#classroom`.

## Next (post-foundation)

- [ ] Confirm production `site` domain in `astro.config.mjs`.
- [ ] Build remaining pages: program, educators, pricing.
- [ ] Replace About + Research + Districts placeholder copy + Unsplash/About-stand-in photos with verified content and real IE imagery.
- [ ] Legacy migration: audit old URLs → populate `public/_redirects` (301s); import content.
- [ ] Add Vitest (Container API) + Playwright (+ `@axe-core/playwright`) and wire into CI.
- [ ] (Deferred) Lightweight custom CMS admin over the content collections.
- [ ] Connect repo to Claude Design workspace so handoff writes against these tokens/components.

## Webb School case study — transfer from innerexplorer.com/case-study4 (2026-06)

Goal: publish the real Webb School in the Valley story (65% fewer restraints &
seclusions) at `/case-studies/webb-school/`, reusing the Broward one-YAML-per-page
pattern, then run a comprehensive SEO workflow and apply improvements.

- [x] Schema: extend pillar icon enum; add optional `chart` section (caseStudies).
- [x] Types: mirror PillarIcon + chart interfaces in case-study/types.ts.
- [x] New block: ResultsChart.astro (accessible, token-only bar chart, zero JS).
- [x] Pillars.astro: 4-up grid support + 4 new icons.
- [x] [slug].astro: conditional chart render after ResultsBand.
- [x] Images: generate via Higgsfield (hero/challenge/approach/gallery ×6,
      2 portraits, newsroom cover); compress; save under assets.
- [x] Content: webb-school.yaml (real facts; representative fills flagged # REVIEW).
- [x] PDF: copy original → public/downloads/webb-school-case-study.pdf.
- [x] Newsroom: add Webb case-study story card.
- [x] Verify: preview screenshots (desktop+mobile), Broward unchanged, pnpm build
      meta/JSON-LD/sitemap inspection, pnpm check green.
- [x] SEO: Workflow audit (on-page, technical, structured data, E-E-A-T/GEO, SERP)
      → verify findings → apply (incl. per-page OG image threading) → re-verify.
- [x] Commit + PR to main (PR #15, merged).

## Staging noindex — keep \*.netlify.app out of Google (2026-06)

Goal: `innerexplorerwebsitev2.netlify.app` is indexed by Google (verified 2026-06 via
quoted searches), which would duplicate-cannibalize every production URL at domain
launch (flagged "must" by the Dwight Morrow SEO research workflow). Serve
`X-Robots-Tag: noindex` on every `*.netlify.app` host while guaranteeing the future
production custom domain never gets it.

- [x] **Why not `[[headers]]`**: netlify.toml headers apply per-deploy, to every host
      the deploy serves — the SAME production deploy will serve both the netlify.app
      host and the custom domain. Only the request's Host header differs.
- [x] **Edge function** `netlify/edge-functions/noindex-netlify-host.ts` (path `/*`,
      inline `config` export): sets `X-Robots-Tag: noindex` when the request Host ends
      in `.netlify.app` — covers the primary staging host, deploy previews
      (`deploy-preview-N--…`), and branch deploys, on every response incl. the
      indexable PDFs under `/downloads/`. Deny-list (vs allow-listing the prod domain,
      still TODO in astro.config.mjs) fails safe: production can never be noindexed by
      a wrong/changed domain, and launch needs zero config flips.
- [x] **robots.txt unchanged** (`Allow: /`) — deliberately. Google only sees a noindex
      on URLs it may crawl; a Disallow would freeze the stale staging URLs in the index.
- [x] **Verified**: handler unit-tested under Node (6 host cases: staging/preview/
      branch get the header; `www.innerexplorer.org`, apex, and `evilnetlify.app`
      suffix-trick don't); both branches re-proven in Netlify's local edge runtime
      (`netlify serve` + spoofed `Host:` — staging/preview hosts get `noindex`, the
      production host doesn't); `pnpm check` + `pnpm build` green (2 pre-existing
      hints only). Note: deploy-preview curls alone can't prove this — Netlify
      auto-noindexes previews (but NOT the production `*.netlify.app` host, which is
      the gap this fixes); PR #20's preview does show the edge-function transform
      signature (weak etag, dropped content-length).
- [ ] **Post-merge**: `curl -sI https://innerexplorerwebsitev2.netlify.app/` → expect
      `x-robots-tag: noindex`; spot-check `/case-studies/dwight-morrow/` too.
- [ ] **Post-merge — Google cleanup**: in Search Console, add a URL-prefix property for
      `https://innerexplorerwebsitev2.netlify.app/` and submit a site-wide **Removals →
      Temporarily remove** request (hides results ~6 months while the noindex header
      does the permanent de-indexing on recrawl). At launch, Netlify auto-301s the
      netlify.app subdomain to the primary custom domain, which finishes the job.

## Goddard Middle School case study — transfer from innerexplorer.com/case-study3 (2026-06)

Goal: publish the Goddard Middle School story (academic gains 3X the state in
ELA & math, 5X in science, 2016–2018; LG-funded) at
`/case-studies/goddard-middle-school/` via the transfer-case-study skill (this
session doubles as the skill's real-environment evaluation).

- [x] Extract: legacy HTML + 3-page PDF (pypdf — bundled regex extractor fails on
      CID fonts) + all three chart images read via vision; web/PDF header-swap
      discrepancy noted (PDF pairing is correct).
- [x] Decisions (user): representative copy + PUBLISH GATE; generate new imagery;
      extend schema with charts[]; slug goddard-middle-school.
- [x] Schema: additive optional `charts[]` (+ `valueSuffix` for %-bars) in
      content.config.ts, types.ts, ResultsChart, ResultsBand, [slug].astro.
- [x] Fix (shared, pre-existing): `.next-stat` fixed 30ch → `min(30ch, 100%)` —
      next-study card overflowed every case-study page at ≤345px viewports.
- [x] Content: goddard-middle-school.yaml (order 3; real facts; REVIEW/PUBLISH
      GATE comments on inferred dates, portraits, student voices, trust line).
- [x] PDF: copy original → public/downloads/goddard-middle-school-case-study.pdf.
- [x] Newsroom: add Goddard case-study story card (id 18).
- [x] Images: generated via Higgsfield (hero/challenge/approach/gallery ×6,
      2 portraits, newsroom cover); every image reviewed; installed ≤300KB.
- [x] SEO: content workflow ran (4 researchers → synthesize → 3 appliers →
      3 adversarial verifiers; 23/28 proposals accepted). Verified-entity wins:
      CMAS named (CDE archives), "Colorado Department of Education" corrected
      (the source's "Colorado State Department of Education" names no agency),
      Littleton Public Schools added (NCES), LG initiative named + linked, LG
      tense made period-bound, Title IV-A program name corrected (also fixed in
      seo-playbook.md). All new source URLs verified 200.
- [x] Verify: preview desktop/375/320 (no overflow), 3 charts + FAQ + voices
      render, existing pages unchanged vs baseline except CSS hash + the
      intentional next-card retarget, pnpm check green, dist meta/JSON-LD/
      sitemap audit passed (title 53ch, desc 154ch, 4 JSON-LD citations).
- [x] Commit + PR to main (PR #16, merged).

## John Marshall HS case study — transfer from innerexplorer.com/case-study5 (2026-06)

Goal: publish the John Marshall High School (Los Angeles) student-led teen mental
health story — 91% of students voted to continue daily practice; Wellness Advisory;
LG Six Sustainable Happiness Skills; +15%/+19% ELA/Math; LAUSD scale to 1,100
schools — at `/case-studies/john-marshall-hs/`, Webb-pattern (one YAML), then the
research-backed SEO workflow. Decisions (user, 2026-06-09): Webb-precedent fidelity
(PUBLISH GATE fills), generated imagery, stand-in portraits, slug `john-marshall-hs`.

- [x] Extract legacy page + PDF verbatim (web HTML, 2-page image PDF via vision,
      quote graphic); facts inventoried — no chart on legacy page (skip chart block;
      no year-series data exists, won't invent data points).
- [x] Baseline `pnpm build` dist snapshot → /tmp/baseline-dist (Broward + Webb must
      stay byte-identical except next-card retarget + CSS hash).
- [x] Placeholder images under final filenames (webb stand-ins).
- [x] Content: john-marshall-hs.yaml (order 4 after the Goddard merge; real
      quotes ×9, real stats; gates
      on representative fills). CASEL designation VERIFIED at pg.casel.org
      2026-06-09: "Designated SEL-Supportive Program" (resolves the seo-playbook
      open follow-up; legacy "CASEL-approved" not carried forward).
- [x] PDF: copy original → public/downloads/john-marshall-hs-case-study.pdf.
- [x] Newsroom: story card id 19 (renumbered after the Goddard merge took 18).
- [x] Imagery: Higgsfield per inner-explorer-covers conventions — 13 generations
      (~91 credits), every image vision-reviewed; 2 REJECTED for invented school
      names on banners ("DUNBAR", "WESTLAKE HIGH") and regenerated with
      no-lettering constraints; 11 installed at 1600px JPEG (245–316KB) +
      newsroom cover.
- [x] SEO: 11-agent Workflow (4 researchers → synthesis → 3 appliers → 3
      adversarial verifiers; ~1.1M tokens). 45/49 proposals accepted and applied;
      4 rejected (duplicate-quote filler, redundant title stat, NPR parenthetical
      variant). Main-context referee calls: dropped both quote-wrapping schema
      extensions (duplicate quotes = QRG filler; 91% already quote-wrapped by the
      Kelly card) and omitted the bare "2021" everywhere (year unverifiable —
      LAUSD flyer WAF-blocked). Keyword map + page rules added to
      tasks/seo-playbook.md.
- [x] Verify: preview desktop+mobile (no overflow), page links resolve (global
      header/footer 404s pre-existing), baseline diff clean (Broward
      byte-identical; Webb = next-card retarget only; research = nondeterministic
      SVG gradient id), pnpm check green, build green, dist inspection (title 58,
      desc 152, OG = hero crop, Article JSON-LD with 4 citations, sitemap entry,
      canonical stat sentence, stale claims absent), new imagery confirmed in
      build (content-hashed assets) + cache-busted preview fetch.
- [x] Commit + PR to main (PR #19).

  Review: page live at /case-studies/john-marshall-hs/. PUBLISH GATES for launch
  review: partnerSince '2017' (representative), 2017–18 pilot dates (derived),
  two stand-in portraits (Kelly, Roeder). Follow-ups in tasks/seo-playbook.md
  (audio excerpt, 301s at migration, LAUSD signup year if source found).
  Merge with main (Goddard, PR #16): JM renumbered to order 4 + newsroom id 19
  (both collided at order 3 / id 18); next-card chain is now Broward → Webb →
  Goddard → John Marshall → Broward.

## 2026-06-10 — Mindful Michigan case study transfer (case-study7)

### Source-fact inventory (the ONLY claims the page may make)

Sources: innerexplorer.com/case-study7.html (web) + images/Mindful-Michigan-Model.pdf
(11pp, CID fonts — extracted via pypdf) + 10 page images (read via vision).
Legacy genre note: this is a FUNDER REPORT (first-person, addressed to the Fetzer
Institute, with fundraising asks). The new page reframes as a case study; all
fundraising asks (GreenLight/Georgia/NC pipeline, "grateful for Fetzer's help")
are dropped, facts retained.

**Reach (grant's first two years):** 202 and 146 schools/centers respectively;
~58,000 students and their families; 2,300 educators. Settings: school districts,
charter networks, foster care group homes, OST providers, park districts, juvenile
detention centers, families.

**The Mindful Michigan Model** (hexagon diagram, Image1): first-of-its-kind
state-wide model for a mindful theory of system change. Six components:

1. Foundational Daily Mindful Practice — 180 days of sequenced 10-min audio-guided
   practice; transition-responsive practices; promotes wellbeing, academic
   achievement, school safety.
2. Inspired Innovation — Riverfront Reflections, Extreme Makeover Mindful Edition,
   Experiential Roundtables.
3. Data Driven Research — evidence-based, real-time data for decision making.
4. Inter-generational Approach — links home and school for family engagement.
5. Collaboration and Collective Impact — public/private partnerships for leaders.
6. Intentional Equity and Inclusion — juvenile justice, early learning, OST, foster
   care, children's hospitals; English and Spanish.
   Theory: "stress blocks thinking, learning, and relating"; "address biology before
   behavior" — reduce stress effects before expecting responsive expression.

**Academic impact (program-reported analysis of public state-wide records;
2021-22 → 2022-23; IE schools vs demographic peer schools):**

- Proficiency: Top IE schools 20.15 → 24.13 (+19.71%); non-IE peers 29.96 → 29.97
  (+0.01%). IE schools were underperforming peers before adoption.
- Attendance: Top IE schools 45.51 → 53.75 (+18.11%); non-IE 54.24 → 63.18
  (+16.47%). Web page headline framing: "19.7% higher academic achievement and a
  1.64% improvement in attendance compared to peer schools" (1.64 = 18.11−16.47;
  PRESENT HONESTLY as growth-vs-growth, units of the index are not defined in
  source — treat values as reported index/percentage).
- Researcher could not get school-level data by student/classroom (stated).
- Appendix: data reviews with Southfield, Wayne Metro, ACCESS, NHA; spring pre/post
  evaluation of Southfield/ACCESS/Wayne Metro "working with MSU to finalize".

**Fortis Academy (Ypsilanti) / NHA:** NHA = 100-school charter network, 50 in MI.
Fortis = first NHA school on IE; high users in 2021-22 + 2022-23; >30% improvement
in proficiency across the two years (cumulative gains); Mindful March Madness;
school-wide adoption; "zero behavior issues" (program-reported); other NHA schools
followed and embedded IE in their budgets.

**Southfield Public Schools (model district):** first in the nation to REQUIRE
daily mindful practice with IE for students AND staff (administration, bus
drivers, janitors, office/secretaries) — program-reported claim. Leadership:
Paula Lightsey. Training partners: MC4ME, Breathe for Change (10 leaders),
Millennium Forum (16 new leaders, started January) — nearly 200 educators reached.
Usage rose 800% in the past year. 14 schools, 5,000+ students, 98% minority
enrollment; initially bottom 50% — 20% math, 36% reading proficiency (source:
NCES / MI Dept of Education). District invested in a 3-year subscription.
Multi-year evaluation in process. Alder Elementary won the district Winter
Challenge — entire staff practicing daily, 300% engagement increase sustained.

**Community deepening:** three state-wide roundtable convenings (1st: 8 education
leaders, "Insights Into Our Why", Mon Nov 14 [2022]; 2nd: "Connecting Moments to
Movements", Feb 27, 40+ leaders, co-sponsored w/ Fetzer Institute, Student
Advocacy Center, Southfield; 3rd: IN-SPIRE Story Quest showcase, May 15 2023,
35+ leaders). IN-SPIRE Story Quest: 40+ applicants (students + educators).
A youth opened the COSEM Conference; new elementary series features youth-led
practices. Conference presence: Student Mental Health Summit (Lansing), Michigan
Afterschool Association (with ACCESS), MIPTA.

**Policy & advocacy (verify all in workflow):** CDC issued six recommendations for
school administrators on youth mental health — daily mindfulness practice #2
(ahead of SEL), mindfulness training for teachers #6 [= CDC 2023 action guide
"Promoting Mental Health and Well-Being in Schools"]. US Surgeon General promotes
mindfulness for well-being/loneliness. US Dept of Ed (ERIC ED606075 linked) and
AAP recommend mindfulness. NPR (2024-01-26, health-shots/1227056527) highlighted
IE; legacy page says Patricia Sullivan Elementary profiled w/ results: >80%
unhoused, Title 1, F → A using IE daily [Image5: "every day since 2017", closed
achievement gap, ZERO suspensions past 3 years; charts vs Hillsborough/FL/national
2017-2022 — VERIFY school vs NPR story]. Head Start best-practice profile
(secondwavemedia.com 2024-03-07). UPenn Center for High Impact Philanthropy
included IE in 2024 High Impact Giving Toolkit (impact.upenn.edu linked).

**Funders/partners (logos on legacy page):** Fetzer Institute (fetzer.org), Hemera
Foundation (hemera.org), MC4ME (mc4me.org), Millennium Forum, Skillman Foundation
(skillman.org). PDF: did not raise expected funds from MI-based foundations;
raised from national donors/foundations + schools paying directly.

**New sites (year 2):** Dickerson + Children's Village juvenile justice centers;
We Care Foster Care; 6 new Wayne Metro OST sites; 6 new ACCESS sites; new
schools/districts incl. Wayne Westland CSD (10), Freeland CSD (2), South Pointe
Scholars, Endeavor Charter Academy, Tylor Exemplary Academy, Poineer [sic] Middle
School, Great Lakes Learning Academy, Angell Elementary, L'Anse Creuse HS, Dwight
Rich School of the Arts, North Muskegon HS, West Middle School (Grand Blanc),
Monroe YMCA, Kent ISD, Cornerstone Charter, UM Children's Hospital.

**Real quotes (named, public award context — NO invented voices needed):**

- Gabrielle Gross, Southfield Adler student, 1st Place In-Spire Story Champion:
  "When I know that I need mindfulness is when I have mixed feelings, feeling mad,
  sad, angry, uncomfortable, you can use mindfulness for all of these situations.
  If I were you and had a problem, the best place to go is to Inner Explorer."
- Elaine Sandouno, Fortis student, 2nd Place: "After doing these mindful practices
  for about a month and a half straight (still counting), It has helped me to feel
  physically strong and emotionally replenished."
- Israa Abella, Fortis student, 3rd Place: "Whenever I feel tired or in a bad mood,
  I make sure to practice taking deep breaths to calm myself down and let myself
  have enough time to make decisions. Inner Explorer has given me chances to avoid
  conflicts and has helped me in a positive way."
- Marc Zendejas, Educator: "While reading my students' Inner Explorer essays, I was
  blown away by some of their insights. Inner Explorer has not only helped me to
  have more compassion for myself, but to be more compassionate to those around me:
  my students, coworkers, friends, and family."
- Pamela Mckenzie, Behavior Interventionist: "The best tool in my toolbox is
  mindfulness. Inner Explorer helps our school find a calmness in the present
  moment and connects us to each other."
- Kindergartener at Detroit Leadership Academy: "I am grateful for all the people
  in the world."
- Karen Burns, Kindergarten Teacher, Detroit Leadership Academy — poem "Mindful
  Mission" (full text in PDF p.11).

**Web vs PDF discrepancies:** none material — web page is a superset (adds the
funders strip + table layout); PDF adds appendix detail (Southfield 1-2-3 case,
new-sites lists, quotes pages). Image10 ("Top 20 Districts Playback Comparison of
LSY") is platform-wide, non-Michigan data — EXCLUDE (district names are LA,
Chula Vista, Racine… not MI).

**Slot claims:** order: 8 — initially 7, renumbered pre-push because open PR #21 (La Joya ISD, parallel session) claims 7 (1-6 taken after merging origin/main — dwight-morrow
landed order 6); newsroom card id: 23 — initially 22, renumbered (PR #21 claims 22; 21 taken). Slug: mindful-michigan.
Legacy URLs for 301 at migration: /case-study7.html + /images/Mindful-Michigan-Model.pdf.

### Build checklist

- [x] Step 2: user decisions — real content only (no trust block, no invented
      voices), generate imagery, stand-in portraits + PUBLISH GATE for the two
      educators, slug mindful-michigan
- [x] YAML + placeholder images under final filenames (order 7; baseline dist
      snapshotted to /tmp/cs7/dist-baseline BEFORE first edit)
- [x] Newsroom card (id 22) + PDF to public/downloads/mindful-michigan-case-study.pdf
- [x] Imagery via inner-explorer-covers conventions — 12 generations (GPT Image
      2, ~84 credits), every image vision-reviewed (posture/lettering/modern
      rooms; bulletin-board lettering came out correctly spelled), 11 installed
      at 1600px q78 (<300KB each) + newsroom hero copy; 105 spare unused;
      provenance manifest /tmp/cs7/imagery/batch_log.csv
- [x] SEO workflow (wf_db01eb4e-613: 12 agents, ~1.27M tokens — 5 researchers
      incl. a dedicated fact-verification angle, synthesis, 3 appliers, 3
      adversarial verifiers). 35 proposals → 33 accepted / 2 rejected (HTML link
      in plain-text body; stat-in-title date mismatch). Cross-scope merges
      refereed in main context: CDC paragraph (structure-gaps version), 2024
      timeline ("one of nine featured nonprofits"), attendance foot (merged),
      methodology disclosure deduped into sources[0] only.
- [x] Fact-check fixes from the workflow: NPR never says "proven" (reframed);
      Second Wave article retitled + re-domained (now Common Ground —
      fromcommonground.com); Southfield size time-anchored ("then 14 schools");
      Paula Lightsey named; chart index-scale caveats; 3 new sources (MDE .gov,
      Ha et al. 2025 RER via doi.org, Cipriano 2023 via doi.org); 2 new FAQ
      items (academic-evidence with association framing; funding streams:
      Title IV-A, MI 31n/31aa, MiLEAP 32n); Surgeon General claim stays dropped;
      Patricia Sullivan stays off-page.
- [x] Verify: 6 existing case-study pages byte-identical to baseline
      (dwight-morrow differs only by expected next-card retarget; hub/newsroom
      by the new card); pnpm check green; build green; dist inspection — title
      59 chars, desc 153, OG = hero 1200×630 crop, Article JSON-LD with 7
      citations, sitemap entry, canonical stat sentence in prose, 7 FAQ
      <details>, Tier 1 exactly once, "proven" absent, JS parity with existing
      pages; no overflow at 1280/375/320; dist hero asset byte-matches the
      generated image (preview showed stale pixels — known dev /\_image cache).
- [x] Commit + PR

  Review: page live at /case-studies/mindful-michigan/ (order 8, newsroom id 23 — renumbered pre-push; open PR #21 La Joya claims 7/22).
  PUBLISH GATES for launch review: two stand-in portraits (Zendejas, Mckenzie).
  Open follow-ups in tasks/seo-playbook.md (301s at migration incl. the PDF and
  lms. variants; real grant-year anchors if the team can produce them; staging
  noindex handled by the separate open PR).

## 2026-06-10 — La Joya ISD case study transfer (legacy /case-study6)

Scope settled with user: La Joya ISD only (Dwight Morrow already live via PR #17;
Mindful Michigan deliberately skipped — its source is a first-person Fetzer
funder report). Webb-precedent fidelity (PUBLISH GATE fills), Higgsfield imagery
now, slug `la-joya-isd`, order 7, newsroom id 22.

### Facts ledger (the ONLY claims the page may make)

Entities: La Joya Independent School District (La Joya, Texas); Cynthia Salgado,
behavior specialist; Judith Lopez Guerra, special education teacher (practices
in English AND Spanish); Angelika Loraine Garza, school counselor; Dr. Laura
Bakosh, Inner Explorer co-founder, coined MBSEL; Inner Explorer @HOME app +
TuneIn feature; Educator Well-Being Series.

Story facts: mental health concerns rising nationally; pandemic learning-gap
pressure. La Joya staff use MBSEL via Inner Explorer as a PREVENTATIVE solution.
Salgado (paraphrase, no verbatim quote): students looking for help — shows up as
stress/anxiety, anger/frustration, breaking down emotionally. Bakosh coined
MBSEL after establishing daily practice supports the 5 CASEL competencies
(self-awareness, self-management, social awareness, relationship skills,
responsible decision-making). PFC framing: traditional SEL activates the
prefrontal cortex, but a stressed brain can't access what it cognitively knows
or absorb new information; MBSEL targets stress first. Special-ed students'
challenges amplified — hard to express feelings/advocate. Judith + co-teachers
noticed remarkable behavior difference — drastic decrease in REPORTED behavioral
issues. Best practices: set time 2×/day (morning + end of day); dim lights;
practice alongside students (removes stigma; teachers who practice report
improved well-being + 43% less stress — VERIFY source in workflow); extra
sessions on demand mid-lesson; reflection time + corner display board
(drawings/journal entries, opt-in); @HOME app + TuneIn for families.

Quotes (verbatim, prefer PDF):

- Garza: "If students are not mentally and emotionally there, they are not
  going to learn." — Angelika Loraine Garza, School Counselor
- Judith #1: "Students who were once extremely shy learn to ask for what they
  need. It's not that their voice wasn't there before, it's that they didn't
  know how to find it. Mindfulness helps the students get in touch with who
  they are."
- Judith #2 (green band): "We have math and we have science, but we also have
  Inner Explorer. Through MBSEL, students can get in touch with how they are
  feeling; as a teacher, I want them to know that what they are feeling matters
  because it impacts everything else that they do."
- Judith #3: "If we are in the middle of a math lesson and they become
  overwhelmed and can't focus, I will offer to do a session right then and
  there – or the students will ask me to play an Inner Explorer practice."
- Judith #4 (closing): "Eventually, my students will move on to a new
  classroom, a new school, and a career. The tools they learn through MBSEL are
  tools they can take with them for their entire lives." (intro: Judith views
  MBSEL initiatives as critical lifelong skills for her students)

DISCREPANCY (source-internal): the 85%-reduction box (pg 1 / web box 1) and an
identical 80% box (pg 2 / web box 2) — "Reduction in behavior issues in special
education classrooms through practicing daily mindfulness with Inner Explorer."
Decision: feature 85% (primary placement, adjacent to the narrative claim in
both sources) with PUBLISH GATE documenting the 80% variant for owner sign-off.

No dates anywhere in source (masked photos → COVID era; legacy index card
comment says April 05, 2022). Timeline uses stage labels (Dwight Morrow
pattern), no invented years. No funding/cost facts. No real student quotes.
Photos show upper-elementary/middle-school-age students.

### Plan

- [x] Placeholder images under final filenames; PDF → public/downloads/
- [x] la-joya-isd.yaml (order 7) + newsroom card id 22
- [x] Imagery: Higgsfield per inner-explorer-covers conventions — 12 generations
      (~112 credits), every image vision-reviewed, 1 NSFW false-positive
      reworded and cleared; 11 installed at 1600px JPEG (229–299KB) + newsroom
      cover.
- [x] SEO Workflow: 11 agents (~1.0M tokens) — 4 researchers → synthesis (25
      rules, 10 fact verdicts) → 3 appliers → 3 adversarial verifiers. 32/36
      proposals accepted and applied (4 rejected: redundant heading swap,
      "emergent bilingual" overreach, weaker pillar reword, demographics with
      misattributed year). Key verified findings: TEA intervention →
      classroom-scoped framing everywhere; 43% stat is vendor-provenance →
      demoted to pillar with attribution; @HOME/TuneIn → HOME / Tune In; CEIS
      funding-law fix; 4 new linked sources incl. first-party La Joya video.
- [x] Verify: preview desktop + 345px (no overflow), all 11 images cache-busted
      200, canonical sentence ×2, 80% absent, baseline diff clean (only
      dwight-morrow next-card retarget), pnpm check green, build green, dist
      inspection (title 59, desc 152, OG hero, Article JSON-LD 7 citations,
      sitemap, ~14KB JS).
- [x] Commit + PR #21 (collision check at push: order 7 / id 22 free; the
      Michigan parallel session had not pushed yet)

  Review: page live at /case-studies/la-joya-isd/. PUBLISH GATES for launch
  review: 85% vs 80% source discrepancy (85% featured), two stand-in portraits
  (Lopez Guerra, Garza), 43% canonical source, representative timeline stage
  labels. A parallel session (worktree xenodochial-knuth) appears to be building
  Mindful Michigan — expect order/newsroom-id merge races.

## 2026-06-10 — Series page template (Claude Design handoff: series-page-v2)

Implement `Series Page.html` — a CMS-driven series template (splash masthead +
immersive hero + 9 content sections), launched with 4 series: Educator Well-Being,
School Safety, Counselor, Summer. Final design per the handoff chats: splash =
concept A single-line lockup; hero = immersive wide split stage (copy left over
tone gradient blending into photo right, audio chip, glance bar below, no eyebrow
badge, vertically centered). The prototype's nav series-switcher + Tweaks panel
are design-tool demo artifacts — the production equivalent is real per-series
URLs + related-series cards.

Architecture = the established case-study template pattern: content collection +
dynamic route + shared data-driven blocks.

### Plan

- [x] Tokens (`global.css`): series tone presets (`[data-series-tone]` →
      `--series-accent/-deep/-tint-a/-tint-b`; sage=brand, teal, slate, gold) +
      Inter 800/900 @font-face (stat figures / hero headline weights).
- [x] Button: add `tone="light"` variants (solid white + glass outline) for
      on-photo CTAs — per the system's "on-photo button is a variant" rule.
- [x] Collection: `series` in `content.config.ts` (schema mirrors the prototype's
      `series-data.js` shape; icons as enum; images via `image()`).
- [x] Images: localized the 15 unique Unsplash stand-ins →
      `src/assets/images/series/` (flagged below for replacement).
- [x] Content: 4 YAML files in `src/content/series/` (CTAs → /contact, /districts).
- [x] Blocks (`src/components/blocks/series/`, all data-driven): SeriesIcon ·
      SeriesMasthead · SeriesHero (LCP — no reveal) · GlanceBar · SeriesSectionHead ·
      IconCards (grid|split = audience/benefits) · StatsBand · PracticeGrid ·
      HowSteps · SamplePractice (simulated player, vanilla JS) · SeriesTestimonial ·
      RelatedSeries (tone-aware cards → sibling URLs) · SeriesCTA.
- [x] Page: `src/pages/series/[slug].astro` — `appearance-light` +
      `data-series-tone`, scroll-reveal via `lib/intersect` (below-fold only),
      OG image from hero, breadcrumb JSON-LD.
- [x] Verify: `pnpm check` + `pnpm build` + ~0KB page JS + preview (desktop/
      mobile, dark chrome, no-JS content visible) + regress home/about.

### Follow-ups / flags

- [ ] Imagery is Unsplash placeholder photography (per handoff) — swap for real
      Inner Explorer photos before publish (one `image:` per slot in the YAML).
- [ ] Stats copy (43% / 28% / 60%, CDC/CASEL footnotes) from IE public materials —
      fact-check exact figures before publish.
- [ ] Sample player is a simulated demo (no real audio asset exists yet). Wire a
      real `audioSrc` + captions when audio is available.
- [ ] Practice cards are non-interactive (prototype had no real action); link them
      into the platform when destinations exist.
- [ ] No `/series/` index page (not in this design) — nav/footer linking TBD.

  Review: live at /series/educator-wellbeing|school-safety|counselor|summer.
  Hero CTAs use Button size="md" (lg labels overflow the designed 55% column —
  measured 538px vs 497px available). Reveal/IO appear frozen in the hidden
  preview tab (known env artifact; mechanism proven by class toggle with
  transitions disabled; same lib/intersect pattern as shipped case studies).
  Verified: pnpm check + build green (57 pages), drift guard clean, 1 h1/page,
  ~14KB page JS (shared ClientRouter; player ~1.2KB inline; zero React), tones
  resolve per page AND per related-card, mobile 375px no overflow, dark chrome
  with light-pinned page, no-JS content visible (reveal gated on data-js-ready),
  home/about/platform/districts/webb-school regression-clean. Not committed
  (commit/PR not requested).

## 2026-06-17 — Blog "Article — long-form" detail template (Claude Design handoff)

Rebuilt `src/pages/blog/[...slug].astro` as the Article variant from the Blog
Variants Canvas handoff. CMS seam = **MDX**; in-article modules injected via
`<Content components={…}>` so authors write `<Figure>`, `<StatRow>`,
`<ResourceCard>`, `<AudioPractice>`, `<PullQuote>` with no imports. Decisions:
no personal byline (author = Inner Explorer Org in JSON-LD), left outline only
(sticky TOC + share), footer = GlowCTA + RelatedPosts + NewsletterSignup,
dark-adaptive via tokens.

### Reuse ledger

- **Reused:** `Breadcrumb`, `GlowCTA` (footer CTA).
- **Extended (global):** `Prose` (`variant="article"` → `.prose-article` in
  global.css), `StatStrip` (`numStyle="sans"` + rAF-throttle fallback),
  `VoiceBar` (`tone="dark"` + `inset`).
- **New shared blocks:** `Figure`, `PullQuote`, `ResourceCard`,
  `NewsletterSignup`, `RelatedPosts`.
- **New blog blocks:** `blog/ArticleHeader`, `blog/ArticleToc` (scrollspy),
  `blog/ShareRail`, `blog/ReadingProgress`, plus thin MDX wrappers
  `blog/ArticleStats` + `blog/AudioPractice`.
- Schema (`content.config.ts`): added optional `titleHtml`, `category`,
  `heroImageAlt`, `heroCaption`, `readingTime` (else computed via
  `lib/reading-time.ts`). Existing `.md` posts degrade gracefully (verified).

### Verified

`pnpm check` + `pnpm build` clean (54 pages). Browser: hero/duet headline,
sticky TOC scrollspy, drop cap, pull quote, stat count-up (settles to 4.2×/81%/
3 min), figure, resource card, dark audio bar, footer modules — light **and**
dark, responsive ≤920 (single column, 2-up stats), content + TOC anchors render
with JS off. Article ships ~13 KB vanilla JS, **no React**.

### Stand-ins to replace before publishing

- Sample post `morning-calm-twelve-thousand-classrooms.mdx`: copy + figures are
  illustrative; hero/figure photos are **Unsplash stand-ins**
  (`src/assets/images/blog/`).
- `<AudioPractice>` points at `/audio/narrators/maya-hello.mp3` (placeholder) —
  swap for the real practice clip; add a WebVTT `captionsSrc` + transcript.
- `<ResourceCard href="#">` and the newsletter form are **not wired** to a
  backend yet.
- Resource / Announcement / PR content-type variants from the canvas are **not**
  built (Article only); `ResourceCard` + schema leave room to add them.

## 2026-06-30 — Help Center documentation hub (Claude Design handoff)

Implemented `Help Center.dc.html` as a real docs hub on the token system.

- **New routes:** `/help` (index) + `/help/<slug>` (11 articles). Renders within site
  chrome (`PageLayout` + light-pinned `.appearance-light`) as a 3-column docs layout:
  sticky left article-nav sidebar + content + sticky right "On this page" TOC.
- **Content:** `help` content collection (`src/content/help/*.mdx`, 11 files across 4
  audience groups). Nav model + ordering in `src/lib/help.ts`.
- **Components** (`src/components/blocks/help/`): `HelpShell` (sidebar + search +
  support card + rails), `Callout`, `Steps`/`Step`, `CardGrid`/`Card`, `LinkCards`,
  `Accordion`, `HelpFigure`, `HelpActions` (Save-as-PDF/Print), `PrevNext`. Reused +
  extended `blog/ArticleToc` (`numbered` prop), `Breadcrumb`, `Button`,
  `lib/reading-time`, `lib/schema` (+ `faqPageSchema`). Added `.prose-help` to global.css.
- **Search:** vanilla, client-side; filters sidebar nav + home cards, mirrors the two
  inputs, shows an empty state. ~0KB framework JS (no React).
- **`/support` → `/faq`:** page moved + retitled; 301 via netlify.toml + Astro
  `redirects`; FAQ cross-links the Help Center; Footer + Header (added "Help") updated.
- **Verified:** `pnpm check` + `pnpm build` clean; browser (light/dark, desktop/mobile,
  search, TOC scrollspy, accordions, prev/next, redirect) all pass; blog TOC un-regressed.

### Follow-ups

- **Replace `HelpFigure` placeholders with real product screenshots** before publishing
  (sign-in screen, player, dashboard, schools view, classroom photos, etc.). They render
  as labelled placeholders today; `HelpFigure` accepts a real `src` image when ready.
- [x] **Support contact confirmed 2026-08-25: `support@innerexplorer.com`.** Now a single
      field (`chrome.supportEmail` in src/data/help-ui.json); was split across two that
      had drifted to different domains. (Originally: used in the sidebar
      card + home banner).
- **FAQPage schema on help articles — deliberately skipped.** Help articles emit
  `TechArticle` + `BreadcrumbList`; the canonical `FAQPage` rich result stays on `/faq`.
  Emitting `FAQPage` for `family-faq` would mean duplicating its Accordion Q&A into
  frontmatter (drift risk), so it was left out. Easy to add via a frontmatter `faqs`
  array + `faqPageSchema` if the SEO value is wanted.
- **Optional:** dark-mode support for the Help Center (tokens make it nearly free if the
  `.appearance-light` pin is dropped). Light-pinned today to match the design.
- Pre-existing dead nav/footer links (`/educators`, `/pricing`, `/app`,
  `/donate`, `/signin`, `/newsletter`, …) remain out of scope.

## 2026-07-02 — Help Center print / "Save as PDF" overhaul

- [x] New `src/components/blocks/help/HelpPrint.astro` — owns ALL print behavior for
      `/help/<slug>` in one place: print-only masthead (wordmark · section · URL ·
      printed date), the full `@media print` stylesheet, and a `beforeprint`/`afterprint`
      script that force-opens `<Accordion>` items (plus a `::details-content` CSS
      fallback for headless print paths).
- [x] `[slug].astro`: renders `<HelpPrint>` first in the article; old ad-hoc global
      print `<style>` removed (superseded).

**Review.** Root causes fixed: no `@page` (random margins) → `16mm/14mm`; vw-fluid H1
printed at paper-relative size → fixed `24pt` doc scale (body `11pt`); backgrounds
stripped → `print-color-adjust: exact` + white sheet (`.appearance-light` had to be
whitened too — it paints the gray surface); blocks split across pages → `break-inside:
avoid` + `break-after: avoid` on headings + orphans/widows; collapsed accordion answers
dropped → forced open around print; screen-only UI (buttons, prev/next, crumb, eyebrow,
accordion icons, figure _placeholders_) hidden. Verified by generating real PDFs via
headless Chrome (`family-faq`, `first-practice`) and reading them; screen layout
unchanged; `pnpm check` green.

### Follow-up (same day): page-fill density pass

User feedback: content stranded slivers on mostly-blank pages. Fixes, all inside
`HelpPrint.astro`'s print block: document density (10pt/1.45 body, tighter h2/module
margins, 14mm page margins); flex/grid module containers (`Accordion`, `Steps`,
`CardGrid`, `LinkCards`) print as blocks so Chrome can break _between_ items instead of
bumping whole groups; module text normalized to the document scale; prose `Button` pills
pinned to a finite radius (TW `rounded-full` = infinity px, mis-painted by the PDF
backend). Result: 7 of 11 guides fit one page; the rest fill page 1 completely.

## 2026-07-14 — CloudCannon CMS migration

Goal: migrate the existing static Astro site to CloudCannon using the installed
`migrating-to-cloudcannon` skill, preserving the token/component system, static
output, Git history, and Netlify deployment pipeline.

- [x] Phase 1 — audit SSG, collections, routes, components, images, and build pipeline.
- [x] Phase 1 — classify every non-collection page and record migration sizing.
- [x] Phase 2 — generate and validate `cloudcannon.config.yml` for every collection/data source.
- [x] Phase 2 — configure friendly MDX snippets for every blog/help content component.
- [x] Phase 3 — move editorial collection/shared-UI copy and media references into CMS-safe structures.
- [x] Phase 4 — install and wire CloudCannon editable regions across representative page types.
- [x] Phase 5 — run `pnpm check`, `pnpm build`, and inspect generated output.
- [ ] Follow-on — convert the bespoke static marketing routes to a registered `pages` page builder.
- [x] Review exact Git scope, commit intentionally, and push `main` for CloudCannon sync.

### Review

- Installed the requested CloudCannon skill set and followed the Astro migration,
  configuration, snippets, and visual-editing runbooks. The CMS now owns all six
  existing collections plus shared navigation/footer data; article MDX is import-free
  and backed by twelve structured snippets.
- Visual editing is live for shared chrome and the high-priority blog/Help workflows:
  sentence edits, article metadata, hero-image replacement, and structured MDX body
  changes. Complex structured collections are fully editable in the sidebar.
- Local gates are green: CloudCannon config validation, `pnpm check`, clean production
  build (71 pages / 843 image variants), generated-region inspection, and browser
  smoke tests with zero console warnings or layout overflow.
- The unique marketing pages are intentionally documented as a page-builder follow-on;
  no fragile source-editable or shared-passcode shortcut was introduced.

### Live CloudCannon activation recovery

- [x] Authenticate the CloudCannon CLI against the Inner Explorer organization.
- [x] Confirm the existing Site had an empty build configuration and builds were locked.
- [x] Configure Astro, Node from `.nvmrc`, frozen pnpm install, `pnpm build`, and `dist`.
- [x] Unlock builds and trigger the CloudCannon hosted pipeline.
- [x] Verify both queued builds succeeded and the Visual Editor renders a real blog page.

**Review.** CloudCannon Site `inner-explorer-website-v2` now builds successfully on
Node 24 with pnpm 11. The testing domain renders the full homepage without browser
errors, and the MTSS article loads inside the Visual Editor instead of showing “Site
not built.”

### Full Visual Editor verification

- [x] Inventory every generated route and every collection entry with a preview URL.
- [x] Verify all 72 generated HTML routes return real rendered pages on the testing domain.
- [x] Reproduce and diagnose the shared `site-header` Visual Editor render failure.
- [x] Deploy the renderer-safe header and styled-headline fixes to CloudCannon.
- [x] Verify all 57 collection entries render without red component/region errors.
- [x] Verify all 72 hosted pages and all 844 emitted asset/media references.
- [x] Record the final route-by-route and entry-by-entry audit evidence.

**Review.** Final CloudCannon build `22054526` succeeded. All 57 output-producing
collection entries were opened in the live Visual Editor: 57 passed, 0 failed, and no
component, editable-region, missing-preview, or “Site not built” cards remain. All 72
generated routes also return rendered HTML from the testing domain, and the production
manifest contains every referenced asset/media file. Full evidence is in
`.cloudcannon/migration/full-verification-2026-07-14.md`.

## Help Center privacy policy page (2026-08-07)

Goal: publish the copy from the Google Doc `Inner_Explorer_Privacy_Policy_UPDATED_DRAFT_2026`
(effective August 6, 2026) as a Help Center article.

- [x] Add a `policies` help group (`lib/help.ts` + `help-collection.ts` enum + CloudCannon
      `_select_data.help_groups`) so reference documents sit outside the audience sections.
- [x] Add `blocks/help/HelpTable.astro` — `.prose-help` had no table treatment, and the
      policy has two. Token-driven, `overflow-x` scroll region, registered in the shared
      AutoImport list + a `help_table` CloudCannon snippet.
- [x] `src/content/help/privacy-policy.mdx` — full policy, 18 `##` sections, the "we do not
      collect student information" box as a `Callout`, both source tables as `HelpTable`.
- [x] Verified: `pnpm check` 0 errors/0 warnings, drift check passed, `pnpm build:help`
      emits `/privacy-policy/`; page renders with the Policies sidebar group, an 18-item
      TOC, both real `<table>` elements; at 375px the wide table scrolls inside its own
      container with no sideways page scroll.

**Review.** Copy is verbatim from the source doc apart from three deliberate changes:
the two em dashes were rewritten as sentence breaks / commas per house style, and the
explicit enumerations (use purposes, access/correction/deletion rights) render as lists
instead of semicolon runs. Open question left for Juliana: the callout keeps the doc's
legal phrase "educator-led, whole-classroom program", which reads against the house rule
that the audio guide leads the practice — flagged rather than silently reworded, since it
is the legal characterization of who operates the product.

## Pricing page — port of legacy /compare_program (2026-08-25)

Goal: replicate `innerexplorer.com/compare_program` as `/pricing` in the new design
system. The footer already linked `/pricing`, so this fills a dead route.

- [x] Scrape the legacy static page and extract all 47 feature rows + 3 plans verbatim
- [x] `blocks/pricing/PlanCards.astro` — three-up plan cards (price, unit, blurb, CTA)
- [x] `blocks/pricing/PricingTable.astro` — grouped feature comparison, zero JS
- [x] `src/pages/pricing.astro` — content as structured data (CMS-ready seam) + Product JSON-LD
- [x] `.claude/launch.json` — `ie-dev-pricing` on port 4483
- [x] `pnpm check` clean; production build ships 0 page-specific JS

### Review

Content fidelity: all 3 plans, 4 groups, 47 rows, and the 3 CTA hrefs carried over
exactly. Two things from the source were intentionally dropped: placeholder junk copy
("testing testing testing testing" inside two plan descriptions) and a duplicated
stray "SUPPORT & RESOURCES" table fragment at the end of the legacy markup. Row labels
were re-cased from Title Case to the site's sentence case; wording is unchanged.

Judgment call to confirm with marketing: the **Community** column is the highlighted
anchor (middle card, brand tint, solid CTA). The legacy page highlights nothing. No
"most popular" badge was invented — the emphasis is purely visual.

Gotcha worth remembering: the first build used a viewport-sticky `<thead>` for the
47-row table. Layout was correct (measured via getBoundingClientRect) but Chromium
**painted the sticky header a full row-height off**, blanking the table region. Fixed
by dropping viewport-sticky entirely and repeating the plan names on each group banner
row instead — better editorial rhythm, and no compositor edge cases. The sticky-_left_
feature column (a different axis, inside an `overflow-x: auto` container) is fine.

## Contact page copy update (2026-08-25, complete)

Verbatim copy swap supplied by the marketing owner. No layout redesign.

- [x] Masthead: H1 "Get in Touch With Inner Explorer" + new subtitle.
- [x] Card 1 (form): badge "Start here", title "Start the conversation", new blurb,
      two reassurance helper lines, button "Send your message", and a post-submit
      confirmation replacing the persona-named success card.
- [x] Form fields rebuilt to the specified eight (first/last name, email, job role,
      state or region across the 50 abbreviations, district name, optional school
      name, optional message with helper text). "How many educators?" dropped;
      Netlify honeypot kept.
- [x] Card 2 (was third): "Already using Inner Explorer?" with a single Support row
      plus a Help Center link. General/Press rows removed.
- [x] "Call us" card deleted outright; `blocks/contact/PhoneCard.astro` removed.
      Page-level clipboard + toast JS stays because the email row still copies.
- [x] Closing: new body + "The Inner Explorer team". Location line removed. The
      paragraph is body copy now rather than a pull quote, so its serif italic was
      set to normal (house style: no italic emphasis).
- [x] Metadata + `ContactPage` JSON-LD trimmed to the support address (no telephone,
      hours, or press contact point).
- [x] Footer tagline: "K-12 schools" to "PreK-12 schools" (`src/data/footer.json`).

### Review (Contact copy update)

`pnpm check` clean; `pnpm build` clean (59 pages). Verified on the dev server:
copy renders verbatim, all eight fields present with the honeypot intact, and a
scripted submit swaps the form for the confirmation message.

Fixed along the way: `EditorialMasthead`'s `inline` layout pinned `white-space: nowrap`,
and the longer H1 (32 chars vs the old 24) overflowed its container. First attempt only
covered narrow viewports; see the follow-up below for the real fix.

## Contact H1 centering fix (2026-08-25)

Reported after the copy update shipped: the Contact H1 sat noticeably right of the
subtitle and the form card.

Cause: `EditorialMasthead`'s `inline` layout set `white-space: nowrap`. The new
32-character headline needs 842px at the 56px size cap, but the masthead container was
`maxWidth="760px"` (696px of content), so the text overflowed by 146px. `text-align:
center` does **not** centre overflowing content: it pins the text to the start edge and
lets it spill right. Measured at 1440px wide, the H1's ink centred on 793 while the
subtitle and card both centred on 720.

The earlier `max-width: 720px` media query masked this on phones only, which is why it
looked fixed. Lesson recorded in tasks/lessons.md: measure the text ink box
(`Range.getBoundingClientRect`), not the element box, when checking centring. The
element box is always the container width and looks correct even while the glyphs
overflow.

- [x] Dropped `white-space: nowrap` from the `inline` layout so an over-long headline
      wraps (and stays centred) instead of overflowing. Removed the now-redundant
      720px override.
- [x] Widened the Contact masthead to `maxWidth="960px"` so the sentence still lands
      on one line at desktop widths (needs >= 906px to fit).

Verified: H1 ink, subtitle, and card centres agree exactly at 1280 / 1024 / 768 / 414px,
with no horizontal overflow at any of them; one line down to ~485px, two centred lines
below. The other `inline` consumers are untouched in practice, both having ample room
(`/newsroom` "Our Newsroom" 614px and `/case-studies` "Case Studies" 536px, against
1136px available), so removing `nowrap` cannot make them wrap.

## Contact copy trim (2026-08-25)

Owner review after the page went live. Two cuts, no layout work:

- [x] Removed the closing block entirely: "There is no wrong way to start..." and the
      "The Inner Explorer team" signature. Judged unnecessary. Took its markup, its
      `closing` data object, and all `.closing*` CSS (including the mobile override)
      with it, so nothing dead is left behind.
- [x] Trimmed the "Start the conversation" blurb to just "Someone on our team will
      follow up to set up a time to talk." The dropped first sentence told people what
      to write about; the owner's call is that they should say what they want to.

The page now ends on the "Already using Inner Explorer?" card. `.contact-page`'s 96px
bottom padding still separates it from the footer, so no spacing change was needed.

Second pass, same review:

- [x] Removed the reassurance block under the form ("A real person from our team reads
      every message." / "You will hear back within one business day."). The owner
      pointed at it by its first line; both lines went, because the second one repeats
      the subtitle's one-business-day promise almost verbatim and leaving it would have
      kept the repetition the cut was meant to solve. Flagged for the owner.
- [x] Removed "Optional. A sentence is plenty." under the message field. Optional
      fields are already signalled by the absence of the required asterisk, same as
      "School name".
- [x] `.footer-row` switched from `space-between` to `flex-end`. The submit button is
      its only child now, and `space-between` pushes a lone child to the _start_ edge,
      which would have silently moved the button to the left.
- [x] Dropped the `aria-describedby` wiring on the form and the textarea along with the
      elements they pointed at, so no dangling references remain (verified in the DOM).

## PreK-12 in structured data (2026-08-25)

Follow-on from the footer tagline change: the footer said PreK-12 while the schema.org
markup still said K-12.

- [x] `src/lib/schema.ts` Organization description (renders on every page).
- [x] `index.astro` Service `serviceType` and EducationalAudience `audienceType`.
- [x] `about.astro` Organization description.
- [x] `districts.astro` EducationalAudience `audienceType`.

Deliberately NOT changed:

- `research.astro`'s JSON-LD `about: 'Mindfulness research in K-12 schools'`. This
  describes the research corpus, not the product. The trials were run in K-12 settings,
  so widening it to PreK-12 would assert PreK research we cannot support.
- Every other remaining K-12 in JSON-LD is the page's own `pageTitle` / `pageDescription`
  reused in the markup, so it is really the `<title>` and `<meta name="description">`
  (homepage title, /about, /districts, /platform, /research). Changing those is an SEO
  copy decision for marketing, not a consistency fix. Left for the owner to call.
- Visible body copy across /about, /districts, /platform still says K-12.

Verified in the built output: the Organization description now reads PreK-12 on all
73 page instances, and no product-descriptor JSON-LD string says K-12 any more.

## HubSpot contact form (2026-08-25)

Replaced the hand-rolled Netlify Forms contact form with a native HubSpot embedded form
(portal `44976911`, form `48e37214-69e4-479f-b03b-1ae2ab5dfbd4`) so submissions land in the
CRM and fire its workflows, while keeping the design pixel-faithful.

- [x] **`scripts/hubspot-contact-form.mjs`** — builds the eight-field definition through
      `PATCH /marketing/v3/forms/{id}`, reading dropdown options from the CRM properties at
      run time so the form cannot drift from them. Read-modify-write and idempotent; sends
      only `fieldGroups`, so notification recipients, lifecycle stages, reCAPTCHA, the
      post-submit action and every style value are untouched. Refuses to write if the live
      form holds a field the spec would delete, or if `formType !== 'hubspot'`.
      Needs `HUBSPOT_PRIVATE_APP_TOKEN` (scopes `forms` + `crm.schemas.contacts.read`);
      it validates the token is header-safe and reports 401/403/404 in plain language
      instead of a stack trace. The no-op check compares a canonical projection, not raw
      JSON — HubSpot's GET does not echo back what you PATCH (see lessons.md).
- [x] **`src/components/integrations/HubSpotForm.astro`** — loader + styling. Sits beside
      `Intercom.astro` and re-runs on `astro:page-load` for the same ClientRouter reason.
      `<style is:global>` scoped under `.hsform`, colors via `var(--color-*)` only.
- [x] **Field mapping** to existing contact properties: `firstname`, `lastname`, `email`,
      `job_role`, `stateabreviation`, `district_name`, `school_name`, `message`. All eight
      already existed with option lists matching the design — nothing was created.
- [x] **`src/pages/contact.astro`** — swapped the component; dropped `roles`/`states`/
      `submitLabel` from the structured data (those now live on the HubSpot form); added a
      `supportEmail` const so the form's fallback and the Support row share one address.
- [x] **Deleted** `src/components/blocks/contact/DemoForm.astro`; its `.success*` rules and
      `fadeUp` keyframes moved into the new component.
- [x] **Fallback** for JS-off (`<noscript>`) and for JS-on-but-blocked (ad blockers and
      school-network filters do block `js.hsforms.net`), pointing at `support@` + Help Center.

### Deliberately not done

- **The HubSpot tracking script** (`js.hs-scripts.com/44976911.js`). It only adds `hutk`
  attribution and carries cookie-consent implications the site has not addressed;
  submissions work fully without it.
- **`displayOptions.renderRawHtml`** on the form. It would keep the form out of an iframe
  form-wide, but that changes rendering for every other embed of it. The per-embed
  `css: ''` option does the same job scoped to our page.

### Two things for the owner

1. The confirmation copy says "We just sent a confirmation to your inbox". Nothing sends
   that today — either add a HubSpot follow-up email on this form, or change the copy.
2. Submission notifications now come from HubSpot. Confirm the form's notification
   recipients point at the right people; that was the substance of the old Netlify item.

### Review (HubSpot contact form)

`pnpm check` green (0 errors, 0 warnings, 8 pre-existing hints) and `pnpm build` clean at 60
pages. Per-page JS on `/contact` did not grow — it shrank, because the old form's bundled
`<script>` is gone and the loader is inline.

Verified on the dev server by DOM measurement rather than eyeballing:

- **Inline render, not an iframe** — zero visible iframes inside `.hsform`, zero HubSpot
  stylesheets or `<style>` tags in the document. This is the whole ballgame; see the lesson
  in `tasks/lessons.md`.
- **Layout** — measured against the exact markup HubSpot emits (its `fieldset.form-columns-N`
  wrappers included, so `display: contents` was genuinely exercised): rows land at
  y=451/534/617/700/783 with two 354px columns and a 16px gap; School name sits alone on the
  left half; Message and the submit row span 724px. Matches the design.
- **Tokens** — input 48px/12px radius, border `rgb(220,223,229)` (`--color-border`), card
  white; required mark `rgb(17,122,76)` (`--color-brand-emphasis`); button 52px pill
  `rgb(26,154,89)` (`--color-brand`) with the arrow as a 16px masked `::after`; textarea
  108px min-height; select chevron with 40px right padding.
- **Error state** — HubSpot's `.invalid.error` classes and its `.hs-error-msgs` list resolve
  to a `#b42318` border and 12px danger text, list markers reset.
- **Focus** — a real Tab (not `.focus()`, which does not match `:focus-visible`) puts a 2px
  `--color-ring` ring at 3px offset on the button with the pill radius intact.
- **Mobile 375** — single 287px column, all eight stacked, submit full width, zero
  horizontal overflow.
- **Dark mode** — every measured value identical with `.dark` forced on `<html>`; the
  `.appearance-light` pin holds through the embed.
- **Soft nav** — `/contact` → `/about` → `/contact` by real anchor clicks, confirmed to be
  client-side (a `window` sentinel survived), and the form re-rendered with exactly one
  form instance and styling intact. This is the ClientRouter trap the repo has hit before.
- **Confirmation card** — 44px `--brand-300` disc with a `--brand-900` glyph, 520px body,
  `hsform-fade-up` animation, `role="status" aria-live="polite"`, embed hidden behind it.

**The HubSpot form is now built.** The owner supplied a private app token and the script ran
against the live form: it held only `email` (interlock passed with nothing to lose), and all
eight fields were written in five groups. Confirmed live on the page — 8 fields, still inline
(0 visible iframes, 0 HubSpot stylesheets), two 354px columns, `Job role` carrying its 5
options and `State or region` its 54, School name alone on the left half, Message full width,
zero horizontal overflow. Visually indistinguishable from the design.

The form's name is still HubSpot's default, `New form (August 25, 2026 2:51:28 PM EDT)`. That
string becomes the contact's `recent_conversion_event_name`, so it is worth renaming for
reporting — the portal's other forms are named after their page.

The form was also renamed from HubSpot's default to `Contact — innerexplorer.com V2`, which
is now part of the script's payload so it stays version-controlled with the field set.

**End-to-end verified.** A test lead submitted through the real form on `/contact` produced
contact `244309307539` with all eight properties persisted — `firstname`, `lastname`,
`email`, `job_role` (District Administrator), `stateabreviation` (MA), `district_name`,
`school_name` and `message`. The confirmation card fired from `onFormSubmitted` (one card,
embed hidden, 44px `--brand-300` disc). Conversion event recorded as
`Contact Inner Explorer | Daily Mindfulness for Schools: Contact — innerexplorer.com V2`,
i.e. HubSpot prepends the page title to the form name — so a shorter form name would read
better in reporting if that string is ever surfaced in a dashboard.

The real form also confirmed the error state on live HubSpot markup (not just the injected
mock): `.hs-input.invalid.error` resolves to the `#b42318` border with 12px danger text,
list markers reset, flush-aligned with the input, inside a `role="alert"` list.

**The test contact is still in the CRM** — deleting CRM records is the owner's call, not
something to automate: https://app.hubspot.com/contacts/44976911/record/0-1/244309307539

## Privacy policy as its own page + global footer link (2026-08-27)

Goal: the privacy policy existed only as a Help Center article (2026-08-07 entry above).
Give it a real page on the marketing site, linked from the global footer, as a standard
legal page. The FAQ already linked to `/privacy`, which 404'd.

Approach: ONE source of truth for the legal text. `src/content/help/privacy-policy.mdx`
stays where it is and the new page renders that same entry, so the document has exactly
one file to edit and the two surfaces cannot drift.

- [x] `help-collection.ts` — optional `canonicalUrl` frontmatter: the absolute URL of a
      document's canonical copy when it also renders elsewhere. Threaded a `canonical`
      prop through `BaseLayout` → the existing `SEO` component, and through
      `HelpSiteLayout` → `src-help/pages/[slug].astro`, so the article points at
      `/privacy-policy/` instead of competing with it as duplicate content.
- [x] `blocks/legal/LegalDoc.astro` — legal-document shell: breadcrumb, eyebrow, H1, dek,
      sticky outline (reuses `blog/ArticleToc` in its unnumbered variant), body in the
      shared `.prose-help` documentation prose. Deliberately NOT `EditorialMasthead`: a
      policy has to read as a document a reviewer can cite, not a campaign. A future
      terms of service page drops straight in.
- [x] `src/pages/privacy-policy.astro` + `src/content/pages/privacy-policy.yml` +
      `lib/page-schemas/privacy-policy.ts` — the route. The `pages` entry carries only
      the page's kicker and SEO copy; it exists mainly so CloudCannon has a file behind
      `/privacy-policy/` (without one the page cannot be opened in the Visual Editor at
      all — `check-editables` unbacked pages went 5 → 4).
- [x] Footer — `legalLinks` array in `src/data/footer.json` + a legal row in the bottom
      bar of `Footer.astro`, editable via `_structures.navigation_items`. Bottom legal
      row rather than a nav column: that is where a policy link belongs, and it is one
      click from every page.
- [x] `/privacy` → `/privacy-policy/` 301 (astro.config.mjs for dev/preview,
      netlify.toml with `force` for production); fixed the FAQ's `/privacy` link.
- [x] `.prose-help` comment in global.css updated — it is now shared by the Help Center
      and the marketing site's legal documents, not help-only.
- [x] Verified: `pnpm check` 0 errors, `pnpm build:all`, `pnpm lint:editables` all pass.
      Page renders the original 17 `##` sections with a matching 17-item outline, exactly
      one `<h1>`, exactly one canonical on each surface and both agreeing on the
      trailing-slash form. Light + dark, desktop + 375px (no sideways scroll), sticky
      outline engages, footer legal row sits inline on desktop and stacks on mobile, no
      console errors. `/privacy` stub and sitemap entry confirmed in `dist/`.

**Review — a scope correction worth recording.** "Make it a standard privacy policy page
that would pass all inspection" was first read as licence to fill gaps in the DOCUMENT: an
earlier pass added four sections (how to submit a request, extra state-law rights, users
outside the US, Do Not Track) and moved the effective date out of the opening table into
frontmatter so it could render in a masthead. Juliana stopped it — "keep the text exactly
the same" — and all of it was reverted. The body is byte-identical to the original,
verified with a frontmatter-excluded diff; the only change to that file is the one
invisible `canonicalUrl` line. Consequently the page adds no date chrome of its own and
the JSON-LD carries no `datePublished`: the policy states its effective date in its own
opening table, which is the one place a reviewed document should say it.

The rule is in tasks/lessons.md: legal copy is transferred, never authored. "Pass
inspection" means the PAGE is sound — canonical URL, valid `WebPage` structured data
(schema.org has no `PrivacyPolicy` type; an invalid `@type` is exactly what a validator
flags), footer-reachable, accessible, CMS-editable — not that the document is rewritten.

Left for a human: the policy says whatever counsel last approved. If it should say more,
that is a legal decision to make off-site and paste in. No terms of service page exists;
`legalLinks` and `LegalDoc` both take one with no code changes when there is.
