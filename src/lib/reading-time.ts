// Reading time from a post's raw body (MDX source): words over 200 a minute, at least 1.
// MDX tags and markdown punctuation are stripped so markup doesn't inflate the count.
export function readingTime(body: string | undefined, wpm = 200): string {
  const words = (body ?? '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/[#*_>`~-]/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
  return `${Math.max(1, Math.round(words / wpm))} min read`;
}
