# MultiOmics — reviewer/research-software submission kit

**Status: candidate research software, NOT a peer-reviewed release.**
This self-contained **metadata, test and article folder** covers the MultiOmics
component within PMx Explain. It does not alter PMx Explain's root
`CITATION.cff`, license, routes or statistical methods.

## What is implemented

- Static SvelteKit/JavaScript front end: simple bilingual guided import;
  one omics layer or several, deterministic exploratory routines,
  identifiers / biological subjects / study-design checks, figures and exports.
- Separately executed R reference-engine adapters under
  `multiomics-engine/advanced_methods.R` and `server.R`:
  RNA-seq DESeq2 / edgeR / limma-voom; selected proteomics, metabolomics,
  survival, MOFA2 and DIABLO workflows where technically eligible.
- RNA-seq R1: strict input *eligibility* audit; **not** automatic approval
  of the resulting inferential claim. R reference fit must actually run.
- Backend methods and user interface are tested separately. Browser
  calculations must never be described as genuine Bioconductor fits.

## Reproduce the software-level checks

On Node.js 22+ in a clone of the complete repository:

```bash
npm ci
npm run test:multiomics
npm run check
npm run build
node research-software/multiomics/test-evidence.mjs
node research-software/multiomics/build-evidence.mjs --out tmp/multiomics-paper
```

The paper evidence script uses the frozen 27 observed scenario/method
summaries in `evidence/verified-summaries.csv`. Without raw R files,
`raw_workflow_files_integrity_checked` is **false**, never silently
reported true. This test covers the **integrity of the transcribed
summaries and scientific claims**, not independent refitting.

## Recompute against the original 2,100 R fit records

**Retrieve the actual executed workflow artifacts** (only transiently
stored by GitHub Actions), unzip each separately into a directory:

- [PR #52: genuine RNA-seq 400 studies, 1,200 R fits](https://github.com/rberrah/rberrah.github.io/actions/runs/38169339122)
  — artifact `genuine-rnaseq-r1-400-studies-null-mixed-truth`
- [PR #75: 300 null studies, 900 R fits](https://github.com/rberrah/rberrah.github.io/actions/runs/38369835987)
  — artifact `deseq2-rnaseq-fdr-diagnostic-replicates-and-summary`

```bash
node research-software/multiomics/build-evidence.mjs \
  --pr52-dir /path/to/unzipped/pr52 \
  --pr75-dir /path/to/unzipped/pr75 \
  --out tmp/multiomics-paper
```

The code checks the original **file SHA-256**, number of rows, scenarios,
unique dataset seeds, paired-method seed sets, per-study false-discovery
arithmetic, scenario mean FDP, power, and PR75 global-null flag arithmetic;
it produces `evidence-report.json` and `evidence-report.md`.
Source checksums and exact historical commit hashes are immutable in
`evidence/provenance.json`. Do not substitute unverified raw data.

**Important:** GitHub Actions artifacts expire. A journal-ready package
must deposit the *original* full per-dataset CSVs, scripts, package
versions, and a source commit in a persistent archive (e.g. Zenodo) with
a real DOI. No DOI is invented here. The preserved summary CSV alone
is insufficient to reproduce the calculations from their underlying
replicates.

## Full R engine installation and frozen replay

The R engine runs independently from the static website. For
R/Bioconductor smoke tests:

```bash
Rscript multiomics-engine/tests/backend_smoke.R
Rscript multiomics-engine/tests/test_rnaseq_confirmatory_preflight.R
```

These tests require the relevant R environment, not just Node. See
`multiomics-engine/README.md` for package details. The
[separate reproducibility PR #73](https://github.com/rberrah/rberrah.github.io/pull/73)
provides a digest-pinned Bioconductor 3.22 / R 4.5.2 container and
`renv` capture → restore → numeric replay. That exercise establishes
reproduction of one synthetic reference study only, not coverage of all
methods or biological datasets.

## Statistical interpretation / current blockers

Observed DESeq2 complete-null FDR on the specified synthetic scenarios
was about 11–13% in PR52 and 10–22% in the independent PR75.
edgeR QL and limma-voom were nearer the nominal 5% in PR52, under
its particular generator. PR75 showed that disabling independent
filtering did not change the measured false-call flags, while
`useT=TRUE` reduced false calls **without establishing power**
on planted-effect scenarios. These are facts about these datasets,
not a generic proof against DESeq2 or a justification for an automatic
method switch. Current inferential certification: **disabled**.

Before making independent confirmatory claims:
1. Calibrate under prespecified alternative simulation generators,
   including mixed truth, batch interactions and model violations,
   with uncertainty and no algorithm selection on the test data.
2. Compare to real independent reference cohorts and the best
   single-omic benchmark on identical held-out subjects.
3. Verify that feature choice, preprocessing, imputation and
   hyperparameter selection happen inside training folds.
4. Test accessibility with actual novice researchers and
   keyboard/screen-reader users; archive study protocols and feedback.
5. Make a versioned, independently installable release of the R engine,
   its data/API dependencies and any needed external knowledgebases.

The tool can currently be described as **open-source, research-oriented
and partly reproducible**. A publication may describe its architecture
and limitations; neither a universal confirmatory platform nor a
validated clinical tool is presently demonstrated.

## Beginner usability and release gates

- [French plain-language guide for novice researchers](GUIDE_CHERCHEURS_DEBUTANTS_FR.md):
  one-omic start, subject versus sample, RNA-seq contrast and missing
  data, multi-omic subject alignment, interpretation and safe export.
- [Machine-readable journal/release gate register](release-gates.json):
  explicitly tracks evidenced, adverse, unknown and pending requirements.
  Passing GitHub Actions is not sufficient to set publication readiness.

These documents are intended for independent evaluation, not a substitute
for measured accessibility and external clinical/biological validation.

## Reviewer walkthrough (FR/EN)

1. Open the local `/multiomics/` presentation. Enter the guided demo.
2. Execute **one omic** then **two matched omics**. Explain in plain
   language what patient/subject, sample, variable and replicate mean.
3. Deliberately duplicate an identifier and misalign a metadata row;
   confirm the import blocks or warns rather than silently dropping
   data. Keep the error message for the report.
4. Attempt a confirmatory RNA-seq fit with fractional or missing counts,
   no explicitly chosen contrast, or a confounded batch; verify failure.
5. Run an actual supported R method and inspect methods export for
   engine provenance and package versions; do not accept a browser
   approximation as a reference fit.
6. Repeat with keyboard-only navigation and a screen reader; record
   defects and assistance needed. These manual outcomes are **not**
   reported as passed unless independently observed.

## Software-paper metadata

- `paper.md` / `paper.bib`: draft JOSS-style software description
  with no fabricated release DOI or peer-review outcome.
- `CITATION.cff`: **component-level** citation metadata. GitHub's
  "Cite this repository" button still reads the root-level PMx Explain
  metadata, as intended.
- Repository license: MIT for code, CC BY-SA 4.0 for teaching content
  (see root `LICENSE` and `LICENSE-CONTENT.md`).
- Do not submit the software to a journal solely because this kit
  passes CI. Verify journal eligibility, reviewer installation, public
  development history, human authorship, independent contribution,
  accessibility and real scientific evidence first.
