# PMx Explain — qualified maintenance baseline (3 November 2026)

**Decision:** retain the feature freeze of 28 October 2026. The four requested
educational/visual repairs form a later **qualified and published software
maintenance** baseline; they do not imply renewed scientific or user review.

## Immutable code and deployment evidence

- **Latest qualified product-code SHA:** `de47e86d0d59a5888df69ac395aa8a2de2a50b3e`.
- [PR #215](https://github.com/rberrah/rberrah.github.io/pull/215): the four
  visual/pedagogical fixes, dedicated FR/EN/mobile browser regression and
  generated content/review inventories.
- **Qualified PR head:** `1d4cfe6e1c64bf6ee245f907ce559e7bb75426c0`;
  [PR CI #41601849612](https://github.com/rberrah/rberrah.github.io/actions/runs/41601849612)
  passed all five required checks.
- **Exact merged `main` qualification:**
  [run #41602976426](https://github.com/rberrah/rberrah.github.io/actions/runs/41602976426),
  **success**, with `build`, `scientific-js`, `scientific-r`,
  `scientific-pmetrics`, and `mipd-consumer` all passed.
- **Exact `main` Pages publication:**
  [run #41604019391](https://github.com/rberrah/rberrah.github.io/actions/runs/41604019391),
  **success**, for the same code SHA. GitHub reported publishing to
  [rberrah.github.io](https://rberrah.github.io/).
- The earlier [28 October freeze](FROZEN_BASELINE_20261028.md) and
  [post-pedagogy maintenance qualification](FROZEN_BASELINE_POST_PEDAGOGY_20261028.md)
  remain historical evidence. Do not repoint the original freeze tag.

## Maintenance changes

1. `02_BucketSim`: display simulated time to one decimal while preserving
   full-precision animation state and numerical calculations.
2. `03_modele-compartimental` (French and English): express the displayed
   one-compartment law in terms of concentration
   `dC(t)/dt = -(CL/V) C(t)` under constant volume. The original amount
   differential equation is mathematically valid but mismatched the figure.
3. `10_PK2C`: select legible logarithmic Y ticks with sufficient separation
   on the displayed plot, including after dose or volume changes.
4. `01_HumanBody`: replace disjoint rectangles with one continuous,
   illustrative SVG human outline and interactive ADME areas; provide text,
   focus and keyboard/touch alternatives in both languages.

The translator `nlmixr2` lognormal-symbol repair was published separately in
[PR #214](https://github.com/rberrah/rberrah.github.io/pull/214).
Neither maintenance PR changed the independently maintained MIPD Engine,
MultiOmics, Omics2PK or Stats engine repositories.

## Remaining scientific and human review debt

- **95 chapters per language** remain available; **19 French and 19 English
  chapter versions** now have stale author-review hashes, explicitly pending
  after the modified concentration chapter. No independent internal/external
  chapter review is recorded.
- **67 scientific visualization components**, of which **55** have current
  recorded author reviews and **12** are pending. The three edited figures
  were **downgraded to pending**, without overwriting their historical review
  dates/hashes.
- **Four cross-domain Omics → PK/PD lessons per language** remain pending.
- All newly written quiz rationales still need human scientific/editorial
  sampling. The **eight learner/teacher/expert sessions**, screen-reader,
  zoom and real-device accessibility checks remain unexecuted in the registry.
- Full statistical-model equivalence between the structural translator and
  `monolix2rx` / native Monolix remains **not executed**.
- Successful GitHub Pages deployment does **not** independently establish
  complete Google Search Console indexing, real-device accessibility or
  clinical validation.

See the live, generated
[content review inventory](content-inventory.md),
[visualization review inventory](visualization-review.md),
[author review queue](author-review-required.md) and
[usability register](usability-accessibility-results.md).

## Maintenance policy

After this milestone, accept only narrowly scoped **security**, **scientific
correction**, **accessibility**, **broken-link**, **deployment** and independently
qualified integration fixes. Do not add new teaching modules, new simulation
engines or large architectural refactors inside the PMx Explain freeze.
Dependabot updates must pass full qualification and must not be merged merely
to clear the open PR list.

This is a **research and teaching software** baseline, not CE marking, a
validated medical device, independent validation of all course claims or proof
that public users can safely use the simulator for patient treatment.
