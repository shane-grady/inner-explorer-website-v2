# Rebuild plan: clear the repo for the Inner Explorer rebuild

> Approved 2026-10-09. The execution spec for PRs A1, A2, B1, B2 and the page PRs. Check items off in the PR descriptions; update this file if a decision changes.

## Context

The new site design is on the Claude Design canvas **"Inner Explorer — Website"** (https://claude.ai/artifact/6gx8tapeaDzTeSSMD7R31s). Its **FINAL V** page holds the 39 canonical desktop and mobile boards. The canvas is built on the **"Inner Explorer" design system** (https://claude.ai/artifact/XSmeot9ufJMTTvGDh3GYxz), which holds `tokens.json`, the fonts, the logos, the rules (README, accessibility) and the component CSS (`bundle.css`).

The design is almost entirely new:

- Emerald and Forest greens on a #f7f7f5 ground
- Inter, with Libre Caslon for display
- a fixed type ramp
- two card types and four button roles
- one accent bar
- fixed section spacing

Today's repo was built for the previous design. It has 177 components (about 39k lines, mostly per-page scoped CSS), a 6,930-line CloudCannon config bound to those sections, 13 page-schema YAMLs, and a lot of demo content. The marketing site is pre-launch on Netlify staging. The Help Center at help.innerexplorer.com is live and is built from the same repo.

**The goal:** a clean slate and a foundation that is easy to maintain, while keeping the bones:

- Astro, Tailwind, pnpm, Node 24
- both Netlify sites, with their redirects, headers and noindex edge functions
- GA4, Amplitude and Intercom
- the HubSpot contact form
- the SEO plumbing
- CI
- the live Help Center

### What you're approving

1. **The Help Center is sealed.** It gets its own copies of everything it uses and can't be affected by the rebuild. CloudCannon then edits the Help Center only.
2. **A new foundation is built next to the old site.** It covers tokens, fonts, components, header and footer, plus a `/styleguide`. You approve its look there before anything is deleted.
3. **Then the old marketing design layer is deleted.** That is about 44k lines and about 450 files. Every route shows the new header and footer with placeholder or interim content. Everything stays recoverable from a `pre-rebuild` git tag.
4. **After that, one PR per page,** built from its FINAL V boards by a written playbook.
5. **Working throughout:** analytics, the contact form, SEO and CI. The live Help Center doesn't change at all.

### Decisions made with you

| Topic                        | Decision                                                                                                                                                                     |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Help Center                  | Freeze and isolate now; reskin it later                                                                                                                                      |
| CloudCannon                  | Keep it for the Help Center only. Marketing pages and blog posts leave the CMS until it's reintroduced after the rebuild.                                                    |
| Rollout                      | Foundation first, then one PR per page. Staging is never broken.                                                                                                             |
| Dark mode                    | Light only. The dark values stay in the vendored `design/tokens.json` so dark mode can be generated later.                                                                   |
| Pages outside the new design | Keep only `/privacy-policy`. Delete `/faq`, `/districts`, `/narrators/*`, `/series/*` and the `/blog/` index. Each gets a redirect except `/narrators`, which was demo-only. |

### Your manual steps (PR A2 only)

1. Agree a one-hour CMS editing pause with Juliana. Have her save every open edit, check that CloudCannon › Syncs is clean, and screenshot the current CloudCannon build settings.
2. Right after A2 merges, set CloudCannon Site Settings › Builds to build `pnpm verify:help` with output `dist-help`; the install command stays the same. The one CloudCannon build that runs before you flip it fails harmlessly, because nothing live is served from CloudCannon. Then rebuild, and check that the editor shows only Help with no red cards.

---

## The rollout

| PR                                               | Contents                                                                                                                               | What staging and help show                       |
| ------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| **A1. Seal the Help Center**                     | Copy everything help uses into `src-help/` and make its config self-contained. Add the boundary guards and the build-diff tool.        | Nothing changes, and a normalized diff proves it |
| **A2. CloudCannon becomes help-only**            | Rewrite the CMS config to help only, scope the editable-region checker, split the scripts per site, update the docs                    | The editor lists only Help                       |
| **B1. Foundation, added alongside the old site** | The board inventory, the vendored design system, the token CSS, the theme, the components, header and footer, and a new `/styleguide/` | Only `/styleguide/` changes                      |
| **B2. Switch over and tear down**                | The new layouts, placeholder and interim routes, all deletions, the redirects, dependencies, docs and widened guards                   | Staging shows the new chrome                     |
| **Then one PR per page**                         | Built from that page's FINAL V boards using the playbook below                                                                         | Pages land one at a time                         |

**Order:** A1 → (A2 ∥ B1) → B2 → pages. A2 and B1 don't touch each other. Splitting A keeps the one coordinated, editor-visible change small and easy to revert. Splitting B means you approve the look on `/styleguide` first, and B2 is mostly deletions, so it's easy to review.

---

## Page-PR playbook

This goes into `CLAUDE.md` as the single home of the rules. The skill links to it rather than repeating it.

1. **Map before coding.** In the PR description, list every section of the page's Desktop and Mobile boards. Mark each one `existing component | new variant | new shared block | page-only`, using names from `design/inventory.md`. Also list every off-system value on the boards and how it was resolved.
2. **Where code goes.**
   - `src/pages/<route>.astro`: a typed `content` object at the top (the CMS-ready seam), then `<Section>`s composed from components, with the page's JSON-LD in the `head` slot. Port the page's existing JSON-LD from the `pre-rebuild` tag.
   - `ui/`: single elements. `layout/`: the site chrome. `blocks/`: sections that appear on two or more boards. `content/`: the MDX components.
   - No per-page folders. Name components by pattern (`StatStrip`), never by page (`HomeStats`).
   - A section that appears on only one board stays inline in its page file until that file passes about 300 lines.
3. **Styling.**
   - Tailwind utilities handle layout and spacing.
   - The token utilities from `theme.css` handle single visual values:
     - color: `text-primary`, `bg-surface-card`, `border-divider`
     - type: `type-*`
     - radius: `rounded-card`
     - shadow: `shadow-action`
   - Multi-property patterns and interaction states (buttons, cards, links, fields, hover, focus, pressed) are `ie-*` classes, from `design/components/bundle.css` or `src/styles/components.css`.
   - A component's variants are a prop mapped to classes through a plain `as const` object.
   - No `<style>` blocks, no arbitrary values, and `style=` may only set `--*` custom properties or `object-position`.
4. **Values the tokens don't cover.**
   - Colors must equal a token. If one doesn't, stop and add it to the open-questions table in `DESIGN.md`.
   - Text always uses a `type-*` utility.
   - Spacing within 4px of a token snaps to that token. Anything else becomes a site-only token in `theme.css`, commented `provisional`, with a row in `DESIGN.md`.
5. **Behavior.** A vanilla `<script>` inside the component, hooked on `data-*` attributes, with state kept in `aria-*` or `data-state`. No React; the design needs nothing beyond simple toggles.
6. **Images.** Put them in `src/assets/images/<page>/` and render them with `<Image>` or `<Picture>`, with alt text. Nothing new goes in `public/`.
7. **Done means:**
   - `pnpm verify` is green.
   - `pnpm shots` at 1440 and 390 is attached next to the board screenshots.
   - axe is clean.
   - Any new or changed shared component is on `/styleguide/`.
   - The `design/inventory.md` status is updated.

---

## PR A1: Seal the Help Center

Help ends up importing nothing from `src/` except two editor-owned paths: `src/content/help/**` (through its content config glob) and `src/data/help-ui.json`. Global ambient types in `src/env.d.ts` still apply. Marketing output must not change.

1. **Copy into `src-help/` unchanged**, then rewrite the imports:
   - **Layout:** `BaseLayout` becomes `layouts/HelpBaseLayout.astro`. It keeps ClientRouter, the dark-mode script, GA4, Intercom and Amplitude, and drops the CloudCannon loader, which help doesn't use.
   - **Styles:** `global.css` becomes `styles/help.css`, verbatim.
   - **MDX components:** the help blocks go into `components/mdx/`.
   - **Other components:** `HelpShell`, `HelpActions`, `HelpPrint`, `PrevNext`, `ArticleToc`, `Breadcrumb` and the old `Button` go into `components/`.
   - **Shared infra:** `seo/{SEO,JsonLd,Analytics}.astro` and `integrations/Intercom.astro`.
   - **Libraries:** `lib/{site,schema,reading-time,help-collection,help,cn,content-images}.ts`. The `content-images.ts` copy globs `/src-help/assets/images/**`, and A2 points CloudCannon's help uploads there. No help article uses an image today, so nothing moves.
   - **The brand mark:** copy `src/assets/brand/inner-explorer-mark.png` to `src-help/assets/brand/`. Point the imports in `HelpSiteLayout.astro` and `pages/index.astro`, and the `readFile` string in `lib/og-card.ts`, at the copy.
   - `src-help/content.config.ts` imports the help-collection copy.
   - **Check:** `compare-builds` must show no HTML or JS differences for help, apart from the removed CMS loader and the renamed layout chunk.
2. **Make the help config self-contained and scope Tailwind.**
   - `astro.help.config.mjs` stops importing `astro.config.shared.mjs`. It gets its own `editableRegions()`, an `AutoImport` list of the 10 help components pointing at the `src-help` copies, `mdx()`, `sitemap()`, prefetch and the Tailwind Vite plugin. `react()` is removed; the CloudCannon integration doesn't need React.
   - `help.css` starts with `@import 'tailwindcss' source(none);` plus `@source` for `src-help`'s components, layouts and pages. Without this, Tailwind's repo-wide scan changes help's CSS whenever marketing files change.
   - The tokens are not pruned; the file stays a verbatim, frozen copy.
   - **Check:** this changes only the CSS: unused utilities, plus the CSS of the blog components help never renders. `compare-builds --css-classes` proves it by showing that no removed selector is used anywhere in help's HTML. Spot-check 3 help pages on the deploy preview.
3. **Add the guards.**
   - **ESLint `no-restricted-imports`** (part of `pnpm check`): in `src-help/**`, forbid any import resolving into `src/` other than `src/data/help-ui.json`. In `src/**`, forbid importing `src-help/`.
   - **`scripts/compare-builds.mjs`** (manual).
     - It writes normalized copies of two build trees: hashed filenames, `data-astro-cid-*` values and chunk names stripped, HTML and CSS broken into lines, binaries as sha256. Then `diff -ru` shows the real changes.
     - `--css-classes` lists every removed CSS selector that is still used in the HTML.
     - It is the acceptance tool for A1, B2 and future Astro or Tailwind upgrades.
   - **`scripts/check-dist.mjs <dir>`.**
     - Every URL in `href`, `src`, `srcset`, `poster`, CSS `url()`, the `og:image` and `twitter:image` `content`, and JSON-LD `logo` and `image` values must resolve to a file. `/x` resolves to `x`, `x/index.html` or `x.html`.
     - Absolute `https://help.innerexplorer.com/*` and `https://www.innerexplorer.com/*` URLs map to `dist-help` and `dist`. A URL whose tree wasn't built in this run is skipped, so `verify:help` works where only `dist-help` exists.
     - For `dist` only, it also runs the **unknown-class check**: every class in `dist/**/*.html` must exist as a selector in the built CSS, with `group` and `peer` allowed. This catches old utility names, Tailwind defaults an agent remembers from training, and typos, with no deny-list to maintain.
     - A2 adds it to `verify:help`. B2 adds it to `verify`, because the old marketing site has dead links (`/signin`, `/status`).
4. **Docs.** A new `src-help/README.md`, next to the code agents will touch, covers:
   - the freeze rule and the boundary;
   - the editor-owned paths;
   - the `public/` files help depends on: all of `public/fonts/*`, `favicon.ico`, `apple-touch-icon.png`, `logo.png`, `og-default.jpg`, `videos/help/**`;
   - how to run `compare-builds`;
   - to use `pnpm dev:help`; the main dev server no longer serves `/help`.

**How baselines are built:** from `git merge-base`, in a sibling worktree outside the repo, with `NETLIFY=true` and placeholder `PUBLIC_GA_MEASUREMENT_ID` and `PUBLIC_INTERCOM_APP_ID` values. Rebuild them after any rebase, because CMS commits to help content land on main mid-PR.

## PR A2: CloudCannon becomes help-only

1. **Remove `cloudCannonHelpRoutes()`** from `astro.config.mjs`. CloudCannon will build the help site directly, at root URLs. Make `src-help/lib/help.ts` use constant hrefs; `HELP_LINK_PREFIX` only served those injected routes.
2. **Rewrite `cloudcannon.config.yml`** from about 6,930 lines to about 700.
   - **Keep:**
     - the `help` collection, with `url: /[slug]/` and `new_preview_url: /welcome/`
     - the `data` collection, with its glob limited to `[help-ui.json]`
     - both `data_config.help-ui` and its `file_config` entry (without `data_config`, `@data[help-ui]` regions show red cards)
     - `help_groups` from `_select_data`, the help `_inputs`, `_editables` and `commit_templates`
     - the 5 help `_structures` and the 11 help `_snippets`
     - `collection_groups`, reduced to Help
   - **Re-home** the `&inline_html_options` and `&optimized_image` YAML anchors, which are currently defined in sections being removed.
   - **Help image uploads** go to `/src-help/assets/images/`, matching A1's glob.
   - **Remove** the pages, blog, caseStudies, narrators, series and testimonials collections, the navigation and footer data, the marketing structures, and the blog snippets.
3. **CloudCannon support files.**
   - `.cloudcannon/initial-site-settings.json`: build `pnpm verify:help`, output `dist-help`.
   - Rewrite `.cloudcannon/README.md` for help only.
   - Delete the marketing creation schemas in `.cloudcannon/schemas/*` and keep `help-article.md`.
4. **`scripts/check-editables.mjs` (minimal change).**
   - It defaults to `dist-help` and reads `src-help/lib/help-collection.ts`.
   - Delete `EXPECTED_MARKETING_PAGE_IDS`, `checkMarketingPageContract` and its helpers, and the tests that cover them. Keep the existing fixture for the generic tests.
   - Reduce the `contracts` map in `checkCreationSchemas` to `help` (source `src-help/lib/help-collection.ts`). Otherwise it reports `MISSING_CREATABLE_COLLECTION` for the five removed collections. Delete or retarget the creation-schema tests for the other contracts, and repoint the fixture's help-collection path.
   - Point `scripts/verify-cloudcannon.mjs` at `dist-help` by default.
5. **Scripts and CI.**
   - `verify` = `check && build`. B2 appends `check-dist dist`.
   - `verify:help` = `validate:cloudcannon && build:help && lint:editables && check-dist dist-help`. It leaves out the repo-wide `check`, so a marketing lint error can never block a help deploy; CI still runs `check`.
   - `check` gains `test:editables` (`node --test scripts/check-editables.test.mjs`), so it runs in CI and the marketing deploy but not in the help deploy.
   - Delete `verify:cms`.
   - `netlify.toml` runs `pnpm verify`; `sites/help/netlify.toml` runs `pnpm verify:help`.
   - CI stays one job named `verify` and runs `pnpm verify && pnpm verify:help`.
6. **Docs.**
   - `docs/cms-publishing-workflow.md`: only help paths are editor-owned, and marketing changes go through PRs.
   - `docs/cloudcannon-recovery-2026-09-02.md`: fix its `verify:cms` reference.
   - `CLAUDE.md`: add a short "Two sites" section.
   - `tasks/lessons.md`: mark the `/help` preview lessons as superseded.

**Rollback:** `git revert -m 1 <merge>`, then restore the CloudCannon settings from your screenshot. No editor-owned file moves, so CMS saves stay valid under either version.

---

## PR B1: Foundation, added alongside the old site

**Additive only.** Old pages keep the old `global.css` and layouts. The only route that changes is `/styleguide/`, which is replaced: the old page and its `Counter.tsx` island are deleted.

### 1. Board inventory: `design/inventory.md` (first commit)

One table covering all 39 FINAL V boards, with the columns `pattern | boards it appears on | component name | status`.

- This settles once, up front, what is shared and what each component is called. Otherwise the third page PR ends up refactoring the first, which is how the old `blocks/<page>/` folders accumulated.
- Build it by reading every FINAL V board with the Artifact tool. Flag the off-token values on the Research and Pricing boards for normalization.

### 2. Vendored design inputs (`design/`, never hand-edited, ignored by prettier and eslint)

- `design/tokens.json` and `design/components/bundle.css`: verbatim copies from the design system.
- `design/README.md`: the canvas and design-system URLs, version and date, and the sync steps: replace the files, run `pnpm tokens`, review the diff, re-shoot the styleguide.
- The 13 woff2 fonts from the design system's `project/fonts/` go into `src/assets/fonts/`. Vite hashes them, and Netlify caches `/_astro/*` as immutable. They don't clash with the old `public/fonts/` files that the frozen help uses.
- The 4 logo PNGs (`lockup-primary`, `lockup-reversed`, `lockup-reversed-small`, `mark-compass`) go into `src/assets/brand/`, fetched with the Artifact tool.

### 3. Token CSS: `scripts/tokens.mjs` → `src/styles/tokens.css`

About 100 lines, no dependencies.

- **Output:**
  - `@font-face` rules generated from `type.fonts`, with `font-display: swap`.
  - A `:root` block with **the design system's exact variable names**: `--green-700`, `--surface`, `--text-primary`, `--space-6`, `--radius-card`, `--shadow-action`, `--button-height`, `--weight-*`.
  - `{ref}` values are resolved to `var(--ref)`, using the light values only.
- **Why the exact names matter:** `bundle.css` and the boards already use these names, so design-system CSS drops in unchanged.
- **Sanity check:** reject any value containing `;`, `{` or `}`. The inputs are reviewed in the PR diff.
- **`pnpm tokens --check`** runs inside `check` and fails if the file is stale.
- **Prettier:** `tokens.css` is listed in `.prettierignore`.
- **Dark mode later:** add a flag that emits `[data-theme='dark']` from the values already in `tokens.json`.

### 4. `src/styles/theme.css`, hand-written: the only file where Tailwind meets the design system

- **Reset only the namespaces the design system owns:** `--color-*`, `--font-*`, `--text-*`, `--radius-*`, `--shadow-*`.
  - Spacing (the 4px multiplier, so `p-6` equals `space-6`), breakpoints, leading, tracking, containers, eases, aspect ratios and the default transition all stay as Tailwind ships them.
  - Re-declare `white`, `black`, `transparent` and `current`, and declare `--font-weight-*` from the design system's `--weight-*`.
- **Color utilities by role, in `@theme inline`,** so each utility reads the design-system variable at the element. That keeps the `[data-on-brand]` and dark scopes working.

  | Utility           | Reads            |
  | ----------------- | ---------------- |
  | `text-primary`    | `--text-primary` |
  | `bg-surface-card` | `--surface-card` |
  | `border-divider`  | `--divider`      |
  - They're written as plain `--color-*` aliases, for example `--color-primary: var(--text-primary)`. A meaningless `bg-primary` would then technically exist, but nothing should use it.
  - The raw palette (`bg-green-800` for Forest, `bg-cyan-600` and so on) is exposed for surfaces and data visualization. The neutral palette is not exposed; the semantic names cover it.
  - Never put the design system's `--text-*` names inside an `@theme` block, because they would become font sizes.
  - Never use `var(--color-…)` in `src/` CSS; use the design-system variables.

- **`@theme static`** for the design-system names that already sit in a Tailwind namespace: `--font-sans`, `--font-serif`, `--font-display`, `--radius-card`, `--radius-button`, and the shadows. Declare each once, and never as a self-referencing alias. This gives the `rounded-card`, `shadow-action` and `font-display` utilities.
- **Fluid spacing.** Each value is one clamp that matches the 390px board and the 1440px board exactly, with the board numbers kept readable. For example, `--spacing-section: clamp(4rem, calc(4rem + 48 * (100vw - 390px) / 1050), 7rem)` gives 64 at 390 and 112 at 1440.

  | Token         | 390 → 1440 |
  | ------------- | ---------- |
  | `section`     | 64 → 112   |
  | `gutter`      | 20 → 120   |
  | `hero-top`    | 40 → 72    |
  | `hero-bottom` | 48 → 96    |
  | `strip`       | 40 → 64    |
  | `card`        | 20 → 24    |
  | CTA padding   | 32/24 → 72 |

  The page container is `mx-auto max-w-page px-gutter`, which leaves 1200px of content at 1440.

- **Type ramp:** one static `@utility type-<name>` per ramp entry: `page-title`, `section-title`, `header`, `title-md`, `title-sm`, `subhead`, `body`, `small`, `article-body`, `category`, `label`, `tag`, plus the site's `quote`. Each sets size, line-height, weight and tracking. Mobile/desktop pairs use the same clamp form (page-title 40→64, section-title 32→44, and so on).
- **`[data-on-brand]`** remaps the ink, divider and focus-ring variables inside Forest and Emerald panels.
- **Site-only values** (section spacing, card shadows, mobile sizes, the `quote` style, the provisional `stat-*` styles) are commented `/* site-only, provisional: <why> */` and get a row in `DESIGN.md`, so they can be moved into the design system later.

### 5. Other styles

- **`src/styles/site.css` (the new entry file):**
  - `@import 'tailwindcss' source('..')`, which scans `src/` only
  - `tokens.css`
  - `theme.css`
  - `base.css`, in the base layer
  - `../../design/components/bundle.css`, in the components layer
  - `components.css`, in the components layer

  The old `global.css` stays until B2.

- **`base.css`** sets:
  - body font, ink and ground
  - link colors
  - the global 2px `:focus-visible` ring using `--focus-ring`
  - `text-wrap: pretty`
  - `scroll-padding-top` for the sticky header
  - the reduced-motion safety net
- **`components.css`** holds the site-owned `ie-*` classes the boards define but `bundle.css` doesn't have yet. There is one commented section per component, values are only `var(--…)`, and each is marked as a candidate for the design system. The classes:
  - `ie-link`, `ie-link-light`
  - `ie-nav`, `ie-nav-dark`, `ie-menu`
  - `ie-card` (hover lift when it holds a stretched link)
  - `ie-accent-bar`, `ie-icon-disc`, `ie-icon-btn`
  - `ie-footer-grid`, `ie-prose`, `ie-swatch`
  - `ie-field`, `ie-label` (used to restyle HubSpot in B2)

  When `bundle.css` later ships a class that's also defined here, delete the site copy.

### 6. Components (`src/components/`): only what nearly every page uses and is already decided

- **`ui/`**
  - **Actions and labels:**
    - `Button`: `variant: primary | secondary | light | ghost`, `size: md | sm`, `href`, `icon`, `block`, `disabled`, `external`. It renders the `ie-btn-*` classes, and light and ghost add `ie-on-brand`.
    - `ArrowLink`: `tone: default | on-brand`.
    - `Tag`: `tone: fact | evidence | on-brand | on-tint`.
    - `Eyebrow`.
  - **Type and headings:**
    - `Heading`: `level`, plus `size` from the ramp.
    - `Text`: `variant: subhead | body | small | article-body | label`.
    - `PageTitle`: an H1 plus `AccentBar`, as wide as the title. Write `*Inner Explorer*` to mark the green emphasis span.
    - `AccentBar`.
  - **Cards:**
    - `Card`: `raised | floating | tint`.
    - `CardTitle`: an optional `href` makes a stretched link, so a card is never wrapped in `<a>`.
  - **Icons:**
    - `Icon` and `FeatureIcon` share one typed registry in `ui/icons.ts`, so a typo fails `astro check`.
    - UI icons are hand-kept outline SVGs normalized from the boards' own paths (2px stroke, 24 grid, `currentColor`).
    - Feature icons are Phosphor fill from `@phosphor-icons/core`, rendered `bare` or as a `disc`. First confirm that the package allows deep SVG imports.
    - Both use Astro's native SVG imports, so no JavaScript ships.
    - `IconButton`: requires a `label`.
  - **Lists and layout:**
    - `Checklist`: a 22px outline check-circle.
    - `Container`.
    - `Section`: `surface: ground | white | tint | forest | emerald` (forest and emerald set `data-on-brand`) and `spacing: section | hero | strip | none`.
  - **Plumbing:** `Logo`, `SkipLink`, `VisuallyHidden`.
- **`layout/`**
  - `SiteHeader`: `tone: light | dark`. Sticky, 64→80px tall, with `aria-current`. "Sign in" goes to `https://app.innerexplorer.com`; "Contact us" is a small primary button.
    - The header collapses to the menu button at a breakpoint computed from the measured nav-row width plus twice the gutter.
    - Verify it with screenshots at 1280 and 1440. If it's too tight, give the header a narrower gutter of its own.
  - `MobileMenu`: a native `<dialog>` opened with `showModal()`. Esc and the backdrop close it, focus returns to the button, and it closes when the viewport crosses the breakpoint. About 25 lines of vanilla JS.
  - `SiteFooter`: Footer A from the boards, with real link targets. Social links render only once their URLs exist.
- **`blocks/`**
  - `ClosingCta`: `tone: emerald | white`, `layout: card | band | inline`, optional photo.
  - `Testimonial`: `variant: card | panel`, built to the decided quote style.
- **`content/` (MDX):** `Prose`, plus `PullQuote`, `StatRow`, `ResourceCard`, `Callout` and `HelpTable`. They accept today's names and props, so the 2 kept posts and `privacy-policy.mdx` need no edits.
- **Deferred to the first page that needs each:**
  - `Chip`: Newsroom and Case Studies.
  - The `Field` component: Contact. HubSpot renders its own inputs, and `ie-field` styles them.
  - `StatNumber`: its typeface is still an open question.
  - The sticky CTA bar: Home.
- **`src/data/navigation.ts`:** typed navigation and footer data. Marketing has left the CMS, so JSON is no longer needed.
  - Nav:

    | Label              | Target                 |
    | ------------------ | ---------------------- |
    | Platform           | `/platform/`           |
    | Why Inner Explorer | `/why-inner-explorer/` |
    | Case studies       | `/case-studies/`       |
    | Research           | `/research/`           |
    | Pricing            | `/pricing/`            |
    | About              | `/about/`              |

  - Footer:

    | Group        | Links and targets                                                                                                      |
    | ------------ | ---------------------------------------------------------------------------------------------------------------------- |
    | Product      | For educators → `/platform/`; For districts → `/why-inner-explorer/`; Pricing → `/pricing/`                            |
    | Company      | About, Research, Newsroom → `/about/`, `/research/`, `/newsroom/`                                                      |
    | Get in touch | Contact us → `/contact/`; Help Center → `https://help.innerexplorer.com/`; FAQ → `https://help.innerexplorer.com/faq/` |
    | Legal        | Privacy policy → `/privacy-policy/`                                                                                    |

    The copyright line reads "© 2011–{build year} Inner Explorer, Inc."

### 7. `/styleguide/`

- It uses a small noindex `StyleguideLayout` that imports `site.css`, so old pages are untouched.
- It renders:
  - swatches from `design/tokens.json` (`.ie-swatch` with `style="--swatch: var(--x)"`), the type ramp, spacing, radii and shadows;
  - every component in every state, including the design system's static `.is-hover`, `.is-focus` and `.is-pressed` classes;
  - Section surfaces, header and footer specimens, ClosingCta and Testimonial.
- Every section has a `data-sg` hook for screenshots.

### 8. Guards and tooling

- **`check-drift.mjs` additions.** In B1 they cover only the files B1 adds: `ui/`, `content/`, the new files in `layout/` and `blocks/`, and `pages/styleguide/`. B2 widens the `.astro` rules to all of `src/`. `src-help` is exempt.
  - no `<style>` blocks in `.astro` files;
  - `style=` may only set `--*` properties or `object-position`;
  - in `src/styles/base.css` and `components.css`: no hex, `rgb()` or `hsl()`, no px or rem lengths other than 0, 1px and 2px, and no `var(--color-`. `tokens.css` and `theme.css` hold the literal values.
- **`pnpm shots`** (`tests/visual.spec.ts`, dev dependencies `@playwright/test` and `@axe-core/playwright`, run manually):
  - full-page screenshots at 1440×900 and 390×844, plus an axe scan;
  - requests to `*.amplitude.com` are blocked, so test runs don't pollute production analytics;
  - it uses the preinstalled Chromium (`executablePath: /opt/pw-browsers/...`) where one is present.
- **Dependencies:** add `@phosphor-icons/core`, plus the two dev dependencies above. New code uses plain variant maps, not `tailwind-variants`. The package stays installed because frozen help uses it.

---

## PR B2: Switch over and tear down

At the start, tag main as `pre-rebuild` and push the tag; the clone is shallow, so later sessions need `git fetch origin tag pre-rebuild`. Deleted copy is recoverable with `git show pre-rebuild:<path>`.

### Switch over

- **`src/layouts/BaseLayout.astro` (rewritten in place).**
  - Keep all of `<head>`: SEO, the Organization JSON-LD, favicons, `noindex` and canonical, the GA4 and Intercom production gating, the Amplitude script (same key) and the `head` slot.
  - Import `site.css`. Add Inter 500 and 700 preloads (`?url` import, `crossorigin`). Set `<html lang="en" data-theme="light">` and `<body class="bg-surface text-body">`.
  - Remove `<ClientRouter />`, the dark-mode script and the CMS loader.
- **`src/layouts/PageLayout.astro` (rewritten).** Props: `header: light | dark` plus the SEO props. It renders SkipLink, SiteHeader, `<main id="main" tabindex="-1">` and SiteFooter, then an `after-footer` slot.
- **`src/components/seo/Analytics.astro`** (marketing's copy; help has its own). Without ClientRouter, nothing fires `astro:page-load`, so GA4 switches to its standard automatic page view: remove `send_page_view: false` and the `astro:page-load` listener. Intercom and HubSpot already initialize on a normal load. Leave their `astro:*` listeners in place; without ClientRouter they do nothing.
- **`src/components/integrations/HubSpotForm.astro`.** Keep the loader, `css: ''`, the portal and form IDs, and the success template. Move its `<style is:global>` into `components.css`, sharing rules with `ie-field` (`.ie-field, .hsform .hs-input {…}`).
- **`astro.config.mjs`** (delete `astro.config.shared.mjs`):
  - integrations: `AutoImport` (the 5 content components), `mdx()`, `sitemap()` (excluding `/styleguide`);
  - `prefetch: { prefetchAll: true, defaultStrategy: 'hover' }`;
  - the Tailwind Vite plugin;
  - the redirects below;
  - no `react()` and no `editableRegions()`.
- **`src/content.config.ts`.**
  - Drop `pages`, `narrators`, `series`, `testimonials` and the page-schema imports.
  - Keep `blog` and `caseStudies` exactly as they are; the page PRs reshape them.
  - Keep `help`, defined as `defineCollection({ loader: glob({ pattern: 'privacy-policy.mdx', base: './src/content/help' }), schema: helpCollection.schema })`. Never narrow the shared file. `astro check` also needs `help` registered to type `src-help`.
- **`/privacy-policy`** passes a `components` map that gives every other help snippet name (Accordion, Steps, Card and so on) a fallback that renders its content visibly. A CMS edit to that shared file can then neither break the marketing build nor hide legal text.
- **`.prettierrc.json`.** `tailwindStylesheet` points to `./src/styles/site.css`. An override for `src-help/**` points to `src-help/styles/help.css`, so class sorting in frozen files doesn't change.
- **Append `check-dist dist` to `verify`.**
- **Widen the B1 drift rules** to all of `src/`.

### Routes after B2 (staging never breaks)

One component, `layout/SimplePage.astro`, serves every route until its page PR lands. It renders a hero (Eyebrow, PageTitle, subhead), an optional default slot and an optional ClosingCta. Each route's copy is structured data at the top of its file.

| Route                                                                                 | What goes in `SimplePage`'s slot                                                                                                                                                   |
| ------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/`, `/platform/`, `/why-inner-explorer/` (new), `/research/`, `/pricing/`, `/about/` | Nothing yet (hero plus ClosingCta)                                                                                                                                                 |
| `/case-studies/` and the 7 detail pages                                               | A link list. Detail pages add the dek, hero image, featured metric and PDF link, with `articleSchema` and `breadcrumbSchema`.                                                      |
| `/newsroom/`                                                                          | A simple list, ported from today's derivation that builds it from case studies and posts                                                                                           |
| The 2 blog posts                                                                      | The real body in `Prose`, with Article and FAQ JSON-LD, the post's hero image as its OG image, and a breadcrumb to `/newsroom/`                                                    |
| `/privacy-policy/` (permanent)                                                        | The real legal text in `Prose`. The canonical is exactly `/privacy-policy/`, and the WebPage and BreadcrumbList JSON-LD carry over.                                                |
| `/contact/`                                                                           | A **working** HubSpot form in the new styles, with the ContactPage JSON-LD. The data ported from `contact.yml` is `form.confirmation`, the support email and the Help Center link. |

- **`/404`:** rebuilt simply, with the dead `/status` link dropped.
- **Unchanged:** `/robots.txt` and the sitemaps.

### Delete (about 44k lines and about 450 files)

- **Components.**
  - Everything in `src/components/blocks/` except B1's `ClosingCta.astro` and `Testimonial.astro`. That covers the old blocks, the help originals (help has its copies now) and `ComparisonTable`. The Pricing PR ports the design system's `PricingTable` instead.
  - The old `layout/*`: Header, Footer, Section, Grid, Stack, ThemeToggle.
  - `primitives/*`.
  - `src/cloudcannon/**`.
- **Pages.** `faq`, `districts`, `narrators/**`, `series/**` and `blog/index`. The other pages are rewritten as above.
- **Styles and libraries.**
  - `src/styles/global.css`.
  - `src/lib/{page-schemas/**,editable.ts,intersect.ts,help.ts,content-images.ts}`. After B2 their only users are gone, and help has its own copies.
  - `src/data/{navigation,footer}.json`, plus their `.prettierignore` lines.
- **Content.**
  - `src/content/pages/*.yml` (13). The real copy in `research.yml`, `pricing.yml` and `about.yml` is recoverable from the tag.
  - `narrators/*` (30), `series/*` (4), `testimonials/*` (3).
  - `case-studies/broward.yaml`, the Unsplash demo.
  - The 3 stand-in posts: `morning-calm-…`, `bringing-mindfulness-…`, `measuring-what-matters`.
- **Assets.** In `src/assets/images/`: about, narrators, series, home/mosaic, newsroom, research, `case-studies/broward`, and the morning-calm images. Also `src/assets/intro/`, `src/assets/brand/inner-explorer-{mark,wordmark}.png` (help has its copy, and the new logos replace them) and `public/audio/`. That is about 130 files, about 21.5 MB. `public/fonts`, the favicons, `logo.png` and `og-default.jpg` are **kept**: help depends on them, and `check-dist` enforces it.
- **Tooling.** `scripts/gen-narrator-placeholders.mjs` and `src/icons/.gitkeep`.
- **Dependencies.** `@astrojs/react`, `react`, `react-dom`, `@types/react*` and `lenis`. Also remove the React `jsx` settings from `tsconfig` and the tsx block from eslint.
- **Kept on purpose:** `agent/`. CloudCannon wrote it, its files differ from `.agents/skills/`, and the CMS stays in use for help.

### Kept as is

- `src/components/seo/{SEO,JsonLd}.astro`, `src/components/integrations/Intercom.astro`, `scripts/hubspot-contact-form.mjs`
- `src/lib/{site,schema,reading-time,help-collection,cn}.ts`, `src/env.d.ts`, `robots.txt.ts`. `cn` merges a caller's `class` prop in the B1 components.
- the edge functions, `scripts/check-mirrors.mjs`, `sites/help/**`
- the 7 case-study YAMLs with their images and PDFs
- the 2 blog posts with their 3 images
- `public/videos/research/neurons.*`, which the new Research hero reuses
- `public/downloads/*`

The MTSS post links to `/series/counselor`. The redirect covers it in production; ask Juliana before changing the link in her article.

### Redirects (`netlify.toml`)

Every new rule is `force = true`. The static ones are mirrored in Astro's `redirects` for dev and preview, and all internal targets use a trailing slash.

| From               | To                                                                                                                                           |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `/faq`, `/support` | `https://help.innerexplorer.com/faq/`                                                                                                        |
| `/districts`       | `/why-inner-explorer/`                                                                                                                       |
| `/series/*`        | `/platform/`. Plus a static Astro mirror `'/series/counselor': '/platform/'`, so dev, preview and `check-dist` resolve the MTSS post's link. |
| `/blog`            | `/newsroom/`. Matches the index only; `/blog/<slug>/` is unaffected.                                                                         |
| `/resources`       | `/newsroom/`                                                                                                                                 |

- `/narrators` gets no redirect: it only ever existed as demo pages on the noindexed staging site.
- Delete the existing `/pricing` → `/contact` rule. It never fired, because `/pricing` exists.

These stay as they are: `/help`, `/help/*`, `/privacy`, and the compatibility stand-ins (`/educators`, `/app`, `/careers`, `/donate`, `/newsletter`), with their targets updated to trailing-slash URLs.

### Docs and agent files

- **`CLAUDE.md`,** rewritten and holding the single copy of the rules:
  - Two sites, and the help freeze.
  - The design sources: the canvas URL with its FINAL V page, the design-system URL, and `design/`.
  - The token vocabulary and the utility rule.
  - The page-PR playbook above.
  - Commands: `pnpm tokens`, `verify`, `verify:help`, `shots`.
  - Remove the stale "subagents fail" note; parallel subagents worked throughout this planning session.
- **`DESIGN.md`:** the token reference plus the open-questions table below.
- **`README.md`:** real setup instructions.
- **`.claude/skills/implement-design-handoff/`,** rewritten:
  1. Read the page's FINAL V boards with the Artifact tool.
  2. Follow the playbook in `CLAUDE.md`.
  3. Run the checks.

  Mark `transfer-case-study` as stale until the Case Studies PR.

- **`tasks/todo.md`.** Move it to `tasks/archive/`. Start a slim new one with the open items:
  - case-study publish gates
  - research facts still to confirm
  - the legacy 301 map (from `tasks/seo-playbook.md`)
  - launch noindex removal
  - HubSpot owner items
- **`tasks/lessons.md`.** Archive the sections on the Framer and Lenis intro, React islands, the dark-mode subtree hacks, the glass-pill nav, and the per-case-study builds (as `tasks/archive/lessons-case-studies.md`, linked from the case-study skill). Keep the rest.
- **`.claude/launch.json`:** regenerate it down to the main dev server, help dev, and the two preview servers.

---

## After the foundation

**Page order.** Shared blocks get built early and reused.

1. **Contact** (with the success state; adds `Field`).
2. **Home.** Stat strip, testimonial row, program cards, video facade, hero carousel, sticky CTA bar.
3. **Platform.** Tabs, the audio sample player, feature splits.
4. **Why Inner Explorer.**
5. **Case Studies index and detail.**
   - Reshape `caseStudies` to the canvas's content model.
   - Migrate the 7 YAMLs, keeping their source headers and publish gates.
   - Bring the skill up to date.
6. **Newsroom and Article.**
   - Import the 18 legacy posts word for word from the "Blog Posts Working" boards.
   - Migrate the 2 current posts.
   - Add the legacy blog 301s.
   - Settle how breadcrumbs name `/blog` versus `/newsroom`.
7. **Research.** Normalize the board's off-system values.
8. **Pricing.** Port the design system's `PricingTable` (`ie-cmp-*`) and restore the `pricing.yml` data from the tag.
9. **About.**

**Launch list:**

- the legacy-URL 301 map (case-study URLs and PDFs)
- removing the pre-launch noindex blocks
- the favicon from `mark-compass`, which affects both sites
- the Help Center reskin, which retires `src-help`'s frozen copies
- reintroducing CMS editing for marketing, if wanted

### Design questions to settle (none blocks B1 or B2; each has a default in code)

| Question                                                                                             | Default                                                                      |
| ---------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| Big stat-number face                                                                                 | Libre Caslon Condensed 500 at 72/56/44 (mobile 56/44/40), marked provisional |
| Feature icon holder: the board recommends a mint disc, the design-system README says an Emerald disc | Emerald disc, per the README. One CSS rule switches it.                      |
| Accent-bar gap: the README says 8px, the boards render 16px                                          | 16px                                                                         |
| Input radius: the Library says 12px, the Contact board uses 8px                                      | 12px                                                                         |
| Primary CTA label                                                                                    | "Contact us" (matches the header)                                            |
| Mobile menu open state, sticky header, current-page indicator in the light header                    | Not designed yet. Built accessibly, as described under `MobileMenu`.         |
| Footer A versus B, the "501(c)(3) nonprofit" line, social profile URLs                               | Footer A, with real links and social icons hidden until URLs exist           |

---

## Verification

**A1**

- `pnpm check` passes, including the new ESLint boundary.
- `compare-builds` against the merge-base baselines: help HTML and JS are unchanged apart from the removed CMS loader and the renamed layout chunk, and marketing is unchanged.
- `compare-builds --css-classes` reports no removed selector that help's HTML still uses. A spot check of 3 help pages on the deploy preview looks unchanged.
- `check-dist dist-help` passes, and both Netlify deploy previews are green.

**A2**

- `pnpm verify && pnpm verify:help` pass. This includes `validate:cloudcannon` and `check-editables`.
- After merge, with the settings flipped: the CloudCannon build passes, the editor readback shows only Help, there are no red cards, the 11 snippets appear, and Syncs is clean.

**B1**

- `pnpm check` passes, including `tokens --check`.
- `pnpm shots` of `/styleguide/` is reviewed side by side with the Component Library, Card Options and Contact boards.
- B1 only adds files, so the old pages need no diff.

**B2**

- **Gates:** `pnpm verify && pnpm verify:help`.
- **Help untouched:** `compare-builds` of `dist-help` against the post-A baseline shows no difference.
- **Links and classes:** `check-dist` passes for both builds, which covers every link and asset resolving and no unknown classes.
- **Screenshots and accessibility:** `pnpm shots` and axe on every route at 1440 and 390.
- **JavaScript budget:** `grep -rhoE '/_astro/[^"]+\.js' dist --include='*.html' | sort -u` shows only Amplitude, the menu script and prefetch. There is no React chunk.
- **GA4 (local; GA never runs on `*.netlify.app`):**
  - Build with `CONTEXT=production` and a placeholder measurement ID, then run `pnpm preview`.
  - Assert that `window.dataLayer` holds a `config` call without `send_page_view: false`, and that the `gtag/js` request was made.
  - Intercom loads on staging by design.
- **HubSpot:** `/contact/` renders all 8 fields inline (no iframe) in the new styles, and the success template is present. No real submission.
- **Redirects:** on the deploy preview, `curl -sI` `/faq`, `/support`, `/districts`, `/series/x`, `/blog` and `/resources` all return 301 to the expected targets, and `/blog/inner-explorer-mtss-tiers/` returns 200.
- **SEO:** every route has a canonical and OG tags, and the sitemap excludes `/styleguide/` and redirect stubs.

---

## Appendix: facts this plan relies on (verified during planning)

- **Main deploys to staging.** The marketing site is pre-launch (noindex everywhere), and www.innerexplorer.com still serves the legacy site.
- **Analytics:**
  - GA4 is gated to production builds and also skips `*.netlify.app`, so it never runs on staging.
  - Intercom is gated to production builds but loads on staging on purpose.
  - Amplitude is ungated, with a hardcoded key; it only skips the CloudCannon editor.
  - GA4 currently sends page views by hand on `astro:page-load`, which only ClientRouter fires.
- **`@cloudcannon/editable-regions@0.0.19` has no React peer dependency.** The only React in the repo is `Counter.tsx` on `/styleguide`.
- **Help's CloudCannon wiring is light.** It uses only plain `data-editable` and `<editable-text>` regions; the 34 registered components are all marketing.
- **`privacy-policy.mdx` is shared.** It uses `<Callout>` and `<HelpTable>`, and it is both a help article and the marketing `/privacy-policy` body.
- **What CloudCannon edits.** Its saves (Juliana) are almost all help articles plus 2 blog posts. There are none on marketing page YAML.
- **Tailwind 4.3.0 supports the features used here:** `source(none)` and `source('..')`, `@theme static` and `inline`, CSS layer imports from `design/`, and Vite `url()` rebasing.
- **Content counts:**
  - all 7 case studies in the design already exist as fact-checked YAML with images and PDFs;
  - none of the design's 18 legacy blog posts are in the repo;
  - Broward, narrators, series, testimonials and 3 blog posts are demo content.
- **The design needs no React.** Every interaction on the FINAL V boards is a simple toggle that vanilla JS handles. The parked ROI calculator is the only possible island.
