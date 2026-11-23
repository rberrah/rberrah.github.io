# Scientific visibility: scoped portal change and verification plan (2026-11-23)

## Scope and ownership

This change is intentionally limited to the public portfolio portal. It does not edit PMx Game, pharmacometrics lessons, simulation engines, PK laboratories, software dependencies, CI, or the repositories that deploy Stats, MultiOmics and MIPD Engine. Existing open development PRs remain independent. Do not merge automatically.

## Changes

- The homepage connects three research directions to the original research communications and a peer-reviewed article.
- The academic profile documents the same directions and links to reproducible technical evidence.
- The Tools page makes software methods, limitations and source repositories more explicit. Autonomous Pharmacometrics is labelled **research under evaluation**, not a validated product.
- Schema.org SoftwareApplication is added for the existing browser applications PMx Explain, Stats, Multiomics and MIPD Engine. The existing Person and ScholarlyArticle data are unchanged.
- No new SEO landing pages, URL changes, redirects, new claims of clinical validation, software version claims or role/mandate claims are introduced.

## Checks before merging

1. Inspect the diff and confirm only `portal/index.html`, `portal/tools/index.html`, `portal/a-propos/index.html` and this document changed.
2. Parse every `application/ld+json` block as JSON. Confirm that each software `author.@id` references `/#racym-berrah`, and that the links to source repositories and research presentations resolve.
3. Run existing portal/browser tests and the site deployment qualification normally used by this repository. Do not bypass checks or trigger unrelated projects intentionally.
4. On the published deployment, confirm page titles, canonical URLs, robots/sitemap and visible rendering. The source files contain the `__SITE_ORIGIN__` placeholder until the build replaces it.

## External Google Search Console / Bing Webmaster verification (manual)

The repository has Google verification metadata and a verification file, but that **does not demonstrate indexing or ranking**. Access to the property analytics is needed to check the following:

- Verify ownership of the canonical `https://rberrah.github.io/` property and submit `/sitemap-index.xml` if absent.
- Inspect the indexed status and selected canonical for `/`, `/a-propos/`, `/tools/`, `/publications/` and `/pharmacometrie/`.
- Review Pages indexing exclusions and technical errors rather than relying on `site:` queries.
- Export a baseline of queries, impressions, clicks, CTR and average position for personal-name terms vs research/technical terms. Compare equivalent 28-day periods after indexing and avoid promising a ranking gain.
- Use a structured-data validator to check the JSON-LD; eligibility for Google rich results is not guaranteed by SoftwareApplication schema.

## Evidence boundary

Software repositories and unit tests demonstrate implementation and bounded qualification, not patient outcome efficacy. Posters demonstrate communicated research, not completed external validation. Governance/association mandates should be added only after exact titles, dates and institutional sources are verified.
