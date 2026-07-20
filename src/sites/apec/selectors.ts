/**
 * Apec.fr markup landmarks, shared between extract.ts (structured OfferData)
 * and template.ts (automated "fetch offer" text). Kept in one place so a
 * future markup change only needs updating here.
 */
export const TITLE_SELECTOR = 'apec-header-nav h1, h1';
export const DETAILS_LIST_SELECTOR = '.details-offer-list';

// `.card-offer__text` wraps the reference number (`.ref-offre`), the
// `.details-offer-list` chips, and the "Publiée le" / "Actualisée le"
// dates (`.date-offre`) — the whole at-a-glance summary block above the
// description. Used instead of DETAILS_LIST_SELECTOR for the template pick
// so those fields are captured too; extract.ts still reads
// DETAILS_LIST_SELECTOR directly for its company/location parsing.
export const OFFER_SUMMARY_SELECTOR = '.card-offer__text';

// `apec-poste-informations` is the custom element wrapping salary,
// experience, the full "Descriptif du poste" / "Profil recherché" text, the
// expected-skills lists, and the company blurb — the actual offer content,
// without the surrounding chrome (share widget, apply buttons, map, footer).
export const DESCRIPTION_SELECTOR = 'apec-poste-informations';

/** Sections to gather, in reading order, for the automated template pick. */
export const TEMPLATE_SECTION_SELECTORS: readonly string[] = [TITLE_SELECTOR, OFFER_SUMMARY_SELECTOR, DESCRIPTION_SELECTOR];

// "Compétences attendues" (languages / soft skills / hard skills) lists are
// capped to a couple of items behind a "Voir plus" toggle; the rest of the
// list isn't rendered into the DOM until that toggle is clicked.
export const SEE_MORE_SELECTOR = '.seeMore';
