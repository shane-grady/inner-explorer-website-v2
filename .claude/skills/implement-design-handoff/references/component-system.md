# Component system reference

Everything you need to map a Claude Design handoff onto this repo's shared system
without proliferating bespoke components. Read this before planning a build.

## Contents

1. [Token architecture & rebranding](#1-token-architecture--rebranding)
2. [The drift guard — rules & drift-safe patterns](#2-the-drift-guard--rules--drift-safe-patterns)
3. [Component inventory & how to extend each](#3-component-inventory--how-to-extend-each)
4. [Reuse decision tree (worked examples)](#4-reuse-decision-tree-worked-examples)
5. [Fonts & assets pipeline](#5-fonts--assets-pipeline)
6. [Accessibility / JS / SEO checklists](#6-accessibility--js--seo-checklists)
7. [Verification & known gotchas](#7-verification--known-gotchas)

---

## 1. Token architecture & rebranding

Tokens live in `src/styles/global.css` in three layers (see `DESIGN.md`):

1. **Raw palette** — private vars in `:root` (`--brand-50…950`, `--neutral-*`,
   `--accent-*`, plus brand surfaces: `--glass-*`, `--hero-tint`, `--cta-tint`,
   `--shadow-*`, `--dur-*`). Not exposed as utilities; reference by `var()` only in
   scoped CSS when you need a specific palette step.
2. **Semantic tokens** — light values on `:root, .appearance-light`; dark on `.dark`.
   These are the vocabulary components use: `--background`, `--foreground`, `--card`,
   `--muted(-foreground)`, `--brand(-foreground/-subtle/-emphasis)`, `--accent*`,
   `--border`, `--input`, `--ring`, intents (`--success/-warning/-danger/-info`).
3. **`@theme` mapping** — turns semantics into Tailwind utilities (`bg-background`,
   `text-foreground`, `border-border`, `bg-brand`, …) and defines the type ramp,
   radius, shadow, spacing-section, and font families. Tailwind's default palette and
   type scale are **cleared** (`--color-*: initial; --text-*: initial`) so only system
   utilities exist — there is no `bg-blue-500`, no `text-7xl`.

**Rebranding from a handoff = a one-file change.** The handoff's
`assets/colors_and_type.css` is typically the _real_ brand (it cites the source repo).
Map its values onto the **stable semantic names** in `global.css` so every page
re-skins automatically. Don't define page-local color tokens. If the handoff needs a
palette step or surface the system lacks (a glass tint, a photo overlay gradient), add
it to the raw layer in `global.css` (raw `rgb()/hsl()` are fine there — `.css` is not
drift-scanned) and consume it via `var()`.

**Light-only pages under global dark mode:** wrap the page body in
`<div class="appearance-light">`. That class re-asserts the light semantic values AND
re-declares the `--color-*` theme vars (see the gotcha in §7) so the subtree stays
light even under `.dark`, while global chrome keeps adapting.

---

## 2. The drift guard — rules & drift-safe patterns

`pnpm lint:drift` (`scripts/check-drift.mjs`) regex-scans every `.astro/.tsx/.jsx`
file — **including `<style>` blocks** — and fails the build on:

- raw hex (`#1a9a59`), and color functions `rgb()/rgba()/hsl()/hsla()/oklch()/oklab(`
- arbitrary Tailwind values: `utility-[value]` (e.g. `bg-[#abc]`, `mt-[13px]`). Note
  arbitrary _variants_ like `min-[600px]:` and `data-[state=open]:` are allowed.

It does **not** flag plain CSS dimensions (`px/rem/%/vw/clamp/grid-template`) or
`var(--token)`. `.css` files are not scanned. Escape hatch (rare): a
`drift-ignore-next-line` comment on the line above.

**Therefore — the drift-safe pattern for bespoke editorial layout** the type ramp /
utilities can't express: a component-scoped `<style>` block that

- sources **all colors** from tokens via `var(--color-*)` / `var(--brand-*)` / the
  surface vars, and
- expresses **geometry** as plain CSS (`grid-template-columns: 1fr 120px 1fr`,
  `clamp(56px, 9vw, 132px)`, `aspect-ratio: 4 / 5`).

For alpha/tint mixing use **`color-mix(in oklab, var(--color-brand) 35%, transparent)`**
— it's allowed (the guard only flags `oklab(` with a paren; the `in oklab,` colorspace
keyword has a comma after it, and `color-mix(` isn't in the flagged list). Use it for
glass surfaces, photo overlays, focus glows, white-on-photo text, etc.

Prefer token utilities in markup where they fit (`bg-card`, `text-muted-foreground`,
`border-border`, `gap-6`, `py-section-md`, `rounded-2xl`); drop to scoped CSS only for
the genuinely bespoke parts.

---

## 3. Component inventory & how to extend each

Extend a component by adding to its `tailwind-variants` (`tv`) config — a new
`variant`/`size`/`tone`/etc. key — **not** a one-off class string at the call site.
New visual variations belong in the component so every caller benefits.

**primitives/** (`src/components/primitives/`)

- `Heading.astro` — `as` h1–h6 (semantics) decoupled from `size`
  (`sm|md|lg|xl|display` → `text-xl…text-5xl`), `font` (`sans|serif`), `tone`
  (`default|brand|onBrand|muted`). For an italic editorial display look, pass
  `font="serif"` + a class, or **add a `display`/`editorial` variant** here rather
  than hand-styling per page.
- `Text.astro` — `size` (`sm|base|lg|xl`), `tone`, `weight`, `leading`, `balance`.
- `Button.astro` — `variant` (`solid|outline|ghost|link`) × `tone`
  (`brand|accent|neutral`) × `size` (`sm|md|lg`), `block`. Renders `<a>` when `href`
  set. Need a pill or an on-photo button? Add a variant (e.g. `pill`, `onDark`).
- `Container.astro` — `width` (`prose|narrow|default|wide|full`).
- `Badge`, `Link` (`default|subtle|nav`), `Prose`, `VisuallyHidden`.

**layout/** (`src/components/layout/`)

- `Section.astro` — `space` (`none|sm|md|lg` → `py-section-*`) + `surface`
  (`none|muted|card|brand|brandSubtle`). Use it for vertical rhythm + surfaces.
- `Grid`, `Stack`, `Header` (glass pill nav, theme-aware), `Footer`, `ThemeToggle`
  (vanilla).
- `layouts/PageLayout.astro` — doc shell + skip link + Header + `<main>` + Footer +
  SEO. Props: `title`, `description`, `type`, and **`flushTop`** (set it for full-bleed
  hero pages so the hero sits under the fixed glass nav; omit it and `<main>` gets top
  clearance). Page-specific structured data goes through the `head` slot (`JsonLd`).

**blocks/** (`src/components/blocks/`) — page sections; pages are compositions of these.

- `Hero`, `FeatureGrid`, `Testimonials`, `CTABanner` (generic, prop-driven).
- New shared blocks you add should follow the same shape: typed `Props`, content
  passed as data, variants via `tv`, scoped styles using tokens.

When in doubt about what exists/looks-like, open `/styleguide`.

---

## 4. Reuse decision tree (worked examples)

For each handoff section, walk the ladder and stop at the first fit:

```
Does a primitive/block already render this?            → REUSE it.
  └ no → Is the difference only stylistic (color, size, density, surface)?
         → EXTEND: add a variant to the component, or a token to global.css.
      └ no → Is this a real, recurring pattern (could another page use it)?
             → CREATE a SHARED block in blocks/ (data-driven, variant-friendly).
          └ no → Genuinely one-of-a-kind layout? → page-local component (last resort).
```

Worked examples (handoff section → action):

| Handoff section                                             | Action                                                                                                                                          |
| ----------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Generic CTA banner with photo bg                            | **Reuse** `CTABanner`; if it lacks a photo-bg + dark-overlay treatment, **extend** it with a `media`/`overlay` variant — don't fork a page CTA. |
| Hero with eyebrow + headline + subhead + meta               | **Reuse/extend** `Hero` (add a `mediaBackground` or `editorial` variant + `meta` slot) rather than a page hero.                                 |
| Pricing cards / feature trio                                | **Reuse** `FeatureGrid` (extend columns/variant).                                                                                               |
| Stat strip with count-up                                    | **Create shared** `StatStrip` block (props: `stats[]`; vanilla count-up; reduced-motion aware). Reusable on home, impact, pricing.              |
| Logo / partner grid                                         | **Create shared** `LogoGrid` block (props: `items[]`, `columns`).                                                                               |
| Team / people grid                                          | **Create shared** `TeamGrid` / `PersonCard` (props: `people[]`).                                                                                |
| Pull-quote / testimonial card (incl. a dark "featured" one) | **Reuse/extend** `Testimonials`/a `QuoteCard` with a `featured`/`tone` variant — the dark variant is a _variant_, not a new component.          |
| A scroll-driven timeline unique to one page                 | **Shared** `Timeline` block if it could recur; otherwise page-local — but keep it data-driven so content stays in the page.                     |

The recurring mistake to avoid: seeing a section that's "almost like `Testimonials` but
darker / rounder / with a photo" and making a brand-new component. That darker/rounder/
photo difference is a **variant** or a **token**. Make the global change; the user
wants to retune it in one place.

---

## 5. Fonts & assets pipeline

- **Fonts:** the handoff bundles brand `.otf` faces. Convert to subset-friendly
  `.woff2` with `woff2_compress` (Homebrew) and self-host from `public/fonts/`, with
  `@font-face { … font-display: swap }` in `global.css`. Map `--font-sans` /
  `--font-serif` / `--font-display` (exposed via `@theme`). Only declare the weights
  you actually ship; missing weights fall back to the nearest.
- **Images:** localize handoff photos into `src/assets/images/<page>/` and serve via
  Astro `<Image>` (`widths`/`sizes`, `loading="lazy"` below the fold, `eager` +
  `fetchpriority="high"` for the LCP hero). For full-bleed CSS backgrounds, render an
  absolutely-positioned `<Image>` layer behind a tint overlay (`<Image>` can't be a
  CSS `background-image`). **`<Image>` needs `sharp` installed** (`pnpm add sharp`) —
  it's allow-listed in `pnpm-workspace.yaml` but not a dependency by default; the
  build fails `MissingSharp` until you add it.
- **Logos / OG:** put brand marks in `src/assets/brand/`; ensure `public/logo.png`
  (referenced by `organizationSchema`) and `public/og-default.png` (referenced by
  `SEO.astro`) exist.
- Unsplash/stock photos in a handoff are **stand-ins** — localize them so the build is
  self-contained, but flag in `tasks/todo.md` that they (and any placeholder copy the
  designer flagged) should be swapped for verified assets before publishing.

---

## 6. Accessibility / JS / SEO checklists

**Accessibility (WCAG 2.2 AA — a school procurement requirement):**

- Semantic HTML + landmarks; exactly one `<h1>` per page; ordered heading levels.
- Real `alt` on meaningful images; `alt=""` on decorative ones.
- Keyboard operable; rely on the global `:focus-visible` ring; interactive controls
  are real `<button>`/`<a>`.
- AA contrast — verify white-on-photo text over the tint overlays.
- Honor `prefers-reduced-motion` (count-ups, scroll reveals, parallax, scale-ins).

**JavaScript (ship the minimum):**

- Default to zero-JS `.astro`. Interactions = a small vanilla `<script>` (Astro
  bundles it), **not** a React island. A scroll/timeline/count-up/toggle does not
  justify the React runtime on a marketing page.
- **Progressive enhancement:** content must be visible without JS (don't gate the
  initial state on a class only JS adds — opt _into_ animation via a JS-set flag like
  `data-anim`, so no-JS/SEO sees everything).
- After adding any island, verify per-page JS:
  `grep -o '/_astro/[^"]*\.js' dist/<page>/index.html` — marketing pages should ship
  ~0KB framework JS (React only loads where a real island lives, e.g. `/styleguide`).

**SEO:** route every page through `PageLayout` (canonical, OG, Twitter, Organization
JSON-LD baked in). Add page-specific structured data (e.g. `AboutPage`) via the `head`
slot with `JsonLd`. Keep page copy as structured data at the top of the page file.

---

## 7. Verification & known gotchas

**Gate (run before calling done):**

- `pnpm check` = `typecheck && lint && lint:drift && format:check` → 0 issues.
  (Run `pnpm format` first to normalize.)
- `pnpm build` → succeeds; spot-check per-page JS weight.
- Browser via the **Claude Preview MCP**: create `.claude/launch.json`
  (`{ name, runtimeExecutable: "pnpm", runtimeArgs: ["dev","--","--port",N], port: N }`),
  `preview_start`, then `preview_eval` to navigate and read computed styles,
  `preview_screenshot` for layout, `preview_resize` for responsive + `colorScheme`
  dark/light. **Prefer `preview_inspect`/`preview_eval` (computed styles) over
  screenshots for verifying colors/fonts/spacing.**
- Regress-check the other pages (home/blog/styleguide) in light **and** dark.

**Gotchas (learned the hard way — also in `tasks/lessons.md`):**

- **`@theme` indirection + subtree override.** `@theme` emits `--color-card:
var(--card)` on `:root`, so the indirection is _computed at the root_ and inherited.
  Overriding only `--card` on a descendant (the `.appearance-light` light-pin) does
  **not** re-resolve `--color-card`. Fix: `.appearance-light` must re-declare the
  `--color-*` set too, so they re-substitute against the light values in that scope.
  (Global dark mode works because `.dark` lives on the same `html` element where
  `--color-*` is declared.)
- **`pnpm dev --port N` swallows the flag** — use `pnpm dev -- --port N` (the `--`
  separator) or set it in the launch config; otherwise it falls through to busy ports.
- **Handoff links 404 on `curl`** — they're short-lived signed URLs; use WebFetch.
- **`document.currentScript` is null** in Astro's bundled module `<script>` — select
  elements by id/selector instead.
- **Content-config changes need a dev-server restart** (collections don't hot-reload).
- **Astro 6:** import `z` from `zod` (not `astro:content`); Tailwind v4 via
  `@tailwindcss/vite`; annotate dynamic-`<Tag>` props as `const {…}: Props =
Astro.props` to avoid the unused-Props hint.
