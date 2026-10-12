// schema.org structured-data builders. Keep output minimal and accurate.
import { MAIN_SITE } from './site';

function origin(site: URL | string | undefined): string {
  return site ? new URL(site).origin : MAIN_SITE;
}

export function organizationSchema(site: URL | string | undefined) {
  const base = origin(site);
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Inner Explorer',
    url: base,
    logo: `${base}/logo.png`,
    description: 'Daily audio-guided mindfulness practices for PreK-12 schools.',
  };
}

export function breadcrumbSchema(
  site: URL | string | undefined,
  items: { name: string; path: string }[],
) {
  const base = origin(site);
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: `${base}${item.path}`,
    })),
  };
}

interface ArticleInput {
  title: string;
  description: string;
  /** A named person; without one the article is attributed to Inner Explorer. */
  author?: string;
  authorJobTitle?: string;
  pubDate: Date;
  updatedDate?: Date;
  path: string;
  /** Absolute image URL(s): effectively required for Article rich results. */
  image?: string[];
}

/** Article, attributed to a named person at Inner Explorer, or to the organization. */
export function articleSchema(site: URL | string | undefined, article: ArticleInput) {
  const base = origin(site);
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.description,
    ...(article.image?.length ? { image: article.image } : {}),
    author: article.author
      ? {
          '@type': 'Person',
          name: article.author,
          ...(article.authorJobTitle ? { jobTitle: article.authorJobTitle } : {}),
          worksFor: { '@type': 'Organization', name: 'Inner Explorer', url: base },
        }
      : { '@type': 'Organization', name: 'Inner Explorer', url: base },
    datePublished: article.pubDate.toISOString(),
    ...(article.updatedDate ? { dateModified: article.updatedDate.toISOString() } : {}),
    mainEntityOfPage: `${base}${article.path}`,
    publisher: organizationSchema(site),
  };
}

/** FAQPage rich-result schema. `a` is plain text. */
export function faqPageSchema(
  site: URL | string | undefined,
  page: { path: string; name: string; questions: { q: string; a: string }[] },
) {
  const base = origin(site);
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    url: `${base}${page.path}`,
    name: page.name,
    mainEntity: page.questions.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  };
}

/** The Newsroom: a CollectionPage listing its articles. */
export function collectionPageSchema(
  site: URL | string | undefined,
  page: {
    path: string;
    name: string;
    description: string;
    items: { name: string; path: string }[];
  },
) {
  const base = origin(site);
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: page.name,
    url: `${base}${page.path}`,
    description: page.description,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: page.items.length,
      itemListElement: page.items.map((item, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        url: `${base}${item.path}`,
        name: item.name,
      })),
    },
  };
}
