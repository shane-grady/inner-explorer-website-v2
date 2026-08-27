import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'zod';

// Help Center — guided how-to documentation. ONE MDX file per article
// (src/content/help/<slug>.mdx) drives an article page; frontmatter carries the
// metadata that builds the sidebar nav, home cards, search index, and prev/next.
// Article bodies are MDX authored with the shared doc components (Callout, Steps,
// CardGrid, LinkCards, Accordion, HelpFigure). `group` ties an article to one of the
// audience sections defined in src/lib/help.ts. This is the CMS seam.
//
// Defined here (not inline in a content.config.ts) because TWO builds register it:
// the standalone help site (src-help/content.config.ts — articles at the subdomain
// root) and the main site (src/content.config.ts — kept registered so CloudCannon
// editing builds can render /help/… previews). The glob base is root-relative, so
// it resolves identically from both configs.
export const helpCollection = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/help' }),
  schema: z.object({
    title: z.string(),
    group: z.enum(['start', 'educators', 'counselors', 'admins', 'families', 'policies']),
    // Card description on the home grid + sidebar context.
    blurb: z.string(),
    // Sort order within the group (sidebar + home + prev/next sequencing).
    order: z.number().default(0),
    // Extra search terms beyond title/blurb (synonyms, feature names).
    keywords: z.array(z.string()).default([]),
    // Optional manual reading-time override (else computed from the body).
    readingTime: z.string().optional(),
    /**
     * Absolute URL of the canonical copy of this document when it also renders
     * elsewhere. The privacy policy is a standalone page on the marketing site
     * (/privacy-policy) AND an article here; pointing the canonical at the
     * marketing page keeps the two from competing as duplicate content.
     */
    canonicalUrl: z.string().url().optional(),
    // SEO (optional — falls back to title + blurb).
    seoTitle: z.string().optional(),
    seoDescription: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});
