# Lessons

Patterns learned while building this repo. Review at session start; add to it after
any correction or surprise.

## Environment

- **Subagents now spawn fine** (verified 2026-05 in Claude Code: a trivial
  general-purpose agent returned in ~2s). An earlier note claimed they overflowed the
  prompt limit ("Prompt is too long") from the large inherited MCP tool surface — that
  is now stale. Use subagents normally for research/parallel work. If a spawn ever does
  fail with "Prompt is too long," it's the MCP tool context; fall back to the main
  context for that task.

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
