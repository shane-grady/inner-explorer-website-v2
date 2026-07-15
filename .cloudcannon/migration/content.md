# Content migration notes

Date: 2026-07-14

## Editorial content now managed by CloudCannon

- All six existing Astro content collections are represented explicitly in
  `cloudcannon.config.yml`, with Zod-compatible starter schemas and collection URLs.
- Navigation and footer copy/links moved into `src/data/navigation.json` and
  `src/data/footer.json`; the same files drive production rendering and CloudCannon's
  Data editor.
- Blog and Help MDX no longer contains source-level imports. `astro-auto-import`
  supplies the twelve approved components and CloudCannon supplies a structured
  snippet form for each one.
- Blog/help body content, article headings, descriptions, author fields, hero media,
  captions, and quick-read copy have inline Visual Editor regions.
- Case studies, narrators, series, and testimonials remain one schema-validated data
  file per entry and can be changed without editing Astro templates.

## Normalization performed

- Added explicit `draft: false` defaults to every current blog, Help, and narrator
  entry so the editor state is visible rather than implicit.
- Added empty narrator `facts`, `qa`, and `practices` arrays where optional profile
  sections were absent, matching both Zod and CloudCannon schema defaults.
- Normalized blog/case-study dates to ISO datetime strings so the CloudCannon
  datetime input and `z.coerce.date()` round-trip consistently.
- Added the missing article author on the morning-calm post.
- Replaced nested paired `Steps`/`Step` and `CardGrid`/`Card` MDX with structured
  array props. This avoids the unsupported `repeating` parser while preserving Add,
  remove, and reorder controls in snippet forms.

## Image handling

Optimized editorial uploads stay under `src/assets/images`. CloudCannon stores paths
relative to each content file, matching Astro's `image()` loader. MDX figures accept
repository-relative strings and resolve only files present in a constrained
`import.meta.glob`; arbitrary paths cannot reach the filesystem.

## Deliberate page-builder follow-on

The existing unique marketing routes still keep art-directed structured objects in
their Astro frontmatter. Moving roughly 4,800 lines of section data and imported
`ImageMetadata` into a `pages` collection is a distinct page-builder conversion.
Raw source editables were not used as a shortcut because they would be fragile and
contrary to the migration skill. The precise gap and route census are recorded in
`visual-editing.md` and `plan.md`.
