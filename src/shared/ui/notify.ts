/** Minimal floating-button + toast helper, shared by every site module. */
import { getUIRoot } from '../dom/uiRoot';

export interface NotifierOptions {
  durationMs?: number;
}

/** Shows a small transient toast in the bottom-right corner of the page. */
export function notify(message: string, options: NotifierOptions = {}): void {
  const { durationMs = 4000 } = options;
  const toast = document.createElement('div');
  toast.textContent = message;
  Object.assign(toast.style, {
    position: 'fixed',
    right: '16px',
    bottom: '16px',
    zIndex: '2147483647',
    background: '#1f2937',
    color: '#f9fafb',
    padding: '10px 14px',
    borderRadius: '8px',
    font: '13px/1.4 system-ui, sans-serif',
    boxShadow: '0 2px 8px rgba(0,0,0,.25)',
    maxWidth: '320px',
  } satisfies Partial<CSSStyleDeclaration>);
  getUIRoot().appendChild(toast);
  setTimeout(() => toast.remove(), durationMs);
}

