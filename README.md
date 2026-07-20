# Work Application - Offer Extract

A TypeScript library that extracts job offer data (title, company, location, description, ...) from job application pages, designed to be loaded into a [Tampermonkey](https://www.tampermonkey.net/) userscript via `@require`.

Sibling project of [WorkApplicationAutofill-TamperMonkey](https://github.com/nicolas-goyon/WorkApplicationAutofill-TamperMonkey), which fills application forms; this one is about pulling data *out* of a job posting page instead.

**This repository contains no personal data.** See [`ARCHITECTURE.md`](./ARCHITECTURE.md) for the project layout and how to add a new site.

## Supported sites

| Site | Module | Notes |
|---|---|---|
| Generic (any page) | `src/sites/generic/` | Reads schema.org `JobPosting` JSON-LD when present, falls back to `<title>` / meta description. Used automatically when no site-specific module matches. |
| Apec.fr | `src/sites/apec/` | Locates title/contract/location chips and the `apec-poste-informations` offer body, expanding "Voir plus" skill-list toggles first. Also registered as a template (see below) for one-click automated picking in the Job extraction tab. |
| LinkedIn (job search results) | `src/sites/linkedin/` | Reads title/company from `document.title`, locates the offer body via the `expandable-text-box` data-testid (LinkedIn's CSS classes are hashed per build, so selectors avoid them) and clicks its "…plus" toggle first. Also registered as a template. |

More sites are added incrementally under `src/sites/<site>/` — see `src/sites/_template/` for the starting shape of a new one.

## How it works

1. This repository is public and served through the [jsDelivr](https://www.jsdelivr.com/) CDN, which serves files straight from GitHub tags.
2. Your local Tampermonkey userscript loads the library with `@require`, then calls `window.TMOfferExtract.init({ ... })`.
3. The library installs a small floating button (draggable, snaps to the nearest corner, position remembered across sites) plus a matching Tampermonkey menu command — both open the same menu panel, with tabs for **Job extraction** and **Settings**. On a job site with a registered template (see "Supported sites"), the Job extraction tab shows a one-click "Use `<site>` template" button that locates and copies the offer text automatically. Manual picking is always available too: click "Fetch offer", then click any element on the page (hover highlights it like a DevTools inspector, Esc cancels), and a range slider lets you walk up its ancestor chain until the highlighted box covers the section you want — then copy its cleaned text. On any hostname visited for the first time, it also asks once whether the site is job-related and remembers the answer from then on. **It never submits or modifies the page.**

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

Releases are cut automatically (see `.github/workflows/release.yml`): every push to `main` that touches `src/`, `package.json`/`package-lock.json`, `tsconfig.json`, or `scripts/` typechecks, builds, and publishes the next version tag.

- Default bump is **patch** (`v0.1.9` -> `v0.1.10`).
- Include `[minor]` in a commit message on that push for a **minor** bump (`v0.1.9` -> `v0.2.0`).
- Include `[major]` in a commit message on that push for a **major** bump (`v0.1.9` -> `v1.0.0`).
- `[major]` wins if both are present.

No manual tagging needed. To rebuild an existing tag in place (e.g. a broken jsDelivr cache), or to cut a release manually without touching `main`, run the workflow by hand from the Actions tab (`workflow_dispatch`).

CI commits `dist/` onto the new tag and pushes it, so jsDelivr serves it from:

```
https://cdn.jsdelivr.net/gh/nicolas-goyon/WorkApplication-OfferExtract-TamperMonkey@v0.1.10/dist/tampermonkey-offerextract.js
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
