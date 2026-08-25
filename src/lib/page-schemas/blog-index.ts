import { z } from 'zod';
import type { PageSchemaContext } from './shared';
import { pageBase } from './shared';

/** /blog/ — src/content/pages/blog-index.yml (drives src/pages/blog/index.astro)
 *
 * A listing route: everything below the masthead is DERIVED from the `blog`
 * collection, so only the page's own copy lives here. Left behind in the route on
 * purpose: the `getCollection` query, the draft filter, the pubDate sort, the
 * `Intl.DateTimeFormat` instance, and each post's title/description/date (those are
 * edited on the post itself).
 *
 * `readMoreLabel` is sidebar-only: it renders once PER POST inside the derived list, so
 * a visual region would paint N controls all writing the same page-level field.
 *
 * `_inputs` this route wants (to merge into
 * collections_config.pages.schemas.blog-index._inputs):
 *   hero            → type: object, options.preview.icon: title
 *   hero.intro      → type: textarea
 *   readMoreLabel   → type: text, comment: "Link text under every post; the arrow is
 *                     added by the template."
 * No `_structures` — this page has no arrays.
 */
export const blogIndexPage = (_ctx: PageSchemaContext) =>
  z.object({
    _schema: z.literal('blog-index'),
    ...pageBase,
    hero: z.object({
      title: z.string(),
      intro: z.string(),
    }),
    readMoreLabel: z.string(),
  });
