# Visual editing census

Date: 2026-07-14

This census is the hard gate for CloudCannon editable-region work. It distinguishes
values that can be edited directly from values that are derived by Astro, and it
records the exact coverage of this migration before any `data-editable` attribute
is added.

## Region plan

| Surface                  | Visible content source                                  | Visual-editor treatment                                                                                                                 | Computed/sidebar-only values                                                                                                                      |
| ------------------------ | ------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| Shared header            | `src/data/navigation.json`                              | Registered `site-header` component bound to `@data[navigation]`; nested array/text regions for labels                                   | Active-route state, theme control, icons, and responsive behavior stay computed                                                                   |
| Shared footer            | `src/data/footer.json`                                  | Registered `site-footer` component bound to `@data[footer]`; nested array/text regions for tagline, groups, link labels, and legal copy | Current year and brand mark stay computed                                                                                                         |
| Blog detail              | `src/content/blog/*.{md,mdx}`                           | Inline primitives for headline, description, category, author fields, hero image/caption, plus a block editor for `@content`            | Dates, reading time, TOC, related posts, SEO fallbacks, and JSON-LD stay sidebar-only/computed                                                    |
| Help detail              | `src/content/help/*.mdx`                                | Inline primitives for title and a block editor for `@content`                                                                           | Group label, reading time, TOC, previous/next links, SEO fallbacks, and JSON-LD stay sidebar-only/computed                                        |
| Blog/help MDX components | MDX body plus CloudCannon snippet data                  | Snippet forms configured for every component; nested content remains part of the `@content` region                                      | Component presentation stays in Astro                                                                                                             |
| Case-study detail        | `src/content/case-studies/*.yaml`                       | Fully editable in the Data/Visual sidebar through the collection schema; no unsafe primitive wrappers around computed templates         | Optional branches, charts, image transforms, related story, and SEO fallbacks require registered section boundaries in the page-builder follow-on |
| Narrator detail          | `src/content/narrators/*.{json,yaml,yml}`               | Fully editable in the Data/Visual sidebar through the collection schema                                                                 | Optional branches, fallbacks, cross-entry selection, and audio UI require registered section boundaries in the follow-on                          |
| Series detail            | `src/content/series/*.yaml`                             | Fully editable in the Data/Visual sidebar through the collection schema                                                                 | Optional branches, image transforms, and related-series selection require registered section boundaries in the follow-on                          |
| Testimonials             | `src/content/testimonials/*.{json,yaml,yml}`            | Data editor; entries have no canonical detail page                                                                                      | Cross-page placement is controlled by page templates                                                                                              |
| Collection indexes       | Collection entries plus page-local structured constants | Collection cards remain navigable to their source entries; page-local masthead/CTA copy is not yet inline editable                      | Sorting, filtering, and counts stay computed                                                                                                      |
| Unique marketing pages   | Structured constants in each `.astro` route             | No source-editable shortcut. These require relocation to a `pages` collection and registered page-builder blocks                        | Layout, animation, imported assets, and structured data stay in code                                                                              |
| `/404` and `/styleguide` | System/developer templates                              | Deliberately excluded from CloudCannon collections                                                                                      | Entire surface is system/developer-owned                                                                                                          |

## Required implementation in this migration

1. Install the Astro editable-regions integration and load component registration
   only when `window.inEditorMode` is present.
2. Register the shared header and footer with prop contracts that also preserve
   their normal JSON defaults.
3. Add complete primitive coverage to shared navigation/footer labels and the
   blog/help article templates.
4. Ensure every region has a corresponding `_inputs` definition and every direct
   content path maps to the collection URL CloudCannon uses.
5. Add editor-only animation overrides so content cannot remain hidden after a
   live re-render.

## Explicit remaining gap

The unique marketing routes contain roughly 4,800 lines of bespoke, art-directed
page composition and imported `ImageMetadata`. Treating their output as raw source
editables would violate the migration skill's page-builder rule and would give staff
a fragile editing experience. They remain a visible, documented Stage 3 conversion:
move their structured objects into a `pages` collection, replace imported image
objects with validated repository paths, and register each reusable page section.

The current migration therefore solves the requested editorial workflow—blog/help
sentence and media changes, collection data, and shared navigation/footer—without
claiming that every marketing-page section has already become a page builder.
