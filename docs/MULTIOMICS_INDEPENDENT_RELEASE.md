# MultiOmics deployment handoff — independent source and short canonical URL

**Owner:** MultiOmics sources are maintained in the separate public repository
https://github.com/rberrah/MultiOmics. PMx Explain remains the owner of
the single Pages deployment and the educational site.

**Target canonical routes:**

- https://rberrah.github.io/multiomics/
- https://rberrah.github.io/multiomics/tool/
- https://rberrah.github.io/multiomics/learn/

The historical `/pharmacometrie/multiomics/` routes remain compatibility
aliases during the cut-over and must preserve deep links, query strings and
fragments. They are no longer intended to remain canonical permanently.

Extraction is complete for the application implementation. Scientific qualification,
browser source, R backend, assets and source-level tests now belong to
`rberrah/MultiOmics`. PMx retains only the immutable source pin, verified Pages
overlay, compatibility aliases and assembled-site acceptance test.

## Release controls

The GitHub Pages job publishes the dist artifact produced by PMx qualification
only after the full PMx qualification workflow has succeeded.

The PMx build reads integration/multiomics-release.json. It accepts an exact
40-character commit SHA from rberrah/MultiOmics, **never a mutable branch**,
then verifies GitHub Actions succeeded on that exact SHA for these independent
source CI workflows:

- Standalone SvelteKit, JS, browser and package-free R contracts
- Native R and R Markdown Airway/GSE52778 paired replay
- Real Nutrimouse MOFA2 audit
- Real Nutrimouse DIABLO audit

It then checks out the exact public source commit into the ephemeral runner's
temporary directory. On that separate clean checkout it executes `npm ci`,
builds MultiOmics for the domain root and verifies the release payload by SHA-256.

The PMx Pages workflow assembles portal and PMx Explain, then overlays only two
allowlisted root directories in the final static artifact:

- `dist/multiomics/`
- `dist/_multiomics_app/`

The app asset namespace is deliberately separate from PMx Explain's `_app/` directory.
The PMx root, portal, statistics tool and other courses are not replaced. A
second verification of every imported file SHA-256 is required after copying,
and the site's normal public-artifact privacy audit still runs.

A distinct Playwright test serves the final assembled dist directory (not the
PMx dev server), tests all three original MultiOmics routes on desktop and
mobile, confirms Svelte hydration, all four demo controls and real results.

## Upgrading to another qualified MultiOmics release

1. Land and independently validate the change in MultiOmics/main. Keep its
   scientific R/Bioconductor evidence, including adverse/null results.
2. Update only the exact commit SHA in integration/multiomics-release.json in
   a small PMx Explain PR. Never use HEAD or a moving tag.
3. Allow PMx CI to verify the four original source workflow results and the
   assembled Pages build. Confirm that changing the release does not regress
   a newer published MultiOmics interface or invalidate public URLs.
4. Merge the update after coordination with concurrent PMx Explain agents.
   The existing deploy-pages.yml will publish that *validated PMx build*.
5. Verify the public URLs and ZIP/MS import in the deployed site using live
   Playwright smoke, not merely static HTTP 200 responses.

A cross-repository notification can propose a SHA-bump PR in the future, but
must **not** bypass source validation or directly publish unreviewed commits.

## Rollback / concurrency

To roll back an unsuitable MultiOmics version, revert the pin in
integration/multiomics-release.json to the last known-good qualified SHA;
the next PMx Pages artifact returns to the verified prior version without
any URL changes. If overlay integration itself fails, revert the isolated PMx
integration commit before the next deployment and leave original PMx-owned
MultiOmics sources in place.

Completed extraction stages:

1. duplicate backend and MultiOmics-specific scientific workflows removed;
2. canonical `/multiomics/` root overlay switched to the standalone repository;
3. historical `/pharmacometrie/multiomics/` paths converted to compatibility aliases;
4. duplicate PMx Svelte routes, static assets, scientific scripts and source-level
   MultiOmics test harnesses removed.

PMx continues to pin an immutable, independently qualified MultiOmics commit and
retains a documented rollback path. Historical PMx-only validation material was
archived in `rberrah/MultiOmics/legacy/pmx-extraction-20261016/`.

GitHub Pages serves static browser code, not a live R service. Reference R
inference requires an explicitly chosen local or institutionally approved
backend. A successful CI is not certification of universal FDR control or
clinical biomarker validity.


## Canonical root cut-over

As of the root-cutover integration, PMx builds the pinned standalone repository
with no SvelteKit base prefix and mounts only the verified `multiomics/` and
`_multiomics_app/` directories at the domain root. The canonical public
application is therefore `/multiomics/`.

The historical `/pharmacometrie/multiomics/` tree is removed from the final
artifact and replaced by three tiny compatibility aliases for the landing page,
tool and methods page. These aliases preserve query strings and fragments and
carry `noindex,follow` plus canonical metadata pointing to `/multiomics/`.

The old PMx MultiOmics implementation has now been removed. The only MultiOmics
code retained in PMx is cross-repository integration code required to fetch,
verify, mount and acceptance-test the independently qualified release.
