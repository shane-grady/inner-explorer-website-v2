import type { ImageMetadata } from 'astro';

// Shared types for the newsroom story blocks (StoryCover / StoryCard / StoryGrid
// / NewsroomFilters and the page). Kept in a .ts module so the discriminated
// `Cover` union compiles cleanly (Astro frontmatter trips on multi-line
// `export type` unions) and every block imports from one source.

export type Category = 'case-study' | 'announcement' | 'article' | 'research' | 'press';

export type Cover =
  | { kind: 'photo'; photo: ImageMetadata }
  | { kind: 'mesh'; tone?: 'a' | 'b' | 'c'; eyebrow?: string }
  | { kind: 'compass'; eyebrow?: string }
  | { kind: 'quote'; quote: string; tone?: 'a' | 'b' }
  | { kind: 'stat'; value: string; unit: string; tone?: 'a' | 'b' }
  | { kind: 'report'; label: string; year: string }
  | { kind: 'award'; year: string };

export interface Story {
  id: number | string;
  cat: Category;
  catLabel: string;
  title: string;
  excerpt: string;
  /** ISO date (YYYY-MM-DD). */
  date: string;
  /** Read time in minutes. */
  read: number;
  /** Popularity score — drives the "Popular" sort. */
  pop: number;
  /** Link target (placeholder '#' until real articles exist). */
  href?: string;
  cover: Cover;
}
