/** Public entry point of the Apec.fr site module. */
export * from './types';

import { extractOffer } from './extract';

export const extract = extractOffer;

export { getTemplateText, matchesHostname } from './template';
