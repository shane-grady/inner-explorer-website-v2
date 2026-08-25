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

interface ArticleInput {
  /** The article's actual headline — should match the visible H1, not the <title> tag. */
  title: string;
  description: string;
  author: string;
  /** Author entity type — defaults to the Inner Explorer brand (Organization). */
  authorType?: 'Organization' | 'Person';
  /** Author's job title — only used when `authorType` is 'Person'. */
  authorJobTitle?: string;
  pubDate: Date;
  updatedDate?: Date;
  path: string;
  /** Absolute image URL(s) — effectively required for Article rich results. */
  image?: string[];
  /** The real-world entity the article is about (disambiguates the subject). */
  about?: Record<string, unknown>;
  /** Works the article cites (research papers, policy statements). */
  citation?: Record<string, unknown>[];
}

export function articleSchema(site: URL | string | undefined, article: ArticleInput) {
  const base = origin(site);
  const author =
    article.authorType === 'Person'
      ? {
          '@type': 'Person',
          name: article.author,
          ...(article.authorJobTitle ? { jobTitle: article.authorJobTitle } : {}),
          worksFor: { '@type': 'Organization', name: 'Inner Explorer', url: base },
        }
      : { '@type': 'Organization', name: article.author };
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.description,
    ...(article.image?.length ? { image: article.image } : {}),
    author,
    datePublished: article.pubDate.toISOString(),
    ...(article.updatedDate ? { dateModified: article.updatedDate.toISOString() } : {}),
    ...(article.about ? { about: article.about } : {}),
    ...(article.citation?.length ? { citation: article.citation } : {}),
    mainEntityOfPage: `${base}${article.path}`,
    publisher: organizationSchema(site),
  };
}

interface PersonInput {
  name: string;
  jobTitle?: string;
  description?: string;
  image?: string;
  path: string;
}

export function personSchema(site: URL | string | undefined, person: PersonInput) {
  const base = origin(site);
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: person.name,
    ...(person.jobTitle ? { jobTitle: person.jobTitle } : {}),
    ...(person.description ? { description: person.description } : {}),
    ...(person.image ? { image: `${base}${person.image}` } : {}),
    url: `${base}${person.path}`,
    worksFor: { '@type': 'Organization', name: 'Inner Explorer', url: base },
  };
}

/** FAQPage rich-result schema. `a` should be plain text (strip any inline HTML). */
export function faqPageSchema(
  site: URL | string | undefined,
  page: {
    path: string;
    name: string;
    description?: string;
    questions: { q: string; a: string }[];
  },
) {
  const base = origin(site);
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    url: `${base}${page.path}`,
    name: page.name,
    ...(page.description ? { description: page.description } : {}),
    mainEntity: page.questions.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
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
