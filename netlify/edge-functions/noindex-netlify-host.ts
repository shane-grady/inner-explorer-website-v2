// Host-aware noindex for *.netlify.app hosts (the innerexplorerwebsitev2.netlify.app
// staging domain, deploy previews, branch deploys). Google indexed the staging host
// (verified 2026-06), which would duplicate-cannibalize every production URL at launch.
//
// Why an edge function: `[[headers]]` in netlify.toml applies to every host a deploy
// serves, so it cannot distinguish the netlify.app host from the production custom
// domain — the SAME production deploy will serve both. Only the request's Host header
// differs, so the check has to happen at request time.
//
// - Any host ending in `.netlify.app` → `X-Robots-Tag: noindex` on every response
//   (HTML, PDFs under /downloads/, assets), so crawlers drop/skip the staging mirror.
// - The production custom domain never matches the suffix, so it serves no header and
//   stays fully indexable — with zero launch-day config to flip. Deny-listing
//   `.netlify.app` (rather than allow-listing the prod domain, still TODO in
//   astro.config.mjs) fails safe: a wrong/changed prod domain can never be noindexed.
//
// Note: robots.txt must keep `Allow: /` — Google only sees a noindex on URLs it is
// allowed to crawl. Do not "fix" staging indexing with a Disallow.

type Context = { next(): Promise<Response> };

export default async function handler(request: Request, context: Context): Promise<Response> {
  const response = await context.next();
  const host = request.headers.get('host') ?? '';
  if (host.endsWith('.netlify.app')) {
    response.headers.set('X-Robots-Tag', 'noindex');
  }
  return response;
}

export const config = { path: '/*' };
