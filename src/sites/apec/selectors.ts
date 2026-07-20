// Apec.fr markup landmarks, shared by extract.ts and template.ts.
export const TITLE_SELECTOR = 'apec-header-nav h1, h1';
export const DETAILS_LIST_SELECTOR = '.details-offer-list';

// Reference, contract/location chips, and publish/update dates (extract.ts uses DETAILS_LIST_SELECTOR directly instead).
export const OFFER_SUMMARY_SELECTOR = '.card-offer__text';

export const DESCRIPTION_SELECTOR = 'apec-poste-informations';

export const TEMPLATE_SECTION_SELECTORS: readonly string[] = [TITLE_SELECTOR, OFFER_SUMMARY_SELECTOR, DESCRIPTION_SELECTOR];

// Skill lists behind a "Voir plus" toggle; extra items aren't in the DOM until clicked.
export const SEE_MORE_SELECTOR = '.seeMore';
