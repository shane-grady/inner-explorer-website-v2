import { z } from 'zod';
import type { PageSchemaContext } from './shared';
import { ctaLink, masthead, pageBase } from './shared';

/** /pricing/ — src/content/pages/pricing.yml
 *
 * Left behind in src/pages/pricing.astro on purpose:
 *   • the masthead's `layout="uniform"` and `maxWidth` — art direction, not copy.
 *   • the Product/Offer JSON-LD, derived from `plans.items`.
 *   • PricingTable's "Scroll sideways to see every plan.", "What's included",
 *     "Ready when you are" and the per-plan screen-reader suffixes: chrome the
 *     component owns, identical on every call site.
 *
 * `plans.items` is rendered TWICE — as the three cards, and again as the
 * comparison table's header/footer columns. Only the cards carry editable
 * regions; the table's repeats are mirrors of the same fields, and two live
 * regions writing one path would let an editor see a stale copy of their own edit.
 *
 * `compare.groups` is bound with INDEXED data paths rather than `editableArray`.
 * An array container may hold only its own rows, and the table's <table> also
 * holds <thead>/<tfoot> while each <tbody> also holds its group banner row — so
 * there is no element whose children are exactly the groups, or exactly a group's
 * rows. Indexed paths give the Visual Editor text editing without add/remove
 * controls that would fail validation.
 *
 * `_inputs` this route wants (to merge into
 * collections_config.pages.schemas.pricing._inputs):
 *   compare.titleHtml            → text, comment: "Inline HTML allowed — <em>."
 *   hero.intro, plans.note, compare.intro, compare.footnote,
 *   plans.items[].blurb, cta.subtitle
 *                                → textarea
 *   compare.groups[].rows[].cells
 *                                → array with min_items == max_items == 3 (one
 *                                  cell per plan, in `plans.items` order) and
 *                                  `structures: _structures.pricing_cell`
 *
 * `_structures` this route wants:
 *   pricing_cell → three values:
 *     • a string picked from 'yes' | 'no' | 'na' (included / not included / not
 *       applicable), ideally a select input;
 *     • a free-text string ("1 included") for anything the glyphs cannot say;
 *     • an object { price, note? } for a priced add-on.
 */

/** blocks/pricing/PricingTable.astro — one cell of the comparison grid.
 *
 * Heterogeneous BY DESIGN, and it must stay that way: the renderer switches on the
 * cell's shape to draw a check, a dash, "Not applicable", a priced add-on, or free
 * text. Flattening the union to a plain string would collapse the whole table to
 * one visual treatment. (The page-level union in content.config.ts is a
 * discriminatedUnion; this is a leaf, where a plain union is the right tool.) */
const availabilityCell = z.enum(['yes', 'no', 'na']);
const priceCell = z.object({ price: z.string(), note: z.string().optional() });
const cell = z.union([availabilityCell, priceCell, z.string()]);

const comparisonRow = z.object({
  feat: z.string(),
  /** Small qualifier under the feature name. */
  note: z.string().optional(),
  /** One cell per plan, in `plans.items` order. */
  cells: z.array(cell).min(1),
});

/** blocks/pricing/PlanCards.astro — one site license. `id` keys the comparison
 *  table's columns; `highlight` brand-tints the plan across both blocks. */
const plan = z.object({
  id: z.string(),
  name: z.string(),
  price: z.string(),
  unit: z.string(),
  blurb: z.string(),
  ctaLabel: z.string(),
  ctaHref: z.string(),
  highlight: z.boolean().optional(),
});

export const pricingPage = (_ctx: PageSchemaContext) =>
  z.object({
    _schema: z.literal('pricing'),
    ...pageBase,
    /** blocks/EditorialMasthead.astro */
    hero: masthead,
    plans: z.object({
      /** Reassurance line under the row of cards. */
      note: z.string().optional(),
      items: z.array(plan).min(1),
    }),
    compare: z.object({
      eyebrow: z.string(),
      titleHtml: z.string(),
      intro: z.string(),
      footnote: z.string().optional(),
      groups: z.array(z.object({ title: z.string(), rows: z.array(comparisonRow).min(1) })).min(1),
    }),
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
