// The marketing site's collections.
//
// `help`: the privacy policy. Its text lives in the Help Center's content folder
// (src/content/help/privacy-policy.mdx) so the legal document has one place to edit, and
// /privacy-policy/ renders that same file. Registered as `help`, with the Help Center's own
// schema (the one CMS contract for that file), because `astro check` (run with this config)
// also type-checks src-help/, whose code reads CollectionEntry<'help'>. This is the one
// marketing import from src-help/ that eslint.config.js allows.
//
// `caseStudies`: one YAML file per story (src/content/case-studies/<slug>.yaml) drives its
// /case-studies/<slug>/ page and its card on the index. The fields follow the canvas's content
// model ("Case Study Detail Working" page), limited to what the boards draw; every body
// string is the original innerexplorer.com text. The transfer-case-study skill fills one.
import { defineCollection, type SchemaContext } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'zod';
import { helpArticleSchema } from '../src-help/lib/help-collection';
import { CASE_STUDY_TAGS, type CaseStudyTag } from './lib/case-study-tags';

const help = defineCollection({
  loader: glob({ pattern: 'privacy-policy.mdx', base: './src/content/help' }),
  schema: helpArticleSchema,
});

type ImageFunction = SchemaContext['image'];

const tag = z.enum(Object.keys(CASE_STUDY_TAGS) as [CaseStudyTag, ...CaseStudyTag[]]);

// The story body, block by block in reading order. `*words*` in a quote or paragraph are set
// bold; `[words](https://…)` in a paragraph is a link.
const bodyBlock = (image: ImageFunction) =>
  z.discriminatedUnion('type', [
    z.object({ type: z.literal('heading'), id: z.string(), text: z.string() }),
    z.object({ type: z.literal('subheading'), text: z.string() }),
    z.object({ type: z.literal('paragraphs'), items: z.array(z.string()).min(1) }),
    z.object({
      type: z.literal('quote'),
      text: z.string(),
      name: z.string(),
      role: z.string(),
      initials: z.string().max(3),
    }),
    z.object({
      type: z.literal('chart'),
      title: z.string(),
      /** Leads the chart's accessible name: what it counts, and where the values come from. */
      summary: z.string(),
      phases: z
        .array(
          z.object({
            label: z.string(),
            tone: z.enum(['before', 'after', 'during']),
            bars: z.array(z.object({ label: z.string(), value: z.number() })).min(1),
          }),
        )
        .min(1),
      note: z.string().optional(),
    }),
    z.object({
      type: z.literal('checklist'),
      /** An item may lead with a bold phrase (`{ lead, text }`, "Tier 1:"). */
      items: z
        .array(z.union([z.string(), z.object({ lead: z.string(), text: z.string() })]))
        .min(1),
    }),
    z.object({
      type: z.literal('steps'),
      items: z.array(z.object({ title: z.string(), text: z.string() })).min(1),
    }),
    /** A data table: the caption, the header row, then the body rows; the first cell of a row
     *  heads it, and a row that starts with "Total" is set bold. Columns of numbers align right. */
    z.object({
      type: z.literal('table'),
      caption: z.string(),
      columns: z.array(z.string()).min(2),
      rows: z.array(z.array(z.string()).min(2)).min(1),
      /** The column set bold in Emerald (by index): the result the table shows. */
      highlight: z.number().int().min(1).optional(),
    }),
    /** A photo in the body, with its caption. */
    z.object({
      type: z.literal('figure'),
      image: z.object({ src: image(), alt: z.string() }),
      caption: z.string(),
    }),
    /** A Tint aside: its label ("Did You Know?") over a line of body text. */
    z.object({ type: z.literal('callout'), title: z.string(), text: z.string() }),
    /** Result tiles in the body: the numeral, its label and an optional baseline line. */
    z.object({
      type: z.literal('stats'),
      items: z
        .array(z.object({ value: z.string(), label: z.string(), source: z.string().optional() }))
        .min(1),
    }),
  ]);

const caseStudies = defineCollection({
  loader: glob({ pattern: '*.yaml', base: './src/content/case-studies' }),
  schema: ({ image }) =>
    z.object({
      /** Position on the index (the board's order). */
      order: z.number(),
      draft: z.boolean().default(false),
      seo: z.object({ title: z.string(), description: z.string().max(160) }),
      publishedDate: z.coerce.date(),
      updatedDate: z.coerce.date().optional(),
      /** The level badge on the card and the breadcrumb ("Therapeutic school"). */
      level: z.string(),
      /** The school or district, as the card names it. */
      name: z.string(),
      /** Short place for the card ("Avon, CT"). */
      place: z.string(),
      /** Full place for the JSON-LD ("Avon, Connecticut"). */
      location: z.string(),
      tags: z.array(tag).min(1),
      /** The H1's two halves; `emph` is set in Emerald. */
      title: z.object({ lead: z.string(), emph: z.string() }),
      /** The hero card's details beside the green dots (place, level, read time…), verbatim. */
      details: z.array(z.string()).min(1),
      /** The practitioner's words that open the page (Hero D); `*words*` are set bold. */
      voice: z.object({
        quote: z.string(),
        name: z.string(),
        role: z.string(),
        initials: z.string().max(3).optional(),
      }),
      /** The lead under the hero card. */
      lead: z.string(),
      /** The index card's headline result (its label is shorter than the result tile's), and
       *  its photo where the index board draws another than the hero's. */
      card: z.object({
        stat: z.string(),
        label: z.string(),
        image: z.object({ src: image(), alt: z.string() }).optional(),
      }),
      /** The hero card's results: the numeral, its unit (set in Vibrant) and the label. */
      results: z
        .array(z.object({ value: z.string(), unit: z.string().optional(), label: z.string() }))
        .min(1)
        .max(4),
      /** The hero photo; `position` keeps the subject in frame as the band crops. */
      image: z.object({ src: image(), alt: z.string(), position: z.string().optional() }),
      /** "At a glance": the rail's facts. */
      glance: z.array(z.object({ label: z.string(), value: z.string() })).min(1),
      body: z.array(bodyBlock(image)).min(1),
      /** The case-study PDF in public/downloads/. */
      pdf: z
        .object({
          file: z.string().startsWith('/downloads/'),
          pages: z.number(),
          /** The download card's title ("Get the … case study"). */
          title: z.string(),
        })
        .optional(),
      /** Up to three similar stories by slug; only those already built are shown. */
      related: z.array(z.string()).max(3).default([]),
    }),
});

export const collections = { help, caseStudies };
