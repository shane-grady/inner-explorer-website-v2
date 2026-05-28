---
name: implement-design-handoff
description: >-
  Use this skill whenever the user hands over a Claude Design handoff to build into
  this Inner Explorer marketing site (Astro 6 + Tailwind v4 token system) — use it
  EVEN IF you could hand-build the page, because the point is to map the design onto
  SHARED components and tokens (extending the system globally), not bespoke per-page
  code. Trigger on an `api.anthropic.com/v1/design/h/...` URL, an exported handoff
  bundle/zip, or a `*.html` design file; and on phrasings like "implement this
  handoff", "build this page from the design", "implement About Us.html", "here's a
  design from Claude Design", or "turn this mockup into a real page" — including when
  they don't say "handoff" but hand over a design URL/file and ask you to build the
  page. Not for editing an existing page, refactoring a single component, or designs
  from other tools like Figma. Reuses and extends shared blocks/primitives + tokens
  so small design deltas stay tweakable in one place.
---

# Implement a Claude Design handoff (reuse-first)

A Claude Design handoff is a **prototype** — hand-authored HTML/CSS/JS with inline
styles, stand-in copy, and Unsplash placeholder photos. Your job is **not** to
transliterate it. It is to reproduce its _visual intent and hierarchy_ on top of
this repo's design system, as cleanly as the system allows.

## Prime directive: components and tokens over one-offs

Most code here is written by agents and most design arrives from Claude Design. The
thing that keeps that loop producing consistent output is a **small, shared,
drift-resistant system** — semantic tokens + a handful of reusable primitives and
blocks. A page that ships a pile of bespoke, page-scoped components with hardcoded
values quietly erodes that system: every future change becomes a manual hunt.

So when the handoff differs from what the system already does, **change the system,
not the page**. Absorb the delta into a token or a component variant so the change
is global — the user can then adjust it once and have it reflect everywhere. Reach
for a new bespoke component only when a layout is genuinely singular.

**Resolve every section in this order (stop at the first that fits):**

1. **Reuse** an existing primitive/block as-is (`Hero`, `FeatureGrid`,
   `Testimonials`, `CTABanner`, `Section`, `Button`, `Heading`, `Text`, …).
2. **Extend** it — add a `variant`/`size`/`tone` to its `tailwind-variants` config,
   or add a **token** to `global.css` (`@theme`) — when the difference is stylistic.
3. **Create a new _shared_ block** in `src/components/blocks/` (data-driven, reusable,
   variant-friendly) when the section is a real, recurring pattern the system lacks
   (e.g. a timeline, a stat strip, a logo grid, a team grid).
4. **Page-local component** — only for a one-of-a-kind layout that will never recur.
   This is the exception, not the default.

A `blocks/<page-name>/` folder full of single-use components is a smell. Before
creating one, ask: "Is this a variant of something we have? Could another page use
this? Can a token absorb this difference?" Prefer the global answer.

> Fidelity vs. system: match the design's hierarchy, rhythm, and feel faithfully,
> but express it through tokens/variants. A 13px gap the handoff used is `gap-3`
> (12px) on the scale, not `gap-[13px]`. Encode brand colors/sizes as tokens, never
> magic numbers — that's both what keeps the drift guard green and what lets the
> user retune globally later.

## Workflow

**1 — Learn the system before touching the handoff.** Read `CLAUDE.md` and
`DESIGN.md` (project rules), skim `/styleguide` (`src/pages/styleguide/index.astro`)
and `src/components/` (primitives / layout / blocks), and open
`src/styles/global.css` (the token source of truth). Then read
`references/component-system.md` in this skill — it maps the component inventory,
the reuse decision tree, and the drift-safe styling patterns you'll need.

**2 — Get the handoff and read it in the right order.**

- Download the handoff URL with the **WebFetch tool** (the links are short-lived
  _signed_ URLs — `curl`/`wget` will 404; WebFetch carries the session auth and
  saves the gzip body to a `webfetch-*.bin`).
- Run `scripts/extract_handoff.sh <that-bin-path> /tmp/design-handoff "<open_file>"`
  to unpack + summarize (tree, README, chats, the ★ target HTML, the CSS/fonts/imgs).
- Read in this order: **README → chat transcripts → the target `open_file` HTML in
  full → the CSS it imports** (`colors_and_type.css` is the _real brand_). The chats
  tell you **where the user landed** (handoffs often contain rejected alternates —
  build the one they chose, named in the README/`open_file`).

**3 — Reconcile the brand globally.** Compare the handoff's `colors_and_type.css`
to `global.css`. If it's the real brand and the repo still has placeholders, map it
onto the **stable semantic token names** (a one-file rebrand that re-skins every
page) — don't fork tokens per page. Self-host bundled fonts and import logos as
assets. See the reference for the fonts/assets pipeline.

**4 — Plan section-by-section, then confirm.** For each handoff section, write down
the reuse path (step 1–4 above): which shared component you'll reuse/extend/create,
and which variants/tokens you'll add. If the page is large or the plan adds several
shared components, confirm the component plan with the user before building — that's
the cheapest moment to align on the reuse-vs-bespoke calls.

**5 — Build.** Page = composition of blocks. Keep page copy as **structured data at
the top of the page file** (the CMS-ready seam), feed it to data-driven blocks.
Style **only** through tokens (the drift guard fails the build on raw hex/`hsl()`/
arbitrary values). Use the drift-safe patterns in the reference (scoped `<style>` +
`var(--token)` + `color-mix` for bespoke geometry). Ship **minimal JS** (vanilla,
progressive-enhancement, content visible without JS, no React on marketing pages),
keep it **accessible** (semantic HTML, one `<h1>`, real `alt`, visible focus, honor
`prefers-reduced-motion`), and route SEO through `PageLayout` + `JsonLd`.

**6 — Verify (never skip).** Run `pnpm check` (typecheck + lint + **drift** +
format) and `pnpm build` — both must be clean. Then verify behavior in a browser
(the Claude Preview MCP: layout, interactions, responsive ≤920px, light **and**
dark, content visible with JS off) and confirm you didn't regress other pages.
Capture anything surprising in `tasks/lessons.md` and log the work in `tasks/todo.md`.

## Anti-patterns (these are the failure modes to avoid)

- **Transliterating the prototype** — copying its inline CSS/structure verbatim into
  a page-scoped component. Reproduce the _look_ via the system instead.
- **`blocks/<page>/` graveyards** — single-use components for things that are
  variants of existing blocks. Extend the block; add the variant.
- **Magic numbers / raw colors** in `.astro` (`bg-[#1a9a59]`, `mt-[13px]`,
  `hsl(...)`). The drift guard rejects them, and they can't be retuned globally.
- **React for trivial interactivity** — a toggle/scroll effect is a vanilla
  `<script>`, not a client island. Marketing pages should stay ~0KB framework JS.
- **Building the rejected design** — always confirm against the chats/README which
  variant the user actually chose.

## Files in this skill

- `scripts/extract_handoff.sh` — unpack + summarize a downloaded handoff bundle.
- `references/component-system.md` — component inventory, reuse decision tree,
  drift-safe styling patterns, fonts/assets pipeline, a11y/JS/SEO + verification
  checklists, and known gotchas. **Read it before planning a build.**
