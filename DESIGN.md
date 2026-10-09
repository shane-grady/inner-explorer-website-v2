# DESIGN.md — Inner Explorer design system in code

**Not written yet.** The marketing site is between designs: the previous design's tokens
and components were removed, and the design-foundation PR (`tasks/rebuild-plan.md`)
brings in the new one and replaces this file with the real reference: token names,
the type ramp, spacing, `ie-*` component classes, and the provisional site-only values.

Until then:

- **Source of truth:** the "Inner Explorer" design system,
  https://claude.ai/artifact/XSmeot9ufJMTTvGDh3GYxz, and the site design on the
  "Inner Explorer — Website" canvas, https://claude.ai/artifact/6gx8tapeaDzTeSSMD7R31s
  (page FINAL V).
- **Marketing pages stay unstyled** (`src/styles/site.css` is plain Tailwind).
- **The Help Center keeps its frozen styles** in `src-help/styles/help.css` until it is
  reskinned onto the new design system (see `src-help/README.md`).
