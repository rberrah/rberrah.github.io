# Publication status - 2026-10-16

This document contains only the current state. Earlier deployment notes are in
[deployment-history.md](deployment-history.md).

## Current state

| Surface | Current evidence | Limitation / next proof |
| --- | --- | --- |
| Public GitHub Pages | Deployment of `8357efe`, 2026-10-16, [run 38879704231](https://github.com/rberrah/rberrah.github.io/actions/runs/38879704231). The public PMx and TDM URLs returned HTTP 200 after deployment; the PMx page contained the expected PMx Explain metadata and the TDM page the 46-model catalogue marker. | Later commits require their own successful Pages run and public URL check. |
| Local Pages candidate | PMx checks, Svelte check/build and the public-artifact audit passed. The release run passed 20 portal browser tests and 365 PMx browser tests; 27 engine-dependent cases were skipped by configuration. | The skipped Shiny-dependent paths remain covered by their local engine suites and require a compatible live engine for browser execution. |
| Laboratory transfers | Oral absorption and IV infusion preserve route, dosing compartment, dose, interval and infusion duration across TDM/DDI/PD; 16 deterministic JS scenarios, 32 native/regenerated mrgsolve comparisons and all six browser paths passed | This is software equivalence for the bounded teaching models, not clinical validation. |
| TDM regressions | Native tests cover steady state and future doses, covariate carry-forward, fixed residual error, bounds and simple/combined targets. A local Shiny browser regression also verified equivalent relative-day/calendar timelines plus conditional BLQ/LLOQ and timing-uncertainty export. | These checks validate software behavior, not the source models or a clinical decision. |
| PMx CI | For `8357efe`, `build`, `scientific-js`, `scientific-r`, `scientific-pmetrics` and `deploy` all completed successfully in [run 38879704231](https://github.com/rberrah/rberrah.github.io/actions/runs/38879704231). | A later release must satisfy the same complete job set. |
| Stats CI | Separate `test:stats` and `test:e2e:stats` workflow | Qualification remains independent from PMx and MultiOmics. |
| MultiOmics CI | Separate JS, R and Playwright MultiOmics workflows | Qualification remains independent from PMx and Stats. |
| Public Shiny | MIPD Engine was reachable in the browser check of 2026-10-12 | Posit deployment is separate from Pages; repository changes do not update it. |
| Pmetrics local/repository | Pmetrics 3.2.6 compile, simulation, MAP backend and official-example checks are configured | Native result depends on a compatible R/Rust toolchain. |
| Pmetrics public Shiny | **Unavailable** | The current Shinyapps.io image cannot build the Pmetrics 3.2.6 dependency chain. |
| TDM catalogue | 46/46 published models have explicit provenance, maturity and analysis-eligibility metadata | Software checks do not establish source reproduction or clinical validation. |
| TDM numerical references | 8/46 models have deterministic software-regression profiles, including a 30-minute cefepime infusion and oral rifampicin | Independent equations/software remain required before `source_reproduced`. |
| ML artifacts | 46/46 contracts declare target, units, horizon, source-model SHA, route, sampling, patient-level split, seed, feature domains and holdout metrics; RDS and DALEX hashes pass. Complete model averaging is tested and an incomplete artifact set fails closed without an aggregate ML AUC. | These simulation-trained artifacts are not externally or clinically validated. Subgroup errors have not yet been generated, and out-of-domain inputs remain visibly warned according to the product decision. |
| Public artifact safety | Pre-upload audit rejects unexpected archives, private/patient filenames, unapproved documents and high-confidence secret patterns | Hosting-provider logs and infrastructure still require a live operational audit. |
| Non-retention | Static browser policy, trace-off policy, session workspace isolation and interrupted-calculation cleanup are automated | Two live public Shiny sessions, platform logs and `/tmp` still require the checklist in `privacy-nonretention-audit.md`. |
| Scientific review | Author hashes are tracked; changed chapters are reported as stale | Independent review is still pending and must never be inferred from CI. |
| Accessibility | axe-core and keyboard-oriented browser checks cover major PMx routes | NVDA, VoiceOver, zoom 200%, 320 px and physical mobile testing remain manual. |

## Release gate

Before a Pages upload, CI must:

1. run PMx-only unit/content checks;
2. regenerate tracked catalogues, inventories and reports, then require a clean diff;
3. build and assemble the portal plus PMx application;
4. audit `dist/` before upload;
5. run portal and PMx-only browser tests;
6. complete the independent PMx R and Pmetrics jobs.

The final Pages artifact may contain the portal, Stats, MultiOmics and PMx, but
their scientific qualification workflows remain separate.
