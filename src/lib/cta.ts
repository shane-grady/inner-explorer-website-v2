// GA4 `cta_click` tagging (src/components/seo/Analytics.astro sends the event). Every link to
// /contact/ carries `data-cta-location`, a short name for where it sits: `nav`, `hero`,
// `mid-page`, `bottom-cta`, `footer`, or a Pricing plan's `pricing-<plan>`.

/** True for the contact page, with or without a query string or hash. */
export const isContactHref = (href: string | undefined) =>
  !!href && /^\/contact\/?(?:[?#]|$)/.test(href);

/** Spread onto a link or Button: `data-cta-location` when it goes to /contact/, else nothing. */
export const ctaAttrs = (href: string | undefined, location: string) =>
  isContactHref(href) ? { 'data-cta-location': location } : {};

/** The Pricing page's per-plan location: "Community Pro" → `pricing-community-pro`. */
export const pricingCtaLocation = (plan: string) =>
  `pricing-${plan
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')}`;

interface HastNode {
  type: string;
  tagName?: string;
  properties?: Record<string, unknown>;
  children?: HastNode[];
}

/** Rehype plugin (astro.config.mjs): a Markdown link to /contact/ in an article body is `article-body`. */
export const rehypeCtaLocation = () => (tree: HastNode) => {
  const visit = (node: HastNode) => {
    if (node.tagName === 'a' && node.properties) {
      const href = node.properties.href;
      if (typeof href === 'string' && isContactHref(href)) {
        node.properties.dataCtaLocation ??= 'article-body';
      }
    }
    node.children?.forEach(visit);
  };
  visit(tree);
};
