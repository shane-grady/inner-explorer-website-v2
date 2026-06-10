# Tasks — Inner Explorer Website

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
- [ ] **Contact page placeholders** (designer's stand-ins): phone number
      `+1 (508) 657-1755`, team initials `SC` / `MR` / `JP` / `AK` + names "Sarah Chen,
      Marcus, Jenny" in the success card and humans panel, the email aliases
      `hello@`/`support@`/`press@` `innerexplorer.org`, and the closing pull quote
      (attributed to "The Inner Explorer team, Marlborough, MA"). Swap for verified
      contact info before publish.
- [ ] **Contact form delivery**: form is wired to Netlify Forms (`data-netlify="true"`,
      `name="demo"`). Confirm the destination email + notification settings in the
      Netlify dashboard before publish. Also wire a real scheduler URL for the success
      card's "open her calendar" link (currently points to `/schedule`, which 404s).

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
- [ ] Images: generate via Higgsfield (hero/challenge/approach/gallery ×6,
      2 portraits, newsroom cover); compress; save under assets.
- [x] Content: webb-school.yaml (real facts; representative fills flagged # REVIEW).
- [x] PDF: copy original → public/downloads/webb-school-case-study.pdf.
- [x] Newsroom: add Webb case-study story card.
- [x] Verify: preview screenshots (desktop+mobile), Broward unchanged, pnpm build
      meta/JSON-LD/sitemap inspection, pnpm check green.
- [x] SEO: Workflow audit (on-page, technical, structured data, E-E-A-T/GEO, SERP)
      → verify findings → apply (incl. per-page OG image threading) → re-verify.
- [ ] Commit + PR to main.

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
- [x] Content: john-marshall-hs.yaml (order 3; real quotes ×9, real stats; gates
      on representative fills). CASEL designation VERIFIED at pg.casel.org
      2026-06-09: "Designated SEL-Supportive Program" (resolves the seo-playbook
      open follow-up; legacy "CASEL-approved" not carried forward).
- [x] PDF: copy original → public/downloads/john-marshall-hs-case-study.pdf.
- [x] Newsroom: story card id 18, first in array (stable sort on tie-date).
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
