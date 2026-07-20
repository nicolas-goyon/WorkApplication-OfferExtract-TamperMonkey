/**
 * TEMPLATE — public entry point for a new site module.
 * Once implemented, wire it into src/index.ts:
 *   import * as <Site> from './sites/<site-name>';
 *   export { ..., <Site> };
 */
export * from './types';

import { extractOffer } from './extract';

export const extract = extractOffer;
