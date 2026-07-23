import { elementToCleanText } from '../../shared/dom/htmlToText';
import { textOf } from '../../shared/text';
import { formatHero, readHero } from './hero';
import {
  ABOUT_EMPLOYER_SELECTOR,
  ACCORDION_CONTENT_SELECTOR,
  ACCORDION_LABEL_SELECTOR,
  ACCORDION_SELECTOR,
  ACCORDIONS_SECTION_SELECTOR,
  CLAMP_HIDDEN_TEXT_SELECTOR,
  DESCRIPTION_SECTIONS_SELECTOR,
  PAGE_MARKER_SELECTOR,
} from './selectors';

const HOSTNAME_SUFFIX = 'choisirleservicepublic.gouv.fr';

export function matchesHostname(hostname: string): boolean {
  return hostname === HOSTNAME_SUFFIX || hostname.endsWith(`.${HOSTNAME_SUFFIX}`);
}

export function getPage(): Element | null {
  return document.querySelector(PAGE_MARKER_SELECTOR);
}

/**
 * Offer-body strates in reading order: "Vos missions en quelques mots" /
 * "Profil recherché" first, then the "Qui sommes-nous ?" employer blurb.
 */
export function locateSections(page: Element): Element[] {
  const seen = new Set<Element>();
  const sections: Element[] = [];
  const add = (el: Element) => {
    if (!seen.has(el)) {
      seen.add(el);
      sections.push(el);
    }
  };
  page.querySelectorAll(DESCRIPTION_SECTIONS_SELECTOR).forEach(add);
  page.querySelectorAll(ABOUT_EMPLOYER_SELECTOR).forEach(add);
  return sections;
}

/**
 * Un-hides the "Afficher la suite" remainders in place: the clamp module keeps
 * the tail of every long text in a .text-clamp--hiddentext div with a real
 * `hidden` attribute (see CLAMP_HIDDEN_TEXT_SELECTOR), which elementToCleanText
 * would otherwise skip. Same spirit as Hellowork opening its closed <details>.
 */
export function expandClampedText(scope: Element): void {
  scope.querySelectorAll(CLAMP_HIDDEN_TEXT_SELECTOR).forEach((el) => {
    el.removeAttribute('hidden');
  });
}

/**
 * "À propos de l'offre" accordions as "label : value" lines ("Statut du
 * poste : Susceptible d'être vacant à partir du ..."). Collapsed .fr-collapse
 * panels are visibility:hidden (so elementToCleanText would skip them) and
 * their labels are <button>s (which it would drop as chrome) — reading
 * textContent directly sidesteps both without having to click anything open.
 */
export function readAccordionLines(page: Element): string[] {
  const section = page.querySelector(ACCORDIONS_SECTION_SELECTOR);
  if (!section) return [];

  const lines: string[] = [];
  const heading = textOf(section.querySelector('h2')?.textContent);
  for (const accordion of Array.from(section.querySelectorAll(ACCORDION_SELECTOR))) {
    const label = textOf(accordion.querySelector(ACCORDION_LABEL_SELECTOR)?.textContent);
    const value = textOf(accordion.querySelector(ACCORDION_CONTENT_SELECTOR)?.textContent);
    if (label && value) lines.push(`${label} : ${value}`);
    else if (label ?? value) lines.push((label ?? value) as string);
  }

  if (lines.length === 0) return [];
  return heading ? [heading, ...lines] : lines;
}

// Returns null if the page doesn't look like a single-offer page, so the caller can fall back to manual picking.
export async function getTemplateText(): Promise<string | null> {
  const page = getPage();
  if (!page) return null;

  const hero = formatHero(readHero(page));

  const sections = locateSections(page);
  sections.forEach(expandClampedText);

  const body = sections
    .map((el) => elementToCleanText(el))
    .filter((chunk) => chunk.length > 0)
    .join('\n\n');

  const about = readAccordionLines(page).join('\n');

  const text = [hero, body, about].filter((chunk) => chunk.length > 0).join('\n\n');

  return text.trim() || null;
}
