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
//
// `news`: the Newsroom's articles (src/content/news/<slug>.mdx → /newsroom/<slug>/), drawn
// on the FINAL V Article boards. `authors`: their bylines and author boxes.
import { defineCollection, reference, type SchemaContext } from 'astro:content';
import { file, glob } from 'astro/loaders';
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

const authors = defineCollection({
  loader: file('src/content/authors.yml'),
  schema: ({ image }) =>
    z.object({
      name: z.string(),
      /** The byline's line under the name. The legacy posts' guest authors have none. */
      role: z.string().optional(),
      /** The author box's line under the name (the role with the organization). */
      title: z.string().optional(),
      bio: z.string().optional(),
      photo: image().optional(),
      link: z.object({ label: z.string(), href: z.string() }).optional(),
    }),
});

const news = defineCollection({
  loader: glob({ pattern: '*.mdx', base: './src/content/news' }),
  schema: ({ image }) =>
    z.object({
      /** The headline: H1, <title> fallback and the Article JSON-LD headline. */
      title: z.string(),
      /** The H1 as drawn: `*words*` in brand emphasis. Defaults to `title`. */
      heading: z.string().optional(),
      /** The headline on Newsroom cards, as the boards set it (sentence case). */
      cardTitle: z.string().optional(),
      /** The dek under the H1, and the excerpt on cards. */
      description: z.string(),
      metaTitle: z.string().optional(),
      metaDescription: z.string().optional(),
      pubDate: z.coerce.date(),
      updatedDate: z.coerce.date().optional(),
      category: z.string(),
      tags: z.array(z.string()).default([]),
      /** Absent on the legacy posts their boards draw without a byline. */
      author: reference('authors').optional(),
      heroImage: image(),
      heroImageAlt: z.string(),
      /** Cards: `contain` for a graphic with text in it (shown whole on the tint ground). The
       *  article hero is always cropped to fill, as the boards draw it. */
      heroImageFit: z.enum(['cover', 'contain']).default('cover'),
      /** Where a cover-cropped card image centers (CSS object-position). */
      heroImagePosition: z.string().optional(),
      /** The "Key takeaways" panel above the body: a check list with bold lead-ins. Every post
       *  uses the same label and form (the template sets the label). */
      takeaways: z
        .array(z.object({ lead: z.string(), text: z.string() }))
        .min(1)
        .optional(),
      /** Short labels for "On this page", one per H2 in order (the H2 text when absent). */
      toc: z.array(z.string()).optional(),
      faq: z
        .object({
          title: z.string(),
          items: z.array(z.object({ q: z.string(), a: z.string() })).min(1),
        })
        .optional(),
      /** The call to action: end-of-article panel and the rail card (desktop). Without it the article ends with the Newsroom's own panel. */
      cta: z
        .object({
          eyebrow: z.string(),
          title: z.string(),
          lead: z.string(),
          primary: z.object({ label: z.string(), href: z.string() }),
          secondary: z.object({ label: z.string(), href: z.string() }).optional(),
          stats: z.array(z.object({ value: z.string(), label: z.string() })).default([]),
          rail: z.object({ title: z.string(), text: z.string() }).optional(),
        })
        .optional(),
      /** The Newsroom's top slots: 1 is the featured card, 2 and 3 "Also worth reading". Unset:
       *  the newest posts fill them. */
      promoted: z.number().int().min(1).max(3).optional(),
      draft: z.boolean().default(false),
    }),
});

export const collections = { help, caseStudies, authors, news };
