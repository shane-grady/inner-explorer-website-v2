// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';
import AutoImport from 'astro-auto-import';
import editableRegions from '@cloudcannon/editable-regions/astro-integration';

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
  integrations: [
    editableRegions(),
    react(),
    sitemap({ filter: (page) => !page.includes('/styleguide') }),
    // CloudCannon's Content Editor should never expose source-level imports. Keep
    // every component authors can insert available to MDX at build time instead.
    AutoImport({
      imports: [
        './src/components/blocks/Figure.astro',
        './src/components/blocks/PullQuote.astro',
        './src/components/blocks/ResourceCard.astro',
        {
          './src/components/blocks/blog/ArticleStats.astro': [['default', 'StatRow']],
        },
        './src/components/blocks/blog/AudioPractice.astro',
        './src/components/blocks/help/Accordion.astro',
        './src/components/blocks/help/ActionLinks.astro',
        './src/components/blocks/help/Callout.astro',
        './src/components/blocks/help/CardGrid.astro',
        './src/components/blocks/help/HelpFigure.astro',
        './src/components/blocks/help/HelpVideo.astro',
        './src/components/blocks/help/LinkCards.astro',
        './src/components/blocks/help/Steps.astro',
      ],
    }),
    mdx(),
  ],

  vite: {
    plugins: [tailwindcss()],
  },
});
