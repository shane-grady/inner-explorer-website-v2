# Configuration phase notes

Date: 2026-07-14

## Files added

- `cloudcannon.config.yml` — explicit Astro collections, URLs, editor ordering, inputs, structures, snippets, image paths, toolbar settings, and sidebar groups.
- `.cloudcannon/initial-site-settings.json` — Astro, Node-from-`.nvmrc`, pnpm install/build, and `dist` output.
- `.cloudcannon/schemas/*` — safe starting templates for each creatable content type.
- `.cloudcannon/styles/editor.css` — semantic inline emphasis available to controlled HTML headline fields.
- `.cloudcannon/README.md` — non-technical dashboard and editing guidance.

The CLI-generated baseline was discarded because it incorrectly set `source` to a nested Babel dependency inside `.claude/worktrees` and did not create initial build settings. The final configuration deliberately omits `source` and uses the repository's actual Astro paths.

## Collections and URLs

- Blog: `/blog/[slug]/`; Visual, Content, and Data editors; new drafts open in Content.
- Case studies: `/case-studies/[slug]/`; Visual and Data editors.
- Help Center: `/help/[slug]/`; Visual, Content, and Data editors; new drafts open in Content.
- Narrators: `/narrators/[slug]/`; Visual and Data editors.
- Practice series: `/series/[slug]/`; Visual and Data editors.
- Testimonials: data-only; no output URL.

All page-producing URLs match Astro's directory-format output and include trailing slashes.

These are uniform collections, so their editor contracts remain on the collection
itself. Their friendly Add actions use `add_options.default_content_file` to seed new
entries from `.cloudcannon/schemas/*`; they deliberately do not declare collection
`schemas`. Hosted readback showed that a sole schema can apply ongoing input
maintenance to existing entries, while a default content file is creation-only.
Testimonials follows the same pattern even though it has no output URL.

Each collection also has an explicit, collision-safe Create Path. CloudCannon's
default path ends in `.md`, which would bypass the YAML-only loaders for Case Studies,
Narrators, Series, and Testimonials. Blog and Help explicitly create `.mdx` files so
their registered MDX snippets remain available. The CMS contract guard fixes both the
extension and the filename source (`title`, `name`, or the case-study title lead).
Generic drafts also start without person-specific portraits, district seals, or source
references. When those fields are used, editors supply the real asset or citation
rather than inheriting a misleading identity.

## MDX pipeline

The site now uses `astro-auto-import` before `mdx()` so editorial files contain no import statements. Every capitalized component currently present in blog/help MDX has an explicit CloudCannon snippet definition:

- Blog: `PullQuote`, `Figure`, `StatRow`, `ResourceCard`, `AudioPractice`.
- Help: `Callout`, `HelpFigure`, `LinkCards`, `Accordion`, `ActionLinks`, `Steps`, `CardGrid`.

The current CloudCannon JSON schema rejected the installed skill's documented `repeating` parser. `Steps` and `CardGrid` were therefore normalized to self-closing components with structured array props. This is schema-valid, gives editors an Add/Reorder form for each item, and preserves the rendered page.

The one blog figure that imported an image variable now stores a repository-relative image path. `Figure` and `HelpFigure` resolve these paths through a constrained `import.meta.glob`, preserving Astro image optimization and preventing arbitrary filesystem access.

## Verification

- Current CloudCannon configuration schema files downloaded before authoring and ignored from Git.
- `npx @cloudcannon/cli validate`: configuration and initial site settings valid.
- MDX component inventory: 12 component names, 12 explicit snippet definitions.
- Content MDX import inventory: zero remaining imports.
- `pnpm build`: 71 pages, all dynamic collection URLs generated successfully.

CloudCannon-side snippet insert/save/reopen tests still require the connected project UI after the branch is pushed.
