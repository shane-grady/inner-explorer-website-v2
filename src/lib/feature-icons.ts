// Feature icons: Phosphor 2.1.1, fill weight, for anything that illustrates a topic (a
// program, a series, a benefit). The set holds what the shared components and the
// styleguide render; a page PR adds its icons here, from the same package.
import arrowsClockwise from '@phosphor-icons/core/assets/fill/arrows-clockwise-fill.svg?raw';
import bookOpen from '@phosphor-icons/core/assets/fill/book-open-fill.svg?raw';
import chartBar from '@phosphor-icons/core/assets/fill/chart-bar-fill.svg?raw';
import chartLineUp from '@phosphor-icons/core/assets/fill/chart-line-up-fill.svg?raw';
import checkCircle from '@phosphor-icons/core/assets/fill/check-circle-fill.svg?raw';
import clock from '@phosphor-icons/core/assets/fill/clock-fill.svg?raw';
import fileText from '@phosphor-icons/core/assets/fill/file-text-fill.svg?raw';
import flame from '@phosphor-icons/core/assets/fill/flame-fill.svg?raw';
import headphones from '@phosphor-icons/core/assets/fill/headphones-fill.svg?raw';
import heart from '@phosphor-icons/core/assets/fill/heart-fill.svg?raw';
import lock from '@phosphor-icons/core/assets/fill/lock-fill.svg?raw';
import medal from '@phosphor-icons/core/assets/fill/medal-fill.svg?raw';
import notebook from '@phosphor-icons/core/assets/fill/notebook-fill.svg?raw';
import plant from '@phosphor-icons/core/assets/fill/plant-fill.svg?raw';
import play from '@phosphor-icons/core/assets/fill/play-fill.svg?raw';
import question from '@phosphor-icons/core/assets/fill/question-fill.svg?raw';
import sealCheck from '@phosphor-icons/core/assets/fill/seal-check-fill.svg?raw';
import shieldCheck from '@phosphor-icons/core/assets/fill/shield-check-fill.svg?raw';
import stack from '@phosphor-icons/core/assets/fill/stack-fill.svg?raw';
import star from '@phosphor-icons/core/assets/fill/star-fill.svg?raw';
import users from '@phosphor-icons/core/assets/fill/users-fill.svg?raw';

export const FEATURE_ICONS = {
  'arrows-clockwise': arrowsClockwise,
  'book-open': bookOpen,
  'chart-bar': chartBar,
  'chart-line-up': chartLineUp,
  'check-circle': checkCircle,
  clock,
  'file-text': fileText,
  flame,
  headphones,
  heart,
  lock,
  medal,
  notebook,
  plant,
  play,
  question,
  'seal-check': sealCheck,
  'shield-check': shieldCheck,
  stack,
  star,
  users,
} as const;

export type FeatureIconName = keyof typeof FEATURE_ICONS;
