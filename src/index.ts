/**
 * Root barrel, bundled by esbuild -> dist/tampermonkey-offerextract.js,
 * exposed on window.TMOfferExtract (see scripts/build.mjs). Re-exports the
 * generic extractor plus every site-specific module, behind a single
 * @require.
 */
import * as Generic from './sites/generic';

export { Generic };

import { installButton, notify, observeAndReinstallButton } from './shared/ui/notify';
import type { OfferData } from './sites/generic/types';

const BUTTON_ID = 'offerextract-button';

export interface InitConfig {
  /** Called with the extracted data once the button is clicked. Default: copy to clipboard + toast. */
  onExtract?: (offer: OfferData) => void;
  /** Label of the floating button. Default: "Extract offer". */
  buttonLabel?: string;
  /** Extractor to run. Default: the generic, site-agnostic one. */
  extract?: () => OfferData;
}

/** Call from your local Tampermonkey script to install the floating "Extract offer" button. */
export function init(config: InitConfig = {}): void {
  const extract = config.extract ?? Generic.extract;
  const onExtract = config.onExtract ?? defaultOnExtract;

  const install = () =>
    installButton({
      id: BUTTON_ID,
      label: config.buttonLabel ?? 'Extract offer',
      onClick: () => onExtract(extract()),
    });

  install();
  observeAndReinstallButton(install);
}

function defaultOnExtract(offer: OfferData): void {
  const json = JSON.stringify(offer, null, 2);
  console.log('[OfferExtract]', offer);
  navigator.clipboard
    ?.writeText(json)
    .then(() => notify('Offer data copied to clipboard.'))
    .catch(() => notify('Offer extracted (see console) — clipboard copy failed.'));
}
