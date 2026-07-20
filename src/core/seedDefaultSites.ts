/**
 * One-time seed: the very first time the plugin ever runs (nothing has been
 * saved yet, so this reads as false — see storage.ts default), pre-marks
 * every hostname in defaultJobSites.ts as a job site. This is guarded by a
 * persisted flag so it only ever runs once; from then on the Sites tab is
 * the source of truth and users manage their own list freely, including
 * re-flipping or removing any of the seeded entries.
 */
import { DEFAULT_JOB_SITE_HOSTNAMES } from './defaultJobSites';
import { getSiteStatus, setSiteStatus } from './siteStatus';
import { getValue, setValue } from './storage';

const SEEDED_KEY = 'offerextract:hasSeededDefaultSites';

export function seedDefaultJobSitesOnce(loadDefaultSites: boolean): void {
  if (!loadDefaultSites) return;

  const alreadySeeded = getValue<boolean>(SEEDED_KEY, false);
  if (alreadySeeded) return;

  for (const hostname of DEFAULT_JOB_SITE_HOSTNAMES) {
    // Don't clobber an answer that (somehow) already exists for this host.
    if (getSiteStatus(hostname) === undefined) {
      setSiteStatus(hostname, true);
    }
  }

  setValue(SEEDED_KEY, true);
}

/**
 * Re-applies the built-in list of common job board/ATS hostnames as "job
 * site", overwriting any status previously set for exactly those hostnames.
 * Any other site the user has classified themselves is left untouched.
 * Used by the Settings tab's "Reset default job sites" button — separate
 * from the once-per-install seeding above, so it can be run any time.
 */
export function resetDefaultJobSites(): void {
  for (const hostname of DEFAULT_JOB_SITE_HOSTNAMES) {
    setSiteStatus(hostname, true);
  }
}
