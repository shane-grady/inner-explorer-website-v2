// Feature icons: Phosphor 2.1.1, fill weight, for anything that illustrates a topic (a
// program, a series, a benefit). The set holds what the shared components and the
// styleguide render; a page PR adds its icons here, from the same package.
import bookOpen from '@phosphor-icons/core/assets/fill/book-open-fill.svg?raw';
import chartLineUp from '@phosphor-icons/core/assets/fill/chart-line-up-fill.svg?raw';
import checkCircle from '@phosphor-icons/core/assets/fill/check-circle-fill.svg?raw';
import headphones from '@phosphor-icons/core/assets/fill/headphones-fill.svg?raw';
import heart from '@phosphor-icons/core/assets/fill/heart-fill.svg?raw';
import lock from '@phosphor-icons/core/assets/fill/lock-fill.svg?raw';
import play from '@phosphor-icons/core/assets/fill/play-fill.svg?raw';
import shieldCheck from '@phosphor-icons/core/assets/fill/shield-check-fill.svg?raw';
import users from '@phosphor-icons/core/assets/fill/users-fill.svg?raw';

export const FEATURE_ICONS = {
  'book-open': bookOpen,
  'chart-line-up': chartLineUp,
  'check-circle': checkCircle,
  headphones,
  heart,
  lock,
  play,
  'shield-check': shieldCheck,
  users,
} as const;

export type FeatureIconName = keyof typeof FEATURE_ICONS;
