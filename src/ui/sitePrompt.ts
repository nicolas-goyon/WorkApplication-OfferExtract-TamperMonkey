/** One-off "is this a job site?" prompt, shown until the hostname has an answer on record. */
import { getButtonCorner } from '../core/buttonPosition';
import { setSiteStatus } from '../core/siteStatus';
import { cornerStyles } from './cornerStyles';

const PROMPT_ID = 'offerextract-site-prompt';
const PROMPT_MARGIN = 84; // clears the floating button

export function showSitePrompt(onAnswered?: (isJobSite: boolean) => void): void {
  if (document.getElementById(PROMPT_ID)) return;

  const box = document.createElement('div');
  box.id = PROMPT_ID;
  Object.assign(box.style, {
    position: 'fixed',
    zIndex: '2147483647',
    width: '260px',
    background: '#111827',
    color: '#f9fafb',
    borderRadius: '12px',
    boxShadow: '0 8px 30px rgba(0,0,0,.4)',
    padding: '16px',
    font: '13px/1.4 system-ui, sans-serif',
  } satisfies Partial<CSSStyleDeclaration>);
  Object.assign(box.style, cornerStyles(getButtonCorner(), PROMPT_MARGIN));

  const question = document.createElement('p');
  question.textContent = 'Is this a job-related website (job board, ATS, application form)?';
  Object.assign(question.style, { margin: '0 0 12px', color: '#f9fafb' } satisfies Partial<CSSStyleDeclaration>);
  box.appendChild(question);

  const row = document.createElement('div');
  Object.assign(row.style, { display: 'flex', gap: '8px' } satisfies Partial<CSSStyleDeclaration>);

  const answer = (isJobSite: boolean) => {
    setSiteStatus(location.hostname, isJobSite);
    box.remove();
    onAnswered?.(isJobSite);
  };

  const yesButton = document.createElement('button');
  yesButton.type = 'button';
  yesButton.textContent = 'Yes';
  styleAnswerButton(yesButton, '#2563eb');
  yesButton.addEventListener('click', () => answer(true));

  const noButton = document.createElement('button');
  noButton.type = 'button';
  noButton.textContent = 'No';
  styleAnswerButton(noButton, '#374151');
  noButton.addEventListener('click', () => answer(false));

  row.appendChild(yesButton);
  row.appendChild(noButton);
  box.appendChild(row);

  document.body.appendChild(box);
}

function styleAnswerButton(button: HTMLButtonElement, background: string): void {
  Object.assign(button.style, {
    flex: '1',
    padding: '8px',
    borderRadius: '6px',
    border: 'none',
    background,
    color: '#fff',
    cursor: 'pointer',
    font: 'inherit',
  } satisfies Partial<CSSStyleDeclaration>);
}
