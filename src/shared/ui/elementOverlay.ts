/**
 * Minimal "DevTools inspector" style overlay box: a fixed-position,
 * pointer-events-none div that can be snapped onto any element's current
 * bounding rect. Shared by the hover picker (elementInspector.ts) and the
 * persistent selection highlight (elementSelectionHighlight.ts).
 */

/** Creates a detached overlay box; caller is responsible for appending/removing it. */
export function createOverlayBox(color: string, zIndex = 2147483646): HTMLDivElement {
  const box = document.createElement('div');
  Object.assign(box.style, {
    position: 'fixed',
    zIndex: String(zIndex),
    pointerEvents: 'none',
    border: `2px solid ${color}`,
    background: `${color}26`,
    boxSizing: 'border-box',
    display: 'none',
  } satisfies Partial<CSSStyleDeclaration>);
  return box;
}

/** Moves/resizes an overlay box to match an element's current viewport rect. */
export function positionOverlayOnElement(box: HTMLDivElement, el: Element): void {
  const rect = el.getBoundingClientRect();
  Object.assign(box.style, {
    display: 'block',
    top: `${rect.top}px`,
    left: `${rect.left}px`,
    width: `${rect.width}px`,
    height: `${rect.height}px`,
  } satisfies Partial<CSSStyleDeclaration>);
}

export function hideOverlayBox(box: HTMLDivElement): void {
  box.style.display = 'none';
}
