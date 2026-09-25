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
  metas <- list()
  for (layer in layers) {
    layer_meta <- meta[meta$omic == layer, , drop=FALSE]
    expected <- unique(layer_meta$assay_id)
    x <- matrix_samples_by_features(payload$matrices[[layer]], expected)
    agg <- aggregate_technical_replicates(x, layer_meta, or_else(data_types[[layer]], "normalized"))
    blocks[[layer]] <- agg$matrix
    metas[[layer]] <- agg$metadata
  }

  temp <- tempfile("pmx_multiomics_")
  dir.create(temp, recursive=TRUE)
  on.exit(unlink(temp, recursive=TRUE, force=TRUE), add=TRUE)
  methods <- list()
  ranked <- list()

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
        fit <- try(run_deseq2_counts(x, m, layer_dir, form, contrast), silent=TRUE)
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
