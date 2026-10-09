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
