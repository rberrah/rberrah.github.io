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
