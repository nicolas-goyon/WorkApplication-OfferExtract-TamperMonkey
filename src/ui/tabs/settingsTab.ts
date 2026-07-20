/** Settings tab: reset the floating button position, forget this site's classification. */
import { getButtonCorner, setButtonCorner } from '../../core/buttonPosition';
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

    container.appendChild(positionLabel);
    container.appendChild(resetPositionButton);
    container.appendChild(siteLabel);
    container.appendChild(forgetButton);
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
