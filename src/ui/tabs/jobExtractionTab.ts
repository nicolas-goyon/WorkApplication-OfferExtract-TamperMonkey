/**
 * Job extraction tab. Extraction itself is the next feature; for now this
 * shows/lets you change the current site's job classification.
 */
import { getSiteStatus, setSiteStatus } from '../../core/siteStatus';
import type { MenuTab } from '../menuPanel';

export const jobExtractionTab: MenuTab = {
  id: 'job-extraction',
  label: 'Job extraction',
  render(container) {
    const hostname = location.hostname;

    const statusLine = document.createElement('p');
    Object.assign(statusLine.style, { margin: '0 0 10px' } satisfies Partial<CSSStyleDeclaration>);

    const toggleRow = document.createElement('div');
    Object.assign(toggleRow.style, {
      display: 'flex',
      gap: '8px',
      marginBottom: '14px',
    } satisfies Partial<CSSStyleDeclaration>);

    const yesButton = document.createElement('button');
    const noButton = document.createElement('button');
    yesButton.type = 'button';
    noButton.type = 'button';
    yesButton.textContent = 'Job site';
    noButton.textContent = 'Not a job site';
    styleChoiceButton(yesButton);
    styleChoiceButton(noButton);

    const refresh = () => {
      const status = getSiteStatus(hostname);
      statusLine.textContent = describeStatus(hostname, status);
      setActive(yesButton, status === true);
      setActive(noButton, status === false);
    };

    yesButton.addEventListener('click', () => {
      setSiteStatus(hostname, true);
      refresh();
    });
    noButton.addEventListener('click', () => {
      setSiteStatus(hostname, false);
      refresh();
    });

    toggleRow.appendChild(yesButton);
    toggleRow.appendChild(noButton);

    const placeholder = document.createElement('p');
    placeholder.textContent = 'Offer extraction is coming soon.';
    Object.assign(placeholder.style, {
      margin: '0',
      color: '#9ca3af',
    } satisfies Partial<CSSStyleDeclaration>);

    container.appendChild(statusLine);
    container.appendChild(toggleRow);
    container.appendChild(placeholder);
    refresh();
  },
};

function describeStatus(hostname: string, status: boolean | undefined): string {
  if (status === true) return `${hostname} is marked as a job site.`;
  if (status === false) return `${hostname} is marked as not a job site.`;
  return `${hostname} hasn't been classified yet.`;
}

function styleChoiceButton(button: HTMLButtonElement): void {
  Object.assign(button.style, {
    flex: '1',
    padding: '8px',
    borderRadius: '6px',
    border: '1px solid rgba(255,255,255,.2)',
    background: 'transparent',
    color: '#f9fafb',
    cursor: 'pointer',
    font: 'inherit',
  } satisfies Partial<CSSStyleDeclaration>);
}

function setActive(button: HTMLButtonElement, active: boolean): void {
  button.style.borderColor = active ? '#2563eb' : 'rgba(255,255,255,.2)';
  button.style.background = active ? '#2563eb' : 'transparent';
}
