import { z } from 'zod';
import type { PageSchemaContext } from './shared';
import { ctaLink, masthead, pageBase } from './shared';

/** /newsroom/ — src/content/pages/newsroom.yml
 *
 * The newsroom is almost entirely DERIVED, so its copy surface is deliberately
 * tiny. Left behind in src/pages/newsroom.astro on purpose:
 *   • every story card — built from the `caseStudies` and `blog` collections
 *     (title, excerpt, date, reading time, cover photo, href). Adding a case study
 *     or a post is what publishes a story; copying those strings into the CMS
 *     would let the two drift apart.
 *   • the prominence sort, the cover selection (photo vs. generated mesh), the
 *     filter tabs and their counts — all computed from the same collections.
 *   • the CollectionPage/ItemList JSON-LD, derived from `pageTitle` and the
 *     story list.
 *
 * `_inputs` this route wants (to merge into
 * collections_config.pages.schemas.newsroom._inputs):
 *   hero.intro, cta.subtitle → textarea
 */
export const newsroomPage = (_ctx: PageSchemaContext) =>
  z.object({
    _schema: z.literal('newsroom'),
    ...pageBase,
    /** blocks/EditorialMasthead.astro — the `inline` masthead ("Our Newsroom"). */
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
