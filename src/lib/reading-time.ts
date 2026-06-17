// Estimate reading time from a post's raw body (markdown/MDX source). Returns a
// short "N min" label — the article hero appends " read" for the pill and uses the
// bare label in the meta row. Average adult reading speed ≈ 200 wpm. A schema
// `readingTime` value overrides this when an author wants to set it by hand.
export function readingTime(body: string | undefined, wpm = 200): string {
  const words = (body ?? '')
    // Strip MDX/JSX tags and markdown punctuation so module markup doesn't inflate
    // the count; what's left is a fair approximation of the prose word count.
    .replace(/<[^>]+>/g, ' ')
    .replace(/[#*_>`~-]/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
  const minutes = Math.max(1, Math.round(words / wpm));
  return `${minutes} min`;
}
