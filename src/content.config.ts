// The marketing site's collections.
//
// `help`: the privacy policy. Its text lives in the Help Center's content folder
// (src/content/help/privacy-policy.mdx) so the legal document has one place to edit, and
// /privacy-policy/ renders that same file. Registered as `help`, with the Help Center's own
// schema (the one CMS contract for that file), because `astro check` (run with this config)
// also type-checks src-help/, whose code reads CollectionEntry<'help'>. This is the one
// marketing import from src-help/ that eslint.config.js allows.
//
// `news`: the Newsroom's articles (src/content/news/<slug>.mdx → /newsroom/<slug>/), drawn
// on the FINAL V Article boards. `authors`: their bylines and author boxes.
import { defineCollection, reference } from 'astro:content';
import { file, glob } from 'astro/loaders';
import { z } from 'zod';
import { helpArticleSchema } from '../src-help/lib/help-collection';

const help = defineCollection({
  loader: glob({ pattern: 'privacy-policy.mdx', base: './src/content/help' }),
  schema: helpArticleSchema,
});

const authors = defineCollection({
  loader: file('src/content/authors.yml'),
  schema: ({ image }) =>
    z.object({
      name: z.string(),
      /** The byline's line under the name. */
      role: z.string(),
      /** The author box's line under the name (the role with the organization). */
      title: z.string(),
      bio: z.string(),
      photo: image(),
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
      author: reference('authors'),
      heroImage: image(),
      heroImageAlt: z.string(),
      /** `contain` for a graphic with text in it (shown whole on the tint ground). */
      heroImageFit: z.enum(['cover', 'contain']).default('cover'),
      /** Where a cover-cropped card image centers (CSS object-position). */
      heroImagePosition: z.string().optional(),
      /** The panel above the body: a check list with bold lead-ins, or one paragraph. */
      takeaways: z
        .object({
          eyebrow: z.string(),
          items: z.array(z.object({ lead: z.string(), text: z.string() })).optional(),
          text: z.string().optional(),
        })
        .optional(),
      /** Short labels for "On this page", one per H2 in order (the H2 text when absent). */
      toc: z.array(z.string()).optional(),
      faq: z
        .object({
          title: z.string(),
          items: z.array(z.object({ q: z.string(), a: z.string() })).min(1),
        })
        .optional(),
      /** The call to action: end-of-article panel, the rail card (desktop) and the sticky bar
       *  (mobile). Without it the article ends with the Newsroom's own panel. */
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
      draft: z.boolean().default(false),
    }),
});

export const collections = { help, authors, news };
