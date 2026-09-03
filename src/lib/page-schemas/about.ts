import { z } from 'zod';
import type { PageSchemaContext } from './shared';
import { pageBase } from './shared';

/** /about/ — src/content/pages/about.yml (drives src/pages/about.astro)
 *
 * All 22 photographic imports moved into the entry as `image()` fields, so an editor
 * can swap any of them from CloudCannon. Left behind in the route on purpose:
 *   • the AboutPage / Organization JSON-LD — derived from `pageTitle`, `Astro.site`
 *     and facts (founding date, founders) that are legal identity, not page copy.
 *   • `<StatStrip numStyle>` / `<TeamGrid variant>` and the other presentation props.
 *
 * Sidebar-only (deliberately NOT bound to a visual region):
 *   • every `*Html` field — a text region strips the inline `<span class="accent">`,
 *     `<b>` and `<em>` markup these carry.
 *   • `origin.paragraphs` and `timeline.railYears` — plain scalar arrays have no
 *     per-row field to address, and a region must resolve to a string.
 *
 * `_inputs` this route wants (to merge into
 * collections_config.pages.schemas.about._inputs):
 *   hero, mission, origin, timeline, pioneer,
 *   voices, team, partners, principles, cta  → type: object
 *   *.headingHtml, mission.quoteHtml,
 *   timeline.entries[].pullHtml,
 *   pioneer.studies[].findHtml               → type: text, comment: "Inline HTML allowed."
 *   hero.subtitle, *.lede, *.meta,
 *   origin.paragraphs, principles.items[].body,
 *   timeline.entries[].body, voices.items[].quote → type: textarea
 *   stats                 → array, structures: _structures.page_about_stat
 *   timeline.entries      → array, structures: _structures.page_about_timeline_entry
 *   pioneer.studies       → array, structures: _structures.page_about_study
 *   voices.items          → array, structures: _structures.page_about_voice
 *   team.people           → array, structures: _structures.page_about_person
 *   partners.items        → array, structures: _structures.page_about_partner
 *   principles.items      → array, structures: _structures.page_about_principle
 *   timeline.railYears    → array of number; keep it in lockstep with `entries[].year`
 */

type ImageFn = PageSchemaContext['image'];

const optionalImage = (image: ImageFn) =>
  z.preprocess((value) => (value === '' || value === null ? undefined : value), image().optional());

/** A photo with its own alt text (blocks/about/OriginStory.astro `Photo`). */
const photo = (image: ImageFn) => z.object({ src: image(), alt: z.string() });

/** blocks/about/Timeline.astro `Entry`. `year` is what the year rail matches on, so
 *  it must stay in the set declared by `timeline.railYears`. */
const timelineEntry = (image: ImageFn) =>
  z.object({
    year: z.number(),
    highlight: z.boolean().optional(),
    node: z.object({ yr: z.string(), sub: z.string() }),
    tag: z.object({
      label: z.string(),
      variant: z.enum(['milestone', 'research', 'partner', 'global']),
    }),
    title: z.string(),
    body: z.string(),
    /** Inline HTML — e.g. '<b>3</b> classrooms'. */
    pullHtml: z.string().optional(),
    image: z.object({ src: image(), alt: z.string(), caption: z.string() }).optional(),
  });

/** blocks/about/Voices.astro `Voice`. `avatar`'s alt is derived from `name`, and the
 *  featured `bg` is decorative (alt=''), so neither carries an alt field. */
const voice = (image: ImageFn) =>
  z.object({
    featured: z.boolean().optional(),
    bg: optionalImage(image),
    quote: z.string(),
    name: z.string(),
    role: z.string(),
    avatar: image(),
  });

/** blocks/TeamGrid.astro `Person`. `photo` stays optional — the block renders a
 *  placeholder when it is absent, so clearing one in the CMS must not fail the build. */
const person = (image: ImageFn) =>
  z.object({
    name: z.string(),
    role: z.string(),
    location: z.string().optional(),
    pin: z.string().optional(),
    founder: z.boolean().optional(),
    photo: optionalImage(image),
  });

/** The about page's buttons. Deliberately not `shared.ts`'s `ctaLink`: none of these
 *  blocks read a `variant`, and an unused select would just be noise in the editor. */
const link = z.object({ label: z.string(), href: z.string() });

export const aboutPage = ({ image }: PageSchemaContext) =>
  z.object({
    _schema: z.literal('about'),
    ...pageBase,
    hero: z.object({
      eyebrow: z.string(),
      headlineTop: z.string(),
      headlineBottom: z.string(),
      subtitle: z.string(),
      image: image(),
      imageAlt: z.string(),
      meta: z.array(z.object({ label: z.string(), value: z.string() })).min(1),
    }),
    /** Key name is fixed: blocks/StatStrip.astro binds its array region to `stats`. */
    stats: z
      .array(
        z.object({
          value: z.string(),
          sup: z.string().optional(),
          label: z.string(),
          sub: z.string().optional(),
        }),
      )
      .min(1),
    mission: z.object({
      /** The Inner Explorer compass mark. Decorative (alt=''), so it has no region. */
      mark: image(),
      quoteHtml: z.string(),
      attribution: z.string(),
    }),
    origin: z.object({
      eyebrow: z.string(),
      headingHtml: z.string(),
      paragraphs: z.array(z.string()).min(1),
      signed: z.object({ initials: z.string(), name: z.string(), role: z.string() }),
      large: photo(image),
      small: photo(image),
      chip: z.object({ quote: z.string(), source: z.string() }),
    }),
    timeline: z.object({
      eyebrow: z.string(),
      headingHtml: z.string(),
      lede: z.string(),
      railYears: z.array(z.number()).min(1),
      entries: z.array(timelineEntry(image)).min(1),
    }),
    pioneer: z.object({
      eyebrow: z.string(),
      headingHtml: z.string(),
      lede: z.string(),
      stats: z.array(z.object({ n: z.string(), l: z.string() })).min(1),
      studies: z
        .array(
          z.object({
            yr: z.string(),
            pub: z.string(),
            title: z.string(),
            /** Inline HTML — the finding highlights a figure with <b>. */
            findHtml: z.string(),
          }),
        )
        .min(1),
    }),
    voices: z.object({
      eyebrow: z.string(),
      headingHtml: z.string(),
      meta: z.string(),
      items: z.array(voice(image)).min(1),
    }),
    /** Key names are fixed: blocks/TeamGrid.astro binds `people` and `cta.label`. */
    team: z.object({
      eyebrow: z.string(),
      headingHtml: z.string(),
      meta: z.string(),
      note: z.string(),
      cta: link,
      people: z.array(person(image)).min(1),
    }),
    partners: z.object({
      eyebrow: z.string(),
      heading: z.string(),
      items: z.array(z.object({ name: z.string(), sub: z.string() })).min(1),
    }),
    principles: z.object({
      eyebrow: z.string(),
      headingHtml: z.string(),
      items: z.array(z.object({ num: z.string(), title: z.string(), body: z.string() })).min(1),
    }),
    cta: z.object({
      eyebrow: z.string(),
      headingHtml: z.string(),
      lede: z.string(),
      image: image(),
      imageAlt: z.string(),
      primary: link,
      secondary: link,
    }),
  });
