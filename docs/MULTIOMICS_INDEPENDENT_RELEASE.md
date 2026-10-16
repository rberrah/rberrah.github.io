# MultiOmics deployment handoff — permanent original URLs

**Owner:** MultiOmics sources are maintained in the separate public repository
https://github.com/rberrah/MultiOmics. PMx Explain remains the owner of
the single Pages deployment and the educational site. There is **no change**
to the publicly linked MultiOmics paths:

- https://rberrah.github.io/pharmacometrie/multiomics/
- https://rberrah.github.io/pharmacometrie/multiomics/tool/
- https://rberrah.github.io/pharmacometrie/multiomics/learn/

Also preserve existing shorthand portal routes and static templates.

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
temporary directory. On that separate clean checkout it executes npm ci,
the SvelteKit build with BASE_PATH=/pharmacometrie, and independent SHA-256
payload generation and verification.

The PMx Pages workflow assembles portal and PMx Explain **as before**, then
overlays only two allowlisted directories in the final static artifact:

- dist/pharmacometrie/multiomics/
- dist/pharmacometrie/_multiomics_app/

The app asset namespace is deliberately not PMx Explain's _app/ directory.
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

This release PR does **not** delete MultiOmics code from PMx Explain: it will
be removed only in a later, independent cleanup after the portal agents'
work, accessibility checks, scientific golden comparisons and a stable
public release. PR #115's public smoke must be reconciled with the new
deploy workflow before relying on post-deployment alerts.

GitHub Pages serves static browser code, not a live R service. Reference R
inference requires an explicitly chosen local or institutionally approved
backend. A successful CI is not certification of universal FDR control or
clinical biomarker validity.
