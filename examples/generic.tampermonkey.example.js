// ==UserScript==
// @name         Offer Extract - Generic
// @namespace    local.offerextract
// @version      1.0.0
// @description  Floating draggable button + Tampermonkey menu for Offer Extract. Job extraction is a placeholder for now; nothing is submitted or modified on the page.
// @match        *://*/*
// @noframes
// @run-at       document-idle
// @grant        unsafeWindow
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_addValueChangeListener
// @grant        GM_registerMenuCommand
// @require      https://cdn.jsdelivr.net/gh/nicolas-goyon/WorkApplication-OfferExtract-TamperMonkey@v0.1.4/dist/tampermonkey-offerextract.js
// ==/UserScript==

// TEMPLATE — copy this file into a new local Tampermonkey script. It runs on
// every site by default: the floating button (draggable, snaps to the
// nearest corner, position remembered across sites) and the Tampermonkey
// menu command both open the same menu. On a hostname visited for the first
// time, it also asks once whether the site is job-related and remembers
// the answer.

(function () {
  'use strict';

  window.TMOfferExtract.init({
    // buttonLabel: '☰',                            // default
    // menuCommandLabel: 'Open Offer Extract menu', // default
    loadDefaultJobSites: true, // default: false
  });
})();
