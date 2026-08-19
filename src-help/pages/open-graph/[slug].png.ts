// Per-article social-share card, prerendered at build time (see lib/og-card.ts).
import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { groupLabel } from '../../../src/lib/help';
import { renderOgCard } from '../../lib/og-card';

interface CardProps {
  title: string;
  eyebrow: string;
}

export async function getStaticPaths() {
  const entries = await getCollection('help', ({ data }) => !data.draft);
  return entries.map((entry) => ({
    params: { slug: entry.id },
    props: { title: entry.data.title, eyebrow: groupLabel(entry.data.group) } as CardProps,
  }));
}

export const GET: APIRoute<CardProps> = async ({ props }) => {
  const png = await renderOgCard({ eyebrow: props.eyebrow, title: props.title });
  return new Response(new Uint8Array(png), { headers: { 'Content-Type': 'image/png' } });
};
