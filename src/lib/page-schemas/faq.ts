import { z } from 'zod';
import type { PageSchemaContext } from './shared';
import { pageBase, pricingCard, quoteRow } from './shared';

/** /faq/ — src/content/pages/faq.yml */
export const faqPage = (_ctx: PageSchemaContext) =>
  z.object({
    _schema: z.literal('faq'),
    ...pageBase,
    hero: z.object({
      eyebrow: z.string(),
      display: z.string(),
      intro: z.string(),
    }),
    // Section ids match the sidebar's jump-to links.
    sections: z
      .array(
        z.object({
          id: z.string(),
          label: z.string(),
          title: z.string(),
          // Answers use `a` for plain text, or `aHtml` when the answer needs inline
          // links or <em>. Exactly one of the two is expected.
          items: z
            .array(
              z.object({
                q: z.string(),
                a: z.string().optional(),
                aHtml: z.string().optional(),
                open: z.boolean().optional(),
              }),
            )
            .min(1),
        }),
      )
      .min(1),
    pricing: pricingCard,
    closer: quoteRow,
  });
