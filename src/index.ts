/**
 * Root barrel, bundled by esbuild -> dist/tampermonkey-offerextract.js,
 * exposed on window.TMOfferExtract (see scripts/build.mjs). Re-exports the
 * generic extractor plus every site-specific module, behind a single
 * @require.
 */
import * as Generic from './sites/generic';

export { Generic };

import { registerMenuCommand } from './core/menuCommand';
import { hasAskedForSite } from './core/siteStatus';
import { installFloatingButton } from './ui/floatingButton';
import { openMenu, registerMenuTabs, toggleMenu } from './ui/menuPanel';
import { showSitePrompt } from './ui/sitePrompt';
import { jobExtractionTab } from './ui/tabs/jobExtractionTab';
import { settingsTab } from './ui/tabs/settingsTab';
import { observeAndReinstallButton } from './shared/ui/notify';

const BUTTON_ID = 'offerextract-button';

export interface InitConfig {
  /** Label of the floating button. Default: "☰". */
  buttonLabel?: string;
  /** Label of the Tampermonkey menu command. Default: "Open Offer Extract menu". */
  menuCommandLabel?: string;
}

/**
 * Call from your local Tampermonkey script. Installs the floating,
 * draggable button and the matching Tampermonkey menu command — both open
 * the same menu panel (nav bar: Job extraction, Settings). On a hostname
 * visited for the first time, also asks once whether it's job-related and
 * remembers the answer from then on. Runs on every site; nothing is
 * submitted or modified on the page.
 */
export function init(config: InitConfig = {}): void {
  registerMenuTabs([jobExtractionTab, settingsTab]);

  const install = () =>
    installFloatingButton({
      id: BUTTON_ID,
      label: config.buttonLabel ?? '☰',
      onClick: toggleMenu,
    });

  install();
  observeAndReinstallButton(install);

  registerMenuCommand(config.menuCommandLabel ?? 'Open Offer Extract menu', openMenu);

  if (!hasAskedForSite(location.hostname)) {
    showSitePrompt();
  }
}
