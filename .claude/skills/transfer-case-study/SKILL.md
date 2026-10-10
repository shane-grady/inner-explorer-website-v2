---
name: transfer-case-study
description: >-
  Add a school or district success story to this site as a new /case-studies/<slug>/ page:
  read the story's boards on the "Case Study Detail Working" page of the canvas, copy them
  verbatim into one caseStudies YAML entry (Webb School is the reference), restore its PDF,
  and verify the page against the boards. Use this skill whenever the user asks to transfer,
  migrate, port, rebuild, or "do the next" case study; names one of the stories (Kaiser,
  Dwight Morrow, Goddard, John Marshall, La Joya, Mindful Michigan); pastes an
  innerexplorer.com/case-study* URL or a legacy case-study PDF; or asks to add a new
  district/school success story page — even if they don't say "case study" (e.g. "add the La
  Joya story like we did Webb"). Also use it to refresh the SEO metadata of an existing
  /case-studies/ page. Use it EVEN IF you could hand-build the page: the point is one entry in
  the shared collection, copied word for word from the boards, not bespoke markup.
---

# Add a case study

One schema-validated YAML file, `src/content/case-studies/<slug>.yaml`, drives the story's
whole page. The template (`src/pages/case-studies/[slug].astro`), its card on the index, the
related-stories rows, the Article and BreadcrumbList JSON-LD, the Open Graph crop and the
sitemap entry all follow from the entry. A story needs no markup.

**Fidelity rule:** every string on the page is the original innerexplorer.com text as the
boards carry it. Copy it verbatim, typos and title case included; fix only obvious typos and
list them. The only words you write are the fields the canvas's content model leaves to the
template: the card's short label, each result's baseline, the "At a glance" facts and the alt
text. Never invent a quote, a figure, a portrait or a source.

## Step 0: Orient

Read these before anything else:

- `CLAUDE.md` (the page-PR playbook) and `tasks/lessons.md` (the Design foundation section,
  above all "Compare against the rendered board").
- The `caseStudies` schema in `src/content.config.ts`.
- `src/content/case-studies/webb-school.yaml`, the reference entry.
- `src/pages/case-studies/[slug].astro`.
- `tasks/todo.md` › Before build › Case Studies (open items, and the legacy YAMLs' PUBLISH GATE
  warnings).

## Step 1: Read the story's boards

The canvas is "Inner Explorer — Website", https://claude.ai/artifact/6gx8tapeaDzTeSSMD7R31s.

1. List its files with the Artifact tool (`action: "list"`, `scope: "files"`).
2. Read `project/Case-Study-<Story>-Desktop.dc.html` and `-Mobile.dc.html`. These are on the
   page "Case Study Detail Working"; Kaiser also has a `-Mobile-First-Screen` board.
3. Read the canvas notes in `project/canvas.json`:
   - `case-study-model`: the content model.
   - `cs-row-<story>`: the story's source.
   - Any note on the story's page, such as Webb's "Hold … waiting for approval". Report every
     such note to the user before building.

Extract the strings with a script, not by retyping them. Parse each `<h1>`, `<h2>`, `<h3>`,
`<p>`, `<blockquote>`, `<li>`, `<dt>`/`<dd>` and the chart's absolutely positioned labels in the
board HTML, unescape the entities, and keep the curly quotes and dashes. The Webb entry was
generated this way, with PyYAML's `safe_dump(allow_unicode=True, sort_keys=False)` plus a
hand-written header comment. Turn `<b>` inside a quote into `*…*`.

Also extract the card fields from `project/Case-Studies-Desktop.dc.html` (the `stories` array in
its script): `level`, `name`, `place`, `stat`, `statLabel`, `tags`, the photo blob and its alt.
The index card uses those exact values.

## Step 2: Map the board to the schema

| Board | Entry field |
| --- | --- |
| Breadcrumb level, card badge | `level` |
| H1 black half / green half | `title.lead` / `title.emph` |
| Lead paragraph under the accent bar | `lead` |
| Meta line "City, State · Level" | `location` (the city and state) |
| Result tiles (numeral, label, small grey line) | `results[]` `{ value, label, baseline }` (1–4) |
| Hero photo and its alt | `image.src` (relative path to `src/assets/images/case-studies/<slug>/`), `image.alt` |
| "At a glance" rows | `glance[]` `{ label, value }` |
| Article body, top to bottom | `body[]`: `heading` (h2, with the board's `id`) · `subheading` (h3) · `paragraphs` (a run of `<p>`) · `quote` `{ text, name, role, initials }` · `chart` · `checklist` · `steps` `{ title, text }` |
| Chart | `chart`: `title` (its figcaption), `summary` (the board's `aria-label` up to the first period), `phases[]` (`before` / `after` / `during`, each with `bars[]` `{ label, value }`), `note` (the line under the rule) |
| "Case study PDF · N pages" card | `pdf` `{ file: /downloads/<slug>-case-study.pdf, pages, title }` |
| "More stories like this" | `related[]`: the three slugs the board links |
| Index card | `card` `{ stat, label }`, `place`, `tags`, `order` (the index board's order) |

Also set:

- `seo.title`: at most 60 characters plus " | Inner Explorer".
- `seo.description`: at most 155 characters. Prefer one of the board's own sentences that
  carries the headline result.
- `publishedDate` and `updatedDate`.

**A board draws something the schema lacks** (an "In brief" panel, a results table, read time):
add it to the schema as an optional field, render it in the template, show it on
`/styleguide/` if it is a new visual pattern, and add a row to `design/inventory.md`. Never
put markup in the entry.

## Step 3: Assets

- **Photos:** read each `/_blob/<id>` the boards use, with the Artifact tool's `path` set to the
  bare 32-hex id (one call per id). Save it under
  `src/assets/images/case-studies/<slug>/<descriptive-name>.jpg`. These are the legacy site's
  photos as drawn. List each one in `tasks/todo.md` for approval.
- **PDF:** restore it with `git show 0c8cac2:public/downloads/<slug>-case-study.pdf >
  public/downloads/<slug>-case-study.pdf`, then confirm its page count with pypdf
  (`PdfReader(f).pages`). `scripts/extract_pdf_text.py` (bundled) pulls its text. Compare the PDF
  with the boards and list what the boards dropped (Webb's boards dropped one quote sentence and
  two footnotes). Raise those differences; don't silently restore them.
- **Slug:** the one in `tasks/todo.md` › Launch › legacy 301 map (`kaiser-elementary`,
  `dwight-morrow`, `goddard-middle-school`, `webb-school`, `john-marshall-hs`, `la-joya-isd`,
  `mindful-michigan`).

## Step 4: Verify against the boards

1. Run `pnpm verify`. CI also runs `pnpm verify:help`.
2. Run `pnpm build && pnpm shots`, and confirm axe is clean for `case-studies-<slug>-1440/390`.
3. **Measure; don't eyeball.** Render each board's HTML in Playwright:
   - inline its `<helmet>` CSS;
   - point its `@font-face` rules at `src/assets/fonts/`;
   - swap the `/_blob/` photo for the local file;
   - fill `{{t1}}` with `#f0efeb` and drop the `<sc-if>` tags.

   Then collect every text element's box on the board and on `pnpm preview`, at 1440 and 390,
   and pair them by text. Expect the drift `tasks/todo.md` › Case Studies already lists:

   - 48 → 44 numerals;
   - 52 → 48 heading margins;
   - an 18px quote on mobile;
   - 14px chart labels.

   Anything else is a bug or a missing variant.
4. Check behavior:
   - The index lists the story, and its filter chips appear with the right counts.
   - Every related row now shows the stories that exist.
   - The PDF link returns 200 with `application/pdf`.
   - The JSON-LD reads Article and BreadcrumbList.
5. Update `tasks/todo.md`:
   - stand-ins;
   - unconfirmed facts, every figure and quote, as drawn;
   - board vs PDF differences;
   - template-written fields;
   - remaining drift.

   Add new lessons to `tasks/lessons.md`. One PR per story.

## SEO

The body stays verbatim, so SEO work is limited to `seo.title`, `seo.description`, the alt
text and the JSON-LD the template already emits. `tasks/seo-playbook.md` holds the
evidence-backed rules. Rewriting or adding body copy for search (a FAQ, a restated stat
sentence, keyword phrasing) is a proposal for the content owner, never an edit made in this
skill. `references/seo-workflow.md` describes the optional research pass that produces those
proposals.

**Definition of done:**

- Every string on the page traces to the story's boards, or to a template-written field listed
  in todo.
- The page measures against both boards with only the listed drift.
- Checks, build and axe are green.
- The PR lists stand-ins, unconfirmed facts and open questions.
