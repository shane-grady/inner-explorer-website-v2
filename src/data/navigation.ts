// Site navigation for the new information architecture (the "Inner Explorer — Website"
// canvas, FINAL V page). PageLayout renders these; the design foundation styles them.
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

export const footerNav: NavLink[] = [
  { label: 'Newsroom', href: '/newsroom/' },
  { label: 'Help Center', href: 'https://help.innerexplorer.com/' },
  { label: 'FAQ', href: 'https://help.innerexplorer.com/faq/' },
  { label: 'Privacy policy', href: '/privacy-policy/' },
];
