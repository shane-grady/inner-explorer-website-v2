// A page's social-share card (og:image / twitter:image) cut from its hero photo: a 1200x630
// center crop, the size SEO.astro declares by default. A hero that a 1.91:1 crop would ruin
// (Program's portrait player screenshot) ships its own 1200x630 card to pass here instead.
import { getImage } from 'astro:assets';
import type { ImageMetadata } from 'astro';

export async function shareImage(src: ImageMetadata): Promise<string> {
  const image = await getImage({ src, width: 1200, height: 630, fit: 'cover', format: 'jpg' });
  return image.src;
}
