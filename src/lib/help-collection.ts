import { z } from 'zod';

// Frontmatter schema for Help Center articles — guided how-to documentation. ONE MDX file
// per article (src/content/help/<slug>.mdx) drives an article page; frontmatter carries the
// metadata that builds the sidebar nav, home cards, search index, and prev/next.
// Article bodies are MDX authored with the shared doc components (Callout, Steps,
// CardGrid, LinkCards, Accordion, HelpFigure). `group` ties an article to one of the
// audience sections defined in src-help/lib/help.ts. This is the CMS seam.
//
// The Help Center build defines the collection in its own frozen copy
// (src-help/lib/help-collection.ts). This copy of the schema serves the marketing site's
// content config (src/content.config.ts), which renders the privacy policy and gives
// `astro check` the help types src-help/ is checked against. Keep the two identical.
export const helpArticleSchema = z.object({
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
  canonicalUrl: z.preprocess(
    (value) => (value === '' || value === null ? undefined : value),
    z.url().optional(),
  ),
  // SEO (optional — falls back to title + blurb).
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  draft: z.boolean().default(false),
});
