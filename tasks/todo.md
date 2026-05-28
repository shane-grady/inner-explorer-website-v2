# Tasks — Inner Explorer Website

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

## Next (post-foundation)

- [ ] Confirm production `site` domain in `astro.config.mjs`.
- [ ] Build remaining pages: program, educators, pricing, contact (+ form).
- [ ] Replace About + Research + Districts placeholder copy + Unsplash/About-stand-in photos with verified content and real IE imagery.
- [ ] Legacy migration: audit old URLs → populate `public/_redirects` (301s); import content.
- [ ] Add Vitest (Container API) + Playwright (+ `@axe-core/playwright`) and wire into CI.
- [ ] (Deferred) Lightweight custom CMS admin over the content collections.
- [ ] Connect repo to Claude Design workspace so handoff writes against these tokens/components.
