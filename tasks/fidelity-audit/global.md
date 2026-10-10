# Global audit: type ramp, color, layout, coverage

Group `global`, across all 39 FINAL V boards (census JSON, Chromium 141). Scripts and raw tables are in
`AUDIT/work/global/` (`type_roles.json`, `colors.json`, `color_census.txt`, `bands.txt`, `cards.txt`, `radius.txt`).
88 rows in `global.json`: 5 DEFECT, 19 MISSING, 19 BOARD-INCONSISTENT, 39 DECIDED, 2 SYSTEM-CHANGE, 4 MATCH.
Four type-ramp MISSING rows (numbered markers, name marquee, share rail, award list) describe the same patterns as
coverage rows, so 15 distinct MISSING patterns.

## DEFECT (most visible first)

1. **Stat: Inter Black face missing** (high). Research numerals are Inter 900: 44/1/-0.04em ×5 (Research-Experiment-Desktop),
   40/1/-0.04em ×5 (Mobile-1), hero "77" 72/0.9/-0.05em and 56/0.9/-0.05em. The system only has the bold (700), medium (500) and serif faces.
   Component-Decisions 1: "Faces, weights and spacing stay exactly as they were", and it lists "Inter Black … on Research" among the faces.
   Fix: in bundle.css add `.ie-stat-black .ie-stat-value { font-family: var(--font-sans); font-weight: 900; letter-spacing: -0.04em; }`, and add `'black'` to Stat `face` in index.d.ts.
2. **Home hero intro has no style** (high). The boards set it at Inter 500 24/1.45, -0.005em (Main) and 19/1.5 (Home-Mobile), in charcoal. The only lead style is
   type-lead 20/1.5 (18 on mobile) in foreground-secondary. Detail-Decisions: "Home hero intro: 24px rather than the 20px lead … Kept."
   Fix: add `type-hero-lead` (24px / 1.45 / 500 / -0.005em) and `-mobile` (19px / 1.5) to tokens.json, and add them to the README.
3. **Bands on the same ground stack their padding** (high). Boards drop padding-top to 0 when a band continues the ground of the band before it.
   This happens on Case-Studies-Desktop ×2, Case-Studies-Mobile ×2, Home-Desktop-2's CTA and Home-Mobile-2 ×2. Newsroom sets it to 24 after a 48px hero bottom.
   README only says "section-y top and bottom", which gives a 224px gap where the boards have 112px. Fix: add that rule to README Layout.
4. **Footer link line-height** (medium). All 18 footers set links at 15/500/normal: an 18px line with a 30px pitch (185 links).
   The system uses 15/1.5: a 22.5px line with a 34.5px pitch, measured in census/ds/SiteFooter. Each desktop column comes out 18px taller.
   Fix: `.ie-footer-nav a { font: 500 15px/1.2 … }`. The compact rows already match at 32px.
5. **Footer heading line-height** (medium). Headings are 15/700/normal on 76 headings. Fix: `.ie-footer-heading { font: 700 15px/1.2 … }`.

## type-ramp

- **Instances:** 3,523 visible text elements (279 sr-only excluded) in 225 clusters.
- **MATCH (1,794):** 1,414 match a type-\* style or the component's own control text exactly. The largest groups are eyebrow 354, body 218,
  label 116, card-title-md 75 (and 55 at the mobile size) and ArrowLink 70. Another 380 render at the same size: line-height normal inside
  fixed-height controls (buttons, chips, nav, tags), inline bold runs, and card-footer CTAs within 1px.
- **DECIDED (1,174):** stragglers that a decision board snapped to the ramp.
  - Labels at 12–14px with line-height normal, 1.45, 1.5 or 1.55 (Detail-Decisions 2).
  - Card titles with no tracking or off-step (Type-Icon 2).
  - Body at 15–22px off 17/1.6 (Type-Icon 1).
  - Research and Pricing titles at 68, 52, 48, 38 and 36px (Remaining-Drift).
  - Research chips at 15px (one chip, 14px).
  - Links at 14, 15 or 19px.
  - Pricing table text at 11–17px.
  - Charts, the practice player and the dashboard mock-ups keep their own type.
- **BOARD-INCONSISTENT:**
  - Off-ramp display statements the canvas doesn't track (high): Why 68/1.08 (28 on mobile), Why 40, 30 and 26, Home 30, 26 and 22, and About's H2 at 40.
  - Stat labels drawn seven ways; the system uses card-title-md.
  - Stat spacing variants: bold at -0.02em on About and Why, line-height 1.05 on Home's strip, Why's 112px at line-height 1.0, serif at 0em on Home's evidence band.
  - Footer legal at line-height normal on desktop but 1.5 on mobile.
  - Research footer headings in eyebrow style.
  - 19 eyebrows at 13px or line-height 1.3.
- **MISSING:**
  - Numbered markers.
  - Research's "house on sand" quote (Caslon Text 22/1.34, roman); type-pull-quote is the 28px italic one.
  - Name marquees.
  - Article share buttons.
  - Home award items.
  - Research superscripts at 8.7–10.5px.
  - The video label.

## color

- **MATCH:** Every text, fill and border color equals a token except the ones listed under BOARD-INCONSISTENT and DECIDED below.
  - Shadows: raised 103, primary 61, light 25, floating 22 and sticky 3 match exactly.
  - Green roles agree with the usage notes: Emerald is the only green in small text, Jade fills buttons, discs and data, and Vibrant is used only for numerals of 40px and up.
- **SYSTEM-CHANGE:** green-300 numeral signs on Forest (change 3) and the 16% tag fill (change 1).
- **DECIDED:**
  - Research "Strongest evidence" labels at #8fd6a4; the decision says mint, #bffaa2.
  - #dfe7e4 text on Pricing green; only white or off-white is allowed.
  - Home's mint testimonial figures become Raised cards.
  - One-off shadows (Why soft-3D, Platform deep drop, Home 10%). Detail-Decisions says they "retire with … the card rule", but Remaining-Drift says "Kept for now". The owner should confirm.
- **BOARD-INCONSISTENT:**
  - The testimonial key phrase is Emerald on Home but charcoal in the decision sample, which the system follows (high).
  - Why's CTA lead is off-white; the other eight are white.
  - Platform tab labels are UA-default black.
  - Why's counters are muted eyebrows.
  - Off-palette page-pattern colors: #ebe9e4 Pricing rules ×94, a $ chip, a switch track, the #e6f2ec recommended plan card, a Research dot.
  - Translucent white on green: 14–70% hairlines, and 6–88% fills against the 24% and 12% tokens.
  - The Spring usage note says "evidence tags", but boards also use it for step discs, progress, other tags and tiles.
  - Research quote marks in Jade.
  - Overlay-label shadow is 0.16 on Case Studies and none on Newsroom; the system uses 0.05.
- **MISSING:** shadows on page-built controls and media (video, carousel, switch knobs, segmented control, tabs, share buttons). README allows "No others".

## layout

- **MATCH:**
  - Section padding 112/120 on 37 desktop bands, and 64/20 on 42 mobile bands.
  - Heroes 72/96 on six pages and 40/48 on five.
  - Strips 64/40.
  - Header 80/64 with 120/20 sides.
  - Footer padding 64/120/40 desktop, 40/20/32 mobile.
  - Container 1200/350.
  - Emerald CTA padding 72, and 32×24 on mobile.
- **DEFECT:** same-ground bands (above).
- **DECIDED:**
  - Section stragglers at 96 or 120 (Research, About, Pricing).
  - Hero bottoms of 48 and 32 (Newsroom) and 56 (Pricing-Mobile).
  - Card padding: only 2 Raised and 13 Tint mobile cards use the decided 20px. Others use 24 ×13, 16/20 ×11, 24/20 ×8, and 20/32/40/48 on desktop.
  - Card gaps of 16 (10 grids), 12 (4) and 20 (1) against the decided 8 (16 grids).
  - Radius stragglers: inputs at 8px against 12, Platform tabs at 8, Research containers at 10, 12, 14 or 6px.
- **BOARD-INCONSISTENT:**
  - Splits: 20 follow "equal or 7:5, gap 64–72"; 15 use gaps of 80, 96 or 48, or other ratios.
  - Lead measure: 520 on 12 leads; the other 19 use nine widths from 420 to 760.
  - The Home hero intro band at 64/80 (32/48 on mobile).
  - The Research footer's bottom padding of 32.

## coverage (MISSING, patterns on 2+ boards with no component and not on the README page-pattern list)

- High:
  - Numbered steps and markers (Contact, Why, About, Research).
  - Comparison table: Pricing, plus Why's table, a second page.
- Medium:
  - Toggle switch (Pricing, Research).
  - Fact or definition list (About, Research, Why).
  - Name and logo marquees (Home, Research, plus the About wall).
  - Chart figure frame with title and source (Home, Article, Why, Platform, Newsroom).
  - Tinted stat tile (Newsroom, Research). README allows it, but Stat has no variant.
- Low:
  - In-page section nav (Article TOC, plus Research).
  - The recommended plan card.
  - The Article share rail.
  - Home's award list.
