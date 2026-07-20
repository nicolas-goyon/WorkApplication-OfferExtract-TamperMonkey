/** Draggable floating button: click opens the menu, drag snaps to the nearest corner. */
import { BUTTON_CORNER_KEY, getButtonCorner, setButtonCorner, type Corner } from '../core/buttonPosition';
import { onValueChange } from '../core/storage';
import { cornerStyles } from './cornerStyles';

export interface FloatingButtonOptions {
  id: string;
  label: string;
  onClick: () => void;
}

const SIZE = 48;
const MARGIN = 20;
const DRAG_THRESHOLD = 6;

/** Installs the button. No-op if one with this id is already in the document. */
export function installFloatingButton({ id, label, onClick }: FloatingButtonOptions): void {
  if (document.getElementById(id)) return;

  const button = document.createElement('button');
  button.id = id;
  button.type = 'button';
  button.textContent = label;
  button.setAttribute('aria-label', 'Open Offer Extract menu');
  Object.assign(button.style, {
    position: 'fixed',
    zIndex: '2147483647',
    width: `${SIZE}px`,
    height: `${SIZE}px`,
    borderRadius: '50%',
    border: 'none',
    background: '#2563eb',
    color: '#fff',
    font: '20px/1 system-ui, sans-serif',
    cursor: 'grab',
    boxShadow: '0 2px 10px rgba(0,0,0,.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    touchAction: 'none',
    userSelect: 'none',
  } satisfies Partial<CSSStyleDeclaration>);
  Object.assign(button.style, cornerStyles(getButtonCorner(), MARGIN));

  document.body.appendChild(button);

  button.addEventListener('pointerdown', (downEvent) => {
    let dragging = false;
    let lastX = downEvent.clientX;
    let lastY = downEvent.clientY;
    button.setPointerCapture(downEvent.pointerId);

    const onMove = (moveEvent: PointerEvent) => {
      const dx = moveEvent.clientX - lastX;
      const dy = moveEvent.clientY - lastY;
      const totalDx = moveEvent.clientX - downEvent.clientX;
      const totalDy = moveEvent.clientY - downEvent.clientY;

      if (!dragging && Math.hypot(totalDx, totalDy) > DRAG_THRESHOLD) {
        dragging = true;
        button.style.cursor = 'grabbing';
      }

      if (dragging) {
        const rect = button.getBoundingClientRect();
        Object.assign(button.style, {
          left: `${rect.left + dx}px`,
          top: `${rect.top + dy}px`,
          right: 'auto',
          bottom: 'auto',
        } satisfies Partial<CSSStyleDeclaration>);
      }

      lastX = moveEvent.clientX;
      lastY = moveEvent.clientY;
    };

    const onUp = (upEvent: PointerEvent) => {
      button.releasePointerCapture(upEvent.pointerId);
      button.removeEventListener('pointermove', onMove);
      button.removeEventListener('pointerup', onUp);
      button.style.cursor = 'grab';

      if (dragging) {
        const corner = nearestCorner(button.getBoundingClientRect());
        setButtonCorner(corner);
        Object.assign(button.style, cornerStyles(corner, MARGIN));
      } else {
        onClick();
      }
    };

    button.addEventListener('pointermove', onMove);
    button.addEventListener('pointerup', onUp);
  });

  onValueChange<Corner>(BUTTON_CORNER_KEY, (corner) => {
    Object.assign(button.style, cornerStyles(corner, MARGIN));
  });
}

/** Removes the button (if present). Used when a site is marked as not job-related. */
export function removeFloatingButton(id: string): void {
  document.getElementById(id)?.remove();
}

function nearestCorner(rect: DOMRect): Corner {
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  const isLeft = centerX < window.innerWidth / 2;
  const isTop = centerY < window.innerHeight / 2;
  if (isTop) return isLeft ? 'top-left' : 'top-right';
  return isLeft ? 'bottom-left' : 'bottom-right';
}
