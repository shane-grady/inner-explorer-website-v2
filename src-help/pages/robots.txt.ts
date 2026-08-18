import type { APIRoute } from 'astro';

// PRE-LAUNCH: the Help Center is live on its own domain but deliberately not indexed
// yet. Search engines are held back by the `X-Robots-Tag: noindex` header in
// sites/help/netlify.toml — NOT by a Disallow here. That is load-bearing: a URL
// crawlers cannot fetch is a URL where they never see the noindex, and Google can
// still index it from inbound links alone. Keep `User-agent: * / Allow: /`.
//
// AI crawlers are the exception. None of them honour noindex — they are robots.txt
// only — so keeping unfinished help copy out of training and grounding needs the
// explicit group below. Crawlers obey only their own most-specific group, so this
// leaves Googlebot on `User-agent: *` and the noindex path intact. Google states
// Google-Extended has no effect on Search inclusion or ranking, so it costs nothing.
//
// DELETE this list at launch, together with the noindex block in sites/help/netlify.toml.
// Best-effort caveat: ChatGPT-User, Claude-User and Perplexity-User are user-initiated
// fetchers that may ignore robots.txt entirely.
const AI_CRAWLERS = [
  'GPTBot',
  'OAI-SearchBot',
  'ChatGPT-User',
  'ClaudeBot',
  'Claude-SearchBot',
  'Claude-User',
  'PerplexityBot',
  'Perplexity-User',
  'Google-Extended',
];

// Dynamic robots.txt for the help subdomain — points crawlers at this site's own
// generated sitemap using the configured `site` so it stays correct across
// environments. (Same pattern as the main site's src/pages/robots.txt.ts.)
export const GET: APIRoute = ({ site }) => {
  const sitemap = site ? new URL('sitemap-index.xml', site).href : '/sitemap-index.xml';
  const body = [
    'User-agent: *',
    'Allow: /',
    '',
    ...AI_CRAWLERS.map((agent) => `User-agent: ${agent}`),
    'Disallow: /',
    '',
    `Sitemap: ${sitemap}`,
    '',
  ].join('\n');
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
