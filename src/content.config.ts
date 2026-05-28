import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'zod';

// Content lives in the repo as type-safe collections (the Content Layer API).
// This IS the CMS seam: a future admin reads/writes these same schema-validated
// files, so moving to a CMS later is low-effort. Edit content here for now.

const blog = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/blog' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      pubDate: z.coerce.date(),
      updatedDate: z.coerce.date().optional(),
      author: z.string().default('Inner Explorer'),
      heroImage: image().optional(),
      tags: z.array(z.string()).default([]),
      draft: z.boolean().default(false),
    }),
});

const testimonials = defineCollection({
  loader: glob({ pattern: '**/*.{json,yaml,yml}', base: './src/content/testimonials' }),
  schema: z.object({
    quote: z.string(),
    name: z.string(),
    role: z.string(),
    org: z.string().optional(),
    order: z.number().default(0),
  }),
});

// Narrators — the voices who guide Inner Explorer's audio practices. Drives the
// CMS-ready detail page (src/pages/narrators/[slug].astro). One narrator object
// per file; images resolve via the `image()` helper, audio/transcript are optional.
const narrators = defineCollection({
  loader: glob({ pattern: '**/*.{json,yaml,yml}', base: './src/content/narrators' }),
  schema: ({ image }) =>
    z.object({
      name: z.string(),
      role: z.string(),
      order: z.number().default(0),
      draft: z.boolean().default(false),
      photo: image().optional(), // 4:5 portrait (cards / index)
      photoWide: image().optional(), // 21:9 editorial hero
      photoAlt: z.string(),
      location: z.string().optional(),
      intro: z.string(),
      quote: z.object({ text: z.string(), attrib: z.string().optional() }),
      voiceIntro: z
        .object({
          audioSrc: z.string(),
          durationSec: z.number(),
          title: z.string(),
          transcriptHref: z.string().optional(),
          captionsSrc: z.string().optional(),
        })
        .optional(),
      facts: z.array(z.object({ value: z.string(), label: z.string() })).default([]),
      qa: z
        .array(
          z.object({
            n: z.string().optional(),
            question: z.string(),
            answer: z.string(),
            tag: z.string().optional(),
          }),
        )
        .default([]),
      practices: z
        .array(z.object({ title: z.string(), meta: z.string(), image: image().optional() }))
        .default([]),
    }),
});

export const collections = { blog, testimonials, narrators };
