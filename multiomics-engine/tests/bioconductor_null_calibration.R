#!/usr/bin/env Rscript
# Prespecified negative-control assessment for actual reference implementations.
# Independent negative-binomial samples with zero group effect and balanced batch.
# Under the global null, FDP = 1 whenever at least one feature is selected;
# therefore the fraction of replicates with any BH discovery estimates FDR/FWER.
#
# This is a finite Monte Carlo audit, not a general certificate of FDR control.
source("multiomics-engine/advanced_methods.R")
for (pkg in c("DESeq2", "edgeR", "limma", "statmod")) {
  if (!requireNamespace(pkg, quietly=TRUE)) stop("Missing reference R package: ",pkg)
}
n_replicates <- as.integer(Sys.getenv("MULTIOMICS_NULL_REPLICATES", "12"))
if (!is.finite(n_replicates) || n_replicates < 8L) stop("At least eight null replicates required.")
genes <- paste0("N",sprintf("%04d",seq_len(400)))
ids <- paste0("S",sprintf("%02d",seq_len(40)))
meta <- data.frame(
  condition=factor(rep(c("control","treated"),each=20),levels=c("control","treated")),
  batch=factor(rep(c("B1","B2"),times=20)),row.names=ids
)
base <- exp(seq(log(45), log(350), length.out=length(genes)))
dispersion <- seq(0.08,0.2,length.out=length(genes))
records <- list()
root <- tempfile("multiomics_null_reference_")
dir.create(root)
for (replicate in seq_len(n_replicates)) {
  set.seed(780000L+replicate)
  libfactor <- stats::runif(length(ids),0.9,1.1)
  counts <- vapply(seq_along(ids), function(i) {
    stats::rnbinom(length(genes),mu=base*libfactor[i],size=1/dispersion)
  }, numeric(length(genes)))
  rownames(counts) <- genes
  colnames(counts) <- ids
  input <- t(counts)
  prefix <- file.path(root,sprintf("rep%02d",replicate))
  d <- run_deseq2_counts(input,meta,paste0(prefix,"_d"),
     design_formula=~batch+condition,contrast=c("condition","treated","control"))
  v <- run_voom_counts(input,meta,paste0(prefix,"_v"),
     design_formula=~batch+condition,coefficient="conditiontreated")
  e <- run_edger_ql_counts(input,meta,paste0(prefix,"_e"),
     design_formula=~batch+condition,coefficient="conditiontreated")
  methods <- list(DESeq2=d$results$padj,limma_voom=v$results[["adj.P.Val"]],edgeR_QL=e$results$FDR)
  for (name in names(methods)) {
    p <- as.numeric(methods[[name]])
    stopifnot(length(p)>=300L)
    n_rejected <- sum(is.finite(p)&p<=0.05)
    records[[length(records)+1L]] <- data.frame(
      seed=780000L+replicate, replicate=replicate, method=name,
      features_tested=length(p), finite_q=sum(is.finite(p)),
      discoveries_q05=n_rejected, false_discovery_fraction=as.numeric(n_rejected>0),
      stringsAsFactors=FALSE
    )
  }
  cat(sprintf("Null replicate %02d/%02d completed\n",replicate,n_replicates))
}
results <- do.call(rbind,records)
summary <- aggregate(
  cbind(any_discovery=results$false_discovery_fraction,
        discoveries=results$discoveries_q05),
  by=list(method=results$method),FUN=mean
)
summary$replicates <- n_replicates
out <- Sys.getenv("MULTIOMICS_VALIDATION_OUTPUT","")
if (nzchar(out)) {
  dir.create(out,recursive=TRUE,showWarnings=FALSE)
  utils::write.csv(results,file.path(out,"bioconductor_null_replicates.csv"),row.names=FALSE)
  utils::write.csv(summary,file.path(out,"bioconductor_null_summary.csv"),row.names=FALSE)
}
print(summary,row.names=FALSE)
# 12 repetitions give a very imprecise tail probability estimate. Threshold
# 0.35 detects gross inflation only; never call this definitive FDR validation.
if (any(summary$any_discovery > 0.35)) {
  stop("Possible gross false-discovery inflation under global null; investigate before release.")
}
unlink(root,recursive=TRUE)
cat("REFERENCE GLOBAL-NULL BENCHMARK: PASS (limited prespecified screen)\n")
