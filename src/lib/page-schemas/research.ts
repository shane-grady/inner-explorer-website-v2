import { z } from 'zod';
import type { PageSchemaContext } from './shared';
import { ctaLink, pageBase } from './shared';

/** /research/ — src/content/pages/research.yml
 *
 * Left behind in src/pages/research.astro on purpose:
 *   • `knownUrls` and the Article/ScholarlyArticle JSON-LD — derived from `studies`.
 *   • the brain-diagram toggle labels ("Stressed" / "Mindful") — component defaults
 *     that label a decorative illustration, not page copy.
 *
 * `_inputs` this route wants (to merge into
 * collections_config.pages.schemas.research._inputs):
 *   opening.lines, brain.paragraphs   → array of text (brain paragraphs allow inline
 *                                       HTML — `<span class="inline-stat">`)
 *   *.headingHtml, brain.pullQuoteHtml, → text, comment: "Inline HTML allowed."
 *   hero.subtitle, receipts.lede,
 *   brain.paragraphs, outcomes[].copy → textarea
 *   studies                           → array, structures: study rows keyed by `title`
 *   outcomes[].data                   → array of numeric chart rows; hide unless an
 *                                       editor really is restating a chart
 */

/** A headline line. `face: 'sans'` switches to the upright sans face (default is the
 *  italic display face); `em` paints it with the brand accent. */
const headlineLine = z.object({
  text: z.string(),
  face: z.enum(['sans', 'display']).optional(),
  em: z.boolean().optional(),
});

/** blocks/research/ResearchReceipts.astro — one peer-reviewed or doctoral study.
 *  `id` is referenced by `outcomes[].studyIds` and by the `#r-<id>` deep links, so
 *  renaming one silently breaks a citation. Rendered in file order. */
const study = z.object({
  id: z.string(),
  year: z.number(),
  tag: z.string(),
  title: z.string(),
  authors: z.string(),
  institution: z.string(),
  /** The credential line — design, year, publication status and venue, e.g.
   *  "Controlled trial · 2016 · Published · Mindfulness". */
  credential: z.string(),
  leadStat: z.string(),
  leadLabel: z.string(),
});

/** The chapter mark + heading every research chapter opens with. */
const chapterHead = {
  chapterLabel: z.string(),
  chapterNumber: z.string(),
  headingHtml: z.string(),
};

const barDatum = z.object({ label: z.string(), value: z.number() });
const beforeAfterDatum = z.object({
  label: z.string(),
  before: z.number(),
  after: z.number(),
});
const lineDatum = z.object({ week: z.number(), stress: z.number(), control: z.number() });
/** One pyramid tier, listed top → bottom. */
const pyramidDatum = z.object({ label: z.string(), sub: z.string() });
/** One district-results tile. `stat` is display text ("−80%"), not a number. */
const statBandDatum = z.object({ stat: z.string(), label: z.string() });

/** blocks/research/ResearchOutcomes.astro — one full-bleed outcome spread.
 *
 * A discriminated union on `chart`, not one object with a loose `data` array: each
 * chart component takes a different row shape, and a plain union would infer
 * `(BarDatum | LineDatum | …)[]`, which is not assignable to any single chart's prop. */
const outcomeBase = {
  id: z.string(),
  label: z.string(),
  eyebrow: z.string(),
  /** Sign + figure, e.g. '+18' or '−42' or '5'. Split for display by the block.
   *  Empty hides the stat tile (a spread can lead with its headline instead). */
  statValue: z.string(),
  statUnit: z.string(),
  statCaption: z.string(),
  headline: z.string(),
  copy: z.string(),
  /** Further body paragraphs after `copy`, for spreads that carry an argument. */
  paragraphs: z.array(z.string()).optional(),
  /** `study.id`s cited under the copy. Empty is fine. */
  studyIds: z.array(z.string()),
  chartTitle: z.string(),
  chartSubtitle: z.string(),
  chartFoot: z.string(),
};

const outcome = z.discriminatedUnion('chart', [
  z.object({ ...outcomeBase, chart: z.literal('bars'), data: z.array(barDatum) }),
  z.object({
    ...outcomeBase,
    chart: z.literal('before-after'),
    data: z.array(beforeAfterDatum),
  }),
  z.object({ ...outcomeBase, chart: z.literal('dial'), data: z.array(barDatum) }),
  z.object({ ...outcomeBase, chart: z.literal('line'), data: z.array(lineDatum) }),
  z.object({ ...outcomeBase, chart: z.literal('competencies'), data: z.array(barDatum) }),
  z.object({ ...outcomeBase, chart: z.literal('pyramid'), data: z.array(pyramidDatum) }),
  z.object({ ...outcomeBase, chart: z.literal('stat-band'), data: z.array(statBandDatum) }),
]);

/** blocks/research/ResearchAIMoment.astro — one row of the risk/build table. */
const aiRow = z.object({ risk: z.string(), build: z.string() });
const statTile = z.object({ stat: z.string(), label: z.string() });

export const researchPage = (_ctx: PageSchemaContext) =>
  z.object({
    _schema: z.literal('research'),
    ...pageBase,
    opening: z.object({
      eyebrow: z.string(),
      /** The full-screen opening statement, one line per rendered line. */
      lines: z.array(z.string()).min(1),
    }),
    hero: z.object({
      eyebrow: z.string(),
      lines: z.array(headlineLine).min(1),
      subtitle: z.string(),
      /** A short emphasized line of its own under the subtitle ("Here is the proof."). */
      proof: z.string().optional(),
      /** A quieter supporting line under the subtitle. */
      note: z.string().optional(),
      primaryCta: ctaLink,
      secondaryCta: ctaLink.optional(),
    }),
    receipts: z.object({ ...chapterHead, lede: z.string() }),
    studies: z.array(study).min(1),
    brain: z.object({
      ...chapterHead,
      /** Body copy; each entry renders as one <p> with inline HTML allowed. */
      paragraphs: z.array(z.string()).min(1),
      pullQuoteHtml: z.string(),
    }),
    /** The reframe between the brain and the outcomes: unnumbered, full width. */
    missingLayer: z.object({
      label: z.string(),
      headingHtml: z.string(),
      paragraphs: z.array(z.string()).min(1),
      pullQuoteHtml: z.string(),
    }),
    outcomesHead: z.object({ ...chapterHead, jumpLabel: z.string() }),
    outcomes: z.array(outcome).min(1),
    /** The "doesn't some research say it doesn't work?" aside under the spreads. */
    objection: z.object({ heading: z.string(), body: z.string(), closing: z.string() }),
    /** Independent AI-and-cognition research set against what daily practice builds. */
    aiMoment: z.object({
      label: z.string(),
      headingHtml: z.string(),
      paragraphs: z.array(z.string()).min(1),
      stats: z.array(statTile).min(1),
      transitionHeading: z.string(),
      riskHead: z.string(),
      buildHead: z.string(),
      rows: z.array(aiRow).min(1),
      closingHtml: z.string(),
      linkLabel: z.string(),
      linkHref: z.string(),
    }),
    endorsers: z.object({
      label: z.string(),
      items: z.array(z.object({ name: z.string(), role: z.string() })).min(1),
    }),
    cta: z.object({
      eyebrow: z.string(),
      lines: z.array(headlineLine).min(1),
      subtitle: z.string(),
      /** Three next steps: the link, who it is for, and one supporting line. */
      actions: z
        .array(
          z.object({ label: z.string(), href: z.string(), audience: z.string(), line: z.string() }),
        )
        .min(1),
      /** The last words on the page, under the actions. */
      closing: z.string(),
    }),
    /** Collapsed reference list at the foot. Group 1 (Inner Explorer studies) is
     *  rendered from `studies`; these groups cover the wider field. */
    citations: z.object({
      label: z.string(),
      note: z.string(),
      groups: z.array(z.object({ title: z.string(), items: z.array(z.string()).min(1) })).min(1),
    }),
  });
