# Content group: Testimonial, Stat, Checklist, ClosingCta

Method: every instance located in the census JSON (classes, text, style signatures), board values read from `sa` and computed styles, gaps measured from rects. Each system component rendered with the board's own copy at the board's container width (`compact` for 390 boards) via `work/content/{testimonial,stat,check,cta}.html` → `*-r.json`. Tabular-figure effects measured in `tnum2.html` (screenshot `tnum2-crop.png`).

Counts (53 rows): DEFECT 13 · BOARD-INCONSISTENT 16 · DECIDED 10 · MISSING 7 · SYSTEM-CHANGE 2 · NOT-ON-BOARDS 1 · MATCH 4.

## DEFECTs (most visible first)

| #   | Component · part                                    | Board                                                                                          | System                                                                       | Fix (components/bundle.css)                                                                                                             | Vis.   |
| --- | --------------------------------------------------- | ---------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| 1   | Stat · claim under medium-face (study-card) numbers | 17/500/1.35, ls 0 (27 cards: Platform-D2/M2, Research-D/M1, Research-Studies-C)                | card-title-sm 16/700/1.35, −0.01em                                           | `.ie-stat-medium .ie-stat-label{font-size:17px;line-height:1.35;font-weight:500;letter-spacing:0}`                                      | high   |
| 2   | Stat · serif value figures                          | proportional on every serif number (Home-D2/M2, Article-D1/M1, Newsroom-D/M)                   | `tabular-nums` (LCC "60%" 182→153px, % glyph collapses; "16,000+" 211→239px) | move `tabular-nums` from `.ie-stat-value` to `.ie-stat-medium .ie-stat-value`                                                           | high   |
| 3   | Testimonial · bold key phrase                       | `<b>` in #006e51 (6 Home quotes)                                                               | inherits #282b2f                                                             | `.ie-testimonial-quote :is(b,strong){color:var(--brand-emphasis)}`                                                                      | high   |
| 4   | ClosingCta · bleed photo                            | img 440px tall, copy centered (Why-D2)                                                         | photo = copy height (330px), copy top                                        | `.ie-cta-bleed{align-items:center}` `.ie-cta-bleed:not(.ie-cta-compact) .ie-cta-photo{block-size:440px}`                                | high   |
| 5   | Testimonial · caption padding-top                   | 20px on all 14 quotes, 8 boards                                                                | 16px (space-4)                                                               | `.ie-testimonial-caption{padding-block-start:var(--space-5)}`                                                                           | medium |
| 6   | Stat · bold xl line-height                          | 1 (Why-D1 112px, Why-M2 72px)                                                                  | 0.9 (box 11.2 / 7.2px shorter)                                               | `.ie-stat-bold .ie-stat-value,.ie-stat-medium .ie-stat-value{line-height:1}`                                                            | medium |
| 7   | ClosingCta · compact title→lead                     | 20 (CS-M, Pricing-M, Why-M4), 16 (About-M3, Home-M2, Newsroom-M), 12 (Platform-M2, Article-M2) | 24 (no mobile board)                                                         | `.ie-cta-compact .ie-cta-lead{margin-block-start:var(--space-5)}`                                                                       | medium |
| 8   | ClosingCta · compact lead→buttons                   | 24 on 5 boards, 28 on 2, 32 on 2                                                               | 40 (no mobile board)                                                         | `.ie-cta-compact .ie-cta-actions{margin-block-start:var(--space-6)}`                                                                    | medium |
| 9   | ClosingCta · desktop photo min-height               | photo cell min-height 520, copy centered (Home-D2, About-D)                                    | none; Home renders 493px tall                                                | `.ie-cta-with-photo:not(.ie-cta-compact) .ie-cta-photo{min-block-size:520px}` `.ie-cta-with-photo .ie-cta-copy{justify-content:center}` | medium |
| 10  | ClosingCta · inline lead cap                        | 560px (Case-Studies-D, Pricing-D)                                                              | 520px: Pricing lead 3 lines, panel 370 vs 340                                | `.ie-cta-inline .ie-cta-lead{max-inline-size:calc(var(--measure) + var(--space-10))}`                                                   | medium |
| 11  | ClosingCta · bleed column gap                       | 80px (Why-D2)                                                                                  | 64px                                                                         | `.ie-cta-bleed{column-gap:80px}` (no token; README split rule says 64–72)                                                               | medium |
| 12  | ClosingCta · compact bleed photo                    | below copy, gap 36 (Why-M4)                                                                    | above (order −1), gap 32                                                     | `.ie-cta-compact.ie-cta-bleed .ie-cta-photo{order:0}` + `row-gap:36px`                                                                  | medium |
| 13  | ClosingCta · compact inset padding                  | 24 all sides (Article-M2)                                                                      | 32×24                                                                        | `.ie-cta-compact.ie-cta-inset .ie-cta-copy{padding:var(--space-6)}`                                                                     | low    |

## MISSING

- **Stat face "black"**: Inter 900, −0.04/−0.05em on Research-D/M1 ('77' and district tiles). Component-Decisions 1 kept "Inter Black up to 128px on Research" ("faces, weights and spacing stay exactly as they were").
- **Stat inline layout** (value beside claim): About-D (center, gap 24), Newsroom-D/M (baseline, gap 12), Pricing-D add-ons (baseline, gap 6).
- **Stat comparison pair / muted tone**: Why-D1/M2 "2 vs 25", the second number in #59606a, with a 48/32px rule between.
- **Stat strip with dividers**: Main (border-left 1px #dfddd6 + pl 32), Why-D1/M2 (top hairline rgba(255,255,255,.24) + pt 16). Only a README sentence covers it.
- **Checklist columns**: Main (2 cols, gap 24), Pricing-D (2 cols, gap 32), Why-D2 (3 cols, left rule, pl 40).
- **Checklist ruled variant with source link**: Research-D/M1 only, so one page (low).
- **ClosingCta ArrowLink secondary and ruled facts row**: Article-D2/M2.

## Per component

**Testimonial**: 14 quotes on 8 boards (Home-D2 ×3, Home-M2 ×3, Why-D2 ×2, Why-M4 ×2, Why-D1, Why-M2, Platform-D2, Platform-M2).

- Matches: holder, padding, gap, mark, quote type and caption gap/rule.
- DEFECT: #3, #5.
- DECIDED:
  - name 16/1.35/−0.01em ("Small 16/1.35 for … names");
  - place 14/1.4 (labels decision);
  - Home mint holder becomes Raised;
  - Home marks (44×33 and #006e51) become 32×24 icon-accent;
  - Home row gaps of 16 and 12 become 8.

**Stat**: 15 groups across 22 boards; inventory in content.json.

- Matches: faces, ramp, tones and the light-ground sign.
- DEFECT: #1, #2, #6.
- BOARD-INCONSISTENT:
  - claim style: 11 variants, none matched by the system;
  - bold figures: proportional on 26 values, tabular on 8; the system follows the minority;
  - bold ls: −0.03em on 22, −0.02em on 12;
  - serif ls: normal on 8, −0.01em on 6; the system follows the minority;
  - value lh: 1.05 on Home's strip, 0.9 on Newsroom;
  - value→claim gap: 4–16px;
  - source color on green.
- DECIDED: source 14/1.4; mobile twin per step (Article 40, Newsroom 56, Research 44, Pricing-M 32 are off-pair).
- SYSTEM-CHANGE: Why "%" in #bffaa2.
- Excluded: numbered steps 01–03, chart labels, Pricing table prices, the Home "342" mock-up.

**Checklist**: outline lists on Article-D1/M1, Why-D1/M1, Main and Home-Mobile (2 lists each), Why-D2/M3, Research-D/M1 (ruled), Pricing-D/M (discs on Emerald), Contact-Success (done step).

- Matches: Article and Why are exact (rows 54/54/54 and 109/136/109).
- BOARD-INCONSISTENT: item text: 17/1.6 #424850 on 12 items; 16/1.45 #31373e on 24 (Home); 16/1.4/700 on 6; 15/1.45 white on 22.
- DECIDED: Pricing's white discs and Contact's 28px #00874d done check become 22px outline ("every checklist, including the done step").

**ClosingCta**: 18 instances.

- Desktop: About-D, Home-D2, Platform-D2, Case-Studies-D, Pricing-D, Research-D2, Newsroom-D, Article-D2, Why-D2.
- Mobile: the 9 mobile twins.
- Matches: color, radius, title and emphasis type, buttons, 72 padding (5 boards), inline gap 48, inset 40 and bleed padding.
- DEFECT: #4 and #7–#13.
- BOARD-INCONSISTENT:
  - photo column ratio: 1:1 on About and Why, 680/520 on Home, 7:5 on Platform. The system's equal split wraps About's buttons to 2 rows (671 vs 611px) and Home's lead to 3 lines;
  - desktop title→lead 24/16/20;
  - desktop lead→buttons 40/36/32 (the system follows About only);
  - eyebrow→title 16/12/20;
  - lead cap 520/460/440/420/none;
  - Why lead #f0efeb;
  - Article lead weight 400;
  - inline alignment and gap (Research and Newsroom center; Newsroom gap 64);
  - Home-M2 photo 240.
- DECIDED: padding 72 / 32×24 (Platform 80/64, Newsroom 64/72, mobile 28/24, 28/20, 40/24); Home white card Floating becomes Raised.
- SYSTEM-CHANGE: "Contact Us" and "Talk to our team" become "Contact us".
- NOT-ON-BOARDS: white card without photo; Stats as children.
- Out of scope, noted only: Why's mid-page CTA banners (tint panel, Why-D2/M3; Emerald with 12px radius on Why-D2, Why-M4) are Panel compositions, not closing CTAs.
