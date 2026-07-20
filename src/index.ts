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
import { getSiteStatus, hasAskedForSite, onSiteStatusChange } from './core/siteStatus';
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

/**
 * Call from your local Tampermonkey script. Installs the floating,
 * draggable button and the matching Tampermonkey menu command — both open
 * the same menu panel (nav bar: Job extraction, Sites, Settings). On a
 * hostname visited for the first time, also asks once whether it's
 * job-related and remembers the answer from then on. The very first time
 * the plugin ever runs, it also pre-seeds a starter list of common job
 * boards/ATS hostnames (see core/defaultJobSites.ts) as job sites.
 *
 * If a hostname is marked as *not* job-related, the button stays hidden and
 * nothing else runs on that site — the Tampermonkey menu command is the
 * only way in, so the site can still be reclassified from the menu.
 * Runs on every site; nothing is submitted or modified on the page.
 */
export function init(config: InitConfig = {}): void {
  // Tampermonkey runs @require'd code in every frame unless @noframes is
  // set. Job sites commonly embed iframes (ads, chat widgets, ATS embeds),
  // which would otherwise each get their own button/menu/prompt. The button
  // only ever makes sense once per page, so skip everything in subframes.
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

  // onSiteStatusChange((hostname, isJobSite) => {
  //   if (hostname === location.hostname) applyButtonVisibility(isJobSite);
  // });

  registerMenuCommand(config.menuCommandLabel ?? 'Open Offer Extract menu', openMenu);

  if (!hasAskedForSite(location.hostname)) {
    showSitePrompt();
  }
}
