// Site navigation and footer copy for the new information architecture (the FINAL V boards).
// SiteHeader, MobileMenu and SiteFooter render these.
import { HELP_SITE } from '../lib/site';
import type { BrandIconName } from '../lib/icons';

export interface NavLink {
  label: string;
  href: string;
}

export const primaryNav: NavLink[] = [
  { label: 'Program', href: '/program/' },
  { label: 'Why Inner Explorer', href: '/why-inner-explorer/' },
  { label: 'Research', href: '/research/' },
  { label: 'Case studies', href: '/case-studies/' },
  { label: 'Pricing', href: '/pricing/' },
  { label: 'About', href: '/about/' },
];

/** aria-current for a nav link: "page" on the page itself, "true" anywhere in its section
 * (a case study marks Case studies). */
export function navCurrent(pathname: string, href: string): 'page' | 'true' | undefined {
  if (pathname === href) return 'page';
  return href !== '/' && pathname.startsWith(href) ? 'true' : undefined;
}

export const signIn: NavLink = { label: 'Sign in', href: 'https://app.innerexplorer.com' };
export const contactCta: NavLink = { label: 'Contact us', href: '/contact/' };

// The bar above the header (AnnouncementBar).
export const announcement = 'Explore our new look! Same trusted program.';

// Footer A from the boards, without its sign-off line. The social row's URLs are the profiles
// innerexplorer.com linked as of 2026-10-13 (the boards draw them as "#").
export const footer = {
  blurb: 'Daily audio-guided mindfulness for PreK-12 schools, founded 2011.',
  columns: [
    {
      heading: 'Product',
      links: [
        { label: 'Program', href: '/program/' },
        { label: 'Why Inner Explorer', href: '/why-inner-explorer/' },
        { label: 'Pricing', href: '/pricing/' },
      ],
    },
    {
      heading: 'Company',
      links: [
        { label: 'About', href: '/about/' },
        { label: 'Research', href: '/research/' },
        { label: 'Newsroom', href: '/newsroom/' },
      ],
    },
    {
      heading: 'Get in touch',
      links: [
        { label: 'Contact us', href: '/contact/' },
        { label: 'Help Center', href: `${HELP_SITE}/` },
        { label: 'FAQ', href: `${HELP_SITE}/faq/` },
      ],
    },
  ] satisfies { heading: string; links: NavLink[] }[],
  social: {
    heading: 'Join our Mindful Community',
    links: [
      {
        label: 'LinkedIn',
        icon: 'linkedin',
        href: 'https://www.linkedin.com/company/inner-explorer-inc-',
      },
      { label: 'Instagram', icon: 'instagram', href: 'https://www.instagram.com/inner_explorer_/' },
      { label: 'Facebook', icon: 'facebook', href: 'https://www.facebook.com/innerexplorer' },
      { label: 'YouTube', icon: 'youtube', href: 'https://www.youtube.com/c/InnerexplorerOrg' },
      { label: 'X', icon: 'x', href: 'https://x.com/inner_explorer' },
    ] satisfies (NavLink & { icon: BrandIconName })[],
  },
  privacy: { label: 'Privacy policy', href: '/privacy-policy/' },
  terms: { label: 'Terms', href: '/terms/' },
};
