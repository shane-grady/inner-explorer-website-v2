# Build and verification notes

Date: 2026-07-14

## Local verification

- `npx @cloudcannon/cli validate`: both `cloudcannon.config.yml` and
  `.cloudcannon/initial-site-settings.json` are valid against the current schemas.
- `pnpm check`: typecheck, ESLint, design-drift guard, and Prettier all pass. Astro
  reports two pre-existing deprecation hints and zero errors/warnings.
- Clean `pnpm build` after removing `.astro` and `dist`: 71 pages generated and 843
  optimized image variants completed successfully.
- `@tailwindcss/typography` is installed and registered directly after the Tailwind
  import in `src/styles/global.css`.

## Generated-output checks

- Homepage: 33 editable primitives (shared header/footer).
- Representative blog article: 38 editable primitives, including headline,
  description, hero media, caption, quick read, and `@content`.
- Representative Help article: 35 editable primitives, including title and
  `@content`.
- Both `<editable-component>` wrappers survive static generation on every standard
  page.
- `dist/_astro/registerComponents.*.js` contains `site-header`, `site-footer`, and
  the Astro editable-regions renderer.

## Browser smoke tests

The production preview was opened at 1280 x 720 for a media-rich blog post and the
Help welcome article. Both pages had full-width header/footer/article rendering,
no horizontal overflow, the expected content/image regions, and no console warnings
or errors.

## CloudCannon-side handoff

After repository sync, a team member with CloudCannon access must still verify:

1. The site uses Node from `.nvmrc`, `pnpm install --frozen-lockfile`, `pnpm build`,
   and `dist` output.
2. A blog sentence and hero image can be changed, saved, and reopened in both the
   Visual and Content editors.
3. One Help snippet can be inserted, reordered, saved, and reopened.
4. Header/footer data changes re-render in the Visual Editor and publish through the
   normal review workflow.
5. Team accounts and roles are used; no shared passcode is created.
