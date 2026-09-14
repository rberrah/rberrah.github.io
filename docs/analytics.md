# Audience Measurement

Account: https://rberrah.goatcounter.com/

The only endpoint is configured in `src/lib/analytics.js`. SvelteKit calls it
after navigation; chapters first resolve a known catalogue slug. The portal
uses the same module, copied and injected by `scripts/add_portal_analytics.mjs`
after Pages assembly. No changes to Shiny or the R deployment.

## Data Boundary

- Known public page path (`p`), cache-busting random value (`rnd`) and automated
  browser flag (`b=153`) only. No title, referrer, query, fragment or screen size.
- Fetch uses `credentials: omit` and `referrerPolicy: no-referrer`.
- No click/form/download/model/simulation events, DOM inspection or message
  listeners. No analytics on local hosts, in iframes, or when
  browser storage is unavailable. Unknown chapter slugs are not counted.
- `skipgc=t` is an opt-out preference, not a visitor identifier. The privacy
  page controls it; it applies to both portal and course on this origin.
- DNT/GPC signals do not automatically disable counting. Manual opt-out still
  takes precedence; the public privacy page explains this behaviour in FR/EN.
- French/English toggles and fragment changes do not send duplicate visits.
  Back/forward navigation is counted; GoatCounter's session settings determine
  how repeated visits appear in the dashboard.

The supplied standard `count.js` also sends `location.search` as `q`, even if
`path` is overridden. This implementation therefore uses GoatCounter's
[documented pixel endpoint](https://www.goatcounter.com/help/pixel) directly,
without loading third-party JavaScript or modifying the vendor library.

The service still receives connection metadata (IP/browser headers). Its
[privacy policy](https://www.goatcounter.com/help/privacy) describes processing
and account settings. This integration is not a legal compliance assessment;
the account's data-collection/retention settings have not been inspected.

## Reproduction

Run check before build, not concurrently: both update `.svelte-kit`.

```powershell
npm run check
$env:BASE_PATH='/pharmacometrie'
npm run build
node --input-type=module -e "import {cp} from 'node:fs/promises'; await cp('portal','test-results/analytics-portal',{recursive:true});"
node scripts/add_portal_analytics.mjs test-results/analytics-portal
$env:LABS_E2E_URL='https://rberrah.github.io'
node node_modules/@playwright/test/cli.js test tests/e2e/analytics.spec.js --workers=2
```

The test suite serves local build files on a mocked production origin and
intercepts ALL external requests. Its synthetic inputs never leave the machine.
