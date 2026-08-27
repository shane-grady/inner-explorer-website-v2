// @ts-check
// Main marketing site. The Help Center is a SECOND build from this repo
// (astro.help.config.mjs) served at help.innerexplorer.com — shared integrations
// live in astro.config.shared.mjs so the two builds cannot drift.
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { MAIN_SITE } from './src/lib/site';
import { sharedIntegrations, sharedPrefetch, sharedVite } from './astro.config.shared.mjs';

// The Help Center lives on help.innerexplorer.com, but CloudCannon editors preview
// help articles INSIDE this site at /help/… — so these routes are injected in every
// build except Netlify's, which 301s /help/* to the subdomain. HELP_LINK_PREFIX keeps
// in-editor article links navigable at /help/…; the standalone help build omits it
// (root-level URLs). `helpHref`/`helpRootHref` are consumed only by src-help/ files,
// so the prefix never affects marketing pages.
/** @returns {import('astro').AstroIntegration} */
function cloudCannonHelpRoutes() {
  return {
    name: 'cloudcannon-help-routes',
    hooks: {
      'astro:config:setup': ({ injectRoute }) => {
        // Netlify must NOT ship these routes — netlify.toml 301s /help/* to the
        // subdomain — so gate on Netlify's own build flag.
        //
        // This used to gate on CLOUDCANNON_BUILD, which nothing ever set: not this
        // repo, not netlify.toml, not initial-site-settings.json, and not CloudCannon
        // itself. The guard returned early on every CloudCannon build, so all 14 help
        // articles silently had NO Visual Editor preview. Verified 2026-08-25 against
        // the live site: every /help/* URL 404'd on black-kale.cloudvent.net while
        // every other route returned 200, and the editor showed "No preview
        // available". Gating on a variable the platform is merely ASSUMED to provide
        // fails silently; NETLIFY is set by the one build that must opt out.
        if (process.env.NETLIFY) return;
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

  // Netlify serves true 301s for these (netlify.toml); this keeps dev + preview in
  // sync. /support: the FAQ moved to /faq. /privacy: the short form people type and
  // link by hand, pointed at the canonical policy page.
  redirects: { '/support': '/faq', '/privacy': '/privacy-policy/' },

  // Keep the internal styleguide out of the sitemap (it also carries noindex).
  integrations: [
    ...sharedIntegrations(),
    sitemap({ filter: (page) => !page.includes('/styleguide') }),
    cloudCannonHelpRoutes(),
  ],

  vite: sharedVite,
});
