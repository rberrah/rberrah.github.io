# Multi-omics advanced R engine

This directory contains reference-package adapters for advanced analyses that should not be relabelled from browser-native approximations.

## Browser engine versus reference implementations

The public browser tool already performs deterministic QC, adjusted feature-wise models, repeated-measures random-intercept GLS, balanced multi-block PCA, a transparent PLS1-style supervised component, nested cross-validated ridge prediction, differential cross-omics correlation and Reactome enrichment.

`advanced_methods.R` is reserved for methods that should use their actual reference R implementations:

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