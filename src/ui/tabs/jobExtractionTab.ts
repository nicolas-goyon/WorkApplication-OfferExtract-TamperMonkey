/**
 * Job extraction tab: current-site job classification, plus a DevTools-style
 * "Fetch offer" element picker. Clicking "Fetch offer" closes the menu,
 * hover-highlights whatever's under the mouse, and resolves on click. The
 * tab then shows the picked element with a range slider that walks up its
 * ancestor chain (re-highlighting the wider box each step) until you're
 * happy with the selection, at which point you can copy its cleaned text.
 */
import { notify } from '../../shared/ui/notify';
import { applyPromptConfig } from '../../core/promptConfig';
import { getSiteStatus, setSiteStatus } from '../../core/siteStatus';
import { getSiteTemplate } from '../../core/siteTemplates';
import type { SiteTemplate } from '../../core/siteTemplates';
import { elementToCleanText } from '../../shared/dom/htmlToText';
import { startInspecting } from '../elementInspector';
import { hideSelectionHighlight, showSelectionHighlight } from '../elementSelectionHighlight';
import { closeMenu, openMenu } from '../menuPanel';
import type { MenuTab } from '../menuPanel';

const MAX_ANCESTOR_LEVELS = 12;
const PREVIEW_MAX_CHARS = 4000;

// Module-level so the picked element survives switching tabs/reopening the
// menu; reset naturally on page reload like the rest of the plugin's state.
let ancestorChain: Element[] = [];
let level = 0;

// Same idea for the automated template pick: `undefined` = not run yet,
// `null` = ran but the site's markup wasn't found (falls back to manual).
let templateText: string | null | undefined;
let templateRunning = false;

function currentSelected(): Element | null {
  return ancestorChain[level] ?? null;
}

export const jobExtractionTab: MenuTab = {
  id: 'job-extraction',
  label: 'Job extraction',
  render(container) {
    const hostname = location.hostname;

    const statusLine = document.createElement('p');
    Object.assign(statusLine.style, { margin: '0 0 10px', color: '#f9fafb' } satisfies Partial<CSSStyleDeclaration>);

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

    const divider = document.createElement('div');
    Object.assign(divider.style, {
      borderTop: '1px solid rgba(255,255,255,.1)',
      margin: '0 0 14px',
    } satisfies Partial<CSSStyleDeclaration>);

    const section = document.createElement('div');

    const refresh = () => {
      const status = getSiteStatus(hostname);
      statusLine.textContent = describeStatus(hostname, status);
      // Once a site is confirmed as job-related, the toggle is just noise —
      // reclassifying happens from the Sites tab or Settings' "Forget this site".
      toggleRow.style.display = status === true ? 'none' : 'flex';
      setActive(yesButton, status === true);
      setActive(noButton, status === false);
      renderExtractionSection(section, status === true);
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

    container.appendChild(statusLine);
    container.appendChild(toggleRow);
    container.appendChild(divider);
    container.appendChild(section);
    refresh();
  },
  onDeactivate() {
    hideSelectionHighlight();
  },
};

/** (Re)builds the "Fetch offer" picker UI. Rebuilt on every status/selection change, but not while dragging the slider (see setUpSlider). */
function renderExtractionSection(section: HTMLElement, isJobSite: boolean): void {
  section.innerHTML = '';

  if (!isJobSite) {
    hideSelectionHighlight();
    const message = document.createElement('p');
    message.textContent = 'Mark this site as a job site to enable offer extraction.';
    Object.assign(message.style, { margin: '0', color: '#9ca3af' } satisfies Partial<CSSStyleDeclaration>);
    section.appendChild(message);
    return;
  }

  const template = getSiteTemplate(location.hostname);
  if (template) {
    section.appendChild(buildTemplateBlock(section, template));

    const manualLabel = document.createElement('p');
    manualLabel.textContent = 'Manual picking (fallback)';
    Object.assign(manualLabel.style, {
      margin: '4px 0 8px',
      color: '#9ca3af',
      fontSize: '12px',
      textTransform: 'uppercase',
      letterSpacing: '.04em',
    } satisfies Partial<CSSStyleDeclaration>);
    section.appendChild(manualLabel);
  }

  const selected = currentSelected();

  const pickRow = document.createElement('div');
  Object.assign(pickRow.style, {
    display: 'flex',
    gap: '8px',
    marginBottom: '12px',
  } satisfies Partial<CSSStyleDeclaration>);

  const pickButton = document.createElement('button');
  pickButton.type = 'button';
  pickButton.textContent = selected ? 'Re-pick element' : 'Fetch offer';
  styleActionButton(pickButton, true);
  pickButton.addEventListener('click', () => startPicking());
  pickRow.appendChild(pickButton);

  if (selected) {
    const clearButton = document.createElement('button');
    clearButton.type = 'button';
    clearButton.textContent = 'Clear';
    styleActionButton(clearButton, false);
    clearButton.addEventListener('click', () => {
      ancestorChain = [];
      level = 0;
      hideSelectionHighlight();
      renderExtractionSection(section, true);
    });
    pickRow.appendChild(clearButton);
  }

  section.appendChild(pickRow);

  if (!selected) {
    const hint = document.createElement('p');
    hint.textContent = 'Click "Fetch offer", then click any element on the page (e.g. a paragraph of the description). Press Esc to cancel.';
    Object.assign(hint.style, { margin: '0', color: '#f9fafb' } satisfies Partial<CSSStyleDeclaration>);
    section.appendChild(hint);
    return;
  }

  showSelectionHighlight(selected);

  const label = document.createElement('p');
  Object.assign(label.style, {
    margin: '0 0 6px',
    fontFamily: 'ui-monospace, SFMono-Regular, monospace',
    fontSize: '12px',
    color: '#f9fafb',
    overflowWrap: 'anywhere',
  } satisfies Partial<CSSStyleDeclaration>);

  const sliderRow = document.createElement('div');
  Object.assign(sliderRow.style, {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '12px',
  } satisfies Partial<CSSStyleDeclaration>);

  const sliderCaption = document.createElement('span');
  sliderCaption.textContent = 'Zoom out';
  Object.assign(sliderCaption.style, { color: '#9ca3af', flex: '0 0 auto' } satisfies Partial<CSSStyleDeclaration>);

  const slider = document.createElement('input');
  slider.type = 'range';
  slider.min = '0';
  slider.max = String(Math.max(ancestorChain.length - 1, 0));
  slider.value = String(level);
  slider.disabled = ancestorChain.length <= 1;
  Object.assign(slider.style, { flex: '1' } satisfies Partial<CSSStyleDeclaration>);

  const sliderValue = document.createElement('span');
  Object.assign(sliderValue.style, { color: '#9ca3af', flex: '0 0 auto', minWidth: '48px', textAlign: 'right' } satisfies Partial<CSSStyleDeclaration>);

  const preview = document.createElement('pre');
  Object.assign(preview.style, {
    margin: '0 0 12px',
    padding: '10px',
    background: '#0b1220',
    border: '1px solid rgba(255,255,255,.1)',
    borderRadius: '8px',
    maxHeight: '220px',
    overflow: 'auto',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    fontFamily: 'ui-monospace, SFMono-Regular, monospace',
    fontSize: '11px',
    color: '#d1d5db',
  } satisfies Partial<CSSStyleDeclaration>);

  const copyButton = document.createElement('button');
  copyButton.type = 'button';
  copyButton.textContent = 'Copy selected text';
  styleActionButton(copyButton, true);
  copyButton.addEventListener('click', () => {
    const el = currentSelected();
    if (!el) return;
    copyToClipboard(applyPromptConfig(elementToCleanText(el)));
  });

  const updateForCurrentLevel = () => {
    const el = currentSelected();
    if (!el) return;
    label.textContent = describeElement(el);
    sliderValue.textContent = `${level} / ${Math.max(ancestorChain.length - 1, 0)}`;
    preview.textContent = truncate(applyPromptConfig(elementToCleanText(el)));
    showSelectionHighlight(el);
  };

  slider.addEventListener('input', () => {
    level = Number(slider.value);
    updateForCurrentLevel();
  });

  sliderRow.appendChild(sliderCaption);
  sliderRow.appendChild(slider);
  sliderRow.appendChild(sliderValue);

  section.appendChild(label);
  section.appendChild(sliderRow);
  section.appendChild(preview);
  section.appendChild(copyButton);

  updateForCurrentLevel();
}

/** Builds the "Use <site> template" block: one button, no picking required, falls back to manual picking below it if the markup isn't found or hasn't been run yet. */
function buildTemplateBlock(section: HTMLElement, template: SiteTemplate): HTMLElement {
  const block = document.createElement('div');
  Object.assign(block.style, { marginBottom: '14px' } satisfies Partial<CSSStyleDeclaration>);

  const runButton = document.createElement('button');
  runButton.type = 'button';
  runButton.textContent = templateRunning ? 'Reading page…' : `Use ${template.label} template`;
  runButton.disabled = templateRunning;
  styleActionButton(runButton, true);
  runButton.addEventListener('click', () => {
    void runTemplate(section, template);
  });
  block.appendChild(runButton);

  if (templateText === null && !templateRunning) {
    const message = document.createElement('p');
    message.textContent = `Couldn't find the expected ${template.label} layout on this page — use manual picking below.`;
    Object.assign(message.style, { margin: '10px 0 0', color: '#9ca3af' } satisfies Partial<CSSStyleDeclaration>);
    block.appendChild(message);
  } else if (templateText) {
    const preview = document.createElement('pre');
    Object.assign(preview.style, {
      margin: '10px 0',
      padding: '10px',
      background: '#0b1220',
      border: '1px solid rgba(255,255,255,.1)',
      borderRadius: '8px',
      maxHeight: '220px',
      overflow: 'auto',
      whiteSpace: 'pre-wrap',
      wordBreak: 'break-word',
      fontFamily: 'ui-monospace, SFMono-Regular, monospace',
      fontSize: '11px',
      color: '#d1d5db',
    } satisfies Partial<CSSStyleDeclaration>);
    preview.textContent = truncate(applyPromptConfig(templateText));
    block.appendChild(preview);

    const copyButton = document.createElement('button');
    copyButton.type = 'button';
    copyButton.textContent = 'Copy template text';
    styleActionButton(copyButton, true);
    copyButton.addEventListener('click', () => {
      if (templateText) copyToClipboard(applyPromptConfig(templateText));
    });
    block.appendChild(copyButton);
  }

  return block;
}

async function runTemplate(section: HTMLElement, template: SiteTemplate): Promise<void> {
  templateRunning = true;
  templateText = undefined;
  renderExtractionSection(section, true);

  try {
    templateText = await template.getText();
  } catch {
    templateText = null;
    notify('Template extraction failed — use manual picking below.');
  } finally {
    templateRunning = false;
    renderExtractionSection(section, true);
  }
}

/** Closes the menu, hands off to the hover/click picker, and reopens the menu (re-rendering this tab) once it resolves either way. */
function startPicking(): void {
  hideSelectionHighlight();
  closeMenu();
  startInspecting(
    (el) => {
      ancestorChain = computeAncestorChain(el);
      level = 0;
      openMenu();
    },
    () => {
      openMenu();
    },
  );
}

function computeAncestorChain(el: Element): Element[] {
  const chain: Element[] = [el];
  let current: Element = el;
  while (current.parentElement && chain.length < MAX_ANCESTOR_LEVELS) {
    current = current.parentElement;
    chain.push(current);
    if (current === document.body) break;
  }
  return chain;
}

function describeElement(el: Element): string {
  let out = `<${el.tagName.toLowerCase()}`;
  if (el.id) out += ` id="${el.id}"`;
  const cls = el.getAttribute('class')?.trim();
  if (cls) out += ` class="${cls.length > 80 ? `${cls.slice(0, 80)}…` : cls}"`;
  return `${out}>`;
}

function truncate(text: string): string {
  return text.length > PREVIEW_MAX_CHARS
    ? `${text.slice(0, PREVIEW_MAX_CHARS)}\n… (truncated for preview — full text is copied)`
    : text;
}

async function copyToClipboard(text: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text);
    notify('Copied selected text to clipboard.');
  } catch {
    notify('Could not copy — clipboard access was blocked.');
  }
}

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

function styleActionButton(button: HTMLButtonElement, primary: boolean): void {
  Object.assign(button.style, {
    padding: '8px 14px',
    borderRadius: '6px',
    border: primary ? 'none' : '1px solid rgba(255,255,255,.2)',
    background: primary ? '#2563eb' : 'transparent',
    color: '#f9fafb',
    cursor: 'pointer',
    font: 'inherit',
  } satisfies Partial<CSSStyleDeclaration>);
}

function setActive(button: HTMLButtonElement, active: boolean): void {
  button.style.borderColor = active ? '#2563eb' : 'rgba(255,255,255,.2)';
  button.style.background = active ? '#2563eb' : 'transparent';
}
