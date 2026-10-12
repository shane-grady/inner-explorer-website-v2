// Canonical production origins. One source of truth for every cross-site URL —
// the two Astro configs (main + help) and any runtime code that links between
// the marketing site and the Help Center subdomain.
export const MAIN_SITE = 'https://www.innerexplorer.com';
export const HELP_SITE = 'https://help.innerexplorer.com';

// HubSpot form IDENTITY — configuration, not copy: changing these silently breaks lead
// capture. The ids are public, like Intercom's app id. Each form's fields live on the form
// in HubSpot (the contact form is built by scripts/hubspot-contact-form.mjs).
export const HUBSPOT = {
  portalId: '44976911',
  region: 'na1',
  /** The /contact form. */
  contactFormId: '48e37214-69e4-479f-b03b-1ae2ab5dfbd4',
  /** The case-study PDF request (one work-email field). Unset until the form exists in
   *  HubSpot; until then each story's PDF card links the file directly (tasks/todo.md). */
  caseStudyPdfFormId: undefined as string | undefined,
};
