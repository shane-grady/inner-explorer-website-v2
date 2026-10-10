// Title copy with `*emphasis*` marks, as the page `content` objects carry it, to HTML: the
// marked words become <em> (in brand-emphasis unless `emClass` says otherwise), and "\n" a
// line break. Everything else is escaped.
const escape = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export function emphasize(title: string, emClass = 'text-brand-emphasis not-italic'): string {
  const open = emClass ? `<em class="${emClass}">` : '<em>';
  return escape(title)
    .replace(/\*([^*]+)\*/g, `${open}$1</em>`)
    .replace(/\n/g, '<br>');
}
