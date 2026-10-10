// @ts-check
// Marketing site (www.innerexplorer.com). The Help Center is a SECOND, sealed build from
// this repo (astro.help.config.mjs → help.innerexplorer.com); see src-help/README.md.
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';
import tailwindcss from '@tailwindcss/vite';
import { HELP_SITE, MAIN_SITE } from './src/lib/site';

// https://astro.build/config
export default defineConfig({
  // Production domain (confirmed 2026-07). Drives canonical URLs + sitemap.
  site: MAIN_SITE,

  prefetch: { prefetchAll: true, defaultStrategy: 'hover' },

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

  // mdx() renders the privacy policy (src/pages/privacy-policy.astro). The styleguide is
  // noindex and stays out of the sitemap.
  integrations: [mdx(), sitemap({ filter: (page) => !page.includes('/styleguide/') })],

  vite: { plugins: [tailwindcss()] },
});
