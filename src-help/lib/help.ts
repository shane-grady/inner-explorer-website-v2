// Help Center navigation model. The article *content* lives in the `help` content
// collection (src/content/help/*.mdx); this file defines the audience GROUPS and the
// helpers that turn a flat list of articles into the ordered, grouped structure the
// sidebar, home cards, search index, and prev/next links all read from. One source of
// truth for ordering: group order (below) → then each article's `order` frontmatter.
import type { CollectionEntry } from 'astro:content';

export type HelpGroupId = 'start' | 'educators' | 'counselors' | 'admins' | 'families' | 'policies';

/** Audience sections, in display order. `label` shows in the sidebar + home headings.
 *  `policies` is not an audience: it holds the reference documents (privacy, terms)
 *  every audience may need, so it sits last. */
export const helpGroups: { id: HelpGroupId; label: string }[] = [
  { id: 'start', label: 'Getting started' },
  { id: 'educators', label: 'For educators' },
  { id: 'counselors', label: 'For support staff' },
  { id: 'admins', label: 'For administrators' },
  { id: 'families', label: 'For families' },
  { id: 'policies', label: 'Policies' },
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

// Articles live at the ROOT of help.innerexplorer.com (e.g. /classroom-setup/).
// CloudCannon editing builds render them inside the main site instead — there the
// cloudcannon-help-routes integration (astro.config.mjs) sets HELP_LINK_PREFIX to
// '/help' so in-editor navigation between articles keeps working.
const linkPrefix = process.env.HELP_LINK_PREFIX ?? '';

/** Root of the help center in the current build ('/', or '/help/' in CloudCannon). */
export const helpRootHref = `${linkPrefix}/`;

/** Canonical href for one article in the current build. */
export function helpHref(slug: string): string {
  return `${linkPrefix}/${slug}/`;
}

function toLink(entry: HelpEntry): HelpArticleLink {
  return {
    slug: entry.id,
    href: helpHref(entry.id),
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
