# CloudCannon migration audit

Date: 2026-07-14

## Architecture

- Framework: Astro 6.3.8, TypeScript strict, static output (the default `output` mode).
- Runtime: Node 24 (`.nvmrc` and Netlify); package manager: pnpm 11.
- Build: `pnpm build`; output: `dist`; existing host: Netlify.
- Integrations: React 19, MDX, sitemap, Tailwind CSS v4, and Sharp.
- Client JavaScript: marketing pages use Astro and small vanilla scripts. The only React island is the internal `/styleguide` counter. `ClientRouter` provides Astro view transitions globally.
- Environment variables: none used by the site build.
- Images: 45 page/component files use `astro:assets`; source images live under `src/assets` and must remain there so Astro can transform them.

`npx @cloudcannon/cli configure detect-ssg` reported Hugo (369) narrowly ahead of Astro (350). That is a false positive: the repository has `astro.config.mjs`, Astro page routes, Astro content collections, and an Astro build command. The detector and the bundled audit script also traversed `.claude/worktrees/**/node_modules`, so their collection detection output is not authoritative. This migration is intentionally configured as Astro.

## Existing content model

`src/content.config.ts` defines six schema-validated Astro collections:

| Collection     | Files | Format       | Rendering model                                    |
| -------------- | ----: | ------------ | -------------------------------------------------- |
| `blog`         |     4 | Markdown/MDX | Body content plus structured article metadata      |
| `caseStudies`  |     8 | YAML         | Data-only, rendered by a fixed case-study template |
| `help`         |    11 | Markdown/MDX | Body content plus help metadata                    |
| `narrators`    |    30 | JSON/YAML    | Data-only, rendered by a fixed narrator template   |
| `series`       |     4 | YAML         | Data-only, rendered by a fixed series template     |
| `testimonials` |     3 | JSON/YAML    | Shared data consumed by testimonial blocks         |

The blog MDX files use `Figure`, `PullQuote`, `ResourceCard`, `StatRow`, and `AudioPractice`. Help MDX uses `Callout`, `Steps`/`Step`, `CardGrid`/`Card`, `LinkCards`, `Accordion`, and `HelpFigure`. These require CloudCannon snippets; raw MDX component syntax is not an acceptable editor experience.

No existing frontmatter is co-located with Astro page components. There is currently no `src/cloudcannon/componentMap.ts`, no `cloudcannon.config.*`, and no editable-region integration.

## Route and page census

The repository has 19 Astro route files. Dynamic routes generate 57 detail pages from content, and 14 public static routes are generated directly, for an estimated 71 public pages before pagination or future content.

| Route file                            | Classification                                | Proposed CloudCannon model                             |
| ------------------------------------- | --------------------------------------------- | ------------------------------------------------------ |
| `src/pages/index.astro`               | Unique marketing page, 10 sections            | Page-builder entry                                     |
| `src/pages/about.astro`               | Unique marketing page, 11 sections            | Page-builder entry                                     |
| `src/pages/contact.astro`             | Unique marketing page, 5 sections             | Page-builder entry                                     |
| `src/pages/districts.astro`           | Unique marketing page, 13+ sections           | Page-builder entry                                     |
| `src/pages/faq.astro`                 | Unique marketing page with large FAQ data set | Page-builder entry                                     |
| `src/pages/platform.astro`            | Unique marketing page, 10 sections            | Page-builder entry                                     |
| `src/pages/research.astro`            | Unique marketing page, 9 sections             | Page-builder entry                                     |
| `src/pages/newsroom.astro`            | Automated listing from blog/case studies      | Page entry; items stay in their source collections     |
| `src/pages/blog/index.astro`          | Automated listing with editable masthead copy | Page entry; items stay in `blog`                       |
| `src/pages/case-studies/index.astro`  | Automated listing with editable masthead/CTA  | Page entry; items stay in `caseStudies`                |
| `src/pages/help/index.astro`          | Automated listing with editable hero/banner   | Page entry; items stay in `help`                       |
| `src/pages/narrators/index.astro`     | Automated listing with editable hero/CTA      | Page entry; items stay in `narrators`                  |
| `src/pages/404.astro`                 | System page                                   | Keep hardcoded                                         |
| `src/pages/styleguide.astro`          | Internal, `noindex` design-system catalog     | Keep hardcoded                                         |
| `src/pages/blog/[...slug].astro`      | Fixed collection template                     | Register article components and body region            |
| `src/pages/case-studies/[slug].astro` | Fixed collection template                     | Register template components against collection fields |
| `src/pages/help/[slug].astro`         | Fixed collection template                     | Register article components and body region            |
| `src/pages/narrators/[slug].astro`    | Fixed collection template                     | Register template components against collection fields |
| `src/pages/series/[slug].astro`       | Fixed collection template                     | Register template components against collection fields |

Header and footer labels, links, contact information, and social links are editor-visible shared UI. They should move to a schema-shaped data file and be exposed through `data_config`, not duplicated into page entries.

## Editable primitive versus computed value census

- Blog detail: title, description, author, dates, hero, tags, quick read, FAQ, and body are direct collection fields and are editable candidates. Reading-time, SEO fallbacks, related-post selection, and structured data are computed and stay outside editable wrappers.
- Help detail: title, blurb, group, keywords, and body are direct fields. Reading time, table of contents, previous/next navigation, and SEO fallbacks are computed.
- Case-study detail: the district/story/gallery/FAQ/CTA structures are direct fields. SEO fallbacks, optional-section branching, chart transforms, and related-story selection are computed.
- Narrator detail: identity, photos, intro, facts, Q&A, practices, languages, and quote are direct fields. Photo/alt fallbacks, headings, sibling selection, and derived metadata are computed.
- Series detail: hero, audience, stats, practices, benefits, testimonial, and CTA are direct fields. SEO fallbacks and related-series selection are computed.
- Unique marketing pages currently define structured data in Astro frontmatter and pass it into section components. Those data objects are direct editable primitives after relocation into page entries. Layout decisions, class names, generated URLs, imported image metadata, and conditional presentation remain computed code.

Editable wrappers will use direct collection/page data or registered component props. Computed strings will remain outside editable wrappers; the target is zero computed interpolations inside CloudCannon editable regions.

## Content and rendering risks

- Some headings currently use trusted HTML strings (`titleHtml`, `<em>`, `<span>`, and `&nbsp;`). These should be modeled as semantic text parts or controlled snippet/template inputs rather than generalized raw HTML.
- Many sections start hidden and reveal via IntersectionObserver (`data-home-reveal`, `data-cs-reveal`, `data-sr`, `data-anim`, `.reveal`). The CloudCannon visual editor needs an editor-only fallback so content never remains hidden in the iframe.
- Dynamic routes contain computed fallbacks and conditional sections. Visual-editing regions must be attached to direct fields/registered components, not the computed output.
- The existing content schemas are valuable validation boundaries and should be preserved rather than replaced with untyped page blobs.
- Shared header/footer data affects every page and needs a small, dedicated global data model.

## Migration sizing

CloudCannon's migration sizing thresholds produce two positive signals:

- More than 30 generated pages: **yes** (approximately 71).
- More than 15 page conversions: **no** (12 editor-facing static/listing page conversions, plus shared global data).
- More than 5 distinct collections: **yes** (6 current collections plus shared data configuration).

Because two thresholds are met, this is a medium/large migration. The recommended implementation order is recorded in `.cloudcannon/migration/plan.md`. The site owner explicitly requested a complete migration and main-branch synchronization in this task, so the phases will be executed in one branch while preserving the staged boundaries in documentation and verification.

## Audit decisions

1. Keep Astro static output and the existing Netlify-compatible build.
2. Preserve all six Astro collections and their Zod schemas.
3. Preserve the current editorial collections in this migration; treat `pages` as the
   documented page-builder follow-on rather than shipping a partial or source-editable
   approximation. Newsroom cards remain derived from blog/case-study entries.
4. Move shared navigation/footer content to a global data file exposed through `data_config`.
5. Configure MDX snippets for all existing editorial components.
6. Add CloudCannon visual editing with registered Astro components and explicit source paths.
7. Keep `/404` and `/styleguide` out of the CMS.
8. Verify both local production output and CloudCannon-side behavior after the repository is pushed.
