// Social-share (Open Graph) card renderer for the Help Center. Every article gets a
// 1200x630 card generated at build time by the endpoints in pages/open-graph/, so a
// shared link always previews with the article's own title in site typography.
import { readFile } from 'node:fs/promises';
import satori from 'satori';
import sharp from 'sharp';
import { decompress } from 'wawoff2';

// Colors mirror the light-theme tokens in src/styles/global.css (satori cannot read
// CSS variables; the drift guard does not scan .ts). Keep in sync manually:
//   BRAND = --brand-600, BRAND_TINT = --brand-50, INK = --neutral-900 (foreground),
//   MUTED = --neutral-500 (muted-foreground), BORDER = --neutral-300 (border).
const BRAND = '#1a9a59';
const BRAND_TINT = '#f0fbf4';
const INK = 'hsl(220, 20%, 16%)';
const MUTED = 'hsl(220, 10%, 50%)';
const BORDER = 'hsl(220, 14%, 88%)';

/** URL of one article's generated share card (route: pages/open-graph/[slug].png.ts). */
export const ogImageHref = (slug: string) => `/open-graph/${slug}.png`;
/** URL of the Help Center home share card (route: pages/open-graph/home.png.ts). */
export const OG_HOME_IMAGE = '/open-graph/home.png';

// Asset loading. Paths are cwd-relative — pnpm scripts always run at the repo root
// (same convention as scripts/check-drift.mjs). satori cannot parse woff2, so the
// shared public/fonts files are decompressed back to their original ttf bytes at
// build time; the cards can never drift from the fonts the site actually serves.
async function loadFont(file: string): Promise<Buffer> {
  return Buffer.from(await decompress(await readFile(`public/fonts/${file}`)));
}

interface Assets {
  fonts: { name: string; data: Buffer; weight: 400 | 500 | 600; style: 'normal' }[];
  markSrc: string;
}

// Loaded once per build, shared across all card renders.
let assetsPromise: Promise<Assets> | undefined;
function loadAssets(): Promise<Assets> {
  assetsPromise ??= (async () => ({
    fonts: [
      {
        name: 'Libre Caslon Condensed',
        data: await loadFont('LibreCaslonCondensed-Regular.woff2'),
        weight: 400 as const,
        style: 'normal' as const,
      },
      {
        name: 'Inter',
        data: await loadFont('Inter-Medium.woff2'),
        weight: 500 as const,
        style: 'normal' as const,
      },
      {
        name: 'Inter',
        data: await loadFont('Inter-SemiBold.woff2'),
        weight: 600 as const,
        style: 'normal' as const,
      },
    ],
    markSrc: `data:image/png;base64,${(
      await readFile('src/assets/brand/inner-explorer-mark.png')
    ).toString('base64')}`,
  }))();
  return assetsPromise;
}

export interface OgCardInput {
  /** Uppercased kicker above the title (article group label). Omit on the home card. */
  eyebrow?: string;
  title: string;
  /** Muted line under the title (home card only). */
  subtitle?: string;
}

// satori element tree nodes are plain objects (no JSX in a .ts file). satori is
// flexbox-only: every multi-child container needs an explicit display: 'flex'.
type Node = { type: string; props: Record<string, unknown> };
const el = (type: string, style: Record<string, unknown>, children?: Node[] | string): Node => ({
  type,
  props: { style, ...(children !== undefined ? { children } : {}) },
});

export async function renderOgCard({ eyebrow, title, subtitle }: OgCardInput): Promise<Buffer> {
  const { fonts, markSrc } = await loadAssets();

  // Identity row — mirrors the live site header (mark + semibold / muted wordmark).
  const identity = el('div', { display: 'flex', alignItems: 'center', gap: '20px' }, [
    { type: 'img', props: { src: markSrc, width: 56, height: 56 } },
    el('div', { display: 'flex', alignItems: 'baseline', gap: '12px', fontSize: '28px' }, [
      el('span', { fontWeight: 600, color: INK }, 'Inner Explorer'),
      el('span', { fontWeight: 500, color: MUTED }, 'Help Center'),
    ]),
  ]);

  // Middle block — vertically centered eyebrow + title (+ optional subtitle). The
  // title matches the on-page H1: Libre Caslon Condensed 400 (.help-article-title).
  const middle = el(
    'div',
    { display: 'flex', flexDirection: 'column', flexGrow: 1, justifyContent: 'center' },
    [
      ...(eyebrow
        ? [
            el(
              'div',
              {
                fontSize: '22px',
                fontWeight: 600,
                letterSpacing: '3px',
                textTransform: 'uppercase',
                color: BRAND,
                marginBottom: '22px',
              },
              eyebrow,
            ),
          ]
        : []),
      el(
        'div',
        {
          fontFamily: 'Libre Caslon Condensed',
          fontWeight: 400,
          fontSize: '80px',
          lineHeight: 1.08,
          letterSpacing: '-1px',
          color: INK,
          maxWidth: '1020px',
          // satori-specific safety net; current titles wrap to at most 2 lines.
          lineClamp: 3,
        },
        title,
      ),
      ...(subtitle
        ? [
            el(
              'div',
              {
                marginTop: '26px',
                fontSize: '29px',
                fontWeight: 500,
                lineHeight: 1.4,
                color: MUTED,
                maxWidth: '880px',
              },
              subtitle,
            ),
          ]
        : []),
    ],
  );

  const footer = el(
    'div',
    {
      display: 'flex',
      alignItems: 'center',
      borderTop: `1px solid ${BORDER}`,
      paddingTop: '26px',
    },
    [el('div', { fontSize: '24px', fontWeight: 500, color: MUTED }, 'help.innerexplorer.com')],
  );

  const baselineBar = el('div', {
    position: 'absolute',
    left: 0,
    bottom: 0,
    width: '1200px',
    height: '10px',
    backgroundColor: BRAND,
  });

  const card = el(
    'div',
    {
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      padding: '64px 80px 52px',
      backgroundColor: '#ffffff',
      backgroundImage: `linear-gradient(135deg, #ffffff 55%, ${BRAND_TINT} 100%)`,
      fontFamily: 'Inter',
    },
    [identity, middle, footer, baselineBar],
  );

  // satori's types say ReactNode, but it documents (and works with) plain
  // element-object trees — the cast bridges that gap at the one call site.
  const svg = await satori(card as unknown as Parameters<typeof satori>[0], {
    width: 1200,
    height: 630,
    fonts,
  });
  return sharp(Buffer.from(svg)).png({ compressionLevel: 9, palette: true }).toBuffer();
}
