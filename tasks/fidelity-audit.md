# Fidelity audit: design system V2 vs the approved FINAL V boards

**Date:** 10 October 2026.

**Question:** If the site is built from the "Inner Explorer Design System" (V2,
https://claude.ai/artifact/DVAYqoSPn9uNeodz9HXVox, version 7), where would it render differently
from the 39 approved FINAL V boards on the "Inner Explorer — Website" canvas?

**Verdict: not ready yet.**

- **Already right:** the system matches the boards on the things a reviewer notices first:
  colors, the type ramp, buttons, links, chips, headers and eyebrows. Where it differs from the
  boards in ways the canvas's 8 October decisions settled, it follows the decisions.
- **To fix:** 26 groups of defects (about 45 individual fixes), where the system would draw something the approved boards
  don't show and no decision supports. 10 of them are high visibility. All are mechanical fixes
  in `bundle.css`, `bundle.js`, `tokens.json` or the README.
- **For the owner:**
  - 4 decisions;
  - 20-odd board patterns with no component, which need a home before the page builds start.

The evidence is in [`tasks/fidelity-audit/`](fidelity-audit/): one summary (`.md`) and one row-level
file (`.json`) per audit group, plus the line-break study (`linebreaks.md`).

## How it was measured

- **Boards:** all 39 FINAL V boards rendered in Chromium 141 at their own size (1440 or 390),
  with the canvas runtime removed and the same font files loaded. That gave a census of computed
  styles for every visible element: 9,425 elements.
- **System:** each component rendered with the board's own copy and at the board's width
  (`compact` on 390 boards), then compared property by property.
- **Tolerance:** exact for color, font, size, weight, line-height, letter-spacing, radius and
  shadow; ±1px for distances.
- **Classification:** every difference was checked against the decision boards (Component
  Library, Component / Detail / Type and Icon Decisions, Remaining Drift, Card Options).
- **Agents:** six audit agents, one per component group, plus a type, color and layout census.
  The high-visibility claims were re-checked against the source CSS and the decision boards'
  own text.
- **Line breaks:** a separate study replayed every multi-line text block on the boards under
  each wrapping rule.

**Not measured:**

- **Photos and logos:** they don't load in board renders. Frames (size, ratio, corners) were
  measured, content wasn't.
- **Interaction:** hover, press and focus were measured from the boards' CSS and live probes.
  Animation wasn't.
- **Other widths:** only 1440 and 390, since the boards show nothing else.

## What already matches

- **Buttons:** all 126 on 36 boards: every label width, height, radius, color, shadow, and
  hover, press and focus state.
- **Arrow links and chips:** 47 arrow links and every chip, including the count pill's geometry.
- **Headers:**
  - 11 light desktop and 12 light mobile headers, pixel-identical to the system;
  - the logo at 32/28px.
- **Type:**
  - Eyebrows: 335 instances.
  - H1 and H2 styles, emphasis color, the breadcrumb, and every Prose type style.
  - The Home hero display type: rendered boxes identical.
  - Of 3,523 text elements, 1,794 match a system style exactly or at the same rendered size. The
    rest are stragglers a decision board already snapped, or chart and mock-up text the decisions
    keep as drawn.
- **Colors:** every text, fill and border color maps to a token, except a few page-pattern
  colors (see Decisions, 2).

## Defects to fix

The system differs from the approved boards, and no decision supports the difference.
"Boards" means the FINAL V boards.

### High visibility

| #   | Where                                                     | Boards                                                                                                             | System                                                                                                    | Fix                                                                                                                                                                                            |
| --- | --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **Line breaks, everywhere**                               | `text-wrap-style: pretty` on every element, headings included                                                      | `balance` on H1, H2, card, CTA and Prose headings; nothing on body text, which wraps greedily             | `text-wrap-style: pretty` on the root; remove `balance`. Re-rendered with this, all 20 page titles match line for line. Under `balance`, about 43% of multi-line headings change their breaks. |
| 2   | **Card photo frames**                                     | Fixed, cropped frames (Case Studies 398×216, 356×200; Newsroom 16:9)                                               | The frame grows with a tall photo (a 3:2 photo makes a 398px card 265px tall instead of 224)              | `.ie-card-media { overflow: hidden }`                                                                                                                                                          |
| 3   | **Feature icons "play" and "check-circle"**               | Phosphor fill play (Platform eyebrows ×4) and check-circle (Research "ESSA Tier 1" tag, Platform "Guided rollout") | Not in the icon set; both render as "stack"                                                               | Add both paths, copied from the boards, to the fill set                                                                                                                                        |
| 4   | **Research stat numbers**                                 | Inter Black 900, -0.04em (the "77" hero at -0.05em, 0.9 line-height)                                               | No Black face; renders Inter Bold                                                                         | Add `face: 'black'`. The decision reads: "Faces stay as they are … Inter elsewhere" (Component Library, stat sizes, 8 Oct).                                                                    |
| 5   | **Serif stat numbers**                                    | Proportional figures                                                                                               | `tabular-nums` on every stat: "60%" shrinks from 182 to 153px with a cramped % sign, and "16,000+" widens | Tabular figures only on the medium (study-card) face                                                                                                                                           |
| 6   | **Study-card stat claim** (27 cards: Platform, Research)  | 17px / 500 / 1.35, no tracking                                                                                     | 16px / 700, -0.01em                                                                                       | Medium-face label: 17/1.35/500, 0 tracking                                                                                                                                                     |
| 7   | **Testimonial key phrase** (Home ×6)                      | Bold in Emerald `#006e51`                                                                                          | Bold in charcoal                                                                                          | `.ie-testimonial-quote :is(b, strong) { color: var(--brand-emphasis) }`                                                                                                                        |
| 8   | **Home hero intro**                                       | 24/1.45, 500, -0.005em (19/1.5 mobile), charcoal                                                                   | No style; the nearest is `type-lead`, 20/1.5                                                              | Add `type-hero-lead` (+ `-mobile`). Detail Decisions: "24px rather than the 20px lead … Kept."                                                                                                 |
| 9   | **Full-width buttons with long labels** (Research mobile) | Wrap to two lines (350×66, 350×62)                                                                                 | Fixed 48px; the label spills 37px outside the button                                                      | Block buttons: `min-block-size` instead of a fixed height, and wrap                                                                                                                            |
| 10  | **Band spacing** (Case Studies ×4, Home, Newsroom)        | A band that continues the previous band's ground drops its top padding                                             | The README's "section-y top and bottom" gives 224px where the boards show 112                             | Add the rule to README › Layout                                                                                                                                                                |

### Medium visibility

| #   | Where                                            | Boards                                                                                                                            | System                                                                                                | Fix                                                                                                                               |
| --- | ------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| 11  | Footer (all 18 footers)                          | Links and headings at line-height normal, 30px link pitch; mobile heading to first link 4px; community block 32px under the blurb | Line-height 1.5, 34.5px pitch; 12px; 24px. The footer is 10px too tall on desktop and 38px on mobile. | Line-height 1.2 on links, headings and the legal row; the two mobile gaps. Proven in a scratch render: 386 vs 385 and 663 vs 663. |
| 12  | Closing CTA, mobile spacing                      | Title to lead 20 (12–20); lead to buttons 24 (24–32); inset padding 24                                                            | 24; 40; 32×24                                                                                         | Compact spacing to the board majority                                                                                             |
| 13  | Closing CTA with photo, desktop                  | Photo cell at least 520px, copy centred (Home, About); bleed photo 440px tall, copy centred, 80px gap (Why)                       | No minimum (Home renders 493px), copy top-aligned; 64px gap                                           | Photo minimum and centring; bleed height and gap                                                                                  |
| 14  | Closing CTA, mobile bleed (Why)                  | Photo below the copy, 36px gap                                                                                                    | Photo above, 32px                                                                                     | Order and gap                                                                                                                     |
| 15  | Closing CTA, inline lead (Case Studies, Pricing) | Up to 560px                                                                                                                       | 520px; Pricing's lead takes 3 lines                                                                   | Inline lead max 560                                                                                                               |
| 16  | Panels on green, mobile                          | 24px sides on 15 of 16                                                                                                            | 20px all round                                                                                        | `padding: var(--space-6)` compact on green                                                                                        |
| 17  | Section header to content, mobile                | 32 (majority; 24–40 seen)                                                                                                         | 48 everywhere                                                                                         | `space-12` (`space-8` compact)                                                                                                    |
| 18  | Accent bar under an H2 (Home video band)         | Present on Home desktop and mobile                                                                                                | README forbids it ("under the page title only")                                                       | Allow it in the README; add an `accentBar` option to SectionHeader                                                                |
| 19  | Article figures                                  | 32px above and below (24 mobile)                                                                                                  | 20px                                                                                                  | Prose figure margins                                                                                                              |
| 20  | Testimonial caption                              | 20px from the rule to the name (all 14)                                                                                           | 16px                                                                                                  | `space-5`                                                                                                                         |
| 21  | Bold stat numbers, xl                            | Line-height 1                                                                                                                     | 0.9                                                                                                   | Line-height 1                                                                                                                     |
| 22  | Sticky bar (Home mobile)                         | Square play link 48×48, 16px Jade play icon, bar 76px tall; prompt text at 1.2 with a 4px gap                                     | 40×48 (squeezed), 20px Emerald icon, 73px; 1.5, no gap                                                | `flex-shrink: 0` and the icon size, color, height and text spacing                                                                |
| 23  | Icon buttons, disabled (Research timeline)       | 40% opacity, no hover                                                                                                             | No disabled style                                                                                     | `:disabled` style                                                                                                                 |

### Low visibility

| #   | Where                                               | Boards              | System |
| --- | --------------------------------------------------- | ------------------- | ------ |
| 24  | Play icon in the filled round button (Platform ×14) | 18px                | 20px   |
| 25  | Hero lead on green (Research)                       | Off-white `#f0efeb` | White  |
| 26  | Other small items                                   |                     |        |

Row 26 covers:

- **Article captions:** the link in a caption is 700 on the boards, 500 in the system.
- **Case Studies cards:**
  - the overlay label's shadow: the boards use `.16` or none, the system `shadow-raised`;
  - the card footer: line-height 1.4 on the boards, 1.5 in the system.
- **Arrows and icons:**
  - the `arrow-left` arrowhead has 7-unit arms on the boards, 6 in the system;
  - the README's icon sizes should add 12 and 18.
- **Footer link hover:** `#1e473c` on the boards (their own CSS); the system uses `#006e51` with an underline.
- **Research's dark header:** a 14% white bottom rule and a 40% menu-button border on the boards, against the system's 24%.
- **Text fields:**
  - the select chevron is inset 14px on the boards, 16 in the system;
  - the textarea starts 122px tall on the boards, 120 in the system.

**Status of the fixes:** the defect agents proved every fix in a scratch render; none is applied
yet. They change only the system (`bundle.css`, `bundle.js`, `tokens.json`, README). No decision
board is contradicted.

## Decisions for the owner

1. **The no-orphans rule (asked for on 9 October).**
   - **How it works:** the last two words of every line of copy stay together.
   - **The cost:** on the approved boards it fixes the 53 blocks that end on one word. It also
     re-flows about 110 other blocks at exactly 1440/390: Chrome's `pretty` sees the glued pair
     as one short last word and rebalances the paragraph. Any way of gluing words does this.
   - **Choices:**
     - **Keep the rule:** paragraphs lose orphans; some approved line breaks change at those two
       widths. At every other width, line breaks differ from the boards anyway.
     - **Drop the rule:** the line breaks match the boards exactly, in Chrome only.
   - **Recommendation:** keep.
2. **When the approved boards disagree with each other.** About 70 measured values vary from
   board to board. Some examples:
   - the gap from a section header to its content (24–56);
   - lead widths (440–760);
   - H2 widths (no cap, 760 or 880);
   - padding on green panels (24–72);
   - the closing CTA's photo column (1:1, 680/520, 7:5);
   - 11 different stat-claim styles;
   - eyebrow-to-H1 gaps (20 or 24).

   **Choices:**
   - **Match each board:** the system documents the standard, page builds use the board's own
     value, and the system adds the few variants needed (a wide lead, an H2 width cap, a 7:5 split
     header, a centred header).
   - **Standardize:** use the majority value everywhere; minority boards shift by a few pixels.

   **Recommendation:** match each board, since fidelity to the approved boards is the goal. This
   also means changing the rebuild plan's rule "spacing within 4px snaps to the nearest token": that
   rule creates drift. Use the board value, through a provisional site token where needed.

3. **Off-palette colors on page patterns:**
   - `#ebe9e4` Pricing table rules;
   - `#dfe7e4`, `#8fd6a4` (Research);
   - `#e6f2ec` recommended plan card;
   - translucent whites at 40–70% on Home and Why.

   **Choices:** add them as tokens, or snap them to the nearest existing token.

   **Recommendation:** add them as page-pattern tokens, so the approved look holds.

4. **Neutral tag ink.** All 32 neutral tags on the boards are `#31373e`. The decision boards'
   samples, and the system, use `#282b2f`.

   **Recommendation:** follow the boards (`foreground-secondary`).

## Board patterns with no component

They repeat on 2+ boards, and neither the system nor the README's list of page-only patterns
covers them. A page build would have to invent them.

| Pattern                                                                                                                  | Boards                                                                        | Recommendation                                        |
| ------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------- | ----------------------------------------------------- |
| Horizontal card (photo, disc or icon beside the text)                                                                    | 9 (About team, Home program tiles, Contact, Why, Platform, Article, Newsroom) | System: a Card `layout`                               |
| Numbered steps or markers (drawn 5 ways)                                                                                 | Contact, Why, About, Research, Article                                        | System: one numbered-steps component                  |
| Eyebrow led by a feature icon                                                                                            | 4 Platform boards (11 instances)                                              | System: Eyebrow `icon`                                |
| Stat layouts: inline (number beside claim), comparison pair with a muted tone, strip with hairline dividers, tinted tile | About, Newsroom, Pricing, Why, Main, Research                                 | System: Stat `layout` and a StatStrip                 |
| Multi-column checklist                                                                                                   | Main, Pricing, Why                                                            | System: Checklist `columns`                           |
| Button leading icon (download, copy, link)                                                                               | Article ×3, Contact ×2                                                        | System: Button `iconStart`                            |
| ArrowLink with a down or back arrow                                                                                      | Research, Contact                                                             | System: ArrowLink `icon`                              |
| Toggle switch                                                                                                            | Pricing, Research                                                             | System                                                |
| Chart figure frame (title, chart, source)                                                                                | Home, Article, Why, Platform, Newsroom                                        | System: a Figure wrapper                              |
| Fact / definition list                                                                                                   | About, Research, Why                                                          | System                                                |
| Comparison table (now on 2 pages)                                                                                        | Pricing, Why                                                                  | System (it was page-only while Pricing alone had one) |
| Split page title (lead and buttons right)                                                                                | Case Studies, Newsroom                                                        | System: PageTitle `layout`                            |
| Buttons under the page-title lead                                                                                        | 10 boards                                                                     | System: PageTitle `actions`                           |
| Centred section header; 7:5 split header                                                                                 | About; Research                                                               | System: SectionHeader `align`, `ratio`                |
| Inset card media (photo inside the padding)                                                                              | Main, Home mobile                                                             | System: Card `media.inset`                            |
| Award badges on green (outlined pill)                                                                                    | Home desktop and mobile                                                       | System: a Tag tone                                    |
| Mobile chip row (horizontal scroll)                                                                                      | Newsroom, Case Studies                                                        | System: a ChipRow                                     |
| Name or logo marquee                                                                                                     | Home, Research (+ About wall)                                                 | Page builds                                           |
| Segmented control, "Show our work" switch, numbered eyebrow, editorial "house on sand" quote, superscript citations      | Research only                                                                 | Page builds                                           |
| Reading-progress bar, share rail, table of contents                                                                      | Article only                                                                  | Page builds (already listed)                          |
| On-photo carousel arrows, 64/96px video play disc                                                                        | Home only                                                                     | Page builds (already listed)                          |

## Known differences, kept on purpose

**Decided on the canvas (8 October):**

- Research and Pricing titles snap to 44/28.
- The mint testimonial cards become Raised.
- Research's mint strips become Emerald panels.
- Inputs use 12px corners.
- Card types are Raised and Floating only.
- One-off shadows retire.
- One shared style each for buttons, links, chips, headers and footers.
- Research's own footer, button and link drift follows the shared style.

**Deliberate system changes:**

- the tag ground on green (12% white, for contrast);
- the pressed chip's count pill;
- Spring for accents on green;
- "Contact us";
- the header's current-page state and skip link;
- the open mobile menu;
- the form error state;
- the 1280/768 switch points.

## Next steps

1. Owner answers the 4 decisions and confirms where the patterns with no component go.
2. Apply the defect fixes and the decisions to the system, re-run this audit, and republish.
   The audit scripts live in the session scratchpad; rebuild them from this method if needed.
3. Update `tasks/rebuild-plan.md`: drop "snap within 4px", and add "re-run the fidelity audit
   per page PR".
