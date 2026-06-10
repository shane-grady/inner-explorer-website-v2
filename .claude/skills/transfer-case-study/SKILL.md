---
name: transfer-case-study
description: >-
  Transfer a legacy innerexplorer.com case study into this site as a new
  /case-studies/<slug>/ page (Webb School pattern: one YAML drives the whole page),
  then optimize its content to current SEO/GEO best practices with a research
  workflow. Use this skill whenever the user asks to transfer, migrate, port,
  rebuild, or "do the next" case study; pastes an innerexplorer.com/case-study*
  URL or a legacy case-study PDF; or asks to add a new district/school success
  story page — even if they don't say "case study" (e.g. "add the Newark story
  like we did Webb School"). Also use it when asked to SEO-optimize or refresh the
  content of an existing /case-studies/ page. Use it EVEN IF you could hand-build
  the page: the point is full-fidelity extraction, the shared YAML/component
  system, and the verified optimization workflow — not bespoke per-page work.
---

# Transfer a legacy case study

Port a case study from the old innerexplorer.com site into this repo and make its
content the strongest it can be for 2026 search and AI-citation visibility. This
skill encodes the full process that produced `/case-studies/webb-school/`
(PR #15, 2026-06-09) — including every trap hit along the way. Webb School is the
reference and rough template; each new story must be personalized to its own
facts, audience, and keyword space, not cloned.

**The shape of the job:** one schema-validated YAML file
(`src/content/case-studies/<slug>.yaml`) drives the entire page. The route
(`src/pages/case-studies/[slug].astro`), the `/case-studies/` hub card, the
next-study cross-link, the explore band, the Article JSON-LD (headline = duet H1,
`about` from `district.name`/`location`, `citation` from sources with `href`),
the OG-image pipeline, and the sitemap are ALL automatic once the YAML exists.
The only manual surfaces are a story card in `src/pages/newsroom.astro` and the
PDF copy in `public/downloads/`.

## Step 0 — Orient (main context)

Read before doing anything: `tasks/lessons.md`, `tasks/seo-playbook.md`,
`src/content/case-studies/webb-school.yaml` (the gold standard — study its
comment conventions, PUBLISH GATE markers, and copy patterns), the `caseStudies`
schema in `src/content.config.ts`, and `src/pages/case-studies/[slug].astro`.

Environment facts that shape how you work here:

- The **Workflow tool runs reliably** in this environment (10–13-agent runs
  verified). Direct Explore/Plan Agent spawns are flaky (prompt overflow from the
  inherited MCP surface) — do exploration in the main context, use Workflow for
  fan-out.
- Run `higgsfield account status` **now**, not when you reach the imagery step.
  If the session is expired, ask the user to run `higgsfield auth login` and keep
  building with placeholders — never block the page on imagery.
- Components already exist for everything the Webb story needed: `ResultsChart`
  (grouped bars, tones muted/brand/accent), `Pillars` (3 or 4 cards, 7 icons),
  linked `sources` (optional `href`), optional `faq` (rendered by the shared
  FAQAccordion), `CaseStudyExplore`. Extend the schema only for a genuinely new
  story shape — additive and optional, so existing pages never change.

## Step 1 — Extract everything, verbatim

WebFetch summarizes; you need exact words. `curl -sL` the raw HTML to /tmp.

- **Find and download the PDF** (legacy pages have a DOWNLOAD link). The PDF
  often holds facts the web page dropped — Webb's PDF contained the decisive
  "40+ outbursts → ONE" detail and the research citations. `pdftotext`/`pdftoppm`
  are not installed and the Read tool can't render PDFs here; run
  `python3 scripts/extract_pdf_text.py <file.pdf>` (bundled with this skill) to
  pull the text via zlib stream decompression.
- **Download every chart image and Read it** (vision) — the data values you read
  off the bars become the `chart` block and metric values.
- Record in your plan file: every fact, number, name, role, funder, quote (prefer
  the fuller PDF version), chart series, image alt, and citation. These are the
  ONLY claims the new page may make. Cross-check web vs PDF; note discrepancies.

## Step 2 — Ask the user before writing (AskUserQuestion)

Settled precedents from the Webb build (present them; let the user redecide for
this page):

1. **Fidelity where the source is thin** — Webb's call: fill the template with
   representative copy, every invented item carrying a `# PUBLISH GATE` comment.
   Know the history: two independent audits later flagged invented student quotes
   and an unsourced trust rating as the top E-E-A-T risk (fabricated content is a
   Quality-Rater-Guidelines "Lowest" trigger), and the user chose "keep until
   launch review". Don't re-litigate silently in either direction.
2. **Imagery** — Webb's call: generate via the `inner-explorer-covers` skill
   conventions (GPT Image 2, 16:9, lived-in modern schools).
3. **Portraits of real named people** — stand-ins allowed, but alt text must
   never assert identity ("Portrait of a school administrator (placeholder
   image)"), with a PUBLISH GATE comment. Never caption a synthetic face with a
   real person's name.
4. Confirm the slug.

## Step 3 — Build the page

- Copy placeholder images under the **final filenames** first (a later swap is
  then a pure file overwrite — no YAML churn). Stand-ins from
  `src/assets/images/case-studies/webb-school/` are fine.
- Write the YAML modeled on `webb-school.yaml`: real facts in every required
  field; timeline derived from the story's actual arc; metrics grid mixing the
  story's own numbers with its cited research (separate `sourceId`s); chart block
  if the legacy page had one; FAQ answering real buyer questions (training, cost,
  durability) from established facts only.
- Add the newsroom story card (`src/pages/newsroom.astro`, unique id, newest
  date) and copy the legacy PDF to `public/downloads/<slug>-case-study.pdf`,
  wired as the CTA's secondary link.
- Verify any external source URL resolves before shipping it
  (`curl -sIL -o /dev/null -w "%{http_code}"`).

Known traps (full write-ups in `tasks/lessons.md` — read it):

- `sr-only` on a `<table>` does NOT collapse it (tables refuse sub-min-content
  width) → invisible page-wide mobile overflow. Wrap tables in a `div.sr-only`.
- In a column flex container, `flex: 1` on a child silently overrides its
  explicit `height` (basis 0) — bars/cells collapse to min-content.
- The preview screenshot tool intermittently captures `data-cs-reveal` content as
  hidden and ignores viewport resizes. Verify reveal-gated UI via DOM eval
  (classList / computed opacity / `scrollWidth` for overflow), not pixels.
- The dev server's Sharp can break after an `astro.config.mjs` edit ("Could not
  find Sharp" on new image transforms) — restart the preview server.
- Run `pnpm format` before `pnpm check`; Prettier reformats YAML/astro files and
  `check` includes `format:check`.

## Step 4 — Imagery (Higgsfield)

Follow the `inner-explorer-covers` skill conventions (prompt template, mindful
subject rules, modern lived-in environments, the color-boost closing clause).
Scenes must illustrate THIS story's specifics — the practices, age range, and
moments the source material describes. Adult environmental portraits go through
the same pipeline. Then:

- Review EVERY image by Reading it before installing — check posture, eyes,
  whiteboards-not-chalkboards, and any on-image text.
- Install at 1600px: `sips -Z 1600 -s format jpeg -s formatOptions 78`; re-encode
  anything over ~300KB at quality 68. Copy the hero to
  `src/assets/images/newsroom/<slug>.jpg` for the story card.

## Step 5 — Content-SEO workflow (use the Workflow tool)

Do NOT re-research generic 2026 SEO — `tasks/seo-playbook.md` already holds the
evidence-backed playbook (canonical stat sentence; entity-complete H1 duet;
descriptive first sentences; quotes wrapping statistics; linked verified sources;
buyer-FAQ with no FAQPage JSON-LD; % always paired with absolute counts; the
folklore reject-list). Run a workflow scoped to what is page-specific. The full
script template with schemas and prompt patterns is in
`references/seo-workflow.md` — read it when you reach this step.

The shape that worked (13 agents on Webb):

1. **Research** (parallel; agents load WebSearch/WebFetch via ToolSearch; 2024–
   2026 reputable sources; every finding carries URLs): the keyword/SERP
   landscape for THIS story's topic and outcomes (run real searches, note who
   ranks and the People-Also-Ask questions), the buyer vocabulary for THIS
   school/district type, and competitor case studies on THIS topic.
2. **Synthesize** into a page playbook + keyword map (primary / secondary /
   questions / entities / procurement), merged with `tasks/seo-playbook.md`.
3. **Apply** in three scopes — head/meta/hero · body narrative · structure gaps —
   exact paste-ready copy only, no invented facts, duet-headline brand voice as a
   hard constraint.
4. **Adversarial verify** per scope: verifiers re-read the YAML to fact-check
   every claim and default to REJECT (keyword stuffing, anything worse-written
   than current copy, change-for-change's-sake).

Apply only verifier-accepted proposals, in the main context. The verifiers work
per-scope and can't see each other — resolve cross-set redundancies yourself
(two scopes will sometimes add the same stat to adjacent paragraphs; dedupe).

## Step 6 — Verify and ship

- Preview desktop + mobile; check `document.documentElement.scrollWidth ===
  clientWidth` (overflow), the chart/FAQ/voices render, and all links resolve.
- Existing case-study pages (Broward, Webb School, …) must be byte-unchanged.
- `pnpm check` green; `pnpm build`, then inspect the dist HTML: title ≤60 chars /
  description ≤155 with the headline stat front-loaded, OG image is this page's
  hero crop, Article JSON-LD headline/about/citation, sitemap entry, canonical
  stat sentence present in prose.
- Update `tasks/todo.md`; append any NEW lessons to `tasks/lessons.md`; commit on
  a branch and open a PR to main with a body listing what the workflow accepted
  and rejected.

**Definition of done:** every fact on the legacy page and PDF exists on the new
page; every claim on the new page traces back to the source material; checks and
build are green; the PR tells the reviewer what changed and why.
