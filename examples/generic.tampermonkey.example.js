// ==UserScript==
// @name         Offer Extract - Generic
// @namespace    local.offerextract
// @version      1.0.0
// @description  Adds an "Extract offer" button that reads job posting data from the page and copies it as JSON. Never submits anything.
// @match        *://*/*
// @run-at       document-idle
// @grant        unsafeWindow
// @grant        GM_setClipboard
// @require      https://cdn.jsdelivr.net/gh/nicolas-goyon/WorkApplication-OfferExtract-TamperMonkey@v0.1.0/dist/tampermonkey-offerextract.js
// ==/UserScript==

// TEMPLATE — copy this file into a new local Tampermonkey script and adjust
// @match to the job site(s) you actually want the button on. One @require
// covers every site module in the bundle, including ones added later.

(function () {
  'use strict';

  window.TMOfferExtract.init({
    // buttonLabel: 'Extract offer',
    // extract: window.TMOfferExtract.Generic.extract, // default
    // onExtract: (offer) => console.log(offer),
  });
})();
