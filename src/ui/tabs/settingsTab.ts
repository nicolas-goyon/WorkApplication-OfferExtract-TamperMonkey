/** Settings tab: reset the floating button position, forget this site's classification, reset default job sites. */
import { getButtonCorner, setButtonCorner } from '../../core/buttonPosition';
import { DEFAULT_JOB_SITE_HOSTNAMES } from '../../core/defaultJobSites';
import { resetDefaultJobSites } from '../../core/seedDefaultSites';
import { clearSiteStatus } from '../../core/siteStatus';
import type { MenuTab } from '../menuPanel';

export const settingsTab: MenuTab = {
  id: 'settings',
  label: 'Settings',
  render(container) {
    const positionLabel = document.createElement('p');
    positionLabel.textContent = `Button position: ${getButtonCorner()}`;
    Object.assign(positionLabel.style, { margin: '0 0 8px' } satisfies Partial<CSSStyleDeclaration>);

    const resetPositionButton = document.createElement('button');
    resetPositionButton.type = 'button';
    resetPositionButton.textContent = 'Reset to bottom-right';
    styleButton(resetPositionButton);
    resetPositionButton.addEventListener('click', () => {
      setButtonCorner('bottom-right');
      positionLabel.textContent = 'Button position: bottom-right';
    });

    const siteLabel = document.createElement('p');
    siteLabel.textContent = `This site: ${location.hostname}`;
    Object.assign(siteLabel.style, { margin: '16px 0 8px' } satisfies Partial<CSSStyleDeclaration>);

    const forgetButton = document.createElement('button');
    forgetButton.type = 'button';
    forgetButton.textContent = 'Forget this site (ask again)';
    styleButton(forgetButton);
    forgetButton.addEventListener('click', () => {
      clearSiteStatus(location.hostname);
      forgetButton.textContent = 'Forgotten — will ask again on reload.';
      forgetButton.disabled = true;
      forgetButton.style.cursor = 'default';
      forgetButton.style.opacity = '.6';
    });

    const defaultsLabel = document.createElement('p');
    defaultsLabel.textContent = 'Default job sites';
    Object.assign(defaultsLabel.style, { margin: '16px 0 4px' } satisfies Partial<CSSStyleDeclaration>);

    const defaultsHint = document.createElement('p');
    defaultsHint.textContent =
      "Re-marks the built-in list of common job boards/ATS as job sites, without touching any other site you've classified yourself.";
    Object.assign(defaultsHint.style, {
      margin: '0 0 8px',
      color: '#9ca3af',
      fontSize: '12px',
    } satisfies Partial<CSSStyleDeclaration>);

    const resetDefaultsButton = document.createElement('button');
    resetDefaultsButton.type = 'button';
    resetDefaultsButton.textContent = `Reset ${DEFAULT_JOB_SITE_HOSTNAMES.length} default job sites`;
    styleButton(resetDefaultsButton);
    resetDefaultsButton.addEventListener('click', () => {
      resetDefaultJobSites();
      resetDefaultsButton.textContent = 'Done — default sites restored.';
      resetDefaultsButton.disabled = true;
      resetDefaultsButton.style.cursor = 'default';
      resetDefaultsButton.style.opacity = '.6';
    });

    container.appendChild(positionLabel);
    container.appendChild(resetPositionButton);
    container.appendChild(siteLabel);
    container.appendChild(forgetButton);
    container.appendChild(defaultsLabel);
    container.appendChild(defaultsHint);
    container.appendChild(resetDefaultsButton);
  },
};

function styleButton(button: HTMLButtonElement): void {
  Object.assign(button.style, {
    display: 'block',
    width: '100%',
    padding: '8px 12px',
    borderRadius: '6px',
    border: '1px solid rgba(255,255,255,.2)',
    background: 'transparent',
    color: '#f9fafb',
    cursor: 'pointer',
    font: 'inherit',
  } satisfies Partial<CSSStyleDeclaration>);
}
