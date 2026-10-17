# Privacy and non-retention audit

Updated: 2026-10-15.

This register separates repository guarantees from checks that must be run on
the deployed services. A passing static test is not evidence about hosting logs
or files left by a crashed process.

## Automated contract

Run `npm run audit:privacy`. The command is also part of `npm test` and checks:

- browser persistence is limited to theme, language, opt-in learning progress
  and the analytics opt-out flag;
- no application source uses `sessionStorage`, IndexedDB or cookies;
- learning progress stores statuses only, never entered answers or patient data;
- arbitrary mrgsolve C++ remains disabled by default on the shared server;
- each Shiny session uses a dedicated compilation directory and removes it on
  disconnect;
- uploaded patient files and temporary Pmetrics runs have explicit cleanup;
- protected PDFs, DOCX, PPTX, ZIP files and named patient exports are absent
  from tracked files, except for the explicit public course and communication
  exports allow-listed in the test;
- PMx Playwright traces are disabled; reports and benchmark caches remain ignored by Git.

The R runtime helper now belongs to the standalone `rberrah/MIPD-Engine` checkout. Run `Rscript tests/privacy_nonretention_test.R` from that repository (or rely on PMx `scientific-r`, which checks out the pinned MIPD SHA and runs the same test). It creates two private session workspaces containing synthetic concentration, covariate, patient and model sentinels, verifies isolation, then checks deletion after both a normal session cleanup and an interrupted calculation.

The browser suite additionally enters a unique model value, triggers an import
error, checks storage, URL, requests and browser logs, reloads the page and
opens a second isolated browser context. The value must not survive or cross
sessions. This does not inspect logs or temporary files on the public host.

## Deployment audit

| Surface | Repository evidence | Deployment evidence | Status |
| --- | --- | --- | --- |
| Browser storage | Static allow-list plus error/reload/session-A/session-B Playwright checks | Repeat on the deployed PK, PD, DDI, TDM and import/export workflows | CI verified locally; public audit pending |
| Shiny `/tmp` and uploaded files | Session directory, upload cleanup and interrupted-workspace deletion tests | Compare filesystem before session A, after A, during B and after disconnect | Local runtime verified; host audit pending |
| Session isolation | Distinct Playwright contexts and R session workspaces plus per-session reactive stores | Use two concurrent public Shiny sessions with distinct synthetic records; verify no cross-read | Browser and R helper CI verified; Shiny public audit pending |
| Server logs and errors | Analysis errors log only stage and error class, never raw details | Trigger validation and server errors, then inspect Posit logs for values, code and file contents | Repository verified; host access pending |
| Exports | Downloads are explicit user actions | Confirm generated files are temporary server-side and disappear after the session | Pending live audit |
| Browser test traces | PMx Playwright config sets `trace: 'off'`; output folders are ignored | Confirm workflow artifacts do not override that setting | Repository verified; CI settings audit pending |

Use synthetic records only. Record the date, deployment identifier, tester,
exact workflow, log and filesystem observations, and cleanup delay. A failed or
interrupted session must be tested because normal disconnect cleanup alone does
not cover process crashes.

## Release rule

Do not claim deployment-level non-retention until every row above has dated
evidence. A repository check can block accidental persistence in source control;
it cannot certify the configuration of GitHub Pages, Posit Connect/Shinyapps.io,
reverse proxies or platform logs.
