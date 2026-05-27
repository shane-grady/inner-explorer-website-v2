# Lessons

Patterns learned while building this repo. Review at session start; add to it after
any correction or surprise.

## Environment

- **Subagents fail to spawn in this Cowork environment** — the inherited MCP tool
  context overflows the prompt limit ("Prompt is too long"), even for a one-line
  prompt. Do research/exploration in the main context until this changes, despite the
  general "use subagents liberally" guidance.

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
