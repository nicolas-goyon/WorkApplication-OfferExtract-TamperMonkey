/**
 * Optional "AI copy" config, set once from init() (see index.ts) from
 * literals in the user's local Tampermonkey script — not stored/edited
 * through the UI. Lets the user prepare a fixed pre-prompt that gets
 * prepended to whatever text the Job extraction tab copies, plus an
 * optional decoration (wrapping characters, e.g. quotes or a code fence)
 * around the copied selection itself — handy for a one-click
 * "paste into ChatGPT/Claude" flow.
 */
export interface PromptConfig {
  /** Prepended before the copied selection, followed by a blank line. Empty = no pre-prompt. */
  prePrompt: string;
  /** Wraps the copied selection on both sides, e.g. `"`, `'`, `` ` ``, or ```` ``` ````. */
  selectionDecoration: string;
  /** Whether selectionDecoration is actually applied. Default: false. */
  decorateSelection: boolean;
}

let config: PromptConfig = {
  prePrompt: '',
  selectionDecoration: '',
  decorateSelection: false,
};

export function setPromptConfig(next: Partial<PromptConfig>): void {
  config = { ...config, ...next };
}

/** Applies the configured pre-prompt and/or selection decoration to a piece of copied text. */
export function applyPromptConfig(text: string): string {
  const { prePrompt, selectionDecoration, decorateSelection } = config;
  const decorated =
    decorateSelection && selectionDecoration ? `${selectionDecoration}${text}${selectionDecoration}` : text;
  return prePrompt ? `${prePrompt}\n\n${decorated}` : decorated;
}
