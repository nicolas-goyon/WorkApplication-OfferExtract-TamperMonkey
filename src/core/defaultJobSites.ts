/**
 * Starter list of common job board / ATS hostnames. Seeded once, as "job
 * site" (true), the very first time the plugin ever runs on a browser (see
 * seedDefaultSites.ts) — purely a head start so the "is this a job site?"
 * prompt doesn't fire on the obvious ones. Not authoritative or exhaustive:
 * add, rename, or remove entries any time from the Sites tab.
 */
export const DEFAULT_JOB_SITE_HOSTNAMES: readonly string[] = [
  // Global job boards
  'linkedin.com',
  'indeed.com',
  'glassdoor.com',
  'monster.com',
  'ziprecruiter.com',
  'careerbuilder.com',
  'simplyhired.com',
  'dice.com',
  'wellfound.com',
  'remote.co',
  'weworkremotely.com',
  'flexjobs.com',
  'remoteok.com',
  'himalayas.app',
  'otta.com',
  'hiringcafe.com',
  'workatastartup.com',

  // Regional job boards
  'seek.com.au',
  'jobstreet.com',
  'reed.co.uk',
  'totaljobs.com',
  'cv-library.co.uk',
  'stepstone.com',
  'xing.com',
  'welcometothejungle.com',
  'jobteaser.com',
  'apec.fr',
  'francetravail.fr',
  'hellowork.com',
  'cadremploi.fr',
  'keljob.com',

  // ATS / careers platforms
  'greenhouse.io',
  'lever.co',
  'smartrecruiters.com',
  'jobvite.com',
  'icims.com',
  'workable.com',
  'breezy.hr',
  'recruitee.com',
  'teamtailor.com',
  'jazzhr.com',
  'bamboohr.com',
  'ashbyhq.com',
  'personio.de',
  'personio.com',
  'myworkdayjobs.com',
];
