import { textOf } from '../../shared/text';
import { elementToCleanText } from '../../shared/dom/htmlToText';
import type { OfferData } from '../generic/types';
import { extractGenericOffer } from '../generic/extract';
import { COMPANY_SELECTOR, DETAILS_LIST_SELECTOR, TITLE_SELECTOR } from './selectors';
import { expandCollapsedSections, getPanel, locateSections } from './template';

export function extractOffer(): OfferData {
  const generic = extractGenericOffer();

  const panel = getPanel();
  if (!panel) return generic;

  const details = Array.from(panel.querySelectorAll(`${DETAILS_LIST_SELECTOR} li`))
    .map((li) => textOf(li.textContent))
    .filter((text): text is string => !!text);

  const sections = locateSections(panel);
  expandCollapsedSections(sections);
  const description = sections
    .map((el) => elementToCleanText(el))
    .filter((chunk) => chunk.length > 0)
    .join('\n\n');

  return {
    ...generic,
    title: textOf(panel.querySelector(TITLE_SELECTOR)?.textContent) ?? generic.title,
    company: textOf(panel.querySelector(COMPANY_SELECTOR)?.textContent) ?? generic.company,
    location: details[0] ?? generic.location,
    description: description || generic.description,
  };
}
