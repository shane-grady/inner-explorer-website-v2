# CLAUDE.md — Inner Explorer Website

Context for AI agents (and humans) working in this repo. Read this first.

## What this is

The marketing website for **Inner Explorer** — the leading provider of daily
audio-guided mindfulness practices in K-12 schools — and its Help Center. Audience:
school/district administrators, principals, teachers, parents. Brand feel: calm,
trustworthy, credible, accessible.

**The marketing site is being rebuilt from a new design.** What is here now:

- **The bones:** Astro, two Netlify sites, GA4, Amplitude, Intercom, the HubSpot contact
  form, SEO (canonical, Open Graph, JSON-LD, sitemap), redirects, CI.
- **The design foundation:** tokens, theme and component CSS (`src/styles/`), the shared
  components (`src/components/ui/`, `layout/`, `blocks/`), the site header and footer in
  `PageLayout`, `/styleguide/`, the guards and `pnpm shots`. `DESIGN.md` is the reference.
- **Placeholder pages** (`src/pages/`): semantic HTML with a `content` object at the top of
  each file, inside the real chrome, waiting for their page PR. `/contact/` has the working
  HubSpot form; `/privacy-policy/` renders the real policy.
- **The Help Center** (help.innerexplorer.com, live): a second, **sealed** Astro build in
  `src-help/`, edited by marketing in CloudCannon. Read `src-help/README.md` before
  touching it. Never import across the `src/` ↔ `src-help/` boundary (ESLint enforces it).

The previous design's code and content were removed on purpose. Recover anything with
`git show 0c8cac2:<path>` (main before the clean slate), e.g. a page's JSON-LD or a
legacy blog post.

## Design sources

- **Source of truth: the FINAL V page** of the canvas "Inner Explorer — Website",
  https://claude.ai/artifact/6gx8tapeaDzTeSSMD7R31s. Read its boards with the Artifact
  tool. The canvas's other pages are working pages, not the source.
- **Secondary references:** the design systems "Inner Explorer"
  (https://claude.ai/artifact/XSmeot9ufJMTTvGDh3GYxz) and V2
  (https://claude.ai/artifact/DVAYqoSPn9uNeodz9HXVox). Where they disagree with FINAL V,
  FINAL V wins; `DESIGN.md` lists the disagreements.
- **Plan:** `tasks/rebuild-plan.md`. `design/inventory.md` maps every board pattern to its
  component. Next: one PR per page, in the plan's order.

## Tech stack

- **Astro 6** (static) · **TypeScript strict** · **Tailwind CSS v4** via
  `@tailwindcss/vite` (`src/styles/site.css`) · **MDX** (the privacy policy)
- **ESLint 10** (flat) + **Prettier** (astro + tailwind plugins) · **pnpm** · **Node 24**
- Hosting: **Netlify**: `netlify.toml` (marketing) and `sites/help/netlify.toml` (Help
  Center). **CloudCannon** builds and edits the Help Center only.

## Commands

```bash
pnpm dev              # marketing dev server (localhost:4321)
pnpm dev:help         # Help Center dev server (localhost:4322)
pnpm check            # typecheck + lint + drift + mirrors + format:check
pnpm verify           # marketing gate: check, build, check:dist dist --classes
pnpm verify:help      # Help Center gate (what CloudCannon and its Netlify site run)
pnpm check:dist <dir> # every link/asset in a build resolves (--classes: every class has CSS, every ie-* class is used)
pnpm shots            # after pnpm build: screenshots at 1440 and 390 in .screenshots/, axe clean
pnpm test:editables   # tests for the CloudCannon checker (run when you change scripts/)
pnpm compare:builds   # normalized diff of two builds (see src-help/README.md)
```

Run `pnpm verify` (and `pnpm verify:help` if you touched anything the Help Center
reads) before considering work done. CI runs both, the checker tests, and
`check:dist dist dist-help` for links between the two sites.

## Project rules

- **Accessibility is required** (WCAG 2.2 AA — a procurement requirement for schools):
  semantic HTML and landmarks, keyboard operable, visible focus, AA contrast, `alt` on
  images, captions/transcripts for audio/video, respect `prefers-reduced-motion`.
- **Minimal JavaScript.** Pages are static `.astro`. Behavior is a small vanilla
  `<script>`; no React or other UI framework unless a feature truly needs one.
- **SEO goes through the layouts.** Every page renders inside `PageLayout`/`BaseLayout`
  (canonical, Open Graph, Twitter, Organization JSON-LD); add page-specific structured
  data through the `head` slot.
- **Page copy is structured data at the top of the page file** (a `content` object), not
  buried in markup, so it can move to a CMS later.
- **No off-system styling.** Every value comes from `src/styles/tokens.css` (`DESIGN.md`):
  no `<style>` blocks, arbitrary Tailwind values or raw colors in components, and `style=`
  only sets `--custom` properties (`pnpm lint:drift`).
- **Analytics stay production-only.** GA4, Amplitude and Intercom render only in
  production builds (`BaseLayout`); GA4 also skips `*.netlify.app`.

## Page-PR playbook

1. **Map before coding.** Read the page's FINAL V boards (desktop and mobile). List each
   section as an existing component, a new variant, a new shared block (a pattern on two or
   more pages) or page-only, using `design/inventory.md`. List each off-token value and how
   it is resolved (the inventory's second table).
2. **Where code goes.** The page file holds a `content` object at the top, then `<Section>`s,
   then JSON-LD (port it from `0c8cac2`). Components: `ui/` (single elements), `layout/`
   (site chrome), `blocks/` (patterns on two or more boards), `content/` (MDX). No per-page
   folders; name components by pattern, never by page.
3. **Styling.** Utilities handle layout and spacing; `type-*` handles text; token utilities
   (`bg-surface`, `text-foreground-body`, `border-border`) handle single visual values;
   `ie-*` classes handle multi-property patterns and interaction states. Variants are a prop
   mapped to classes through an `as const` object. No `<style>` blocks, no arbitrary values.
4. **Values not in tokens.** Colors must equal a token; otherwise ask. Text uses `type-*`.
   Spacing within 4px snaps to the nearest token; anything else becomes a token in
   `tokens.css` commented `provisional` and listed in `DESIGN.md`.
5. **Behavior:** a small vanilla `<script>` on `data-*` attributes. No React.
6. **Images:** in `src/assets/images/<page>/`, rendered through `<Image>`.
7. **Done means:** `pnpm verify`, then `pnpm shots` compared with the boards, axe clean,
   `/styleguide/` and `design/inventory.md` updated.

---

# Workflow Orchestration

### 1. Plan Mode Default

- Enter plan mode for ANY non-trivial task (3+ steps or architectural decisions)
- If something goes sideways, STOP and re-plan immediately
- Use plan mode for verification steps, not just building
- Write detailed specs upfront to reduce ambiguity

### 2. Subagent Strategy

- Use subagents liberally to keep main context window clean
- Offload research, exploration, and parallel analysis to subagents
- For complex problems, throw more compute at it via subagents
- One task per subagent for focused execution

### 3. Self-Improvement Loop

- After ANY correction from the user: update tasks/lessons.md with the pattern
- Write rules for yourself that prevent the same mistake
- Ruthlessly iterate on these lessons until mistake rate drops
- Review lessons at session start for relevant project

### 4. Verification Before Done

- Never mark a task complete without proving it works
- Diff behavior between main and your changes when relevant
- Ask yourself: "Would a staff engineer approve this?"
- Run tests, check logs, demonstrate correctness

### 5. Demand Elegance (Balanced)

- For non-trivial changes: pause and ask "is there a more elegant way?"
- If a fix feels hacky: "Knowing everything I know now, implement the elegant solution"
- Skip this for simple, obvious fixes -- don't over-engineer
- Challenge your own work before presenting it

### 6. Autonomous Bug Fixing

- When given a bug report: just fix it. Don't ask for hand-holding
- Point at logs, errors, failing tests -- then resolve them
- Zero context switching required from the user
- Go fix failing CI tests without being told how

## Task Management

1. Plan First: Write plan to tasks/todo.md with checkable items
2. Verify Plan: Check in before starting implementation
3. Track Progress: Mark items complete as you go
4. Explain Changes: High-level summary at each step
5. Document Results: Add review section to tasks/todo.md
6. Capture Lessons: Update tasks/lessons.md after corrections

## Core Principles

- Simplicity First: Make every change as simple as possible. Impact minimal code.
- No Laziness: Find root causes. No temporary fixes. Senior developer standards.
- Minimal Impact: Only touch what's necessary. No side effects with new bugs.
