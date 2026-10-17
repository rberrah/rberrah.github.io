# Publication status - 2026-10-17

This document contains only the current state. Earlier deployment notes are in
[deployment-history.md](deployment-history.md).

## Current state

| Surface | Current evidence | Limitation / next proof |
| --- | --- | --- |
| Public GitHub Pages | Current qualified release: `ded1e738`, [PMx qualification 39024664949](https://github.com/rberrah/rberrah.github.io/actions/runs/39024664949) followed by successful [Deploy qualified PMx Pages 39025129322](https://github.com/rberrah/rberrah.github.io/actions/runs/39025129322). Deployment remains fail-closed. | A later release must again pass the complete PMx qualification before Pages publishes it; do not infer deployment from a merge alone. |
| Local Pages candidate | PMx checks, Svelte check/build and the public-artifact audit passed. The release run passed 20 portal browser tests and 365 PMx browser tests; 27 engine-dependent cases were skipped by configuration. | The skipped Shiny-dependent paths remain covered by their local engine suites and require a compatible live engine for browser execution. |
| Laboratory transfers | Oral absorption and IV infusion preserve route, dosing compartment, dose, interval and infusion duration across TDM/DDI/PD; 16 deterministic JS scenarios, 32 native/regenerated mrgsolve comparisons and all six browser paths passed | This is software equivalence for the bounded teaching models, not clinical validation. |
| TDM regressions | Native tests cover steady state and future doses, covariate carry-forward, fixed residual error, bounds and simple/combined targets. A local Shiny browser regression also verified equivalent relative-day/calendar timelines plus conditional BLQ/LLOQ and timing-uncertainty export. | These checks validate software behavior, not the source models or a clinical decision. |
| PMx CI | On current `main` (`ded1e738`), `build`, `scientific-js`, `scientific-r`, `scientific-pmetrics` and `mipd-consumer` all completed successfully in [run 39024664949](https://github.com/rberrah/rberrah.github.io/actions/runs/39024664949). | Every later release must satisfy the same complete job set; human review status is independent of CI. |
| Standalone MIPD source | PMx deliberately remains pinned to `MIPD-Engine@83a3026`; its standalone qualification passed in [run 38915644078](https://github.com/rberrah/MIPD-Engine/actions/runs/38915644078). PMx scientific jobs execute against that exact checkout and the consumer gate compares all 46 model sources/catalogue entries plus bounded Lego imports. | MIPD `main` has newer qualified source/model-review work, but PMx must not advance its browser snapshot until the corresponding Shiny release is successfully deployed and its immutable public fingerprint is verified. The executable `tdm-engine/` mirror stays removed. |
| Standalone Stats | `rberrah/stats` owns the biostatistics application and its Pages deployment; [run 38901158284](https://github.com/rberrah/stats/actions/runs/38901158284) succeeded on 2026-10-16. | PMx links to `/stats/` and advertises its standalone sitemap; Stats scientific/software qualification no longer runs from this repository. |
| MultiOmics release | PMx pins `MultiOmics@dfc04de`; all six required upstream push workflows succeeded at that exact SHA and PMx rebuilds/mounts it at `/multiomics/`. Current MultiOmics `main` is one validation-only commit ahead and does not require a PMx site repin. | Qualification remains independent from PMx; a later pin must again pass the immutable upstream workflow gate and mounted-browser tests. |
| Omics2PK site | PMx navigation targets the standalone site at `https://rberrah.github.io/Omics2PK/`. The deployed site revision `5a9e404f` passed offline contracts, static UI qualification and Pages publication; later Omics2PK commits affect research audits rather than `site/`. | PMx now records this deployed site SHA in `integration/omics2pk-release.json`; CI rejects link or upstream workflow drift. |
| Public Shiny | Bundle `12698610` was deployed on 2026-10-16. A live browser check returned HTTP 200, exposed `library` and `custom` sources, and displayed `mrgsolve + mapbayr`. | Posit deployment is separate from Pages; repository changes do not update it automatically. Live two-session privacy and interrupted-calculation checks remain pending. |
| Pmetrics local/repository | Pmetrics 3.2.6 compile, simulation, MAP backend and official-example checks are configured | Native result depends on a compatible R/Rust toolchain. |
| Pmetrics public Shiny | **Disabled explicitly** | The current Shinyapps.io image cannot build the Pmetrics 3.2.6 dependency chain. The public manifest rejects accidental inclusion; local and dedicated CI support remain available. |
| TDM catalogue | 46/46 published models have explicit provenance, maturity and analysis-eligibility metadata | Software checks do not establish source reproduction or clinical validation. |
| TDM numerical references | 8/46 models have deterministic software-regression profiles, including a 30-minute cefepime infusion and oral rifampicin | Independent equations/software remain required before `source_reproduced`. |
| ML artifacts | 46/46 contracts declare target, units, horizon, source-model SHA, route, sampling, patient-level split, seed, feature domains and holdout metrics; RDS and DALEX hashes pass. Complete model averaging is tested and an incomplete artifact set fails closed without an aggregate ML AUC. | These simulation-trained artifacts are not externally or clinically validated. Subgroup errors have not yet been generated, and out-of-domain inputs remain visibly warned according to the product decision. |
| Public artifact safety | Pre-upload audit rejects unexpected archives, private/patient filenames, unapproved documents and high-confidence secret patterns | Hosting-provider logs and infrastructure still require a live operational audit. |
| npm dependency security | PMx now uses SvelteKit 3 / adapter-static 4 / Vite 8 / TypeScript 6. The committed lockfile reports **0 known npm vulnerabilities**, and qualification rejects advisories at **low** severity or above. | Keep the lockfile pinned through `npm ci`; do not bypass peer resolution with `--force` or `--legacy-peer-deps`. |
| Asset and bundle hygiene | Only `static/downloads/pharmacometrie-pratique.pptx` remains as the canonical teaching deck. The chapter metadata/body split is deployed: the previous ~1.857 MB shared chunk is gone; current Kit 3 qualification keeps the largest shared chunk at ~350.8 kB, with the full-text search corpus isolated to its ~1.057 MB route node and guarded by post-build budgets. | Keep shared chunks ≤600 kB, route nodes ≤1.15 MB and entry bundles ≤250 kB; investigate any budget regression before merge. |
| Non-retention | Static browser policy, trace-off policy, session workspace isolation and interrupted-calculation cleanup are automated | Two live public Shiny sessions, platform logs and `/tmp` still require the checklist in `privacy-nonretention-audit.md`. |
| Scientific review | Author hashes are tracked; changed chapters are reported as stale | Independent review is still pending and must never be inferred from CI. |
| Accessibility | axe-core and keyboard-oriented browser checks cover major PMx routes | NVDA, VoiceOver, zoom 200%, 320 px and physical mobile testing remain manual. |

## Release gate

Before a Pages upload, the common pull-request/`main` qualification must:

1. run PMx-only unit/content checks;
2. regenerate tracked catalogues, inventories and reports, then require a clean diff;
3. build and assemble the portal plus PMx application;
4. audit `dist/` before upload;
5. run portal and PMx-only browser tests;
6. verify the immutable standalone MIPD source and model-library consumer contract;
7. verify the pinned MultiOmics and Omics2PK upstream release contracts;
8. complete the independent PMx R and Pmetrics jobs.

Only the successful `main` qualification uploads `pmx-pages-dist`; the separate
deployment workflow downloads that exact run's artifact and publishes it. The
final PMx Pages artifact contains the academic portal, PMx and the pinned MultiOmics mount.
Stats is deployed independently from `rberrah/stats`; its scientific qualification and
release lifecycle remain separate.
