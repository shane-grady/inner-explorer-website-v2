// @ts-check
// Pieces shared by BOTH Astro configs — the main marketing site (astro.config.mjs)
// and the Help Center subdomain build (astro.help.config.mjs). Anything that must
// stay identical between the two builds lives here so it cannot drift; each config
// still declares its own site/srcDir/redirects explicitly.
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import mdx from '@astrojs/mdx';
import AutoImport from 'astro-auto-import';
import editableRegions from '@cloudcannon/editable-regions/astro-integration';

// CloudCannon's Content Editor should never expose source-level imports. Keep
// every component authors can insert available to MDX at build time instead.
// CRITICAL: the help MDX articles rely on this list — if the help build's list
// diverged from the main build's, articles would fail to render in one of them.
/** @type {Parameters<typeof AutoImport>[0]} */
export const autoImportConfig = {
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
    './src/components/blocks/help/HelpTable.astro',
    './src/components/blocks/help/HelpVideo.astro',
    './src/components/blocks/help/LinkCards.astro',
    './src/components/blocks/help/Steps.astro',
  ],
};

/** Integrations both builds need, in the required order (AutoImport before mdx). */
export function sharedIntegrations() {
  return [editableRegions(), react(), AutoImport(autoImportConfig), mdx()];
}

/**
 * Snappier navigation; prefetch on link hover. Same feel on both sites.
 * @type {import('astro').AstroUserConfig['prefetch']}
 */
export const sharedPrefetch = { prefetchAll: true, defaultStrategy: 'hover' };

export const sharedVite = {
  plugins: [tailwindcss()],
};
