# Publication status - verified 2026-11-03

This is a **dated evidence snapshot**, not a live claim about commits merged
after 3 November 2026. Historical evidence is in
[deployment-history.md](deployment-history.md), with the exact
[3 November maintenance baseline](MAINTENANCE_BASELINE_20261103.md) described
separately from the original October freeze. New application changes require
their exact-SHA CI and Pages publication before updating this baseline.

## Current state

| Surface | Current evidence | Limitation / next proof |
| --- | --- | --- |
| Public GitHub Pages | Latest qualified product-code commit `de47e86d0d59a5888df69ac395aa8a2de2a50b3e` (PR #215); all five jobs passed in [PMx main qualification #41602976426](https://github.com/rberrah/rberrah.github.io/actions/runs/41602976426), followed by successful [Deploy qualified PMx Pages #41604019391](https://github.com/rberrah/rberrah.github.io/actions/runs/41604019391) for the same SHA on 3 November 2026. GitHub reported deployment at `https://rberrah.github.io/`. | Pages success does not independently prove Google indexation, outside-GitHub HTTP crawl, human accessibility or scientific validity. |
| Local Pages candidate | PMx checks, Svelte check/build, generated-artifact guards, browser suites and the public sitemap/HTML audit passed on the freeze candidate. | Engine-dependent paths remain owned and qualified by their standalone repositories; PMx verifies only their pinned consumer contracts. |
| Laboratory transfers | Oral absorption and IV infusion preserve route, dosing compartment, dose, interval and infusion duration across TDM/DDI/PD; 16 deterministic JS scenarios, 32 native/regenerated mrgsolve comparisons and all six browser paths passed | This is software equivalence for the bounded teaching models, not clinical validation. |
| TDM regressions | Native tests cover steady state and future doses, covariate carry-forward, fixed residual error, bounds and simple/combined targets. A local Shiny browser regression also verified equivalent relative-day/calendar timelines plus conditional BLQ/LLOQ and timing-uncertainty export. | These checks validate software behavior, not the source models or a clinical decision. |
| PMx CI | The 3 November visual-repair merge `de47e86` passed `build`, `scientific-js`, `scientific-r`, `scientific-pmetrics` and `mipd-consumer` on the exact `main` SHA in [run #41602976426](https://github.com/rberrah/rberrah.github.io/actions/runs/41602976426). The six-model translator repair is also included from earlier [PR #214](https://github.com/rberrah/rberrah.github.io/pull/214). Historic full Pmetrics benchmarks remain dated evidence, not a new benchmark for this SHA. | Every product release requires the full qualification; content comprehension and independent scientific review are not inferred from CI. |
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
| Scientific review | Generated registries report **19 stale chapter review hashes per language**, **12 pending visualizations** (including the three changed human/PK figures), and **4 pending Omics-to-PK/PD lessons per language**. No human-review status or source hash was silently renewed. | Independent review and learner/accessibility sessions remain pending and must not be inferred from CI. |
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
