import { JSDOM } from 'jsdom';
import fs from 'node:fs';

const files = [
  '/sessions/pensive-relaxed-goodall/mnt/uploads/Développeur Informatique F_H _ MECAPROTEC AERO _ LinkedIn.html',
  '/sessions/pensive-relaxed-goodall/mnt/uploads/Fullstack Software Engineer - Work Environment (x_f_m) _ Alan _ LinkedIn.html',
];

const bundle = fs.readFileSync(
  '/sessions/pensive-relaxed-goodall/mnt/WorkApplication-OfferExtract-TamperMonkey/dist/tampermonkey-offerextract.js',
  'utf-8',
);

for (const file of files) {
  const html = fs.readFileSync(file, 'utf-8');
  const dom = new JSDOM(html, {
    url: 'https://www.linkedin.com/jobs/search-results/?currentJobId=1',
    runScripts: 'outside-only',
    pretendToBeVisual: true,
  });
  const { window } = dom;

  // requestAnimationFrame polyfill for jsdom
  window.requestAnimationFrame = (cb) => setTimeout(() => cb(Date.now()), 0);

  window.eval(bundle);

  console.log('=== FILE:', file.split('/').pop(), '===');
  console.log('matchesHostname:', window.TMOfferExtract.LinkedIn.matchesHostname('www.linkedin.com'));

  const offer = window.TMOfferExtract.LinkedIn.extract();
  console.log('title:', offer.title);
  console.log('company:', offer.company);
  console.log('location:', offer.location);
  console.log('description length:', offer.description?.length);
  console.log('description preview:', offer.description?.slice(0, 300));
  console.log('description tail:', offer.description?.slice(-200));

  window.TMOfferExtract.LinkedIn.getTemplateText().then((text) => {
    console.log('template text length:', text?.length);
    console.log('template text tail:', text?.slice(-200));
    console.log();
  });
}
