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
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'zod';
import { helpArticleSchema } from '../src-help/lib/help-collection';
import { CASE_STUDY_TAGS, type CaseStudyTag } from './lib/case-study-tags';

const help = defineCollection({
  loader: glob({ pattern: 'privacy-policy.mdx', base: './src/content/help' }),
  schema: helpArticleSchema,
});

const tag = z.enum(Object.keys(CASE_STUDY_TAGS) as [CaseStudyTag, ...CaseStudyTag[]]);

// The story body, block by block in reading order. `*words*` in a quote are set bold.
const bodyBlock = z.discriminatedUnion('type', [
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
  z.object({ type: z.literal('checklist'), items: z.array(z.string()).min(1) }),
  z.object({
    type: z.literal('steps'),
    items: z.array(z.object({ title: z.string(), text: z.string() })).min(1),
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
      /** Full place for the title's meta line and JSON-LD ("Avon, Connecticut"). */
      location: z.string(),
      tags: z.array(tag).min(1),
      /** The H1's two halves; `emph` is set in Emerald. */
      title: z.object({ lead: z.string(), emph: z.string() }),
      lead: z.string(),
      /** The index card's headline result (its label is shorter than the result tile's). */
      card: z.object({ stat: z.string(), label: z.string() }),
      results: z
        .array(z.object({ value: z.string(), label: z.string(), baseline: z.string() }))
        .min(1)
        .max(4),
      image: z.object({ src: image(), alt: z.string() }),
      /** "At a glance": the rail's facts. */
      glance: z.array(z.object({ label: z.string(), value: z.string() })).min(1),
      body: z.array(bodyBlock).min(1),
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
