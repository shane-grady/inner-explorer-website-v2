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

  integrations: [react(), sitemap(), mdx()],

  vite: {
    plugins: [tailwindcss()],
  },
});
