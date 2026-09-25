# Multi-omics advanced R engine

This directory contains reference-package adapters for advanced analyses that should not be relabelled from browser-native approximations.

## Browser engine versus reference implementations

The public browser tool already performs deterministic QC, adjusted feature-wise models, repeated-measures random-intercept GLS, balanced multi-block PCA, a transparent PLS1-style supervised component, nested cross-validated ridge prediction, differential cross-omics correlation and Reactome enrichment.

`advanced_methods.R` is reserved for methods that should use their actual reference R implementations:

- RNA-seq differential analysis through `DESeq2`;
- normalized expression/proteomics-style linear modelling through `limma`;
- repeated-measures mixed models through `lmerTest`;
- ranked enrichment through `fgsea`;
- MOFA2 through the `MOFA2` package;
- DIABLO through `mixOmics::block.splsda`.

## Input contract

`blocks` must be a named list of numeric matrices in samples × features orientation. Sample IDs must be row names. At least three samples must overlap across all blocks.

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

The adapter writes the trained HDF5 model, factor table, weight table and a compact RDS summary.

## DIABLO

The outcome should be a categorical vector. Prefer a named vector keyed by sample ID.

    outcome <- c(S01="control", S02="control", S03="treated", S04="treated")
    run_diablo_blocks(
      blocks = blocks,
      outcome = outcome,
      output_dir = "results/diablo",
      ncomp = 2,
      seed = 20260924
    )

The adapter writes the fitted model, sample variates, selected variables and a compact summary.

## Reproducibility

The random seed is explicit. The browser report records protocol, preprocessing, QC, covariates, engine version and input fingerprints. A future local/server runner can pass the same standardized blocks to these R adapters without changing the deterministic browser decision logic.

## Important scope note

These adapters do not make the public GitHub Pages application execute MOFA2 or DIABLO in-browser. They provide the reference implementations for local/server execution and prevent the browser-native PCA/PLS components from being mislabelled as those packages.

## Platform-aware differential analysis

For raw count matrices (samples × genes), use:

    run_deseq2_counts(
      counts = counts_matrix,
      metadata = metadata,
      output_dir = "results/deseq2",
      design_formula = ~ batch + condition,
      contrast = c("condition", "treated", "control")
    )

For already normalized/log-scale matrices, use:

    run_limma_matrix(
      matrix = expression_matrix,
      metadata = metadata,
      output_dir = "results/limma",
      design_formula = ~ batch + condition
    )

## Reference repeated-measures model

For publication-grade repeated-measures inference with Satterthwaite-style tests from lmerTest:

    run_lmer_matrix(
      matrix = expression_matrix,
      metadata = metadata,
      output_dir = "results/lmer",
      fixed_formula = "condition * time + batch",
      subject_column = "subject_id"
    )

## Ranked enrichment

For a named signed statistic vector and a pathway list:

    run_fgsea_ranked(
      ranks = signed_statistics,
      pathways = reactome_pathways,
      output_dir = "results/fgsea",
      seed = 20260924
    )

These functions are local/server adapters. The browser remains dependency-free and deterministic for its native methods.


## Automatic browser bridge

The public Svelte tool can now probe a reference backend automatically.

Install the backend dependencies once:

    Rscript multiomics-engine/install_backend_dependencies.R

Start the local backend:

    Rscript multiomics-engine/run_backend.R

The default address is:

    http://127.0.0.1:8787

In **Auto** mode the browser calls `/health`. If the backend is available, it sends the current metadata contract and loaded matrices to `/run` and executes the applicable reference methods automatically. If the local backend is absent, the browser-native deterministic analysis remains available. In **Require R** mode, the analysis fails instead of silently falling back.

Current automatic routing includes:

- raw RNA-seq counts + independent groups -> DESeq2;
- normalized/log-scale independent group comparisons -> limma;
- repeated/longitudinal designs -> lmerTest;
- unsupervised integration -> MOFA2;
- categorical supervised integration -> mixOmics DIABLO;
- signed reference statistics with directly compatible Ensembl/UniProt IDs -> fgsea using current Reactome mappings.

GitHub Pages does not run R itself. The bridge must run locally or on a controlled server. The default listener is localhost only. A remote deployment should add TLS, authentication, request-size limits and an origin allow-list before accepting research data.

## Advanced MS metadata

For LC-MS/GC-MS workflows the shared metadata contract additionally supports:

- `sample_type`: `biological`, `pooled_qc`/ `qc`, or `blank`;
- `injection_order`: numeric sequence position.

The browser QC can then exclude technical injections from biological inference, flag blank-associated features by default (with an explicit exclusion mode), estimate pooled-QC drift along injection order, apply a pooled-QC RSD threshold, and optionally perform explicitly requested deterministic low-tail imputation for left-censored MNAR values.


### Blank handling policy

Blank/sample ratios are treated as a QC flag, not as biological truth. The default mode therefore **flags** features whose biological median is below the declared biological/blank ratio without deleting them. An explicit **remove** mode is available for laboratories whose validated SOP requires exclusion. The selected mode and threshold are recorded in the analysis output and reproducible report.

The reference R backend applies the same MS contract before downstream reference methods: blank assessment, pooled-QC drift correction, pooled-QC RSD filtering, optional declared MNAR handling, exclusion of technical injections from biological models, and then platform-appropriate preprocessing.
