import { elementToCleanText } from '../../shared/dom/htmlToText';
import { EXPANDABLE_TEXT_SELECTOR, SEE_MORE_SELECTOR } from './selectors';
import { readTopCard, type TopCard } from './topCard';

const HOSTNAME_SUFFIX = 'linkedin.com';

export function matchesHostname(hostname: string): boolean {
  return hostname === HOSTNAME_SUFFIX || hostname.endsWith(`.${HOSTNAME_SUFFIX}`);
}

export function locateSections(): Element[] {
  return Array.from(document.querySelectorAll(EXPANDABLE_TEXT_SELECTOR));
}

export async function expandCollapsedSections(scope: Element): Promise<void> {
  const toggles = Array.from(scope.querySelectorAll(SEE_MORE_SELECTOR));
  if (toggles.length === 0) return;

  for (const toggle of toggles) {
    toggle.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
  }

  await nextFrames(2);
}

function nextFrames(count: number): Promise<void> {
  return new Promise((resolve) => {
    const step = (remaining: number) => {
      if (remaining <= 0) {
        resolve();
        return;
      }
      requestAnimationFrame(() => step(remaining - 1));
    };
    step(count);
  });
}

/**
 * Title/company/location/tags live outside the expandable-text-box (see topCard.ts) — without
 * this they'd be in extract()'s structured OfferData but silently missing from the copied text.
 */
function formatHeader(topCard: TopCard): string {
  return [topCard.title, topCard.company, topCard.location, topCard.tags.length > 0 ? topCard.tags.join(' · ') : undefined]
    .filter((line): line is string => !!line)
    .join('\n');
}

// Returns null if the page doesn't look like a LinkedIn job detail pane, so the caller can fall back to manual picking.
export async function getTemplateText(): Promise<string | null> {
  const sections = locateSections();
  if (sections.length === 0) return null;

  for (const section of sections) {
    await expandCollapsedSections(section);
  }

  const description = sections
    .map((el) => elementToCleanText(el))
    .filter((chunk) => chunk.length > 0)
    .join('\n\n');

  const header = formatHeader(readTopCard());

  const text = [header, description].filter((chunk) => chunk.length > 0).join('\n\n');

  return text.trim() || null;
}
