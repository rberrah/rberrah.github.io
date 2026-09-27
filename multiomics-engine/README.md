# Multi-omics advanced R engine

This directory contains reference-package adapters for analyses that should use their actual R implementations rather than browser approximations carrying the same names.

The design goal is conservative automation: the backend may automate a method only when its required study structure is identifiable. It does not turn a statistically impossible design into an analysable one, infer statistical power from sample size alone, combine p/q-values from different packages as if they were independent evidence, or describe internal cross-validation as external validation.

## Browser engine versus reference implementations

The public browser tool performs deterministic QC, adjusted feature-wise models, repeated-measures modelling, balanced multi-block exploration, nested cross-validated prediction, differential cross-omics correlation and Reactome interpretation. A separate browser-side feasibility audit records blockers, cautions and advanced-method eligibility before strong interpretation.

`advanced_methods.R` contains reference implementations for:

- raw RNA-seq differential analysis through **DESeq2**, **edgeR quasi-likelihood**, and **edgeR + limma-voom**;
- normalized expression/proteomics-style linear modelling through `limma`;
- repeated-measures mixed models through `lmerTest`, with an automatically attempted random time slope only when repeated observations can support it and deterministic fallback to a random-intercept model when necessary;
- ranked enrichment through `fgsea`;
- MOFA2 through the `MOFA2` package;
- DIABLO through `mixOmics::block.splsda`, with repeated internal cross-validation for sparsity/component tuning when feasible.

## Input contract

`blocks` must be a named list of numeric matrices in samples × features orientation. Sample IDs must be row names. Constant and insufficiently observed variables are removed before advanced integration rather than silently carried into the factor/discriminant model.

Example:

    blocks <- list(
      transcriptomics = rna_matrix,
      proteomics = protein_matrix,
      metabolomics = metabolite_matrix
    )

## MOFA2

    source("multiomics-engine/advanced_methods.R")
    run_mofa2_blocks(
      blocks = blocks,
      output_dir = "results/mofa2",
      factors = 5,
      seed = 20260924
    )

The adapter deliberately requires at least **16 subjects shared across the analysed blocks**. This is an eligibility guardrail, not a claim that 16 subjects guarantee adequate power. It removes non-informative features, records view scaling, saves factor/weight tables and, when available, variance explained.

Known technical effects must be addressed before interpreting MOFA factors. A latent factor is a covariance pattern, **not** evidence that a mechanism is causal or that a biomarker is validated. If technical structure is confounded with biology, the browser feasibility audit blocks strong interpretation instead of relabelling the factor as biological.

## DIABLO

The outcome must be categorical. Prefer a named vector keyed by sample ID.

    outcome <- c(S01="control", S02="control", S03="treated", S04="treated", ...)
    run_diablo_blocks(
      blocks = blocks,
      outcome = outcome,
      output_dir = "results/diablo",
      ncomp = 2,
      seed = 20260924,
      tune = TRUE,
      nrepeat = 3
    )

Methodological safeguards:

- at least three subjects in every class are required for the automated tuning route;
- folds are bounded by the smallest class;
- `tune.block.splsda()` is used with repeated M-fold cross-validation;
- BER is the tuning criterion so a larger class does not dominate the error metric;
- the final `keepX` sparsity settings and component count are recorded;
- `mixOmics::perf()` is run for internal cross-validated performance;
- selected variables are reported as a supervised multivariate signature, not as independently validated biomarkers;
- **external validation remains required** for claims of generalisable prediction or biomarker performance.

The fitted model, tuning object, performance object, sample variates, selected variables and compact summary are saved when available.

## Raw RNA-seq counts

DESeq2 remains available as a full count-model implementation:

    run_deseq2_counts(
      counts = counts_matrix,
      metadata = metadata,
      output_dir = "results/deseq2",
      design_formula = ~ batch + condition,
      contrast = c("condition", "treated", "control")
    )

A quasi-likelihood edgeR route is also available:

    run_edger_ql_counts(
      counts = counts_matrix,
      metadata = metadata,
      output_dir = "results/edger_ql",
      design_formula = ~ batch + condition
    )

The same design can be analysed independently with edgeR filtering/TMM normalization followed by limma-voom:

    run_voom_counts(
      counts = counts_matrix,
      metadata = metadata,
      output_dir = "results/voom",
      design_formula = ~ batch + condition
    )

Rank-deficient design matrices are rejected by the edgeR/voom/limma adapters rather than fitted with silently non-estimable coefficients.

The automatic browser bridge currently uses DESeq2 as the primary raw-count analysis and edgeR/limma-voom as an independent sensitivity analysis when available. `run_edger_ql_counts()` is exposed for reference workflows and future routing. Method agreement is summarised with `compare_rnaseq_methods()` using:

- Spearman correlation between signed test statistics;
- number of BH/FDR-significant genes in each method;
- overlap and Jaccard index of significant genes;
- sign agreement among genes declared significant by either method.

The purpose is sensitivity analysis. **q-values are never averaged, pooled or converted into an artificial consensus q-value.** A disagreement remains visible.

The request protocol may set `rnaCountMethod` to `deseq2`, `voom`, `both` or `auto` for the currently routed methods.

## Already normalized / log-scale matrices

    run_limma_matrix(
      matrix = expression_matrix,
      metadata = metadata,
      output_dir = "results/limma",
      design_formula = ~ batch + condition
    )

The model matrix is checked for full rank before fitting.

## Reference repeated-measures model

    run_lmer_matrix(
      matrix = expression_matrix,
      metadata = metadata,
      output_dir = "results/lmer",
      fixed_formula = "condition * time + batch",
      subject_column = "subject_id",
      random_slope = "auto"
    )

With `random_slope="auto"`, a subject-specific time slope is attempted only when enough subjects have at least three distinct observations. Singular or failed random-slope fits fall back to a random-intercept model. The structure actually used is recorded per result. This is preferable to forcing a complex random-effects structure that the data cannot identify.

## Ranked enrichment

    run_fgsea_ranked(
      ranks = signed_statistics,
      pathways = reactome_pathways,
      output_dir = "results/fgsea",
      seed = 20260924
    )

Pathway enrichment organises molecular evidence; it is not by itself proof that a pathway is activated, causal or clinically relevant. The measured/mappable feature universe and identifier coverage should be retained in the study report.

## Automatic browser bridge

Install the backend dependencies once:

    Rscript multiomics-engine/install_backend_dependencies.R

Start the local backend:

    Rscript multiomics-engine/run_backend.R

The default address is:

    http://127.0.0.1:8787

In **Auto** mode the browser calls `/health`. If the backend is available, it sends the current sample-sheet contract and loaded matrices to `/run` and executes applicable reference methods. If the local backend is absent, browser-native deterministic analysis remains available. In **Require R** mode, analysis fails instead of silently falling back.

Current automatic routing includes:

- raw RNA-seq counts + independent groups -> DESeq2 and edgeR/limma-voom when available, with explicit concordance summary;
- normalized/log-scale independent group comparisons -> limma;
- repeated/longitudinal designs -> lmerTest;
- unsupervised integration -> MOFA2, subject to adapter/browser eligibility guardrails;
- categorical supervised integration -> tuned/validated mixOmics DIABLO when the class structure supports it;
- signed reference statistics with compatible Ensembl/UniProt IDs -> fgsea using current Reactome mappings.

GitHub Pages does not run R itself. The bridge must run locally or on a controlled server. The default listener is localhost only. A remote deployment must add TLS, authentication, request-size limits, rate limits and an origin allow-list before accepting research data.

## Advanced MS sample annotations

For LC-MS/GC-MS workflows the shared sample sheet additionally supports:

- `sample_type`: `biological`, `pooled_qc`/`qc`, or `blank`;
- `injection_order`: numeric sequence position.

The browser and R QC routes can exclude technical injections from biological inference, flag blank-associated features, estimate pooled-QC drift along injection order, apply a pooled-QC RSD threshold, and optionally perform explicitly requested low-tail imputation for left-censored MNAR values.

### Blank handling policy

Blank/sample ratios are QC evidence, not biological truth. The default mode therefore **flags** features whose biological median is below the declared biological/blank ratio without deleting them. An explicit **remove** mode is available for laboratories whose validated SOP requires exclusion. The selected mode and threshold are recorded.

Left-censored imputation is likewise an explicit sensitivity assumption. Confirmatory work should retain a no-imputation sensitivity analysis.

## Reproducibility and reporting

Random seeds are explicit where stochastic algorithms are used. The browser now exposes two additional portable exports:

- `multiomics-methods-report.md`: human-readable methods/interpretation record;
- `multiomics-reproducibility-manifest.json`: machine-readable snapshot of the scientific question, design/endpoint settings, non-file interface parameters, local input-file metadata, visible corrected evidence, warnings and interpretation limits.

The manifest deliberately does **not** embed research data. Original immutable input files and checksums should be archived separately. Reference-package outputs should retain package versions/session information in a study archive when used for a manuscript or regulated workflow.

## What automation cannot certify

The pipeline can detect many deterministic incompatibilities, prevent several common statistical errors and make method choices reproducible. It cannot automatically certify:

- that the biological sampling frame is unbiased;
- that all confounders were measured;
- that the chosen effect size is clinically meaningful;
- adequate statistical power without a prespecified effect/variance model;
- causal identification without an appropriate causal design;
- external validity without an independent target population/cohort.

Those limitations remain explicit rather than being hidden behind a successful software run.
