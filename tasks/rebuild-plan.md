# Inner Explorer website rebuild plan

> **Status (2026-10-09):** the clean-slate PR is done: the Help Center seal (A1) plus
> the cleanup below. **Next: the design-foundation PR** (end of this file), then one PR
> per page. Open items live in `tasks/todo.md`.
>
> Everything the clean slate removed is recoverable with `git show 0c8cac2:<path>`
> (0c8cac2 = `main` before it).

## Context

The new site design lives on the Claude Design canvas **"Inner Explorer — Website"** (https://claude.ai/artifact/6gx8tapeaDzTeSSMD7R31s, page **FINAL V**). It is built on the **"Inner Explorer Design System" (V2)** (https://claude.ai/artifact/DVAYqoSPn9uNeodz9HXVox), which replaced the older "Inner Explorer" system (https://claude.ai/artifact/XSmeot9ufJMTTvGDh3GYxz) on 9 Oct.

This repo was built for the previous design: 177 components (about 39k lines), a 6,930-line CloudCannon config bound to them, 13 page-schema YAMLs, and demo content. The marketing site is pre-launch on noindexed Netlify staging. help.innerexplorer.com is live and is built from this repo.

The Help Center is already sealed (commit `671ac5f`). `src-help/` owns frozen copies of everything it renders, and an ESLint rule forbids imports across the boundary.

**This PR clears the repo to a clean slate in one go.** Afterwards the repo holds:

- the bones: Astro, Netlify (both sites), GA4, Amplitude, Intercom, the HubSpot contact form, SEO, sitemap, redirects, CI;
- the sealed Help Center;
- the privacy policy;
- bare placeholder pages.

The new design foundation is the next PR, and is specified at the end of this file.

### Decisions

| Topic                        | Decision                                                                                                                                                                                              |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Help Center                  | Stays sealed and live; it is reskinned later.                                                                                                                                                         |
| CloudCannon                  | Help Center only. Marketing pages and blog posts leave the CMS.                                                                                                                                       |
| Content                      | **Keep only the privacy policy and the Help Center.** Delete every blog post and case study (with images and PDFs), plus all page YAMLs and demo collections. The canvas content replaces them later. |
| Pages outside the new design | Delete `/faq`, `/districts`, `/narrators/*`, `/series/*` and the `/blog/` index.                                                                                                                      |
| Dark mode                    | Light only. Removes the theme toggle and the no-flash script.                                                                                                                                         |
| Styling in this PR           | None. Placeholders are bare semantic HTML; the foundation PR brings the design.                                                                                                                       |
| Recovery                     | Every deleted file stays recoverable with `git show 0c8cac2:<path>` (`main` before the clean slate).                                                                                                  |

### Your manual step

**Right after merging:** set CloudCannon Site Settings › Builds › build command `pnpm verify:help`, output `dist-help`. The install command stays the same.

- The one build that runs before you flip the setting fails harmlessly; nothing live is served from CloudCannon.
- Rebuild, then check the editor shows only Help with no red cards.

---

## The clean-slate PR, as planned (done)

### 0. Record the starting point

- `main` before the clean slate is `0c8cac2` (tag it `pre-rebuild` if you like; the session that ran this could not push tags).
- Build baselines of `dist-help` from `0c8cac2` in a sibling worktree outside the repo, with `NETLIFY=true`. Use them for the final diff.

### 1. CloudCannon becomes help-only

1. **`astro.config.mjs`:** delete `cloudCannonHelpRoutes()`. CloudCannon will build the help site directly, at root URLs.
2. **`src-help/lib/help.ts`:** constant hrefs. `HELP_LINK_PREFIX` only served those injected routes.
3. **Rewrite `cloudcannon.config.yml`** from about 6,930 lines to about 700.
   - **Keep:**
     - the `help` collection (`url: /[slug]/`, `new_preview_url: /welcome/`)
     - the `data` collection, its glob limited to `[help-ui.json]`
     - `data_config.help-ui` and its `file_config` entry
     - `help_groups`, the help `_inputs`, `_editables` and `commit_templates`
     - the 5 help `_structures` and the 11 help `_snippets`
     - `collection_groups`, reduced to Help
   - **Re-home** the `&inline_html_options` and `&optimized_image` YAML anchors, which are defined in sections being removed.
   - **Help image uploads** go to `/src-help/assets/images/`, matching the help `content-images.ts` glob.
   - **Remove everything else:** the pages, blog, caseStudies, narrators, series and testimonials collections, the navigation and footer data, the marketing structures and the blog snippets.
4. **`.cloudcannon/`:**
   - `initial-site-settings.json`: build `pnpm verify:help`, output `dist-help`.
   - Rewrite `README.md` for help only.
   - Delete the marketing creation schemas and keep `schemas/help-article.md`.
5. **`scripts/check-editables.mjs` and its test.**
   - The script defaults to `dist-help` and reads `src-help/lib/help-collection.ts`.
   - Delete `EXPECTED_MARKETING_PAGE_IDS`, `checkMarketingPageContract` and its helpers, and the tests that cover them.
   - Reduce the `contracts` map in `checkCreationSchemas` to `help`; otherwise it reports `MISSING_CREATABLE_COLLECTION` for the removed collections. Delete or retarget the matching tests.
   - Keep the existing fixture for the generic tests.
6. **`scripts/verify-cloudcannon.mjs`:** default to `dist-help`.

### 2. Delete the old marketing layer and content

- **Components:** all of `src/components/` except `seo/{SEO,JsonLd,Analytics}.astro` and `integrations/{Intercom,HubSpotForm}.astro`.
  - That removes `blocks/` (including the help originals and `ComparisonTable`), `layout/`, `primitives/` and `islands/`.
  - Also delete `src/cloudcannon/**`.
- **Pages:** `faq`, `districts`, `narrators/**`, `series/**`, `blog/**`, `case-studies/[slug]` and `styleguide/`. The remaining routes are rewritten in step 3.
- **Styles and libraries:**
  - `src/styles/global.css`
  - `src/lib/{page-schemas/**,editable.ts,intersect.ts,help.ts,content-images.ts,reading-time.ts,cn.ts}`; help has its own copies
  - `src/data/{navigation,footer}.json`, plus their `.prettierignore` lines
- **Content: everything except `src/content/help/**`.\*\*
  - `pages/*.yml` (13)
  - `blog/*`: all 5 posts, including Dr. Bakosh's MTSS post and the student-athletes post, which are recoverable from the tag
  - `case-studies/*` (8)
  - `narrators/*` (30), `series/*` (4), `testimonials/*` (3)
- **Assets:**
  - all of `src/assets/images/`, plus `src/assets/intro/` and `src/assets/brand/`; help has its own copy of the mark
  - `public/audio/` and `public/downloads/`, the 7 legacy case-study PDFs
- **Keep in `public/`:** `fonts/*`, `favicon.ico`, `apple-touch-icon.png`, `logo.png`, `og-default.jpg`, `videos/help/**` (help needs them) and `videos/research/` (the new Research hero reuses it).
- **Tooling:** `scripts/gen-narrator-placeholders.mjs`, `src/icons/.gitkeep`, and `astro.config.shared.mjs` (nothing uses it after step 3).
- **Dependencies:**
  - Remove `@astrojs/react`, `react`, `react-dom`, `@types/react`, `@types/react-dom`, `lenis`.
  - Remove the React `jsx` settings from `tsconfig.json` and the tsx block from `eslint.config.js`.
  - Keep `tailwind-variants`, `clsx`, `tailwind-merge` and `@tailwindcss/typography`; the frozen help uses them.
- **Kept on purpose:** `agent/`, which CloudCannon wrote; the CMS stays in use for help.

### 3. The bare marketing shell (no styling)

- **`src/styles/site.css`:** just `@import 'tailwindcss' source('..');`. It scans only `src/`; the foundation PR fills it.
- **`src/layouts/BaseLayout.astro`** (rewritten in place).
  - Keep all of `<head>`: SEO, the Organization JSON-LD, favicons, `noindex` and canonical, the GA4 and Intercom production gating, the Amplitude script (same key), and the `head` slot.
  - Import `site.css`.
  - Remove `<ClientRouter />`, the dark-mode script and the CloudCannon loader.
- **`src/components/seo/Analytics.astro`:** without ClientRouter nothing fires `astro:page-load`, so switch GA4 to its automatic page view. Remove `send_page_view: false` and the `astro:page-load` listener. Help has its own copy, so it is unaffected.
- **`src/data/navigation.ts`:** typed nav and footer links for the new information architecture.

  | Area   | Links                                                                                                                                                                                                                                |
  | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
  | Nav    | Platform `/platform/` · Why Inner Explorer `/why-inner-explorer/` · Case studies `/case-studies/` · Research `/research/` · Pricing `/pricing/` · About `/about/` · Sign in `https://app.innerexplorer.com` · Contact us `/contact/` |
  | Footer | Newsroom `/newsroom/` · Help Center `https://help.innerexplorer.com/` · FAQ `https://help.innerexplorer.com/faq/` · Privacy policy `/privacy-policy/`                                                                                |

- **`src/layouts/PageLayout.astro`:** semantic, unstyled. It renders:
  - a skip link
  - `<header>` with a `<nav aria-label="Primary">` list from `navigation.ts`
  - `<main id="main">`
  - `<footer>` with the footer links and the "© 2011–{build year} Inner Explorer, Inc." line
- **Placeholder routes.** Each file has a `content` object at the top (title, description, one-line lead) and renders an `<h1>` plus the lead:
  - `/`
  - `/platform/`
  - `/why-inner-explorer/` (new)
  - `/research/`
  - `/case-studies/`
  - `/pricing/`
  - `/about/`
  - `/newsroom/`
- **`/contact/`:** keep it working.
  - Keep `HubSpotForm.astro`'s loader, `css: ''`, the portal and form IDs, the no-JS fallback and the success template.
  - Delete its `<style is:global>` block, which uses old tokens; the foundation styles the form.
  - Move the copy it needs from `contact.yml` (`form.confirmation`, the support email, the Help Center link) into the page's `content` object.
  - Keep the ContactPage JSON-LD.
- **`/privacy-policy/`:** renders `src/content/help/privacy-policy.mdx`, with the canonical exactly `/privacy-policy/` and the WebPage and BreadcrumbList JSON-LD.
  - New minimal `src/components/content/Callout.astro` (an `<aside>` with its label) and `HelpTable.astro` (a scrollable table wrapper).
  - The page passes a `components` map that renders every other help snippet name (Accordion, Steps, Card and so on) as a plain wrapper that keeps its content visible. A CMS edit to that shared file can then neither break the build nor hide legal text.
- **`/404`:** a minimal page with links home and to the Help Center.
- **`src/content.config.ts`:** only `help`, defined as `defineCollection({ loader: glob({ pattern: 'privacy-policy.mdx', base: './src/content/help' }), schema: helpCollection.schema })`. Never narrow the shared `src/lib/help-collection.ts`. `astro check` also needs `help` registered to type `src-help`.

### 4. Config, scripts and redirects

- **`astro.config.mjs`:**
  - integrations: `AutoImport({ imports: [Callout, HelpTable] })`, `mdx()`, `sitemap()`
  - `prefetch: { prefetchAll: true, defaultStrategy: 'hover' }`
  - the Tailwind Vite plugin
  - the redirects below
  - no `react()` and no `editableRegions()`
- **`package.json` scripts:**
  - `verify` = `check && build && check:dist dist --classes`
  - `verify:help` = `validate:cloudcannon && build:help && lint:editables && check:dist dist-help`, without the repo-wide `check`, so marketing lint never blocks a help deploy
  - `check` gains `test:editables` (`node --test scripts/check-editables.test.mjs`)
  - delete `verify:cms`
- **Netlify and CI:**
  - `netlify.toml` runs `pnpm verify`.
  - `sites/help/netlify.toml` runs `pnpm verify:help`.
  - `.github/workflows/ci.yml` keeps one job named `verify` that runs `pnpm verify && pnpm verify:help`, so no branch-protection change is needed.
- **`.prettierrc.json`:** `tailwindStylesheet: ./src/styles/site.css`, plus an override for `src-help/**` that points at `src-help/styles/help.css`.
- **Redirects (`netlify.toml`).** New rules are `force = true`, and the static ones are mirrored in Astro's `redirects` for dev and preview.

  | From               | To                                    |
  | ------------------ | ------------------------------------- |
  | `/faq`, `/support` | `https://help.innerexplorer.com/faq/` |
  | `/districts`       | `/why-inner-explorer/`                |
  | `/blog`            | `/newsroom/` (index only)             |
  | `/resources`       | `/newsroom/`                          |
  - Delete the dead `/pricing` → `/contact` rule.
  - Keep `/help`, `/help/*` and `/privacy`.
  - Keep the stand-ins (`/educators`, `/app`, `/careers`, `/donate`, `/newsletter`) with trailing-slash targets.
  - `/narrators`, `/series` and the old post and case-study URLs only ever existed on noindexed staging, so they get no redirect. The legacy innerexplorer.com URLs belong to the launch 301 map.

- **`.claude/launch.json`:** regenerate it down to the main dev server, help dev, and the two preview servers.

### 5. Docs

- **`CLAUDE.md`** (rewritten, short and current):
  - **What's here now:** the bones, the sealed Help Center (`src-help/README.md`), and placeholder pages.
  - **Design sources:** the canvas URL with its FINAL V page, and the design-system URL.
  - **The rules that still apply:** WCAG 2.2 AA, minimal JavaScript (no React by default), SEO through the layouts, page copy as structured data at the top of each page file.
  - **Commands:** `verify`, `verify:help`, `check:dist`, `compare:builds`.
  - **Next step:** the foundation PR in `tasks/rebuild-plan.md`.
  - Drop all references to deleted components and tokens, and the stale "subagents fail" note.
- **`DESIGN.md`:** replace it with a stub that points to the design system and `tasks/rebuild-plan.md`. The foundation PR writes the real one.
- **`README.md`:** real setup instructions in place of the Astro starter text.
- **Skills:**
  - Put a "stale until the foundation PR" banner on `.claude/skills/implement-design-handoff/SKILL.md`.
  - Put a "stale until the Case Studies PR" banner on `transfer-case-study/SKILL.md`.
- **`tasks/`:**
  - Move `todo.md` to `tasks/archive/`. Start a slim `todo.md` with: the canvas's "Before build — confirm" notes, the legacy 301 map (from `seo-playbook.md`), launch noindex removal, and HubSpot owner items.
  - Archive the obsolete `lessons.md` sections (the Framer and Lenis intro, React islands, the dark-mode subtree hacks, the glass-pill nav, the per-case-study builds) into `tasks/archive/`.
  - Update `tasks/rebuild-plan.md` to this document.
- **`docs/`:**
  - `cms-publishing-workflow.md`: only help paths are editor-owned.
  - `cloudcannon-recovery-2026-09-02.md`: fix its `verify:cms` reference.

---

### As executed: where the PR differs from the steps above

- **No `pre-rebuild` tag.** The session could only push its own branch, so the docs use
  the commit SHA (`0c8cac2`) instead. Tag it yourself if you want the name:
  `git tag pre-rebuild 0c8cac2 && git push origin pre-rebuild`.
- **No AutoImport on the marketing site.** `/privacy-policy/` builds its `components`
  map from the tags the article body uses (plain `Callout` and `HelpTable`, a generic
  `Snippet` stand-in for anything else) and resolves its links against the Help Center,
  so `astro.config.mjs` needs only `mdx()` and a CMS edit can't break the page.
- **One help schema.** `helpCollection.schema` lost its types, so
  `src-help/lib/help-collection.ts` exports `helpArticleSchema` and
  `src/content.config.ts` builds the narrowed collection from it: the one marketing
  import from `src-help/` that ESLint allows. There is no marketing copy to drift.
- **HubSpotForm lost its class hooks** along with its stylesheet (`check-dist --classes`
  rejects classes with no CSS); the loader keys off `data-hsform*` attributes.
- **ClientRouter-only code went too:** the Intercom and HubSpot re-init listeners, the
  CloudCannon `inEditorMode` guards on marketing analytics, SEO's unused `canonical`
  prop, and the unused schema.org builders (article, person, FAQ).
- **`.cloudcannon/migration/*.md`** (phase docs from moving the old site into
  CloudCannon) moved to `tasks/archive/cloudcannon-migration/`.
- **`build:all`** was removed with `verify:cms`.
- **`/contact/`** keeps the "Already using Inner Explorer?" support copy below the form.
- **CloudCannon config:** `help_figure.src` drops `uploads_use_relative_path` (it would
  save `../../../src-help/...` paths the help image glob rejects), and
  `.cloudcannon/styles/editor.css` is deleted (its one style only applied to marketing
  headlines). `paths.uploads` is `src-help/assets/images`.
- **check-editables** also dropped its `/help/` link check (`check-dist dist-help` catches
  broken root links), and its snippet scan now covers array-prop snippets it used to skip
  (15 of 45 usages).

## Verification

- **Gates:** `pnpm verify && pnpm verify:help` pass, including typecheck, lint, the help import boundary, drift, mirrors, format, `validate:cloudcannon`, the editables checks and both `check:dist` runs.
- **Help untouched:** run `compare:builds` on the `origin/main` baseline `dist-help` against the new one, both built with `NETLIFY=true`.
  - Expect only the post-A1 changes: the loader and its stylesheet removed, one chunk renamed.
  - `--css-classes` must report nothing.
  - Screenshots of 7 help pages must match within render noise.
- **Content:** `src/content/` holds only `help/`. `/privacy-policy/` renders the full legal text; compare its text with the help article's.
- **Contact form:** on `pnpm preview`, `/contact/` renders all 8 HubSpot fields inline (no iframe), and the success template is present. Do not submit.
- **GA4** (local only; GA never runs on `*.netlify.app`):
  - Build with `CONTEXT=production` and a placeholder measurement ID.
  - Assert that `window.dataLayer` has a `config` call without `send_page_view: false`, and that `gtag/js` was requested.
- **JavaScript:** `grep -rhoE '/_astro/[^"]+\.js' dist --include='*.html' | sort -u` shows only Amplitude, HubSpot's loader on `/contact/`, and prefetch. No React.
- **Redirects:** on the deploy preview, `curl -sI` `/faq`, `/support`, `/districts`, `/blog` and `/resources` return 301 to their targets.
- **SEO:** every route has a canonical and OG tags, and the sitemap lists only real pages.
- **After merge** (with the CloudCannon setting flipped): the CloudCannon build passes, the editor shows only Help with no red cards, the 11 snippets are listed, and Syncs is clean.

**Rollback:** `git revert -m 1 <merge>`, then set CloudCannon's build back to `pnpm verify:cms` with output `dist`. No editor-owned file moves.

---

## Next PR: the design foundation (reference, not part of this PR)

Built on the clean slate. One rule ties it together: code uses the design system's own token names, `type-*` styles and `ie-*` classes, so the design system's docs and the code all say `foreground`, `surface`, `brand-emphasis`, `type-body`, `ie-btn-primary`, `space-6`. The system's components are React previews; their markup and classes are what the Astro components port.

### Board inventory and vendored inputs

- **`design/inventory.md`:** one table of every repeating pattern across the 39 FINAL V boards: `pattern | boards | component name | status`. The design system's README already lists what is in the system and which one-page patterns stay in page builds; build the table from it and the boards, and flag the off-token values on the Research and Pricing boards.
- **Vendored files (never hand-edited):**
  - `design/tokens.json` and `design/components/bundle.css` (the `ie-*` component classes), verbatim from the design system.
  - `design/README.md` with the sources and the sync steps.
- **Fonts and logos:**
  - The 9 woff2 fonts (Inter 400/500/700/900, Libre Caslon Condensed 500 and 500 italic, Libre Caslon Text 400, 400 italic and 700) go into `src/assets/fonts/`.
  - The 4 logo PNGs (`lockup-primary`, `lockup-reversed`, `lockup-reversed-small`, `mark-compass`) go into `src/assets/brand/`.

### Token CSS and theme

**`scripts/tokens.mjs`** writes `src/styles/tokens.css`.

- It emits `@font-face` rules from `type.fonts`, plus `:root` with the design system's exact variable names (one light theme).
- `{ref}` values become `var(--ref)`.
- It rejects values containing `;`, `{` or `}`.
- `--check` runs in `check`, and the output file is prettier-ignored.

**`src/styles/theme.css`** is hand-written; it is the only place Tailwind meets the design system.

- **Reset only the namespaces the design system replaces:** `--color-*`, `--font-*`, `--text-*`, `--radius-*`, `--shadow-*`.
  - Tailwind's spacing (4px, so `p-6` equals `space-6`), breakpoints, leading, tracking, containers and eases stay.
  - Re-declare `white`, `black`, `transparent` and `current`.
- **Color aliases in `@theme inline`,** so utilities read the variable at the element: `--color-foreground: var(--foreground)` gives `text-foreground`; likewise `bg-surface`, `bg-tint`, `text-brand-emphasis`, `border-border`.
  - The raw palette is exposed for surfaces and data visualization (`bg-green-800` for Forest); the neutral palette is not.
  - Never use `var(--color-…)` in CSS.
- **`@theme static`** for `--font-sans`, `--font-serif`, `--font-display`, `--radius-sm`, `--radius-md`, `--radius-full` and the shadows.
- **Fluid values** use one clamp from 390px to 1440px between a token and its `-mobile` twin, which matches both boards exactly. For example, `--spacing-section: clamp(4rem, calc(4rem + 48 * (100vw - 390px) / 1050), 7rem)` from `section-y` and `section-y-mobile`.

  | Spacing token | 390 → 1440 |
  | ------------- | ---------- |
  | section       | 64 → 112   |
  | gutter        | 20 → 120   |
  | hero-top      | 40 → 72    |
  | hero-bottom   | 48 → 96    |
  | strip         | 40 → 64    |
  | card          | 20 → 24    |
  | CTA padding   | 32/24 → 72 |

  The container is `mx-auto max-w-page px-gutter`.

- **Type ramp:** one `@utility` per design-system style, named as in the system (`type-page-title`, 40→64), fluid between the style and its `-mobile` twin: hero-display, hero-display-serif, page-title, section-title, card-title-lg/md/sm, lead, body, small, article-body, quote, pull-quote, eyebrow, label, breadcrumb, tag, stat-xl/lg/md/sm.
- **`.ie-on-brand`** (from the vendored `bundle.css`) switches text and the focus ring on Forest and Emerald panels.
- **Site-only values** are commented `provisional` and listed in `DESIGN.md`.

**`site.css`** imports, in order:

1. `tailwindcss` with `source('..')`
2. `tokens.css`
3. `theme.css`
4. `base.css` (focus ring, links, reduced motion, `scroll-padding-top`)
5. the vendored `bundle.css`, imported with `layer(components)` so utilities win
6. `components.css`: only what the system doesn't own, with values only from `var(--…)`; chiefly HubSpot's form markup mapped onto the `ie-field-*` look

### Components (`src/components/`, decided and shared only)

The design system's 24 components, ported to Astro with the same markup and `ie-*` classes:

- **`ui/`**
  - Actions: `Button` (primary, secondary, light, ghost; md or sm), `ArrowLink`, `IconButton`, `Chip` (filter or show-more).
  - Type: `Eyebrow`, `AccentBar`, `PageTitle` (H1, emphasis words, accent bar, lead), `SectionHeader` (stacked or split), `Breadcrumb`.
  - Icons: `Icon` (the 2px outline interface set from the boards) and `FeatureIcon` (Phosphor 2.1.1 fill from `@phosphor-icons/core`; bare or the 48px Emerald disc).
  - Content: `Card` (raised or floating; media with overlay label; linked), `Panel` (tint, Emerald, Forest), `Tag`, `Stat`, `Checklist`, `TextField`.
  - Site plumbing the system leaves to the site: `Container`, `Section` (background, surface, tint, Emerald or Forest; section, hero or strip spacing), `Logo`, `VisuallyHidden`.
- **`layout/`**
  - `SiteHeader`: light or dark, current page, skip link; 64→80px tall.
  - `MobileMenu`: a native `<dialog>` with a few lines of JavaScript.
  - `SiteFooter`: Footer A; social links hidden until they have URLs.
  - `StickyBar`: cta or prompt.
- **`blocks/`:** `ClosingCta` (Emerald or white, optional photo; inset, bleed) and `Testimonial` (card or panel).
- **`content/`:** `Prose` for Article bodies and the privacy policy.
- **`/styleguide/`** (noindex): swatches, the type ramp and every component in every state.
- **Guards:**
  - no `<style>` blocks;
  - `style=` sets only `--*` properties or `object-position`;
  - no raw colors or lengths in `base.css` or `components.css`;
  - `pnpm shots` (Playwright plus axe, screenshots at 1440 and 390, Amplitude blocked).

### Page-PR playbook (goes into `CLAUDE.md` with the foundation)

1. **Map before coding.** List each board section as existing component, new variant, new shared block or page-only, using `design/inventory.md`. List each off-system value and how it was resolved.
2. **Where code goes.**
   - Page files hold a `content` object at the top, then `<Section>`s, then JSON-LD (port it from `0c8cac2`).
   - Component folders: `ui/` (single elements), `layout/` (site chrome), `blocks/` (patterns on two or more boards), `content/` (MDX).
   - No per-page folders. Name components by pattern, never by page.
3. **Styling.**
   - Utilities handle layout and spacing.
   - Token utilities handle single visual values.
   - `ie-*` classes handle multi-property patterns and interaction states.
   - Variants are a prop mapped to classes through an `as const` object.
   - No `<style>` blocks and no arbitrary values.
4. **Values not in tokens.**
   - Colors must equal a token; otherwise, ask.
   - Text uses `type-*`.
   - Spacing within 4px snaps to the nearest token. Anything else becomes a `provisional` site token.
5. **Behavior:** vanilla `<script>` on `data-*` attributes. No React.
6. **Images:** in `src/assets/images/<page>/`, rendered through `<Image>`.
7. **Done means:** `pnpm verify`, then `pnpm shots` beside the boards, axe clean, and `/styleguide/` and the inventory updated.

### Page order after the foundation

1. Contact
2. Home
3. Platform
4. Why Inner Explorer
5. Case Studies: a new collection from the canvas content model; the 7 stories come from the "Case Study Detail Working" boards; restore the PDFs from the tag if the design keeps the gated PDF
6. Newsroom and Article: a new collection; the 18 legacy posts word for word from the "Blog Posts Working" boards; the legacy blog 301s
7. Research
8. Pricing: build the comparison table in this PR from the Pricing boards (the older system's `PricingTable` spec is the reference), with `pricing.yml` restored from the tag
9. About

**Then launch:** the legacy 301 map, removing noindex, the favicon from `mark-compass`, the Help Center reskin, and CMS editing for marketing if wanted.

### Design decisions (resolved 9 Oct)

| Question                                           | Decision                                                                           |
| -------------------------------------------------- | ---------------------------------------------------------------------------------- |
| Big stat-number faces                              | Faces as each page draws them (serif, bold or medium); one size ramp, 112/72/56/44 |
| Feature icon holder                                | Bare `icon-accent` icon, or the 48px Emerald disc on light grounds                 |
| Accent-bar gap                                     | 8px, as wide as the title's longest line                                           |
| Input radius                                       | 12px (`radius-md`), as the Component Library decided                               |
| Primary CTA label                                  | "Contact us"; never "demo"                                                         |
| Mobile menu open state                             | The system's `MobileMenu` (not drawn on the boards)                                |
| Footer A versus B, the 501(c)(3) line, social URLs | Footer A; social links hidden until URLs exist; the 501(c)(3) line is still open   |
