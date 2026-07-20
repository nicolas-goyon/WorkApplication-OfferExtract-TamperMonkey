import { elementToCleanText } from '../../shared/dom/htmlToText';
import { extractGenericOffer } from '../generic/extract';
import { EXPANDABLE_TEXT_SELECTOR } from './selectors';
import { readTopCard } from './topCard';
import type { OfferData } from './types';

export function extractOffer(): OfferData {
  const generic = extractGenericOffer();
  const topCard = readTopCard();

  const descriptionSections = Array.from(document.querySelectorAll(EXPANDABLE_TEXT_SELECTOR))
    .map((el) => elementToCleanText(el))
    .filter((chunk) => chunk.length > 0);

  return {
    ...generic,
    title: topCard.title ?? generic.title,
    company: topCard.company ?? generic.company,
    location: topCard.location ?? generic.location,
    description: descriptionSections.length > 0 ? descriptionSections.join('\n\n') : generic.description,
    ...(topCard.tags.length > 0 ? { tags: topCard.tags } : {}),
  };
}
