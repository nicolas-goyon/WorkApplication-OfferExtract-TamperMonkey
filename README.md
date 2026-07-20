# Work Application - Offer Extract

A TypeScript library that extracts job offer data (title, company, location, description, ...) from job application pages, designed to be loaded into a [Tampermonkey](https://www.tampermonkey.net/) userscript via `@require`.

Sibling project of [WorkApplicationAutofill-TamperMonkey](https://github.com/nicolas-goyon/WorkApplicationAutofill-TamperMonkey), which fills application forms; this one is about pulling data *out* of a job posting page instead.

**This repository contains no personal data.** See [`ARCHITECTURE.md`](./ARCHITECTURE.md) for the project layout and how to add a new site.

## Supported sites

| Site | Module | Notes |
|---|---|---|
| Generic (any page) | `src/sites/generic/` | Reads schema.org `JobPosting` JSON-LD when present, falls back to `<title>` / meta description. Used automatically when no site-specific module matches. |

More sites are added incrementally under `src/sites/<site>/` — see `src/sites/_template/` for the starting shape of a new one.

## How it works

1. This repository is public and served through the [jsDelivr](https://www.jsdelivr.com/) CDN, which serves files straight from GitHub tags.
2. Your local Tampermonkey userscript loads the library with `@require`, then calls `window.TMOfferExtract.init({ ... })`.
3. The library installs a floating "Extract offer" button on matching pages. On click, it runs the extractor (generic by default, or a site-specific one you pass in), logs the result, and copies it to the clipboard as JSON. **It never submits or modifies the page.**

## Installation (Tampermonkey)

1. Pick a tagged release of this repository (or your fork) to pin.
2. Create a new Tampermonkey script from the template in [`examples/generic.tampermonkey.example.js`](./examples/generic.tampermonkey.example.js).
3. Adjust `@require` to the jsDelivr URL of the bundle, pinned to a tag:

   ```
   https://cdn.jsdelivr.net/gh/nicolas-goyon/WorkApplication-OfferExtract-TamperMonkey@v0.1.0/dist/tampermonkey-offerextract.js
   ```

4. Adjust `@match` to the pages you want the button on.
5. Save. On a job posting page, click the floating button, review the extracted JSON in the console/clipboard.

Always pin an exact tag (`@v0.1.0`) rather than a branch or `@latest`.

## Development

Requires Node.js.

```bash
npm install
npm run typecheck   # TypeScript check (tsc --noEmit)
npm run build       # bundle to dist/tampermonkey-offerextract.js (esbuild)
npm run build:watch # rebuild on change
```

## Releasing

CI does this automatically on tag push (see `.github/workflows/release.yml`):

```bash
git tag v0.1.0
git push origin v0.1.0
```

CI typechecks, builds, commits `dist/` onto the tag, and repositions the tag onto that build commit so jsDelivr serves it from:

```
https://cdn.jsdelivr.net/gh/nicolas-goyon/WorkApplication-OfferExtract-TamperMonkey@v0.1.0/dist/tampermonkey-offerextract.js
```

## Adding a new site

See [`ARCHITECTURE.md`](./ARCHITECTURE.md#adding-a-new-site).

## Disclaimer

This tool only reads data already visible on the page; it never submits or modifies a form. The selectors it relies on may break whenever a target site changes its markup.
