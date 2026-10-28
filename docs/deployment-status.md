# Publication status - 2026-10-28

This document contains only the current state. Earlier deployment notes are in
[deployment-history.md](deployment-history.md).

## Current state

| Surface | Current evidence | Limitation / next proof |
| --- | --- | --- |
| Public GitHub Pages | Latest published product code: `af8f3d657ad48345164359ad658d3f03a6a4e946`; all five jobs passed in [PMx qualification #40764081497](https://github.com/rberrah/rberrah.github.io/actions/runs/40764081497), followed by successful [Deploy qualified PMx Pages #40765107725](https://github.com/rberrah/rberrah.github.io/actions/runs/40765107725) for the same SHA. GitHub reported deployment success at `https://rberrah.github.io/`. | A successful Pages deployment is not independent proof of Google indexation or a fresh external HTTP crawl; use the separate public sitemap audit for those checks. |
| Local Pages candidate | PMx checks, Svelte check/build, generated-artifact guards, browser suites and the public sitemap/HTML audit passed on the freeze candidate. | Engine-dependent paths remain owned and qualified by their standalone repositories; PMx verifies only their pinned consumer contracts. |
| Laboratory transfers | Oral absorption and IV infusion preserve route, dosing compartment, dose, interval and infusion duration across TDM/DDI/PD; 16 deterministic JS scenarios, 32 native/regenerated mrgsolve comparisons and all six browser paths passed | This is software equivalence for the bounded teaching models, not clinical validation. |
| TDM regressions | Native tests cover steady state and future doses, covariate carry-forward, fixed residual error, bounds and simple/combined targets. A local Shiny browser regression also verified equivalent relative-day/calendar timelines plus conditional BLQ/LLOQ and timing-uncertainty export. | These checks validate software behavior, not the source models or a clinical decision. |
| PMx CI | The latest post-pedagogical merge `af8f3d65` passed `build`, `scientific-js`, `scientific-r`, `scientific-pmetrics`, and `mipd-consumer` on its exact `main` SHA in [run 40764081497](https://github.com/rberrah/rberrah.github.io/actions/runs/40764081497). Earlier Pmetrics official-full proof remains in [run 40716545565](https://github.com/rberrah/rberrah.github.io/actions/runs/40716545565); do not claim that historical run is a new benchmark of the current SHA. | Every release must satisfy the complete required job set; human scientific and accessibility reviews are independent of CI. |
| Standalone MIPD source | PMx pins the publicly verified release `MIPD-Engine@fec16cb`. Its standalone qualification [39025378610](https://github.com/rberrah/MIPD-Engine/actions/runs/39025378610) and bibliographic DOI qualification [39025378645](https://github.com/rberrah/MIPD-Engine/actions/runs/39025378645) succeeded. The PMx consumer snapshot, source-review contract, French details, source-document inventory and ML availability summary are all hash/content-compared with that exact checkout. | The executable engine remains external. A future MIPD source update is rejected until its exact public Shiny fingerprint is also adopted and verified. |
| Standalone Stats | `rberrah/stats` owns the biostatistics application and its Pages deployment; [run 38901158284](https://github.com/rberrah/stats/actions/runs/38901158284) succeeded on 2026-10-16. | PMx links to `/stats/` and advertises its standalone sitemap; Stats scientific/software qualification no longer runs from this repository. |
| MultiOmics release | PMx pins `MultiOmics@6f480b4b`; the required upstream workflows are declared in `integration/multiomics-release.json`, and PMx rebuilds and browser-tests the pinned overlay at `/multiomics/`. | Qualification remains independent from PMx; every later pin must again pass the immutable upstream workflow gate and mounted-browser tests. |
| Omics2PK site | PMx navigation targets the standalone site at `https://rberrah.github.io/Omics2PK/` and pins deployed revision `e34c3eac`. | CI rejects link or upstream workflow drift; Omics2PK remains independently maintained and published. |
| Public Shiny | MIPD release `fec16cb` is recorded by the standalone release handoff as bundle `12702795`; the deployed `deployment-release.json` carries that exact immutable SHA, 46 models, `ALLOW_CUSTOM_MODELS=false` and `ENABLE_PMETRICS=false`. PMx CI now rechecks that public fingerprint. | Public acceptance proves software deployment behavior, not clinical validation or independent reproduction of all model publications. |
| Pmetrics local/repository | Pmetrics 3.2.6 compile, simulation, MAP backend and official-example checks are configured | Native result depends on a compatible R/Rust toolchain. |
| Pmetrics public Shiny | **Disabled explicitly** | The current Shinyapps.io image cannot build the Pmetrics 3.2.6 dependency chain. The public manifest rejects accidental inclusion; local and dedicated CI support remain available. |
| TDM catalogue | 46/46 deployed models are mirrored exactly from MIPD `fec16cb`; author-led source review classifies 11 `ARTICLE_ALIGNED`, 33 `DOCUMENTED_ADAPTATION_CONFIRMED` and 2 `SOURCE_AMBIGUITY_DOCUMENTED`. PMx derives badges/details from the imported review rather than a hard-coded list. | These labels describe source comparison, not external clinical validation or complete independent source reproduction. |
| TDM numerical references | 8/46 models have deterministic software-regression profiles, including a 30-minute cefepime infusion and oral rifampicin | Independent equations/software remain required before `source_reproduced`. |
| ML artifacts | PMx imports the exact MIPD release ML summary and validates it against the pinned checkout. At `fec16cb`, 12/46 historical artifacts have stale source hashes and are explicitly disabled; 12/46 predictors are technically available in TDM, but only 3/12 pass both repeated-CV and untouched-holdout thresholds. `vanco_goti` remains available for research use but below both internal thresholds (CV relRMSE 22.3%, P20 76.8%; holdout relRMSE 19.6%, P20 73.2%). | These simulation-trained artifacts are not externally or clinically validated; internal threshold passage is not evidence of clinical utility. |
| Public artifact safety | Pre-upload audit rejects unexpected archives, private/patient filenames, unapproved documents and high-confidence secret patterns | Hosting-provider logs and infrastructure still require a live operational audit. |
| npm dependency security | PMx now uses SvelteKit 3 / adapter-static 4 / Vite 8 / TypeScript 6. The committed lockfile reports **0 known npm vulnerabilities**, and qualification rejects advisories at **low** severity or above. Until an official release fixes `GHSA-gcqx-w48m-w2h4`, `deepmerge` is pinned to a local copy of 4.3.1 containing the unreleased upstream patch and covered by an exploit regression test. | Keep the lockfile pinned through `npm ci`; replace the local override with an official fixed release when available, and do not bypass peer resolution with `--force` or `--legacy-peer-deps`. |
| Asset and bundle hygiene | Only `static/downloads/pharmacometrie-pratique.pptx` remains as the canonical teaching deck. The chapter metadata/body split is deployed: the previous ~1.857 MB shared chunk is gone; current Kit 3 qualification keeps the largest shared chunk at ~350.8 kB, with the full-text search corpus isolated to its ~1.057 MB route node and guarded by post-build budgets. | Keep shared chunks ≤600 kB, route nodes ≤1.15 MB and entry bundles ≤250 kB; investigate any budget regression before merge. |
| Non-retention | Static browser policy, trace-off policy, session workspace isolation and interrupted-calculation cleanup are automated | Two live public Shiny sessions, platform logs and `/tmp` still require the checklist in `privacy-nonretention-audit.md`. |
| Scientific review | Generated registries report 18 stale chapter hashes per language after the VPC maintenance correction, 9 pending visualizations and 4 pending cross-domain lessons per language; no status or hash was upgraded automatically. | Author and independent review remain pending and must never be inferred from CI. |
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
