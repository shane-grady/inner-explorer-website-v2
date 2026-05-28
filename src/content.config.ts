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

// Narrators — the voices who guide Inner Explorer's audio practices. Drives
// BOTH the D2 "Meet the Studio" collection page (src/pages/narrators/index.astro)
// AND the C2 photo detail pages (src/pages/narrators/[slug].astro).
// The schema is the unified CMS seam: detail-page fields stay optional so a
// narrator can exist on the wall before their full profile is authored.
const narrators = defineCollection({
  loader: glob({ pattern: '**/*.{json,yaml,yml}', base: './src/content/narrators' }),
  schema: ({ image }) =>
    z.object({
      // Required identity
      name: z.string(),
      role: z.string(),
      order: z.number().default(0),
      draft: z.boolean().default(false),

      // Photography (photo drives wall + detail-page card; photoWide is the
      // 21:9 editorial hero used by PhotoQuote on the detail page).
      photo: image().optional(),
      photoWide: image().optional(),
      photoAlt: z.string().optional(),
      location: z.string().optional(),

      // Detail-page editorial content (all optional — sections hide when absent
      // so narrators with only wall data still render a coherent page).
      intro: z.string().optional(),
      quote: z.object({ text: z.string(), attrib: z.string().optional() }).optional(),
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

      // Wall-only metadata for the D2 collection page (NarratorCard surfaces
      // language chips, "Since X · N practices recorded", and a "New" pin).
      langs: z.array(z.string()).default([]),
      since: z.number().int().optional(),
      practiceCount: z.number().int().default(0),
      isNew: z.boolean().default(false),
    }),
});

export const collections = { blog, testimonials, narrators };
