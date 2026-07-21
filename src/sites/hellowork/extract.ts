import { elementToCleanText } from '../../shared/dom/htmlToText';
import type { OfferData } from '../generic/types';
import { extractGenericOffer } from '../generic/extract';
import { readHeader } from './header';
import { expandCollapsedSections, getPanel, locateSections } from './template';

export function extractOffer(): OfferData {
  const generic = extractGenericOffer();

  const panel = getPanel();
  if (!panel) return generic;

  const header = readHeader(panel);

  const sections = locateSections(panel);
  expandCollapsedSections(sections);
  const description = sections
    .map((el) => elementToCleanText(el))
    .filter((chunk) => chunk.length > 0)
    .join('\n\n');

  return {
    ...generic,
    title: header.title ?? generic.title,
    company: header.company ?? generic.company,
    location: header.details[0] ?? generic.location,
    description: description || generic.description,
  };
}
