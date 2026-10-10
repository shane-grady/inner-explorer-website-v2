# Chrome audit: SiteHeader, MobileMenu, SiteFooter, StickyBar, TextField

Method: every header, footer, sticky bar and form control was pulled from the census JSONs. Each board's header and footer subtree was diffed against the others (`work/chrome/cmp.mjs`). The system components were rendered with the boards' copy at 1440 and 390 (`work/chrome/*.html` → `sys-*.json`), and every text element's position was compared (`textcmp.mjs`). Hover and focus states, placeholder colours and text-ink positions were measured in Chromium (`states.mjs`, `ph.mjs`). Every proposed fix was checked by re-rendering with `fix.css` (`sys-fix-*.json`).

Counts: 14 DEFECT, 2 DECIDED, 5 SYSTEM-CHANGE, 6 BOARD-INCONSISTENT, 1 NOT-ON-BOARDS, 1 MISSING, 5 MATCH.

## DEFECTS, most visible first

| #   | Component · part                                                   | Board                                                                                                                       | System                                                    | Fix (bundle.css)                                                                                                              |
| --- | ------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| 1   | SiteFooter · desktop link rows (9 boards)                          | 18px rows, 12px gap, 30px pitch; links at heading +30/+60/+90                                                               | 22.5px li, 34.5px pitch; +37/+71/+106 (3rd link 16px low) | `.ie-footer-nav a { display:block; font: 500 15px/1.2 var(--font-sans) }`                                                     |
| 2   | SiteFooter · compact heading → first link (10 boards)              | 4px                                                                                                                         | 12px                                                      | `.ie-footer-compact .ie-footer-nav { gap: var(--space-1) }`                                                                   |
| 3   | SiteFooter · compact community block (10 boards)                   | 24px under the blurb                                                                                                        | 32px (gap 24 + margin 8)                                  | `.ie-footer-compact .ie-footer-community { margin-block-start: 0 }`                                                           |
| 4   | StickyBar · cta square practice link (Home-Mobile-Scrolled)        | 48×48                                                                                                                       | 40×48 (shrunk; also in the DS preview)                    | `.ie-sticky .ie-icon-btn { flex-shrink: 0 }`                                                                                  |
| 5   | StickyBar · play icon in that link                                 | 16px, stroke #00874d                                                                                                        | 20px, #006e51                                             | `.ie-sticky .ie-icon-btn { color: var(--brand) } .ie-sticky .ie-icon-btn .ie-icon { inline-size/block-size: var(--icon-sm) }` |
| 6   | SiteFooter · headings and "Join our mindful community" (19 boards) | line-height normal, 18px                                                                                                    | 1.5, 22.5px                                               | `.ie-footer-heading { font: 700 15px/1.2 … }`                                                                                 |
| 7   | SiteFooter · desktop legal row (9 boards)                          | 16px text, 41px row                                                                                                         | 21px, 46px                                                | `.ie-footer-legal { line-height:1.2 }` + `.ie-footer-compact .ie-footer-legal { line-height:1.5 }`                            |
| 8   | SiteFooter · link hover                                            | no visible change on the board; intended #1e473c, and Component-Library says "Link hover is one green (#1e473c) everywhere" | #006e51 + underline                                       | `.ie-footer-nav a:hover { color: var(--link-hover) }`                                                                         |
| 9   | SiteHeader · dark bottom rule (Research desktop + mobile)          | rgba(255,255,255,.14)                                                                                                       | .24 (border-on-brand)                                     | new token at .14, or accept                                                                                                   |
| 10  | SiteHeader · dark compact menu-button border (Research-Mobile-1)   | rgba(255,255,255,.4)                                                                                                        | .24                                                       | token at .4, or accept                                                                                                        |
| 11  | StickyBar · cta bar height                                         | 76px                                                                                                                        | 73px                                                      | `.ie-sticky-cta { min-block-size: 76px }`                                                                                     |
| 12  | StickyBar · prompt text (Article-Mobile-1/2)                       | ~17px lines + 4px gap; title at +17                                                                                         | 21px lines, no gap; title at +14                          | `.ie-sticky-text { display:flex; flex-direction:column; gap: var(--space-1) } .ie-sticky-text p { line-height:1.2 }`          |
| 13  | TextField · select chevron inset (Contact ×2)                      | right 14px                                                                                                                  | 16px                                                      | `inset-inline-end: 14px` (off-grid; accepting 16 is reasonable)                                                               |
| 14  | TextField · textarea start height (Contact ×2)                     | 122px (rows=4)                                                                                                              | 120px (field-sizing ignores rows)                         | `min-block-size: 122px`, or keep the documented 120                                                                           |

With fixes 1–3, 6 and 7 the footers render at 386px desktop (board 385) and 663px mobile (board 663; currently 395 and 701), with every element at its board position. Fixes 4, 5, 11 and 12 reproduce both sticky bars to ±1px.

## SiteHeader

**Instances:** 25 headers.

- Light desktop on 11 boards: About-D, Article-D-1/2, Case-Studies-D, Contact-D, Contact-Success, Main, Newsroom-D, Platform-D-1, Pricing-D, Why-D-1.
- Light mobile on 12 boards: About-M-1, Article-M-1/2/First-Screen, Case-Studies-M, Contact-M, Home-M, Home-M-Scrolled, Newsroom-M, Platform-M-1, Pricing-M, Why-M-1.
- Dark on 2 boards: Research-Experiment-Desktop and Research-Experiment-Mobile-1.

All light headers are visually identical; they differ only in `aria-current` attributes.

**Match:** the full geometry matches to the pixel: 80/64 heights, 120/20 sides, the link x-positions, the 32/24 gaps, the 44px link boxes, the CTA at 134×44, logo heights 32/28, the menu button, colours, and nav hover #006e51.

The census renders the Research header 45px tall, an overflow artifact of the static render. Its style says 80px, so 80 is the board value.

**Differences:**

- SYSTEM-CHANGE: the light current-page state (bold, Jade rule) is added. The About, Case Studies, Platform and Pricing boards show none. The dark current rule uses #bffaa2, not #44bb4a. The skip link and the 1280px switch are also deliberate changes.
- BOARD-INCONSISTENT: the Research header CTA is a ghost button with a 1px rgba(255,255,255,.55) border (136px wide). 36 boards define the ghost as 2px #fff. The system uses 2px, so it is 138px wide and the nav shifts 2px.
- BOARD-INCONSISTENT: the board CSS on 26 boards hovers nav links to #006e51, but the tracker text says #1e473c. The system follows the board CSS.
- MISSING (info): a 4px reading-progress bar sits above the header on all 5 Article boards. It belongs to one page, so it can stay page-level.

**Note (can't measure):** Home-Mobile-Scrolled shows the header pinned above mid-page content, which suggests a sticky mobile header. The system header isn't sticky, and the README leaves that choice to the site (with `scroll-padding-top`).

## MobileMenu

- NOT-ON-BOARDS: no board shows the menu open.
- MATCH: its 64px bar and its close/menu button match the boards' mobile header and menu button exactly: 44×44, 1px #cccbc4, radius 12, 20px outline icon.

## SiteFooter

**Instances:** 20 footers.

- 9 standard desktop footers, all identical: About-D, Article-D-2, Case-Studies-D, Contact-D, Home-D-2, Newsroom-D, Platform-D-2, Pricing-D, Why-D-2.
- 10 mobile footers, all identical: About-M-3, Article-M-2, Case-Studies-M, Contact-M, Home-M-2, Newsroom-M, Platform-M-2, Pricing-M, Research-M-2, Why-M-4.
- Research-Experiment-Desktop-2 has a different footer.

**Match:** padding, rules, the grid (2fr + 3×1fr, 32px gaps), logos, blurb style and line breaks, social discs (44px, tint, Emerald marks), the colours and weights of headings and links, the legal row layout, and the mobile 32px link rows.

**Differences:**

- DEFECTS: items 1–3 and 6–8 in the table above.
- DECIDED: on hover, the social mark turns #1e473c (the board's SVG fill stays #006e51).
- BOARD-INCONSISTENT: the Research desktop footer has different headings (uppercase, muted), 36px rows, 14 links, no social block and a 28px logo. The system follows the 9-board majority and the tracker's "All 18 footers carry the same 15 links".
- BOARD-INCONSISTENT: the Privacy policy link isn't underlined on the Case Studies, Newsroom and Pricing boards (6 boards); 14 boards underline it.

## StickyBar

**Instances:**

- cta variant on Home-Mobile-Scrolled.
- prompt variant on Article-Mobile-1 and Article-Mobile-2.

**Match:** ground, top rule, shadow, padding 12/20, gap 12, text styles and line breaks, the small CTA, and the 69px prompt bar.

**Differences:**

- DEFECTS: items 4, 5, 11 and 12 in the table above.
- SYSTEM-CHANGE: the CTA label is "Contact us"; the board says "Contact Us".

## TextField

**Instances:** 18 controls.

- Contact-Desktop and Contact-Mobile: 5 inputs, 2 selects and 1 textarea each.
- The newsletter email field on Article-Desktop-2 and Article-Mobile-2.

**Match:**

- Label 15/700/1.2, 8px above the control.
- 48px control, 16px padding, 1px #676d75 border, Inter 16/500.
- Identical text position.
- Placeholder #59606a.
- "(optional)" in 500 #31373e; no required marks on either.
- Focus: Jade border plus a 2px Emerald ring at 2px offset.
- Hint in type-small muted, 8px below the control.

**Differences:**

- DECIDED: the radius is 12px, where every board field uses 8px. Component-Library: "12px for buttons, chips and inputs".
- DEFECTS: items 13 and 14 in the table above.
- BOARD-INCONSISTENT: the chevron sits at top 18px on desktop and is centred on mobile; the system centres it.
- BOARD-INCONSISTENT: the newsletter inputs lack the field class, so they use weight 400, the browser's default placeholder (#757575) and no focus border. The system follows Contact.
- SYSTEM-CHANGE: the error state isn't on any board.

On desktop, the newsletter places the field and the Subscribe button in one row. That is page composition, not a missing component.
