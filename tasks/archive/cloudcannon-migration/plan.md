# CloudCannon migration plan

This repository crosses two migration-sizing thresholds: approximately 71 generated pages and more than five collections. The work is therefore organized into independently verifiable stages, even though the site owner has authorized completing and publishing them together.

## Stage 1 — Foundation and representative content

- Add an explicit CloudCannon configuration for Astro, build settings, source editor paths, collections, global data, schemas, inputs, and collection URLs.
- Configure every MDX component used by blog/help content as an editor snippet.
- Migrate shared site data plus representative `pages`, `blog`, and `help` entries.
- Add visual editing to the shared layout and representative page/article templates.

Exit criteria: configuration validates, the site builds, representative entries can be edited without touching code, and preview/editor paths resolve correctly.

Status: complete locally. CloudCannon-side save/reopen verification follows the push.

## Stage 2 — Structured collections

- Register case-study, narrator, series, and testimonial schemas/templates; newsroom
  cards remain derived from blog/case-study entries.
- Add direct-source visual editing for fixed collection templates.
- Confirm image inputs preserve `src/assets` paths and Astro image processing.

Exit criteria: every current collection appears with useful labels, grouping, add/edit controls, and a working output URL.

Status: collection schemas, URLs, data models, and editor controls are complete.
Case-study/narrator/series inline section registration remains part of the visual
page-builder follow-on; their full data shapes are already editable in the sidebar.

## Stage 3 — Unique marketing pages

- Relocate structured page data into the `pages` collection without changing rendered copy or layout.
- Register reusable page sections as page-builder components where sections are genuinely reorderable.
- Keep computed layout logic, SEO transforms, and internal system pages in code.

Exit criteria: all editor-facing copy/media is source-backed, generated routes are unchanged, and no editable wrapper contains computed interpolation.

Status: explicitly deferred. The route-by-route gap is recorded in
`visual-editing.md`; raw source editables were rejected as an unsafe shortcut.

## Stage 4 — Production verification

- Run typecheck, lint, design-drift, formatting, CloudCannon configuration validation, and a production build.
- Check representative unique pages, listing pages, MDX pages, and every structured collection route.
- Push the verified main branch and complete CloudCannon-side visual-editor and content-editor smoke tests.

The repository checks can be completed locally. Login, project import/sync, editor iframe behavior, permissions, and publishing workflows require a human verification pass inside the connected CloudCannon site after push.

Status: local verification complete; CloudCannon-side smoke tests remain after sync.
