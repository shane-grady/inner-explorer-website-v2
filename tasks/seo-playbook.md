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
- **Procurement vocabulary:** Title IV, Part A (Student Support and Academic
  Enrichment — its official name; "Safe and Healthy Students" is an allowable-use
  category inside it, not the program name; corrected 2026-06) · IDEA early
  intervening services · state school mental-health grants · MTSS / Tier 1
  universal support · ESSA evidence tiers · restraint and seclusion reporting

## Keyword map (Goddard Middle School page, 2026-06 workflow)

- **Primary:** mindfulness case study middle school · SEL case study middle school ·
  Mindfulness-Based Social Emotional Learning (MBSEL) · Inner Explorer case study ·
  mindfulness academic performance middle school (long-tail/entity variants only —
  the head term is owned by MIT/PMC)
- **Secondary:** social emotional learning academic achievement · daily mindfulness
  practice in the classroom · "students meeting or exceeding expectations" (official
  CMAS vocabulary — keep byte-identical) · trauma-sensitive / trauma-informed (one
  use each) · self-regulation / self-management (CASEL competency) · MTSS Tier 1
  classroom / Tier 2 small-group (ASCA 2025 vocabulary)
- **Question phrases:** How did Goddard Middle School earn state recognition in
  academics? · What is MBSEL? · Does MBSEL replace an existing SEL curriculum? ·
  How long until academic results? (the two-year window) · What did it cost? ·
  How much training did teachers need?
- **Entities (verified):** Goddard Middle School (NCES 080531000879, grades 6–8,
  open) · Littleton Public Schools · CMAS · Colorado Department of Education —
  never "Colorado State Department of Education" · LG Electronics USA "Life's Good:
  Experience Happiness" · Jenica Loether, School Counselor
- **Claim discipline (2026 evidence):** SEL→academics is well-evidenced (Ha et al.
  2025 RER meta-analysis); standalone mindfulness→test-scores remains contested
  (MYRIAD null findings) — keep "preceded / the principal credited" association
  framing, never causal "mindfulness raises test scores".

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

## Keyword map (John Marshall HS page, from the 2026-06-10 workflow)

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

- **Primary:** teen mental health program high school · teen mental health case
  study · school mindfulness program case study · student-led mental health club ·
  mindfulness in high school case study
- **Secondary:** wellness room in schools · daily mindfulness practice high school ·
  SEL high school case study · Tier 1 universal mental health support · preventative
  mental health in schools · school connectedness and belonging · student voice
- **Question phrases:** How did John Marshall High School improve teen mental health
  with mindfulness? · What is the Wellness Advisory? · What are the Six Sustainable
  Happiness Skills? · Do students like mindfulness in school? · Does mindfulness work
  in high schools? (contested SERP — correlational framing ONLY; MYRIAD null result
  dominates) · How do schools fund mental health programs after ESSER?
- **Procurement:** Title IV-A (verified current, $1.38B FY26) · LCFF/LCAP (CA) ·
  California Community Schools Partnership Program · MTSS/Tier 1 · post-ESSER
  formula funding
- **Page-specific rules that earned their place:** time-anchor the LAUSD 1,100 claim
  ("roughly 1,100 at the time" — NCES counts 784 LAUSD schools for 2024–25, so any
  present-tense claim fails AI fact-checks); LG Experience Happiness initiative in
  past tense, anchored to its 2018 launch (last verifiable activity 2021); Pew's
  exact instrument is "a major problem among people their age" (the legacy "in their
  lives" was an upward paraphrase); the legacy 35%-can't-cope figure has NO locatable
  canonical source (verified 2026-06-10) — use qualitative "far fewer", never cite
  Pew for it; keep academics correlational ("That tracks the broader evidence"),
  never causal; "student-led" is an ownership narrative, never an efficacy mechanism
  (2025 meta-analysis: peer-led school interventions show no pooled wellbeing
  effect); Cipriano et al. 2023 (424 studies, 575,361 students) is the modern SEL
  citation to pair with Durlak 2011.

## Open follow-ups (John Marshall HS page)

- The one format gap vs. competitors: a 60–90s real Inner Explorer audio practice
  excerpt with transcript (repo components exist) — content owner's call.
- Off-page targets that should link here, not live here: "how to start a mental
  health club at your school" (blog), "what is Tier 1 mental health support" (/research).
- At domain migration: 301 innerexplorer.com/case-study5.html and
  /images/John-Marshall-HS.pdf to this page.
- The LAUSD signup year (~2021) is asserted nowhere because no verifiable public
  source was reachable (LAUSD's flyer is WAF-blocked, unarchived) — if the team can
  produce the announcement, add the year to the snapshot label and timeline.

## Open follow-ups for this page (Webb School)

- ~~Verify Inner Explorer's exact CASEL Program Guide designation (pg.casel.org)
  before citing it — never paraphrase upward.~~ RESOLVED 2026-06-09: current
  designation is **"Designated SEL-Supportive Program"** ("meets either the SELect
  or Promising evidence criteria … but does not fully meet all necessary program
  design criteria"), plus "a CASEL-approved evaluation demonstrates evidence of
  effectiveness at grade 3." Cited precisely on the John Marshall page (source 4).
  The legacy "CASEL-approved program" phrasing is an upward paraphrase — never carry
  it forward.
- Highest-value honest refresh: one more school year of Webb-reported data
  (answers "did it last?" and justifies a truthful updatedDate bump).
- A real teacher voice (from the legacy PDF or Webb staff) — the one persona
  competitors quote that this page lacks.
- At domain migration: 301 innerexplorer.com/case-study4, /images/Webb-School.pdf,
  and /mbsel.html to this page (they currently rank for this story and will
  cannibalize it).
- Adjacent informational queries (national restraint statistics, de-escalation
  explainers) belong in /research or blog posts that link here — not on this URL.

## Keyword map (La Joya ISD page, 2026-06-10 workflow)

- **Primary:** mindfulness in special education classrooms (head SERP is vendor
  how-to guides with no case study present — the hybrid story-plus-practices
  format fills the gap) · La Joya ISD mindfulness program (winnable entity SERP) ·
  reduce behavior issues in special education classrooms
- **Secondary:** mindfulness for students with disabilities (person-first
  variant) · daily mindfulness practice for students with disabilities · bilingual
  mindfulness practices / in English and Spanish (lowest-competition
  differentiator — no district story owns it) · calming strategies for special
  education students · self-regulation strategies for students with disabilities
  (IEP-adjacent; touch, don't target) · behavior specialist mindfulness program ·
  school mental health Texas (TEA SB 11 umbrella — politically safe in-state)
- **Question phrases:** How does mindfulness help students with disabilities? ·
  How do you teach mindfulness in a special education classroom? · Does
  mindfulness reduce behavior problems in school? (skeptical — hedged research
  context + attributed 85% only) · What is MBSEL? · Can mindfulness help students
  with disabilities express their needs? · How do teachers calm an overwhelmed
  student during a lesson? · How can a district fund a program like this?
- **Entities (verified):** La Joya ISD (NCES 4826130, Hidalgo County, Rio Grande
  Valley, TX) · Judith Lopez Guerra, special education teacher · Cynthia Salgado,
  behavior specialist (paraphrase only — no verbatim quote exists) · Angelika
  Loraine Garza, school counselor · Dr. Laura Bakosh (MBSEL term: Bakosh et al.
  2015, Mindfulness — "coined" is the verified ceiling) · Inner Explorer HOME app /
  Tune In (current branding — legacy "@HOME"/"TuneIn" is outdated, fixed on-page)
- **Procurement:** Title IV, Part A (exact name, once) · IDEA Part B (the
  special-education lane, once, no dollar figures) · CEIS **only** as the lane for
  students NOT yet identified for special education (34 CFR 300.226 — citing it as
  funding for special-ed classrooms is a credibility-destroying error) · MTSS /
  Tier 1 once each · NEGATIVE: never ESSER, ARP, Stronger Connections,
  School-Based Mental Health grants, or Title III as funding lanes; avoid
  "evidence-based SEL" phrasing on Texas-facing surfaces (SB 123 climate)

### Page-specific rules that earned their place (La Joya)

- **Governance scoping (TEA intervention through 2028, verified):** every claim
  stays scoped to classrooms and named educators — never "the district" as acting
  or endorsing subject. H1 says "La Joya ISD's special education classrooms cut…",
  CTA says "how La Joya educators made the practice stick". Do not mention the
  intervention on-page.
- **The 85%/80% source-internal discrepancy:** the legacy page AND PDF print both
  figures for the same claim. 85% featured (primary placement in both sources),
  80% appears nowhere, PUBLISH GATE in the YAML until the owner rules. "Reported"
  is load-bearing in every occurrence — never paraphrase to referrals/discipline
  data; metrics.note states it is an educator-reported observation, not a
  controlled study, from an undated source.
- **43% educator-stress figure is vendor-marketing provenance** (circulating
  since 2017, no named instrument, absent from IE's own research page): demoted
  from the metrics grid to the "Adults practice too" pillar with explicit "Inner
  Explorer reports…" attribution; source 2 says "program-reported figure, not an
  independent study."
- **First-party corroborating media:** IE's public "La Joya ISD Success Story"
  YouTube video is cited as source 8 (no stats, no date inference — entity
  corroboration only).

### Open follow-ups (La Joya page)

- At domain migration: 301 innerexplorer.com/case-study6(.html), the
  lms.innerexplorer.org variant, and /images/La-Joya-ISD.pdf to
  /case-studies/la-joya-isd/.
- District-context sentence (≈22,000 students, >99% Hispanic, year-anchored
  NCES/TEA) was REJECTED as drafted for misattributing the demographic year —
  re-propose with per-figure year+source if the owner wants it.
- Internal link from the MBSEL FAQ answer to the Webb MBSEL canonical once the
  site has a definitional anchor strategy.
- A real student or family voice (the source has none) — only with consent.
