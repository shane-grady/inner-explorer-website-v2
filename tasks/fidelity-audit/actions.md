# Actions audit: Button, ArrowLink, IconButton, Chip

34 rows in `actions.json`: 4 MATCH, 4 DEFECT, 8 DECIDED, 5 BOARD-INCONSISTENT, 3 SYSTEM-CHANGE, 8 MISSING, 2 NOT-ON-BOARDS.

**How I measured.** I took instances from the census (classes, inline styles and the board source for SVG strokes). I rendered the system components with each board's own copy (`work/actions/sys.html`, then `sys-1440.json`). I probed rest, hover, press and keyboard focus on the boards and on the system with Playwright (`work/actions/state.mjs`, outputs in `work/actions/st/*-out.json`).

None of the four components has a `compact` prop. `bundle.css` has no width-dependent rules for them, so one render covers both 1440 and 390. The mobile instances were also measured directly: block buttons at 350, 308 and 302px, and wrapped links at 350px.

## DEFECT list (most visible first)

1. **Button `block`: long labels can't wrap (high).**
   - Board: Research-Experiment-Mobile-2 wraps two block buttons to two lines. The secondary is 350×66 and the light is 350×62, using `height:auto; min-height:48px; padding:12px 24px; white-space:normal`.
   - System: the height is fixed at 48px with `nowrap`. The light label starts 37px outside the button (`work/actions/crop-sys-long.png`).
   - Fix (`bundle.css`): `.ie-btn-block{block-size:auto;min-block-size:var(--control-height);padding-block:var(--space-3);white-space:normal;text-align:center;line-height:1.2}` and `.ie-btn-block.ie-btn-sm{min-block-size:var(--control-height-sm)}`.
2. **IconButton has no disabled state (medium).**
   - Board: Research-Studies-C-Timeline uses `.ie-nav-btn:disabled{opacity:.4;cursor:default}`, and its hover applies only `:not(:disabled)`.
   - System: no `:disabled` style.
   - Fix: `.ie-icon-btn:disabled{opacity:.4;cursor:default}`, plus resetting the hover border and fill when disabled.
3. **IconButton filled play icon (low).**
   - Board: 18px on Platform-Desktop-1 (5), Platform-Mobile-1 (5) and Platform-Programs-Green (4).
   - System: 20px.
   - Fix: `.ie-icon-btn-filled .ie-icon{inline-size:18px;block-size:18px}`.
4. **IconButton square play link in the sticky bar (low).**
   - Board: 16px icon on Home-Mobile-Scrolled.
   - System: 20px.
   - Fix: `.ie-sticky .ie-icon-btn .ie-icon{inline-size:16px;block-size:16px}`.

## Button

Found on 36 boards: 126 instances (primary 30 + sm 17, secondary 32 + sm 11, light 25, ghost 11). There are also 8 unclassed share buttons on Article-Desktop-1 and Article-Desktop-2.

**Matches.**

- Height, padding, radius, type, fills, borders and shadows are equal.
- The trailing arrow (20px, 8px gap) matches.
- All 26 label widths are equal to the pixel, and block widths match.
- Every hover, press and focus rule in the 36 boards' shared style block resolves to the same computed values as `bundle.css`. That covers `:hover`, `:active`, `.is-hover`, `:focus-visible`, the white ring on light and ghost, 220ms timing and reduced motion.
- The only computed difference is line-height (`normal` against `1`), which changes nothing visible.

**Differences.**

- **MISSING:** a leading utility icon at 16px. It appears on Article-Desktop-1, Article-Mobile-1 (18px), Article-Mobile-2, Contact-Desktop and Contact-Mobile. The system puts the icon after the label at 20px.
- **BOARD-INCONSISTENT:**
  - Light-button arrow colour: 22 use currentColor `#152f2f` (the system follows this majority); 3 use `#006e51` (Newsroom-Desktop, Newsroom-Mobile, Article-Mobile-2).
  - Article share buttons: desktop shows a neutral outline (1px `#cccbc4`, 14/500 charcoal, raised shadow, 8 instances). Mobile uses secondary sm (4 instances), and the system can only do the mobile version.
  - Pricing's "Contact us for districtwide pricing" arrow collapses to 0px on the board; the system keeps it.
- **DECIDED:** Research-Experiment-Desktop and -Desktop-2 use their own button block: 52px height, a 1px `rgba(255,255,255,.55)` ghost border, a .08 ghost hover, no secondary wash, and 18px icons at stroke 2.2. The Component Library overrides this: "108 buttons on one shared set of styles. Secondary and ghost keep the 2px outline". "84 stroke widths set to 2" comes from the Type and Icon decisions.
- **SYSTEM-CHANGE:** "Contact Us" becomes "Contact us" (9 instances).
- **NOT-ON-BOARDS:** the forced-colors border.

## ArrowLink

47 instances on 19 boards (39 on light, 8 on green).

**Matches (42 instances).**

- 16/700/24px type, 10px padding, 44px height, `#006e51` (white on green).
- 1px underline at a 4px offset.
- 20px arrow; its x offset is equal for every label.
- Two-line wraps at 350px match.
- States match: hover `#1e473c` (`#bffaa2` on green), a 2px arrow nudge, and the focus ring.

**Differences.**

- **DECIDED** (Component Library: "51 links in one style: 16px bold … 44px tap height. White version on green"): Research-Experiment-Desktop uses 15px links, line-height 1.35, 12px padding and 16px arrows, and its hero link is `#bffaa2` at rest.
- **MISSING:**
  - An arrow-down jump link: "Here is the proof." on Research-Experiment-Desktop and Research-Experiment-Mobile-1.
  - A back link with a leading arrow-left, 15px and 32px tall: "Back to the form" on Contact-Desktop and Contact-Mobile.
- **SYSTEM-CHANGE:** `ie-keep` holds the last two words, where 28 board links hold one. The measured wraps are identical.

## IconButton

**Instances.**

- Platform play buttons: 14.
- Research timeline prev/next: 2.
- Sticky bar play link: 1.
- Home carousel arrows: 4 (Main, Home-Mobile).
- Home video play disc: 2 (96px and 64px).

**Matches.**

- 48px size; a 24px radius on a 48px box draws the same circle as 999px.
- Fills, border and `shadow-primary` are equal.
- The icon is centred, with stroke 2 and round caps. The play and chevron paths are identical.
- The focus ring matches.

**Differences.**

- **DEFECT:** items 2–4 above.
- **BOARD-INCONSISTENT:**
  - Outline icon colour: `#282b2f` on the timeline, `#00874d` on the sticky bar, `#152f2f` on the Home photo arrows. The system's `#006e51` matches none of them.
  - Outline hover border: the timeline uses `#006e51`; the `.ie-car-btn` rule on 10 boards uses `#00874d`, which the system follows.
- **MISSING:**
  - On-photo carousel arrows (88% white, shadow, `#152f2f` chevron).
  - The 64px and 96px video play disc.
  - Both are page-specific under the README.
- **NOT-ON-BOARDS:** filled hover and the `sm` size.

## Chip

**Instances.**

- Newsroom: 5 filter chips plus a show-more toggle, desktop and mobile.
- Case Studies: a counted filter chip (template), desktop and mobile.
- Pricing: show-more toggle.
- Research: citation toggles, segmented toggles and switches.

**Matches.**

- 44px height, 0 16px padding, 12px radius, 1px `#cccbc4` border, 14/700 type and 8px gap.
- Widths match: 52, 88, 82, 107, 73, 166 and 190px.
- The count pill matches exactly: geometry, unpressed colours and position.
- Pressed `#00874d`, the hover border, focus, the 16px `#00874d` chevron and its rotation all match.

**Differences.**

- **SYSTEM-CHANGE:** the pressed count is a white pill with Emerald numerals.
- **BOARD-INCONSISTENT:** the Pricing toggle chevron is 18px charcoal. The system follows Newsroom and Research: 16px `#00874d`.
- **DECIDED** (Component Library: "One chip: 44px, 12px corners, 14px bold … toggles on … Research"):
  - Research citation toggles are 22px pills at 15px.
  - The segmented toggles use a 10px radius, 15px type, no border and an Emerald fill.
- **MISSING:**
  - Segmented-control track (Research, 3 boards).
  - The "Show our work" switch (Research, 3 boards).
  - The horizontal-scroll chip row on mobile (Newsroom-Mobile and Case-Studies-Mobile, with different insets).

## Hover, press and focus rules in the board style blocks against `bundle.css`

| Rule                                                                                                                           | Where             | Matches `bundle.css`?               |
| ------------------------------------------------------------------------------------------------------------------------------ | ----------------- | ----------------------------------- |
| Shared `.ie-btn-*`, `.ie-link*` and `.ie-chip` rules for `:hover`, `:active`, `.is-hover`, `:focus-visible` and reduced motion | 36 boards         | Yes (computed values are identical) |
| Research desktop button and link overrides                                                                                     | 2 boards          | No, but DECIDED                     |
| `.ie-chip[aria-pressed=false]:hover` suppressed, plus `:active` `scale(.98)`                                                   | 4 Research boards | No (segmented toggle)               |
| `.ie-nav-btn:hover` `#006e51` and `:disabled`                                                                                  | Timeline          | No (see above)                      |
| `.hc-ctl:hover` turns `#fff`                                                                                                   | Home              | No system variant                   |
| `.ie-video:hover` play disc to `#006e51` with `scale(1.06)`                                                                    | Home              | No system variant                   |
