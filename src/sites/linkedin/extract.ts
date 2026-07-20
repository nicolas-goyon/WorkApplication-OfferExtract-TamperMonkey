import { textOf } from '../../shared/text';
import { elementToCleanText } from '../../shared/dom/htmlToText';
import type { OfferData } from '../generic/types';
import { extractGenericOffer } from '../generic/extract';
import { EXPANDABLE_TEXT_SELECTOR } from './selectors';

export function extractOffer(): OfferData {
  const generic = extractGenericOffer();
  const { title, company } = parseDocumentTitle();

  const descriptionSections = Array.from(document.querySelectorAll(EXPANDABLE_TEXT_SELECTOR))
    .map((el) => elementToCleanText(el))
    .filter((chunk) => chunk.length > 0);

  return {
    ...generic,
    title: title ?? generic.title,
    company: company ?? generic.company,
    location: findLocation(company) ?? generic.location,
    description: descriptionSections.length > 0 ? descriptionSections.join('\n\n') : generic.description,
  };
}

/**
 * LinkedIn's <title> is consistently "{job title} | {company} | LinkedIn" (client-side navigation
 * leaves stale <title> elements behind in <head>, but document.title always resolves to the first
 * one in the document, which is this one). That's far more stable across LinkedIn's frontend
 * deploys than its hashed/atomic CSS classes, so it's used here instead of a DOM selector.
 */
function parseDocumentTitle(): { title?: string; company?: string } {
  const parts = document.title
    .split('|')
    .map((part) => textOf(part))
    .filter((part): part is string => !!part);

  if (parts.length < 2) return {};
  return { title: parts[0], company: parts[parts.length - 2] };
}

/**
 * No stable selector exists for the location line either. The top card renders the company name
 * and the location as adjacent sibling blocks, so this finds the paragraph whose text is exactly
 * the extracted company name and reads the paragraph right after it. Best-effort: returns
 * undefined rather than guessing if that structure isn't found.
 */
function findLocation(company: string | undefined): string | undefined {
  if (!company) return undefined;

  const candidates = Array.from(document.querySelectorAll('p')).filter((p) => textOf(p.textContent) === company);

  for (const candidate of candidates) {
    const sibling = candidate.parentElement?.nextElementSibling;
    if (sibling?.tagName === 'P') {
      const location = textOf(sibling.textContent);
      if (location) return location;
    }
  }

  return undefined;
}
