// Social-share (Open Graph) card renderer for the Help Center. Every article gets a
// 1200x630 card generated at build time by the endpoints in pages/open-graph/, so a
// shared link always previews with the article's own title in site typography.
import { readFile } from 'node:fs/promises';
import satori from 'satori';
import sharp from 'sharp';
import { decompress } from 'wawoff2';

// The card uses the site's dark brand surface so shared links read as unmistakably
// Inner Explorer in a feed of white cards: deep calm green, warm cream serif type,
// and concentric rings echoing the ring-of-leaves mark (and a breath rippling out).
// Colors mirror tokens in src/styles/global.css (satori cannot read CSS variables;
// the drift guard does not scan .ts). Keep in sync manually:
//   SURFACE_FROM/TO = --voice-featured-bg gradient stops, CREAM = --cream-50,
//   EYEBROW = --brand-300, GLOW = --brand-600.
const SURFACE_FROM = '#1a2e1f';
const SURFACE_TO = '#0e1d14';
const CREAM = 'hsl(38, 40%, 97%)';
const EYEBROW = '#86e29e';
const GLOW = '#1a9a59';
const MUTED = 'rgba(255, 255, 255, 0.62)';
const HAIRLINE = 'rgba(255, 255, 255, 0.16)';
// "Explorer" in the logo lockup — --brand-400, bright enough to read on the dark surface.
const LOGO_GREEN = '#4ecb7f';

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
  /** The mark with a radial alpha fade baked in — the ghosted ring-center watermark. */
  markGhostSrc: string;
}

// Soften the mark's painted edge with a radial alpha fade (solid to 55%, then out to
// transparent) so the ghosted watermark melts into the card instead of sitting on it.
async function ghostMark(mark: Buffer): Promise<Buffer> {
  const fade = Buffer.from(
    '<svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">' +
      '<defs><radialGradient id="g" cx="50%" cy="50%" r="50%">' +
      '<stop offset="40%" stop-color="#fff" stop-opacity="1"/>' +
      '<stop offset="100%" stop-color="#fff" stop-opacity="0"/>' +
      '</radialGradient></defs><rect width="512" height="512" fill="url(#g)"/></svg>',
  );
  return sharp(mark)
    .composite([{ input: fade, blend: 'dest-in' }])
    .png()
    .toBuffer();
}

// Loaded once per build, shared across all card renders.
let assetsPromise: Promise<Assets> | undefined;
function loadAssets(): Promise<Assets> {
  assetsPromise ??= (async () => {
    const mark = await readFile('src/assets/brand/inner-explorer-mark.png');
    return {
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
      markSrc: `data:image/png;base64,${mark.toString('base64')}`,
      markGhostSrc: `data:image/png;base64,${(await ghostMark(mark)).toString('base64')}`,
    };
  })();
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

// Concentric rings anchored past the right edge — the ring-of-leaves mark's geometry
// as a background motif, rippling outward like a breath. Painted before the content
// so text always sits on top; the root's overflow hidden clips the bleed.
function rings(): Node[] {
  const cx = 1005;
  const cy = 315;
  return [
    { d: 380, a: 0.11 },
    { d: 560, a: 0.085 },
    { d: 740, a: 0.06 },
    { d: 920, a: 0.04 },
  ].map(({ d, a }) =>
    el('div', {
      position: 'absolute',
      left: `${cx - d / 2}px`,
      top: `${cy - d / 2}px`,
      width: `${d}px`,
      height: `${d}px`,
      borderRadius: '9999px',
      border: `2px solid rgba(255, 255, 255, ${a})`,
    }),
  );
}

export async function renderOgCard({ eyebrow, title, subtitle }: OgCardInput): Promise<Buffer> {
  const { fonts, markSrc, markGhostSrc } = await loadAssets();

  // Soft brand-green glow rising from where the rings originate.
  const glow = el('div', {
    position: 'absolute',
    right: '-160px',
    top: '35px',
    width: '760px',
    height: '560px',
    backgroundImage: `radial-gradient(circle at center, ${GLOW}2e 0%, ${GLOW}14 45%, ${SURFACE_TO}00 70%)`,
  });

  // The mark ghosted into the rings' center — filling most of the innermost ring,
  // radially faded (see ghostMark) and near-transparent, like a watermark.
  const ghost = {
    type: 'img',
    props: {
      src: markGhostSrc,
      width: 344,
      height: 344,
      style: { position: 'absolute', left: '833px', top: '143px', opacity: 0.09 },
    },
  };

  // Identity — the full logo lockup in the top-left corner: the compass mark (its own
  // painted ring needs no backing) beside the innerExplorer wordmark, then a quiet
  // Help Center tag.
  const identity = el('div', { display: 'flex', alignItems: 'center', gap: '18px' }, [
    { type: 'img', props: { src: markSrc, width: 58, height: 58 } },
    el('div', { display: 'flex', alignItems: 'baseline', fontSize: '33px' }, [
      el('span', { fontWeight: 600, color: CREAM }, 'inner'),
      el('span', { fontWeight: 600, color: LOGO_GREEN }, 'Explorer'),
    ]),
    el(
      'span',
      { fontSize: '26px', fontWeight: 500, color: MUTED, marginLeft: '4px' },
      'Help Center',
    ),
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
                fontSize: '21px',
                fontWeight: 600,
                letterSpacing: '3.5px',
                textTransform: 'uppercase',
                color: EYEBROW,
                marginBottom: '24px',
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
          fontSize: '84px',
          lineHeight: 1.06,
          letterSpacing: '-1px',
          color: CREAM,
          maxWidth: '1000px',
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
                marginTop: '28px',
                fontSize: '29px',
                fontWeight: 500,
                lineHeight: 1.4,
                color: MUTED,
                maxWidth: '860px',
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
      borderTop: `1px solid ${HAIRLINE}`,
      paddingTop: '26px',
    },
    [el('div', { fontSize: '24px', fontWeight: 500, color: MUTED }, 'help.innerexplorer.com')],
  );

  const card = el(
    'div',
    {
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      overflow: 'hidden',
      padding: '64px 80px 52px',
      backgroundColor: SURFACE_TO,
      backgroundImage: `linear-gradient(165deg, ${SURFACE_FROM} 0%, ${SURFACE_TO} 100%)`,
      fontFamily: 'Inter',
    },
    [glow, ...rings(), ghost, identity, middle, footer],
  );

  // satori's types say ReactNode, but it documents (and works with) plain
  // element-object trees — the cast bridges that gap at the one call site.
  const svg = await satori(card as unknown as Parameters<typeof satori>[0], {
    width: 1200,
    height: 630,
    fonts,
  });
  // Full-color PNG: palette quantization visibly bands the dark gradient + glow.
  return sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toBuffer();
}
