# Line breaks: the boards vs the system's text-wrap rules

Measured in Chromium 141 on all 39 FINAL V boards at their own widths (1440 and 390). Each
variant was applied to one block at a time, and its lines were compared with the board's.

There are 891 multi-line text blocks: 182 headings (h1–h6) and 709 other blocks. On the boards,
53 of them end on one word.

**The boards' CSS:** `body * { text-wrap-style: pretty }`, so everything, headings included,
wraps with Chrome's `pretty`. The designer also put U+00A0 in a few places, e.g. "(Bakosh 2016)".

| Variant                                      | Headings changed | Text changed | Orphans left                                              | New one-word mid-lines | Overflow                                                                               |
| -------------------------------------------- | ---------------- | ------------ | --------------------------------------------------------- | ---------------------- | -------------------------------------------------------------------------------------- |
| Greedy (`auto`, no pretty)                   | 60 / 182         | 126 / 709    | 208                                                       | 1                      | 1 (board's own)                                                                        |
| `balance`                                    | 78 / 182         | 496 / 709    | 28                                                        | 6                      | 1                                                                                      |
| pretty + inline-block `.ie-keep` (system v7) | 29 / 178         | 127 / 679    | 11, all unavoidable (the two words don't fit on one line) | 12                     | 1                                                                                      |
| pretty + nowrap span                         | 31 / 178         | 132 / 679    | 0                                                         | 8                      | 3                                                                                      |
| pretty + U+00A0                              | 31 / 178         | 125 / 679    | 0                                                         | 8                      | 3 (2 new: "Communities Everywhere" H2 at 390; "reimbursement opportunities" H3 at 390) |

## What this means for the system

1. **Headings use `balance` in the system** (`.ie-page-title-h1`, `.ie-section-header-title`,
   `.ie-prose h2/h3`, `.ie-card-title`, `.ie-cta-title`). The boards use `pretty`, so about 43% of
   multi-line headings would break differently from the approved boards. **Fix: `pretty`
   everywhere, as the boards do.**
2. **Text without `pretty` wraps greedily.** The system sets `pretty` only on leads, intros and the
   CTA lead, so card text, checklist items, quotes and stat labels wrap greedily on a site that
   doesn't set it globally; 18% of text blocks would break differently. **Fix: set
   `text-wrap-style: pretty` on the root, as the boards do.**
3. **The no-orphans span changes about 156 of 857 eligible blocks at the board widths.** About 43
   of those are the orphan fixes. The other ~113 are collateral: Chrome's `pretty` treats a glued
   pair as one short last word and re-flows the last lines. Every way of gluing does this (span,
   nowrap or U+00A0), so it is the cost of the rule itself, not of this implementation. The
   inline-block span is still the only option that never overflows. **Owner decision:** keep the
   rule, accepting the ~113 collateral line-break changes at 1440/390, or drop it and match the
   boards' line breaks exactly (in Chrome).
4. **Line breaks only match the boards at exactly 1440 and 390, and only in Chrome.** Every other
   width breaks differently, because of fluid type and widths. Safari's `pretty` uses another
   algorithm, and Firefox has none.
