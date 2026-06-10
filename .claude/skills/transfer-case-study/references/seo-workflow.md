# Content-SEO workflow template

The Workflow-tool script shape that produced the Webb School optimization
(13 agents: 6 researchers → synthesis → 3 appliers → 3 adversarial verifiers,
~1.5M subagent tokens). Adapt the topic-specific parts to the new story; keep the
structure, schemas, and verification stance.

## Why this shape

- **Researchers are web-grounded**, not memory-grounded: they must run 5–10 real
  searches, fetch and read 4–8 strong sources (2024–2026, reputable publishers),
  and attach URLs to every finding. This is what made the Webb findings concrete
  (e.g. the measured GEO citation effects) instead of folklore.
- **A barrier before synthesis is correct here** — the synthesizer genuinely
  needs all six research angles together to resolve conflicts (Webb had three:
  question-headings vs brand voice, stat-in-H1 vs topic-in-H1, page length).
  Force the synthesizer to document conflicts and how it resolved them.
- **Appliers produce paste-ready copy**, never directions ("tighten this"). Every
  proposal carries: location (YAML path), current, proposed, rationale,
  keywordsUsed, requiresNewComponent, priority.
- **Verifiers default to REJECT.** Three lenses: FACTS (re-read the YAML; reject
  anything not traceable to source facts), VOICE (calm editorial duet-headline
  brand; reject keyword-stuffed or worse-written copy), VALUE (reject
  change-for-change's-sake). On Webb this killed 4 of ~25 proposals and improved
  several others — the rejections were correct.
- Verifiers work per-scope and can't see each other: **dedupe cross-scope
  redundancies yourself** when applying (two scopes both added the 180-figure to
  adjacent paragraphs on Webb).

## Skeleton

```js
export const meta = {
  name: '<slug>-content-seo',
  description: 'Research + optimize the <slug> case study copy',
  phases: [
    { title: 'Research' }, { title: 'Synthesize' },
    { title: 'Apply' }, { title: 'Verify' },
  ],
}

const PAGE_CONTEXT = `...the ONLY page in scope; the story's established facts
(every number, name, funder, quote — these are the only permitted claims); brand
voice + duet headline constraint; what the prior site-wide audit already fixed
(read tasks/seo-playbook.md + the YAML so you don't repeat it); today's date.`

const RESEARCH_RULES = `Web researcher: load WebSearch/WebFetch via ToolSearch
("select:WebSearch,WebFetch") if unavailable. 5–10 varied searches; read the
strongest 4–8 sources; 2024–2026 reputable publishers only; every finding =
insight + mechanism/evidence + sourceUrls + applicationToPage + confidence.
Reject 2015-era folklore; flag contested claims.`

// Research angles — personalize 1–3 to THIS story's topic:
//   1. keywords-serp: real SERPs for THIS story's outcome domain (who ranks,
//      formats that win, People-Also-Ask) → keyword map grounded in evidence
//   2. education-buyer: vocabulary for THIS school/district type (funding
//      streams, MTSS/ESSA/compliance terms relevant to THIS outcome)
//   3. competitors: read 3–5 actual published case studies on THIS topic
//   (Generic angles — Google guidance, GEO/LLM citation, case-study craft —
//   are already distilled in tasks/seo-playbook.md; only re-run one if the
//   playbook looks stale or the story type is genuinely novel.)

phase('Research')
const research = (await parallel(RESEARCHERS.map(r => () =>
  agent(r.prompt, { label: `research:${r.key}`, phase: 'Research', schema: RESEARCH_SCHEMA })
))).filter(Boolean)

phase('Synthesize')
const playbook = await agent(`...merge findings + tasks/seo-playbook.md into ONE
page playbook + keyword map; resolve conflicts explicitly; read the current YAML
and built HTML so rules are grounded in what exists...
RESEARCH:\n${JSON.stringify(research, null, 1).slice(0, 180000)}`,
  { label: 'synthesize', phase: 'Synthesize', schema: SYNTH_SCHEMA })

phase('Apply')  // three scopes, each piped straight into its verifier
const applied = await pipeline(
  [headMetaHero, bodyNarrative, structureGaps],
  (a) => agent(a.prompt, { label: `apply:${a.key}`, phase: 'Apply', schema: APPLY_SCHEMA }),
  (res, a) => res?.proposals?.length
    ? agent(adversarialPrompt(a.key, res.proposals),
        { label: `verify:${a.key}`, phase: 'Verify', schema: VERDICT_SCHEMA })
        .then(v => ({ key: a.key, proposals: res.proposals, verdicts: v?.verdicts ?? null }))
    : res,
)
return { playbook, applications: applied.filter(Boolean) }
```

## Schemas (structured output — agents retry on mismatch)

```js
const RESEARCH_SCHEMA = { type: 'object', required: ['angle','sourcesConsulted','findings'],
  properties: {
    angle: { type: 'string' },
    sourcesConsulted: { type: 'array', items: { type: 'object',
      properties: { url:{type:'string'}, publisher:{type:'string'}, date:{type:'string'}, credibility:{type:'string'} },
      required: ['url','publisher'] } },
    findings: { type: 'array', items: { type: 'object',
      properties: { insight:{type:'string'}, detail:{type:'string'},
        sourceUrls:{type:'array',items:{type:'string'}}, applicationToPage:{type:'string'},
        confidence:{type:'string',enum:['high','medium','low']} },
      required: ['insight','detail','sourceUrls','applicationToPage','confidence'] } },
    keywords: { type: 'array', items: { type: 'object',   // keyword angles only
      properties: { phrase:{type:'string'}, role:{type:'string',enum:['primary','secondary','question','entity','procurement']},
        intent:{type:'string'}, evidence:{type:'string'} },
      required: ['phrase','role','intent','evidence'] } } } }

const SYNTH_SCHEMA = { type: 'object', required: ['playbook','keywordMap','contentGaps','conflicts'],
  properties: {
    playbook: { type:'array', items:{ type:'object',
      properties:{ rule:{type:'string'}, why:{type:'string'},
        sourceUrls:{type:'array',items:{type:'string'}}, priority:{type:'string',enum:['must','should','consider']} },
      required:['rule','why','sourceUrls','priority'] } },
    keywordMap: { type:'object', required:['primary','secondary','questions','entities','procurement'],
      properties: Object.fromEntries(['primary','secondary','questions','entities','procurement']
        .map(k => [k, { type:'array', items:{type:'string'} }])) },
    contentGaps: { type:'array', items:{type:'string'} },
    conflicts: { type:'array', items:{type:'string'} } } }

const APPLY_SCHEMA = { type: 'object', required: ['proposals'],
  properties: { proposals: { type:'array', items:{ type:'object',
    properties:{ location:{type:'string'}, current:{type:'string'}, proposed:{type:'string'},
      rationale:{type:'string'}, keywordsUsed:{type:'array',items:{type:'string'}},
      requiresNewComponent:{type:'boolean'}, priority:{type:'string',enum:['high','medium','low']} },
    required:['location','current','proposed','rationale','keywordsUsed','requiresNewComponent','priority'] } } } }

const VERDICT_SCHEMA = { type: 'object', required: ['verdicts'],
  properties: { verdicts: { type:'array', items:{ type:'object',
    properties:{ location:{type:'string'}, accept:{type:'boolean'},
      revised:{type:'string'}, note:{type:'string'} },
    required:['location','accept','note'] } } } }
```

## Apply-scope briefs (adapt locations to the story)

- **head-meta-hero:** seoTitle (≤60 chars, stat-led, no brand suffix —
  og:site_name carries the brand), seoDescription (≤155, stat in the first ~35
  chars), kicker, duet H1 (entity + outcome + topic; the H1 string is what LLMs
  surface as the document's name), dek (the page's self-contained quotable
  answer: entity + place + program + outcome with absolute counts), snapshot
  labels, section H2s. Propose only where the playbook beats current copy.
- **body-narrative:** story-block paragraphs, pillar titles/texts (descriptive
  takeaways beat abstract nouns for skimming administrators), timeline
  titles/texts (numbers in scannable titles; entity in the proof phase), metrics
  note (open with the canonical stat sentence), metric labels, CTA copy (name the
  buyer contexts). Paragraph counts must fit the existing layout.
- **structure-gaps:** what the page doesn't yet say — a definitional passage for
  the story's term-of-art at first substantive use (featured-snippet candidate),
  a buyer-FAQ (real objections: training/cost/durability — the `faq` schema and
  FAQAccordion already exist; no FAQPage JSON-LD), missing source links. Honest
  about requiresNewComponent.

## After the workflow

Apply only verifier-accepted proposals (use the `revised` text when present).
Then: verify every new external URL resolves, `pnpm format` → `pnpm check` →
`pnpm build`, inspect dist (canonical stat sentence in prose, FAQ `<details>`
count, JSON-LD headline), and record in the PR what was accepted vs rejected —
the rejections are evidence the copy was already strong, which reviewers value.
