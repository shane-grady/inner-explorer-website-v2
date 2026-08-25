import { z } from 'zod';
import type { PageSchemaContext } from './shared';
import { ctaLink, pageBase } from './shared';

/** /platform/ — src/content/pages/platform.yml
 *
 * Left behind in src/pages/platform.astro (and in the blocks) on purpose:
 *   • the WebPage JSON-LD — derived from `pageTitle`/`pageDescription`.
 *   • every string inside the hero showcase, the trio mockups, the FeatureVisual
 *     cards and the SSO provider list: those are `aria-hidden` product mockups, not
 *     page copy. Editing "41,540 min" in the CMS would imply it is a real figure.
 *
 * Fixed-arity groups (`trio.cards`, `*.cards`, `impact.toggle`, `impact.groups.*`,
 * `cta.categories[].features`) are tuples: each block renders a bespoke mockup per
 * slot, so a fourth row has nowhere to go. They are bound with indexed data paths
 * rather than `editableArray`, so the Visual Editor offers text editing without
 * add/remove controls that would fail validation.
 *
 * `_inputs` this route wants (to merge into
 * collections_config.pages.schemas.platform._inputs):
 *   *.headingHtml, research.outcomes[].claimHtml,
 *   research.provenance[]                 → text, comment: "Inline HTML allowed —
 *                                            <span class=\"em\"> / <strong> / <b>."
 *   hero.subtitle, *.desc, signOn.lead    → textarea
 *   trio.cards, classroom/district/home.cards,
 *   impact.toggle, cta.categories[].features
 *                                         → array with min_items == max_items
 *                                            (3 / 3 / 2 / 2 / 3 respectively)
 *   impact.groups                         → object; its keys must match
 *                                            `impact.toggle[].id`
 *   updates.stories[].cover               → object, mesh covers only on this page
 */

/** blocks/platform/PlatformTrio.astro — one platform caption. */
const trioCard = z.object({ name: z.string(), desc: z.string() });

/** blocks/platform/FeatureSection.astro — a large visual card. `visual` selects one
 *  of FeatureVisual's bespoke mockups; it is layout, not copy. */
const featureCard = z.object({
  visual: z.enum(['immersive', 'journal', 'dashHero', 'lineChart', 'phone', 'streak']),
  label: z.string(),
  title: z.string(),
  text: z.string(),
});

/** An icon-led title + text cell. `icon` names a PlatformIcon glyph. */
const iconCell = z.object({ icon: z.string(), title: z.string(), text: z.string() });

const featureSection = z.object({
  /** Anchor id — the page's in-section links (`#classroom`) target it. */
  id: z.string(),
  eyebrow: z.string(),
  headingHtml: z.string(),
  desc: z.string(),
  cta: ctaLink,
  cards: z.tuple([featureCard, featureCard]),
  grid: z.array(iconCell).min(1),
  customer: z.object({
    badge: z.string(),
    name: z.string(),
    quote: z.string(),
    egress: ctaLink,
  }),
});

const impactStory = z.object({
  tag: z.string(),
  title: z.string(),
  theme: z.enum(['forest', 'dawn', 'dusk', 'water', 'calm', 'nature', 'space']),
});

/** blocks/platform/OutcomesExplorer.astro — one sourced outcome tab. `typ` and `ie`
 *  are indexed to a typical classroom = 100; `fig` is the headline figure. */
const explorerOutcome = z.object({
  id: z.string(),
  label: z.string(),
  statValue: z.string(),
  kicker: z.string(),
  sign: z.enum(['+', '−']),
  fig: z.number(),
  typ: z.number(),
  ie: z.number(),
  dir: z.string(),
  claimHtml: z.string(),
  src: z.string(),
});

/** blocks/newsroom/types.ts `Story`, narrowed to the mesh cover — which is all this
 *  page uses today. A photo cover would need an `image()` field; that IS available now
 *  (page schemas are factories receiving Astro's SchemaContext), so widening this to a
 *  union with a photo variant is a small change if the page ever needs one. */
const updateStory = z.object({
  id: z.union([z.number(), z.string()]),
  cat: z.enum(['case-study', 'announcement', 'article', 'research', 'press']),
  catLabel: z.string(),
  title: z.string(),
  excerpt: z.string(),
  /** ISO date (YYYY-MM-DD). Quoted in YAML so it stays a string. */
  date: z.string(),
  /** Read time in minutes. */
  read: z.number(),
  /** Popularity score — drives the newsroom's "Popular" sort. */
  pop: z.number(),
  href: z.string().optional(),
  cover: z.object({
    kind: z.literal('mesh'),
    tone: z.enum(['a', 'b', 'c']).optional(),
    eyebrow: z.string().optional(),
  }),
});

const ctaFeature = z.object({ name: z.string(), text: z.string() });

export const platformPage = (_ctx: PageSchemaContext) =>
  z.object({
    _schema: z.literal('platform'),
    ...pageBase,
    hero: z.object({
      titleLine1: z.string(),
      titleLine2: z.string(),
      subtitle: z.string(),
      primaryCta: ctaLink,
      secondaryCta: ctaLink,
    }),
    trust: z.object({
      caption: z.string(),
      egress: ctaLink,
      /** District names standing in for logo artwork. */
      logos: z.array(z.string()).min(1),
    }),
    trio: z.object({
      eyebrow: z.string(),
      headingHtml: z.string(),
      desc: z.string(),
      egress: ctaLink,
      cards: z.tuple([trioCard, trioCard, trioCard]),
    }),
    classroom: featureSection,
    district: featureSection,
    home: featureSection,
    signOn: z.object({
      eyebrow: z.string(),
      headingHtml: z.string(),
      desc: z.string(),
      cta: ctaLink,
      lead: z.string(),
      benefits: z.array(iconCell).min(1),
      signIn: z.object({ welcome: z.string(), sub: z.string(), foot: z.string() }),
    }),
    impact: z.object({
      headingHtml: z.string(),
      toggle: z.tuple([
        z.object({ id: z.string(), label: z.string() }),
        z.object({ id: z.string(), label: z.string() }),
      ]),
      /** Keyed by `toggle[].id`. */
      groups: z.record(z.string(), z.tuple([impactStory, impactStory, impactStory])),
      egress: ctaLink,
    }),
    research: z.object({
      eyebrow: z.string(),
      headingHtml: z.string(),
      desc: z.string(),
      egress: ctaLink,
      outcomes: z.array(explorerOutcome).min(1),
      /** Short credibility chips; inline HTML for the bolded fragment. */
      provenance: z.array(z.string()).min(1),
    }),
    safety: z.object({
      heading: z.string(),
      egress: ctaLink,
      cells: z.array(iconCell).min(1),
    }),
    updates: z.object({
      heading: z.string(),
      cta: ctaLink,
      stories: z.array(updateStory).min(1),
    }),
    cta: z.object({
      headingHtml: z.string(),
      primaryCta: ctaLink,
      secondaryCta: ctaLink,
      categories: z
        .array(
          z.object({
            id: z.string(),
            label: z.string(),
            features: z.tuple([ctaFeature, ctaFeature, ctaFeature]),
          }),
        )
        .min(1),
    }),
  });
