import type { ImageMetadata } from 'astro';

const contentImages = import.meta.glob<{ default: ImageMetadata }>(
  '/src/assets/images/**/*.{avif,gif,jpeg,jpg,png,webp}',
);

/** Resolve a CloudCannon-authored repo path while retaining Astro image optimization. */
export async function resolveContentImage(src: ImageMetadata | string): Promise<ImageMetadata> {
  if (typeof src !== 'string') return src;

  const load = contentImages[src];
  if (!load) {
    throw new Error(
      `Unknown content image "${src}". Use a repo-relative path under /src/assets/images/.`,
    );
  }

  return (await load()).default;
}
