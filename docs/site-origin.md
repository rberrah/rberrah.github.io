# Public Site Origin

`PUBLIC_SITE_ORIGIN` is the single build-time setting for the portal and Svelte
application. Its current default is defined only in `site.config.js`. The origin
is validated and normalized (HTTP/HTTPS, no path, credentials, query or fragment).
`SITE_BASE=/pharmacometrie` stays independent; this change does not move routes.

## Local Build

PowerShell, from the repository root:

```powershell
$env:PUBLIC_SITE_ORIGIN = 'https://example.org'
$env:BASE_PATH = '/pharmacometrie'
npm run build
```

Vite's `.env` and `.env.production` are also supported; process variables take
precedence. An unset or empty origin uses the central default. The value is
embedded at build time, not read from visitors' URLs.

Assemble a fresh output directory by copying `portal/` to its root and `build/`
to `pharmacometrie/`, as in the Pages workflow. With the same environment:

```sh
node scripts/configure_site_origin.mjs dist
node scripts/add_portal_analytics.mjs dist
```

The first script resolves portal tokens and generates `assets/site-origin.js`.
It verifies that portal/application sitemap URLs use the configured origin and
point to existing output files. A stale application from another origin fails
validation. Start from fresh copies when changing origins; never rewrite source
files or patch a previously compiled application.

`node scripts/preview_portal.mjs 4181` resolves portal tokens in memory and serves
the existing application build. Build and preview must use the same environment.
Do not publish the raw portal templates without the configuration step.

## Deployment

Set the repository Actions variable `PUBLIC_SITE_ORIGIN` to change the public
origin; leaving it empty keeps the central default. The workflow supplies this
variable to the application build and all assembly steps.

This setting controls canonical URLs, OpenGraph, JSON-LD, author/citation URLs,
sitemaps, robots and the counter's allowed origin. Analytics checks the complete
origin, including protocol and port. Its GoatCounter endpoint and manual opt-out
are unchanged. GitHub repository, DOI, ORCID and external application URLs remain
external links, not derived site URLs.

The setting does not configure DNS, TLS, GitHub Pages custom-domain/CNAME settings,
or redirects from an old domain. Configure those separately during migration.
Internat and Stats are separate deployments: their sitemap URLs are listed in the
portal index but their artifacts cannot be checked in this repository.

### Shiny Boundary

Shiny is deployed separately and is unchanged by this refactor. Before changing
the actual domain, update and redeploy the trusted-origin allowlist in
`tdm-engine/www/workbench.js`; otherwise workshop transfers from the new origin
will be rejected. Do not remove this security check or trust a query parameter
as an allowlist. Pages publication alone does not update the R engine.

## Checks

```sh
node --test scripts/test_site_origin.mjs
npm run check
npm test
npx playwright test --config playwright.portal.config.js
npx playwright test tests/e2e/analytics.spec.js
```

Run browser checks against a build made with the same origin. The analytics suite
intercepts all requests, including counter calls: synthetic visits are not sent
to GoatCounter. Repeat with a reserved test domain before a real migration.

Verified locally on 2026-09-15: default and alternate-origin builds/assemblies,
16 analytics tests on each origin, 13 portal browser tests, 3 configuration
tests, Svelte check (zero errors/warnings), content/smoke tests and workflow YAML.
No Pages or Shiny deployment was performed for this refactor.
