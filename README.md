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
3. The library installs a small floating button (draggable, snaps to the nearest corner, position remembered across sites) plus a matching Tampermonkey menu command — both open the same menu panel, with tabs for **Job extraction** and **Settings**. On a job site, the Job extraction tab has a "Fetch offer" button: click it, then click any element on the page (hover highlights it like a DevTools inspector, Esc cancels), and a range slider lets you walk up its ancestor chain until the highlighted box covers the section you want — then copy its HTML. On any hostname visited for the first time, it also asks once whether the site is job-related and remembers the answer from then on. **It never submits or modifies the page.**

## Installation (Tampermonkey)

1. Pick a tagged release of this repository (or your fork) to pin.
2. Create a new Tampermonkey script from the template in [`examples/generic.tampermonkey.example.js`](./examples/generic.tampermonkey.example.js).
3. Adjust `@require` to the jsDelivr URL of the bundle, pinned to a tag:

   ```
   https://cdn.jsdelivr.net/gh/nicolas-goyon/WorkApplication-OfferExtract-TamperMonkey@v0.1.0/dist/tampermonkey-offerextract.js
   ```

4. Adjust `@match` to the pages you want the tool on (defaults to every site).
5. Save. The button appears bottom-right by default — drag it to any corner, it'll stay there on every site. Click it, or use the Tampermonkey menu command, to open the menu.

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

## Roadmap

- [x] Floating draggable button + Tampermonkey menu command, per-site job classification prompt.
- [x] Sites tab: searchable table of every classified hostname, with rename/toggle/remove; starter list of common job boards/ATS pre-seeded on first run.
- [x] "Fetch offer" element picker in the Job extraction tab: hover/click to select, range slider to climb the ancestor chain, copy the resulting HTML.
- [ ] Wire the generic/site extractors — and the picked HTML — into a structured, parsed `OfferData` result (next feature).

## Disclaimer

This tool only reads data already visible on the page; it never submits or modifies a form. The selectors it relies on may break whenever a target site changes its markup.
