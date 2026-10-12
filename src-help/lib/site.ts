// Canonical production origins. One source of truth for every cross-site URL —
// the two Astro configs (main + help) and any runtime code that links between
// the marketing site and the Help Center subdomain.
export const MAIN_SITE = 'https://www.innerexplorer.com';
export const HELP_SITE = 'https://help.innerexplorer.com';

// HubSpot portal ("hub") id for the tracking code. Public, like Intercom's app id. A copy of
// src/lib/site.ts › HUBSPOT.portalId (the sealed boundary forbids importing it).
export const HUBSPOT_PORTAL_ID = '44976911';
