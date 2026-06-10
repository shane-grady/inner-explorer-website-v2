import type { ImageMetadata } from 'astro';

// Shared types for the case-study blocks (CaseStudyHero / StoryBlock / Pillars /
// Timeline / ResultsBand / CaseStudyVoices / PhotoMosaic) and the
// `case-studies/[slug]` route. The "at a glance" stats band beneath the hero reuses
// the shared `StatStrip` (the About-page stats component), fed `district.snapshot`
// (a `ValueLabel[]`). Kept in a plain `.ts` module so the types compile
// cleanly — Astro frontmatter trips on multi-line `export type` unions (see
// tasks/lessons.md) — and every block imports from one source.
//
// These interfaces mirror the `caseStudies` Zod schema in `content.config.ts`. The
// collection's `image()` fields resolve to `ImageMetadata`, so blocks receive real
// optimizable images, not URL strings.

/** A small value/label pair (snapshot cells, editorial stat chips, voice stats). */
export interface ValueLabel {
  value: string;
  label: string;
}

/** Approach "pillar" — a crafted card with an iconed chip + serif index. */
export type PillarIcon = 'play' | 'repeat' | 'chart' | 'calendar' | 'palette' | 'heart' | 'compass';
export interface Pillar {
  icon: PillarIcon;
  title: string;
  text: string;
}

/** Bar-chart tones map to tokens, not data: muted = baseline bars, brand = outcome
 *  bars, accent = a noteworthy aside (e.g. "during COVID"). */
export type ChartTone = 'muted' | 'brand' | 'accent';
export interface ChartBar {
  label: string;
  value: number;
}
export interface ChartGroup {
  label: string;
  tone: ChartTone;
  bars: ChartBar[];
}
/** The optional grouped bar chart rendered after the results band. */
export interface ResultsChartData {
  title: string;
  subtitle?: string;
  foot?: string;
  sourceId?: number;
  groups: ChartGroup[];
}

/** One phase in the rollout timeline. */
export interface TimelinePhase {
  date: string;
  tag: string;
  title: string;
  text: string;
}

/** A single outcome metric. `trend` drives the ↑/↓ glyph; `sourceId` footnotes it. */
export interface Metric {
  value: string;
  unit?: string;
  label: string;
  trend?: 'up-good' | 'down-good';
  sourceId?: number;
}

/** A footnoted reference; metrics point here by `id`. `href` links the citation
 *  to its public source (DOI, agency page) and renders it as an anchor. */
export interface Source {
  id: number;
  text: string;
  href?: string;
}

/** A testimonial "voice". A `portrait` promotes it to a featured card; without one
 *  it renders as a compact student card. `stat` adds an outcome figure to a feature. */
export interface Voice {
  kind: string;
  quote: string;
  name: string;
  role: string;
  org?: string;
  portrait?: ImageMetadata;
  portraitAlt?: string;
  stat?: ValueLabel;
}

/** A gallery photo. */
export interface GalleryImage {
  src: ImageMetadata;
  alt: string;
}
