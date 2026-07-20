/** Tabbed menu panel, opened by either the floating button or the Tampermonkey menu command. */
import { getButtonCorner } from '../core/buttonPosition';
import { getUIRoot } from '../shared/dom/uiRoot';
import { cornerStyles } from './cornerStyles';

export type MenuTabId = 'job-extraction' | 'sites' | 'settings';

export interface MenuTab {
  id: MenuTabId;
  label: string;
  render: (container: HTMLElement) => void;
  /** Called when this tab stops being the visible one (switching tabs, or closing the menu). */
  onDeactivate?: () => void;
}

const PANEL_ID = 'offerextract-menu-panel';
const PANEL_MARGIN = 84; // clears the 48px button plus its own margin/gap

let panelEl: HTMLDivElement | null = null;
let contentEl: HTMLDivElement | null = null;
let tabs: MenuTab[] = [];
let activeTab: MenuTabId | null = null;
const tabButtons = new Map<MenuTabId, HTMLButtonElement>();

/** Registers the tabs shown in the nav bar, in order. Call once, before opening the menu. */
export function registerMenuTabs(newTabs: MenuTab[]): void {
  tabs = newTabs;
  activeTab = newTabs[0]?.id ?? null;
}

export function openMenu(): void {
  if (!panelEl) buildPanel();
  Object.assign(panelEl!.style, cornerStyles(getButtonCorner(), PANEL_MARGIN));
  panelEl!.style.display = 'flex';
  renderActiveTab();
}

export function closeMenu(): void {
  if (!panelEl) return;
  deactivateCurrentTab();
  panelEl.style.display = 'none';
}

export function toggleMenu(): void {
  const isOpen = !!panelEl && panelEl.style.display !== 'none';
  if (isOpen) closeMenu();
  else openMenu();
}

function buildPanel(): void {
  const root = getUIRoot();
  root.getElementById(PANEL_ID)?.remove();
  tabButtons.clear();

  const panel = document.createElement('div');
  panel.id = PANEL_ID;
  Object.assign(panel.style, {
    position: 'fixed',
    zIndex: '2147483647',
    width: '440px',
    maxHeight: '78vh',
    background: '#111827',
    color: '#f9fafb',
    borderRadius: '12px',
    boxShadow: '0 8px 30px rgba(0,0,0,.4)',
    display: 'none',
    flexDirection: 'column',
    overflow: 'hidden',
    font: '13px/1.4 system-ui, sans-serif',
  } satisfies Partial<CSSStyleDeclaration>);

  const nav = document.createElement('div');
  Object.assign(nav.style, {
    display: 'flex',
    alignItems: 'center',
    borderBottom: '1px solid rgba(255,255,255,.1)',
    background: '#1f2937',
    flex: '0 0 auto',
  } satisfies Partial<CSSStyleDeclaration>);

  for (const tab of tabs) {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = tab.label;
    Object.assign(button.style, {
      flex: '1',
      padding: '10px 8px',
      border: 'none',
      borderBottom: '2px solid transparent',
      background: 'transparent',
      color: '#f9fafb',
      cursor: 'pointer',
      font: 'inherit',
    } satisfies Partial<CSSStyleDeclaration>);
    button.addEventListener('click', () => {
      if (activeTab === tab.id) return;
      deactivateCurrentTab();
      activeTab = tab.id;
      renderActiveTab();
    });
    tabButtons.set(tab.id, button);
    nav.appendChild(button);
  }

  const closeButton = document.createElement('button');
  closeButton.type = 'button';
  closeButton.textContent = '✕';
  closeButton.setAttribute('aria-label', 'Close menu');
  Object.assign(closeButton.style, {
    border: 'none',
    background: 'transparent',
    color: '#9ca3af',
    cursor: 'pointer',
    padding: '10px 12px',
    font: 'inherit',
  } satisfies Partial<CSSStyleDeclaration>);
  closeButton.addEventListener('click', closeMenu);
  nav.appendChild(closeButton);

  const content = document.createElement('div');
  Object.assign(content.style, {
    padding: '14px',
    overflowY: 'auto',
  } satisfies Partial<CSSStyleDeclaration>);

  panel.appendChild(nav);
  panel.appendChild(content);
  root.appendChild(panel);

  panelEl = panel;
  contentEl = content;
}

function deactivateCurrentTab(): void {
  tabs.find((tab) => tab.id === activeTab)?.onDeactivate?.();
}

function renderActiveTab(): void {
  if (!contentEl) return;
  for (const tab of tabs) {
    const button = tabButtons.get(tab.id);
    if (!button) continue;
    const isActive = tab.id === activeTab;
    button.style.borderBottomColor = isActive ? '#2563eb' : 'transparent';
    button.style.opacity = isActive ? '1' : '.7';
  }
  contentEl.innerHTML = '';
  const active = tabs.find((tab) => tab.id === activeTab);
  active?.render(contentEl);
}
