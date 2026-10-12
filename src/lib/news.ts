// The Newsroom's articles: published posts newest first, their URLs and their dates as the
// boards set them ("July 1, 2026" in a byline, "Jul 1, 2026" on a card).
import { getCollection, type CollectionEntry } from 'astro:content';

export type NewsEntry = CollectionEntry<'news'>;

export async function getNews(): Promise<NewsEntry[]> {
  const posts = await getCollection('news', ({ data }) => import.meta.env.DEV || !data.draft);
  return posts.sort((a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime());
}

/** The Newsroom's top three: the promoted posts in rank order, then the newest of the rest. */
export function topStories(posts: NewsEntry[]): NewsEntry[] {
  const promoted = posts
    .filter((p) => p.data.promoted)
    .sort((a, b) => (a.data.promoted ?? 0) - (b.data.promoted ?? 0));
  return [...promoted, ...posts.filter((p) => !p.data.promoted)].slice(0, 3);
}

export const newsPath = (post: NewsEntry) => `/newsroom/${post.id}/`;

const LONG = new Intl.DateTimeFormat('en-US', { dateStyle: 'long', timeZone: 'UTC' });
const SHORT = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeZone: 'UTC' });
export const longDate = (date: Date) => LONG.format(date);
export const shortDate = (date: Date) => SHORT.format(date);
export const isoDate = (date: Date) => date.toISOString().slice(0, 10);

// The Newsroom's closing panel (Newsroom board), also the end of an article that sets no
// call to action of its own. The board's "Talk to our team" reads "Contact us", the site-wide
// CTA label (design/inventory.md).
export const newsroomCta = {
  eyebrow: 'For school and district leaders',
  title: 'See what a few minutes a day could change at your school',
  lead: 'Walk through the daily practice, the research behind it and how schools roll it out.',
  primary: { label: 'Contact us', href: '/contact/' },
} as const;
