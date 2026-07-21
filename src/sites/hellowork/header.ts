import { textOf } from '../../shared/text';
import { COMPANY_SELECTOR, DETAILS_LIST_SELECTOR, SALARY_BUTTON_SELECTOR, TITLE_SELECTOR } from './selectors';

/**
 * The parts of a Hellowork offer that live above the description sections, inside
 * #main-content: job title, company, location/contract chips, and the row of badges
 * (salary, "ESN", remote, sector, experience, ...). Shared by extract.ts (structured
 * OfferData) and template.ts (the copy-paste text) so both surfaces stay in sync.
 */
export interface Header {
  title?: string;
  company?: string;
  /** Location + contract type, in DOM order (location first). */
  details: string[];
  /** Badge row text, in DOM order — including the salary button's own text. */
  tags: string[];
}

export function readHeader(panel: Element): Header {
  return {
    title: textOf(panel.querySelector(TITLE_SELECTOR)?.textContent),
    company: textOf(panel.querySelector(COMPANY_SELECTOR)?.textContent),
    details: Array.from(panel.querySelectorAll(`${DETAILS_LIST_SELECTOR} li`))
      .map((li) => textOf(li.textContent))
      .filter((text): text is string => !!text),
    tags: readTags(panel),
  };
}

/**
 * The badge <li>s sit in a <ul> with no data-cy hook of its own, so it's located via the
 * salary button inside it (SALARY_BUTTON_SELECTOR), which always renders. Some badges are
 * plain read-only text, others (salary, "ESN") wrap a <button> — read here with
 * textContent rather than elementToCleanText, since a <button> is treated as interactive
 * chrome by elementToCleanText and would otherwise be dropped entirely.
 */
function readTags(panel: Element): string[] {
  const list = panel.querySelector(SALARY_BUTTON_SELECTOR)?.closest('ul');
  if (!list) return [];

  return Array.from(list.children)
    .map((li) => textOf(li.textContent))
    .filter((text): text is string => !!text);
}

/** Formats a Header as the lines that precede the description in the copied text. */
export function formatHeader(header: Header): string {
  return [
    header.title,
    header.company,
    header.details.length > 0 ? header.details.join(' · ') : undefined,
    header.tags.length > 0 ? header.tags.join(' · ') : undefined,
  ]
    .filter((line): line is string => !!line)
    .join('\n');
}
