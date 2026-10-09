// @ts-check
// Help Center subdomain build (help.innerexplorer.com). Second Astro app from the
// same repo, and SEALED from the marketing site: src-help/ holds its own frozen copy of
// every component, layout, style and helper it renders, so the marketing rebuild in
// src/ cannot change it. The only src/ paths it reads are editor-owned content
// (src/content/help/*.mdx, src/data/help-ui.json). See src-help/README.md.
// Build with `pnpm build:help`; deployed as a separate Netlify site (sites/help/).
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';
import tailwindcss from '@tailwindcss/vite';
import AutoImport from 'astro-auto-import';
import editableRegions from '@cloudcannon/editable-regions/astro-integration';
import { HELP_SITE } from './src-help/lib/site';

// The MDX components help articles use by name, with no import line, so CloudCannon's
// Content Editor never exposes source-level imports. These names are a contract with
// the article bodies AND the CloudCannon `_snippets`: rename one and both break.
const helpMdxComponents = [
  './src-help/components/mdx/Accordion.astro',
  './src-help/components/mdx/ActionLinks.astro',
  './src-help/components/mdx/Callout.astro',
  './src-help/components/mdx/Card.astro',
  './src-help/components/mdx/CardGrid.astro',
  './src-help/components/mdx/HelpFigure.astro',
  './src-help/components/mdx/HelpTable.astro',
  './src-help/components/mdx/HelpVideo.astro',
  './src-help/components/mdx/LinkCards.astro',
  './src-help/components/mdx/Steps.astro',
];

// https://astro.build/config
export default defineConfig({
  // Drives canonical URLs, the help sitemap, and JSON-LD.
  site: HELP_SITE,

  srcDir: './src-help',
  outDir: './dist-help',
  // Share the main public/ dir: the help site needs its favicons, fonts, logo, share
  // image and /videos/help/* assets from there. src-help/README.md lists the files it
  // depends on, so the marketing rebuild keeps them.
  publicDir: './public',

  prefetch: { prefetchAll: true, defaultStrategy: 'hover' },

  // AutoImport must come before mdx().
  integrations: [editableRegions(), AutoImport({ imports: helpMdxComponents }), mdx(), sitemap()],

  vite: { plugins: [tailwindcss()] },
});
