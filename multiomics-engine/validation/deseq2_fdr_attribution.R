#!/usr/bin/env Rscript
# Prespecified mechanism-focused DESeq2 audit. A DIFFERENT experiment from
# Codex PR #52 (400-study benchmark). No claim of universal FDR control.
#
# Run from repo root, with DESeq2 & jsonlite installed:
# Rscript multiomics-engine/validation/deseq2_fdr_attribution.R DIR
#
# MINIMUM 40 independent simulated datasets per cell, default 60.
# This script deliberately has no automatic algorithm/threshold selection.
source("multiomics-engine/advanced_methods.R")
for (pkg in c("DESeq2","jsonlite"))
  if(!requireNamespace(pkg,quietly=TRUE))
    stop("Cannot run independent diagnostic without ",pkg)
out <- commandArgs(trailingOnly=TRUE)
if(length(out)!=1L || !nzchar(out[[1L]]))
  stop("Usage: Rscript multiomics-engine/validation/deseq2_fdr_attribution.R OUTPUT_DIR")
out <- out[[1L]]
dir.create(out,recursive=TRUE,showWarnings=FALSE)
nrep <- as.integer(Sys.getenv("PMX_DESEQ2_FDR_DIAG_REPS","60"))
if(length(nrep)!=1L || is.na(nrep) || nrep<40L || nrep>1000L)
  stop("Require 40..1000 independent replicates per scenario")
if(file.exists(file.path(out,"replicates.csv")))
  stop("Refusing to overwrite an existing diagnostic report")
alpha <- 0.05
ng <- 400L
nn <- 40L
features <- sprintf("GENE_%04d",seq_len(ng))
samples <- sprintf("BIO_%03d",seq_len(nn))
# Fix the designs, contrasts, comparisons and thresholds BEFORE running.
scenarios <- list(
  original_null_balanced=list(ncontrol=20L,constant_disp=FALSE,
    constant_library=FALSE,remove_batch_effect=FALSE),
  original_null_unbalanced=list(ncontrol=12L,constant_disp=FALSE,
    constant_library=FALSE,remove_batch_effect=FALSE),
  fixed_dispersion_balanced=list(ncontrol=20L,constant_disp=TRUE,
    constant_library=FALSE,remove_batch_effect=FALSE),
  fixed_libraries_balanced=list(ncontrol=20L,constant_disp=FALSE,
    constant_library=TRUE,remove_batch_effect=FALSE),
  no_batch_effect_balanced=list(ncontrol=20L,constant_disp=FALSE,
    constant_library=FALSE,remove_batch_effect=TRUE)
)
make_study <- function(cell,seed) {
  set.seed(seed)
  ncontrol <- cell$ncontrol
  condition <- factor(c(rep("control",ncontrol),
                        rep("treated",nn-ncontrol)),
                      levels=c("control","treated"))
  # Reproduce design from PR #52, including partially confounded batch.
  batch <- if(ncontrol==12L)
    factor(c(rep("B1",9L),rep("B2",3L),
             rep("B1",12L),rep("B2",16L)),levels=c("B1","B2"))
  else factor(rep(c("B1","B2"),times=nn/2L),levels=c("B1","B2"))
  meta <- data.frame(subject_id=samples,condition=condition,
                     batch=batch,row.names=samples,
                     stringsAsFactors=FALSE)
  baseline <- exp(stats::runif(ng,log(45),log(300)))
  dispersion <- stats::runif(ng,0.08,0.32)
  if(cell$constant_disp)dispersion[] <- 0.20
  library <- exp(stats::rnorm(nn,0,0.22))
  if(cell$constant_library)library[] <- 1
  batch_log <- if(cell$remove_batch_effect)0 else log(1.35)
  # All genes have exact zero treatment effects. The label may correlate with
  # the explicitly measured batch; batch is adjusted in each fit.
  x <- vapply(seq_len(nn),function(i){
    mu <- baseline*library[[i]]*
      exp(batch_log*(as.character(batch[[i]])=="B2"))
    stats::rnbinom(ng,mu=mu,size=1/dispersion)
  },numeric(ng))
  rownames(x) <- features;colnames(x) <- samples
  list(counts=t(x),meta=meta,dispersion=dispersion,
       library=library,seed=seed)
}
safe_fraction <- function(a,b)if(b>0L)a/b else NA_real_
evaluate <- function(res,truth_disp,dds,scenario,seed,method,nrep) {
  padj <- as.numeric(res$padj)
  p <- as.numeric(res$pvalue)
  if(any(is.finite(p)&(p<0|p>1)) ||
    any(is.finite(padj)&(padj<0|padj>1)))
    stop("Invalid p/q values")
  calls <- sum(is.finite(padj)&padj<=alpha)
  actual_disp <- DESeq2::dispersions(dds)
  estimated <- actual_disp[is.finite(actual_disp)&actual_disp>0]
  matched_truth <- truth_disp[which(is.finite(actual_disp)&actual_disp>0)]
  fitinfo <- attr(DESeq2::dispersionFunction(dds),"fitType")
  # No removal of fitted genes or warnings from the audit.
  data.frame(
    scenario=scenario,method=method,seed=seed,
    independent_replicates_planned=nrep,genes_generated=ng,
    finite_p=sum(is.finite(p)),finite_q=sum(is.finite(padj)),
    raw_p_le_005=sum(is.finite(p)&p<=alpha),
    discoveries=calls,any_false_discovery=as.integer(calls>0L),
    actual_fdp=as.integer(calls>0L), # global null: FDP == 1 iff R>0
    independent_filtering_excluded=sum(is.finite(p)&!is.finite(padj)),
    n_missing_p=sum(!is.finite(p)),
    median_estimated_dispersion=if(length(estimated))stats::median(estimated) else NA_real_,
    median_true_dispersion=stats::median(truth_disp),
    median_ratio_estimated_to_truth=if(length(estimated))
      stats::median(estimated/matched_truth) else NA_real_,
    dispersion_fit=if(length(fitinfo))as.character(fitinfo) else "unknown",
    stringsAsFactors=FALSE
  )
}
get_data <- function(study) {
  stopifnot(identical(rownames(study$counts),rownames(study$meta)),
            qr(stats::model.matrix(~batch+condition,study$meta))$rank==3L,
            all(study$counts>=0),all(is.finite(study$counts)))
  DESeq2::DESeqDataSetFromMatrix(
    countData=t(study$counts),colData=study$meta,
    design=~batch+condition)
}
fits <- list()
k <- 0L
failures <- list()
for(sidx in seq_along(scenarios)) {
  label <- names(scenarios)[[sidx]]
  spec <- scenarios[[sidx]]
  for(rep in seq_len(nrep)){
    # Disjoint from PR #52 seed series, a second Monte-Carlo sample.
    seed <- as.integer(20261013L+sidx*100000L+rep)
    input <- make_study(spec,seed)
    tryCatch({
      dds <- get_data(input)
      keep <- rowSums(DESeq2::counts(dds)>=10)>=
        max(2L,ceiling(ncol(dds)*.20))
      if(!any(keep))stop("Zero eligible genes")
      dds <- dds[keep,]
      truth <- input$dispersion[keep]
      dds <- DESeq2::DESeq(dds,quiet=TRUE)
      stopifnot("condition_treated_vs_control" %in% DESeq2::resultsNames(dds))
      # All three tests use the SAME fitted dataset and dispersions.
      # Default DESeq2 calls (Wald z, independent filtering).
      primary <- DESeq2::results(dds,
        contrast=c("condition","treated","control"),alpha=alpha)
      k <- k+1L
      fits[[k]] <- evaluate(primary,truth,dds,label,seed,
                            "DESeq2_default_Wald",nrep)
      # Only changes BH/independent-filtering logic, not fitted model.
      unfiltered <- DESeq2::results(dds,
        contrast=c("condition","treated","control"),alpha=alpha,
        independentFiltering=FALSE)
      k <- k+1L
      fits[[k]] <- evaluate(unfiltered,truth,dds,label,seed,
                            "DESeq2_Wald_no_independent_filter",nrep)
      # A diagnostic t-reference test, NOT a proposed automatic replacement.
      # Applied AFTER fitting the SAME gene-wise and MAP dispersions.
      tdds <- DESeq2::nbinomWaldTest(dds,useT=TRUE,quiet=TRUE)
      ttest <- DESeq2::results(tdds,
        contrast=c("condition","treated","control"),alpha=alpha)
      k <- k+1L
      fits[[k]] <- evaluate(ttest,truth,tdds,label,seed,
                            "DESeq2_Wald_t_reference",nrep)
    },error=function(e){
      failures[[length(failures)+1L]] <<- data.frame(
        scenario=label,replicate=rep,seed=seed,
        error=conditionMessage(e),stringsAsFactors=FALSE)
    })
  }
  # Persist all partial and adverse evidence, even when next cell errors.
  if(length(fits))
    utils::write.csv(do.call(rbind,fits),
      file.path(out,"replicates_partial.csv"),row.names=FALSE)
  if(length(failures))
    utils::write.csv(do.call(rbind,failures),
      file.path(out,"failures.csv"),row.names=FALSE)
  cat("P0 DESeq2 attribution: ",label," (",nrep," datasets), finished\n",sep="")
}
observed <- if(length(fits))do.call(rbind,fits) else data.frame()
if(!nrow(observed))stop("No valid fits")
utils::write.csv(observed,file.path(out,"replicates.csv"),row.names=FALSE)
all_groups <- split(observed,list(observed$scenario,observed$method),drop=TRUE)
summaries <- do.call(rbind,lapply(all_groups,function(x) {
  n <- nrow(x);k <- sum(x$any_false_discovery)
  exact <- stats::binom.test(k,n,conf.level=.95)$conf.int
  data.frame(scenario=x$scenario[[1L]],method=x$method[[1L]],
    expected_replicates=nrep,completed_replicates=n,
    false_study_count=k,empirical_global_null_fwer=k/n,
    exact_95_lower=exact[[1L]],exact_95_upper=exact[[2L]],
    median_estimated_over_true_dispersion=
      stats::median(x$median_ratio_estimated_to_truth,na.rm=TRUE),
    mean_missing_p=mean(x$n_missing_p),mean_tested_q=mean(x$finite_q),
    fit_type_frequency=paste(names(table(x$dispersion_fit)),
      as.integer(table(x$dispersion_fit)),sep="=",collapse=";"),
    scientific_certification=FALSE,stringsAsFactors=FALSE)
}))
rownames(summaries) <- NULL
utils::write.csv(summaries,file.path(out,"scenario_summary.csv"),row.names=FALSE)
manifest <- list(schema="pmx-deseq2-fdr-attribution/v1",
  seed=20261013L,independent_replicates_per_scenario=nrep,
  scenarios=as.list(names(scenarios)),
  design="global_null_fixed_contrast_condition_treated_vs_control",
  differential_model="~ batch + condition",
  intended_alpha=alpha,methods=c("DESeq2_default_Wald",
    "DESeq2_Wald_no_independent_filter","DESeq2_Wald_t_reference"),
  n_expected_fits=length(scenarios)*nrep*3L,
  n_actual_fits=nrow(observed),n_errors=length(failures),
  packages=list(DESeq2=as.character(utils::packageVersion("DESeq2")),
    R=as.character(getRversion())),
  comparator_question="Does dispersion heterogeneity, library-size heterogeneity, batch or Wald null reference associate with observed global-null false calls?",
  bounds="Observational simulation ablations, not proof of any single causal mechanism or general FDR control",
  statistical_validation_passed=FALSE,clinical_certification=FALSE)
jsonlite::write_json(manifest,file.path(out,"manifest.json"),
                    auto_unbox=TRUE,pretty=TRUE)
print(summaries,row.names=FALSE)
if(length(failures) || any(vapply(all_groups,nrow,integer(1))!=nrep) ||
  nrow(observed)!=manifest$n_expected_fits)
  stop("Incomplete study: retain adverse results and investigate failed fits")
cat("P0 DIAGNOSTIC COMPLETE: all cells executed; no nominal FDR certification\n")
