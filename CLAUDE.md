# CLAUDE.md — Inner Explorer Marketing Website

Context for AI agents (and humans) working in this repo. Read this first.

## What this is

The marketing website for **Inner Explorer** — the leading provider of daily
audio-guided mindfulness practices in K-12 schools. Audience: school/district
administrators, principals, teachers, parents. Brand feel: calm, trustworthy,
credible, accessible. Most code here is written by AI agents; most design is
transferred from **Claude Design**, whose handoff writes against the tokens and
components defined in this repo — so keeping the design system clean is what keeps
agent output consistent.

## Tech stack (locked)

- **Astro 6** (static-first, React islands only where needed) · **TypeScript strict**
- **Tailwind CSS v4** (CSS-first `@theme`) via `@tailwindcss/vite`
- **tailwind-variants** for component variants · **clsx + tailwind-merge** (`cn`)
- **React 19** islands (only when interactivity is real) · **shadcn/ui** ok for complex islands
- **Astro Content Collections + Zod** for content (the CMS-ready seam)
- **ESLint 10** (flat) + **Prettier** (astro + tailwind plugins) · **pnpm** · **Node 24**
- Hosting: **Netlify** (`netlify.toml`)

## Commands

```bash
pnpm dev          # dev server (localhost:4321)
pnpm build        # production build → dist/
pnpm preview      # serve the build
pnpm typecheck    # astro check (TS + .astro)
pnpm lint         # eslint
pnpm lint:drift   # design-drift guard (fails on off-system values)
pnpm format       # prettier --write
pnpm check        # typecheck + lint + lint:drift + format:check  (run before done)
```

## Project rules (non-negotiable — these prevent drift)

**Design tokens are the only styling vocabulary.**

- Use semantic token utilities only: `bg-background`, `text-foreground`, `bg-card`,
  `text-muted-foreground`, `bg-brand`, `border-border`, `ring-ring`, intents
  (`bg-success/-warning/-danger/-info`). The raw palette is intentionally NOT exposed.
- **Never** use arbitrary values (`bg-[#abc]`, `mt-[13px]`, `text-[19px]`) or raw
  hex/rgb in components. `pnpm lint:drift` fails the build on these. Tokens live in
  `src/styles/global.css` (`@theme`). See `DESIGN.md`.
- Type sizes only via the ramp (`text-xs`…`text-5xl`) — use the `Heading`/`Text`
  primitives, don't hand-pick sizes. Spacing comes from the scale (4/8pt grid) and
  the fluid `py-section-*` tokens.

**Reuse components — don't hand-roll.**

- Before creating a component, check `/styleguide` and `src/components/`. Compose
  pages from `blocks/` (Hero, FeatureGrid, Testimonials, CTABanner, …) built on
  `primitives/` + `layout/`.
- New variants belong in the component's `tailwind-variants` config, not as one-off
  class strings at call sites.

**Ship minimal JS (hybrid model).**

- Default to `.astro` components (zero JS). Use a **React island** (`client:*`) only
  when interactivity is genuinely needed. A theme toggle or simple disclosure does
  NOT justify shipping React — use a vanilla Astro component (see `layout/ThemeToggle.astro`).
- Verify per-page JS after adding islands: marketing pages should stay ~0KB JS.

**Accessibility is required (WCAG 2.2 AA — it's a procurement requirement for schools).**

- Semantic HTML + landmarks, keyboard operable, visible focus (`focus-visible` ring),
  AA contrast (use tokens), `alt` on images, captions/transcripts for audio/video,
  respect `prefers-reduced-motion` (handled globally).

**Content lives in collections.**

- Blog/resources/testimonials are schema-validated collections (`src/content.config.ts`).
  Keep marketing page copy as structured data at the top of the page file (not buried
  in markup) so it can move to a CMS later.

**SEO.** Every page goes through `PageLayout`/`BaseLayout` (canonical, OG, Twitter,
Organization JSON-LD). Add page-specific structured data via the `head` slot.

**Always run `pnpm check` before considering work done.**

> Environment note: in the current Cowork environment, subagents fail to spawn
> (their inherited MCP tool context overflows the prompt limit). Do research and
> work in the main context until that changes. See `tasks/lessons.md`.

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
