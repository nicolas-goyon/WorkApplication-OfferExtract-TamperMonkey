// Hellowork.com markup landmarks, shared by extract.ts and template.ts.
// The whole offer lives inside #offer-panel; every selector below is meant to be
// queried relative to that element (see getPanel() in template.ts), not the document.
export const OFFER_PANEL_SELECTOR = '#offer-panel';

export const TITLE_SELECTOR = '[data-cy="jobTitle"]';

// The company link's title attribute always reads "<company> recrutement" (French for
// "recruitment"), which is steadier than its link text or its (Tailwind, unstable) classes.
export const COMPANY_SELECTOR = 'h1 a[title$="recrutement"]';

// Location + contract type chips, in the <ul> right after the <h1>. No data-cy hook
// exists for them, so this relies on that structural position instead.
export const DETAILS_LIST_SELECTOR = 'h1 + ul';

// Salary chip button (its text reads either an amount or "Pas de salaire renseigné" — it
// always renders). No data-cy hook exists for the badges <ul> that contains it (salary,
// "ESN", remote, sector, experience, ...), so this button also anchors that whole list —
// see header.ts.
export const SALARY_BUTTON_SELECTOR = '[data-cy="salary-tag-button"]';

// "Détail du poste" / "Les missions du poste": always-open section body. It's visually
// clipped with a CSS line-clamp rather than actually hidden, so the full text is already
// in the DOM before the "Voir plus" toggle is clicked.
export const DESCRIPTION_SELECTOR = '[data-truncate-text-target="content"]';

// "Le profil recherché", "Infos complémentaires", ...: native <details>, closed by
// default. Unlike DESCRIPTION_SELECTOR, their content really is hidden (via the
// browser's UA stylesheet) until the <details> is opened.
export const COLLAPSIBLE_SECTION_SELECTOR = 'details';

// Photo gallery ("<company> en images"): not offer content. Neither DESCRIPTION_SELECTOR
// nor COLLAPSIBLE_SECTION_SELECTOR matches it, so it's excluded by construction — this
// export just documents that exclusion for anyone re-checking the selectors later.
export const GALLERY_SELECTOR = '[data-cy="gallery"]';
