/**
 * Root barrel, bundled by esbuild -> dist/tampermonkey-offerextract.js,
 * exposed on window.TMOfferExtract (see scripts/build.mjs). Re-exports the
 * generic extractor plus every site-specific module, behind a single
 * @require.
 */
import * as Generic from './sites/generic';

export { Generic };

import { registerMenuCommand } from './core/menuCommand';
import { seedDefaultJobSitesOnce } from './core/seedDefaultSites';
import { getSiteStatus, hasAskedForSite } from './core/siteStatus';
import { installFloatingButton, removeFloatingButton } from './ui/floatingButton';
import { openMenu, registerMenuTabs, toggleMenu } from './ui/menuPanel';
import { showSitePrompt } from './ui/sitePrompt';
import { jobExtractionTab } from './ui/tabs/jobExtractionTab';
import { settingsTab } from './ui/tabs/settingsTab';
import { sitesTab } from './ui/tabs/sitesTab';

const BUTTON_ID = 'offerextract-button';

export interface InitConfig {
  /** Label of the floating button. Default: "☰". */
  buttonLabel?: string;
  /** Label of the Tampermonkey menu command. Default: "Open Offer Extract menu". */
  menuCommandLabel?: string;
  loadDefaultJobSites?: boolean;
}

export function init(config: InitConfig = {}): void {
  if (window.self !== window.top) return;

  seedDefaultJobSitesOnce(config.loadDefaultJobSites ?? false);

  registerMenuTabs([jobExtractionTab, sitesTab, settingsTab]);

  const applyButtonVisibility = (isJobSite: boolean | undefined) => {
    if (isJobSite === false) {
      removeFloatingButton(BUTTON_ID);
    } else {
      installFloatingButton({
        id: BUTTON_ID,
        label: config.buttonLabel ?? '☰',
        onClick: toggleMenu,
      });
    }
  };

  applyButtonVisibility(getSiteStatus(location.hostname));

  registerMenuCommand(config.menuCommandLabel ?? 'Open Offer Extract menu', openMenu);

  if (!hasAskedForSite(location.hostname)) {
    showSitePrompt();
  }
}
