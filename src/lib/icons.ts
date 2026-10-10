// Interface icons: the 2px outline set the FINAL V boards draw on a 24px grid, round caps and
// joins, in currentColor. Anything you tap or that points somewhere is one of these; a
// topic illustration is a FeatureIcon. Add an icon by tracing it from a board.
export const ICONS = {
  'arrow-right': '<path d="M5 12h14"/><path d="M13 6l6 6-6 6"/>',
  'arrow-left': '<path d="M19 12H5"/><path d="M11 6l-6 6 6 6"/>',
  'chevron-down': '<path d="M6 9l6 6 6-6"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  close: '<path d="M6 6l12 12M18 6 6 18"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7"/>',
  'check-circle': '<circle cx="12" cy="12" r="9"/><path d="M8 12.5l2.5 2.5L16 9.5"/>',
  play: '<path d="M7 4l12 8-12 8z"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
} as const;

export type IconName = keyof typeof ICONS;
export type IconSize = 16 | 20 | 22 | 24;
