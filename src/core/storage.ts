/**
 * Thin wrapper around Tampermonkey's GM_* value storage, so the rest of the
 * app never touches GM_getValue/GM_setValue/GM_addValueChangeListener
 * directly. Falls back to localStorage when running outside a userscript
 * context (e.g. plain browser testing); cross-tab change notifications are
 * unavailable in that fallback, so same-tab callers should re-render
 * themselves after calling setValue rather than relying on onValueChange.
 */

export type ChangeListener<T> = (newValue: T, oldValue: T | undefined, remote: boolean) => void;

function hasGMStorage(): boolean {
  return typeof GM_getValue === 'function' && typeof GM_setValue === 'function';
}

export function getValue<T>(key: string, defaultValue: T): T {
  if (hasGMStorage()) return GM_getValue<T>(key, defaultValue);
  try {
    const raw = window.localStorage.getItem(key);
    return raw !== null ? (JSON.parse(raw) as T) : defaultValue;
  } catch {
    return defaultValue;
  }
}

export function setValue<T>(key: string, value: T): void {
  if (hasGMStorage()) {
    GM_setValue(key, value);
    return;
  }
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore storage errors (e.g. private browsing quota)
  }
}

export function onValueChange<T>(key: string, listener: ChangeListener<T>): void {
  if (typeof GM_addValueChangeListener === 'function') {
    GM_addValueChangeListener(key, (_name, oldValue, newValue, remote) =>
      listener(newValue as T, oldValue as T | undefined, remote),
    );
  }
}
