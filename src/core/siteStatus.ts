/**
 * Per-hostname "is this a job-related site?" classification. Asked once per
 * hostname (see ui/sitePrompt.ts); remembered from then on until the user
 * explicitly forgets it (see ui/tabs/settingsTab.ts).
 *
 * When a hostname is marked as *not* a job site, the rest of the plugin
 * (floating button, prompts, extraction) stays dormant on that hostname —
 * only the Tampermonkey menu command still opens the menu, so the site can
 * be reclassified later (see index.ts).
 */
import { getValue, setValue } from './storage';

const SITE_STATUS_KEY = 'offerextract:siteJobStatus';

type SiteStatusMap = Record<string, boolean>;
type SiteStatusListener = (hostname: string, isJobSite: boolean | undefined) => void;

// Same-tab pub/sub so UI (index.ts) can react immediately when a tab/panel
// changes the current hostname's status. GM_addValueChangeListener exists
// for cross-tab notification, but isn't guaranteed to fire for changes made
// by this same script instance, so it isn't relied on here.
const listeners = new Set<SiteStatusListener>();

function readMap(): SiteStatusMap {
  return getValue<SiteStatusMap>(SITE_STATUS_KEY, {});
}

function notify(hostname: string, isJobSite: boolean | undefined): void {
  for (const listener of listeners) listener(hostname, isJobSite);
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
  notify(hostname, isJobSite);
}

export function clearSiteStatus(hostname: string): void {
  const map = readMap();
  delete map[hostname];
  setValue(SITE_STATUS_KEY, map);
  notify(hostname, undefined);
}

/** Fires whenever setSiteStatus/clearSiteStatus runs, for any hostname, in this tab. */
export function onSiteStatusChange(listener: SiteStatusListener): void {
  listeners.add(listener);
}

export interface SiteStatusEntry {
  hostname: string;
  isJobSite: boolean;
}

/** Every classified hostname, sorted alphabetically. Used by the Sites tab. */
export function getAllSiteStatuses(): SiteStatusEntry[] {
  return Object.entries(readMap())
    .map(([hostname, isJobSite]) => ({ hostname, isJobSite }))
    .sort((a, b) => a.hostname.localeCompare(b.hostname));
}

/** Renames a classified hostname's key, keeping its status. No-op if oldHostname isn't classified. */
export function renameSiteHostname(oldHostname: string, newHostname: string): void {
  const trimmed = newHostname.trim();
  if (!trimmed || trimmed === oldHostname) return;

  const map = readMap();
  if (!(oldHostname in map)) return;

  const isJobSite = map[oldHostname];
  delete map[oldHostname];
  map[trimmed] = isJobSite;
  setValue(SITE_STATUS_KEY, map);

  notify(oldHostname, undefined);
  notify(trimmed, isJobSite);
}
