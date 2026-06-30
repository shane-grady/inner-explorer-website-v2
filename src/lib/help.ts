// Help Center navigation model. The article *content* lives in the `help` content
// collection (src/content/help/*.mdx); this file defines the audience GROUPS and the
// helpers that turn a flat list of articles into the ordered, grouped structure the
// sidebar, home cards, search index, and prev/next links all read from. One source of
// truth for ordering: group order (below) → then each article's `order` frontmatter.
import type { CollectionEntry } from 'astro:content';

export type HelpGroupId = 'start' | 'educators' | 'admins' | 'families';

/** Audience sections, in display order. `label` shows in the sidebar + home headings. */
export const helpGroups: { id: HelpGroupId; label: string }[] = [
  { id: 'start', label: 'Getting started' },
  { id: 'educators', label: 'For educators' },
  { id: 'admins', label: 'For administrators' },
  { id: 'families', label: 'For families' },
];

const groupOrder = new Map(helpGroups.map((g, i) => [g.id, i]));

type HelpEntry = CollectionEntry<'help'>;

/** A lightweight, render-ready view of an article (no MDX body). */
export interface HelpArticleLink {
  slug: string;
  href: string;
  title: string;
  blurb: string;
  group: HelpGroupId;
  keywords: string[];
}

export interface HelpGroupTree {
  id: HelpGroupId;
  label: string;
  items: HelpArticleLink[];
}

function toLink(entry: HelpEntry): HelpArticleLink {
  return {
    slug: entry.id,
    href: `/help/${entry.id}/`,
    title: entry.data.title,
    blurb: entry.data.blurb,
    group: entry.data.group,
    keywords: entry.data.keywords,
  };
}

/** Sort entries into their groups, each group's items by `order` then title. */
export function buildHelpNav(entries: HelpEntry[]): HelpGroupTree[] {
  return helpGroups
    .map((g) => ({
      id: g.id,
      label: g.label,
      items: entries
        .filter((e) => e.data.group === g.id)
        .sort((a, b) => a.data.order - b.data.order || a.data.title.localeCompare(b.data.title))
        .map(toLink),
    }))
    .filter((g) => g.items.length > 0);
}

/** Flat reading order across all groups — drives prev/next sequencing. */
export function flatHelpOrder(entries: HelpEntry[]): HelpArticleLink[] {
  return [...entries]
    .sort(
      (a, b) =>
        (groupOrder.get(a.data.group) ?? 0) - (groupOrder.get(b.data.group) ?? 0) ||
        a.data.order - b.data.order ||
        a.data.title.localeCompare(b.data.title),
    )
    .map(toLink);
}

export function groupLabel(id: HelpGroupId): string {
  return helpGroups.find((g) => g.id === id)?.label ?? '';
}
