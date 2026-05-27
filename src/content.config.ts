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

export const collections = { blog, testimonials };
