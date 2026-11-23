# Thesis ecosystem publication gate and Google Search Console sitemap diagnosis
Updated: 2026-11-24

## Purpose and ownership

The public page `/pharmacometrie/ecosystem/` now has a distinct thesis-research section. Its existing PMx Explain → MultiOmics → Omics2PK educational/data handoff is unchanged. Future manuscript, poster and tool citations should be added here without modifying the scientific engines or private repositories.

The public presentation records in the portal are the current evidence anchors:
- **NetPK:** `/communications/netpk-peprsn-2026/`, poster presented at PEPR Santé Numérique 2026.
- **Pillar B, autonomous pharmacometrics:** `/communications/autonomous-pharmacometrics-page-2026/`, poster presented at PAGE 2026.

The programme also names Pillars A, C, D and PhenoPass as **ongoing research only**. These cards do not disclose internal files, analyses, results, manuscript claims, private repository URLs or estimated dates of publication. NewPK, SymbolicNet and further projects should be added only after appropriate public evidence is available and the owner has reviewed the wording.

## Publication workflow (manual and evidence-gated)

For each publication update, **before** changing visible status:

1. Verify a stable public source, such as a DOI, official publisher landing page, journal accepted-manuscript notice, public preprint, conference abstract or poster.
2. Keep distinct stages: `research in progress`, `conference presentation`, `preprint`, `accepted`, `peer-reviewed published`. Never automatically promote a poster to a paper.
3. Add the reference and link to the precise project card in `src/routes/ecosystem/+page.svelte` and, if appropriate, to the central `portal/publications/index.html` bibliography. Preserve the original source attribution/coauthors and align the citation with the source.
4. Where justified, add a dedicated accessible public page or technical summary with scope, evidence, validation boundary and links. Do not make pages solely to repeat keywords.
5. Add its canonical, indexable **public** URL to the appropriate portal or PMx sitemap, and update `lastmod` only to a verified material-change date. Check internal navigation, FR/EN wording, SEO metadata and the browser tests.
6. Do not copy material from private repositories or link to private GitHub pages. No claim of external clinical validation without an independent source.

## Google sitemap investigation: evidence, not conjecture

The latest available **public HTTP audit** from GitHub Actions was successful on **2026-11-23**:
- Audit run: https://github.com/rberrah/rberrah.github.io/actions/runs/45257751547
- `/robots.txt`, verification HTML and `/sitemap-index.xml`: HTTP 200, no unexpected redirects
- `/sitemap-index.xml`: correct `sitemapindex` root, four valid absolute child URLs
- Child `/sitemap.xml`: 24 portal URLs
- Child `/pharmacometrie/sitemap.xml`: 132 URLs
- Child `/stats/sitemap.xml`: 53 URLs
- Child `/Omics2PK/sitemap.xml`: 7 URLs
- All XML responses delivered `application/xml` and parsed successfully; `sitemap-index.xml` and `sitemap.xml` also returned 200 with a simulated Googlebot User-Agent
- Representative HTML pages had HTTP 200, a title, visible server-rendered text and self-canonical URLs.

**Interpretation:** this establishes public HTTP and syntax prerequisites as of the audit date, not Google Search Console acceptance, genuine Googlebot fetchability or indexing. A real Google access error may still be present, and Search Console may show a delayed or unsuccessful read. Do not rewrite the sitemap format or assert that the problem is solved without the actual Search Console status details.

### Search Console owner checklist

1. Select the exact **URL-prefix property** `https://rberrah.github.io/` (rather than another protocol or host). Check that the owner verification is valid; GitHub Pages does not grant control over the parent `github.io` domain's DNS.
2. In **Indexing → Sitemaps**, inspect `https://rberrah.github.io/sitemap-index.xml`, especially **Status**, **Type**, **Submitted**, **Last read**, **Discovered pages** and the expanded precise error details.
3. Use **URL Inspection → Test live URL** for `https://rberrah.github.io/sitemap-index.xml`, then expand **Page availability** and inspect `Crawl allowed?` and `Page fetch`. Also test `https://rberrah.github.io/` or another affected HTML URL to distinguish an indexing issue from a sitemap retrieval issue.
4. As a diagnostic comparison, submit the smaller `https://rberrah.github.io/sitemap.xml` separately *once* in the same property. If the child succeeds but the index fails, investigate the index/processing layer; if neither succeeds, focus on the exact Google-side fetch response and property.
5. Inspect **Security & Manual actions**, `robots.txt` status and canonical/indexing coverage. A healthy sitemap does not guarantee individual pages appear in Search.
6. Preserve screenshots/export of Search Console's exact message, timestamp of last successful read, and property URL before changing the public sitemap again.

Do not repeatedly remove and resubmit every sitemap without a specific new finding.

Official references:
- https://support.google.com/webmasters/answer/7451001
- https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap
- https://developers.google.com/search/docs/crawling-indexing/sitemaps/large-sitemaps

## Maintenance in this change

The portal sitemap's `lastmod` values for `/`, `/tools/` and `/a-propos/` were stale and have been updated to **2026-11-23**, the real date these pages were materially revised in PR #259. This is metadata hygiene, **not a demonstrated fix for Google Search Console's "Couldn't fetch" status**.

## Next visibility priorities

- Add links from publications and public source repositories back to their **precise** public descriptions, not just the homepage.
- Use an evidence ladder for project cards: public source, independent data, publication stage, clinical-use caveat.
- Measure impressions/queries/coverage in Search Console once authorised; the source-controlled verification file alone does not establish current GSC property state.
- Keep canonical URLs in the sitemap; avoid indexation of compatibility redirects and duplicate language variants where the content/canonical is not distinct.
