import { textOf } from '../../shared/text';
import { elementToCleanText } from '../../shared/dom/htmlToText';
import type { OfferData } from '../generic/types';
import { extractGenericOffer } from '../generic/extract';
import { DESCRIPTION_SELECTOR, DETAILS_LIST_SELECTOR, TITLE_SELECTOR } from './selectors';

export function extractOffer(): OfferData {
  const generic = extractGenericOffer();

  const details = Array.from(document.querySelectorAll(`${DETAILS_LIST_SELECTOR} li`))
    .map((li) => textOf(li.textContent))
    .filter((text): text is string => !!text);

  const descriptionEl = document.querySelector(DESCRIPTION_SELECTOR);

  return {
    ...generic,
    title: textOf(document.querySelector(TITLE_SELECTOR)?.textContent) ?? generic.title,
    company: details[0] ?? generic.company,
    location: details.length > 1 ? details[details.length - 1] : generic.location,
    description: descriptionEl ? elementToCleanText(descriptionEl) : generic.description,
  };
}
