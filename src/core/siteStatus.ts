/**
 * Per-hostname "is this a job-related site?" classification. Asked once per
 * hostname (see ui/sitePrompt.ts); remembered from then on until the user
 * explicitly forgets it (see ui/tabs/settingsTab.ts).
 */
import { getValue, setValue } from './storage';

const SITE_STATUS_KEY = 'offerextract:siteJobStatus';

type SiteStatusMap = Record<string, boolean>;

function readMap(): SiteStatusMap {
  return getValue<SiteStatusMap>(SITE_STATUS_KEY, {});
}

/** true = marked as a job site, false = marked as not one, undefined = not asked yet. */
export function getSiteStatus(hostname: string): boolean | undefined {
  return readMap()[hostname];
}

export function hasAskedForSite(hostname: string): boolean {
  return getSiteStatus(hostname) !== undefined;
}

export function setSiteStatus(hostname: string, isJobSite: boolean): void {
  const map = readMap();
  map[hostname] = isJobSite;
  setValue(SITE_STATUS_KEY, map);
}

export function clearSiteStatus(hostname: string): void {
  const map = readMap();
  delete map[hostname];
  setValue(SITE_STATUS_KEY, map);
}
