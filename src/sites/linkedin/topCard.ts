import { textOf } from '../../shared/text';
import { TAG_ICON_SELECTOR } from './selectors';

/**
 * The parts of LinkedIn's top card that live outside the expandable-text-box description
 * (title/company via document.title, location + tag pills via structural/icon lookups). Shared
 * by extract.ts (structured OfferData) and template.ts (the copy-paste text) so both surfaces
 * stay in sync — this used to live only in extract.ts, which meant the copied template text
 * silently dropped title/company/location/tags even though extract() had them.
 */
export interface TopCard {
  title?: string;
  company?: string;
  location?: string;
  tags: string[];
}

export function readTopCard(): TopCard {
  const { title, company } = parseDocumentTitle();
  return {
    title,
    company,
    location: findLocation(company),
    tags: findTags(),
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
 * Reads the top card's pill badges (work mode, contract type, ...) by their icon, not by
 * matching known label words — so it picks up whatever text LinkedIn actually rendered
 * ("Hybride", "Remote", "Temps plein", "Part-time", ...) instead of a hardcoded/translated list.
 */
function findTags(): string[] {
  const seen = new Set<string>();
  const tags: string[] = [];

  for (const icon of Array.from(document.querySelectorAll(TAG_ICON_SELECTOR))) {
    const pill = icon.closest('a') ?? icon.parentElement;
    const text = pill ? textOf(pill.textContent) : undefined;
    if (text && !seen.has(text)) {
      seen.add(text);
      tags.push(text);
    }
  }

  return tags;
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
