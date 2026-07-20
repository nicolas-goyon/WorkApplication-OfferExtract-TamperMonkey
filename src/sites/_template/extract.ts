import type { OfferData } from '../generic/types';
import { extractGenericOffer } from '../generic/extract';

/**
 * TEMPLATE — replace the body with selectors specific to this site.
 * Start from the generic extraction and override only what you need;
 * this keeps the module resilient to markup you haven't looked at yet.
 */
export function extractOffer(): OfferData {
  return {
    ...extractGenericOffer(),
    // title: textOf(document.querySelector('h1.job-title')?.textContent),
  };
}
