# Advanced multi-omics adapters for local/server execution.
# These functions intentionally use reference R implementations rather than
# relabelling browser-native PCA/PLS code as MOFA2 or DIABLO.

require_namespace <- function(pkg) {
  if (!requireNamespace(pkg, quietly = TRUE)) {
    stop(sprintf("Package '%s' is required for this advanced method.", pkg), call. = FALSE)
  }
}

validate_blocks <- function(blocks) {
  if (!is.list(blocks) || length(blocks) < 2L) stop("blocks must contain at least two omics matrices.", call. = FALSE)
  if (is.null(names(blocks)) || any(names(blocks) == "")) stop("Every block must have a name.", call. = FALSE)
  blocks <- lapply(blocks, function(x) {
    x <- as.matrix(x)
    storage.mode(x) <- "double"
    x
  })
  common <- Reduce(intersect, lapply(blocks, rownames))
  if (length(common) < 3L) stop("At least three samples must be shared across blocks.", call. = FALSE)
  lapply(blocks, function(x) x[common, , drop = FALSE])
}

write_matrix_csv <- function(x, path) {
  dir.create(dirname(path), recursive = TRUE, showWarnings = FALSE)
  utils::write.csv(data.frame(sample_id = rownames(x), x, check.names = FALSE), path, row.names = FALSE)
}

run_mofa2_blocks <- function(blocks, output_dir, factors = 5L, seed = 20260924L, convergence_mode = "medium") {
  require_namespace("MOFA2")
  blocks <- validate_blocks(blocks)
  dir.create(output_dir, recursive = TRUE, showWarnings = FALSE)
  set.seed(seed)

  model <- MOFA2::create_mofa(blocks)
  data_options <- MOFA2::get_default_data_options(model)
  model_options <- MOFA2::get_default_model_options(model)
  train_options <- MOFA2::get_default_training_options(model)
  model_options$num_factors <- as.integer(factors)
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

  summary <- list(
    method = "MOFA2",
    seed = seed,
    factors_requested = factors,
    samples = nrow(blocks[[1]]),
    blocks = vapply(blocks, ncol, integer(1))
  )
  saveRDS(summary, file.path(output_dir, "mofa_summary.rds"))
  invisible(list(model = trained, summary = summary))
}

run_diablo_blocks <- function(blocks, outcome, output_dir, ncomp = 2L, keepX = NULL, seed = 20260924L) {
  require_namespace("mixOmics")
  blocks <- validate_blocks(blocks)
  common <- rownames(blocks[[1]])
  if (is.null(names(outcome))) {
    if (length(outcome) != length(common)) stop("Unnamed outcome must have one value per shared sample.", call. = FALSE)
    y <- outcome
  } else {
    y <- outcome[common]
  }
  if (any(is.na(y))) stop("Outcome contains missing values for shared samples.", call. = FALSE)
  y <- factor(y)
  if (nlevels(y) < 2L) stop("DIABLO requires at least two outcome classes.", call. = FALSE)

  set.seed(seed)
  ncomp <- as.integer(max(1L, ncomp))
  if (is.null(keepX)) keepX <- lapply(blocks, function(x) rep(min(20L, max(1L, ncol(x))), ncomp))

  design <- matrix(0.1, nrow = length(blocks), ncol = length(blocks), dimnames = list(names(blocks), names(blocks)))
  diag(design) <- 0

  fit <- mixOmics::block.splsda(X = blocks, Y = y, ncomp = ncomp, keepX = keepX, design = design)
  dir.create(output_dir, recursive = TRUE, showWarnings = FALSE)
  saveRDS(fit, file.path(output_dir, "diablo_model.rds"))

  variates <- do.call(cbind, lapply(names(fit$variates), function(view) {
    x <- fit$variates[[view]]
    colnames(x) <- paste0(view, "_comp", seq_len(ncol(x)))
    x
  }))
  write_matrix_csv(variates, file.path(output_dir, "diablo_variates.csv"))

  selected <- lapply(names(blocks), function(view) {
    lapply(seq_len(ncomp), function(comp) mixOmics::selectVar(fit, block = view, comp = comp)$value)
  })
  names(selected) <- names(blocks)
  saveRDS(selected, file.path(output_dir, "diablo_selected_variables.rds"))

  summary <- list(
    method = "mixOmics DIABLO / block.splsda",
    seed = seed,
    ncomp = ncomp,
    samples = length(y),
    classes = table(y),
    blocks = vapply(blocks, ncol, integer(1))
  )
  saveRDS(summary, file.path(output_dir, "diablo_summary.rds"))
  invisible(list(model = fit, summary = summary))
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

  dds <- DESeq2::DESeqDataSetFromMatrix(
    countData = round(t(counts)),
    colData = metadata,
    design = design_formula
  )
  keep <- rowSums(DESeq2::counts(dds) >= 10) >= max(2L, ceiling(ncol(dds) * 0.2))
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

run_lmer_matrix <- function(
  matrix,
  metadata,
  output_dir,
  fixed_formula = "condition * time + batch",
  subject_column = "subject_id",
  interaction_term = NULL
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

  formula_text <- paste0("value ~ ", fixed_formula, " + (1|", subject_column, ")")
  model_formula <- stats::as.formula(formula_text)
  results <- vector("list", ncol(x))

  for (j in seq_len(ncol(x))) {
    dat <- meta
    dat$value <- x[, j]
    fit <- try(lmerTest::lmer(model_formula, data = dat, REML = FALSE), silent = TRUE)
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
