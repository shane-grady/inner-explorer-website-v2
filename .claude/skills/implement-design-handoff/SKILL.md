---
name: implement-design-handoff
description: >-
  Use this skill whenever the user asks to build, implement or port a page of the Inner
  Explorer marketing site from its design: a page name ("build the Contact page", "do
  Platform next"), a board of the "Inner Explorer — Website" canvas (FINAL V), a
  claude.ai/artifact design link, or phrasings like "implement this design", "build this
  page from the boards", "turn this mockup into a real page". Use it EVEN IF you could
  hand-build the page: the point is to map the boards onto the SHARED tokens and
  components (extending the system where a pattern repeats), not bespoke per-page code.
  Not for editing an existing page or refactoring a single component.
---

# Build a page from its FINAL V boards

The design lives on the **FINAL V** page of the canvas "Inner Explorer — Website"
(https://claude.ai/artifact/6gx8tapeaDzTeSSMD7R31s). Each page has a desktop board (1440)
and one or more mobile boards (390). The design systems are secondary; where they disagree
with the boards, the boards win. Read the boards with the Artifact tool: list the canvas's
files, then read `project/<Page>-Desktop*.dc.html` and `project/<Page>-Mobile*.dc.html`.

## Prime directive: the system over one-offs

The foundation (`DESIGN.md`) holds the tokens, the type ramp, the `ie-*` classes and the
shared components, and `design/inventory.md` names every pattern on the boards with its
status. A page is composed from those parts. When a board differs from what the system
does, change the system (a variant, a token marked `provisional`, a new block when a second
page needs the pattern), never the page alone.

## Workflow

1. **Read** `CLAUDE.md` (the page-PR playbook), `DESIGN.md`, `design/inventory.md`, the
   page's rows in `tasks/todo.md` ("Before build: confirm"), and `/styleguide/`.
2. **Read the boards** and write the map before coding: each section → existing component,
   new variant, new shared block, or page-only; each off-token value → how it is resolved
   (the inventory's second table has the known ones). Share the map with the user if a
   section needs a decision the boards do not settle.
3. **Build** the page file: the `content` object at the top (copy verbatim from the boards,
   sentence case), then `<Section>`s composed from the shared components, then JSON-LD
   (port it from `git show 0c8cac2:src/pages/...`). Images go in `src/assets/images/<page>/`
   through `<Image>`. Behavior is a small `<script>` on `data-*` attributes.
4. **Extend the system** where the map says so: a variant as an `as const` map entry, a
   token in `src/styles/tokens.css` with its board in the comment, a block in
   `src/components/blocks/`. Show every new variant on `/styleguide/`.
5. **Verify:** `pnpm verify`, then `pnpm shots` and compare `.screenshots/<page>-1440.png`
   and `-390.png` with the boards; axe must be clean. Update `design/inventory.md`
   (status of the patterns you built) and tick the page in `tasks/todo.md`.

## Anti-patterns

- Transliterating a board's inline styles into a page (`<style>` blocks, arbitrary values,
  raw colors: the drift guard rejects them).
- A `blocks/<page>/` folder or a component named after a page.
- Snapping a board's copy to your own words. Copy is verbatim; typo fixes only.
- Building a variant no board draws "for later".
