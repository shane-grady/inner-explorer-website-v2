import { HELP_SITE } from './site';

// The privacy policy is a Help Center article (src/content/help/privacy-policy.mdx) that
// this site also renders, so its links are written for help.innerexplorer.com: a CMS
// link such as `../signing-in/` or `/faq/` means a Help Center page. Resolve them there.
const ARTICLE_URL = `${HELP_SITE}/privacy-policy/`;

/** A link from the shared privacy-policy article, resolved against its Help Center URL.
 *  Absolute URLs, `mailto:`/`tel:` links and in-page `#anchors` are returned unchanged. */
export function resolveHelpArticleHref(href: string): string {
  if (href.startsWith('#') || /^[a-z][a-z\d+.-]*:/i.test(href)) return href;
  try {
    return new URL(href, ARTICLE_URL).href;
  } catch {
    return href;
  }
}
