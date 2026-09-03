# Visual editing — verified contract

Updated 2026-09-02. This replaces the earlier section census and records the
fixed-layout editing contract now enforced by `pnpm verify:cms`.

Coverage is verified mechanically, not by inspection. The editable-region guard
replays CloudCannon's resolver over both built sites and checks every region against
its backing entry, dataset, configured input, and registered component.

**Current state: 8,745 regions across 92 generated pages.**

| Region kind          | Count |
| -------------------- | ----: |
| Text                 | 5,383 |
| Image                |   180 |
| Array                |   549 |
| Array item           | 2,462 |
| Registered component |   171 |

Four generated pages contain inherited regions but are not directly openable as CMS
entries. This is expected: `/help/` and `/styleguide/` in the marketing build, plus
`/` and `/404` in the Help build. The Help home copy remains intentionally editable
from **Site Settings -> Help Center Home** (`src/data/help-ui.json`).

## Editing model

The thirteen Marketing Pages are singleton YAML entries with stable `pageTitle` and
`permalink` previews. Their Astro routes keep section order, design tokens, imported
assets, and layout decisions in code. Editors can change copy, media, metadata, and
safe repeatable lists; they cannot add page-builder blocks or reorder fixed layout
groups.

Every repeatable field has an explicit item structure. Groups whose size or order is
part of the design disable add, remove, and reorder controls. Blog, Case Study, Help,
Narrator, and Series creation schemas expose every field required by their renderer
and Zod contract.

Primitive text and image values use primitive editable regions. A registered
component is used only when a boolean, enum, optional field, shared-data dependency,
or conditional branch requires CloudCannon to re-render markup or styling:

- `site-header`, `site-footer`
- `pricing-plans`, `glow-cta`, `case-study-cta`, `series-cta`
- `editorial-quote`, `voice-intro`, `research-cta`, `bring-it-cta`
- `editorial-cta`, `split-cta`, `faq-section`
- `listing-masthead`, `contact-masthead`, `pricing-masthead`, `faq-masthead`
- `faq-pricing`, `faq-quotes`, `meet-studio-hero`, `research-hero`
- `about-timeline`, `about-voices`, `about-team`
- `district-hero`, `district-numbers`, `district-day`, `district-comparison`
- `home-live-now`, `home-how-it-works`, `home-proof`, `home-stories`
- `platform-feature`, `platform-impact`, `platform-outcomes`, `platform-updates`

## Deliberate save-and-rebuild fields

These are safe sidebar inputs, not missing bindings:

- `series.tone` is a root scalar that controls the page theme. CloudCannon cannot
  scope a standalone registered component to an empty root path without changing the
  content shape, so it updates after Save and rebuild.
- Pricing `plans[].highlight` drives both the plan cards and a separate comparison
  table. The cards re-render live; the mirrored comparison treatment updates after
  Save and rebuild.
- Blog `titleHtml` preserves authored inline emphasis. A primitive text editable
  would strip that markup, so it remains a sidebar field and updates after Save.
- About `stats` and Research `outcomes` are root arrays, so there is no non-empty
  object path for a standalone registered component. Existing primitive values edit
  inline; optional stat suffixes and Research chart-type changes update after Save
  and rebuild.
- Home `gradeBands.bands[].tone` is a numeric design token rather than visible copy.
  It stays a sidebar control and its class treatment updates after Save and rebuild.
- A Case Study's optional `editorialQuote` and a Narrator's optional `voiceIntro`
  re-render live whenever the object already exists. On entries where the whole
  object is absent, there is no DOM host for CloudCannon to replace; adding one is a
  sidebar Save-and-rebuild operation. This is deliberate and avoids adding empty
  layout shells or changing either content model.

## Guardrails

`pnpm verify:cms` is the single acceptance command used locally and by CI/builds. It
performs type checking, linting, formatting checks, CloudCannon schema validation,
both site builds, editable-region validation, and negative-fixture tests.

The guard fails for:

- invalid image source or alt bindings;
- unknown registered components;
- editable fields without a matching CloudCannon input;
- nested array items without a nested binding;
- missing or duplicate Marketing Page permalinks;
- mismatches among page IDs, CloudCannon schemas, Zod discriminants, routes, and
  generated output;
- incomplete creation schemas; and
- root-relative links to known Help articles.

The negative fixtures prove each failure mode independently. The conversion procedure
for future fixed-layout pages remains in
[page-conversion-recipe.md](page-conversion-recipe.md).

## Fields intentionally not editable on canvas

The following stay available in the sidebar when appropriate:

- numeric values whose runtime type must remain a number;
- token enums such as `tone`, `icon`, `variant`, and `kind`;
- pre-split animated text whose span boundaries drive motion;
- script-owned count-up or rotating text nodes;
- derived values such as JSON-LD, computed counts, and sibling-entry grids; and
- decorative `aria-hidden` product mockups.

This boundary prevents visual editing from changing types, flattening authored markup,
or making derived content drift from its source.
