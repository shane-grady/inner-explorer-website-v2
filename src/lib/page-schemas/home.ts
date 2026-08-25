import { z } from 'zod';
import type { PageSchemaContext } from './shared';
import { pageBase } from './shared';

/** / — src/content/pages/home.yml (drives src/pages/index.astro)
 *
 * The homepage owns a pinned, scroll-scrubbed intro stage
 * (blocks/intro/IntroScroll.astro → IntroStage.astro). Only its COPY lives here; the
 * progress maths, the SVG path draw, the Lenis controller, and every `data-*` hook the
 * controller queries stay in the components.
 *
 * Left behind in src/pages/index.astro on purpose:
 *   • the WebPage/Service JSON-LD — derived from pageTitle/pageDescription.
 *   • the intro stage's hero photograph — a build-time import inside IntroStage, sized
 *     and art-directed for the pin; it is not a swappable content image. Its `imageAlt`
 *     IS here (sidebar-only: an image region needs a `src` field to pair with).
 *   • the mosaic photo field in LiveNow (`import.meta.glob` over the mosaic folder),
 *     the deterministic waveform/canopy geometry, and the trend-bar opacities.
 *
 * NOT visually editable (sidebar only), and why:
 *   • whyNow.manifesto — rendered as one <span> PER WORD for the word-by-word light-up.
 *     A text region would flatten those spans and kill the effect. Same call as
 *     `research.ts` / `hero.lines`.
 *   • liveNow.captions — a rotator rewrites that node's textContent on a timer, so a
 *     region there would fight the script. The array is sidebar-editable.
 *   • proof.hero.display and proof.support[].display — the count-up script rewrites
 *     those nodes' textContent on scroll-in, so a region there would fight it. Their
 *     captions ARE regions; the figures stay sidebar-editable next to `count`.
 *   • stories.portraits — decorative canopy photography (aria-hidden, empty alt).
 *     stories.statCards bind by INDEX rather than as an array: the canopy has fixed
 *     slots (.s1–.s4) and slices to length, so add/remove controls would offer rows
 *     the layout cannot place.
 *   • funding.* — blocks/home/Funding.astro is ALSO used by /districts/, which is not
 *     CMS-backed yet, so the block stays free of editable plumbing. Thread
 *     `editablePrefix="funding"` through it when /districts/ converts.
 *   • intro.cta.href and every other href, proof.trend, proof.*.count, gradeBands tones,
 *     dashboard fill ratios, sample.durationSec — numbers and URLs, not text regions.
 *
 * `_inputs` this route wants (to merge into
 * collections_config.pages.schemas.home._inputs):
 *   intro, liveNow, whyNow, audiences,       → type: object, preview icons
 *   howItWorks, gradeBands, proof, stories,
 *   sample, funding, bringIt
 *   whyNow.manifesto, proof.intro,           → type: textarea
 *   funding.intro, sample.disclaimer,
 *   audiences.*.body, bringIt.body,
 *   stories.body, intro.lede
 *   liveNow.captions, audiences.*.points,    → type: array of text
 *   bringIt.pills
 *   *.image                                  → type: image (repo-relative path)
 *   howItWorks.steps[].icon                  → select: choose | play | reflect
 *   proof.pills[].icon                       → select: check | star | shield
 *   stories.statCards[].tone                 → select: brand | card
 *   gradeBands.bands[].tone                  → number 0–3, comment: "Green ramp depth."
 *   proof.trend, proof.*.count,              → number; hide — these restate the chart
 *   audiences.district.dashboard.rows[].fill    and the count-up targets
 *   sample.audioSrc / captionsSrc            → text, comment: "Path under /public."
 * `_structures` this route wants:
 *   page_home_stats        → { value, sup?, label }        (liveNow.stats)
 *   page_home_why_stats    → { value, body }               (whyNow.stats)
 *   page_home_steps        → { time, n, title, body, icon } (howItWorks.steps)
 *   page_home_bands        → { grade, title, body, href, tone }
 *   page_home_count_stats  → { display, count, suffix?, caption } (proof.support)
 *   page_home_pills        → { label, icon }               (proof.pills)
 *   page_home_stat_cards   → { value, label, tone }        (stories.statCards)
 *   page_home_portraits    → { image, alt }                (stories.portraits)
 *   page_home_funding_cards→ { title, body }               (funding.cards)
 */

/** A button. Home's blocks take a bare {label, href} — no variant. */
const cta = z.object({ label: z.string(), href: z.string() });

/** The two halves of a "duet" section head: sans lead + serif-italic accent. */
const sectionHead = {
  eyebrow: z.string(),
  headingLead: z.string(),
  headingAccent: z.string(),
};

/** blocks/home/Proof.astro — a figure that counts up on scroll-in. `display` is the
 *  final, formatted string (and what no-JS/SEO sees); `count` is the numeric target. */
const countStat = z.object({
  display: z.string(),
  count: z.number(),
  suffix: z.string().optional(),
  caption: z.string(),
});

/** blocks/home/AudienceToggle.astro — one side of the educator/district toggle. */
const audiencePanel = {
  heading: z.string(),
  body: z.string(),
  points: z.array(z.string()).min(1),
  cta,
};

export const homePage = ({ image }: PageSchemaContext) =>
  z.object({
    _schema: z.literal('home'),
    ...pageBase,

    /** blocks/intro/IntroScroll.astro — the pinned scroll-scrubbed splash. `problem`
     *  and `solution` are the Balance toggle's off/on states; they are NOT named
     *  `off`/`on` because YAML 1.1 parsers read those keys as booleans. */
    intro: z.object({
      headline: z.string(),
      lede: z.string(),
      cta,
      imageAlt: z.string(),
      balanceLabel: z.string(),
      problem: z.object({ title: z.string(), body: z.string() }),
      solution: z.object({ title: z.string(), body: z.string() }),
    }),

    /** blocks/home/LiveNow.astro */
    liveNow: z.object({
      ...sectionHead,
      /** Rotating "right now, somewhere" lines; the first is server-rendered. */
      captions: z.array(z.string()).min(1),
      stats: z
        .array(
          z.object({
            value: z.string(),
            /** Accent suffix rendered in brand green, e.g. "+", "min". */
            sup: z.string().optional(),
            label: z.string(),
          }),
        )
        .min(1),
    }),

    /** blocks/home/WhyNow.astro */
    whyNow: z.object({
      eyebrow: z.string(),
      manifesto: z.string(),
      stats: z.array(z.object({ value: z.string(), body: z.string() })).min(1),
    }),

    /** blocks/home/AudienceToggle.astro */
    audiences: z.object({
      ...sectionHead,
      educator: z.object({
        ...audiencePanel,
        card: z.object({
          title: z.string(),
          meta: z.string(),
          image: image(),
          imageAlt: z.string(),
        }),
      }),
      district: z.object({
        ...audiencePanel,
        dashboard: z.object({
          title: z.string(),
          delta: z.string(),
          funnelLabel: z.string(),
          /** `fill` is the bar width, 0–1. */
          rows: z
            .array(z.object({ label: z.string(), value: z.string(), fill: z.number() }))
            .min(1),
          stats: z.array(z.object({ value: z.string(), label: z.string() })).min(1),
        }),
      }),
    }),

    /** blocks/home/HowItWorks.astro */
    howItWorks: z.object({
      ...sectionHead,
      steps: z
        .array(
          z.object({
            time: z.string(),
            /** Display ordinal, e.g. "01" — quoted in YAML so it keeps its zero. */
            n: z.string(),
            title: z.string(),
            body: z.string(),
            icon: z.enum(['choose', 'play', 'reflect']),
          }),
        )
        .min(1),
    }),

    /** blocks/home/GradeBands.astro */
    gradeBands: z.object({
      ...sectionHead,
      bands: z
        .array(
          z.object({
            grade: z.string(),
            title: z.string(),
            body: z.string(),
            href: z.string(),
            /** 0 = lightest (Pre-K) → 3 = deepest (9–12). Drives the green ramp. */
            tone: z.number(),
          }),
        )
        .min(1),
    }),

    /** blocks/home/Proof.astro */
    proof: z.object({
      ...sectionHead,
      intro: z.string(),
      hero: countStat.extend({ source: z.string() }),
      trendLabel: z.string(),
      /** Bar heights as percentages, high → low. Last bar is the "peak". */
      trend: z.array(z.number()).min(1),
      support: z.array(countStat).min(1),
      pills: z
        .array(z.object({ label: z.string(), icon: z.enum(['check', 'star', 'shield']) }))
        .min(1),
    }),

    /** blocks/home/Stories.astro. The canopy portraits are decorative (the canopy is
     *  aria-hidden), so their `alt` is intentionally an empty string. */
    stories: z.object({
      badge: z.string(),
      headlineTop: z.string(),
      headlineBottom: z.string(),
      body: z.string(),
      cta,
      portraits: z.array(z.object({ image: image(), alt: z.string() })).min(1),
      statCards: z
        .array(z.object({ value: z.string(), label: z.string(), tone: z.enum(['brand', 'card']) }))
        .min(1),
    }),

    /** blocks/home/SampleListen.astro — audio paths point at /public/audio. */
    sample: z.object({
      ...sectionHead,
      body: z.string(),
      disclaimer: z.string(),
      audioSrc: z.string(),
      captionsSrc: z.string().optional(),
      durationSec: z.number(),
      trackTitle: z.string(),
      trackEyebrow: z.string(),
    }),

    /** blocks/home/Funding.astro — shared with /districts/, so sidebar-only for now. */
    funding: z.object({
      ...sectionHead,
      intro: z.string(),
      cards: z.array(z.object({ title: z.string(), body: z.string() })).min(1),
    }),

    /** blocks/home/BringItCTA.astro */
    bringIt: z.object({
      eyebrow: z.string(),
      headingTop: z.string(),
      headingBottom: z.string(),
      body: z.string(),
      primaryCta: cta,
      secondaryCta: cta.optional(),
      pills: z.array(z.string()).min(1),
      chip: z.object({ title: z.string(), sub: z.string() }),
      image: image(),
      imageAlt: z.string(),
    }),
  });
