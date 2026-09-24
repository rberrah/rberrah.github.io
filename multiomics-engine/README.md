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
