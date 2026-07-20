/**
 * Persistent highlight box pinned to the currently-selected element (as
 * opposed to elementInspector.ts's transient hover box). Tracks the
 * element's position every frame so it stays put across scrolling, resizing,
 * or layout shifts on the underlying page, without needing per-site scroll
 * listeners.
 */
import { createOverlayBox, positionOverlayOnElement } from '../shared/ui/elementOverlay';

let box: HTMLDivElement | null = null;
let rafId: number | null = null;
let currentEl: Element | null = null;

export function showSelectionHighlight(el: Element): void {
  currentEl = el;
  if (!box) {
    box = createOverlayBox('#22c55e');
    document.body.appendChild(box);
  }
  positionOverlayOnElement(box, el);
  if (rafId === null) tick();
}

export function hideSelectionHighlight(): void {
  currentEl = null;
  if (rafId !== null) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
  box?.remove();
  box = null;
}

function tick(): void {
  if (currentEl && box) positionOverlayOnElement(box, currentEl);
  rafId = requestAnimationFrame(tick);
}
