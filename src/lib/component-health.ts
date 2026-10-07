/**
 * Build-time drift scan for /styleguide/components.
 *
 * `pnpm lint:drift` already blocks arbitrary Tailwind values and raw colors, so what is
 * left is drift that lint can't see: bespoke CSS in scoped <style> blocks. Per component
 * we count, inside <style> only:
 *   • raw lengths   — px/rem/em literals instead of the spacing/type/radius scales
 *   • palette refs  — var(--brand-600) etc.: the private palette, not semantic tokens
 *   • page vars     — page-context vars (--editorial-*, --series-*, --home-*, …)
 * score = raw lengths + 2 × palette refs + 2 × page vars. Lower is better.
 */
import { families, overrides, type HealthStatus } from '../data/component-registry';

export type { HealthStatus };

export interface ComponentHealth {
  path: string;
  name: string;
  area: string;
  score: number;
  status: HealthStatus;
  /** True when a person set the status in the registry rather than the score. */
  reviewed: boolean;
  rawLengths: number;
  paletteRefs: number;
  pageVars: number;
  cssLines: number;
  usedBy: number;
  family?: string;
  note?: string;
}

export const THRESHOLDS = { good: 15, minor: 60 } as const;

export const STATUS_LABEL: Record<HealthStatus, string> = {
  good: 'On system',
  minor: 'Minor drift',
  major: 'Significant drift',
};

const sources = import.meta.glob<string>('../components/**/*.astro', {
  query: '?raw',
  import: 'default',
  eager: true,
});

// Every file that could import a component (pages, layouts, MDX, the Help Center).
const consumers = import.meta.glob<string>(
  ['/src/**/*.{astro,mdx,ts,tsx}', '/src-help/**/*.{astro,mdx,ts,tsx}'],
  { query: '?raw', import: 'default', eager: true },
);

const STYLE_BLOCK = /<style[^>]*>([\s\S]*?)<\/style>/g;
const RAW_LENGTH = /(?<![\w.-])\d*\.?\d+(?:px|rem|em)\b/g;
const PALETTE_REF = /var\(--(?:brand|neutral|accent)-\d+/g;
const PAGE_VAR =
  /var\(--(?:editorial|home|studio|series|balance|viz|cream|peach|mesh|surface-warm|insights|masthead|newsroom|voice|hero|cta)[\w-]*/g;

const count = (text: string, re: RegExp) => text.match(re)?.length ?? 0;

const familyOf = new Map(families.flatMap((f) => f.members.map((m) => [m, f.name] as const)));

function statusFor(score: number): HealthStatus {
  if (score <= THRESHOLDS.good) return 'good';
  if (score <= THRESHOLDS.minor) return 'minor';
  return 'major';
}

function areaFor(path: string): string {
  const parts = path.split('/');
  if (parts[0] === 'blocks') return parts.length > 2 ? parts[1] : 'blocks (shared)';
  return parts[0];
}

function usageCount(path: string): number {
  const file = path.split('/').pop();
  const importRe = new RegExp(`from\\s+['"][^'"]*/${file?.replace('.', '\\.')}['"]`);
  return Object.entries(consumers).filter(
    ([p, src]) => !p.endsWith(`/components/${path}`) && importRe.test(src),
  ).length;
}

export function getComponentHealth(): ComponentHealth[] {
  return Object.entries(sources)
    .map(([file, src]) => {
      const path = file.replace('../components/', '');
      const css = [...src.matchAll(STYLE_BLOCK)].map((m) => m[1]).join('\n');
      const rawLengths = count(css, RAW_LENGTH);
      const paletteRefs = count(css, PALETTE_REF);
      const pageVars = count(css, PAGE_VAR);
      const score = rawLengths + 2 * paletteRefs + 2 * pageVars;
      const override = overrides[path];
      return {
        path,
        name: path.split('/').pop()!.replace('.astro', ''),
        area: areaFor(path),
        score,
        status: override?.status ?? statusFor(score),
        reviewed: Boolean(override?.status),
        rawLengths,
        paletteRefs,
        pageVars,
        cssLines: css ? css.split('\n').length : 0,
        usedBy: usageCount(path),
        family: familyOf.get(path),
        note: override?.note,
      };
    })
    .sort((a, b) => b.score - a.score);
}
