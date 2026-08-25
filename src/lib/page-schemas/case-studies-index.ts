import { z } from 'zod';
import type { PageSchemaContext } from './shared';
import { ctaLink, masthead, pageBase } from './shared';

/** /case-studies/ — src/content/pages/case-studies-index.yml
 *  (drives src/pages/case-studies/index.astro)
 *
 * A listing route: the story grid is DERIVED from the `caseStudies` collection, so only
 * the masthead and the closing CTA live here. Left behind in the route on purpose: the
 * `getCollection` query, the draft filter, the `order` sort, the CollectionPage/ItemList
 * JSON-LD, and every card's kicker/title/dek/metric/photo (edited on the case study).
 *
 * `hero` reuses the shared `masthead` shape and `cta` mirrors blocks/GlowCTA.astro's
 * props, so both objects hand straight to their block.
 *
 * `_inputs` this route wants (to merge into
 * collections_config.pages.schemas.case-studies-index._inputs):
 *   hero            → type: object, options.preview.icon: title
 *   cta             → type: object, options.preview.icon: campaign
 *   hero.intro, cta.subtitle → type: textarea
 *   cta.primary, cta.secondary → type: object, options.structures: _structures.cta_links
 * No `_structures` beyond the existing `cta_links` — this page has no arrays.
 */
export const caseStudiesIndexPage = (_ctx: PageSchemaContext) =>
  z.object({
    _schema: z.literal('case-studies-index'),
    ...pageBase,
    hero: masthead,
    /** blocks/GlowCTA.astro */
    cta: z.object({
      sans: z.string(),
      serif: z.string(),
      subtitle: z.string().optional(),
      primary: ctaLink,
      secondary: ctaLink.optional(),
      trust: z.string().optional(),
    }),
  });
