# Publication status - 2026-10-17

This document contains only the current state. Earlier deployment notes are in
[deployment-history.md](deployment-history.md).

## Current state

| Surface | Current evidence | Limitation / next proof |
| --- | --- | --- |
| Public GitHub Pages | Current qualified release: `96586411`, [PMx qualification 39035596322](https://github.com/rberrah/rberrah.github.io/actions/runs/39035596322) followed by successful [Deploy qualified PMx Pages 39036005176](https://github.com/rberrah/rberrah.github.io/actions/runs/39036005176). Deployment remains fail-closed. | A later release must again pass the complete PMx qualification before Pages publishes it; do not infer deployment from a merge alone. |
| Local Pages candidate | PMx checks, Svelte check/build and the public-artifact audit passed. Current `main` qualification passed 20 portal browser tests and 366 PMx browser tests; 27 engine-dependent cases were skipped by configuration. | The skipped Shiny-dependent paths remain covered by their local engine suites and require a compatible live engine for browser execution. |
| Laboratory transfers | Oral absorption and IV infusion preserve route, dosing compartment, dose, interval and infusion duration across TDM/DDI/PD; 16 deterministic JS scenarios, 32 native/regenerated mrgsolve comparisons and all six browser paths passed | This is software equivalence for the bounded teaching models, not clinical validation. |
| TDM regressions | Native tests cover steady state and future doses, covariate carry-forward, fixed residual error, bounds and simple/combined targets. A local Shiny browser regression also verified equivalent relative-day/calendar timelines plus conditional BLQ/LLOQ and timing-uncertainty export. | These checks validate software behavior, not the source models or a clinical decision. |
| PMx CI | On current `main` (`96586411`), `build`, `scientific-js`, `scientific-r`, `scientific-pmetrics` and `mipd-consumer` all completed successfully in [run 39035596322](https://github.com/rberrah/rberrah.github.io/actions/runs/39035596322); the full Pmetrics benchmark also passed in [run 39035596452](https://github.com/rberrah/rberrah.github.io/actions/runs/39035596452). | Every later release must satisfy the same complete job set; human review status is independent of CI. |
| Standalone MIPD source | PMx pins the publicly verified release `MIPD-Engine@fec16cb`. Its standalone qualification [39025378610](https://github.com/rberrah/MIPD-Engine/actions/runs/39025378610) and bibliographic DOI qualification [39025378645](https://github.com/rberrah/MIPD-Engine/actions/runs/39025378645) succeeded. The PMx consumer snapshot, source-review contract, French details, source-document inventory and ML availability summary are all hash/content-compared with that exact checkout. | The executable engine remains external. A future MIPD source update is rejected until its exact public Shiny fingerprint is also adopted and verified. |
| Standalone Stats | `rberrah/stats` owns the biostatistics application and its Pages deployment; [run 38901158284](https://github.com/rberrah/stats/actions/runs/38901158284) succeeded on 2026-10-16. | PMx links to `/stats/` and advertises its standalone sitemap; Stats scientific/software qualification no longer runs from this repository. |
| MultiOmics release | PMx pins `MultiOmics@b02cc48e`, the current standalone release after SvelteKit 3 migration. All eight required upstream push workflows succeeded at that exact SHA, including zero-advisory software qualification, fixed-URL packaging, native Omics2PK exchange and independent GEO validation; PMx rebuilds and browser-tests the overlay at `/multiomics/`. | Qualification remains independent from PMx; every later pin must again pass the immutable upstream workflow gate and mounted-browser tests. |
| Omics2PK site | PMx navigation targets the standalone site at `https://rberrah.github.io/Omics2PK/`. The deployed site revision `5a9e404f` passed offline contracts, static UI qualification and Pages publication; later Omics2PK commits affect research audits rather than `site/`. | PMx now records this deployed site SHA in `integration/omics2pk-release.json`; CI rejects link or upstream workflow drift. |
| Public Shiny | MIPD release `fec16cb` is recorded by the standalone release handoff as bundle `12702795`; the deployed `deployment-release.json` carries that exact immutable SHA, 46 models, `ALLOW_CUSTOM_MODELS=false` and `ENABLE_PMETRICS=false`. PMx CI now rechecks that public fingerprint. | Public acceptance proves software deployment behavior, not clinical validation or independent reproduction of all model publications. |
| Pmetrics local/repository | Pmetrics 3.2.6 compile, simulation, MAP backend and official-example checks are configured | Native result depends on a compatible R/Rust toolchain. |
| Pmetrics public Shiny | **Disabled explicitly** | The current Shinyapps.io image cannot build the Pmetrics 3.2.6 dependency chain. The public manifest rejects accidental inclusion; local and dedicated CI support remain available. |
| TDM catalogue | 46/46 deployed models are mirrored exactly from MIPD `fec16cb`; author-led source review classifies 11 `ARTICLE_ALIGNED`, 33 `DOCUMENTED_ADAPTATION_CONFIRMED` and 2 `SOURCE_AMBIGUITY_DOCUMENTED`. PMx derives badges/details from the imported review rather than a hard-coded list. | These labels describe source comparison, not external clinical validation or complete independent source reproduction. |
| TDM numerical references | 8/46 models have deterministic software-regression profiles, including a 30-minute cefepime infusion and oral rifampicin | Independent equations/software remain required before `source_reproduced`. |
| ML artifacts | PMx imports the MIPD release ML summary and checks it byte-for-structure against the pinned checkout. At `fec16cb`, 12/46 artifacts are available in TDM and 34/46 fail closed; model-hash mismatches are not silently relabelled. | These simulation-trained artifacts are not externally or clinically validated; availability is not evidence of clinical utility. |
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
