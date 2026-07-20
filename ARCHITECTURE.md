# Architecture

## Goals

This repository provides a TypeScript library that extracts job offer data from a job application page in the browser, per site when needed. It is designed to be:

- **Public** — hosted on GitHub, served through the jsDelivr CDN, loaded into a Tampermonkey userscript via `@require`. No personal data must ever appear here (extraction only reads what the site already shows publicly).
- **Extensible per site** — a generic, site-agnostic extractor works everywhere out of the box; a new site can override it with tailored selectors without touching the others.

## Project layout

```
src/
  global.d.ts              Global types (e.g. `unsafeWindow` provided by Tampermonkey)
  index.ts                 Root barrel -> dist/tampermonkey-offerextract.js (window.TMOfferExtract)
                            Also exposes init(config) which installs the floating button.

  shared/                  Generic utilities, reusable across all site modules
    text.ts                  textOf() (trim + collapse whitespace)
    dom/
      root.ts                 getRootWindow() (unsafeWindow || window)
    ui/
      notify.ts               notify(), installButton(), observeAndReinstallButton()

  sites/
    generic/                One always-available module: JSON-LD JobPosting -> title/meta fallback
      types.ts                 OfferData: the shape every extractor returns
      extract.ts                extractGenericOffer()
      index.ts                  Public entry point: extract()
    _template/               Not bundled (not imported from src/index.ts) — copy when adding a real site
    <site-name>/             One subfolder per job site/ATS once added, same shape as generic/
```

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
