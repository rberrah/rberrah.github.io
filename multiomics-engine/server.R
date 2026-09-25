# PMx Explain multi-omics reference R backend
# Run with: Rscript multiomics-engine/run_backend.R
# Default endpoint: http://127.0.0.1:8787

or_else <- function(x, y) {
  if (is.null(x) || !length(x) || (length(x) == 1L && is.na(x))) y else x
}

source(file.path("multiomics-engine", "advanced_methods.R"), local = TRUE)

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

  blank_filter <- !identical(or_else(protocol$msBlankFilter, "yes"), "no") &&
    !identical(or_else(protocol$msBlankFilter, TRUE), FALSE)
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
    x <- x[,!contaminated,drop=FALSE]
  }

  drift_corrected <- 0L
  ordered_qc <- qc_idx[is.finite(orders[qc_idx])]
  if (drift_requested && length(ordered_qc) >= 5L && length(unique(orders[ordered_qc])) >= 4L) {
    ordered_all <- which(is.finite(orders))
    for (j in seq_len(ncol(x))) {
      values <- x[,j]
      positive <- values[is.finite(values) & values > 0]
      if (length(positive) < 5L) next
      pseudo <- max(min(positive) / 2, 1e-12)
      use_qc <- ordered_qc[is.finite(values[ordered_qc]) & values[ordered_qc] >= 0]
      if (length(use_qc) < 5L || length(unique(orders[use_qc])) < 4L) next

      fit <- try(stats::loess(
        log(values[use_qc] + pseudo) ~ orders[use_qc],
        span=0.6, degree=1, family="symmetric",
        control=stats::loess.control(surface="direct")
      ), silent=TRUE)
      if (inherits(fit,"try-error")) next
      pred_all <- try(stats::predict(fit, newdata=orders[ordered_all]), silent=TRUE)
      pred_qc <- try(stats::predict(fit, newdata=orders[use_qc]), silent=TRUE)
      if (inherits(pred_all,"try-error") || inherits(pred_qc,"try-error")) next
      reference <- stats::median(pred_qc[is.finite(pred_qc)], na.rm=TRUE)
      if (!is.finite(reference)) next
      valid <- is.finite(pred_all) & is.finite(values[ordered_all]) & values[ordered_all] >= 0
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
  if (blank_filter && length(blank_idx) < 2L) warnings <- c(warnings, "Blank filter requested but fewer than two blank injections were annotated.")
  if (drift_requested && length(ordered_qc) < 5L) warnings <- c(warnings, "Drift correction requested but fewer than five ordered pooled-QC injections were available.")
  if (rsd_filter && length(qc_idx) < 3L) warnings <- c(warnings, "QC RSD filter requested but fewer than three pooled-QC injections were annotated.")
  if (identical(mnar_strategy, "left_censored")) warnings <- c(warnings, "Left-censored imputation is a declared sensitivity assumption; retain a no-imputation analysis for confirmatory work.")

  list(
    matrix=x[bio_idx,,drop=FALSE],
    metadata=meta[bio_idx,,drop=FALSE],
    summary=list(
      method="R reference MS QC: blank filter + pooled-QC LOESS drift + pooled-QC RSD",
      biological_injections=length(bio_idx),
      blank_injections=length(blank_idx),
      qc_injections=length(qc_idx),
      blank_fold=blank_fold,
      blank_filtered_features=length(blank_filtered),
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
  terms
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

run_backend_analysis <- function(payload) {
  protocol <- or_else(payload$protocol, list())
  data_types <- or_else(payload$dataTypes, list())
  identifier_types <- or_else(payload$identifierTypes, list())
  mapping <- or_else(payload$columnMapping, list())
  covariates <- unlist(or_else(protocol$covariateColumns, character()), use.names=FALSE)

  raw_meta <- read_csv_text(payload$metadataCsv)
  meta <- canonical_metadata(raw_meta, mapping, covariates)
  layers <- intersect(c("transcriptomics","proteomics","metabolomics"), names(payload$matrices))
  if (length(layers) < 2L) stop("Reference backend requires at least two omics matrices.")

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

  for (layer in layers) {
    x <- blocks[[layer]]
    m <- metas[[layer]]
    layer_dir <- file.path(temp, layer)
    dir.create(layer_dir, recursive=TRUE)

    if (objective == "groups" && design_type == "independent" && !longitudinal &&
        layer == "transcriptomics" && identical(data_types[[layer]], "raw_counts")) {
      if (requireNamespace("DESeq2", quietly=TRUE)) {
        terms <- c(varying_terms(m, covariates), "condition")
        form <- safe_formula(terms)
        groups <- sort(unique(m$condition[nzchar(m$condition)]))
        contrast <- if (length(groups) == 2L) c("condition", groups[2], groups[1]) else NULL
        fit <- try(run_deseq2_counts(raw_blocks[[layer]], m, layer_dir, form, contrast), silent=TRUE)
        if (!inherits(fit,"try-error")) {
          methods[[paste0(layer,"_differential")]] <- method_status("DESeq2","ok",list(top=top_frame(fit$results)))
          if ("stat" %in% names(fit$results)) {
            stat <- fit$results$stat
            names(stat) <- fit$results$feature
            ranked[[layer]] <- stat
          }
        } else {
          methods[[paste0(layer,"_differential")]] <- method_status("DESeq2","error",list(message=as.character(fit)))
        }
      } else {
        methods[[paste0(layer,"_differential")]] <- method_status("DESeq2","unavailable",list(message="DESeq2 is not installed."))
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

    if ((objective == "time" || longitudinal || design_type == "repeated")) {
      if (requireNamespace("lmerTest", quietly=TRUE)) {
        fixed <- character()
        if (length(unique(m$condition[nzchar(m$condition)])) > 1L &&
            length(unique(m$timepoint[nzchar(m$timepoint)])) > 1L) {
          m$time <- suppressWarnings(as.numeric(gsub("[^0-9.+-]", "", m$timepoint)))
          if (all(is.finite(m$time))) fixed <- c(fixed, "condition * time")
        }
        fixed <- c(fixed, varying_terms(m, covariates))
        if (length(fixed)) {
          fit <- try(run_lmer_matrix(
            x, m, layer_dir,
            fixed_formula=paste(fixed, collapse=" + "),
            subject_column="subject_id"
          ), silent=TRUE)
          if (!inherits(fit,"try-error")) {
            methods[[paste0(layer,"_longitudinal")]] <- method_status("lmerTest","ok",list(top=top_frame(fit)))
            if (nrow(fit) && "statistic" %in% names(fit)) {
              stat <- fit$statistic
              names(stat) <- fit$feature
              ranked[[layer]] <- stat
            }
          } else {
            methods[[paste0(layer,"_longitudinal")]] <- method_status("lmerTest","error",list(message=as.character(fit)))
          }
        }
      } else {
        methods[[paste0(layer,"_longitudinal")]] <- method_status("lmerTest","unavailable",list(message="lmerTest is not installed."))
      }
    }
  }

  if (objective == "explore") {
    if (requireNamespace("MOFA2", quietly=TRUE)) {
      fit <- try(run_mofa2_blocks(blocks, file.path(temp,"mofa2"), factors=5L), silent=TRUE)
      methods$mofa2 <- if (!inherits(fit,"try-error")) method_status("MOFA2","ok",list(summary=fit$summary)) else method_status("MOFA2","error",list(message=as.character(fit)))
    } else {
      methods$mofa2 <- method_status("MOFA2","unavailable",list(message="MOFA2 is not installed."))
    }
  }

  supervised_target <- NULL
  common_samples <- Reduce(intersect, lapply(metas, rownames))
  if (length(common_samples)) {
    if (objective == "groups") {
      supervised_target <- setNames(metas[[1]][common_samples,"condition"], common_samples)
    } else if (objective == "outcome" && outcome_type %in% c("binary","multiclass")) {
      supervised_target <- setNames(metas[[1]][common_samples,"outcome"], common_samples)
    }
  }
  if (!is.null(supervised_target) && length(unique(supervised_target)) >= 2L) {
    if (requireNamespace("mixOmics", quietly=TRUE)) {
      fit <- try(run_diablo_blocks(blocks, supervised_target, file.path(temp,"diablo"), ncomp=2L), silent=TRUE)
      methods$diablo <- if (!inherits(fit,"try-error")) method_status("mixOmics DIABLO","ok",list(summary=fit$summary)) else method_status("mixOmics DIABLO","error",list(message=as.character(fit)))
    } else {
      methods$diablo <- method_status("mixOmics DIABLO","unavailable",list(message="mixOmics is not installed."))
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

  packages <- vapply(c("DESeq2","limma","lmerTest","fgsea","MOFA2","mixOmics"), requireNamespace, logical(1), quietly=TRUE)
  list(
    status="ok",
    engine=list(name="PMx Explain reference R backend", version="1.0.0"),
    applicableMethods=names(methods),
    methods=methods,
    preprocessing=preprocessing,
    packages=as.list(packages)
  )
}

#* @filter cors
function(req, res) {
  res$setHeader("Access-Control-Allow-Origin", "*")
  res$setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS")
  res$setHeader("Access-Control-Allow-Headers", "Content-Type")
  res$setHeader("Access-Control-Allow-Private-Network", "true")
  if (identical(req$REQUEST_METHOD, "OPTIONS")) return(list(status="ok"))
  plumber::forward()
}

#* @get /health
#* @serializer json list(auto_unbox=TRUE)
function() {
  packages <- vapply(c("DESeq2","limma","lmerTest","fgsea","MOFA2","mixOmics"), requireNamespace, logical(1), quietly=TRUE)
  list(
    status="ok",
    engine="PMx Explain reference R backend",
    version="1.0.0",
    packages=as.list(packages)
  )
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
