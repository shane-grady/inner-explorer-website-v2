import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'zod';

// Content lives in the repo as type-safe collections (the Content Layer API).
// This IS the CMS seam: a future admin reads/writes these same schema-validated
// files, so moving to a CMS later is low-effort. Edit content here for now.

const blog = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/blog' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      pubDate: z.coerce.date(),
      updatedDate: z.coerce.date().optional(),
      // Attribution is the Inner Explorer brand, not a person (used for JSON-LD
      // author = Organization). No visible personal byline on the article.
      author: z.string().default('Inner Explorer'),
      // Article template fields (all optional — the page degrades gracefully when
      // absent, so plain `.md` posts still render). `category` drives the hero pill
      // + breadcrumb; `heroCaption` is the photo-credit pill overlaid on the hero
      // image; `readingTime` overrides the value computed from the body word count.
      // `titleHtml` is an optional headline with a serif-italic <em> fragment (the
      // brand "duet" look); the plain `title` is still the source of truth for SEO.
      titleHtml: z.string().optional(),
      category: z.string().optional(),
      heroImage: image().optional(),
      heroImageAlt: z.string().optional(),
      heroCaption: z.string().optional(),
      readingTime: z.string().optional(),
      tags: z.array(z.string()).default([]),
      draft: z.boolean().default(false),
    }),
});

const testimonials = defineCollection({
  loader: glob({ pattern: '**/*.{json,yaml,yml}', base: './src/content/testimonials' }),
  schema: z.object({
    quote: z.string(),
    name: z.string(),
    role: z.string(),
    org: z.string().optional(),
    order: z.number().default(0),
  }),
});

// Narrators — the voices who guide Inner Explorer's audio practices. Drives
// BOTH the D2 "Meet the Studio" collection page (src/pages/narrators/index.astro)
// AND the C2 photo detail pages (src/pages/narrators/[slug].astro).
// The schema is the unified CMS seam: detail-page fields stay optional so a
// narrator can exist on the wall before their full profile is authored.
const narrators = defineCollection({
  loader: glob({ pattern: '**/*.{json,yaml,yml}', base: './src/content/narrators' }),
  schema: ({ image }) =>
    z.object({
      // Required identity
      name: z.string(),
      role: z.string(),
      order: z.number().default(0),
      draft: z.boolean().default(false),

      // Photography (photo drives wall + detail-page card; photoWide is the
      // 21:9 editorial hero used by PhotoQuote on the detail page).
      photo: image().optional(),
      photoWide: image().optional(),
      photoAlt: z.string().optional(),
      location: z.string().optional(),

      // Detail-page editorial content (all optional — sections hide when absent
      // so narrators with only wall data still render a coherent page).
      intro: z.string().optional(),
      quote: z.object({ text: z.string(), attrib: z.string().optional() }).optional(),
      voiceIntro: z
        .object({
          audioSrc: z.string(),
          durationSec: z.number(),
          title: z.string(),
          transcriptHref: z.string().optional(),
          captionsSrc: z.string().optional(),
        })
        .optional(),
      facts: z.array(z.object({ value: z.string(), label: z.string() })).default([]),
      qa: z
        .array(
          z.object({
            n: z.string().optional(),
            question: z.string(),
            answer: z.string(),
            tag: z.string().optional(),
          }),
        )
        .default([]),
      practices: z
        .array(z.object({ title: z.string(), meta: z.string(), image: image().optional() }))
        .default([]),

      // Wall-only metadata for the D2 collection page (NarratorCard surfaces
      // language chips, "Since X · N practices recorded", and a "New" pin).
      langs: z.array(z.string()).default([]),
      since: z.number().int().optional(),
      practiceCount: z.number().int().default(0),
      isNew: z.boolean().default(false),
    }),
});

// Case studies — district success stories. ONE schema-validated file per district
// (src/content/case-studies/<slug>.yaml) drives the whole `case-studies/[slug]` page,
// so a new story = a new data file, no markup. Mirrors the prototype's `window.CASE_STUDY`
// content object. `image()` localizes + optimizes every photo. This is the CMS seam.
const caseStudies = defineCollection({
  loader: glob({ pattern: '**/*.{json,yaml,yml}', base: './src/content/case-studies' }),
  schema: ({ image }) => {
    const metric = z.object({
      value: z.string(),
      unit: z.string().optional(),
      label: z.string(),
      trend: z.enum(['up-good', 'down-good']).optional(),
      sourceId: z.number().optional(),
    });
    const valueLabel = z.object({ value: z.string(), label: z.string() });
    const cta = z.object({ label: z.string(), href: z.string() });
    // Grouped bar chart rendered after the results band. `tone` is a token
    // vocabulary, not data: muted = baseline bars, brand = outcome bars, accent =
    // a noteworthy aside. `valueSuffix` annotates on-bar values (e.g. '%').
    const chart = z.object({
      title: z.string(),
      subtitle: z.string().optional(),
      foot: z.string().optional(),
      sourceId: z.number().optional(),
      valueSuffix: z.string().optional(),
      groups: z
        .array(
          z.object({
            label: z.string(),
            tone: z.enum(['muted', 'brand', 'accent']).default('brand'),
            bars: z.array(z.object({ label: z.string(), value: z.number() })).min(1),
          }),
        )
        .min(1),
    });

    return z.object({
      draft: z.boolean().default(false),
      order: z.number().default(0),

      // SEO (optional — falls back to meta copy + today's date on the page).
      seoTitle: z.string().optional(),
      seoDescription: z.string().optional(),
      publishedDate: z.coerce.date().optional(),
      updatedDate: z.coerce.date().optional(),

      meta: z.object({
        kicker: z.string(),
        // Duet headline: `titleLead` renders sans, `titleEmphasis` serif-italic.
        titleLead: z.string(),
        titleEmphasis: z.string(),
        dek: z.string(),
        readingTime: z.string().optional(),
        published: z.string().optional(),
        heroImage: image(),
        heroImageAlt: z.string(),
      }),

      district: z.object({
        name: z.string(),
        shortName: z.string(),
        location: z.string(),
        seal: image().optional(),
        partnerSince: z.string().optional(),
        snapshot: z.array(valueLabel).default([]),
      }),

      intro: z.object({
        challenge: z.object({
          eyebrow: z.string(),
          heading: z.string(),
          body: z.array(z.string()),
          image: image(),
          imageAlt: z.string(),
          stat: valueLabel.optional(),
        }),
        approach: z.object({
          eyebrow: z.string(),
          heading: z.string(),
          body: z.array(z.string()),
          image: image(),
          imageAlt: z.string(),
          pillars: z
            .array(
              z.object({
                icon: z
                  .enum(['play', 'repeat', 'chart', 'calendar', 'palette', 'heart', 'compass'])
                  .default('play'),
                title: z.string(),
                text: z.string(),
              }),
            )
            .default([]),
        }),
      }),

      timeline: z.object({
        eyebrow: z.string(),
        heading: z.string(),
        phases: z.array(
          z.object({
            date: z.string(),
            tag: z.string(),
            title: z.string(),
            text: z.string(),
          }),
        ),
      }),

      metrics: z.object({
        eyebrow: z.string(),
        heading: z.string(),
        note: z.string().optional(),
        featured: metric,
        grid: z.array(metric).default([]),
      }),
      // Optional grouped bar chart(s) rendered after the results band. `chart` is
      // the single-figure form (e.g. the Webb School restraints-by-year figure);
      // `charts` renders several figures in sequence (e.g. Goddard's per-subject
      // assessment comparisons). Both are optional and compose.
      chart: chart.optional(),
      charts: z.array(chart).optional(),
      // `href` links a citation to its public source (DOI, agency page) — linked,
      // verifiable sources are an E-E-A-T/AI-citation signal, not just a footnote.
      sources: z
        .array(z.object({ id: z.number(), text: z.string(), href: z.string().url().optional() }))
        .default([]),

      voicesIntro: z.object({
        eyebrow: z.string(),
        headingLead: z.string(),
        headingEmphasis: z.string(),
        trustRating: z.string().optional(),
        trustLine: z.string().optional(),
        studentsLabel: z.string().optional(),
      }),
      // A voice with a `portrait` renders as a featured card; without one, a student card.
      voices: z
        .array(
          z.object({
            kind: z.string(),
            quote: z.string(),
            name: z.string(),
            role: z.string(),
            org: z.string().optional(),
            portrait: image().optional(),
            portraitAlt: z.string().optional(),
            stat: valueLabel.optional(),
          }),
        )
        .default([]),

      gallery: z.object({
        eyebrow: z.string(),
        heading: z.string(),
        images: z.array(z.object({ src: image(), alt: z.string() })).default([]),
        // Optional disclosure under the grid — required when imagery is
        // representative (e.g. AI-generated stand-ins) rather than documentary.
        note: z.string().optional(),
      }),

      // Optional FAQ — real buyer questions answered from the story's established
      // facts; rendered with the shared FAQAccordion (plain-text answers only).
      faq: z
        .object({
          eyebrow: z.string().default('FAQ'),
          titleHtml: z.string(),
          intro: z.string(),
          items: z.array(z.object({ q: z.string(), a: z.string() })).min(1),
        })
        .optional(),

      cta: z.object({
        heading: z.string(),
        headingEmphasis: z.string(),
        body: z.string(),
        primary: cta,
        secondary: cta.optional(),
      }),
    });
  },
});

// Series — supplemental practice series (Educator Well-Being, School Safety, …).
// ONE file per series (src/content/series/<slug>.yaml) drives the whole
// `/series/[slug]` page — a new series = a new data file, no markup changes.
// Mirrors the Claude Design prototype's `IE_SERIES` data map. `tone` selects a
// preset accent palette defined in global.css (`[data-series-tone]`), so colors
// stay in the token file, not in content.
const seriesIcon = z.enum([
  'clock',
  'headphones',
  'home',
  'users',
  'globe',
  'presentation',
  'lifebuoy',
  'compass',
  'play',
  'map-pin',
  'wind',
  'focus',
  'sparkles',
  'repeat',
  'shield',
  'graduation-cap',
  'heart',
  'message-circle',
  'rewind',
  'heart-handshake',
  'sprout',
  'sun',
  'tent',
  'palette',
  'star',
  'award',
  'flask',
]);

const series = defineCollection({
  loader: glob({ pattern: '**/*.{json,yaml,yml}', base: './src/content/series' }),
  schema: ({ image }) => {
    const cta = z.object({ label: z.string(), href: z.string() });
    const iconCard = z.object({ icon: seriesIcon, title: z.string(), body: z.string() });

    return z.object({
      draft: z.boolean().default(false),
      order: z.number().default(0),

      // Identity. `name` is the full series name ("Educator Well-Being Series");
      // `shortName` is the masthead centerpiece ("Educator Well-Being").
      name: z.string(),
      shortName: z.string(),
      category: z.string().default('Supplemental Series'),
      tone: z.enum(['sage', 'teal', 'slate', 'gold']).default('sage'),

      // SEO (optional — falls back to name + hero lede).
      seoTitle: z.string().optional(),
      seoDescription: z.string().optional(),

      // Immersive hero. Duet headline: `duetTop` sans-bold, `duetBottom` serif-italic.
      hero: z.object({
        duetTop: z.string(),
        duetBottom: z.string(),
        lede: z.string(),
        image: image(),
        imageAlt: z.string(),
        primaryCta: cta,
        secondaryCta: cta.optional(),
      }),

      // At-a-glance bar under the hero (5 icon facts).
      glance: z.array(z.object({ icon: seriesIcon, label: z.string(), value: z.string() })),

      audience: z.object({
        eyebrow: z.string().default("Who it's for"),
        heading: z.string(),
        intro: z.string().optional(),
        cards: z.array(iconCard),
      }),

      stats: z.object({
        eyebrow: z.string().default('Why it matters'),
        heading: z.string(),
        intro: z.string().optional(),
        items: z.array(z.object({ value: z.string(), label: z.string() })),
        footnote: z.string().optional(),
      }),

      practices: z.object({
        eyebrow: z.string().default('Inside the series'),
        heading: z.string(),
        intro: z.string().optional(),
        items: z.array(
          z.object({
            title: z.string(),
            theme: z.string(),
            duration: z.string(),
            image: image(),
            blurb: z.string(),
          }),
        ),
      }),

      how: z.object({
        eyebrow: z.string().default('How it works'),
        heading: z.string(),
        steps: z.array(iconCard),
      }),

      benefits: z.object({
        eyebrow: z.string().default('The benefit'),
        heading: z.string(),
        items: z.array(iconCard),
      }),

      // Immersive sample-practice card. The player simulates playback until a
      // real `audioSrc` asset exists (then SamplePractice can wire real audio).
      sample: z.object({
        eyebrow: z.string().default('Try it now'),
        title: z.string(),
        theme: z.string(),
        duration: z.string(),
        narrator: z.string(),
        description: z.string(),
        image: image(),
      }),

      testimonial: z.object({
        quote: z.string(),
        name: z.string(),
        role: z.string(),
        place: z.string().optional(),
      }),

      cta: z.object({
        duetTop: z.string(),
        duetBottom: z.string(),
        body: z.string(),
        primary: cta,
        secondary: cta.optional(),
      }),
    });
  },
});

export const collections = { blog, testimonials, narrators, caseStudies, series };
