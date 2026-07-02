// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';

// https://astro.build/config
export default defineConfig({
  // TODO: confirm production domain. Drives canonical URLs + sitemap.
  site: 'https://www.innerexplorer.org',

  // Snappier marketing navigation; prefetch on link hover.
  prefetch: { prefetchAll: true, defaultStrategy: 'hover' },

  // The /support FAQ moved to /faq (the Help Center now owns guided how-to docs).
  // Netlify serves a true 301 (netlify.toml); this keeps dev + preview in sync.
  redirects: { '/support': '/faq' },

  // Keep the internal styleguide out of the sitemap (it also carries noindex).
  integrations: [react(), sitemap({ filter: (page) => !page.includes('/styleguide') }), mdx()],

  vite: {
    plugins: [tailwindcss()],
  },
});
