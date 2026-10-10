// Title copy with `*emphasis*` marks, as the page `content` objects carry it, to HTML: the
// marked words become <em>, and "\n" a line break. Everything else is escaped.
const escape = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export function emphasize(title: string): string {
  return escape(title)
    .replace(/\*([^*]+)\*/g, '<em class="text-brand-emphasis not-italic">$1</em>')
    .replace(/\n/g, '<br>');
}
