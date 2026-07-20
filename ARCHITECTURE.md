# Architecture

## Goals

This repository provides a TypeScript library that extracts job offer data from a job application page in the browser, per site when needed. It is designed to be:

- **Public** — hosted on GitHub, served through the jsDelivr CDN, loaded into a Tampermonkey userscript via `@require`. No personal data must ever appear here (extraction only reads what the site already shows publicly).
- **Extensible per site** — a generic, site-agnostic extractor works everywhere out of the box; a new site can override it with tailored selectors without touching the others.

## Project layout

```
src/
  global.d.ts              Global types: `unsafeWindow` + GM_getValue/GM_setValue/
                            GM_addValueChangeListener/GM_registerMenuCommand declarations
  index.ts                 Root barrel -> dist/tampermonkey-offerextract.js (window.TMOfferExtract)
                            Exposes init(config): wires up the floating button, menu panel,
                            menu command, and per-site job-classification prompt.

  core/                    App state + Tampermonkey glue, no DOM
    storage.ts                GM_getValue/GM_setValue/GM_addValueChangeListener wrapper
                               (falls back to localStorage outside a userscript context)
    siteStatus.ts             Per-hostname "is this a job site?" map; also list-all/rename,
                               plus an in-tab pub/sub (onSiteStatusChange) so UI reacts live
    defaultJobSites.ts        Starter list of common job board/ATS hostnames
    seedDefaultSites.ts       One-time seed of defaultJobSites.ts into siteStatus, guarded
                               by a persisted flag so it only ever runs once
    buttonPosition.ts         Persisted floating-button corner
    menuCommand.ts            GM_registerMenuCommand wrapper

  ui/                      DOM pieces, wired to core/ but no business logic of their own
    floatingButton.ts         Draggable button; snaps to the nearest corner on release;
                               hidden entirely on hostnames marked not job-related
    menuPanel.ts              Tabbed panel (nav bar + content), opened by the button or
                               the Tampermonkey menu command. MenuTab has an optional
                               onDeactivate() hook, called on tab switch / menu close.
    sitePrompt.ts             One-off "is this a job site?" prompt
    cornerStyles.ts           Shared left/right/top/bottom styles for a given corner
    elementInspector.ts       DevTools-style hover-to-highlight/click-to-select picker;
                               resolves with the clicked Element, or cancels on Esc
    elementSelectionHighlight.ts  Persistent highlight box pinned to the picked element,
                                   repositioned every frame so it tracks scroll/layout shifts
    tabs/
      jobExtractionTab.ts       Job extraction tab: current-site classification, plus the
                                 "Fetch offer" picker flow (pick element -> range slider
                                 climbs its ancestor chain -> copy outer HTML)
      sitesTab.ts               Sites tab: searchable table of every classified hostname,
                                 with rename/toggle/remove per row
      settingsTab.ts            Settings tab (reset button position, forget this site)

  shared/                  Generic utilities, reusable across all site modules
    text.ts                  textOf() (trim + collapse whitespace)
    dom/
      root.ts                 getRootWindow() (unsafeWindow || window)
    ui/
      notify.ts               notify() toast
      elementOverlay.ts        createOverlayBox()/positionOverlayOnElement(): fixed-position
                                highlight box snapped to an element's bounding rect, shared by
                                the hover picker and the persistent selection highlight

  sites/
    generic/                One always-available module: JSON-LD JobPosting -> title/meta fallback
      types.ts                 OfferData: the shape every extractor returns
      extract.ts                extractGenericOffer()
      index.ts                  Public entry point: extract()
    _template/               Not bundled (not imported from src/index.ts) — copy when adding a real site
    <site-name>/             One subfolder per job site/ATS once added, same shape as generic/
```

The "Job extraction" tab now has a manual element picker ("Fetch offer" button) for grabbing the HTML of a job posting by hand: click it, hover/click an element on the page (hover highlight follows the mouse, Esc cancels), then use the range slider to walk up its ancestor chain until the highlighted box covers the right section, and copy the resulting outer HTML. Wiring that selection into `Generic.extract()` / a structured `OfferData` result is the next step — right now it's a raw-HTML capture tool, not a parser.

## Public API of a site module

Each `src/sites/<site>/index.ts` exposes at minimum:

```ts
export interface OfferData { url: string; title?: string; /* ... */ }
export function extract(): OfferData;
```

`extract()` reads only what's already on the page — no config, no personal data in, no side effects out except the return value.

## Build and distribution

- Source is TypeScript (`src/**/*.ts`), checked with `npm run typecheck`.
- `npm run build` (`scripts/build.mjs`) uses esbuild to produce a single IIFE bundle at `dist/tampermonkey-offerextract.js`, from `src/index.ts`. The bundle exposes `window.TMOfferExtract.<Site>` for each site re-exported there, plus `window.TMOfferExtract.init(config)`.
- Releases: push a `vX.Y.Z` tag; CI (`.github/workflows/release.yml`) builds, commits `dist/` onto that tag, and repositions the tag onto the build commit so jsDelivr serves it.
- Always point `@require` at a pinned tag, never a branch.

## Adding a new site

1. Copy `src/sites/_template/` to `src/sites/<site-name>/` (`types.ts`, `extract.ts`, `index.ts`).
2. Start `extract()` from `extractGenericOffer()` and override only the fields this site needs (see the commented example in `_template/extract.ts`).
3. Wire it into `src/index.ts`:
   ```ts
   import * as <Site> from './sites/<site-name>';
   export { Generic, <Site> };
   ```
4. Reuse `src/shared/*` rather than duplicating DOM/text helpers.
5. Add a template in `examples/<site-name>.tampermonkey.example.js` and list the site in the README's "Supported sites" table.

This part is intentionally minimal for now — extraction logic will grow site by site as we actually look at real pages.
