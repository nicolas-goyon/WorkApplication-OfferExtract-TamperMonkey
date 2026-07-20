/** Public entry point of the generic (site-agnostic) extractor. */
export * from './types';

import { extractGenericOffer } from './extract';

export const extract = extractGenericOffer;
