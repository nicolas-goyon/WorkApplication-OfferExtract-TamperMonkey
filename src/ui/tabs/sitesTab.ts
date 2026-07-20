/**
 * Sites tab: every classified hostname (job or not), sorted alphabetically,
 * with a search box and per-row edit (rename / toggle status) and remove.
 */
import { clearSiteStatus, getAllSiteStatuses, renameSiteHostname, setSiteStatus } from '../../core/siteStatus';
import type { MenuTab } from '../menuPanel';

export const sitesTab: MenuTab = {
  id: 'sites',
  label: 'Sites',
  render(container) {
    const searchInput = document.createElement('input');
    searchInput.type = 'search';
    searchInput.placeholder = 'Search sites…';
    Object.assign(searchInput.style, {
      display: 'block',
      width: '100%',
      boxSizing: 'border-box',
      padding: '8px 10px',
      marginBottom: '10px',
      borderRadius: '6px',
      border: '1px solid rgba(255,255,255,.2)',
      background: 'transparent',
      color: '#f9fafb',
      font: 'inherit',
    } satisfies Partial<CSSStyleDeclaration>);

    const countLabel = document.createElement('p');
    Object.assign(countLabel.style, {
      margin: '0 0 8px',
      color: '#9ca3af',
      fontSize: '12px',
    } satisfies Partial<CSSStyleDeclaration>);

    const tableWrap = document.createElement('div');
    Object.assign(tableWrap.style, {
      maxHeight: '46vh',
      overflowY: 'auto',
    } satisfies Partial<CSSStyleDeclaration>);

    const table = document.createElement('table');
    Object.assign(table.style, {
      width: '100%',
      borderCollapse: 'collapse',
    } satisfies Partial<CSSStyleDeclaration>);

    const thead = document.createElement('thead');
    const headRow = document.createElement('tr');
    for (const text of ['Hostname', 'Status', 'Actions']) {
      const th = document.createElement('th');
      th.textContent = text;
      Object.assign(th.style, {
        position: 'sticky',
        top: '0',
        textAlign: 'left',
        padding: '6px 8px',
        background: '#111827',
        borderBottom: '1px solid rgba(255,255,255,.15)',
        fontWeight: '600',
        fontSize: '12px',
        color: '#9ca3af',
      } satisfies Partial<CSSStyleDeclaration>);
      headRow.appendChild(th);
    }
    thead.appendChild(headRow);

    const tbody = document.createElement('tbody');
    table.appendChild(thead);
    table.appendChild(tbody);
    tableWrap.appendChild(table);

    const emptyState = document.createElement('p');
    Object.assign(emptyState.style, {
      margin: '10px 0 0',
      color: '#9ca3af',
    } satisfies Partial<CSSStyleDeclaration>);

    const renderRows = () => {
      const query = searchInput.value.trim().toLowerCase();
      const sites = getAllSiteStatuses().filter((site) => site.hostname.toLowerCase().includes(query));

      countLabel.textContent = `${sites.length} site${sites.length === 1 ? '' : 's'}`;
      tbody.innerHTML = '';
      emptyState.remove();

      if (sites.length === 0) {
        emptyState.textContent = query ? 'No sites match.' : 'No sites classified yet.';
        container.appendChild(emptyState);
        return;
      }

      for (const site of sites) {
        tbody.appendChild(buildRow(site.hostname, site.isJobSite, renderRows));
      }
    };

    searchInput.addEventListener('input', renderRows);

    container.appendChild(searchInput);
    container.appendChild(countLabel);
    container.appendChild(tableWrap);
    renderRows();
  },
};

function buildRow(hostname: string, isJobSite: boolean, refresh: () => void): HTMLTableRowElement {
  const row = document.createElement('tr');
  Object.assign(row.style, {
    borderBottom: '1px solid rgba(255,255,255,.08)',
  } satisfies Partial<CSSStyleDeclaration>);

  const nameCell = document.createElement('td');
  Object.assign(nameCell.style, {
    padding: '6px 8px',
    wordBreak: 'break-all',
    verticalAlign: 'middle',
  } satisfies Partial<CSSStyleDeclaration>);
  const nameText = document.createElement('span');
  nameText.textContent = hostname;
  nameCell.appendChild(nameText);

  const statusCell = document.createElement('td');
  Object.assign(statusCell.style, { padding: '6px 8px', verticalAlign: 'middle' } satisfies Partial<CSSStyleDeclaration>);
  const statusButton = document.createElement('button');
  statusButton.type = 'button';
  statusButton.title = 'Click to toggle';
  statusButton.textContent = isJobSite ? 'Job site' : 'Not a job site';
  styleStatusTag(statusButton, isJobSite);
  statusButton.addEventListener('click', () => {
    setSiteStatus(hostname, !isJobSite);
    refresh();
  });
  statusCell.appendChild(statusButton);

  const actionsCell = document.createElement('td');
  Object.assign(actionsCell.style, {
    padding: '6px 8px',
    whiteSpace: 'nowrap',
    textAlign: 'right',
    verticalAlign: 'middle',
  } satisfies Partial<CSSStyleDeclaration>);

  const editButton = document.createElement('button');
  editButton.type = 'button';
  editButton.textContent = 'Edit';
  styleActionButton(editButton);
  editButton.addEventListener('click', startEdit);

  const removeButton = document.createElement('button');
  removeButton.type = 'button';
  removeButton.textContent = 'Remove';
  styleActionButton(removeButton);
  removeButton.addEventListener('click', () => {
    clearSiteStatus(hostname);
    refresh();
  });

  actionsCell.appendChild(editButton);
  actionsCell.appendChild(removeButton);

  row.appendChild(nameCell);
  row.appendChild(statusCell);
  row.appendChild(actionsCell);

  function startEdit(): void {
    nameCell.innerHTML = '';
    const input = document.createElement('input');
    input.type = 'text';
    input.value = hostname;
    Object.assign(input.style, {
      width: '100%',
      boxSizing: 'border-box',
      padding: '4px 6px',
      borderRadius: '4px',
      border: '1px solid rgba(255,255,255,.3)',
      background: '#1f2937',
      color: '#f9fafb',
      font: 'inherit',
    } satisfies Partial<CSSStyleDeclaration>);
    nameCell.appendChild(input);
    input.focus();
    input.select();

    let committed = false;
    const commit = () => {
      if (committed) return;
      committed = true;
      const next = input.value.trim();
      if (next && next !== hostname) {
        renameSiteHostname(hostname, next);
      }
      refresh();
    };

    input.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') commit();
      if (event.key === 'Escape') {
        committed = true; // discard, don't rename
        refresh();
      }
    });
    input.addEventListener('blur', commit);
  }

  return row;
}

function styleStatusTag(button: HTMLButtonElement, isJobSite: boolean): void {
  Object.assign(button.style, {
    font: 'inherit',
    fontSize: '12px',
    padding: '4px 10px',
    borderRadius: '999px',
    border: 'none',
    background: isJobSite ? '#2563eb' : '#374151',
    color: '#fff',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  } satisfies Partial<CSSStyleDeclaration>);
}

function styleActionButton(button: HTMLButtonElement): void {
  Object.assign(button.style, {
    font: 'inherit',
    fontSize: '12px',
    padding: '4px 8px',
    marginLeft: '6px',
    borderRadius: '6px',
    border: '1px solid rgba(255,255,255,.2)',
    background: 'transparent',
    color: '#f9fafb',
    cursor: 'pointer',
  } satisfies Partial<CSSStyleDeclaration>);
}
