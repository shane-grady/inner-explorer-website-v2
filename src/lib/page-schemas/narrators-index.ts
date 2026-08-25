import { z } from 'zod';
import type { PageSchemaContext } from './shared';
import { pageBase } from './shared';

/** /narrators/ — src/content/pages/narrators-index.yml
 *  (drives src/pages/narrators/index.astro)
 *
 * Left behind in the route on purpose — all of it derived from the `narrators`
 * collection, not copy an editor should retype:
 *   • the wall itself (`NarratorWall`) and the toolbar's "all N" count.
 *   • three of the five meta-strip figures (narrator count, distinct languages,
 *     total practices). Only their labels live here; `metaStrip` is an OBJECT rather
 *     than an array precisely so the CMS cannot add a row that has no figure behind
 *     it. `universalLangs.value` and `schools.value` are authored copy (the latter is
 *     a stub with no data source yet — see tasks/todo.md) and so keep a `value`.
 *   • the CollectionPage / ItemList JSON-LD.
 *
 * Sidebar-only (deliberately NOT bound to a visual region):
 *   • `hero.subtitleHtml`, `toolbar.headingHtml`, `momentsRail.headingHtml`,
 *     `coda.quoteHtml` — all render through `set:html`; a text region would strip
 *     their inline `<em>` / `<span class="sans">` markup.
 *
 * `_inputs` this route wants (to merge into
 * collections_config.pages.schemas['narrators-index']._inputs):
 *   hero, metaStrip, toolbar, momentsRail, coda   → type: object
 *   hero.subtitleHtml, toolbar.headingHtml,
 *   momentsRail.headingHtml, coda.quoteHtml       → type: text, comment: "Inline HTML allowed."
 *   momentsRail.lede, coda.cardBody               → type: textarea
 *   momentsRail.moments → array, structures: _structures.page_narrators_moment
 *   metaStrip.ariaLabel → comment: "Screen-reader name for the figures row."
 */

/** A meta-strip row whose figure is computed from the narrators collection. */
const derivedFigure = z.object({ label: z.string(), sub: z.string().optional() });
/** A meta-strip row whose figure is authored here. */
const authoredFigure = derivedFigure.extend({ value: z.string() });

const link = z.object({ label: z.string(), href: z.string() });

export const narratorsIndexPage = ({ image }: PageSchemaContext) =>
  z.object({
    _schema: z.literal('narrators-index'),
    ...pageBase,
    hero: z.object({
      eyebrow: z.string(),
      cornerLabel: z.string(),
      headlineSans: z.string(),
      headlineSerif: z.string(),
      subtitleHtml: z.string(),
      primary: link,
      secondary: link.optional(),
    }),
    metaStrip: z.object({
      ariaLabel: z.string(),
      narrators: derivedFigure,
      universalLangs: authoredFigure,
      totalLangs: derivedFigure,
      practices: derivedFigure,
      schools: authoredFigure,
    }),
    toolbar: z.object({
      headingHtml: z.string(),
      searchLabel: z.string(),
      /** The word before the derived "· all N" count. */
      filterLabel: z.string(),
    }),
    momentsRail: z.object({
      headingHtml: z.string(),
      lede: z.string(),
      moments: z
        .array(
          z.object({
            img: image(),
            label: z.string(),
            title: z.string(),
            alt: z.string().optional(),
          }),
        )
        .min(1),
    }),
    coda: z.object({
      eyebrow: z.string(),
      quoteHtml: z.string(),
      attribution: z.string(),
      attributionStrong: z.string().optional(),
      cardHeading: z.string(),
      cardBody: z.string(),
      primary: link,
      secondary: link.optional(),
    }),
  });
