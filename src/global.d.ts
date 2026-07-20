export {};

declare global {
  /**
   * Provided by Tampermonkey/Greasemonkey via @grant unsafeWindow.
   * Absent outside a userscript context, hence the optional typing.
   */
  const unsafeWindow: (Window & typeof globalThis) | undefined;

  /** Provided by @grant GM_getValue. Reads a value persisted via GM_setValue. */
  function GM_getValue<T>(name: string, defaultValue: T): T;
  /** Provided by @grant GM_setValue. Persists a value across page loads/sites. */
  function GM_setValue(name: string, value: unknown): void;
  /** Provided by @grant GM_addValueChangeListener. Fires on change, including from other tabs. */
  function GM_addValueChangeListener(
    name: string,
    callback: (name: string, oldValue: unknown, newValue: unknown, remote: boolean) => void,
  ): number;
  /** Provided by @grant GM_registerMenuCommand. Adds an entry to the Tampermonkey menu. */
  function GM_registerMenuCommand(name: string, callback: () => void, accessKey?: string): number;
}
