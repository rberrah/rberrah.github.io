#!/usr/bin/env Rscript
# Test metrics and experimental truth without loading any Bioconductor package.
source("multiomics-engine/mixed_truth_reference_metrics.R")
truth <- setNames(c(0,0,1.25,-1.25,0,0),paste0("G",seq_len(6L)))
tab <- data.frame(feature=names(truth),q=c(.8,.02,.001,.01,NA,.9),
                  log2fc=c(.1,.2,1.1,-1.3,0,.4))
r <- mixed_truth_feature_metrics(tab,truth,"DESeq2","five_pct",1L,123L)
stopifnot(nrow(r)==1L,r$total_planted_features==6L,
  r$tested_features==6L,r$finite_q==5L,r$n_true==2L,
  r$n_null==4L,r$selected_features==3L,
  r$false_discoveries==1L,r$true_discoveries==2L,
  isTRUE(all.equal(r$false_discovery_proportion,1/3)),
  r$power==1,r$wrong_direction_true_discoveries==0L,
  !r$scientific_certified %in% names(r))
wrong <- tab
wrong$log2fc[3L] <- -1.5
bad_sign <- mixed_truth_feature_metrics(wrong,truth,"DESeq2","five_pct",1L,123L)
stopifnot(bad_sign$wrong_direction_true_discoveries==1L)
# Pure null significant discoveries, with no reported alternatives in output.
missing <- tab[-4L,]
miss <- mixed_truth_feature_metrics(missing,truth,"DESeq2","five_pct",1L,123L)
stopifnot(miss$power==.5,miss$n_true==2L,
  miss$tested_features==5L)
reject <- function(t=tab,known=truth) inherits(
  try(mixed_truth_feature_metrics(t,known,"DESeq2","5%",1L,123L),silent=TRUE),
  "try-error")
bad <- tab;bad$feature[2L] <- bad$feature[1L]
stopifnot(reject(t=bad))
bad <- tab;bad$q[1L] <- -0.01
stopifnot(reject(t=bad))
bad <- tab;bad$q[1L] <- Inf
stopifnot(reject(t=bad))
bad <- tab;bad$log2fc[2L] <- Inf
stopifnot(reject(t=bad))
bad <- tab;bad$feature[2L] <- "EXTRA"
stopifnot(reject(t=bad))
bad_truth <- truth; names(bad_truth)[2L] <- names(bad_truth)[1L]
stopifnot(reject(known=bad_truth))

simulated <- do.call(rbind,lapply(c("one_pct","five_pct","twenty_pct"),
  function(scenario) do.call(rbind,lapply(c("DESeq2","edgeR_QL","limma_voom"),
    function(method) do.call(rbind,lapply(seq_len(20L),function(i) {
      x <- r
      x$scenario <- scenario
      x$method <- method
      x$replicate <- i
      x$seed <- i+as.integer(match(scenario,c("one_pct","five_pct","twenty_pct")))*1000L
      if(i>10L) {
        x$false_discoveries <- 0L
        x$false_discovery_proportion <- 0
      }
      x
    })))))))
set.seed(9876L)
seed_before <- get(".Random.seed",envir=.GlobalEnv)
out <- mixed_truth_study_summary(simulated)
stopifnot(identical(seed_before,get(".Random.seed",envir=.GlobalEnv)),
  nrow(out)==9L,all(out$independent_datasets==20L),
  all(abs(out$estimated_fdr-1/6)<1e-12),
  all(out$bootstrap_fdr_95_low<=out$estimated_fdr),
  all(out$bootstrap_fdr_95_high>=out$estimated_fdr),
  all(out$mean_power==1),all(!out$scientific_certified))
bad <- simulated
bad$seed[2L] <- bad$seed[1L]
stopifnot(inherits(try(mixed_truth_study_summary(bad),silent=TRUE),"try-error"))
bad <- simulated
bad$replicate[2L] <- bad$replicate[1L]
stopifnot(inherits(try(mixed_truth_study_summary(bad),silent=TRUE),"try-error"))
cat("RNA-seq mixed truth FDR, power and bias metrics: PASS (no biological certification)\n")
