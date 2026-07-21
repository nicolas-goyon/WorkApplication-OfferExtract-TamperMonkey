import { elementToCleanText } from '../../shared/dom/htmlToText';
import { formatHeader, readHeader } from './header';
import { COLLAPSIBLE_SECTION_SELECTOR, DESCRIPTION_SELECTOR, OFFER_PANEL_SELECTOR } from './selectors';

const HOSTNAME_SUFFIX = 'hellowork.com';

export function matchesHostname(hostname: string): boolean {
  return hostname === HOSTNAME_SUFFIX || hostname.endsWith(`.${HOSTNAME_SUFFIX}`);
}

export function getPanel(): Element | null {
  return document.querySelector(OFFER_PANEL_SELECTOR);
}

/**
 * Description sections in reading order: the always-open body first ("Détail du poste" /
 * "Les missions du poste"), then the collapsible <details> ones ("Le profil recherché",
 * "Infos complémentaires", ...). The photo gallery is a <section> too but matches
 * neither selector, so it's skipped without needing an explicit exclusion.
 */
export function locateSections(panel: Element): Element[] {
  const seen = new Set<Element>();
  const sections: Element[] = [];
  const add = (el: Element) => {
    if (!seen.has(el)) {
      seen.add(el);
      sections.push(el);
    }
  };
  panel.querySelectorAll(DESCRIPTION_SELECTOR).forEach(add);
  panel.querySelectorAll(COLLAPSIBLE_SECTION_SELECTOR).forEach(add);
  return sections;
}

/** Opens closed <details> sections in place so their content isn't skipped as hidden. */
export function expandCollapsedSections(sections: Element[]): void {
  for (const section of sections) {
    if (section.tagName === 'DETAILS') {
      (section as HTMLDetailsElement).open = true;
    }
  }
}

// Returns null if the page doesn't look like a Hellowork offer page, so the caller can fall back to manual picking.
export async function getTemplateText(): Promise<string | null> {
  const panel = getPanel();
  if (!panel) return null;

  const sections = locateSections(panel);
  if (sections.length === 0) return null;

  expandCollapsedSections(sections);

  const header = formatHeader(readHeader(panel));

  const description = sections
    .map((el) => elementToCleanText(el))
    .filter((chunk) => chunk.length > 0)
    .join('\n\n');

  const text = [header, description].filter((chunk) => chunk.length > 0).join('\n\n');

  return text.trim() || null;
}
