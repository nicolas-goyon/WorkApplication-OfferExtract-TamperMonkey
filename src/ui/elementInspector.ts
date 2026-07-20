/**
 * DevTools-style element picker: while active, the element under the mouse
 * is outlined; clicking it resolves the picker with that element, Escape
 * cancels it. Ignores clicks/hovers on the plugin's own UI (floating
 * button, menu panel, the picker's own overlay/banner) so you can't
 * accidentally "select" the extension chrome.
 */
import { createOverlayBox, hideOverlayBox, positionOverlayOnElement } from '../shared/ui/elementOverlay';

const OVERLAY_ID = 'offerextract-inspect-overlay';
const BANNER_ID = 'offerextract-inspect-banner';
const OWN_UI_SELECTOR = `#${OVERLAY_ID}, #${BANNER_ID}, #offerextract-menu-panel, #offerextract-button`;

export interface InspectorHandle {
  /** Cancels the picker programmatically, as if Escape had been pressed. */
  cancel: () => void;
}

/**
 * Starts hover-to-highlight / click-to-select mode on the whole document.
 * Exactly one of onSelect/onCancel fires, then the picker tears itself down.
 */
export function startInspecting(onSelect: (el: Element) => void, onCancel: () => void): InspectorHandle {
  const overlay = createOverlayBox('#2563eb');
  overlay.id = OVERLAY_ID;
  const banner = createBanner();
  document.body.appendChild(overlay);
  document.body.appendChild(banner);

  const previousCursor = document.documentElement.style.cursor;
  document.documentElement.style.cursor = 'crosshair';

  let stopped = false;

  const targetAt = (event: MouseEvent): Element | null => {
    const el = document.elementFromPoint(event.clientX, event.clientY);
    return el && !el.closest(OWN_UI_SELECTOR) ? el : null;
  };

  const onMouseMove = (event: MouseEvent) => {
    const target = targetAt(event);
    if (target) positionOverlayOnElement(overlay, target);
    else hideOverlayBox(overlay);
  };

  const onClick = (event: MouseEvent) => {
    const target = targetAt(event);
    if (!target) return;
    event.preventDefault();
    event.stopPropagation();
    stop();
    onSelect(target);
  };

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key !== 'Escape') return;
    stop();
    onCancel();
  };

  function stop(): void {
    if (stopped) return;
    stopped = true;
    document.removeEventListener('mousemove', onMouseMove, true);
    document.removeEventListener('click', onClick, true);
    document.removeEventListener('keydown', onKeyDown, true);
    document.documentElement.style.cursor = previousCursor;
    overlay.remove();
    banner.remove();
  }

  document.addEventListener('mousemove', onMouseMove, true);
  document.addEventListener('click', onClick, true);
  document.addEventListener('keydown', onKeyDown, true);

  return {
    cancel: () => {
      if (stopped) return;
      stop();
      onCancel();
    },
  };
}

function createBanner(): HTMLDivElement {
  const banner = document.createElement('div');
  banner.id = BANNER_ID;
  banner.textContent = 'Click an element to select it — Esc to cancel';
  Object.assign(banner.style, {
    position: 'fixed',
    top: '16px',
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: '2147483647',
    background: '#111827',
    color: '#f9fafb',
    padding: '8px 16px',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,.35)',
    font: '13px/1.4 system-ui, sans-serif',
    pointerEvents: 'none',
  } satisfies Partial<CSSStyleDeclaration>);
  return banner;
}
