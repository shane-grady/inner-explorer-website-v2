# Cards group: Card, Panel, Tag, FeatureIcon, Icon

47 rows in `cards.json`: 7 DEFECT · 13 DECIDED · 11 BOARD-INCONSISTENT · 7 MISSING · 1 SYSTEM-CHANGE · 3 NOT-ON-BOARDS · 5 MATCH.

How I measured: I took census records for every white, tint, Emerald and Forest box with radius 8–12. I dumped SVG shapes from all 39 boards with Playwright (`work/cards/svgs.json`) and compared them with `FILL` and `OUTLINE` path for path. I extracted each board's `<style>` to `work/cards/css/`. I rendered the system components with the boards' copy at the boards' widths, desktop and `compact` (`work/cards/sys.html` → `sys.json`), and probed media with real image shapes (`work/cards/media.html`).

## DEFECTs, most visible first

1. **Card media aspect ratio (high).** `.ie-card-media` grows to the photo's own ratio when the photo is taller than the frame. At 398px wide, a 3:2 photo renders 265px tall instead of 224 and a square photo 398. `ratio: '398 / 216'` still gives 265. The boards always crop to a fixed frame: Case Studies desktop 398×216, mobile 356×200; Newsroom 16:9. **Fix:** in `bundle.css`, add `overflow: hidden` to `.ie-card-media` (or `min-block-size: 0`). I verified it: every shape then renders at 224, or 216 with the ratio prop.
2. **FeatureIcon is missing two glyphs (high).** Phosphor fill `play` is used in Platform eyebrows on D1, D2, M1 and M2 (20px desktop, 18px mobile). `check-circle` is used in Research's "ESSA Tier 1 · Strong evidence" tag (Desktop and Mobile-1) and in Platform's "Guided rollout" eyebrow and dashboard mock. Neither is in `FILL`, so FeatureIcon renders `stack` in their place. **Fix:** add both paths, copied from the boards, to `FILL` in `bundle.js` and `bundle.src.js`. The paths are in `cards.json` and `work/cards/missing-fill.json`.
3. **Compact Emerald and Forest Panel padding (medium).** The system pads 20px on every side. On 15 of the 16 mobile green panels the inline padding is 24px, and the block padding is 24 (×6), 28 (×9) or 32 (×1). Mobile tint panels do use 20. **Fix:** `.ie-panel-compact:is(.ie-panel-emerald, .ie-panel-forest) { padding: var(--space-6); }`
4. **Card label shadow (low).** The system uses `shadow-raised` (alpha .05), which matches no board. Case Studies uses 0 1px 2px rgba(40,43,47,.16) and Newsroom uses no shadow. **Fix:** `box-shadow: none`, or the .16 value if Case Studies is the reference.
5. **Card footer line-height (low).** The system uses 1.5 (21px; the footer row is 38px). Case Studies uses 1.4 (19.6px; 37px). **Fix:** `.ie-card-footer { font: 700 14px/1.4 var(--font-sans); }`
6. **Icon `arrow-left` head (low).** The only board use is Contact's "Back to the form", whose arrowhead arms are 7 units; the system's are 6. **Fix:** `'arrow-left': ['M19 12H5', 'M12 19l-7-7 7-7']`.
7. **Icon README sizes (low).** The README allows only 16, 20 or 24px. The boards draw 11–12px citation and external-link arrows on four Research boards (×35) and 18px play glyphs in round buttons (×14). The component itself renders any size. **Fix:** add 12 and 18px to the Specs line.

## Card

**Instances:** 91 Raised and 22 Floating cards on 25 boards. Plus white cards with no shadow (Pricing, Research), flat white cards (Platform-Desktop-2 and Mobile-2), tint team cards (About) and one-off shadows (About facts box).

**Matches:** Raised and Floating fill, border and shadows; 8px radius; the title ramp wherever the boards use it; eyebrow, meta and body styles; the 48px disc; footer colour, weight, arrow and rule; label box (28px, 16/16 inset); and the boards' `.ie-card:hover` values.

**DECIDED** (Card-Options, Type-Icon-Decisions, Detail-Decisions):

- Padding: the boards use 16–72px; decided 24, or 20 on mobile.
- Grid gap: the boards use 12/16/20; decided 8.
- Card types: shells other than Raised and Floating.
- 12px radius on Research cards.
- Titles off the ramp: Research 28/1.1, 24 and 22; Article and Home 20 with normal letter-spacing or line-height; a 20px title on mobile.
- Off-scale body and role text: 14/1.5, 15/1.55, 19/1.5 and 15/1.45.

**BOARD-INCONSISTENT:**

- Label height and padding: 28/12 ×2, 32/12, 28/8.
- Footer anatomy: four different treatments; Card-Options' sample cards use an ArrowLink.
- Gap between parts: 8 (most common, ~32 cards), 12 (~19), 4 (~14), 16 (~5). The system and the Card-Options samples use 12.
- Rule under the media: Newsroom only.
- Hover: the Research pattern equals the system's, but the boards also apply it to non-linked cards. Case Studies lifts 1px with a .07 shadow, zooms the image and presses to .98; Research's nav cards lift 3px with a green border.

**MISSING:**

- Inset, rounded media inside the padding (Main, Home-Mobile).
- Horizontal cards, with an icon or photo beside the text: About team, Home program tiles, Contact support, Why funding, Platform-Mobile-2, the Article resource card and Newsroom-Mobile rows. These are on 9 boards.

**NOT-ON-BOARDS:** the linked card's focus ring.

## Panel

**Instances:**

- Tint ×28: Article ×6, Platform series tiles ×12 and programs ×8, Why ×2.
- Emerald ×32 non-CTA (18 desktop, 14 mobile). About structure, principles and stats; Home "DAILY / UNIVERSAL / BUILT TO SCALE", "The solution" and the research band; the Timeline meta-analysis card. All are rendered by **Panel tone="emerald"**, with Eyebrow, card-title, type-body or Stat inside.
- Forest ×4: Why "Under $8" and Research "Plus the wider field", rendered by **Panel tone="forest"**.
- The Emerald CTA panels are ClosingCta and the quote panels are Testimonial; both belong to other groups.

**Matches:** the fills, 8px radius, white text, and tint padding of 24/20 on 16 panels.

**DEFECT:** compact green padding (#3 above).

**DECIDED:**

- One-off shadows: the Home DAILY cards' 3-layer green shadow, the Programs-Green panels, and Why's soft-3D panels.
- 12px radius on Research's Forest panel and the Programs-Green panels.

**BOARD-INCONSISTENT:**

- Green desktop padding: 24, 28×32, 32, 40, 48 and 72. The system's 24 matches 1 of 20.
- Tint exceptions: 48, 40 and 32×40.
- Platform programs: tint on D1/M1, Emerald with a shadow and 12px radius on Programs-Green.

**MISSING:** a page-ground (#f7f7f5) panel tone, used for Research's panels and study-card fact boxes.

## Tag

**Instances:**

- 32 neutral tags with a swatch: Research, Timeline, Platform-Desktop-2 and Mobile-2.
- 6 evidence tags ("Add-on" ×4, dashboard mock ×2).
- 4 white tags.
- 3 on green.
- 1 evidence tag with an icon (ESSA, on 2 boards).

**Matches:** 24px height, 13/700 type, 8px padding, radius and gap, the 10px swatch, and the evidence and white tones.

**BOARD-INCONSISTENT:** neutral ink. All 32 neutral tags on FINAL V use #31373e; the decision boards' samples and the system use #282b2f. If FINAL V wins, the fix is `.ie-tag-neutral { color: var(--foreground-secondary) }`.

**DECIDED:** tags drawn 26, 28 or 36px tall, where the decision is 24px.

**SYSTEM-CHANGE:** a 12% white fill on green (the boards use 16%).

**MISSING:** Home's outlined award badges on Home-Desktop-2 and Home-Mobile-2: 34px tall, 12px radius, a 1px white-40% border, a 16px icon and 14px text.

**NOT-ON-BOARDS:** linked tags.

## FeatureIcon

**Instances:** 62 glyphs on 12 boards.

**Matches:** all 24 `FILL` glyphs appear, path for path. Colours match: #02a451 bare, white on green, and the 48px Emerald disc with a 24px white icon (Contact, Why funding).

**DEFECT:** the missing `play` and `check-circle` glyphs (#2 above).

**DECIDED:**

- Sizes outside the decided 24–32px range: 40, 20, 18 and 22.
- Why's soft-3D subject tiles.

**MISSING:**

- A disc holding Home's hand-drawn growth illustration (8 instances).
- An eyebrow led by an icon, on 4 Platform boards.

## Icon

**Matches:** arrow-right ×118, check-circle ×63, arrow-down ×28, arrow-up-right ×24, play ×22, chevron-down ×16, menu ×13 and the rest. All use 2px round strokes in currentColor.

**DEFECT:** arrow-left and the README sizes (#6 and #7 above).

**DECIDED:**

- 2.2px strokes on 20 icons (Research).
- Pricing's solid-disc list checks, which become outline checks.

**BOARD-INCONSISTENT:**

- The arrow-up-right head: 24 instances match the system, 15 use `M9 7h8v8`.
- Home carousel chevrons: 4 use 7-unit arms; the Timeline's 2 match the system.

**MISSING:** Why's comparison marks (check and minus in a circle) on Why-Desktop-2 and Why-Mobile-2.

**NOT-ON-BOARDS:** close and alert (used by MobileMenu and TextField).
