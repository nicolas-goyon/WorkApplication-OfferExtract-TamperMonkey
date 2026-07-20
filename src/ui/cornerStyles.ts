import type { Corner } from '../core/buttonPosition';

/** Fixed-position left/right/top/bottom styles anchoring an element to a screen corner. */
export function cornerStyles(corner: Corner, margin: number): Partial<CSSStyleDeclaration> {
  const base: Partial<CSSStyleDeclaration> = { left: 'auto', right: 'auto', top: 'auto', bottom: 'auto' };
  switch (corner) {
    case 'top-left':
      return { ...base, top: `${margin}px`, left: `${margin}px` };
    case 'top-right':
      return { ...base, top: `${margin}px`, right: `${margin}px` };
    case 'bottom-left':
      return { ...base, bottom: `${margin}px`, left: `${margin}px` };
    case 'bottom-right':
    default:
      return { ...base, bottom: `${margin}px`, right: `${margin}px` };
  }
}
