import { z } from 'zod';
import type { PageSchemaContext } from './shared';
import { ctaLink, pageBase } from './shared';

/** /districts/ — src/content/pages/districts.yml
 *
 * The site's largest route: a 14-block editorial "field report". Every photo is an
 * `image()` field, so the twelve `import photo from '…jpg'` statements the route
 * used to carry are now repo-relative paths in the YAML — the pattern `caseStudies`
 * uses.
 *
 * Left behind in src/pages/districts.astro (and in the blocks) on purpose:
 *   • the WebPage/Service JSON-LD — derived from `pageTitle`/`pageDescription`.
 *   • every string the blocks own rather than the page: "Partnered with",
 *     "Certifications & seals", "Focus the comparison" and its filter chips,
 *     "Example practices", the CASEL ring labels, "More voices", "Read the full
 *     case study". They are identical on every call site of the component.
 *   • values DERIVED from the fields above: `role.split(',')` in the voice cards,
 *     `name.toUpperCase()` in the standards panel eyebrow, `0{i+1}` counters, and
 *     `Math.round(coverage * 100)%` on the funding cards.
 *   • the second, `aria-hidden` copy of `trustStrip.districts` (the marquee is
 *     rendered twice so it can loop seamlessly) and the `aria-hidden` CASEL petals,
 *     which repeat `standards.competencies`. Binding a duplicate render would give
 *     an editor two live regions writing one path.
 *
 * Fixed-arity / duplicated lists are bound with INDEXED data paths rather than
 * `editableArray`, because an array container may hold ONLY its own rows and these
 * containers do not qualify: `trustStrip.districts` (the marquee holds both copies),
 * `implementation.steps` (the grid also holds the timeline rail),
 * `security.awards` (the pill row also holds its label), `compare.columns` (the
 * header row also holds the "Criterion" cell), `dayInside.titleLines` and
 * `voices.voices[].photo` (a second render of an array bound elsewhere). Indexed
 * paths give text editing without add/remove controls that would fail validation.
 *
 * The count-up numbers (`hero.stats[].value`, `byTheNumbers.primary.value`,
 * `byTheNumbers.small[].value`) get their own `[data-count]` host element so the
 * animation rewrites that span instead of the region's own text node.
 *
 * `_inputs` this route wants (to merge into
 * collections_config.pages.schemas.districts._inputs):
 *   hero.lede, lede.bodyHtml, fieldReports.title,
 *   byTheNumbers.title, *.titleHtml     → text, comment: "Inline HTML allowed —
 *                                          <em> / <strong>."
 *   *.intro, *.blurb, *.body, *.caption,
 *   *.quote, cta.lede, compare.shortVersion
 *                                       → textarea
 *   hero.image, fieldReports.reports[].photo, byTheNumbers.image,
 *   dayInside.parts[].photo, voices.voices[].photo, cta.image
 *                                       → image, paths relative to
 *                                         src/content/pages/
 *   funding.funding[].coverage          → number, 0–1 (rendered as a percentage)
 *   standards.competencies[].sessions,
 *   fieldReports.reports[].schools      → number
 *   compare.rows[].{ie,apps,sel,free}   → select over 'yes' | 'no' | 'partial' |
 *                                         'limited' | 'varies' | 'n/a', or free text
 *   compare.rows[].cats, compare.columns[].id, standards.competencies[].id,
 *   funding.funding[].id                → structural keys; hide or mark readonly
 *   *.kind ('sans' | 'serif'), *.tone ('default' | 'accent')
 *                                       → select; they choose a type treatment
 */

/** blocks/CinematicHero.astro + blocks/EditorialCTA.astro — one stacked headline
 *  line. `kind` picks sans vs. italic serif; `tone` adds the brand-mint accent. */
const headlineLine = z.object({
  text: z.string(),
  kind: z.enum(['sans', 'serif']),
  tone: z.enum(['default', 'accent']).optional(),
});

/** A figure + its label. `value` is animated by a count-up on scroll-in. `sub` is
 *  required: FieldReports' three-up metric row has no layout for a missing line,
 *  and every stat on this page carries one. */
const statCell = z.object({
  value: z.string(),
  label: z.string(),
  sub: z.string(),
});

/** blocks/districts/ByTheNumbers.astro — a sourced headline figure. */
const sourcedStat = z.object({
  label: z.string(),
  value: z.string(),
  unit: z.string().optional(),
  caption: z.string(),
  source: z.string(),
});

/** Heading copy shared by the lower sections. `titleHtml` carries the serif-italic
 *  <em> fragment of the brand "duet" headline, so it is sidebar-only. */
const sectionHead = {
  eyebrow: z.string(),
  titleHtml: z.string(),
  intro: z.string(),
};

/** blocks/districts/CompareTable.astro — a competitor cell. 'yes' | 'no' |
 *  'partial' | 'limited' | 'varies' | 'n/a' each render as a glyph; anything else
 *  renders as free text ("Med-High"). */
const compareCell = z.union([
  z.enum(['yes', 'no', 'partial', 'limited', 'varies', 'n/a']),
  z.string(),
]);

export const districtsPage = ({ image }: PageSchemaContext) =>
  z.object({
    _schema: z.literal('districts'),
    ...pageBase,

    /** blocks/CinematicHero.astro */
    hero: z.object({
      eyebrow: z.string(),
      serialChips: z.array(z.object({ text: z.string(), dim: z.boolean().optional() })).default([]),
      headlineLines: z.array(headlineLine).min(1),
      /** Inline HTML (<strong>) — sidebar-editable, never a text region. */
      lede: z.string(),
      image: image(),
      imageAlt: z.string(),
      primaryCta: ctaLink,
      stats: z.array(statCell).min(1),
    }),

    /** blocks/districts/EditorialLede.astro */
    lede: z.object({
      eyebrow: z.string(),
      /** Inline HTML (<em>) — sidebar-editable. */
      bodyHtml: z.string(),
      attribution: z.string(),
    }),

    /** blocks/districts/DistrictTrustStrip.astro */
    trustStrip: z.object({
      caption: z.string(),
      districts: z.array(z.string()).min(1),
    }),

    /** blocks/districts/FieldReports.astro */
    fieldReports: z.object({
      eyebrow: z.string(),
      /** Inline HTML (<em>) — sidebar-editable. */
      title: z.string(),
      intro: z.string(),
      /** Arrow link under the intro. */
      link: z.object({ label: z.string(), href: z.string() }),
      reports: z
        .array(
          z.object({
            /** Serial number, printed as "№ 01" — quoted in YAML so it keeps its zero. */
            n: z.string(),
            district: z.string(),
            schools: z.number(),
            students: z.string(),
            photo: image(),
            photoAlt: z.string(),
            photoCaption: z.string(),
            headline: z.string(),
            quote: z.string(),
            who: z.string(),
            role: z.string(),
            metrics: z.array(statCell).min(1),
            funding: z.string(),
          }),
        )
        .min(1),
    }),

    /** blocks/districts/ByTheNumbers.astro */
    byTheNumbers: z.object({
      eyebrow: z.string(),
      /** Inline HTML (<em>) — sidebar-editable. */
      title: z.string(),
      intro: z.string(),
      primary: sourcedStat,
      small: z.array(sourcedStat).min(1),
      image: image(),
      imageAlt: z.string(),
      imageCaption: z.string(),
      citations: z
        .array(
          z.object({
            label: z.string(),
            /** The italicised claim that opens the sentence `body` finishes. */
            emphasis: z.string(),
            body: z.string(),
            cite: z.string(),
          }),
        )
        .min(1),
    }),

    /** blocks/districts/DayInside.astro */
    dayInside: z.object({
      eyebrow: z.string(),
      titleLines: z.array(z.object({ text: z.string(), kind: z.enum(['sans', 'serif']) })).min(1),
      intro: z.string(),
      parts: z
        .array(
          z.object({
            time: z.string(),
            photo: image(),
            photoAlt: z.string(),
            title: z.string(),
            body: z.string(),
            practice: z.string(),
            statValue: z.string(),
            statLabel: z.string(),
          }),
        )
        .min(1),
    }),

    /** blocks/districts/VoicesSelector.astro */
    voices: z.object({
      eyebrow: z.string(),
      /** Inline HTML (<em>) — sidebar-editable. */
      title: z.string(),
      intro: z.string(),
      voices: z
        .array(
          z.object({
            quote: z.string(),
            who: z.string(),
            /** "Title, District" — the block splits on the comma for the short label. */
            role: z.string(),
            photo: image(),
            photoAlt: z.string(),
          }),
        )
        .min(1),
    }),

    /** blocks/districts/StandardsAlignment.astro */
    standards: z.object({
      ...sectionHead,
      competencies: z
        .array(
          z.object({
            /** Anchor id shared by the radial petal and its detail panel. */
            id: z.string(),
            name: z.string(),
            blurb: z.string(),
            mapped: z.array(z.string()).min(1),
            sessions: z.number(),
          }),
        )
        .min(1),
      pills: z.array(z.string()).min(1),
    }),

    /** blocks/districts/CompareTable.astro */
    compare: z.object({
      ...sectionHead,
      shortVersion: z.string(),
      columns: z
        .array(
          z.object({
            id: z.enum(['ie', 'apps', 'sel', 'free']),
            label: z.string(),
            note: z.string().optional(),
            highlight: z.boolean().optional(),
          }),
        )
        .min(1),
      rows: z
        .array(
          z.object({
            feat: z.string(),
            ie: compareCell,
            apps: compareCell,
            sel: compareCell,
            free: compareCell,
            /** Filter-chip categories: 'classroom' | 'privacy' | 'impact'. */
            cats: z.array(z.string()).min(1),
          }),
        )
        .min(1),
    }),

    /** blocks/districts/FundingGuide.astro (which also feeds ROICalculator). */
    funding: z.object({
      ...sectionHead,
      funding: z
        .array(
          z.object({
            id: z.string(),
            name: z.string(),
            fullName: z.string(),
            blurb: z.string(),
            /** Share of a typical district's cost this source covers, 0–1. */
            coverage: z.number(),
          }),
        )
        .min(1),
    }),

    /** blocks/districts/ImplementationTimeline.astro */
    implementation: z.object({
      ...sectionHead,
      steps: z.array(z.object({ week: z.string(), title: z.string(), body: z.string() })).min(1),
    }),

    /** blocks/districts/SecurityPrivacy.astro */
    security: z.object({
      ...sectionHead,
      items: z.array(z.object({ title: z.string(), body: z.string() })).min(1),
      awards: z.array(z.object({ name: z.string(), year: z.string() })).min(1),
    }),

    /** blocks/districts/FAQAccordion.astro */
    faq: z.object({
      ...sectionHead,
      items: z.array(z.object({ q: z.string(), a: z.string() })).min(1),
    }),

    /** blocks/EditorialCTA.astro */
    cta: z.object({
      eyebrow: z.string(),
      headlineLines: z.array(headlineLine).min(1),
      lede: z.string(),
      primaryCta: ctaLink,
      secondaryCta: ctaLink,
      image: image(),
      imageAlt: z.string(),
      assurances: z.array(z.object({ text: z.string() })).min(1),
      sideCard: z.object({
        eyebrow: z.string(),
        serial: z.string().optional(),
        items: z.array(z.string()).min(1),
      }),
    }),
  });
