// @ts-check
// Help Center subdomain build (help.innerexplorer.com). Second Astro app from the
// same repo: its own srcDir holds just the help routes (articles live at the
// subdomain ROOT, e.g. /classroom-setup/), while components, tokens, and content
// are imported straight from the shared src/ tree. Build with `pnpm build:help`;
// deployed as a separate Netlify site (see sites/help/netlify.toml).
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { HELP_SITE } from './src/lib/site';
import { sharedIntegrations, sharedPrefetch, sharedVite } from './astro.config.shared.mjs';

// https://astro.build/config
export default defineConfig({
  // Drives canonical URLs, the help sitemap, and JSON-LD.
  site: HELP_SITE,

  srcDir: './src-help',
  outDir: './dist-help',
  // Share the main public/ dir: the help site needs the same favicons, fonts, and
  // /videos/help/* assets. The few marketing-only files that ride along (downloads,
  // legacy _redirects entries whose targets 404 here) are harmless.
  publicDir: './public',

  prefetch: sharedPrefetch,

  integrations: [...sharedIntegrations(), sitemap()],

  vite: sharedVite,
});
