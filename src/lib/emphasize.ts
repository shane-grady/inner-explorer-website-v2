// Title copy with `*emphasis*` marks, as the page `content` objects carry it, to HTML: the
// marked words become <em> (in brand-emphasis unless `emClass` says otherwise), and "\n" a
// line break (with `brClass`, e.g. one that only breaks from md up). Everything else is escaped.
const escape = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export function emphasize(
  title: string,
  emClass = 'text-brand-emphasis not-italic',
  brClass = '',
): string {
  const open = emClass ? `<em class="${emClass}">` : '<em>';
  // A responsive break keeps a space before it, so the words still part where it is hidden.
  const br = brClass ? ` <br class="${brClass}">` : '<br>';
  return escape(title)
    .replace(/\*([^*]+)\*/g, `${open}$1</em>`)
    .replace(/\n/g, br);
}

// Running text with inline marks, as the case-study body carries it: `*words*` set bold and
// `[words](https://…)` a link (only http(s) and site-relative targets). Everything else is
// escaped.
export function inlineMarks(text: string): string {
  return escape(text)
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+|\/(?!\/)[^)\s]*)\)/g, '<a href="$2">$1</a>')
    .replace(/\*([^*]+)\*/g, '<strong>$1</strong>');
}
