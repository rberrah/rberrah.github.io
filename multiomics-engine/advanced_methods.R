# Advanced multi-omics adapters for local/server execution.
# These functions intentionally use reference R implementations rather than
# relabelling browser-native PCA/PLS code as MOFA2 or DIABLO.
#
# Methodological policy:
# - deterministic seeds are recorded;
# - supervised multiblock models are tuned inside repeated CV before final fit;
# - unsupervised factor analysis refuses clearly underpowered sample counts;
# - longitudinal models attempt a random slope only when the design can support it;
# - sensitivity methods are compared, never merged by averaging p-values/q-values.

require_namespace <- function(pkg) {
  if (!requireNamespace(pkg, quietly = TRUE)) {
    stop(sprintf("Package '%s' is required for this advanced method.", pkg), call. = FALSE)
  }
}

validate_blocks <- function(blocks, min_samples = 3L) {
  if (!is.list(blocks) || length(blocks) < 2L) {
    stop("blocks must contain at least two omics matrices.", call. = FALSE)
  }
  if (is.null(names(blocks)) || any(names(blocks) == "")) {
    stop("Every block must have a name.", call. = FALSE)
  }
  blocks <- lapply(blocks, function(x) {
    x <- as.matrix(x)
    storage.mode(x) <- "double"
    if (is.null(rownames(x))) stop("Every block must use sample IDs as row names.", call. = FALSE)
    x
  })
  common <- Reduce(intersect, lapply(blocks, rownames))
  if (length(common) < as.integer(min_samples)) {
    stop(sprintf("At least %d samples must be shared across blocks.", as.integer(min_samples)), call. = FALSE)
  }
  lapply(blocks, function(x) x[common, , drop = FALSE])
}

write_matrix_csv <- function(x, path) {
  dir.create(dirname(path), recursive = TRUE, showWarnings = FALSE)
  utils::write.csv(data.frame(sample_id = rownames(x), x, check.names = FALSE), path, row.names = FALSE)
}

filter_informative_features <- function(x, min_observed = 3L, max_features = NULL) {
  x <- as.matrix(x)
  observed <- colSums(is.finite(x))
  variances <- vapply(seq_len(ncol(x)), function(j) {
    values <- x[, j]
    values <- values[is.finite(values)]
    if (length(values) < min_observed) return(NA_real_)
    stats::var(values)
  }, numeric(1))
  keep <- observed >= min_observed & is.finite(variances) & variances > 0
  x <- x[, keep, drop = FALSE]
  variances <- variances[keep]
  if (!is.null(max_features) && is.finite(max_features) && ncol(x) > max_features) {
    order_idx <- order(variances, decreasing = TRUE, na.last = NA)
    x <- x[, order_idx[seq_len(as.integer(max_features))], drop = FALSE]
  }
  x
}

run_mofa2_blocks <- function(
  blocks,
  output_dir,
  factors = 5L,
  seed = 20260924L,
  convergence_mode = "medium",
  min_samples = 16L,
  max_features_per_block = NULL
) {
  require_namespace("MOFA2")
  blocks <- validate_blocks(blocks, min_samples = min_samples)
  raw_feature_counts <- vapply(blocks, ncol, integer(1))
  blocks <- lapply(blocks, filter_informative_features, max_features = max_features_per_block)
  if (any(vapply(blocks, ncol, integer(1)) < 2L)) {
    stop("MOFA2 requires at least two informative non-constant features in every retained block.", call. = FALSE)
  }

  # MOFA2's own guidance stresses adequate normalisation, removal of known
  # technical effects and enough samples. The backend handles known technical
  # series upstream; here we additionally scale views so a high-variance assay
  # does not dominate merely because of measurement scale.
  dir.create(output_dir, recursive = TRUE, showWarnings = FALSE)
  set.seed(seed)
  n_samples <- nrow(blocks[[1]])
  factors <- max(1L, min(as.integer(factors), 10L, max(1L, n_samples - 2L)))

  model <- MOFA2::create_mofa(blocks)
  data_options <- MOFA2::get_default_data_options(model)
  model_options <- MOFA2::get_default_model_options(model)
  train_options <- MOFA2::get_default_training_options(model)
  if ("scale_views" %in% names(data_options)) data_options$scale_views <- TRUE
  model_options$num_factors <- factors
  train_options$seed <- as.integer(seed)
  train_options$convergence_mode <- convergence_mode
  train_options$verbose <- FALSE

  model <- MOFA2::prepare_mofa(
    model,
    data_options = data_options,
    model_options = model_options,
    training_options = train_options
  )
  trained <- MOFA2::run_mofa(
    model,
    outfile = file.path(output_dir, "mofa_model.hdf5"),
    use_basilisk = TRUE
  )

  factors_df <- MOFA2::get_factors(trained, factors = "all", as.data.frame = TRUE)
  weights_df <- MOFA2::get_weights(trained, views = "all", factors = "all", as.data.frame = TRUE)
  utils::write.csv(factors_df, file.path(output_dir, "mofa_factors.csv"), row.names = FALSE)
  utils::write.csv(weights_df, file.path(output_dir, "mofa_weights.csv"), row.names = FALSE)

  variance_explained <- try(MOFA2::calculate_variance_explained(trained), silent = TRUE)
  if (!inherits(variance_explained, "try-error")) {
    saveRDS(variance_explained, file.path(output_dir, "mofa_variance_explained.rds"))
  }

  summary <- list(
    method = "MOFA2",
    seed = as.integer(seed),
    samples = n_samples,
    factors_requested = as.integer(factors),
    blocks_before_filtering = raw_feature_counts,
    blocks_after_filtering = vapply(blocks, ncol, integer(1)),
    view_scaling = isTRUE(data_options$scale_views),
    guardrails = list(
      minimum_shared_samples = as.integer(min_samples),
      removed_constant_or_unobserved_features = TRUE,
      known_technical_effects_expected_to_be_handled_upstream = TRUE,
      interpretation = "Unsupervised latent factors describe covariance; they are not causal mechanisms or validated biomarkers."
    )
  )
  saveRDS(summary, file.path(output_dir, "mofa_summary.rds"))
  invisible(list(model = trained, summary = summary, variance_explained = variance_explained))
}

make_keepx_grid <- function(n_features) {
  n_features <- as.integer(n_features)
  if (n_features <= 1L) return(1L)
  candidates <- unique(pmin(n_features, c(2L, 5L, 10L, 20L, 50L, max(2L, round(n_features * 0.10)))))
  candidates <- sort(unique(as.integer(candidates[candidates >= 1L & candidates <= n_features])))
  if (length(candidates) < 2L) candidates <- sort(unique(c(1L, n_features)))
  candidates
}

normalise_keepx <- function(keepX, blocks, ncomp) {
  if (is.null(keepX)) {
    return(lapply(blocks, function(x) rep(min(20L, max(1L, ncol(x))), ncomp)))
  }
  out <- keepX
  for (view in names(blocks)) {
    values <- as.integer(out[[view]])
    if (!length(values)) values <- min(20L, max(1L, ncol(blocks[[view]])))
    values <- pmax(1L, pmin(values, ncol(blocks[[view]])))
    if (length(values) < ncomp) values <- c(values, rep(tail(values, 1), ncomp - length(values)))
    out[[view]] <- values[seq_len(ncomp)]
  }
  out[names(blocks)]
}

safe_perf_summary <- function(perf) {
  if (is.null(perf) || inherits(perf, "try-error")) return(NULL)
  error_rate <- perf$error.rate
  if (is.null(error_rate)) {
    return(list(
      status = "available",
      note = "Performance object saved; compact BER extraction unavailable for this mixOmics version. Internal cross-validation is not external validation."
    ))
  }
  ber <- NULL
  if (is.list(error_rate) && !is.null(error_rate$BER)) ber <- error_rate$BER
  if (is.null(ber) && is.list(error_rate) && !is.null(error_rate$WeightedVote) && !is.null(error_rate$WeightedVote$BER)) ber <- error_rate$WeightedVote$BER
  numeric_ber <- suppressWarnings(as.numeric(unlist(ber)))
  numeric_ber <- numeric_ber[is.finite(numeric_ber)]
  list(
    status = "available",
    ber_values_extracted = length(numeric_ber),
    ber_median = if (length(numeric_ber)) stats::median(numeric_ber) else NA_real_,
    ber_mean = if (length(numeric_ber)) mean(numeric_ber) else NA_real_,
    ber_min = if (length(numeric_ber)) min(numeric_ber) else NA_real_,
    ber_max = if (length(numeric_ber)) max(numeric_ber) else NA_real_,
    note = "These BER values summarise repeated internal cross-validation on the same cohort used for model tuning. They are descriptive internal-validation diagnostics, not an unbiased external performance estimate."
  )
}

run_diablo_blocks <- function(
  blocks,
  outcome,
  output_dir,
  ncomp = 2L,
  keepX = NULL,
  seed = 20260924L,
  tune = TRUE,
  nrepeat = 5L,
  folds = NULL
) {
  require_namespace("mixOmics")
  blocks <- validate_blocks(blocks, min_samples = 6L)
  blocks <- lapply(blocks, filter_informative_features)
  if (any(vapply(blocks, ncol, integer(1)) < 2L)) {
    stop("DIABLO requires at least two informative features in every block.", call. = FALSE)
  }

  common <- rownames(blocks[[1]])
  if (is.null(names(outcome))) {
    if (length(outcome) != length(common)) stop("Unnamed outcome must have one value per shared sample.", call. = FALSE)
    y <- outcome
  } else {
    y <- outcome[common]
  }
  if (any(is.na(y)) || any(!nzchar(as.character(y)))) {
    stop("Outcome contains missing values for shared samples.", call. = FALSE)
  }
  y <- droplevels(factor(y))
  if (nlevels(y) < 2L) stop("DIABLO requires at least two outcome classes.", call. = FALSE)
  class_counts <- table(y)
  min_class <- min(class_counts)
  if (min_class < 3L) {
    stop("DIABLO tuning requires at least three samples in every class; use an exploratory non-supervised route instead.", call. = FALSE)
  }

  if (is.null(folds)) folds <- min(5L, as.integer(min_class))
  folds <- as.integer(max(3L, min(folds, min_class)))
  # The automatic backend previously requested three repeats. Enforce at least
  # five here so both direct calls and browser-triggered runs receive a more
  # stable repeated-CV diagnostic without relying on the caller.
  nrepeat <- as.integer(max(5L, nrepeat))
  max_components <- max(1L, min(3L, nlevels(y), length(y) - 2L))
  requested_components <- as.integer(max(1L, min(ncomp, max_components)))

  design <- matrix(
    0.1,
    nrow = length(blocks),
    ncol = length(blocks),
    dimnames = list(names(blocks), names(blocks))
  )
  diag(design) <- 0

  set.seed(seed)
  tuning <- NULL
  tuning_error <- NULL
  tuned <- FALSE
  final_ncomp <- requested_components
  final_keepX <- normalise_keepx(keepX, blocks, final_ncomp)
  test_keepX <- NULL

  if (isTRUE(tune) && is.null(keepX)) {
    test_keepX <- lapply(blocks, function(x) make_keepx_grid(ncol(x)))
    if (all(vapply(test_keepX, length, integer(1)) >= 2L)) {
      tuning <- try(
        mixOmics::tune.block.splsda(
          X = blocks,
          Y = y,
          ncomp = max_components,
          test.keepX = test_keepX,
          validation = "Mfold",
          folds = folds,
          dist = "max.dist",
          measure = "BER",
          nrepeat = nrepeat,
          design = design,
          progressBar = FALSE,
          seed = as.integer(seed)
        ),
        silent = TRUE
      )
      if (!inherits(tuning, "try-error")) {
        tuned_ncomp <- suppressWarnings(as.integer(tuning$choice.ncomp$ncomp))
        if (length(tuned_ncomp) && is.finite(tuned_ncomp) && tuned_ncomp >= 1L) {
          final_ncomp <- min(tuned_ncomp, max_components)
        }
        if (!is.null(tuning$choice.keepX)) {
          final_keepX <- normalise_keepx(tuning$choice.keepX, blocks, final_ncomp)
          tuned <- TRUE
        }
      } else {
        tuning_error <- as.character(tuning)
      }
    } else {
      tuning_error <- "Automatic sparsity tuning was not attempted because at least one block had fewer than two admissible keepX candidates."
    }
  }

  fit <- mixOmics::block.splsda(
    X = blocks,
    Y = y,
    ncomp = final_ncomp,
    keepX = final_keepX,
    design = design
  )

  performance_seed <- as.integer(seed) + 1L
  performance <- try(
    mixOmics::perf(
      fit,
      validation = "Mfold",
      folds = folds,
      nrepeat = nrepeat,
      progressBar = FALSE,
      seed = performance_seed
    ),
    silent = TRUE
  )
  performance_error <- if (inherits(performance, "try-error")) as.character(performance) else NULL

  dir.create(output_dir, recursive = TRUE, showWarnings = FALSE)
  saveRDS(fit, file.path(output_dir, "diablo_model.rds"))
  if (!is.null(tuning) && !inherits(tuning, "try-error")) saveRDS(tuning, file.path(output_dir, "diablo_tuning.rds"))
  if (!inherits(performance, "try-error")) saveRDS(performance, file.path(output_dir, "diablo_performance.rds"))

  variates <- do.call(cbind, lapply(names(fit$variates), function(view) {
    x <- fit$variates[[view]]
    colnames(x) <- paste0(view, "_comp", seq_len(ncol(x)))
    x
  }))
  write_matrix_csv(variates, file.path(output_dir, "diablo_variates.csv"))

  selected <- lapply(names(blocks), function(view) {
    lapply(seq_len(final_ncomp), function(comp) mixOmics::selectVar(fit, block = view, comp = comp)$value)
  })
  names(selected) <- names(blocks)
  saveRDS(selected, file.path(output_dir, "diablo_selected_variables.rds"))

  summary <- list(
    method = "mixOmics DIABLO / block.splsda",
    seed = as.integer(seed),
    performance_seed = performance_seed,
    samples = length(y),
    classes = as.list(class_counts),
    blocks = vapply(blocks, ncol, integer(1)),
    tuning = list(
      requested = isTRUE(tune),
      completed = tuned,
      validation = "repeated M-fold CV; folds bounded by the smallest class",
      folds = folds,
      repeats = nrepeat,
      measure = "BER",
      candidate_keepX = test_keepX,
      ncomp = final_ncomp,
      keepX = final_keepX,
      error = tuning_error,
      note = if (tuned) "Final model uses repeated cross-validated sparsity choices." else "Automatic tuning was unavailable; conservative keepX values were used and this model should be treated as exploratory."
    ),
    internal_performance = safe_perf_summary(performance),
    internal_performance_error = performance_error,
    validation_boundary = "Hyperparameter tuning and the reported perf() diagnostic use the same cohort. Repeated CV reduces split sensitivity but does not create an independent validation cohort; external validation remains required for generalisable biomarker or prediction claims.",
    interpretation = "Selected variables are a supervised multivariate signature. Their stability and external validity must be assessed before biomarker claims."
  )
  saveRDS(summary, file.path(output_dir, "diablo_summary.rds"))
  invisible(list(model = fit, summary = summary, tuning = tuning, performance = performance))
}

run_deseq2_counts <- function(
  counts,
  metadata,
  output_dir,
  design_formula = ~ condition,
  contrast = NULL,
  alpha = 0.05
) {
  require_namespace("DESeq2")
  counts <- as.matrix(counts)
  storage.mode(counts) <- "numeric"
  if (is.null(rownames(counts))) stop("counts must use sample IDs as row names.", call. = FALSE)
  metadata <- as.data.frame(metadata)
  if (is.null(rownames(metadata))) stop("metadata must use sample IDs as row names.", call. = FALSE)
  common <- intersect(rownames(counts), rownames(metadata))
  if (length(common) < 3L) stop("At least three matched samples are required.", call. = FALSE)
  counts <- counts[common, , drop = FALSE]
  metadata <- metadata[common, , drop = FALSE]
  if (any(!is.finite(counts)) || any(counts < 0) ||
      any(abs(counts - round(counts)) > 1e-8)) {
    stop("DESeq2 requires non-negative, finite, unnormalised integer counts. Do not silently round normalised or fractional abundances.", call. = FALSE)
  }
  design <- stats::model.matrix(design_formula, data=metadata)
  if (qr(design)$rank < ncol(design)) stop("DESeq2 design is rank-deficient.", call. = FALSE)

  dds <- DESeq2::DESeqDataSetFromMatrix(
    countData = t(counts),
    colData = metadata,
    design = design_formula
  )
  keep <- rowSums(DESeq2::counts(dds) >= 10) >= max(2L, ceiling(ncol(dds) * 0.2))
  if (!any(keep)) stop("Expression filtering removed all genes.", call. = FALSE)
  dds <- dds[keep, ]
  dds <- DESeq2::DESeq(dds, quiet = TRUE)

  res <- if (is.null(contrast)) {
    DESeq2::results(dds, alpha = alpha)
  } else {
    DESeq2::results(dds, contrast = contrast, alpha = alpha)
  }
  result <- data.frame(feature = rownames(res), as.data.frame(res), row.names = NULL, check.names = FALSE)

  dir.create(output_dir, recursive = TRUE, showWarnings = FALSE)
  utils::write.csv(result, file.path(output_dir, "deseq2_results.csv"), row.names = FALSE)
  saveRDS(dds, file.path(output_dir, "deseq2_model.rds"))
  invisible(list(model = dds, results = result))
}

run_edger_ql_counts <- function(
  counts,
  metadata,
  output_dir,
  design_formula = ~ condition,
  coefficient = NULL,
  robust = TRUE
) {
  require_namespace("edgeR")
  counts <- as.matrix(counts)
  storage.mode(counts) <- "numeric"
  metadata <- as.data.frame(metadata)
  if (is.null(rownames(counts)) || is.null(rownames(metadata))) {
    stop("counts and metadata must use sample IDs as row names.", call. = FALSE)
  }
  common <- intersect(rownames(counts), rownames(metadata))
  if (length(common) < 3L) stop("At least three matched samples are required.", call. = FALSE)
  x <- counts[common, , drop = FALSE]
  meta <- metadata[common, , drop = FALSE]
  design <- stats::model.matrix(design_formula, data = meta)
  if (qr(design)$rank < ncol(design)) stop("The edgeR design matrix is rank-deficient.", call. = FALSE)

  if (any(!is.finite(x)) || any(x < 0)) {
    stop("RNA-seq counts must be finite and non-negative.", call. = FALSE)
  }
  # edgeR and voom can process estimated fractional counts directly; never
  # silently round them as that modifies the input and its mean/variance.
  y <- edgeR::DGEList(counts = t(x))
  keep <- edgeR::filterByExpr(y, design = design)
  if (!any(keep)) stop("edgeR::filterByExpr removed all genes.", call. = FALSE)
  y <- y[keep, , keep.lib.sizes = FALSE]
  y <- edgeR::calcNormFactors(y, method = "TMM")
  y <- edgeR::estimateDisp(y, design = design, robust = robust)
  fit <- edgeR::glmQLFit(y, design = design, robust = robust)
  if (is.null(coefficient)) coefficient <- ncol(design)
  test <- edgeR::glmQLFTest(fit, coef = coefficient)
  table <- edgeR::topTags(test, n = Inf, sort.by = "PValue")$table
  result <- data.frame(feature = rownames(table), table, row.names = NULL, check.names = FALSE)

  dir.create(output_dir, recursive = TRUE, showWarnings = FALSE)
  utils::write.csv(result, file.path(output_dir, "edger_ql_results.csv"), row.names = FALSE)
  saveRDS(list(dge = y, fit = fit, test = test, design = design), file.path(output_dir, "edger_ql_model.rds"))
  invisible(list(model = fit, test = test, results = result, design = design, dge = y))
}

run_voom_counts <- function(
  counts,
  metadata,
  output_dir,
  design_formula = ~ condition,
  coefficient = NULL,
  robust = TRUE,
  trend = FALSE
) {
  require_namespace("edgeR")
  require_namespace("limma")
  counts <- as.matrix(counts)
  storage.mode(counts) <- "numeric"
  metadata <- as.data.frame(metadata)
  if (is.null(rownames(counts)) || is.null(rownames(metadata))) {
    stop("counts and metadata must use sample IDs as row names.", call. = FALSE)
  }
  common <- intersect(rownames(counts), rownames(metadata))
  if (length(common) < 3L) stop("At least three matched samples are required.", call. = FALSE)
  x <- counts[common, , drop = FALSE]
  meta <- metadata[common, , drop = FALSE]
  design <- stats::model.matrix(design_formula, data = meta)
  if (qr(design)$rank < ncol(design)) stop("The voom design matrix is rank-deficient.", call. = FALSE)

  if (any(!is.finite(x)) || any(x < 0)) {
    stop("RNA-seq counts must be finite and non-negative.", call. = FALSE)
  }
  # edgeR and voom can process estimated fractional counts directly; never
  # silently round them as that modifies the input and its mean/variance.
  y <- edgeR::DGEList(counts = t(x))
  keep <- edgeR::filterByExpr(y, design = design)
  if (!any(keep)) stop("edgeR::filterByExpr removed all genes.", call. = FALSE)
  y <- y[keep, , keep.lib.sizes = FALSE]
  y <- edgeR::calcNormFactors(y, method = "TMM")
  voom <- limma::voom(y, design = design, plot = FALSE)
  fit <- limma::lmFit(voom, design)
  fit <- limma::eBayes(fit, robust = robust, trend = trend)
  if (is.null(coefficient)) coefficient <- ncol(design)
  result <- limma::topTable(fit, coef = coefficient, number = Inf, sort.by = "P")
  result <- data.frame(feature = rownames(result), result, row.names = NULL, check.names = FALSE)

  dir.create(output_dir, recursive = TRUE, showWarnings = FALSE)
  utils::write.csv(result, file.path(output_dir, "voom_results.csv"), row.names = FALSE)
  utils::write.csv(data.frame(feature = rownames(voom$E), voom$E, check.names = FALSE), file.path(output_dir, "voom_logcpm.csv"), row.names = FALSE)
  saveRDS(list(dge = y, voom = voom, fit = fit, design = design), file.path(output_dir, "voom_model.rds"))
  invisible(list(model = fit, results = result, design = design, voom = voom, dge = y))
}

compare_rnaseq_methods <- function(deseq_results, voom_results, alpha = 0.05) {
  a <- as.data.frame(deseq_results, stringsAsFactors = FALSE)
  b <- as.data.frame(voom_results, stringsAsFactors = FALSE)
  if (!all(c("feature", "stat", "padj") %in% names(a)) ||
      !all(c("feature", "t", "adj.P.Val") %in% names(b))) {
    return(list(status = "unavailable", message = "Required DESeq2/voom result columns were not available."))
  }
  merged <- merge(
    a[, c("feature", "stat", "padj")],
    b[, c("feature", "t", "adj.P.Val")],
    by = "feature",
    all = FALSE
  )
  names(merged) <- c("feature", "deseq2_stat", "deseq2_q", "voom_t", "voom_q")
  valid <- is.finite(merged$deseq2_stat) & is.finite(merged$voom_t)
  rho <- if (sum(valid) >= 3L) suppressWarnings(stats::cor(merged$deseq2_stat[valid], merged$voom_t[valid], method = "spearman")) else NA_real_
  sig_a <- is.finite(merged$deseq2_q) & merged$deseq2_q <= alpha
  sig_b <- is.finite(merged$voom_q) & merged$voom_q <= alpha
  union_sig <- sig_a | sig_b
  sign_agreement <- if (any(union_sig)) mean(sign(merged$deseq2_stat[union_sig]) == sign(merged$voom_t[union_sig]), na.rm = TRUE) else NA_real_
  overlap <- sum(sig_a & sig_b)
  union_n <- sum(union_sig)
  jaccard <- if (union_n > 0L) overlap / union_n else NA_real_
  list(
    status = "ok",
    common_features = nrow(merged),
    spearman_statistics = unname(rho),
    deseq2_significant = sum(sig_a),
    voom_significant = sum(sig_b),
    significant_overlap = overlap,
    significant_jaccard = jaccard,
    sign_agreement_among_any_significant = sign_agreement,
    alpha = alpha,
    interpretation = "Concordance is a sensitivity analysis. q-values from distinct methods are not averaged or combined."
  )
}

run_limma_matrix <- function(
  matrix,
  metadata,
  output_dir,
  design_formula = ~ condition,
  coefficient = NULL,
  trend = TRUE,
  robust = TRUE
) {
  require_namespace("limma")
  matrix <- as.matrix(matrix)
  storage.mode(matrix) <- "double"
  metadata <- as.data.frame(metadata)
  if (is.null(rownames(matrix)) || is.null(rownames(metadata))) {
    stop("matrix and metadata must use sample IDs as row names.", call. = FALSE)
  }
  common <- intersect(rownames(matrix), rownames(metadata))
  if (length(common) < 3L) stop("At least three matched samples are required.", call. = FALSE)
  x <- matrix[common, , drop = FALSE]
  meta <- metadata[common, , drop = FALSE]
  design <- stats::model.matrix(design_formula, data = meta)
  if (qr(design)$rank < ncol(design)) stop("The limma design matrix is rank-deficient.", call. = FALSE)

  fit <- limma::lmFit(t(x), design)
  fit <- limma::eBayes(fit, trend = trend, robust = robust)
  if (is.null(coefficient)) coefficient <- ncol(design)
  result <- limma::topTable(fit, coef = coefficient, number = Inf, sort.by = "P")
  result <- data.frame(feature = rownames(result), result, row.names = NULL, check.names = FALSE)

  dir.create(output_dir, recursive = TRUE, showWarnings = FALSE)
  utils::write.csv(result, file.path(output_dir, "limma_results.csv"), row.names = FALSE)
  saveRDS(fit, file.path(output_dir, "limma_model.rds"))
  invisible(list(model = fit, results = result, design = design))
}

subject_has_repeated_time <- function(meta, subject_column = "subject_id", time_column = "time") {
  if (!all(c(subject_column, time_column) %in% names(meta))) return(FALSE)
  counts <- tapply(meta[[time_column]], meta[[subject_column]], function(x) length(unique(x[is.finite(x)])))
  counts <- counts[is.finite(counts)]
  length(counts) >= 5L && sum(counts >= 3L) >= 5L
}

run_lmer_matrix <- function(
  matrix,
  metadata,
  output_dir,
  fixed_formula = "condition * time + batch",
  subject_column = "subject_id",
  interaction_term = NULL,
  random_slope = "auto"
) {
  require_namespace("lmerTest")
  matrix <- as.matrix(matrix)
  storage.mode(matrix) <- "double"
  metadata <- as.data.frame(metadata)
  if (is.null(rownames(matrix)) || is.null(rownames(metadata))) {
    stop("matrix and metadata must use observation/sample IDs as row names.", call. = FALSE)
  }
  common <- intersect(rownames(matrix), rownames(metadata))
  if (length(common) < 6L) stop("At least six matched observations are required.", call. = FALSE)
  x <- matrix[common, , drop = FALSE]
  meta <- metadata[common, , drop = FALSE]
  if (!subject_column %in% colnames(meta)) stop("subject_column is absent from metadata.", call. = FALSE)

  try_slope <- identical(random_slope, TRUE) || identical(random_slope, "yes") ||
    (identical(random_slope, "auto") && subject_has_repeated_time(meta, subject_column, "time"))
  intercept_formula <- stats::as.formula(paste0("value ~ ", fixed_formula, " + (1|", subject_column, ")"))
  slope_formula <- stats::as.formula(paste0("value ~ ", fixed_formula, " + (1 + time|", subject_column, ")"))
  results <- vector("list", ncol(x))

  for (j in seq_len(ncol(x))) {
    dat <- meta
    dat$value <- x[, j]
    structure_used <- "random intercept"
    fit <- NULL

    if (try_slope && "time" %in% names(dat)) {
      candidate <- try(lmerTest::lmer(slope_formula, data = dat, REML = FALSE), silent = TRUE)
      singular <- FALSE
      if (!inherits(candidate, "try-error") && requireNamespace("lme4", quietly = TRUE)) {
        singular <- isTRUE(lme4::isSingular(candidate, tol = 1e-4))
      }
      if (!inherits(candidate, "try-error") && !singular) {
        fit <- candidate
        structure_used <- "random intercept + random time slope"
      }
    }
    if (is.null(fit)) fit <- try(lmerTest::lmer(intercept_formula, data = dat, REML = FALSE), silent = TRUE)
    if (inherits(fit, "try-error")) next

    coefs <- summary(fit)$coefficients
    term <- interaction_term
    if (is.null(term)) {
      interaction_hits <- grep(":", rownames(coefs), value = TRUE)
      term <- if (length(interaction_hits)) interaction_hits[1] else rownames(coefs)[nrow(coefs)]
    }
    if (!term %in% rownames(coefs)) next
    row <- coefs[term, , drop = FALSE]
    results[[j]] <- data.frame(
      feature = colnames(x)[j],
      term = term,
      estimate = row[1, "Estimate"],
      std_error = row[1, "Std. Error"],
      df = if ("df" %in% colnames(row)) row[1, "df"] else NA_real_,
      statistic = row[1, "t value"],
      p_value = row[1, "Pr(>|t|)"],
      random_effect_structure = structure_used,
      stringsAsFactors = FALSE
    )
  }
  result <- do.call(rbind, results)
  if (is.null(result)) result <- data.frame()
  if (nrow(result)) result$q_bh <- stats::p.adjust(result$p_value, method = "BH")

  dir.create(output_dir, recursive = TRUE, showWarnings = FALSE)
  utils::write.csv(result, file.path(output_dir, "lmer_results.csv"), row.names = FALSE)
  invisible(result)
}

run_fgsea_ranked <- function(
  ranks,
  pathways,
  output_dir,
  min_size = 10L,
  max_size = 500L,
  seed = 20260924L
) {
  require_namespace("fgsea")
  if (is.null(names(ranks))) stop("ranks must be a named numeric vector.", call. = FALSE)
  ranks <- ranks[is.finite(ranks)]
  ranks <- sort(ranks, decreasing = TRUE)
  set.seed(seed)
  result <- fgsea::fgsea(
    pathways = pathways,
    stats = ranks,
    minSize = as.integer(min_size),
    maxSize = as.integer(max_size)
  )
  result <- as.data.frame(result)
  if ("leadingEdge" %in% names(result)) {
    result$leadingEdge <- vapply(result$leadingEdge, paste, collapse = ";", FUN.VALUE = character(1))
  }
  dir.create(output_dir, recursive = TRUE, showWarnings = FALSE)
  utils::write.csv(result, file.path(output_dir, "fgsea_results.csv"), row.names = FALSE)
  invisible(result)
}


# Feature-wise R survival reference (not automated clinical confirmation).
# Unit of analysis is the unique independent subject, never each omics assay.
# This intentionally declines longitudinal/time-dependent and competing-risk
# designs; such models require their own protocol and validation.
run_cox_survival_reference <- function(
  matrix,
  metadata,
  output_dir,
  covariates = character(),
  ties = "efron",
  min_events = 12L
) {
  require_namespace("survival")
  if (!identical(ties,"efron") && !identical(ties,"breslow"))
    stop("Unsupported Cox ties policy.")
  x <- as.matrix(matrix)
  storage.mode(x) <- "double"
  if (is.null(rownames(x)) || !length(rownames(x)) || anyDuplicated(rownames(x)))
    stop("Survival reference requires unique sample identifiers on each matrix row.")
  m <- metadata[match(rownames(x), metadata$sample_id),,drop=FALSE]
  if (anyNA(m$sample_id) || anyNA(m$subject_id) ||
      anyDuplicated(m$subject_id) || any(!nzchar(as.character(m$subject_id))))
    stop("Survival reference requires exactly one observation per independent subject. Repeated visits need a time-dependent or clustered model.")
  if (nrow(x) < 20L)stop("Survival reference requires at least 20 independent subjects.")
  times <- suppressWarnings(as.numeric(m$survival_time))
  events <- suppressWarnings(as.numeric(m$survival_event))
  if (any(!is.finite(times) | times<=0) ||
      any(!is.finite(events) | !events%in%c(0,1)))
    stop("Complete, positive survival times and binary 0/1 event coding required; never silently omit or recode outcomes.")
  covariates <- unique(as.character(covariates))
  if (any(!grepl("^[A-Za-z][A-Za-z0-9_]*$",covariates)) ||
      any(covariates%in%c("assay_feature","survival_time","survival_event","subject_id","sample_id")))
    stop("Invalid survival covariate identifier.")
  if (any(!covariates%in%names(m)))stop("Mapped survival covariate not present in sample metadata.")
  nuisance <- character()
  if ("batch"%in%names(m)) {
    batch_values <- as.character(m$batch)
    batch_values[is.na(batch_values)] <- ""
    if (length(unique(batch_values[nzchar(batch_values)])) > 1L) {
      if(any(!nzchar(batch_values)))stop("Batch covariate has missing values; resolve before Cox reference.")
      m$batch <- factor(batch_values)
      nuisance <- c(nuisance,"batch")
    }
  }
  for (name in covariates) {
    values <- m[[name]]
    if (anyNA(values) || any(!nzchar(as.character(values))))
      stop(paste("Missing values in survival covariate",name))
    numeric <- suppressWarnings(as.numeric(as.character(values)))
    if(all(is.finite(numeric)))m[[name]] <- numeric
    else m[[name]] <- factor(as.character(values))
    if(length(unique(m[[name]]))>1L)nuisance <- c(nuisance,name)
  }
  min_events <- max(12L,as.integer(min_events))
  min_events <- max(min_events,4L*(length(nuisance)+2L))
  if (sum(events) < min_events)stop(
    sprintf("Too few observed survival events for the declared model: %d; require >= %d. This is a conservative software guard, not a power guarantee.",sum(events),min_events)
  )
  m$survival_time <- times
  m$survival_event <- events
  output <- vector("list",ncol(x))
  form <- stats::reformulate(c("assay_feature",nuisance),
    response="survival::Surv(survival_time, survival_event)")
  for (j in seq_len(ncol(x))) {
    feature <- colnames(x)[j]
    if (is.null(feature) || !nzchar(feature))feature <- paste0("F",j)
    observed <- is.finite(x[,j])
    n_observed <- sum(observed)
    n_events <- sum(events[observed])
    result <- data.frame(
      feature=feature,effect=NA_real_,standardError=NA_real_,
      pValue=NA_real_,qValue=NA_real_,hazardRatio=NA_real_,
      ciLow=NA_real_,ciHigh=NA_real_,
      proportionalHazardsP=NA_real_,globalPhP=NA_real_,
      nSubjects=n_observed,nEvents=n_events,
      missingFraction=1-n_observed/nrow(x),
      status="not_estimable",stringsAsFactors=FALSE
    )
    if (n_observed < 20L || n_events < min_events) {
      result$status <- "insufficient_observations_or_events"
      output[[j]] <- result
      next
    }
    data <- m[observed,,drop=FALSE]
    data$assay_feature <- x[observed,j]
    if(stats::sd(data$assay_feature)<1e-10) {
      result$status <- "constant_feature"
      output[[j]] <- result
      next
    }
    design <- try(stats::model.matrix(stats::delete.response(stats::terms(form)),data=data),silent=TRUE)
    if (inherits(design,"try-error") || qr(design)$rank < ncol(design)) {
      result$status <- "aliased_design"
      output[[j]] <- result
      next
    }
    fit <- try(survival::coxph(
      form,data=data,ties=ties,x=TRUE,
      control=survival::coxph.control(iter.max=60,timefix=FALSE)
    ),silent=TRUE)
    if (inherits(fit,"try-error") || any(!is.finite(stats::coef(fit))) ||
        any(abs(stats::coef(fit))>12)) {
      result$status <- "cox_nonconvergence_or_separation"
      output[[j]] <- result
      next
    }
    beta <- as.numeric(stats::coef(fit)["assay_feature"])
    v <- try(stats::vcov(fit)["assay_feature","assay_feature"],silent=TRUE)
    if(inherits(v,"try-error") || !is.finite(v) || v<=0) {
      result$status <- "invalid_cox_variance"
      output[[j]] <- result
      next
    }
    se <- sqrt(v)
    zph <- try(survival::cox.zph(fit,transform="km"),silent=TRUE)
    if(inherits(zph,"try-error") || !"assay_feature"%in%rownames(zph$table)) {
      result$status <- "ph_diagnostic_unavailable"
      output[[j]] <- result
      next
    }
    feature_ph <- as.numeric(zph$table["assay_feature","p"])
    global_ph <- if("GLOBAL"%in%rownames(zph$table))
      as.numeric(zph$table["GLOBAL","p"]) else NA_real_
    if(!is.finite(feature_ph) || !is.finite(global_ph)) {
      result$status <- "ph_diagnostic_unavailable"
      output[[j]] <- result
      next
    }
    result$effect <- beta
    result$standardError <- se
    result$pValue <- 2*stats::pnorm(-abs(beta/se))
    result$hazardRatio <- exp(beta)
    result$ciLow <- beta-1.959963984540054*se
    result$ciHigh <- beta+1.959963984540054*se
    result$proportionalHazardsP <- feature_ph
    result$globalPhP <- global_ph
    result$status <- if(feature_ph<0.05 || global_ph<0.05) "ph_assumption_warning" else "ph_test_not_rejected"
    output[[j]] <- result
  }
  results <- do.call(rbind,output)
  # The full supplied family remains in the BH denominator: unsuccessful
  # fits receive p=1, not a post-hoc reduction in the number of tests.
  family_p <- ifelse(is.finite(results$pValue),results$pValue,1)
  q <- stats::p.adjust(family_p,method="BH")
  results$qValue[is.finite(results$pValue)] <- q[is.finite(results$pValue)]
  results <- results[order(is.na(results$qValue),results$qValue),,drop=FALSE]
  rownames(results) <- NULL
  dir.create(output_dir,recursive=TRUE,showWarnings=FALSE)
  utils::write.csv(results,file.path(output_dir,"cox_results.csv"),row.names=FALSE)
  counts <- as.list(table(results$status))
  list(
    results=results,
    summary=list(
      method=paste0("survival::coxph, ties=",ties),
      attemptedFeatures=ncol(x),estimable=sum(is.finite(results$pValue)),
      nSubjects=nrow(x),events=sum(events),tieMethod=ties,
      nuisanceTerms=nuisance,statusCounts=counts,
      importantLimit="A non-significant cox.zph test never proves PH; informative censoring, competing risks, time-dependent exposure and selective feature missingness remain untested."
    )
  )
}
