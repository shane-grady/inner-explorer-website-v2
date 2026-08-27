import { z } from 'zod';
import type { PageSchemaContext } from './shared';
import { pageBase } from './shared';

/** /privacy-policy/ — src/content/pages/privacy-policy.yml
 *
 * The POLICY TEXT is deliberately not here. It lives in one MDX file
 * (src/content/help/privacy-policy.mdx), which the Help Center also renders as an
 * article, so a legal document has exactly one place to edit. This file carries only
 * what the marketing page adds around it, and exists so the route is a real
 * `pages` entry: without one, CloudCannon has no file behind /privacy-policy/ and
 * editors cannot open the page in the Visual Editor at all.
 *
 * Read from the MDX at build time, edited on the Help Center article: the document's
 * `title` and its one-line `blurb` (the dek under the title). The policy states its
 * own effective date in its opening table, so nothing here repeats it.
 *
 * `_inputs` this route wants (to merge into
 * collections_config.pages.schemas.privacy-policy._inputs):
 *   eyebrow → type: text, comment: "Kicker above the title."
 * No `_structures` — this page has no arrays.
 */
export const privacyPolicyPage = (_ctx: PageSchemaContext) =>
  z.object({
    _schema: z.literal('privacy-policy'),
    ...pageBase,
    /** Uppercase kicker above the document title. */
    eyebrow: z.string(),
  });
