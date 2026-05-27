# DESIGN.md — Inner Explorer Design System

The design context for this codebase. Tokens are the single source of truth; the
live catalog is **`/styleguide`**. Brand values are placeholders until real Inner
Explorer / Claude Design brand tokens are dropped in — see "Rebranding" below.

## Token architecture

Three layers, all in `src/styles/global.css`:

1. **Raw palette** — private CSS vars in `:root` (`--brand-50…950`, `--neutral-*`,
   `--accent-*`). Not exposed as utilities. Don't reference these in components.
2. **Semantic tokens** — `:root` (light) + `.dark` (dark). The only colors components
   use. Components consume these, so dark mode and rebrands "just work."
3. **`@theme` mapping** — turns semantic tokens into Tailwind utilities and defines
   the type ramp. Tailwind's default palette and type scale are **cleared**
   (`--color-*: initial; --text-*: initial`) so only system tokens exist as utilities.

### Color tokens (utilities)

`background` `foreground` · `card` `card-foreground` · `muted` `muted-foreground` ·
`brand` `brand-foreground` `brand-subtle` `brand-emphasis` · `accent`
`accent-foreground` `accent-subtle` · `border` `input` `ring` ·
intents: `success` `warning` `danger` `info` (+ each `-foreground`).
Plus `white` `black` `transparent` `current` for overlays.
Use as `bg-*`, `text-*`, `border-*`, `ring-*`. All pairs target WCAG 2.2 AA.

### Type ramp (fluid `clamp()`)

`text-xs` `text-sm` `text-base` `text-lg` `text-xl` `text-2xl` `text-3xl` `text-4xl`
`text-5xl` — each carries size + line-height. Base 16→18px, ~1.25 modular scale.
**Use the `Heading` and `Text` primitives**; don't apply raw `text-*` sizes ad hoc.
Fonts: `font-sans` (UI/body), `font-serif` (headings/editorial), `font-mono`.

### Spacing / radius / shadow / motion

- Spacing: 4px base (4/8pt grid). Numeric utilities (`p-4`, `gap-6`) stay on-grid by
  construction; arbitrary spacing is blocked by the drift guard. Fluid section rhythm:
  `py-section-sm|md|lg` (and `gap-`, `my-`, etc.).
- Radius: `rounded-sm|md|lg|xl|2xl`. Shadow: `shadow-sm|md|lg` (soft/calm).
- Motion: `ease-out`, `ease-in-out`; global `prefers-reduced-motion` handling.

## Components

- **primitives/** — `Button`, `Heading`, `Text`, `Prose`, `Link`, `Badge`,
  `Container`, `VisuallyHidden`. Variants via `tailwind-variants`.
- **layout/** — `Section` (vertical rhythm + surfaces), `Grid`, `Stack`, `Header`,
  `Footer`, `Nav`, `ThemeToggle` (vanilla).
- **blocks/** — page sections: `Hero`, `FeatureGrid`, `Testimonials`, `CTABanner`.
  Pages are compositions of blocks.
- **islands/** — React, hydrated with `client:*`. Use sparingly (e.g., `Counter` demo
  on `/styleguide`). Keep React off marketing pages.
- **seo/** — `SEO.astro` (meta/OG/Twitter), `JsonLd.astro` (schema.org).
- **layouts/** — `BaseLayout` (doc shell, tokens, SEO, no-flash theme), `PageLayout`
  (chrome: skip link + Header + `<main>` + Footer).

## How to use (the drift-safe path)

1. Build pages from `blocks/`; build blocks from `primitives/` + `layout/`.
2. Color/space/size only via tokens. If a token is missing, ADD it to `@theme` rather
   than reaching for an arbitrary value.
3. New visual variation → add a variant to the component, not a one-off class string.
4. Run `pnpm check` (includes the drift guard).

## Rebranding (one-file change)

Replace the raw palette + semantic values in `src/styles/global.css`. Token _names_
are stable, so updating brand colors / fonts there propagates everywhere — light and
dark. When real Claude Design brand tokens arrive, map them onto these semantic names.

## Known placeholders to replace

- Brand palette (teal/amber/stone) — swap for real brand.
- Fonts — currently system stacks; self-host brand webfonts (Phase: perf).
- `/og-default.png`, `/logo.png` — add real OG image + logo to `public/`.
- `site` in `astro.config.mjs` — confirm production domain.
