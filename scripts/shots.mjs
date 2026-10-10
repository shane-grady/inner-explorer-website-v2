#!/usr/bin/env node
// Screenshots and accessibility: every page of a built `dist/` at 1440 and 390, saved to
// .screenshots/ (gitignored) to set beside the FINAL V boards, with axe (WCAG 2.2 AA) run
// on each page and on the open mobile menu. Build first: `pnpm build && pnpm shots`.
// Only the preview server and HubSpot's form host are reachable, so nothing reports home.
import { mkdir } from 'node:fs/promises';
import { relative } from 'node:path';
import { preview } from 'astro';
import { chromium } from 'playwright';
import { AxeBuilder } from '@axe-core/playwright';
import { walk } from './lib/build-files.mjs';

const ROOT = new URL('..', import.meta.url).pathname;
const OUT = `${ROOT}.screenshots`;
const PORT = 4399;
const ALLOW =
  /^https?:\/\/(127\.0\.0\.1|localhost)(:\d+)?\/|\.hsforms\.(net|com)\/|\.hubspot\.com\//;
const VIEWPORTS = [
  { width: 1440, height: 900 },
  { width: 390, height: 844 },
];

const pages = (await walk(`${ROOT}dist`))
  .filter((f) => f.endsWith('/index.html'))
  .map((f) => '/' + relative(`${ROOT}dist`, f).replace(/index\.html$/, ''))
  .filter((p) => !/^\/(privacy|faq|support|districts|blog|resources)\/$/.test(p)); // redirects

const server = await preview({
  root: ROOT,
  logLevel: 'error',
  server: { port: PORT, host: '127.0.0.1' },
});
const browser = await chromium.launch();
await mkdir(OUT, { recursive: true });
let violations = 0;

async function audit(page, name) {
  const { violations: found } = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag22aa'])
    .analyze();
  for (const v of found) {
    violations++;
    console.error(`  ✖ ${name}: ${v.id} (${v.impact}) ${v.help}`);
    for (const n of v.nodes.slice(0, 3)) console.error(`      ${n.target.join(' ')}`);
  }
}

for (const viewport of VIEWPORTS) {
  const context = await browser.newContext({
    viewport,
    deviceScaleFactor: 1,
    reducedMotion: 'reduce',
  });
  await context.route(/.*/, (route) =>
    ALLOW.test(route.request().url()) ? route.continue() : route.abort(),
  );
  const page = await context.newPage();
  for (const path of pages) {
    const slug = path === '/' ? 'home' : path.replace(/^\/|\/$/g, '').replace(/\//g, '-');
    const name = `${slug}-${viewport.width}`;
    await page.goto(`http://127.0.0.1:${PORT}${path}`, { waitUntil: 'networkidle' });
    // A full-page shot never scrolls, so lazy images below the fold must load first.
    // `complete` can read true before a just-promoted image has loaded, so wait on decode().
    await page.evaluate(async () => {
      const images = [...document.images];
      for (const img of images) img.loading = 'eager';
      await Promise.all(images.map((img) => img.decode().catch(() => {})));
      return document.fonts.ready;
    });
    await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: true });
    await audit(page, name);
    if (viewport.width === 390 && path === '/') {
      await page.click('[data-menu-open]');
      await page.screenshot({ path: `${OUT}/${slug}-menu-${viewport.width}.png` });
      await audit(page, `${slug}-menu-${viewport.width}`);
    }
    console.log(`  ${name}`);
  }
  await context.close();
}

await browser.close();
await server.stop();
if (violations) {
  console.error(`shots: ${violations} accessibility violation(s).`);
  process.exit(1);
}
console.log(
  `shots: ${pages.length} pages × ${VIEWPORTS.length} viewports in .screenshots/, axe clean.`,
);
