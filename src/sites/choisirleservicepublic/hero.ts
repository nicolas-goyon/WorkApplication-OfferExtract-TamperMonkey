import { textOf } from '../../shared/text';
import {
  DETAILS_CELL_SELECTOR,
  DOMAIN_TAG_SELECTOR,
  EMPLOYER_FACT_SELECTOR,
  FACTS_SELECTOR,
  HERO_SELECTOR,
  LOCATION_FACT_SELECTOR,
  REFERENCE_SELECTOR,
  TITLE_SELECTOR,
} from './selectors';

/**
 * The hero strate of a Choisir le service public offer: title, reference,
 * key-fact chips (fonction publique / employeur / localisation), domain tag,
 * and the details table (contract, salary, category, remote, ...). Shared by
 * extract.ts (structured OfferData) and template.ts (the copy-paste text) so
 * both surfaces stay in sync.
 *
 * Fields are read one by one rather than converting the whole strate: the hero
 * also hosts share/download/apply chrome whose helper texts ("Veuillez
 * autoriser le dépôt de cookies...") are plain <p>s that elementToCleanText
 * would keep.
 */
export interface Hero {
  title?: string;
  /** "Référence : 2026-XXXXXXX" (sr-only label kept, aria-hidden "Réf." dropped). */
  reference?: string;
  /** Key-fact chips with their sr-only labels, in DOM order: "Employeur : INSERM", ... */
  facts: string[];
  /** Bare employer value (sr-only label stripped), for OfferData.company. */
  employer?: string;
  /** Bare location value (sr-only label stripped), for OfferData.location. */
  location?: string;
  /** "Domaine : Numérique". */
  domain?: string;
  /** Details-table cells as "label : value" lines, in DOM order. */
  details: string[];
}

export function readHero(page: Element): Hero {
  const hero = page.querySelector(HERO_SELECTOR) ?? page;

  return {
    title: textOf(hero.querySelector(TITLE_SELECTOR)?.textContent),
    reference: referenceOf(hero),
    facts: Array.from(hero.querySelectorAll(FACTS_SELECTOR))
      .map((li) => textOf(li.textContent))
      .filter((text): text is string => !!text),
    employer: valueOf(hero.querySelector(EMPLOYER_FACT_SELECTOR)),
    location: valueOf(hero.querySelector(LOCATION_FACT_SELECTOR)),
    domain: textOf(hero.querySelector(DOMAIN_TAG_SELECTOR)?.textContent),
    details: Array.from(hero.querySelectorAll(DETAILS_CELL_SELECTOR))
      .map(detailLineOf)
      .filter((line): line is string => !!line),
  };
}

/** Formats a Hero as the lines that precede the offer body in the copied text. */
export function formatHero(hero: Hero): string {
  return [hero.title, hero.reference, ...hero.facts, hero.domain, ...hero.details]
    .filter((line): line is string => !!line)
    .join('\n');
}

// "Réf." (aria-hidden) and "Référence :" (sr-only) label the same number; keep
// only the sr-only one. sr-only text is clipped, not display:none, so it's part
// of textContent — which is exactly why the facts above read as "Employeur : ...".
function referenceOf(hero: Element): string | undefined {
  const el = hero.querySelector(REFERENCE_SELECTOR);
  if (!el) return undefined;
  const clone = el.cloneNode(true) as Element;
  clone.querySelectorAll('[aria-hidden="true"]').forEach((hidden) => hidden.remove());
  return textOf(clone.textContent);
}

/** The chip's value without its sr-only label — "MONTPELLIER", not "Localisation : MONTPELLIER". */
function valueOf(el: Element | null): string | undefined {
  if (!el) return undefined;
  const clone = el.cloneNode(true) as Element;
  clone.querySelectorAll('.sr-only').forEach((label) => label.remove());
  return textOf(clone.textContent);
}

/** "<strong>Nature du contrat</strong> ... CDI" -> "Nature du contrat : CDI". */
function detailLineOf(cell: Element): string | undefined {
  const label = textOf(cell.querySelector('strong')?.textContent);
  const clone = cell.cloneNode(true) as Element;
  clone.querySelectorAll('strong').forEach((strong) => strong.remove());
  const value = textOf(clone.textContent);
  if (label && value) return `${label} : ${value}`;
  return label ?? value;
}
