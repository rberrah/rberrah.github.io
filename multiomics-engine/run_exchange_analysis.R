#!/usr/bin/env Rscript
# MultiOmics: reproducible, explicit R analysis from exchange v1.
# Usage: Rscript multiomics-engine/run_exchange_analysis.R EXCHANGE_DIR OUTPUT_DIR METHOD REFERENCE COMPARISON
# METHOD = DESeq2 | edgeR | limma; use only on appropriate data scales.
# One biological unit per group for independent designs; for paired studies
# use --paired as the sixth argument (one sample per subject and condition).
args <- commandArgs(trailingOnly=TRUE)
if (length(args) < 5L || length(args) > 6L)
  stop("Usage: Rscript run_exchange_analysis.R EXCHANGE_DIR OUT_DIR METHOD REFERENCE COMPARISON [--paired]")
root <- normalizePath(args[[1]],mustWork=TRUE)
out <- args[[2]]
method <- args[[3]]
ref <- args[[4]]
comparison <- args[[5]]
paired <- length(args)==6L && identical(args[[6]],"--paired")
if (length(args)==6L && !paired) stop("Unknown option; only --paired is allowed")
if (!method %in% c("DESeq2","edgeR","limma")) stop("Unsupported method")
if (identical(ref, comparison)) stop("Reference and comparison must differ")
if (!requireNamespace("jsonlite",quietly=TRUE)) stop("Missing R package: jsonlite")
manifest <- jsonlite::fromJSON(file.path(root,"manifest.json"),simplifyVector=FALSE)
if (!identical(manifest$schema_version,"1.0.0")) stop("Unsupported exchange schema")
if (!requireNamespace("digest",quietly=TRUE)) stop("Missing R package: digest (SHA-256)")
verified <- function(entry) {
  rel <- entry$path
  if (!is.character(rel) || length(rel)!=1L || !nzchar(rel) ||
      grepl("(^/|^[A-Za-z]:|\\\\|(^|/)\\.\\.(/|$))",rel))
    stop("Unsafe exchange path")
  path <- normalizePath(file.path(root,rel),mustWork=TRUE)
  if (!startsWith(path,paste0(root,.Platform$file.sep))) stop("Escaped exchange root")
  if (!identical(tolower(digest::digest(file=path,algo="sha256")),entry$sha256))
    stop("SHA-256 mismatch: ",rel)
  path
}
samples <- utils::read.csv(verified(manifest$files$samples),check.names=FALSE,
                           stringsAsFactors=FALSE,na.strings=character())
required <- c("assay_id","sample_id","subject_id","omic","condition")
if (!all(required %in% names(samples))) stop("Missing sample metadata: ",paste(setdiff(required,names(samples)),collapse=", "))
layers <- manifest$matrices
layer <- Filter(function(x)identical(x$omic,"transcriptomics"),layers)
if (length(layer)!=1L) stop("This R runner requires exactly one transcriptomics matrix definition")
layer <- layer[[1]]
if (method %in% c("DESeq2","edgeR") && !identical(layer$value_type,"raw_counts"))
  stop("DESeq2/edgeR require declared raw_counts; no silent transformation")
if (method=="limma" && identical(layer$value_type,"raw_counts"))
  stop("Direct limma on raw counts is unsupported; use voom or transformed values")
meta <- samples[samples$omic=="transcriptomics" &
                samples$condition %in% c(ref,comparison),,drop=FALSE]
if (anyNA(meta[,required]) || any(!nzchar(as.matrix(meta[,required]))))
  stop("Missing mandatory identifiers or conditions")
if (anyDuplicated(meta$assay_id)) stop("Duplicate assay identifiers")
if (!all(c(ref,comparison) %in% meta$condition)) stop("Missing contrast group")
raw <- utils::read.csv(verified(layer$file),check.names=FALSE,stringsAsFactors=FALSE,
                       na.strings="NA")
if (!identical(names(raw)[1],"feature_id") || anyDuplicated(raw$feature_id) || anyNA(raw$feature_id))
  stop("Invalid feature IDs")
if (!setequal(names(raw)[-1],samples$assay_id[samples$omic=="transcriptomics"]))
  stop("Sample/matrix disagreement")
if (nrow(meta)<4L) stop("Insufficient samples for reference analysis")
mat <- as.matrix(raw[,meta$assay_id,drop=FALSE])
rownames(mat) <- raw$feature_id
if (anyNA(mat) || any(!is.finite(suppressWarnings(as.numeric(mat)))))
  stop("Missing/nonfinite values: this runner requires complete observed matrices; no imputation")
storage.mode(mat) <- "numeric"
if (method %in% c("DESeq2","edgeR") &&
    (any(mat < 0) || any(mat != floor(mat))))
  stop("RNA-seq counts must be non-negative integers")
meta$condition <- factor(meta$condition,levels=c(ref,comparison))
if (paired) {
  if (anyDuplicated(paste(meta$subject_id,meta$condition,sep="::")))
    stop("More than one sample per subject and condition")
  tab <- table(meta$subject_id,meta$condition)
  if (any(tab!=1L)) stop("Paired design requires a complete pair for every subject")
  if (nrow(tab)<3L) stop("Insufficient biological pairs")
  meta$subject_id <- factor(meta$subject_id)
  design <- stats::model.matrix(~subject_id+condition,data=meta)
  formula <- ~subject_id+condition
} else {
  if (anyDuplicated(meta$subject_id))
    stop("Repeated subjects require explicit --paired; do not assume independence")
  design <- stats::model.matrix(~condition,data=meta)
  formula <- ~condition
}
if (qr(design)$rank < ncol(design) || nrow(design) <= ncol(design))
  stop("Non-estimable or saturated design")
if (!dir.exists(out)) dir.create(out,recursive=TRUE)
if (method=="DESeq2") {
  if (!requireNamespace("DESeq2",quietly=TRUE)) stop("Install DESeq2")
  dds <- DESeq2::DESeqDataSetFromMatrix(round(mat),colData=meta,design=formula)
  dds <- DESeq2::DESeq(dds)
  res <- as.data.frame(DESeq2::results(dds,contrast=c("condition",comparison,ref)))
  res$feature_id <- rownames(res)
} else if (method=="edgeR") {
  if (!requireNamespace("edgeR",quietly=TRUE)) stop("Install edgeR")
  y <- edgeR::DGEList(counts=mat)
  keep <- edgeR::filterByExpr(y,design=design)
  if (!any(keep)) stop("No genes after count-expression filtering")
  y <- edgeR::calcNormFactors(y[keep,,keep.lib.sizes=FALSE])
  y <- edgeR::estimateDisp(y,design)
  fit <- edgeR::glmQLFit(y,design)
  test <- edgeR::glmQLFTest(fit,coef=ncol(design))
  res <- test$table
  res$feature_id <- rownames(res)
  res$PValue <- test$table$PValue
  res$FDR <- stats::p.adjust(res$PValue,method="BH")
} else {
  if (!requireNamespace("limma",quietly=TRUE)) stop("Install limma")
  fit <- limma::lmFit(mat,design)
  fit <- limma::eBayes(limma::contrasts.fit(fit,contrasts=matrix(
    c(rep(0,ncol(design)-1),1),ncol=1,dimnames=list(colnames(design),"comparison"))))
  res <- limma::topTable(fit,coef=1,number=Inf,sort.by="none")
  res$feature_id <- rownames(res)
}
utils::write.csv(res,file.path(out,paste0(method,"_all_features.csv")),row.names=FALSE,na="")
utils::write.csv(meta,file.path(out,"samples_used.csv"),row.names=FALSE,na="")
capture.output(sessionInfo(),file=file.path(out,"R_session_info.txt"))
writeLines(c("This is a native R method run, not an external biological validation.",
  paste("Method:",method),paste("Comparison:",comparison,"vs",ref),
  paste("Paired:",paired),paste("Independent biological subjects:",length(unique(meta$subject_id))),
  "Review biological design, FDR calibration and assay quality before confirmatory claims."),
  file.path(out,"README.txt"))
cat("Wrote native R results and session information to",out,"\\n")
