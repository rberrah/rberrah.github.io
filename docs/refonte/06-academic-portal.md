# Academic Portal (2026-09-14 / 15)

## Scope and Audit

The root portal is static HTML/CSS in `portal/`. The Pages workflow copies it
to the deployment root and mounts the independent SvelteKit build at
`/pharmacometrie/`. Shiny has its own deployment.

Reviewed: README, ROADMAP, portal pages, application routes and tracks,
tdm-engine/README, docs/refonte and deploy-pages.yml. The application exposes
15 learning tracks, five specialised workshops, laboratories and MIPD.
Native code import is not universal; ML and some transfers have documented
limits. The portal must not imply otherwise.

No scientific model, simulation, JSON contract, R module or licence changed.
No patient data, institutional PDFs or private project files were copied.

## Pages and Navigation

- Home: scientific identity, Pharmacometrics Explain, selected projects/work.
- Tools & Projects: MIPD Engine, TacDDI, MissedDose, GRAD.
- Publications & Talks: four papers, one reply letter, conference contributions.
- About and Contact: concise English biography and existing identifiers.
- Other Projects: secondary links to Internat Pharma and Stat & Biologie.
- Citation guide: English essentials; original French examples retained.

Existing /a-propos/, /contact/, /citer/ and /pharmacometrie/ remain.
/internat/ and /stats/ belong to separately deployed project sites; nothing
is published over those paths. Historical /research/ and /recherche/ resolve
to publications; /demos/ resolves to tools. The existing 404 redirect for
legacy application routes retains query strings and fragments.

Person JSON-LD preserves the existing #racym-berrah identity. Canonical and
OpenGraph URLs identify each English portal page. There is no invented French
translation or hreflang pair. Sitemaps do not guess other applications' dates.

## Content Provenance

- Residual error: https://pubmed.ncbi.nlm.nih.gov/41358610/
- Micafungin: https://pubmed.ncbi.nlm.nih.gov/41219680/ (2025 online date).
- Albumin: https://www.nature.com/articles/s41598-026-57614-y
  (publisher confirms equal contribution).
- Clindamycin: https://pubmed.ncbi.nlm.nih.gov/39827992/
- Reply letter: https://pubmed.ncbi.nlm.nih.gov/40602499/
- PAGE 2025: official poster-methodology-estimation-methods listing, I-034.
- PAGE 2026: official abstract, "Toward autonomous pharmacometrics", I-084.
- Rennes 2026: the author supplied both oral-communication titles.
  The general conference programme confirms the meeting, not a journal status.

No submission, acceptance or publication status is inferred for MissedDose
or NetPK. The optional manuscripts section is omitted. The author supplied
https://tdmhub.shinyapps.io/TacDDI/ on 15 September; the project page links to
this application. GRAD remains without a public link at the author's request.

The lab image is a capture of the existing two-compartment laboratory using
its default synthetic parameters at t = 2 h, in English and light mode.
It contains no patient data and links to the actual laboratory.

## Local Preview and Checks

PowerShell, from the repository root:

```powershell
npm run check
$env:BASE_PATH='/pharmacometrie'
npm run build
npm test
node scripts/preview_portal.mjs 4181
```

In another terminal:

```powershell
npx playwright test --config playwright.portal.config.js --workers=2
$env:LABS_E2E_URL='http://127.0.0.1:4181'
npx playwright test tests/e2e/analytics.spec.js --workers=2
```

The preview serves portal/ and build/ without altering either. Internat and
Stats links redirect to their existing public deployments. GoatCounter is
injected only during deployment; automated analytics tests intercept requests.
The preview is not a Shiny deployment.

Portal tests cover seven pages, internal links/fragments/assets, canonical and
JSON-LD metadata, sitemaps, redirects, keyboard navigation, no-JavaScript
navigation, light/dark themes and 320/390/1440/1920 px widths.

The existing analytics injection is retained, but now reuses the portal's
Privacy link instead of adding a duplicate. The shared counter logic,
including explicit manual opt-out and the requested DNT/GPC behaviour, is unchanged.

The analytics fixture is now generated per worker after Playwright clears its
output directory; it no longer depends on a manually prepared copy that could
be deleted before the tests start.

Validation: production build completed; Svelte check reported no errors or
warnings; content and numerical smoke tests passed; 13 portal browser tests
and 12 analytics tests passed. Internat, Stats and Pharmacometrics Explain
responded with HTTP 200. MissedDose returned Shiny's HTTP 202 startup response;
its dosing workflow was not tested as part of this portal-only change.

## Publication and Maintenance

- The author approved commit and publication on 15 September 2026.
- GRAD intentionally has no public link for now.
- Remove the isolated homepage conference block after the Rennes meeting;
  the permanent communications list remains.
- Verify the Pages workflow and public pages after pushing.
- Deploying Pages does not update Shiny.
