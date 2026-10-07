/**
 * Component library registry — the hand-maintained half of /styleguide/components.
 *
 * The drift SCORE is measured automatically at build time (src/lib/component-health.ts),
 * so most components need no entry here. Add an entry only to:
 *   • sign off a component after review (`status` overrides the auto score), or
 *   • leave a note for whoever picks it up next.
 * Keys are paths relative to src/components, e.g. 'blocks/StatStrip.astro'.
 *
 * When you consolidate a family, delete the retired members' files and trim `members`.
 */

export type HealthStatus = 'good' | 'minor' | 'major';

export interface ComponentOverride {
  status?: HealthStatus;
  note?: string;
}

export interface ComponentFamily {
  name: string;
  /** The shared component every member should fold into. */
  target: string;
  members: string[];
}

export const overrides: Record<string, ComponentOverride> = {
  'primitives/Button.astro': { note: 'Reference implementation — tailwind-variants, tokens only.' },
  'blocks/CTABanner.astro': { note: 'Clean base for the CTA family; extend its variants.' },
  'blocks/platform/PlatformHero.astro': {
    note: '~1,250 lines of scoped CSS. Split before any reuse.',
  },
};

export const families: ComponentFamily[] = [
  {
    name: 'CTA bands',
    target: 'CTABanner with tone + layout variants',
    members: [
      'blocks/CTABanner.astro',
      'blocks/GlowCTA.astro',
      'blocks/SplitCTA.astro',
      'blocks/EditorialCTA.astro',
      'blocks/about/AboutCTA.astro',
      'blocks/home/BringItCTA.astro',
      'blocks/platform/PlatformCTA.astro',
      'blocks/research/ResearchCTA.astro',
      'blocks/series/SeriesCTA.astro',
    ],
  },
  {
    name: 'Quotes & testimonials',
    target: 'One Quote block: inline, photo and row layouts',
    members: [
      'blocks/PullQuote.astro',
      'blocks/EditorialQuote.astro',
      'blocks/PhotoQuote.astro',
      'blocks/QuoteRow.astro',
      'blocks/Testimonials.astro',
      'blocks/about/MissionQuote.astro',
      'blocks/series/SeriesTestimonial.astro',
    ],
  },
  {
    name: 'Stat strips',
    target: 'StatStrip with size + surface variants',
    members: [
      'blocks/StatStrip.astro',
      'blocks/series/StatsBand.astro',
      'blocks/research/charts/StatBand.astro',
      'blocks/districts/ByTheNumbers.astro',
      'blocks/blog/ArticleStats.astro',
    ],
  },
  {
    name: 'FAQ & accordions',
    target: 'One Accordion primitive, composed by FAQSection',
    members: [
      'blocks/FAQSection.astro',
      'blocks/districts/FAQAccordion.astro',
      'blocks/help/Accordion.astro',
      'blocks/support/FAQSidebar.astro',
    ],
  },
  {
    name: 'Timelines',
    target: 'Timeline block, vertical + horizontal',
    members: [
      'blocks/about/Timeline.astro',
      'blocks/case-study/Timeline.astro',
      'blocks/districts/ImplementationTimeline.astro',
    ],
  },
  {
    name: 'Section heads',
    target: 'SectionHeader block (eyebrow, title, lede)',
    members: [
      'blocks/platform/SectionHead.astro',
      'blocks/series/SeriesSectionHead.astro',
      'blocks/EditorialMasthead.astro',
    ],
  },
];
