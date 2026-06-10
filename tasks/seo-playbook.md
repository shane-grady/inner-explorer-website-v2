# Case-study content playbook (distilled from the 2026-06 research workflow)

Source: 13-agent research workflow (6 researchers over 2024–2026 sources — Google
Search Central, the Princeton GEO study + successor citation studies, NN/g, CXL,
HubSpot, education-sector/CASEL/ESSA materials, competitor teardowns — then
synthesis, application, and adversarial verification). Applied to
`/case-studies/webb-school/` on 2026-06-09. Reuse for every future case study.

## Keyword map (Webb School page)

- **Primary:** reduce restraint and seclusion in schools · mindfulness in schools
  case study · alternatives to restraint and seclusion
- **Secondary:** restraint and seclusion reduction · SEL case study · mindfulness
  program for special education students · school mindfulness program results ·
  Tier 1 behavior interventions · evidence-based SEL program · MBSEL ·
  therapeutic school · trauma-informed school strategies · de-escalation
- **Question phrases:** Can mindfulness reduce restraints and seclusions in
  schools? · What are the alternatives to restraint and seclusion? · What is
  MBSEL? · How long does a school mindfulness program take to show results? ·
  What did the pilot cost?
- **Procurement vocabulary:** Title IV-A (Safe and Healthy Students) · IDEA early
  intervening services · state school mental-health grants · MTSS / Tier 1
  universal support · ESSA evidence tiers · restraint and seclusion reporting

## Rules that earned their place (evidence-backed)

1. **No fabricated trust elements, ever.** Jan-2025 Quality Rater Guidelines make
   fabricated/filler material a Lowest-rating trigger; fabricated social proof is
   net-negative (CXL). Two real voices beat five where three are invented.
2. **One canonical stat sentence, byte-identical everywhere** (page, hub card,
   anchors, social): entity + % + absolute counts + program + timeframe.
   Webb's: "Restraints and seclusions at The Webb School in the Valley fell 65% —
   from 180 to 62 — in the first school year of Inner Explorer's daily practice
   (2018–19)."
3. **Descriptive leads:** the first sentence under every heading must stand alone
   (entity-complete) — AI engines extract at passage level; skimmers read headings
   - first sentences only (NN/g F-pattern).
4. **Quotes wrapping statistics** are the two highest-measured GEO citation
   tactics combined (+41% / +31% in the only controlled experiment). The DeVane
   quote (40+ → ONE) is the model.
5. **Keep:** chart + sr-only data table, linked sources, ungated PDF, % always
   paired with absolute counts, honest off-trend data points (the COVID 68).
6. **Reject (folklore):** llms.txt (no measured effect), FAQ-for-machines,
   question-izing every heading (Google's June-2026 guide mythbusts restructuring
   for AI), keyword-density campaigns (−8% in the GEO experiment), date-bumping
   without substantive change, padding length (53% of AI Overview citations go to
   pages under 1,000 words).
7. **FAQs are for buyers, not bots:** only real objections (training, cost,
   durability), answered in 2–3 front-loaded sentences from established facts.
   No FAQPage JSON-LD (gov/health-restricted since 2023).
8. **H1 carries entity + topic** (it's the string LLMs surface as the document
   name); external surfaces use the numbered formula headline.
9. **Buyer-language, once each:** Tier 1/MTSS framing, accommodation, funding
   streams. One mention is recognition; three is salesy.

## Additions from the Kaiser Elementary workflow (2026-06-09)

- **Verify quotes against the PRIMARY source, not the legacy site.** The legacy
  innerexplorer.com/case-study1 page misquoted The Nation ("intense behavior
  problems" — the article says "behavioral problems", attributed to Hardman AND
  other teachers). Legacy pages are extraction sources for _our own_ claims, but
  third-party quotes must be checked against the third party.
- **Sensitive-topic pages (addiction, child trauma) get a language freeze** in the
  YAML header: condition-first addiction language; the program supports students —
  never "tackles/fights/heals" the crisis; no causation claims on school-reported
  academics; no imported statistics (SEL-ROI multipliers, CASEL designations, ESSA
  tier claims).
- **Representative imagery needs visible disclosure** when photoreal generated
  children appear under a real named school: `gallery.note` (additive-optional in
  the caseStudies schema, rendered by PhotoMosaic) + a non-documentary eyebrow.
- **Site-level CASEL ceiling:** Inner Explorer's verified designation is
  "SEL-Supportive Program" — NOT "SELect". Never cite higher anywhere on the site.
- At domain migration: the legacy case studies ALSO live on the lms. subdomain —
  301 both innerexplorer.com AND lms.innerexplorer.org variants of /case-study1
  and /images/HJK-Elementary.pdf to /case-studies/kaiser-elementary/.

## Open follow-ups for this page

- Verify Inner Explorer's exact CASEL Program Guide designation (pg.casel.org)
  before citing it — never paraphrase upward.
- Highest-value honest refresh: one more school year of Webb-reported data
  (answers "did it last?" and justifies a truthful updatedDate bump).
- A real teacher voice (from the legacy PDF or Webb staff) — the one persona
  competitors quote that this page lacks.
- At domain migration: 301 innerexplorer.com/case-study4, /images/Webb-School.pdf,
  and /mbsel.html to this page (they currently rank for this story and will
  cannibalize it).
- Adjacent informational queries (national restraint statistics, de-escalation
  explainers) belong in /research or blog posts that link here — not on this URL.
