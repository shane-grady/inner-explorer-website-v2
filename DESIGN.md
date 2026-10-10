# DESIGN.md — the Inner Explorer design system in code

How the website's look is wired, where every value came from, and how a page PR uses it.
Read with `CLAUDE.md` (the page-PR playbook) and `design/inventory.md` (every pattern on
the boards and where it lives).

## Sources

- **Source of truth: the FINAL V page** of the canvas "Inner Explorer — Website",
  https://claude.ai/artifact/6gx8tapeaDzTeSSMD7R31s (39 boards, read with the Artifact
  tool). Every color, type size, spacing, radius, shadow and component style here was read
  off those boards.
- **Secondary:** the design systems "Inner Explorer" (https://claude.ai/artifact/XSmeot9ufJMTTvGDh3GYxz)
  and "Inner Explorer Design System" V2 (https://claude.ai/artifact/DVAYqoSPn9uNeodz9HXVox).
  Token and class names follow V2 where V2 names the same value FINAL V draws; the fonts and
  logo files are V1's. Where a system and FINAL V disagree, FINAL V wins (table below).
- The canvas's other pages are working pages. One thing comes from outside FINAL V: the open
  mobile menu, which FINAL V never shows, follows V2's MobileMenu spec.

## Files

| File                                       | Role                                                                                                                                                                                                                                                                                                                                                              |
| ------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/styles/tokens.css`                    | **The single source of every value**: the eight `@font-face` rules and `:root` with one token per line, grouped by family, with the FINAL V board it came from in the comment beside it. `provisional` marks a value FINAL V does not settle.                                                                                                                     |
| `src/styles/theme.css`                     | The only place Tailwind meets the tokens: removes Tailwind's palette, type scale, radii and shadows; aliases the tokens so `bg-surface`, `text-foreground-body`, `border-border`, `outline-ring`, `py-section-y`, `max-w-page`, `rounded-sm`, `shadow-raised` read the token variable at the element; defines the `type-*` ramp; remaps ink on `[data-on-brand]`. |
| `src/styles/base.css`                      | `html`, `body`, links and the focus ring. Nothing else.                                                                                                                                                                                                                                                                                                           |
| `src/styles/components.css`                | The `ie-*` classes: multi-property patterns and interaction states, values only from `var(--…)`, plus the HubSpot form mapping under `[data-hsform]`.                                                                                                                                                                                                             |
| `src/components/ui/`, `layout/`, `blocks/` | The shared components (below).                                                                                                                                                                                                                                                                                                                                    |
| `src/pages/styleguide/`                    | Every token, type style and component in every state (noindex).                                                                                                                                                                                                                                                                                                   |
| `design/inventory.md`                      | Every repeating pattern on the boards, its component, its status, and the off-token values per board.                                                                                                                                                                                                                                                             |

## Tokens

Names in **bold** are V2's; _italic_ names are new (FINAL V draws the value, V2 has no name
for it). Provenance is the comment beside each token in `tokens.css`.

- **Palette** (only the colors FINAL V draws on two or more boards): **green-900 … green-100**
  (seven brand greens) and _green-50_ Mist (Home testimonials, Pricing's recommended plan), **charcoal, dark-slate, slate, storm, gray, warm-gray, light-warm,
  off-white, near-white, white, black**, **cyan-600/400/200, yellow-400/200, orange-500/200,
  coral-600/300**. The neutrals are not exposed to Tailwind; use the semantic names.
- **Semantic:** **background, surface, tint; foreground, foreground-secondary, foreground-body,
  foreground-muted; brand, brand-hover, brand-wash, brand-emphasis, link-hover, icon-accent;
  brand-surface** (Emerald panels), **brand-surface-deep** (Forest heroes and bands);
  _brand-tint_ and _border-brand_ (the accent testimonial);
  _brand-shade_ (provisional: the darker strip closing Pricing's Advanced Wellness panel);
  **on-brand, on-brand-muted, on-brand-accent, on-brand-wash, border-on-brand; _numeral-sign_ (a stat's "+" or "%": Vibrant, Leaf on green); brand-subtle,
  on-brand-subtle; border, border-control, border-input; ring, ring-on-brand; danger;
  accent-bar-1/2/3**.
- **Type families:** **font-sans** (Inter 400/500/700/900), **font-display** (Libre Caslon
  Condensed 500 and 500 italic), **font-serif** (Libre Caslon Text 400 and 400 italic). Those
  eight files are the only faces the boards load.
- **Spacing:** **space-1 … space-20** (the 4px scale, equal to Tailwind's `p-6` = 24px) plus
  _space-14_; the fluid layout tokens **section-y** 64→112, **section-x** 20→120,
  **hero-top** 40→72, **hero-bottom** 48→96, **strip-y** 40→64, **card-padding** 20→24,
  **card-gap** 8, **cta-padding** 32→72 and _cta-padding-x_ 24→72, each one `clamp()` from the
  390 board to the 1440 board; _bleed_ (provisional), how far a half-bleed panel runs past the
  content edge (the gutter up to 1440, wider beyond: Why's reasons).
- **Radius:** **radius-sm** 8 (containers, images, tags, inputs), **radius-md** 12 (buttons,
  chips, the menu button), **radius-full**.
- **Shadow:** **shadow-raised, -floating, -card-hover, -primary, -primary-hover, -primary-pressed,
  -light, -sticky**, plus Home's _-brand-panel, -brand-card, -on-photo, -text-on-photo, -video, -play_,
  verbatim from the boards' CSS; _-lifted_ (provisional: Platform's player card, the cards over its
  photos and its product screenshot); Why's _-photo_, _-figure_, _-tile_ / _-tile-sm_ and
  _-brand-bar_ (provisional: the reason photos, the foundation figure, its subject tiles and its
  Emerald base bar).
- _Photo treatment_ (Home): _scrim-photo_ (desktop) and _scrim-photo-mobile_, _scrim-video_,
  _on-photo-control_, _on-photo-dot_, _photo-tone_ (the boards' sepia filter); Research's
  _scrim-hero_ and _scrim-hero-figure_ (provisional: the Forest vignette over the neuron footage
  and the pool behind the brain diagram, `.ie-hero-scrim` / `-figure`).
- **Size:** **control-height** 48, **control-height-sm** 44, **header-height** 80/64,
  **logo-height** 32/28, **accent-bar-height** 4, **container** 1200, **measure** 520,
  _measure-short_ 320, _swatch-size_ 10 (the color key in an evidence tag: Platform, Research), **measure-article** 680, _form-card_ 576 (`w-form`), _figure-height_ 220 → 400 (`h-figure`), **icon-sm/md/lg/feature/disc**, _icon-check_ 22 and _icon-check-sm_ 18 (the filled check disc), _measure-wide_ 640 (Pricing's hero lead, `PageTitle leadWidth="wide"`), _measure-cta_ 560 (the inline closing CTA's lead), _measure-note_ 760 (a footnote under a table), _measure-narrow_ 480 (About's research intro), _measure-title_ 820 (a centered section title, About), _collapse-height_ 640 (Pricing's collapsed table) and _collapse-height-sm_ 260 (Research's citations, provisional), _hero-photo-height_ 560 → 640 (`h-hero-photo`).
- _Motion:_ `220ms cubic-bezier(.16, 1, .3, 1)`, every transition on the boards; _motion-fade_
  700ms on the same curve, the hero carousel's crossfade; Research's _marquee-duration_ 36s and
  _pulse-duration_ 1.6s (provisional).
- _Research patterns_ (provisional): _sand-dots_ / _sand-dots-size_ (the dotted "sand" under the
  wall of initiatives), _marquee-fade_ (the partners marquee's faded edges).

### Type ramp (`type-*` utilities, desktop → mobile as one clamp each)

| Utility                              | Desktop → mobile                             | Use                                                                                                                                                |
| ------------------------------------ | -------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `type-display`                       | 96/0.98/700/−0.035em → 52                    | the photo hero's H1; `.ie-display` sets its `*second line*` in Caslon Condensed italic at 1.25em                                                   |
| `type-page-title`                    | 64/1.05/700/−0.025em → 40                    | the H1                                                                                                                                             |
| `type-section-title`                 | 44/1.1/700/−0.02em → 32                      | H2s, CTA titles                                                                                                                                    |
| `type-section-title-sm`              | 40/1.12/700/−0.01em → 32                     | a section title beside a figure (About's research)                                                                                                 |
| `type-card-title-lg` / `-md` / `-sm` | 28 → 24 · 20 → 18 · 16, bold, −0.01em        | feature cards · grid cards · list items, names                                                                                                     |
| `type-statement` · `type-stat-label` | 30/1.3/700 → 22 · 18/1.35/700 → 15           | Home's solution statement · stat-strip labels                                                                                                      |
| `type-list`                          | 16/1.45/500                                  | `Checklist size="sm"` (Home's program cards)                                                                                                       |
| `type-lead-lg`                       | 24/1.45/500 → 19                             | the intro under the photo hero                                                                                                                     |
| `type-lead`                          | 20/1.5/500 → 18                              | the one intro under a title                                                                                                                        |
| `type-intro`                         | 18/1.5/500 → 17                              | a section intro beside its title (Pricing); bold, the add-on panel's statements and the table's group titles                                       |
| `type-body`                          | 17/1.6/500                                   | body copy                                                                                                                                          |
| `type-small`                         | 15/1.5/500                                   | captions, notes, the footer                                                                                                                        |
| `type-article-body`                  | 18/1.7/400 → 17/1.65                         | long-form articles only                                                                                                                            |
| `type-quote` · `type-pull-quote`     | Caslon Text 20/1.5 → 18 · italic 28/1.4 → 24 | testimonials · editorial pull quotes                                                                                                               |
| `type-eyebrow` · `type-breadcrumb`   | 14/1.12/700, +0.08em · +0.06em, uppercase    | labels above titles · trails                                                                                                                       |
| `type-label` · `type-tag`            | 14/1.4/500 · 13/1/700                        | dates, roles, sources · tags                                                                                                                       |
| `type-stat-xl/lg/md/sm`              | 112/72/56/44 → 72/56/44/40                   | numerals; add the face: `font-display font-medium` (Home, Article, Newsroom), `font-sans font-bold` (Why, Pricing, About), `font-black` (Research) |

Nothing but tags goes under 14px. Headings and body take their color from a utility
(`text-foreground`, `text-foreground-body`…); inside a green `Section` or `ClosingCta` the
`[data-on-brand]` remap turns them white.

## Components

A component exists only where it renders markup a class cannot (an SVG, a stretched link,
a variant map). Everything else is a plain element with a `type-*` utility or an `ie-*`
class.

- `ui/Button` (primary · secondary · light · ghost; md · sm; `arrow`, or `icon` for another
  trailing icon: Research's download; `block`; link or button),
  `ui/ArrowLink` (`light` on green; `icon="arrow-down"` for a jump down the page, nudging down on
  hover: Research; the label is trimmed and its last word kept with the arrow), `ui/PageTitle` (eyebrow, H1 with `*emphasis*`, accent bar,
  lead, `actions` slot; `leadWidth="wide"`; `breakFrom="md"` keeps the title's break to md up), `ui/Checklist` (`marker="disc"`, `size="xs"`, `flow="columns"`: Pricing's add-on list), `ui/Card` (raised · floating · tint; `title`, `titleSize`, `href` makes
  the title a stretched link), `ui/Icon` and `ui/FeatureIcon` (registries in `src/lib/icons.ts`
  and `src/lib/feature-icons.ts`; feature icons are Phosphor fill, bare at 16/20/24/32/40 or `disc`),
  `ui/IconButton`, `ui/Checklist` (`{ lead, text }` items with a bold lead-in, `strong` bold claims: Why), `ui/Section` (tone ground · white · tint · emerald · forest;
  spacing section · hero · strip; owns the container), `ui/Logo` (`size="sm"`: 28px at every
  width, Research's foundation bar), `ui/VideoPoster` (a 16:9 poster link that opens the video on
  its host).
- `layout/SiteHeader` (light, `dark` over a Forest hero, `overlay` laid over the page's first
  section; the dark header's current link has a Leaf rule; the skip link; static, as on the boards),
  set from `PageLayout header="dark"` (Research: the hero clears the header itself),
  `layout/MobileMenu` (native `<dialog>`, one small script), `layout/SiteFooter` (Footer A).
- `blocks/ClosingCta` (emerald · white, `floating` for Home's borderless white card, ± photo (held
  at 520 on Emerald and Floating; as tall as its copy on Raised, Platform),
  `layout="inline"` for copy left and buttons right from lg: Pricing, Case Studies, Research; on
  Emerald its `*words*` stay white, as the boards draw them),
  `blocks/Testimonial` (card · panel · accent: Mist ground, 6px Emerald top border, Emerald mark),
  `blocks/PhotoHero` (photo or carousel under a scrim, display H1, intro and `actions`; no
  autoplay), `blocks/StatStrip` (numerals over labels: `divided`, hairlines from lg (Home); `ruled`, three
  columns under hairlines with a source line (Why); follows `[data-on-brand]`), `blocks/LogoStrip` (label and partner names, a logo where supplied;
  `layout="wall"`: a centered label over wrapping logo cells, grayscale at _logo-opacity_ until
  hovered, optionally linked to coverage: About; `layout="marquee"`: the names scrolling in a loop
  under faded edges, paused on hover, by its pause button or a page's `[data-motion-paused]`, a
  still wrapping row under reduced motion: Research), `blocks/EvidenceCard` (a Raised card: tag
  with its color swatch and plain extra `tags`, the numeral in Inter 500 on `type-stat-sm`, the
  finding, the source under a rule (optional: Research puts the title and byline in the slot),
  a `details` slot after the rule; `emerald` or `vibrant` tone: Platform, Research).
- Classes without a component: `.ie-accent-bar`, `.ie-tag` (+ `-on-brand`), `.ie-chip`,
  `.ie-icon-disc`, `.ie-field`, `.ie-label`, `.ie-field-error`, `.ie-card-*`, `.ie-nav`,
  `.ie-menu-*`, `.ie-footer-link`, `.ie-skip-link`, `.ie-photo-tone`, `.ie-sticky-bar`,
  `.ie-card-recommended` (Mist, 2px Emerald border: Pricing's recommended plan), `.ie-check-disc`,
  `.ie-minus-disc` (its "not this" partner: Why's curriculum table), `.ie-bleed-start` /
  `.ie-bleed-end` (a panel running to the viewport's edge from lg: Why's reasons),
  `.ie-switch` / `.ie-switch-track`, `.ie-collapse` (`data-collapsed`: clipped under a fade),
  `.ie-compare-highlight` (the recommended column's outline over a 40/20/20/20 table),
  `.ie-swatch` (EvidenceCard's color key), `.ie-tabs` / `.ie-tab` / `.ie-tab-sub` (Platform's
  segmented tabs: Forest track, white selected tab), `.ie-play-btn` and `.ie-progress` (Platform's
  sample player),
  `.ie-logo-wall` / `.ie-logo-link` (LogoStrip's wall), `.ie-marquee` / `.ie-marquee-track`
  (LogoStrip's marquee), `.ie-chip[role='switch']` (a chip holding `.ie-switch-track`, Emerald when
  on: Research's "Show our work"), `.ie-segmented` (+ `-on-brand`, coral for a `data-alarm`
  choice: Research's wall and brain switches), and Research's page-only `.ie-hero-scrim` /
  `-figure`, `.ie-stop-leaf` / `-alarm` / `-alarm-fade` and `.ie-brain-pulse` (the brain diagram),
  `.ie-wall-block` and `.ie-sand` (the wall).
- `[data-on-surface]` inside a `[data-on-brand]` panel restores the light ink for a white box
  (Pricing's add-on prices).

Page-local patterns (tabs, players, charts, stat strips, steps, tables, sticky bars, the
Article rails) are built by their page from these parts and listed in `design/inventory.md`.

## Where FINAL V and the design systems disagree

| Topic                     | FINAL V                                                                        | V1                                                         | V2                              | In code                               |
| ------------------------- | ------------------------------------------------------------------------------ | ---------------------------------------------------------- | ------------------------------- | ------------------------------------- |
| Green surfaces            | Emerald panels, Forest heroes and bands                                        | `surface-brand` = green-400, never a surface on the boards | brand-surface = 700, deep = 800 | V2                                    |
| Input radius              | 8px                                                                            | —                                                          | 12px                            | 8px                                   |
| Accent-bar gap            | 8px on six of eight pages (12 About, 16 Contact and Platform desktop)          | 8px                                                        | 8px                             | 8px                                   |
| Fonts shipped             | Inter 400/500/700/900, Caslon Condensed 500 + italic, Caslon Text 400 + italic | 13 files                                                   | 9 files                         | the 8                                 |
| Stat face                 | four faces as drawn, one size ramp                                             | "set by the page"                                          | four faces                      | size utilities + face utilities       |
| Header                    | static                                                                         | —                                                          | "if made sticky…"               | static                                |
| Light-header current page | `aria-current` only, unstyled                                                  | —                                                          | bold + 2px rule                 | bold + 2px Emerald rule (provisional) |
| Footer                    | A on 11 of 12 boards; B (501(c)(3) line, extra links) on Research-Desktop-2    | —                                                          | A                               | A, no 501(c)(3) line                  |
| Feature-icon disc         | Emerald (Contact desktop alone: Spring)                                        | Emerald                                                    | Emerald                         | Emerald                               |

## Provisional values (FINAL V does not settle them)

- The open mobile menu (V2's spec: 56px rows, Contact us + Sign in at full width).
- The light header's current-page style (bold with a 2px Emerald rule, mirroring the dark header).
- The social row: hidden until profile URLs exist (`tasks/todo.md`).
- Field error state (`danger` border and message; the boards draw no error).
- `--form-card` (576, the Contact form card) and `--figure-height` (220 → 400, the Contact hero
  photo): drawn only on Contact.
- The dark header's hairline and menu-button border snap to `border-on-brand`.
- `--brand-shade` (black 14% over Emerald, Pricing's add-on strip): drawn on one board.
- `--measure-narrow` (480), `--measure-title` (820) and `--logo-opacity` (0.7, grayscale): drawn
  only on About.
- `--shadow-lifted` (the player and overlay cards, the product screenshot): drawn only on Platform.
- `--shadow-photo`, `--shadow-figure`, `--shadow-tile` / `-tile-sm`, `--shadow-brand-bar`: drawn
  only on Why.
- `--bleed` and `.ie-bleed-start` / `-end` (the reasons' half-bleed Emerald panels): drawn only on
  Why. The section clips the overflow (`overflow-x-clip`), since `100vw` counts a classic scrollbar.
- The switch's off-state track keeps a 1px `border-input` outline the board doesn't draw, so the
  control meets 3:1 against white (WCAG 1.4.11).
- Research only: `--scrim-hero` / `-figure`, `--collapse-height-sm`, `--sand-dots` / `-size`,
  `--marquee-fade`, `--marquee-duration`, `--pulse-duration`; the marquee's pause button (the board
  pauses only on hover; WCAG 2.2.2 needs a control); the brain's glows snapped to Leaf, coral-300
  and coral-600 (board #7fd67f, #ffc2b8, #ff8a75) and its mindful label to Spring (#7fd67f fails AA
  on Forest).

## Rules and guards

- Values come from tokens: no `<style>` blocks, no arbitrary Tailwind values, no raw colors,
  and in `base.css`/`components.css` no lengths other than `0`, `1px`, `2px` outside `var()`
  (`pnpm lint:drift`). `style=` may only set `--custom` properties or `object-position`.
- Every class in the built HTML has CSS, and every `ie-*` class with CSS is used by a page
  (`pnpm check:dist dist --classes`).
- **Adding a token:** add the line to `tokens.css` with its FINAL V source in the comment, alias
  it in `theme.css` if a utility should read it, show it on `/styleguide/` (it reads
  `tokens.css`), and note it here if it is provisional.
- **Done** for a page PR: `pnpm verify`, `pnpm shots` (screenshots at 1440 and 390 in
  `.screenshots/`, axe clean) compared with the FINAL V boards, `/styleguide/` and
  `design/inventory.md` updated.
