# CLAUDE.md — Inner Explorer Website

Context for AI agents (and humans) working in this repo. Read this first.

## What this is

The marketing website for **Inner Explorer** — the leading provider of daily
audio-guided mindfulness practices in K-12 schools — and its Help Center. Audience:
school/district administrators, principals, teachers, parents. Brand feel: calm,
trustworthy, credible, accessible.

**The marketing site is being rebuilt from a new design, from a clean slate.** What is
here now:

- **The bones:** Astro, two Netlify sites, GA4, Amplitude, Intercom, the HubSpot contact
  form, SEO (canonical, Open Graph, JSON-LD, sitemap), redirects, CI.
- **Bare placeholder pages** (`src/pages/`): unstyled semantic HTML with a `content`
  object at the top of each file. `/contact/` has the working HubSpot form;
  `/privacy-policy/` renders the real policy.
- **The Help Center** (help.innerexplorer.com, live): a second, **sealed** Astro build in
  `src-help/`, edited by marketing in CloudCannon. Read `src-help/README.md` before
  touching it. Never import across the `src/` ↔ `src-help/` boundary (ESLint enforces it).

The previous design's code and content were removed on purpose. Recover anything with
`git show 0c8cac2:<path>` (main before the clean slate), e.g. a page's JSON-LD or a
legacy blog post.

## Design sources

- **Site design:** the Claude Design canvas "Inner Explorer — Website",
  https://claude.ai/artifact/6gx8tapeaDzTeSSMD7R31s, page **FINAL V**.
- **Design system:** "Inner Explorer Design System" (V2), https://claude.ai/artifact/DVAYqoSPn9uNeodz9HXVox.
  Read its README first; code uses its token names, `type-*` styles and `ie-*` classes. The
  older "Inner Explorer" system (https://claude.ai/artifact/XSmeot9ufJMTTvGDh3GYxz) is history.
- **Plan:** `tasks/rebuild-plan.md`. Next is the design-foundation PR (tokens, theme,
  shared components, `/styleguide/`), then one PR per page. `DESIGN.md` is written by
  the foundation PR.

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
pnpm check:dist <dir> # every link/asset in a build resolves (--classes: every class has CSS)
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
- **No off-system styling.** No arbitrary Tailwind values or raw colors in components
  (`pnpm lint:drift`). The foundation PR defines the tokens; until then pages stay
  unstyled.
- **No orphans.** No heading, paragraph, list item, quote or caption ends with one word
  alone on a line. The last two words of each line of copy (with any punctuation after them)
  go in `<span class="ie-keep">`, an inline-block, so they share a line whenever they fit:
  components add it to their text, and Markdown/MDX gets it from a rehype pass. The page
  title and hero rely on `text-wrap: balance` instead (at 40px+ the pair is often wider than
  a phone line). `text-wrap: pretty` alone is not enough: Chrome only fixes short last
  words and Firefox has no `pretty`. Never glue words with U+00A0; it overflows at 320px.
- **Analytics stay production-only.** GA4, Amplitude and Intercom render only in
  production builds (`BaseLayout`); GA4 also skips `*.netlify.app`.

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
