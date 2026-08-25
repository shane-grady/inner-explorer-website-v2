import { z } from 'zod';
import type { PageSchemaContext } from './shared';
import { masthead, pageBase } from './shared';

/** /contact/ — src/content/pages/contact.yml
 *
 * Left behind in src/pages/contact.astro on purpose:
 *   • the HubSpot portal/form ids — form IDENTITY, not copy. An editor changing them
 *     would silently break lead capture. The fields, labels and dropdown options live
 *     on the HubSpot form itself (built by scripts/hubspot-contact-form.mjs), which is
 *     why `roles` and the 50-state list are no longer modelled here at all.
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
 */

export const contactPage = (_ctx: PageSchemaContext) =>
  z.object({
    _schema: z.literal('contact'),
    ...pageBase,
    hero: masthead,
    form: z.object({
      badge: z.string(),
      title: z.string(),
      blurb: z.string(),
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
