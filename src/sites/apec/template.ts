import { elementToCleanText } from '../../shared/dom/htmlToText';
import { SEE_MORE_SELECTOR, TEMPLATE_SECTION_SELECTORS } from './selectors';

const HOSTNAME_SUFFIX = 'apec.fr';

export function matchesHostname(hostname: string): boolean {
  return hostname === HOSTNAME_SUFFIX || hostname.endsWith(`.${HOSTNAME_SUFFIX}`);
}

export function locateSections(): Element[] {
  const seen = new Set<Element>();
  const sections: Element[] = [];
  for (const selector of TEMPLATE_SECTION_SELECTORS) {
    const el = document.querySelector(selector);
    if (el && !seen.has(el)) {
      seen.add(el);
      sections.push(el);
    }
  }
  return sections;
}

export async function expandCollapsedSections(scope: Element): Promise<void> {
  const toggles = Array.from(scope.querySelectorAll(SEE_MORE_SELECTOR));
  if (toggles.length === 0) return;

  for (const toggle of toggles) {
    // Click the innermost <span>, not the <label>: clicks bubble up from the
    // target, and Angular's handler sits on the span, not its ancestor.
    const clickTarget = toggle.querySelector('label span') ?? toggle.querySelector('label') ?? toggle;
    clickTarget.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
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

// Returns null if the page doesn't look like an Apec offer page, so the caller can fall back to manual picking.
export async function getTemplateText(): Promise<string | null> {
  const sections = locateSections();
  if (sections.length === 0) return null;

  for (const section of sections) {
    await expandCollapsedSections(section);
  }

  const text = sections
    .map((el) => elementToCleanText(el))
    .filter((chunk) => chunk.length > 0)
    .join('\n\n');

  return text.trim() || null;
}
