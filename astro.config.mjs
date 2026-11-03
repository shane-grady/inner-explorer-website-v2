// @ts-check
// Marketing site (www.innerexplorer.com). The Help Center is a SECOND, sealed build from
// this repo (astro.help.config.mjs → help.innerexplorer.com); see src-help/README.md.
import { defineConfig } from 'astro/config';
import { readdirSync, readFileSync } from 'node:fs';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';
import tailwindcss from '@tailwindcss/vite';
import { HELP_SITE, MAIN_SITE } from './src/lib/site';

// Case studies marked `unlisted: true` (src/content.config.ts): live, but kept out of the sitemap.
const CASE_STUDIES = './src/content/case-studies';
const UNLISTED = readdirSync(CASE_STUDIES)
  .filter((f) => f.endsWith('.yaml'))
  .filter((f) => /^unlisted: true$/m.test(readFileSync(`${CASE_STUDIES}/${f}`, 'utf8')))
  .map((f) => `/case-studies/${f.replace(/\.yaml$/, '')}/`);

// https://astro.build/config
export default defineConfig({
  // Production domain (confirmed 2026-07). Drives canonical URLs + sitemap.
  site: MAIN_SITE,

  prefetch: { prefetchAll: true, defaultStrategy: 'hover' },

  // The site's one stylesheet (~18KB gzipped) goes inline: no render-blocking request before
  // first paint (Lighthouse mobile LCP -0.15 to -0.4s, 2026-11). Hover prefetch already fetches
  // the next page's HTML ahead of the click, so losing the shared CSS cache costs little.
  build: { inlineStylesheets: 'always' },

  // Netlify serves true 301s for these (netlify.toml, each with `force` so it wins over
  // the static redirect page Astro emits); this keeps dev + preview in sync.
  redirects: {
    '/privacy': '/privacy-policy/',
    '/faq': `${HELP_SITE}/faq/`,
    '/support': `${HELP_SITE}/faq/`,
    '/districts': '/why-inner-explorer/',
    '/blog': '/newsroom/',
    '/resources': '/newsroom/',
  },

  // mdx() renders the privacy policy (src/pages/privacy-policy.astro). The styleguide and
  // unlisted case studies are noindex and stay out of the sitemap.
  integrations: [
    mdx(),
    sitemap({
      filter: (page) =>
        !page.includes('/styleguide/') && !UNLISTED.some((path) => page.endsWith(path)),
    }),
  ],

  vite: { plugins: [tailwindcss()] },
});
