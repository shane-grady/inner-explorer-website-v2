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

## Narrators collection page (D2 · "Meet the Studio — Full-width headline" — complete)

- [x] **Page-local hero**: `MeetStudioHero.astro` reproduces D2's oversized duet
      (~116px sans / ~184px italic serif) on a warm cream-peach-green wash, with the
      "Vol. IX · Spring 2026" corner anchor pushed below the global fixed nav.
- [x] **4 new shared blocks** (reuse-first calls confirmed with Shane): `MetaStrip`
      (dense italic-serif stat row), `CollectionToolbar` (italic + sans inline
      title with right slot), `MomentsRail` (1.3/1/1 captioned photo cards),
      `SplitCTA` (huge serif pull-quote + brand-tinted CTA card).
- [x] **2 narrator blocks** under `blocks/narrator/`: `NarratorWall` (5-col grid,
      data-driven; vanilla mutually-exclusive play toggle) + `NarratorCard`
      (overlaid-name, isNew pin, hover-reveal play button, accessible link +
      separate button stacked via z-index).
- [x] **`narrators` content collection** (`src/content.config.ts` +
      `src/content/narrators/*.json` × 30) — the CMS seam.
- [x] **Header nav** extended globally: `Narrators` inserted between Research and About.
- [x] **Tokens**: `--cream-50/100`, `--peach-200`, composed `--studio-hero-wash` and
      `--studio-card-wash` in the raw layer of `global.css`.
- [x] **`.appearance-light` global fix**: wrapper now paints `background:
var(--background)` so subtrees fill light under global dark mode (without the
      fix, body's dark bg bled through gaps between non-background sections).
- [x] **Verification**: `pnpm check` (typecheck + lint + drift + format) clean;
      `pnpm build` produces `/narrators` shipping only the shared 2.3KB chrome JS
      (no React). Verified at 1440/920/375 widths in light + dark. Card play toggle
      is mutually exclusive (`aria-pressed` flips). About + home/blog/styleguide
      regression-checked — no visual changes.

### Follow-ups

- [ ] **Narrator detail pages** (`/narrators/[slug]`). Cards currently link to
      `/narrators/<slug>` but the routes don't exist. Build a `[slug].astro` template.
- [ ] **Real audio preview** — wire `<audio>` per narrator (add `audio: file()` to
      the schema) and have the play button drive `audio.play()/pause()` instead of
      just toggling `data-playing`.
- [ ] **Search + filter** behaviour on the wall toolbar (currently visual-only
      pills). Likely: client-side text + language filter with a small vanilla script.
- [ ] **30 Unsplash portraits + 3 studio-moment photos** are localized stand-ins —
      swap for real Inner Explorer studio photography before publish.
- [ ] **"Schools listening weekly" (1,840)** is a stub copy value — wire to a real
      data source (or remove) when available.
- [ ] **Languages narrated total** computes to 12 from seed data; D2 designer
      copy said "11" — confirm which is canonical with the studio team.

## Next (post-foundation)

- [ ] Confirm production `site` domain in `astro.config.mjs`.
- [ ] Build remaining pages: program, research/impact, pricing, educators/districts, contact (+ form).
- [ ] Replace About placeholder copy + Unsplash stand-ins with verified content + real IE photos.
- [ ] Legacy migration: audit old URLs → populate `public/_redirects` (301s); import content.
- [ ] Add Vitest (Container API) + Playwright (+ `@axe-core/playwright`) and wire into CI.
- [ ] (Deferred) Lightweight custom CMS admin over the content collections.
- [ ] Connect repo to Claude Design workspace so handoff writes against these tokens/components.
