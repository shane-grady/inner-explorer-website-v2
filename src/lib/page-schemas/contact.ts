import { z } from 'zod';
import type { PageSchemaContext } from './shared';
import { masthead, pageBase } from './shared';

/** /contact/ — src/content/pages/contact.yml
 *
 * Left behind in src/pages/contact.astro on purpose:
 *   • the 50-state `<select>` list — form configuration, not copy. It never changes
 *     and 50 rows in the CMS would bury the four fields that do.
 *   • the ContactPage JSON-LD — derived from `pageTitle`, `pageDescription`, and
 *     `email.items[0].email`.
 *   • the copy-to-clipboard toast label ("Copied") — a UI affordance, not page copy.
 *
 * `_inputs` this route wants (to merge into
 * collections_config.pages.schemas.contact._inputs):
 *   hero.intro         → textarea
 *   form.blurb         → textarea
 *   form.confirmation  → textarea, comment: "Shown in place of the form after submit."
 *   email.blurb        → textarea
 *   form.roles         → array, min_items 1 (the `value` is the submitted form value —
 *                        changing it changes what Netlify records)
 */

/** One `<option>` in a form `<select>`: `value` is submitted, `label` is displayed. */
const selectOption = z.object({
  value: z.string(),
  label: z.string(),
});

export const contactPage = (_ctx: PageSchemaContext) =>
  z.object({
    _schema: z.literal('contact'),
    ...pageBase,
    hero: masthead,
    form: z.object({
      badge: z.string(),
      title: z.string(),
      blurb: z.string(),
      roles: z.array(selectOption).min(1),
      submitLabel: z.string(),
      confirmation: z.string(),
    }),
    email: z.object({
      title: z.string(),
      blurb: z.string(),
      items: z
        .array(
          z.object({
            label: z.string(),
            email: z.string(),
            description: z.string(),
          }),
        )
        .min(1),
      helpCenterHref: z.string(),
    }),
  });
