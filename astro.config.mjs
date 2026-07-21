// @ts-check
// Main marketing site. The Help Center is a SECOND build from this repo
// (astro.help.config.mjs) served at help.innerexplorer.com — shared integrations
// live in astro.config.shared.mjs so the two builds cannot drift.
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { MAIN_SITE } from './src/lib/site';
import { sharedIntegrations, sharedPrefetch, sharedVite } from './astro.config.shared.mjs';

// CloudCannon editing builds only: the production main build excludes the Help
// Center (it lives on help.innerexplorer.com), but editors still preview help
// articles inside this site at /help/… — so inject those routes when CloudCannon
// builds (it sets CLOUDCANNON_BUILD). HELP_LINK_PREFIX keeps in-editor article
// links navigable at /help/…; the standalone help build omits it (root-level URLs).
/** @returns {import('astro').AstroIntegration} */
function cloudCannonHelpRoutes() {
  return {
    name: 'cloudcannon-help-routes',
    hooks: {
      'astro:config:setup': ({ injectRoute }) => {
        if (!process.env.CLOUDCANNON_BUILD) return;
        process.env.HELP_LINK_PREFIX = '/help';
        injectRoute({ pattern: '/help', entrypoint: './src-help/pages/index.astro' });
        injectRoute({ pattern: '/help/[slug]', entrypoint: './src-help/pages/[slug].astro' });
      },
    },
  };
}

// https://astro.build/config
export default defineConfig({
  // Production domain (confirmed 2026-07). Drives canonical URLs + sitemap.
  site: MAIN_SITE,

  prefetch: sharedPrefetch,

  // The /support FAQ moved to /faq (the Help Center now owns guided how-to docs).
  // Netlify serves a true 301 (netlify.toml); this keeps dev + preview in sync.
  redirects: { '/support': '/faq' },

  // Keep the internal styleguide out of the sitemap (it also carries noindex).
  integrations: [
    ...sharedIntegrations(),
    sitemap({ filter: (page) => !page.includes('/styleguide') }),
    cloudCannonHelpRoutes(),
  ],

  vite: sharedVite,
});
