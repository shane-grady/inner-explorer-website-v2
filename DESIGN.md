# DESIGN.md — Inner Explorer design system in code

**Not written yet.** The marketing site is between designs: the previous design's tokens
and components were removed, and the design-foundation PR (`tasks/rebuild-plan.md`)
brings in the new one and replaces this file with the real reference: token names,
the type ramp, spacing, `ie-*` component classes, and the provisional site-only values.

Until then:

- **Source of truth:** the "Inner Explorer Design System" (V2),
  https://claude.ai/artifact/DVAYqoSPn9uNeodz9HXVox, and the site design on the
  "Inner Explorer — Website" canvas, https://claude.ai/artifact/6gx8tapeaDzTeSSMD7R31s
  (page FINAL V). The system's README states the rules; its `tokens.json`,
  `components/bundle.css` and component READMEs hold the values and markup the site ports.
- **Marketing pages stay unstyled** (`src/styles/site.css` is plain Tailwind).
- **The Help Center keeps its frozen styles** in `src-help/styles/help.css` until it is
  reskinned onto the new design system (see `src-help/README.md`).
