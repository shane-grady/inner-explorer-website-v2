# Help Center (help.innerexplorer.com): sealed

The Help Center is a second Astro site built from this repo (`astro.help.config.mjs` →
`dist-help/`, deployed by `sites/help/netlify.toml`, and built by CloudCannon for editing
with `pnpm verify:help`). It is **frozen** while the marketing site is rebuilt (see
`tasks/rebuild-plan.md`). Every component, layout, style and helper it renders is a copy
that lives here, so nothing done in `src/` can change it.

## The boundary

- `src-help/` imports nothing from `src/` except the editor-owned `src/data/help-ui.json`.
  ESLint enforces this in both directions (`eslint.config.js`).
- Article bodies stay where CloudCannon edits them: `src/content/help/*.mdx` (read through
  the `glob` loader in `lib/help-collection.ts`) and `src/data/help-ui.json`. Don't move them.
- `styles/help.css` is a frozen copy of the old marketing `global.css`. Tailwind scans only
  `src-help/` markup (`source(none)` + `@source`), so marketing changes can't alter it.
- Need a change here? Make it in the `src-help/` copy. Never re-import from `src/`.

## What help needs from `public/` (shared with the marketing build)

Keep these when cleaning up `public/`: `fonts/*` (all of them, declared by `help.css`; the
share-card renderer also reads three), `favicon.ico`, `apple-touch-icon.png`, `logo.png`
(Organization JSON-LD), `og-default.jpg` (default share image) and `videos/help/**`.
`node scripts/check-dist.mjs dist-help` fails if any referenced file is missing.

## Commands

- `pnpm dev:help`: the help site on http://localhost:4322.
- `pnpm build:help`, then `node scripts/check-dist.mjs dist-help`.
- **Prove a change left help untouched:** build `dist-help` from `main` in a sibling
  worktree outside this repo, build it again on your branch, then compare:

  ```bash
  git worktree add --detach ../ie-baseline origin/main
  (cd ../ie-baseline && pnpm install --frozen-lockfile && NETLIFY=true pnpm build:help)
  NETLIFY=true pnpm build:help
  node scripts/compare-builds.mjs ../ie-baseline/dist-help dist-help ../ie-compare --css-classes
  diff -ru ../ie-compare/a ../ie-compare/b
  ```

  An empty diff means visitors get exactly the same pages. `--css-classes` lists any class
  that lost its CSS but is still used in the HTML.

When the Help Center is reskinned onto the new design system, these frozen copies go away.
