// CloudCannon editable-region attribute helpers.
//
// Blocks are shared: the same Hero or QuoteRow renders on a CMS-backed page AND on
// routes that have not been converted yet. Emitting `data-prop` unconditionally would
// bind those unconverted pages to paths that do not exist, and the Visual Editor
// renders a red error card for any path that fails to resolve. So editables are
// OPT-IN, controlled by one prop threaded from the page: `editablePrefix`.
//
//   undefined  → emit nothing. The default, so unconverted call sites are unchanged.
//   ''         → emit RELATIVE paths. Use inside a `data-editable="array-item"`,
//                where CloudCannon resolves against the item, not the file root.
//   'hero'     → emit paths prefixed with `hero.` (dotted paths are fine: 'a.b').
//
// Note the `undefined` vs `''` distinction is deliberate and cannot be a truthiness
// check — '' is a meaningful value meaning "relative to my parent region".

/** Text editor mode. `span` = plain text, `text` = paragraph rich text,
 *  `block` = multi-paragraph rich text. Must match the field's input config. */
export type EditableTextType = 'span' | 'text' | 'block';

export type EditablePrefix = string | undefined;

/** Join a prefix and key into a CloudCannon data path. */
const editablePath = (prefix: EditablePrefix, key: string): string =>
  prefix ? `${prefix}.${key}` : key;

/** Attributes for an inline/rich text region bound to `key`. */
export function editableText(prefix: EditablePrefix, key: string, type: EditableTextType = 'span') {
  if (prefix === undefined) return {};
  return {
    'data-editable': 'text',
    'data-prop': editablePath(prefix, key),
    'data-type': type,
  };
}

/** Attributes for an array container. Its children must be ONLY array items. */
export function editableArray(prefix: EditablePrefix, key: string) {
  if (prefix === undefined) return {};
  return { 'data-editable': 'array', 'data-prop': editablePath(prefix, key) };
}

/** Attributes for one row inside an `editableArray` container. */
export function editableItem(prefix: EditablePrefix) {
  if (prefix === undefined) return {};
  return { 'data-editable': 'array-item' };
}

/** Attributes for an image region. Bind `src` and `alt` to separate fields.
 *  The host may be the <img> itself or any element containing one. */
export function editableImage(prefix: EditablePrefix, srcKey: string, altKey?: string) {
  if (prefix === undefined) return {};
  const attrs: Record<string, string> = {
    'data-editable': 'image',
    'data-prop-src': editablePath(prefix, srcKey),
  };
  if (altKey) attrs['data-prop-alt'] = editablePath(prefix, altKey);
  return attrs;
}

/** The prefix to hand a child block that renders a nested object field.
 *  `childPrefix('hero', 'cta')` → 'hero.cta'; `childPrefix('', 'cta')` → 'cta'. */
export const childPrefix = (prefix: EditablePrefix, key: string): EditablePrefix =>
  prefix === undefined ? undefined : editablePath(prefix, key);

/** The prefix for content inside an array item — always relative. */
export const itemPrefix = (prefix: EditablePrefix): EditablePrefix =>
  prefix === undefined ? undefined : '';
