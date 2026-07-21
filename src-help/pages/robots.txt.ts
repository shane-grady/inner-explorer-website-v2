import type { APIRoute } from 'astro';

// Dynamic robots.txt for the help subdomain — points crawlers at this site's own
// generated sitemap using the configured `site` so it stays correct across
// environments. (Same pattern as the main site's src/pages/robots.txt.ts.)
export const GET: APIRoute = ({ site }) => {
  const sitemap = site ? new URL('sitemap-index.xml', site).href : '/sitemap-index.xml';
  const body = ['User-agent: *', 'Allow: /', '', `Sitemap: ${sitemap}`, ''].join('\n');
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
