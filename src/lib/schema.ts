// schema.org structured-data builders. Keep output minimal and accurate.

function origin(site: URL | string | undefined): string {
  return site ? new URL(site).origin : 'https://www.innerexplorer.org';
}

export function organizationSchema(site: URL | string | undefined) {
  const base = origin(site);
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Inner Explorer',
    url: base,
    logo: `${base}/logo.png`,
    description: 'Daily audio-guided mindfulness practices for K-12 schools.',
  };
}

interface ArticleInput {
  title: string;
  description: string;
  author: string;
  pubDate: Date;
  updatedDate?: Date;
  path: string;
}

export function articleSchema(site: URL | string | undefined, article: ArticleInput) {
  const base = origin(site);
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.description,
    author: { '@type': 'Organization', name: article.author },
    datePublished: article.pubDate.toISOString(),
    ...(article.updatedDate ? { dateModified: article.updatedDate.toISOString() } : {}),
    mainEntityOfPage: `${base}${article.path}`,
    publisher: organizationSchema(site),
  };
}
