import type { OfferData as BaseOfferData } from '../generic/types';

/**
 * LinkedIn's top card shows a row of pill badges (work mode, contract type, ...) that don't map
 * to any single generic OfferData field. Captured verbatim as `tags` — each entry is exactly the
 * text LinkedIn renders for that pill, never a hardcoded/translated label, so this works the same
 * regardless of the page's language.
 */
export interface OfferData extends BaseOfferData {
  tags?: string[];
}
