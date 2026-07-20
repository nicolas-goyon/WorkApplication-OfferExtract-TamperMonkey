/** Minimal floating-button + toast helper, shared by every site module. */

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
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), durationMs);
}

export interface ButtonOptions {
  id: string;
  label: string;
  onClick: () => void;
}

/** Installs a floating action button, replacing any previous one with the same id. */
export function installButton({ id, label, onClick }: ButtonOptions): void {
  document.getElementById(id)?.remove();

  const button = document.createElement('button');
  button.id = id;
  button.textContent = label;
  Object.assign(button.style, {
    position: 'fixed',
    right: '16px',
    bottom: '64px',
    zIndex: '2147483647',
    padding: '10px 16px',
    borderRadius: '999px',
    border: 'none',
    background: '#2563eb',
    color: '#fff',
    font: '13px/1 system-ui, sans-serif',
    cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(0,0,0,.25)',
  } satisfies Partial<CSSStyleDeclaration>);
  button.addEventListener('click', onClick);
  document.body.appendChild(button);
}

/** Re-installs the button whenever the SPA wipes the DOM subtree it lived in. */
export function observeAndReinstallButton(install: () => void): void {
  const observer = new MutationObserver(() => {
    if (!document.body) return;
    install();
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
}
