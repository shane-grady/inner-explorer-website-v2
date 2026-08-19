// Social-share card for the Help Center home page. No eyebrow — the identity row
// already reads "Inner Explorer Help Center"; the title mirrors the home H1.
import type { APIRoute } from 'astro';
import { renderOgCard } from '../../lib/og-card';

export const GET: APIRoute = async () => {
  const png = await renderOgCard({
    title: 'How can we help you explore today?',
    subtitle: 'Guides, best practices, and answers for educators, administrators, and families.',
  });
  return new Response(new Uint8Array(png), { headers: { 'Content-Type': 'image/png' } });
};
