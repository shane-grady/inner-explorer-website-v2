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

// Studio narrators. One JSON per narrator — the CMS seam: a future admin reads
// and writes the same schema-validated entries. Wall fields are required; detail-
// page fields are optional so the per-narrator template renders gracefully when
// detail content hasn't been authored yet (sections hide on absence).
const narrators = defineCollection({
  loader: glob({ pattern: '**/*.{json,yaml,yml}', base: './src/content/narrators' }),
  schema: ({ image }) =>
    z.object({
      // Wall (required)
      name: z.string(),
      langs: z.array(z.string()).min(1), // e.g. ["EN", "ES", "UR"]
      since: z.number().int(),
      practices: z.number().int(),
      isNew: z.boolean().default(false),
      photo: image(),
      role: z.string().optional(),
      bio: z.string().optional(),
      order: z.number().default(0),

      // Detail page (all optional — sections hide when absent)
      subtitle: z.string().optional(), // masthead sub copy
      photoWide: image().optional(), // 21:9 editorial; falls back to `photo`
      portraitLocation: z.string().optional(), // top-right photo corner caption
      pullQuote: z
        .object({
          text: z.string(),
          attribution: z.string(),
        })
        .optional(),
      voiceIntro: z
        .object({
          title: z.string(),
          audio: z.string().optional(), // public/ path; cosmetic-only if absent
        })
        .optional(),
      quickFacts: z
        .array(
          z.object({
            value: z.string(),
            label: z.string(),
          }),
        )
        .optional(),
      qa: z
        .array(
          z.object({
            n: z.string(), // "01"
            q: z.string(),
            a: z.string(),
            tag: z.string(), // "Origin", "Process" …
          }),
        )
        .optional(),
      practiceList: z
        .array(
          z.object({
            title: z.string(),
            meta: z.string(), // "21-day series · Grades 3–5"
            image: image(),
            href: z.string().optional(),
          }),
        )
        .optional(),
    }),
});

export const collections = { blog, testimonials, narrators };
