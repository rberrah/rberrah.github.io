# PMx Explain multi-omics reference R backend
# Run with: Rscript multiomics-engine/run_backend.R
# Default endpoint: http://127.0.0.1:8787

or_else <- function(x, y) {
  if (is.null(x) || !length(x) || (length(x) == 1L && is.na(x))) y else x
}

source(file.path("multiomics-engine", "advanced_methods.R"), local = TRUE)
source(file.path("multiomics-engine", "external_validation.R"), local = TRUE)

normalise_text <- function(x) trimws(as.character(or_else(x, "")))

canonical_omic <- function(x) {
  key <- tolower(gsub("[^a-z0-9]+", "_", normalise_text(x)))
  if (key %in% c("transcriptomics","transcriptome","transcriptomique","rna","rnaseq","rna_seq","gene_expression","mrna","arn")) return("transcriptomics")
  if (key %in% c("proteomics","proteome","proteomique","protein","proteins","proteine","proteines","lfq")) return("proteomics")
  if (key %in% c("metabolomics","metabolome","metabolomique","metabolite","metabolites","met")) return("metabolomics")
  ""
}

read_csv_text <- function(text) {
  utils::read.csv(
    text = text,
    check.names = FALSE,
    stringsAsFactors = FALSE,
    na.strings = c("", "NA", "NaN", "null")
  )
}

mapping_value <- function(mapping, key) {
  value <- mapping[[key]]
  if (is.null(value) || !nzchar(as.character(value))) return(NULL)
  as.character(value)
}

canonical_metadata <- function(raw, mapping, covariates = character()) {
  out <- data.frame(row.names = seq_len(nrow(raw)))
  fields <- c(
    subject_id="subject_id", sample_id="sample_id", assay_id="assay_id", omic="omic",
    condition="condition", timepoint="timepoint", batch="batch",
    technical_replicate="technical_replicate", outcome="outcome",
    survival_time="survival_time", survival_event="survival_event",
    sample_type="sample_type", injection_order="injection_order"
  )
  for (target in names(fields)) {
    source_col <- mapping_value(mapping, fields[[target]])
    out[[target]] <- if (!is.null(source_col) && source_col %in% names(raw)) raw[[source_col]] else rep("", nrow(raw))
  }
  out$omic <- vapply(out$omic, canonical_omic, character(1))
  for (col in covariates) if (col %in% names(raw)) out[[col]] <- raw[[col]]
  out
}

matrix_samples_by_features <- function(text, expected_assays) {
  df <- read_csv_text(text)
  if (ncol(df) < 2L) stop("Matrix needs an identifier column and at least one value column.")
  first <- names(df)[1]
  column_hits <- sum(names(df)[-1] %in% expected_assays)
  row_hits <- sum(as.character(df[[first]]) %in% expected_assays)

  if (row_hits > column_hits) {
    keep <- as.character(df[[first]]) %in% expected_assays
    x <- as.matrix(df[keep, -1, drop=FALSE])
    storage.mode(x) <- "double"
    rownames(x) <- as.character(df[[first]][keep])
    return(x)
  }

  feature_ids <- as.character(df[[first]])
  x <- as.matrix(df[, -1, drop=FALSE])
  storage.mode(x) <- "double"
  rownames(x) <- feature_ids
  x <- t(x)
  x[rownames(x) %in% expected_assays, , drop=FALSE]
}

aggregate_technical_replicates <- function(x, layer_meta, value_type) {
  layer_meta <- layer_meta[match(rownames(x), layer_meta$assay_id), , drop=FALSE]
  valid <- !is.na(layer_meta$sample_id) & nzchar(layer_meta$sample_id)
  x <- x[valid, , drop=FALSE]
  layer_meta <- layer_meta[valid, , drop=FALSE]
  sample_ids <- unique(layer_meta$sample_id)

  aggregate_one <- function(id) {
    rows <- which(layer_meta$sample_id == id)
    if (length(rows) == 1L) return(as.numeric(x[rows, ]))
    if (value_type %in% c("raw_counts","spectral_count")) {
      colSums(x[rows, , drop=FALSE], na.rm=TRUE)
    } else {
      colMeans(x[rows, , drop=FALSE], na.rm=TRUE)
    }
  }

  agg <- t(vapply(sample_ids, aggregate_one, numeric(ncol(x))))
  colnames(agg) <- colnames(x)
  rownames(agg) <- sample_ids

  meta <- do.call(rbind, lapply(sample_ids, function(id) {
    row <- layer_meta[which(layer_meta$sample_id == id)[1], , drop=FALSE]
    row$assay_id <- id
    row
  }))
  rownames(meta) <- meta$sample_id
  list(matrix=agg, metadata=meta)
}

canonical_sample_type <- function(x) {
  key <- tolower(gsub("[^a-z0-9]+", "_", normalise_text(x)))
  if (key %in% c("blank","solvent_blank","process_blank","extraction_blank","method_blank")) return("blank")
  if (key %in% c("qc","pooled_qc","quality_control","quality_control_pool","pooled","pool_qc")) return("qc")
  "biological"
}

reference_preprocess_matrix <- function(x, layer, value_type) {
  x <- as.matrix(x)
  storage.mode(x) <- "double"
  finite <- x[is.finite(x)]
  has_negative <- length(finite) && any(finite < 0)
  positive <- finite[finite > 0]
  pseudo <- if (length(positive)) max(min(positive) / 2, 1e-12) else 1e-12
  is_counts <- identical(layer, "transcriptomics") && identical(value_type, "raw_counts")
  is_spectral <- identical(layer, "proteomics") && identical(value_type, "spectral_count")
  explicitly_log <- value_type %in% c("log_expression","log_intensity","log_abundance")
  as_supplied <- value_type %in% c("normalized","unknown") || (has_negative && !is_counts && !is_spectral && !explicitly_log)
  log_positive <- value_type %in% c("tpm","lfq_intensity","peak_area","concentration")
  median_center <- (layer == "proteomics" && value_type == "lfq_intensity") ||
    (layer == "metabolomics" && value_type == "peak_area")
  steps <- character()

  out <- x
  if (is_counts || is_spectral) {
    totals <- rowSums(ifelse(is.finite(x) & x > 0, x, 0), na.rm=TRUE)
    totals[!is.finite(totals) | totals <= 0] <- 1
    out <- sweep(x, 1, totals, "/") * 1e6
    out <- log2(out + 0.5)
    steps <- c(steps, if (is_counts) "CPM + log2(CPM + 0.5)" else "library-size normalisation + log2")
  } else if (explicitly_log || as_supplied) {
    steps <- c(steps, if (explicitly_log) "already log-transformed" else "kept as supplied")
  } else if (log_positive) {
    out <- log2(pmax(x, 0) + pseudo)
    out[!is.finite(x)] <- NA_real_
    steps <- c(steps, sprintf("log2(value + %.4g)", pseudo))
  }

  if (median_center) {
    med <- apply(out, 1, stats::median, na.rm=TRUE)
    med[!is.finite(med)] <- NA_real_
    target <- stats::median(med, na.rm=TRUE)
    for (i in seq_len(nrow(out))) {
      if (is.finite(med[i]) && is.finite(target)) out[i,] <- out[i,] - med[i] + target
    }
    steps <- c(steps, "sample-wise median centering")
  }

  list(matrix=out, steps=steps)
}

apply_ms_qc_reference <- function(x, meta, protocol) {
  x <- as.matrix(x)
  storage.mode(x) <- "double"
  meta <- meta[match(rownames(x), meta$assay_id), , drop=FALSE]
  sample_types <- vapply(meta$sample_type, canonical_sample_type, character(1))
  orders <- suppressWarnings(as.numeric(meta$injection_order))
  blank_idx <- which(sample_types == "blank")
  qc_idx <- which(sample_types == "qc")
  bio_idx <- which(sample_types == "biological")
  if (!length(bio_idx)) stop("Metabolomics reference QC found no biological injections.")

  blank_mode_raw <- tolower(as.character(or_else(protocol$msBlankFilter, "flag")))
  blank_mode <- if (blank_mode_raw %in% c("off","no","false")) {
    "off"
  } else if (blank_mode_raw %in% c("remove","yes","true")) {
    "remove"
  } else {
    "flag"
  }
  blank_filter <- blank_mode != "off"
  blank_fold <- suppressWarnings(as.numeric(or_else(protocol$msBlankFold, 5)))
  if (!is.finite(blank_fold) || blank_fold < 1) blank_fold <- 5

  rsd_filter <- !identical(or_else(protocol$msQcRsdFilter, "yes"), "no") &&
    !identical(or_else(protocol$msQcRsdFilter, TRUE), FALSE)
  rsd_threshold <- suppressWarnings(as.numeric(or_else(protocol$msQcRsdThreshold, 0.30)))
  if (!is.finite(rsd_threshold) || rsd_threshold <= 0) rsd_threshold <- 0.30

  drift_requested <- !identical(or_else(protocol$msDriftCorrection, "yes"), "no") &&
    !identical(or_else(protocol$msDriftCorrection, TRUE), FALSE)
  mnar_strategy <- as.character(or_else(protocol$msMnarStrategy, "none"))

  blank_filtered <- character()
  if (blank_filter && length(blank_idx) >= 2L) {
    blank_med <- apply(x[blank_idx,,drop=FALSE], 2, stats::median, na.rm=TRUE)
    bio_med <- apply(x[bio_idx,,drop=FALSE], 2, stats::median, na.rm=TRUE)
    contaminated <- is.finite(blank_med) & blank_med > 0 & is.finite(bio_med) & bio_med < blank_fold * blank_med
    blank_filtered <- colnames(x)[contaminated]
    if (identical(blank_mode, "remove")) x <- x[,!contaminated,drop=FALSE]
  }

  drift_corrected <- 0L
  ordered_qc <- qc_idx[is.finite(orders[qc_idx])]
  # Five QC injections suffice for a *linear* drift check, not a
  # nonlinear LOESS curve. Nonlinear fitting needs >= 8 QC injections
  # spanning the sequence (clinical untargeted MS QC guidelines).
  if (drift_requested && length(ordered_qc) >= 5L && length(unique(orders[ordered_qc])) >= 5L) {
    ordered_all <- which(is.finite(orders))
    for (j in seq_len(ncol(x))) {
      values <- x[,j]
      positive <- values[is.finite(values) & values > 0]
      if (length(positive) < 5L) next
      pseudo <- max(min(positive) / 2, 1e-12)
      use_qc <- ordered_qc[is.finite(values[ordered_qc]) & values[ordered_qc] >= 0]
      if (length(use_qc) < 5L || length(unique(orders[use_qc])) < 5L) next

      qdat <- data.frame(order=orders[use_qc], response=log(values[use_qc] + pseudo))
      pred_all <- pred_qc <- NULL
      # Never extrapolate correction beyond pooled-QC support; require QC
      # injections to bracket every biological injection being adjusted.
      in_support <- orders[ordered_all] >= min(qdat$order) &
        orders[ordered_all] <= max(qdat$order)
      if (nrow(qdat) >= 8L && length(unique(qdat$order)) >= 8L) {
        adaptive_span <- min(1, max(0.6, 5 / nrow(qdat)))
        fit <- try(stats::loess(
          response ~ order, data=qdat, span=adaptive_span, degree=1,
          family="symmetric", control=stats::loess.control(surface="direct")
        ), silent=TRUE)
        if (!inherits(fit,"try-error")) {
          pred_all <- suppressWarnings(try(stats::predict(fit, newdata=data.frame(order=orders[ordered_all])), silent=TRUE))
          pred_qc <- suppressWarnings(try(stats::predict(fit, newdata=data.frame(order=orders[use_qc])), silent=TRUE))
        }
      }
      loess_ok <- !inherits(pred_all,"try-error") && !inherits(pred_qc,"try-error") &&
        sum(is.finite(pred_all)) >= max(3L, ceiling(length(ordered_all) * 0.5)) &&
        sum(is.finite(pred_qc)) >= 3L
      if (!loess_ok) {
        fit_lm <- try(stats::lm(response ~ order, data=qdat), silent=TRUE)
        if (inherits(fit_lm,"try-error")) next
        pred_all <- try(stats::predict(fit_lm, newdata=data.frame(order=orders[ordered_all])), silent=TRUE)
        pred_qc <- try(stats::predict(fit_lm, newdata=data.frame(order=orders[use_qc])), silent=TRUE)
        if (inherits(pred_all,"try-error") || inherits(pred_qc,"try-error")) next
      }
      reference <- stats::median(pred_qc[is.finite(pred_qc)], na.rm=TRUE)
      if (!is.finite(reference)) next
      valid <- in_support & is.finite(pred_all) & is.finite(values[ordered_all]) & values[ordered_all] >= 0
      if (!any(valid)) next
      ids <- ordered_all[valid]
      corrected <- exp(log(values[ids] + pseudo) - pred_all[valid] + reference) - pseudo
      x[ids,j] <- pmax(0, corrected)
      drift_corrected <- drift_corrected + 1L
    }
  }

  rsd_filtered <- character()
  if (rsd_filter && length(qc_idx) >= 3L && ncol(x)) {
    rsd <- vapply(seq_len(ncol(x)), function(j) {
      values <- x[qc_idx,j]
      values <- values[is.finite(values) & values >= 0]
      if (length(values) < 3L) return(NA_real_)
      m <- mean(values)
      if (!is.finite(m) || m <= 0) return(NA_real_)
      stats::sd(values) / m
    }, numeric(1))
    unstable <- is.finite(rsd) & rsd > rsd_threshold
    rsd_filtered <- colnames(x)[unstable]
    x <- x[,!unstable,drop=FALSE]
  }

  imputed <- 0L
  affected_features <- 0L
  if (identical(mnar_strategy, "left_censored") && ncol(x)) {
    for (j in seq_len(ncol(x))) {
      observed <- x[bio_idx,j]
      observed <- observed[is.finite(observed) & observed > 0]
      if (length(observed) < 3L) next
      logs <- log(observed)
      spread <- stats::mad(logs, center=stats::median(logs), constant=1.4826, na.rm=TRUE)
      if (!is.finite(spread) || spread <= 0) spread <- stats::sd(logs, na.rm=TRUE)
      if (!is.finite(spread) || spread <= 0) spread <- 1
      min_positive <- min(observed)
      q10 <- as.numeric(stats::quantile(logs, 0.10, na.rm=TRUE, names=FALSE, type=7))
      low <- max(min_positive * 0.01, min(min_positive * 0.8, exp(min(log(min_positive)-0.2*spread, q10-1.28*spread))))
      missing <- bio_idx[!is.finite(x[bio_idx,j])]
      if (length(missing)) {
        x[missing,j] <- low
        imputed <- imputed + length(missing)
        affected_features <- affected_features + 1L
      }
    }
  }

  warnings <- character()
  if (blank_filter && length(blank_idx) < 2L) warnings <- c(warnings, "Blank assessment requested but fewer than two blank injections were annotated.")
  if (identical(blank_mode, "remove") && length(blank_idx) >= 2L) warnings <- c(warnings, "Blank-associated features were excluded using the declared ratio; retain a flag-only sensitivity analysis for confirmatory work.")
  if (drift_requested && length(ordered_qc) < 5L) warnings <- c(warnings, "Drift correction requested but fewer than five ordered pooled-QC injections were available.")
  if (drift_requested && length(ordered_qc) >= 5L && length(ordered_qc) < 8L) warnings <- c(warnings, "Fewer than eight ordered pooled-QCs: no nonlinear LOESS was fitted; only a linear drift model was allowed. Confirm with a no-drift-correction sensitivity analysis.")
  if (drift_requested && length(ordered_qc) >= 5L && any(is.finite(orders[bio_idx]) & (orders[bio_idx] < min(orders[ordered_qc]) | orders[bio_idx] > max(orders[ordered_qc])))) warnings <- c(warnings, "Some biological injections fall outside the QC bracketing range and were not drift-corrected (no extrapolation).")
  if (rsd_filter && length(qc_idx) < 3L) warnings <- c(warnings, "QC RSD filter requested but fewer than three pooled-QC injections were annotated.")
  if (identical(mnar_strategy, "left_censored")) warnings <- c(warnings, "Left-censored imputation is a declared sensitivity assumption; retain a no-imputation analysis for confirmatory work.")

  list(
    matrix=x[bio_idx,,drop=FALSE],
    metadata=meta[bio_idx,,drop=FALSE],
    summary=list(
      method="R MS QC: blank filter + LOESS only when >=8 ordered QC (linear fallback >=5) within QC order support + pooled-QC RSD",
      biological_injections=length(bio_idx),
      blank_injections=length(blank_idx),
      qc_injections=length(qc_idx),
      blank_mode=blank_mode,
      blank_fold=blank_fold,
      blank_flagged_features=length(blank_filtered),
      blank_removed_features=if (identical(blank_mode, "remove")) length(blank_filtered) else 0L,
      blank_filtered_features=if (identical(blank_mode, "remove")) length(blank_filtered) else 0L,
      drift_requested=drift_requested,
      drift_corrected_features=drift_corrected,
      qc_rsd_threshold=rsd_threshold,
      qc_rsd_filtered_features=length(rsd_filtered),
      mnar_strategy=mnar_strategy,
      mnar_imputed_values=imputed,
      mnar_affected_features=affected_features,
      warnings=warnings
    )
  )
}

varying_terms <- function(meta, covariates, include_batch=TRUE) {
  terms <- character()
  if (include_batch && "batch" %in% names(meta)) {
    values <- unique(meta$batch[!is.na(meta$batch) & nzchar(meta$batch)])
    if (length(values) > 1L) terms <- c(terms, "batch")
  }
  for (col in covariates) {
    if (!col %in% names(meta)) next
    values <- unique(meta[[col]][!is.na(meta[[col]]) & nzchar(as.character(meta[[col]]))])
    if (length(values) > 1L) terms <- c(terms, col)
  }
  unique(terms)
}

safe_formula <- function(terms) {
  if (!length(terms)) return(~ 1)
  stats::reformulate(terms)
}

top_frame <- function(x, n=100L) {
  if (is.null(x)) return(list())
  x <- as.data.frame(x, stringsAsFactors=FALSE)
  if (!nrow(x)) return(list())
  x <- utils::head(x, n)
  lapply(seq_len(nrow(x)), function(i) as.list(x[i, , drop=FALSE]))
}

nonempty_unique <- function(x) unique(as.character(x[!is.na(x) & nzchar(as.character(x))]))

batch_completely_confounded <- function(meta, target_columns=c("condition","timepoint")) {
  if (!"batch" %in% names(meta)) return(NULL)
  batches <- nonempty_unique(meta$batch)
  if (length(batches) <= 1L) return(NULL)

  for (target in target_columns) {
    if (!target %in% names(meta)) next
    target_values <- nonempty_unique(meta[[target]])
    if (length(target_values) <= 1L) next
    complete <- !is.na(meta$batch) & nzchar(as.character(meta$batch)) &
      !is.na(meta[[target]]) & nzchar(as.character(meta[[target]]))
    if (!any(complete)) next
    tab <- table(meta$batch[complete], meta[[target]][complete])
    # If no technical series spans two target states, the two effects cannot be
    # separated. Do not 'correct the batch' and then call the residual biological.
    if (nrow(tab) > 1L && ncol(tab) > 1L && all(rowSums(tab > 0) <= 1L)) return(target)
  }
  NULL
}

residualize_nuisance_matrix <- function(x, meta, terms) {
  x <- as.matrix(x)
  storage.mode(x) <- "double"
  if (!length(terms)) return(list(matrix=x, status="not_needed", terms=character(), adjusted_features=0L))

  design <- stats::model.matrix(safe_formula(terms), data=meta)
  if (qr(design)$rank < ncol(design)) {
    return(list(
      matrix=x,
      status="blocked",
      terms=terms,
      adjusted_features=0L,
      message="Nuisance-adjustment design matrix is rank-deficient."
    ))
  }

  out <- x
  adjusted <- 0L
  for (j in seq_len(ncol(x))) {
    y <- x[,j]
    keep <- is.finite(y) & stats::complete.cases(design)
    if (sum(keep) <= ncol(design) + 1L) next
    fit <- try(stats::lm.fit(design[keep,,drop=FALSE], y[keep]), silent=TRUE)
    if (inherits(fit,"try-error")) next
    residuals <- fit$residuals
    if (length(residuals) != sum(keep) || !any(is.finite(residuals))) next
    out[keep,j] <- residuals + mean(y[keep], na.rm=TRUE)
    adjusted <- adjusted + 1L
  }

  list(
    matrix=out,
    status=if (adjusted > 0L) "adjusted" else "not_estimable",
    terms=terms,
    adjusted_features=adjusted,
    message=if (adjusted > 0L) "Known nuisance effects were regressed out feature-wise before multiblock integration." else "No feature had enough complete observations for nuisance adjustment."
  )
}

prepare_multiblock_integration <- function(blocks, metas, covariates, target_columns=c("condition","timepoint")) {
  out <- blocks
  details <- list()
  for (layer in names(blocks)) {
    x <- blocks[[layer]]
    m <- metas[[layer]]
    common <- intersect(rownames(x), rownames(m))
    x <- x[common,,drop=FALSE]
    m <- m[common,,drop=FALSE]

    confounded_target <- batch_completely_confounded(m, target_columns)
    if (!is.null(confounded_target)) {
      return(list(
        status="blocked",
        blocks=blocks,
        details=details,
        message=sprintf("%s: technical batch is completely confounded with %s; multiblock integration was not run.", layer, confounded_target)
      ))
    }

    terms <- varying_terms(m, covariates, include_batch=TRUE)
    adjusted <- residualize_nuisance_matrix(x, m, terms)
    details[[layer]] <- list(
      status=adjusted$status,
      terms=adjusted$terms,
      adjusted_features=adjusted$adjusted_features,
      message=adjusted$message
    )
    if (identical(adjusted$status, "blocked")) {
      return(list(status="blocked", blocks=blocks, details=details, message=paste(layer, adjusted$message)))
    }
    out[[layer]] <- adjusted$matrix
  }

  list(
    status="ok",
    blocks=out,
    details=details,
    message="Known non-confounded technical series and explicitly selected covariates were adjusted before multiblock integration when estimable."
  )
}

reactome_current_pathways <- function(identifier_type, species="Homo sapiens") {
  file_name <- switch(
    identifier_type,
    ensembl_gene = "Ensembl2Reactome_All_Levels.txt",
    ensembl_protein = "Ensembl2Reactome_All_Levels.txt",
    uniprot = "UniProt2Reactome_All_Levels.txt",
    NULL
  )
  if (is.null(file_name)) return(NULL)
  url <- paste0("https://reactome.org/download/current/", file_name)
  tab <- try(utils::read.delim(url, header=FALSE, quote="", comment.char="", stringsAsFactors=FALSE), silent=TRUE)
  if (inherits(tab, "try-error") || ncol(tab) < 6L) return(NULL)
  tab <- tab[tab[[6]] == species, , drop=FALSE]
  if (!nrow(tab)) return(NULL)
  split(as.character(tab[[1]]), paste0(as.character(tab[[2]]), " | ", as.character(tab[[4]])))
}

method_status <- function(method, status, details=list()) c(list(method=method, status=status), details)

# Passive, local-only runtime inventory recorded with each reference analysis.
# Package versions are evidence, not an environment lock or replay guarantee.
reference_runtime_manifest <- function() {
  wanted <- c("DESeq2","edgeR","limma","lmerTest","survival",
              "fgsea","MOFA2","mixOmics","xcms","MsExperiment",
              "Spectra","mzR","BiocParallel","plumber","jsonlite")
  available <- vapply(wanted,requireNamespace,logical(1),quietly=TRUE)
  versions <- lapply(wanted,function(package) {
    if(!isTRUE(available[[package]]))return(NULL)
    as.character(utils::packageVersion(package))
  })
  names(versions) <- wanted
  versions <- versions[!vapply(versions,is.null,logical(1))]
  bioc <- if(requireNamespace("BiocManager",quietly=TRUE)) {
    tryCatch(as.character(BiocManager::version()),error=function(e) NULL)
  } else NULL
  list(
    RVersion=as.character(getRversion()),
    RPlatform=R.version$platform,
    BioconductorRelease=bioc,
    packageVersions=versions,
    limitation="Captured installed package versions only; not a dependency lock, raw data archive, external database snapshot or reproducible operating-system container."
  )
}


run_backend_analysis <- function(payload) {
  protocol <- or_else(payload$protocol, list())
  data_types <- or_else(payload$dataTypes, list())
  identifier_types <- or_else(payload$identifierTypes, list())
  mapping <- or_else(payload$columnMapping, list())
  covariates <- unlist(or_else(protocol$covariateColumns, character()), use.names=FALSE)

  raw_meta <- read_csv_text(payload$metadataCsv)
  meta <- canonical_metadata(raw_meta, mapping, covariates)
  layers <- intersect(c("transcriptomics","proteomics","metabolomics"), names(payload$matrices))
  if (length(layers) < 1L) stop("Reference backend requires at least one omics matrix.")

  blocks <- list()
  raw_blocks <- list()
  metas <- list()
  preprocessing <- list()
  ms_qc_summaries <- list()
  for (layer in layers) {
    layer_meta <- meta[meta$omic == layer, , drop=FALSE]
    expected <- unique(layer_meta$assay_id)
    x <- matrix_samples_by_features(payload$matrices[[layer]], expected)

    if (layer == "metabolomics") {
      ms <- apply_ms_qc_reference(x, layer_meta, protocol)
      x <- ms$matrix
      layer_meta <- ms$metadata
      ms_qc_summaries[[layer]] <- ms$summary
    } else {
      biological <- vapply(layer_meta$sample_type, canonical_sample_type, character(1)) == "biological"
      if (any(!biological)) {
        keep_assays <- layer_meta$assay_id[biological]
        x <- x[rownames(x) %in% keep_assays,,drop=FALSE]
        layer_meta <- layer_meta[biological,,drop=FALSE]
      }
    }

    value_type <- or_else(data_types[[layer]], "normalized")
    raw_agg <- aggregate_technical_replicates(x, layer_meta, value_type)
    raw_blocks[[layer]] <- raw_agg$matrix

    prepared <- reference_preprocess_matrix(x, layer, value_type)
    processed_agg <- aggregate_technical_replicates(prepared$matrix, layer_meta, "normalized")
    blocks[[layer]] <- processed_agg$matrix
    metas[[layer]] <- processed_agg$metadata
    preprocessing[[layer]] <- prepared$steps
  }

  temp <- tempfile("pmx_multiomics_")
  dir.create(temp, recursive=TRUE)
  on.exit(unlink(temp, recursive=TRUE, force=TRUE), add=TRUE)
  methods <- list()
  ranked <- list()
  if (length(ms_qc_summaries)) {
    methods$metabolomics_ms_qc <- method_status(
      "R reference metabolomics MS QC",
      "ok",
      list(summary=ms_qc_summaries$metabolomics)
    )
  }

  objective <- or_else(protocol$objective, "explore")
  design_type <- or_else(protocol$designType, "independent")
  longitudinal <- isTRUE(protocol$longitudinal)
  outcome_type <- or_else(protocol$outcomeType, "none")
  rna_count_method <- tolower(as.character(or_else(protocol$rnaCountMethod, "both")))
  if (!rna_count_method %in% c("auto","both","deseq2","voom")) rna_count_method <- "both"

  for (layer in layers) {
    x <- blocks[[layer]]
    m <- metas[[layer]]
    layer_dir <- file.path(temp, layer)
    dir.create(layer_dir, recursive=TRUE)

    if (objective == "groups" && design_type == "independent" && !longitudinal &&
        layer == "transcriptomics" && identical(data_types[[layer]], "raw_counts")) {
      terms <- c(varying_terms(m, covariates), "condition")
      groups <- sort(unique(m$condition[nzchar(m$condition)]))
      if (length(groups) >= 2L) m$condition <- factor(m$condition, levels=groups)
      form <- safe_formula(terms)
      contrast <- if (length(groups) == 2L) c("condition", groups[2], groups[1]) else NULL
      run_deseq <- rna_count_method %in% c("auto","both","deseq2")
      run_voom <- rna_count_method %in% c("auto","both","voom")
      fit_deseq <- NULL
      fit_voom <- NULL

      if (run_deseq) {
        if (requireNamespace("DESeq2", quietly=TRUE)) {
          fit_deseq <- try(run_deseq2_counts(raw_blocks[[layer]], m, layer_dir, form, contrast), silent=TRUE)
          if (!inherits(fit_deseq,"try-error")) {
            methods[[paste0(layer,"_differential_deseq2")]] <- method_status("DESeq2","ok",list(top=top_frame(fit_deseq$results)))
          } else {
            methods[[paste0(layer,"_differential_deseq2")]] <- method_status("DESeq2","error",list(message=as.character(fit_deseq)))
          }
        } else {
          methods[[paste0(layer,"_differential_deseq2")]] <- method_status("DESeq2","unavailable",list(message="DESeq2 is not installed."))
        }
      }

      if (run_voom) {
        if (requireNamespace("edgeR", quietly=TRUE) && requireNamespace("limma", quietly=TRUE)) {
          fit_voom <- try(run_voom_counts(raw_blocks[[layer]], m, layer_dir, form), silent=TRUE)
          if (!inherits(fit_voom,"try-error")) {
            methods[[paste0(layer,"_differential_voom")]] <- method_status("edgeR + limma-voom","ok",list(top=top_frame(fit_voom$results)))
          } else {
            methods[[paste0(layer,"_differential_voom")]] <- method_status("edgeR + limma-voom","error",list(message=as.character(fit_voom)))
          }
        } else {
          methods[[paste0(layer,"_differential_voom")]] <- method_status("edgeR + limma-voom","unavailable",list(message="edgeR and limma are required for voom."))
        }
      }

      deseq_ok <- !is.null(fit_deseq) && !inherits(fit_deseq,"try-error")
      voom_ok <- !is.null(fit_voom) && !inherits(fit_voom,"try-error")
      if (deseq_ok && voom_ok) {
        concordance <- compare_rnaseq_methods(fit_deseq$results, fit_voom$results)
        methods[[paste0(layer,"_differential_concordance")]] <- method_status(
          "DESeq2 vs edgeR/limma-voom concordance",
          concordance$status,
          list(summary=concordance)
        )
      }

      if (deseq_ok) {
        methods[[paste0(layer,"_differential")]] <- method_status(
          if (voom_ok) "DESeq2 primary + edgeR/limma-voom sensitivity" else "DESeq2",
          "ok",
          list(top=top_frame(fit_deseq$results))
        )
        if ("stat" %in% names(fit_deseq$results)) {
          stat <- fit_deseq$results$stat
          names(stat) <- fit_deseq$results$feature
          ranked[[layer]] <- stat
        }
      } else if (voom_ok) {
        methods[[paste0(layer,"_differential")]] <- method_status("edgeR + limma-voom","ok",list(top=top_frame(fit_voom$results)))
        if ("t" %in% names(fit_voom$results)) {
          stat <- fit_voom$results$t
          names(stat) <- fit_voom$results$feature
          ranked[[layer]] <- stat
        }
      } else {
        methods[[paste0(layer,"_differential")]] <- method_status(
          "RNA-seq count differential analysis",
          "unavailable",
          list(message="No requested reference RNA-seq count method completed successfully.")
        )
      }
    } else if (objective == "groups" && design_type == "independent" && !longitudinal) {
      if (requireNamespace("limma", quietly=TRUE)) {
        groups <- sort(unique(m$condition[nzchar(m$condition)]))
        if (length(groups) == 2L) {
          m$condition <- factor(m$condition, levels=groups)
          terms <- c(varying_terms(m, covariates), "condition")
          fit <- try(run_limma_matrix(x, m, layer_dir, safe_formula(terms)), silent=TRUE)
          if (!inherits(fit,"try-error")) {
            methods[[paste0(layer,"_differential")]] <- method_status("limma","ok",list(top=top_frame(fit$results)))
            if ("t" %in% names(fit$results)) {
              stat <- fit$results$t
              names(stat) <- fit$results$feature
              ranked[[layer]] <- stat
            }
          } else {
            methods[[paste0(layer,"_differential")]] <- method_status("limma","error",list(message=as.character(fit)))
          }
        }
      } else {
        methods[[paste0(layer,"_differential")]] <- method_status("limma","unavailable",list(message="limma is not installed."))
      }
    }

    if (objective == "outcome" && identical(outcome_type, "survival")) {
      if (requireNamespace("survival",quietly=TRUE)) {
        survival_terms <- varying_terms(m,covariates,include_batch=FALSE)
        fit <- try(run_cox_survival_reference(
          x, m, file.path(layer_dir,"cox"),
          covariates=survival_terms,
          ties="efron"
        ),silent=TRUE)
        methods[[paste0(layer,"_survival")]] <- if (!inherits(fit,"try-error")) {
          method_status("R survival::coxph Efron + cox.zph", "ok", list(
            top=top_frame(fit$results),
            summary=fit$summary,
            note="R reference fitted; cox.zph and censoring assumptions still require independent review. No automatic confirmatory certificate."
          ))
        } else {
          method_status("R survival::coxph Efron + cox.zph", "blocked", list(
            message=as.character(fit),
            note="Survival reference requires one independent sample per subject, valid times/events and adequate events per covariate."
          ))
        }
      } else {
        methods[[paste0(layer,"_survival")]] <- method_status(
          "R survival::coxph Efron + cox.zph","unavailable",
          list(message="R survival package not installed.")
        )
      }
    }

    if ((objective == "time" || longitudinal || design_type == "repeated")) {
      key <- paste0(layer,"_longitudinal")
      if (!requireNamespace("lmerTest", quietly=TRUE)) {
        methods[[key]] <- method_status("R lmerTest explicit group-by-time", "unavailable",
          list(message="lmerTest (and lme4) is not installed."))
      } else {
        # Explicitly refuse ambiguous time labels, condition switching,
        # non-identifiable contrasts, and missing visits before fitting.
        attempt <- try({
          parsed <- parse_longitudinal_time(m$timepoint)
          m$time <- parsed$time
          design <- validate_longitudinal_reference_design(m)
          nuisances <- varying_terms(m,covariates)
          nuisances <- setdiff(nuisances,c("condition","time","timepoint"))
          fixed <- paste(c("condition * time",nuisances),collapse=" + ")
          fit <- run_lmer_matrix(x,m,layer_dir,
            fixed_formula=fixed,subject_column="subject_id",
            interaction_term=design$contrast,random_slope="auto")
          list(fit=fit,timeScale=parsed$timeScale,
               summary=attr(fit,"design_summary"))
        },silent=TRUE)
        if(inherits(attempt,"try-error")) {
          methods[[key]] <- method_status("R lmerTest explicit group-by-time","blocked",
            list(message=as.character(attempt),
              note="No arbitrary coefficient selection or group/time parsing fallback is permitted."))
        } else {
          fit <- attempt$fit
          estimable <- sum(is.finite(fit$p_value))
          methods[[key]] <- method_status(
            "R lmerTest group-by-time slope difference",
            if(estimable>0L)"ok" else "blocked",
            list(top=top_frame(fit),
                 summary=c(attempt$summary,list(timeScale=attempt$timeScale)),
                 note="Feature-level errors, singular fits and random-slope fallbacks are disclosed. BH includes all submitted features; independent scientific design review remains mandatory.")
          )
          if(estimable>0L) {
            valid <- is.finite(fit$statistic)
            stat <- fit$statistic[valid]
            names(stat) <- fit$feature[valid]
            ranked[[layer]] <- stat
          }
        }
      }
    }
  }

  # Multiblock methods receive nuisance-adjusted matrices only when the
  # adjustment is identifiable. Complete batch/biology confounding blocks the
  # method instead of silently removing biology together with batch.
  explore_blocks <- NULL
  explore_adjustment <- NULL
  if (objective == "explore" && length(layers) == 1L) {
    methods$single_omic_exploration <- method_status(
      "Single-omics browser PCA",
      "not_applicable",
      list(message="Single-omics exploratory PCA is computed in the browser. MOFA2 needs at least two omics layers.")
    )
  }
  if (objective == "explore" && length(layers) >= 2L) {
    prepared_integration <- prepare_multiblock_integration(
      blocks,
      metas,
      covariates,
      target_columns=c("condition","timepoint")
    )
    explore_adjustment <- prepared_integration
    if (!identical(prepared_integration$status, "ok")) {
      methods$mofa2 <- method_status(
        "MOFA2",
        "blocked",
        list(message=prepared_integration$message, nuisance_adjustment=prepared_integration$details)
      )
    } else if (requireNamespace("MOFA2", quietly=TRUE)) {
      explore_blocks <- prepared_integration$blocks
      fit <- try(run_mofa2_blocks(explore_blocks, file.path(temp,"mofa2"), factors=5L), silent=TRUE)
      methods$mofa2 <- if (!inherits(fit,"try-error")) {
        method_status("MOFA2","ok",list(summary=fit$summary, nuisance_adjustment=prepared_integration$details))
      } else {
        method_status("MOFA2","error",list(message=as.character(fit), nuisance_adjustment=prepared_integration$details))
      }
    } else {
      methods$mofa2 <- method_status("MOFA2","unavailable",list(message="MOFA2 is not installed.", nuisance_adjustment=prepared_integration$details))
    }
  }

  supervised_target <- NULL
  supervised_target_column <- NULL
  common_samples <- Reduce(intersect, lapply(metas, rownames))
  if (length(common_samples)) {
    if (objective == "groups") {
      supervised_target <- setNames(metas[[1]][common_samples,"condition"], common_samples)
      supervised_target_column <- "condition"
    } else if (objective == "outcome" && outcome_type %in% c("binary","multiclass")) {
      supervised_target <- setNames(metas[[1]][common_samples,"outcome"], common_samples)
      supervised_target_column <- "outcome"
    }
  }
  if (length(layers) >= 2L && !is.null(supervised_target) && length(unique(supervised_target[nzchar(supervised_target)])) >= 2L) {
    target_columns <- unique(c(supervised_target_column, if (supervised_target_column != "condition") "condition" else character()))
    prepared_supervised <- prepare_multiblock_integration(blocks, metas, covariates, target_columns=target_columns)
    if (!identical(prepared_supervised$status, "ok")) {
      methods$diablo <- method_status(
        "mixOmics DIABLO",
        "blocked",
        list(message=prepared_supervised$message, nuisance_adjustment=prepared_supervised$details)
      )
    } else if (requireNamespace("mixOmics", quietly=TRUE)) {
      fit <- try(run_diablo_blocks(
        prepared_supervised$blocks,
        supervised_target,
        file.path(temp,"diablo"),
        ncomp=2L,
        tune=TRUE,
        nrepeat=3L
      ), silent=TRUE)
      methods$diablo <- if (!inherits(fit,"try-error")) {
        method_status("mixOmics DIABLO","ok",list(summary=fit$summary, nuisance_adjustment=prepared_supervised$details))
      } else {
        method_status("mixOmics DIABLO","error",list(message=as.character(fit), nuisance_adjustment=prepared_supervised$details))
      }
    } else {
      methods$diablo <- method_status("mixOmics DIABLO","unavailable",list(message="mixOmics is not installed.", nuisance_adjustment=prepared_supervised$details))
    }
  }

  if (requireNamespace("fgsea", quietly=TRUE) && length(ranked)) {
    for (layer in names(ranked)) {
      id_type <- or_else(identifier_types[[layer]], "unknown")
      species <- if (or_else(protocol$organism, "human") == "mouse") "Mus musculus" else "Homo sapiens"
      pathways <- reactome_current_pathways(id_type, species)
      if (is.null(pathways)) next
      fit <- try(run_fgsea_ranked(ranked[[layer]], pathways, file.path(temp,paste0("fgsea_",layer))), silent=TRUE)
      methods[[paste0(layer,"_fgsea")]] <- if (!inherits(fit,"try-error")) method_status("fgsea + Reactome current mapping","ok",list(top=top_frame(fit))) else method_status("fgsea","error",list(message=as.character(fit)))
    }
  }

  packages <- vapply(c("DESeq2","edgeR","limma","lmerTest","survival","fgsea","MOFA2","mixOmics"), requireNamespace, logical(1), quietly=TRUE)
  list(
    status="ok",
    engine=list(
      name="PMx Explain reference R backend",
      version="1.3.0",
      policy="Reference methods are eligibility-gated; identifiable nuisance effects are adjusted before multiblock integration and complete technical confounding blocks MOFA2/DIABLO."
    ),
    analysisMode=if (length(layers) == 1L) "single_omic" else "multiomics",
    analysedLayers=layers,
    applicableMethods=names(methods),
    methods=methods,
    preprocessing=preprocessing,
    packages=as.list(packages),
    runtime=reference_runtime_manifest()
  )
}

#* @filter cors
function(req, res) {
  # Origin acceptance is enforced by run_backend.R. Do not emit a wildcard
  # here: a wildcard would make a localhost research-data service callable
  # from unrelated web pages.
  res$setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS")
  res$setHeader("Access-Control-Allow-Headers", "Content-Type")
  if (identical(req$REQUEST_METHOD, "OPTIONS")) return(list(status="ok"))
  plumber::forward()
}

#* @get /health
#* @serializer json list(auto_unbox=TRUE)
function() {
  packages <- vapply(
    c("DESeq2","edgeR","limma","lmerTest","survival","fgsea","MOFA2","mixOmics","xcms","MsExperiment","Spectra","mzR","BiocParallel"),
    requireNamespace,
    logical(1),
    quietly=TRUE
  )
  raw_required <- c("xcms","MsExperiment","Spectra","mzR")
  list(
    status="ok",
    engine="PMx Explain reference R backend",
    version="1.3.0",
    packages=as.list(packages),
    runtime=reference_runtime_manifest(),
    capabilities=list(
      reference_analysis=TRUE,
      frozen_external_validation=TRUE,
      raw_ms_cli=all(packages[raw_required])
    )
  )
}

#* @post /external-validation
#* @serializer json list(auto_unbox=TRUE, dataframe="rows", na="null")
function(req, res) {
  if (!requireNamespace("jsonlite", quietly=TRUE)) {
    res$status <- 500
    return(list(status="error", message="jsonlite is required by the reference backend."))
  }
  payload <- try(jsonlite::fromJSON(req$postBody, simplifyVector=TRUE), silent=TRUE)
  if (inherits(payload, "try-error") || !is.list(payload)) {
    res$status <- 400
    return(list(status="error", message="Invalid JSON payload."))
  }
  predictions_csv <- payload$predictionsCsv
  config <- payload$config
  if (is.null(predictions_csv) || !is.character(predictions_csv) || length(predictions_csv) != 1L || !nzchar(predictions_csv)) {
    res$status <- 400
    return(list(status="error", message="predictionsCsv must contain the frozen prediction CSV as text."))
  }
  if (is.null(config) || !is.list(config)) {
    res$status <- 400
    return(list(status="error", message="config must be a JSON object."))
  }

  allowed <- c(
    "outcome_type", "prediction_column", "outcome_column", "prediction_kind",
    "time_column", "event_column", "probability_columns", "independent_cohort",
    "cohort_label", "bootstrap_repetitions", "seed"
  )
  unknown <- setdiff(names(config), allowed)
  if (length(unknown)) {
    res$status <- 400
    return(list(status="error", message=paste("Unknown config field(s):", paste(unknown, collapse=", "))))
  }
  if (is.null(config$outcome_type) || !nzchar(as.character(config$outcome_type))) {
    res$status <- 400
    return(list(status="error", message="config.outcome_type is required."))
  }

  data <- try(read_csv_text(predictions_csv), silent=TRUE)
  if (inherits(data, "try-error") || !nrow(data)) {
    res$status <- 400
    return(list(status="error", message="The frozen prediction CSV could not be parsed or is empty."))
  }

  result <- try(do.call(validate_external_predictions, c(list(data=data), config)), silent=TRUE)
  if (inherits(result, "try-error")) {
    res$status <- 422
    return(list(status="error", message=as.character(result)))
  }
  result$input <- list(rows=nrow(data), columns=as.list(names(data)))
  result
}

#* @post /run
#* @serializer json list(auto_unbox=TRUE, dataframe="rows", na="null")
function(req, res) {
  if (!requireNamespace("jsonlite", quietly=TRUE)) {
    res$status <- 500
    return(list(status="error", message="jsonlite is required by the reference backend."))
  }
  payload <- try(jsonlite::fromJSON(req$postBody, simplifyVector=FALSE), silent=TRUE)
  if (inherits(payload,"try-error")) {
    res$status <- 400
    return(list(status="error", message="Invalid JSON payload."))
  }
  tryCatch(
    run_backend_analysis(payload),
    error=function(e) {
      res$status <- 422
      list(status="error", message=conditionMessage(e))
    }
  )
}
