// LinkedIn job search-results detail pane markup landmarks, shared by extract.ts and template.ts.
// LinkedIn ships hashed/atomic CSS class names that change on every frontend build, so — unlike
// apec/selectors.ts — none of these rely on class names, only on stable data-testid attributes.

/**
 * Truncated-text section ("À propos de l'offre d'emploi" body). The full text is already present
 * in the DOM even before the toggle is clicked — LinkedIn clips it visually via CSS, it doesn't
 * lazy-load the rest — but expandCollapsedSections() still clicks it for robustness in case that
 * ever changes, and so the panel reads correctly if a screenshot/visual tool is used alongside it.
 */
export const EXPANDABLE_TEXT_SELECTOR = '[data-testid="expandable-text-box"]';

/** The "…plus" / "see more" toggle inside an expandable-text section. */
export const SEE_MORE_SELECTOR = '[data-testid="expandable-text-button"]';

/**
 * Icon inside each top-card pill/badge (work mode, contract type, ...). LinkedIn's icon `id`s are
 * a small semantic vocabulary (e.g. "check-small", "close-small") shared across the whole site —
 * unlike its CSS classes, they don't change per build, which is why this anchors on the icon
 * rather than the pill's (hashed) wrapper classes.
 */
export const TAG_ICON_SELECTOR = 'svg#check-small';
