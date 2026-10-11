#!/usr/bin/env Rscript
# Strict base-R tests: real MOFA2 audit doesn't need MOFA2 installed.
source("multiomics-engine/mofa_real_metadata_audit.R")
set.seed(20261011L)
n<-40L
ids<-sprintf("M%03d",seq_len(n))
diet<-setNames(rep(paste0("diet",1:5),each=8L),ids)
geno<-setNames(rep(rep(c("WT","KO"),each=4L),5L),ids)
x<-ifelse(geno=="KO",2,-2)+stats::rnorm(n,0,.1)
z<-seq_len(n)/40+stats::rnorm(n,0,.1)
f<-rbind(
  data.frame(sample=ids,factor="Factor2",value=as.numeric(-z)),
  data.frame(sample=ids,factor="Factor1",value=as.numeric(x))
)
mat<-mofa_real_factor_matrix(f,ids)
stopifnot(identical(dim(mat),c(40L,2L)),
          identical(rownames(mat),ids),
          all(mat[,2L]==x))
audit<-mofa_real_metadata_audit(mat,geno,diet,49L,20261011L)
stopifnot(audit$status=="retrospective_exploratory_post_fit_associations",
  audit$observed_max_partial_r2[["genotype_given_diet"]]>.90,
  all(audit$empirical_p_max_across_factors>=1/50),
  identical(dim(audit$null_max_partial_r2),c(49L,2L)),
  all(is.finite(audit$null_max_partial_r2)),
  all(audit$null_max_partial_r2>=0),
  all(audit$null_max_partial_r2<=1))
again<-mofa_real_metadata_audit(mat,geno,diet,49L,20261011L)
stopifnot(identical(audit$null_max_partial_r2,again$null_max_partial_r2))
set.seed(1)
pg<-mofa_stratum_permutation(as.character(geno),as.character(diet))
for(k in unique(diet)){
 ix<-which(diet==k)
 stopifnot(identical(sort(pg[ix]),sort(unname(geno[ix]))))
}
# Factor sign flips and factor order are irrelevant to reported max-partial
# R2. Best seed match compares full profiles and discloses nonunique links.
swapped<-mat[,2:1,drop=FALSE]
swapped[,1L]<- -swapped[,1L]
stab<-mofa_real_between_seeds(mat,swapped)
stopifnot(all(stab$first_seed_factor_best_abs_correlation>.999999),
          isTRUE(stab$all_factors_match_uniquely))
perturbed<-f[-1L,,drop=FALSE]
stopifnot(inherits(try(mofa_real_factor_matrix(perturbed,ids),silent=TRUE),"try-error"))
bad<-f;bad$sample[[1L]]<-bad$sample[[2L]]
stopifnot(inherits(try(mofa_real_factor_matrix(bad,ids),silent=TRUE),"try-error"))
bad<-f;bad$value[[1L]]<-Inf
stopifnot(inherits(try(mofa_real_factor_matrix(bad,ids),silent=TRUE),"try-error"))
bad_diet<-diet;bad_diet[[1L]]<-NA_character_
stopifnot(inherits(try(mofa_real_metadata_audit(mat,geno,bad_diet,19L),silent=TRUE),"try-error"))
bad_ids<-geno;names(bad_ids)[1L]<-"UNKNOWN"
stopifnot(inherits(try(mofa_real_metadata_audit(mat,bad_ids,diet,19L),silent=TRUE),"try-error"))
confounded<-setNames(ifelse(geno=="KO","high","low"),ids)
stopifnot(inherits(try(mofa_real_metadata_audit(mat,geno,confounded,19L),silent=TRUE),"try-error"))
stopifnot(inherits(try(mofa_real_metadata_audit(mat,geno,diet,8L),silent=TRUE),"try-error"))
cat("MOFA2 real metadata audit base-R contracts: paired ID, genotype/diet adjustment, permutation max factors, RNG replay, factor sign/order, confounding refusal PASS\n")
