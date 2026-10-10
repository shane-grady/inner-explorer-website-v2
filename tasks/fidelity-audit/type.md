# Type group: Eyebrow, AccentBar, PageTitle, SectionHeader, Breadcrumb, Prose, Home hero type

**Method.** Every H1 and H2 on the 39 FINAL V boards was read from the census. Each one was then measured again in Chromium with sub-pixel rects, and its line breaks were read from Range rects. The system components were rendered with each board's own copy, at the board's container width (`compact` on the 390px boards):

- 21 PageTitles
- 73 SectionHeaders
- the 4 Article bodies, in Prose with the README class mapping and `.ie-keep` added
- the Home hero type styles

Variant renders (`text-wrap: pretty`, `.ie-keep` inline) show what causes each line-break difference. Scripts and raw data are in `work/type/`.

**Counts:** 7 DEFECT, 8 MISSING, 14 BOARD-INCONSISTENT, 6 DECIDED, 4 SYSTEM-CHANGE, 1 NOT-ON-BOARDS, 7 MATCH (47 rows in `type.json`).

## DEFECT list (most visible first)

| #   | Component · property                         | Boards                                                                                                                                                                                                                                                                         | System                                                                                                                                                       | Fix                                                                                                                                              |
| --- | -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | PageTitle · H1 line breaks (text-wrap)       | `pretty` (global `body *{text-wrap-style:pretty}`). Article-Mobile-1 and First-Screen: "How Inner / Explorer Supports / Every Tier / of MTSS". Case-Studies-Mobile: "Case Studies on / Inner Explorer / Program". Newsroom-Mobile: "Insights and News / from / Inner Explorer" | `balance`. "How Inner / Explorer / Supports Every / Tier of MTSS", "Case Studies / on Inner / Explorer Program", "Insights and / News from / Inner Explorer" | `.ie-page-title-h1 { text-wrap: pretty; }`. Re-rendered with this, all 20 page-title boards match line for line.                                 |
| 2   | Prose · figure margins                       | 32 above and 32 below (Article-Desktop-1); 24 and 24 (Article-Mobile-1)                                                                                                                                                                                                        | 20 (`.ie-prose > * + *`)                                                                                                                                     | `.ie-prose figure{margin-block:var(--space-8)}` and `.ie-prose-compact figure{margin-block:var(--space-6)}`                                      |
| 3   | Prose · h2/h3 line breaks                    | `pretty`. 12 of 18 article headings break differently, with the same line counts                                                                                                                                                                                               | `balance`                                                                                                                                                    | `.ie-prose :is(h2,h3){text-wrap:pretty}`. This fixes 8 of the 12; the other 4 also move because of `.ie-keep` (SYSTEM-CHANGE 4).                 |
| 4   | SectionHeader · header→content gap on mobile | 32 ×9, 28 ×7, 40 ×6 (Why), 24 ×2, 36 ×1. No mobile board uses 48.                                                                                                                                                                                                              | 48 (`space-12`, with no compact value)                                                                                                                       | In both READMEs: "space-12 (space-8 compact)". 32 is the mobile majority.                                                                        |
| 5   | PageTitle · lead colour on green             | rgb(240,239,235) off-white (Research-Experiment-Desktop and -Mobile-1)                                                                                                                                                                                                         | rgb(255,255,255)                                                                                                                                             | `.ie-on-brand .ie-page-title-lead{color:var(--on-brand-muted)}`. Type-Icon-Decisions: "White and off-white text on dark panels keeps its color." |
| 6   | Prose · paragraph text-wrap                  | `pretty` on every p                                                                                                                                                                                                                                                            | not set. 2 of 42 paragraphs break differently; they match only with pretty and inline keep together.                                                         | `.ie-prose :is(p,li){text-wrap:pretty}`                                                                                                          |
| 7   | Prose · figcaption link                      | weight 700, underline offset auto (Article-Desktop-1 #121, Article-Mobile-1 #104)                                                                                                                                                                                              | weight 500 (inherited), offset 3px                                                                                                                           | `.ie-prose figcaption a{font-weight:700}`                                                                                                        |

## MISSING

- **Eyebrow with a leading feature icon.** 11 instances on Platform-Desktop-1/-2 and Platform-Mobile-1/-2: inline-flex, 8px gap, Phosphor fill icon in rgb(2,164,81), 20px (24px on the Desktop-2 panels, 18px on mobile).
- **Numbered eyebrow "01 —— Label".** Research-Experiment-Desktop ×3 (10px gap), Research-Experiment-Mobile-1 ×1 and Mobile-2 ×2 (8px gap). The number uses tabular numerals; the rule is 24×1px in currentColor at 50% opacity.
- **Accent bar under an H2.** Home video band on Main and Home-Mobile: 16px below the H2, as wide as the H2 column (658 / 350). SectionHeader has no such option, and the README says "once per page, under the page title only".
- **Split PageTitle.** Title on the left; lead and buttons on the right, aligned to the bottom. On Case-Studies-Desktop (lead at x 724, 520 wide) and Newsroom-Desktop (lead at x 936, max-width 420).
- **PageTitle actions.** The gap from lead to buttons varies by board: About 40/28, Platform 32/24, Why 36/36, Research 40/28, Case Studies 24/24 (desktop/mobile). PageTitle has no slot or spacing for buttons.
- **7fr : 5fr split SectionHeader.** Research-Experiment-Desktop #94 and Research-Studies-C-Timeline-065o #4. The intro sits at x 850 on the boards; the system's 1:1 split puts it at x 756.
- **Centred SectionHeader.** About-Desktop #46 and #172 (H2 max-width 820, intro 760) and About-Mobile-1 #38.
- **Home hero text-shadow.** `0 2px 24px rgba(0,20,15,.35)` on Main and Home-Mobile. There is no token for it, so a page would need a raw value (lint:drift).

## Per component

**Eyebrow.** The eyebrow style appears on 37 boards: 335 text elements, including 15 above H1s and about 52 above H2s.

- MATCH: 14/15.68/700/+1.12px, uppercase. rgb(40,43,47) on light grounds (309 elements) and white on green (26).
- DECIDED (Component-Library: "Charcoal on light grounds, white on green"):
  - Research desktop eyebrows at 13px/1.3 in green-700 (8 instances)
  - About's green eyebrow (2)
- BOARD-INCONSISTENT: "The AI moment" is mint on Forest (2 instances); the other 26 eyebrows on green are white. The system follows the majority. Detail-Decisions mentions "two small green-300 labels on Research moved to mint".
- MISSING: the icon and numbered variants (listed above).

**AccentBar.**

- MATCH on 24 bars: stripe colours, 4px height, square ends and equal thirds.
- BOARD-INCONSISTENT on width. Bars are as wide as the longest line on 8 boards, where the H1 uses explicit breaks, and as wide as the box or column on 11. The exceptions:
  - Article-Desktop-1 uses a fixed 680px bar, while the H1's longest line is 861.6.
  - The Research hero puts the bar under the word "biology" only (225 / 138 wide).

  The system matches 17 of the 20 page-title boards. The README's advice to break titles with `\n` would shorten the bars on Case Studies, Newsroom, Platform and Why desktop.

- BOARD-INCONSISTENT on the gap from H1 to bar: 8px ×11, 12px ×3, 16px ×4 (Home hero 16/12). The system uses 8, the majority.
- MISSING: the bar under the Home video-band H2 (listed above).

**PageTitle.** 20 boards plus the Home hero.

- MATCH: H1 type, emphasis colour and weight, breadcrumb gap (16), lead type, and lead line counts on 18 of 20 boards.
- DEFECT: #1 (H1 line breaks) and #5 (lead colour on green).
- DECIDED: the Research H1 at 68px and the Research lead at 26/1.35.
- SYSTEM-CHANGE 3: emphasis on green is Spring, not the board's green-300.
- BOARD-INCONSISTENT:
  - Eyebrow to H1, desktop: 24 ×4 and 20 ×3. The system's 20 is the minority.
  - Eyebrow to H1, mobile: 16, 20 and 24, two boards each.
  - Bar to lead: 32/28/24 on desktop and 20/24/28 on mobile. The system uses 32 and 20.
  - Lead max-width: 520 ×5, 680 on Article and 640 on Pricing. The system's 520 adds a line on Article and on Pricing.
- MISSING: the split hero and the actions slot (listed above).

**SectionHeader.** 73 instances: 38 desktop and 35 mobile, closing-CTA titles excluded.

- MATCH:
  - H2 type on 64 instances
  - eyebrow to H2 16px on 43 of 52
  - lead-style intro on 29
  - Home-Desktop-2's splits match to the pixel
- DEFECT: #4 (header to content gap on mobile).
- DECIDED:
  - Research titles at 68/56/52/36, Pricing's at 48 and 32/26, and About's at 40. All go to 44/32.
  - Off-lead intros on Research, Pricing and About.
- SYSTEM-CHANGE 4: keep spans move breaks in 2 Why headings.
- BOARD-INCONSISTENT:
  - H2 text-wrap: pretty ×37, balance ×28, none ×8. With the system's balance, 11 "pretty" headings break differently; switching to pretty would break 11 "balance" headings instead.
  - H2 max-width: 880 on Platform and 760 on Why; the system has none. Platform-Desktop-1 #192 and Why-Desktop-2 #173 lose a line.
  - Intro max-width runs from 440 to 760; the system uses 520. Five intros change line count.
  - H2 to intro on mobile: 16 ×10, 20 ×2, 24 ×4. The system's 20 is the minority.
  - Intro to aside: ArrowLink 16 (desktop) and 8 (mobile), Button 24/28/32, footnote 12/8. The system uses 24 for all.
  - Split column gap: 72 ×4, 80 ×3, 64 ×1, and Pricing aligns its intro to the end.
  - Header to content on desktop: 48 ×13, 56 ×10 (Why). The system's 48 is the plurality.
- MISSING: the 7:5 split and the centred layout (listed above).

**Breadcrumb.** 3 Article boards.

- MATCH: style, separator, item positions (0/50/64), 16px to the H1, and no underline. Detail-Decisions: "0.06em … muted ink … Kept."
- NOT-ON-BOARDS: the current-page item. On the boards both items are links.
- There is no case-study detail board in FINAL V.

**Prose.** 4 Article boards: 42 paragraphs, 18 headings, 2 pull quotes, 2 figures.

- MATCH: every other gap and style. Pull-quote heights are identical (128.38 / 142.78), and all line counts are identical.
- DEFECT: #2, #3, #6 and #7.
- SYSTEM-CHANGE 4: keep moves 4 heading breaks.
- SYSTEM-CHANGE 6: lists and tables appear on no board.

**Home hero display type.**

- MATCH: `type-hero-display` and `type-hero-display-serif` reproduce Main and Home-Mobile exactly (boxes 590×216 and 325×118).
- MISSING: the text-shadow (listed above).
