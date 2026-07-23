/**
 * Root barrel, bundled by esbuild -> dist/tampermonkey-offerextract.js,
 * exposed on window.TMOfferExtract (see scripts/build.mjs). Re-exports the
 * generic extractor plus every site-specific module, behind a single
 * @require.
 */
import * as Generic from './sites/generic';
import * as Apec from './sites/apec';
import * as ChoisirLeServicePublic from './sites/choisirleservicepublic';
import * as Hellowork from './sites/hellowork';
import * as LinkedIn from './sites/linkedin';

export { Generic, Apec, ChoisirLeServicePublic, Hellowork, LinkedIn };

import { registerMenuCommand } from './core/menuCommand';
import { setPromptConfig } from './core/promptConfig';
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
  /**
   * Fixed text prepended to whatever the Job extraction tab copies —
   * e.g. a standing instruction for pasting straight into an AI chat.
   * Default: none.
   */
  prePrompt?: string;
  /**
   * Wraps the copied selection on both sides with this string (e.g. `"`,
   * `'`, `` ` ``, or a code fence like ` ``` `). Only applied when
   * decorateSelection is true. Default: none.
   */
  selectionDecoration?: string;
  /** Turns selectionDecoration on/off. Default: false. */
  decorateSelection?: boolean;
}

export function init(config: InitConfig = {}): void {
  if (window.self !== window.top) return;

  setPromptConfig({
    prePrompt: config.prePrompt ?? '',
    selectionDecoration: config.selectionDecoration ?? '',
    decorateSelection: config.decorateSelection ?? false,
  });

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
