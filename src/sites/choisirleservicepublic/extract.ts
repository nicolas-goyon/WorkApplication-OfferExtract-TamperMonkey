import { elementToCleanText } from '../../shared/dom/htmlToText';
import type { OfferData } from '../generic/types';
import { extractGenericOffer } from '../generic/extract';
import { readHero } from './hero';
import { expandClampedText, getPage } from './template';
import { DESCRIPTION_SECTIONS_SELECTOR } from './selectors';

/**
 * The page embeds JobPosting JSON-LD, but a broken one: hiringOrganization is
 * a bare string (not {name}), the description sits under "Description"
 * (capital D) with its whitespace mangled, and jobLocation degrades to
 * ", France" — so the generic pass misses company/location/description here
 * and everything meaningful is overridden from the DOM instead.
 */
export function extractOffer(): OfferData {
  const generic = extractGenericOffer();

  const page = getPage();
  if (!page) return generic;

  const hero = readHero(page);

  const sections = Array.from(page.querySelectorAll(DESCRIPTION_SECTIONS_SELECTOR));
  sections.forEach(expandClampedText);
  const description = sections
    .map((el) => elementToCleanText(el))
    .filter((chunk) => chunk.length > 0)
    .join('\n\n');

  return {
    ...generic,
    title: hero.title ?? generic.title,
    company: hero.employer ?? generic.company,
    location: hero.location ?? generic.location,
    description: description || generic.description,
  };
}
