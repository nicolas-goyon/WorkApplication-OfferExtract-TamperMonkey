/** Persisted corner of the floating button, shared across every site. */
import { getValue, setValue } from './storage';

export type Corner = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

export const BUTTON_CORNER_KEY = 'offerextract:buttonCorner';
const DEFAULT_CORNER: Corner = 'bottom-right';

export function getButtonCorner(): Corner {
  return getValue<Corner>(BUTTON_CORNER_KEY, DEFAULT_CORNER);
}

export function setButtonCorner(corner: Corner): void {
  setValue(BUTTON_CORNER_KEY, corner);
}
