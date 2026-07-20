/**
 * Registry of per-site "templates": automated stand-ins for the manual
 * "Fetch offer" element picker, for sites whose markup is known well enough
 * to locate the offer content without a human pointing at it. The manual
 * picker (see ui/tabs/jobExtractionTab.ts) stays available regardless —
 * templates are an accelerator, not a replacement.
 *
 * Add a new site by giving it a `matchesHostname`/text-getter pair (see
 * sites/apec/template.ts for the shape) and listing it in SITE_TEMPLATES.
 */
import * as Apec from '../sites/apec';
import * as LinkedIn from '../sites/linkedin';

export interface SiteTemplate {
  id: string;
  /** Shown on the "Use template" button, e.g. "Apec.fr". */
  label: string;
  matchesHostname: (hostname: string) => boolean;
  /** Resolves to the combined clean text for the offer, or null if the expected markup isn't there. */
  getText: () => Promise<string | null>;
}

const SITE_TEMPLATES: readonly SiteTemplate[] = [
  {
    id: 'apec',
    label: 'Apec.fr',
    matchesHostname: Apec.matchesHostname,
    getText: Apec.getTemplateText,
  },
  {
    id: 'linkedin',
    label: 'LinkedIn',
    matchesHostname: LinkedIn.matchesHostname,
    getText: LinkedIn.getTemplateText,
  },
];

/** Returns the template registered for this hostname, if any. */
export function getSiteTemplate(hostname: string): SiteTemplate | undefined {
  return SITE_TEMPLATES.find((template) => template.matchesHostname(hostname));
}
