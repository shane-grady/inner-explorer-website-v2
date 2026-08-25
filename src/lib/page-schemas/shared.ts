// Field shapes reused across marketing page schemas. Each corresponds to the props
// of a block in src/components/blocks/, so a page's YAML can be handed straight to
// the block without reshaping.
import type { SchemaContext } from 'astro:content';
import { z } from 'zod';

// Every page schema is a FACTORY taking Astro's schema context, not a plain object.
// That is what gives a route access to `image()`, which turns a repo-relative path in
// YAML into the `ImageMetadata` that <Image> needs — the same helper `caseStudies`
// uses. Modules with no images name the parameter `_ctx`.
export type PageSchemaContext = SchemaContext;

/** A button. `variant` matches the block-level primary/ghost split. */
export const ctaLink = z.object({
  label: z.string(),
  href: z.string(),
  variant: z.enum(['primary', 'ghost']).optional(),
});

export const quote = z.object({
  stars: z.number().optional(),
  body: z.string(),
  who: z.string(),
  where: z.string().optional(),
});

/** blocks/EditorialMasthead.astro */
export const masthead = z.object({
  eyebrow: z.string().optional(),
  lead: z.string().optional(),
  display: z.string(),
  intro: z.string().optional(),
});

/** blocks/PricingCard.astro */
export const pricingCard = z.object({
  eyebrow: z.string().optional(),
  headline: z.string().optional(),
  headlineHtml: z.string().optional(),
  sub: z.string().optional(),
  plan: z.object({
    pill: z.string().optional(),
    title: z.string(),
    price: z.string(),
    per: z.string().optional(),
    charged: z.string().optional(),
    ctaLabel: z.string(),
    ctaHref: z.string(),
  }),
  features: z.array(z.string()).min(1),
});

/** blocks/QuoteRow.astro */
export const quoteRow = z.object({
  lead: z.string(),
  leadDisplay: z.string(),
  leadSub: z.string().optional(),
  ctas: z.array(ctaLink).default([]),
  quotes: z.array(quote).min(1),
});

/** Keys every page file carries. `_schema` is the discriminant AND CloudCannon's
 *  schema key; `permalink` is the route, which cloudcannon.config.yml maps with
 *  `url: '{permalink}'` so the homepage can be '/' rather than '/index/'. */
export const pageBase = {
  permalink: z.string(),
  pageTitle: z.string(),
  pageDescription: z.string(),
};
