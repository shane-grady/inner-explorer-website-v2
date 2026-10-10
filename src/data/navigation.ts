// Site navigation and footer copy for the new information architecture (the FINAL V boards).
// SiteHeader, MobileMenu and SiteFooter render these.
import { HELP_SITE } from '../lib/site';

export interface NavLink {
  label: string;
  href: string;
}

export const primaryNav: NavLink[] = [
  { label: 'Platform', href: '/platform/' },
  { label: 'Why Inner Explorer', href: '/why-inner-explorer/' },
  { label: 'Case studies', href: '/case-studies/' },
  { label: 'Research', href: '/research/' },
  { label: 'Pricing', href: '/pricing/' },
  { label: 'About', href: '/about/' },
];

export const signIn: NavLink = { label: 'Sign in', href: 'https://app.innerexplorer.com' };
export const contactCta: NavLink = { label: 'Contact us', href: '/contact/' };

// Footer A from the boards. No social row yet: every board draws the profile links as "#"
// (tasks/todo.md tracks the URLs; the row ships with them).
export const footer = {
  blurb: 'Daily audio-guided mindfulness for PreK-12 schools, founded 2011.',
  columns: [
    {
      heading: 'Product',
      links: [
        { label: 'For educators', href: '/platform/' },
        { label: 'For districts', href: '/why-inner-explorer/' },
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
  privacy: { label: 'Privacy policy', href: '/privacy-policy/' },
  signoff: 'Made with quiet, in Boston and Chicago.',
};
