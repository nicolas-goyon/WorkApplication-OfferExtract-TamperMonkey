// choisirleservicepublic.gouv.fr markup landmarks, shared by extract.ts, hero.ts
// and template.ts. The site is built on the DSFR (the French state design system):
// layout classes are stable `fr-*` utilities plus one `strate-*` class per page
// section ("strate"), which is what everything below anchors on.

// Only single-offer pages carry this <main> class — used as the "is this an
// offer page?" guard. Every selector below is meant to be queried relative to
// this element (see getPage() in template.ts), not the document.
export const PAGE_MARKER_SELECTOR = 'main.main-content-single-offer';

// Hero banner: title, reference, key-fact chips and the details table all live
// here, mixed in with share/download/apply chrome that the readers in hero.ts
// deliberately step around by querying precise fields instead of the whole strate.
export const HERO_SELECTOR = '.strate-hero-offer';

export const TITLE_SELECTOR = 'h1';

// "Réf. 2026-XXXXXXX". The visible "Réf." span is aria-hidden and doubled by an
// sr-only "Référence :" span, so hero.ts drops the aria-hidden one to avoid
// "Réf. Référence :" in the output.
export const REFERENCE_SELECTOR = 'p.number';

// Key-fact chips under the title. Each carries an sr-only label ("Fonction
// publique :", "Employeur :", "Localisation :") followed by the bare value as a
// text node, and an ic--* modifier telling which fact it is.
export const FACTS_SELECTOR = 'li.ic';
export const EMPLOYER_FACT_SELECTOR = 'li.ic--user';
export const LOCATION_FACT_SELECTOR = 'li.ic--pin';

// "Domaine : Numérique" tag link (sr-only label + text node, like the facts).
export const DOMAIN_TAG_SELECTOR = 'a.fr-tag';

// Details table at the bottom of the hero: one cell per fact (Nature de
// l'emploi / Nature du contrat / Expérience souhaitée / Rémunération /
// Catégorie / Management / Télétravail possible), each a <strong> label
// followed by the value.
export const DETAILS_CELL_SELECTOR = 'ul.table li.table-cell';

// Offer body: "Vos missions en quelques mots" + "Profil recherché" headings and
// their text. The right-hand column only holds a map/illustration block, whose
// images elementToCleanText drops anyway, so the whole strate is safe to convert.
// The :not() keeps out the about-agency variant handled separately below.
export const DESCRIPTION_SECTIONS_SELECTOR = '.strate-two-columns:not(.about-agency)';

// "Qui sommes-nous ?": the employer blurb strate. Same clamp mechanics as the
// description; its "En savoir plus sur l'employeur" link is a fr-btn, which
// elementToCleanText skips as chrome.
export const ABOUT_EMPLOYER_SELECTOR = '.strate-two-columns.about-agency';

// Long texts in both strate types sit behind an "Afficher la suite" clamp
// (data-module="components/clamp"), and it is NOT a CSS line-clamp: the module
// splits the copy into a visible teaser (.text-clamp--text) and the remainder
// in a .text-clamp--hiddentext div carrying a real `hidden` attribute — on
// this page that's most of "Profil recherché". elementToCleanText rightly
// skips hidden elements, so these must be un-hidden first (see
// expandClampedText() in template.ts). The two parts are contiguous text, not
// duplicates, so expanding never repeats the teaser. The toggle itself is a
// <button>, which elementToCleanText skips as chrome.
export const CLAMP_HIDDEN_TEXT_SELECTOR = '.text-clamp--hiddentext';

// "À propos de l'offre" accordions (Statut du poste, Métier de référence, ...).
// The panel content is genuinely hidden (DSFR keeps collapsed .fr-collapse
// panels visibility:hidden), so template.ts reads label/value pairs off
// textContent instead of clicking them open — see readAccordionLines().
export const ACCORDIONS_SECTION_SELECTOR = '.strate-accordions';
export const ACCORDION_SELECTOR = '.fr-accordion';
export const ACCORDION_LABEL_SELECTOR = '.fr-accordion__btn';
export const ACCORDION_CONTENT_SELECTOR = '.fr-collapse';

// "Découvrez d'autres offres" similar-offer cards: not offer content. No
// selector above reaches into it, so it's excluded by construction — this
// export just documents that exclusion for anyone re-checking selectors later.
export const SIMILAR_OFFERS_SELECTOR = '.strate-cards-list';
