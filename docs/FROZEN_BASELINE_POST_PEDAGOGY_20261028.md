# PMx Explain — post-pedagogical maintenance requalification (28 October 2026)

**Decision:** feature freeze maintained; the 28 October pedagogical corrections form the latest qualified **software and publication** baseline. This supplements, rather than rewrites, the historical [initial freeze](FROZEN_BASELINE_20261028.md).

## Exact source and deployment evidence

- **Last qualified product-code `main` SHA:** `af8f3d657ad48345164359ad658d3f03a6a4e946`.
- PR [#199](https://github.com/rberrah/rberrah.github.io/pull/199): explicit guided-activity answer keys and calculations.
- PR [#200](https://github.com/rberrah/rberrah.github.io/pull/200): clearer FR/EN feedback and lessons; PR [#202](https://github.com/rberrah/rberrah.github.io/pull/202): 282 chapter quiz explanations and scientific distractor corrections; PR [#203](https://github.com/rberrah/rberrah.github.io/pull/203): quiz-state reset and correctly worded VPC percentile comparisons.
- **Exact `main` post-merge CI:** [PMx qualification #40764081497](https://github.com/rberrah/rberrah.github.io/actions/runs/40764081497), **all five required jobs passed**: `build`, `scientific-js`, `scientific-r`, `scientific-pmetrics`, and `mipd-consumer`.
- **Exact `main` GitHub Pages publication:** [Deploy qualified PMx Pages #40765107725](https://github.com/rberrah/rberrah.github.io/actions/runs/40765107725), **success** for the same SHA. The deployment job reports `https://rberrah.github.io/` as the environment URL.
- The deploy log proves that the qualified GitHub Pages artifact was uploaded and GitHub reported success. It is **not**, by itself, a fresh independent outside-GitHub HTTP/Google-indexation audit.
- The repository's `Protect PMx main` ruleset is **active** (ID `25306480`), requires PRs and five up-to-date checks, and has no bypass actors in the maintained contract.
- The original Git tag `pmx-freeze-2026-10-28` denotes the **earlier** snapshot; do **not** relabel that tag as this newer code baseline. A separate later tag, if desired, must be created only after its exact ref and CI have been checked.

## Current scope

PMx Explain owns the academic portal, FR/EN pharmacometrics courses and exercises, and immutable consumption of independently maintained tools. The scientific/executable engines are not re-imported into this repository.

| Surface | Current qualified scope | Qualification boundary |
| --- | --- | --- |
| Chapters | 95 FR + 95 EN; 17 learning tracks, including 12-step beginner track | Readability scans, source metadata and software checks do not demonstrate beginner comprehension |
| Chapter quizzes | 282 questions, each with a specific FR and EN explanation | Automatic answer-key checks do not replace independent scientific editing |
| Guided learning | 101 guided activities + 13 synthesis cases, 346 steps; 43 multiple-choice steps and 134 explained options; 26 short numeric tasks | Validated teaching logic, not patient-care decisions |
| Scientific visualizations | 67 components, 58 with a recorded current author review | 9 pending for human review |
| MIPD consumer | Immutable `rberrah/MIPD-Engine@fec16cbdf8e33ed6c791226ccf236761333f8de8` with 46 source models | 8/46 deterministic numerical reference profiles; only 3/12 technically available ML predictors pass both internal thresholds |
| MultiOmics | `rberrah/MultiOmics@6f480b4b60c9b9648f5378b12c5550e018e3f2e7` | Separately maintained; security/dependency remediation and tooltip accessibility belong upstream |
| Omics2PK | `rberrah/Omics2PK@e34c3eacec4e5c173424f934f2025622df0a3572` | Independently qualified and linked, not an embedded engine |
| Stats | Separately deployed by `rberrah/stats` | Not part of the PMx scientific engine |

## Remaining work — not a software-freeze blocker

- **18 FR and 18 EN chapter files** have changed since their stored author-review hashes, including the post-freeze VPC correction. Do not re-seal hashes without human review.
- **9 of 67 visualizations** remain marked `pending`; **4 cross-domain lessons per language** remain pending.
- No chapter is recorded as having an independent internal/external scientific review. All 282 new quiz explanations still require human content review to make such a claim.
- The recorded **8 learner/teacher/expert sessions**, manual keyboard/320px/200%-zoom checks, NVDA, VoiceOver and real-device accessibility checks are **not complete**.
- Independent Google Search Console indexing status was not established by the CI or Pages deployment evidence.
- PMx npm security is gated at `--audit-level=low`. The local patched `deepmerge` override remains necessary until a proven upstream fix is released. Do not use breaking dependency overrides to suppress advisories.
- MultiOmics security work is tracked in upstream [PR #116](https://github.com/rberrah/MultiOmics/pull/116) and its tooltip accessibility in [issue #117](https://github.com/rberrah/MultiOmics/issues/117). Updating the PMx pin requires independent requalification.
- GitHub Actions completed successfully but no exhaustive independent audit of browser/hosting-provider logs was performed.

## Freeze and maintenance policy

**Accepted:** necessary security fixes, externally verified scientific corrections, broken links, accessibility defects, deployment repairs, compatibility fixes, and updates to already-qualified immutable release pins.

**Deferred:** new teaching sections, new engines or models, architectural redesigns, additional pedagogical features, speculative refactors, and unverified changes of scientific-review status.

This is a **qualified research/teaching software freeze**, not clinical validation, medical-device certification, independently established scientific accuracy of every chapter, or complete accessibility validation.

**Historical source of truth:** [initial freeze](FROZEN_BASELINE_20261028.md). **Current review debt:** [generated content inventory](content-inventory.md), [author review queue](author-review-required.md), [visualization review](visualization-review.md), and [manual accessibility record](usability-accessibility-results.md).
