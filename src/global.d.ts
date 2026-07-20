export {};

declare global {
  /**
   * Provided by Tampermonkey/Greasemonkey via @grant unsafeWindow.
   * Absent outside a userscript context, hence the optional typing.
   */
  const unsafeWindow: (Window & typeof globalThis) | undefined;
}
