# Pure base-R, post-fit association audit of UNSUPERVISED MOFA2 factors.
# Does not fit any model or use outcomes in factor generation.
# Do NOT treat experimental diet as batch: it is an experimental exposure.
mofa_real_factor_matrix <- function(factors, subject_ids) {
  if(!is.data.frame(factors) ||
     !all(c("sample","factor","value")%in%names(factors)))
    stop("MOFA2 must supply sample/factor/value long format")
  ids <- as.character(subject_ids)
  if(length(ids)<16L || anyNA(ids)||anyDuplicated(ids)||
     any(!nzchar(ids)))
    stop("MOFA2 audit requires distinct known biological subjects")
  sample<-as.character(factors$sample)
  factor<-as.character(factors$factor)
  value<-suppressWarnings(as.numeric(factors$value))
  if(anyNA(sample)||anyNA(factor)||any(!nzchar(sample))||
     any(!nzchar(factor))||any(!is.finite(value))||
     anyDuplicated(paste(sample,factor,sep="\r")))
    stop("Missing, nonfinite or duplicate MOFA2 factor scores")
  if(!setequal(sample,ids))
    stop("Factor sample sets differ from original assay biological subjects")
  names_f <- unique(factor)
  if(length(names_f)<1L||length(names_f)>10L)
    stop("MOFA2 factor count outside allowed 1..10")
  z<-vapply(names_f,function(name) {
     ix<-which(factor==name)
     if(length(ix)!=length(ids))
       stop("MOFA2 factor is missing some biological subjects")
     v<-value[ix][match(ids,sample[ix])]
     if(any(!is.finite(v)))stop("Unmatched factor score")
     v
  },numeric(length(ids)))
  if(is.null(dim(z)))z<-matrix(z,nrow=length(ids),ncol=1L)
  dimnames(z)<-list(ids,names_f)
  if(any(apply(z,2L,stats::sd)<=1e-8))
    stop("Degenerate MOFA2 factor scores: associations cannot be estimated")
  z
}

mofa_partial_r2 <- function(values,geno,diet) {
  if(length(values)!=length(geno)||length(values)!=length(diet)||
     any(!is.finite(values))||anyNA(geno)||anyNA(diet))
    stop("MOFA2 covariate association needs complete scores/genotype/diet")
  meta<-data.frame(geno=factor(geno),diet=factor(diet))
  if(nlevels(meta$geno)<2L||nlevels(meta$diet)<2L)
    stop("At least two observed levels per experimental variable")
  x_full<-stats::model.matrix(~geno+diet,meta)
  x_diet<-stats::model.matrix(~diet,meta)
  x_geno<-stats::model.matrix(~geno,meta)
  if(qr(x_full)$rank!=ncol(x_full))
    stop("Genotype and diet cannot be separated by the experimental design")
  rss<-function(X)sum(stats::lm.fit(X,values)$residuals^2)
  full<-rss(x_full)
  base_diet<-rss(x_diet)
  base_geno<-rss(x_geno)
  if(base_diet<=1e-12||base_geno<=1e-12)
    stop("Partial R2 is undefined with zero conditional residual variance")
  # Both are variance fractions CONDITIONAL on the other factor;
  # neither proves causality, independent biological signal nor an omic effect.
  c(
   genotype_given_diet=pmax(0,pmin(1,(base_diet-full)/base_diet)),
   diet_given_genotype=pmax(0,pmin(1,(base_geno-full)/base_geno))
  )
}

mofa_stratum_permutation <- function(labels,strata) {
  if(length(labels)!=length(strata)||anyNA(labels)||anyNA(strata))
    stop("Permutation requires complete labels and strata")
  result<-labels
  for(ix in split(seq_along(labels),factor(strata)))
    if(length(ix)>1L)result[ix]<-sample(labels[ix],length(ix),replace=FALSE)
  if(anyNA(result))stop("Permutation produced missing labels")
  result
}

mofa_real_metadata_audit <- function(scores,genotype,diet,
                                     n_permutations=199L,seed=20261011L) {
  if(!is.matrix(scores)||is.null(rownames(scores))||
     length(genotype)!=nrow(scores)||length(diet)!=nrow(scores))
    stop("MOFA2 post-fit scores and metadata cannot be paired")
  ids<-rownames(scores)
  if(anyDuplicated(ids)||anyNA(ids)||any(!is.finite(scores))||
     is.null(names(genotype))||is.null(names(diet))||
     anyDuplicated(names(genotype))||anyDuplicated(names(diet))||
     !setequal(names(genotype),ids)||!setequal(names(diet),ids))
    stop("Score/sample metadata identities must match without dropping anyone")
  if(length(n_permutations)!=1L||n_permutations<19L||
     n_permutations!=as.integer(n_permutations))
    stop("A prespecified >=19 metadata permutations are required")
  g<-as.character(genotype[ids])
  d<-as.character(diet[ids])
  factor_assoc<-function(gg,dd) {
     t(vapply(seq_len(ncol(scores)),function(j)
         mofa_partial_r2(scores[,j],gg,dd),numeric(2L)))
  }
  observed<-factor_assoc(g,d)
  colnames(observed)<-c("genotype_given_diet","diet_given_genotype")
  rownames(observed)<-colnames(scores)
  # Max across all MOFA factors BEFORE null comparison; no selecting the
  # best-looking factor and then quoting an unadjusted per-factor p-value.
  obs_max<-apply(observed,2L,max)
  set.seed(as.integer(seed))
  null<-matrix(NA_real_,nrow=n_permutations,ncol=2L,
    dimnames=list(NULL,colnames(observed)))
  for(i in seq_len(n_permutations)){
    perm_g<-mofa_stratum_permutation(g,d) # conditional on diet
    perm_d<-mofa_stratum_permutation(d,g) # conditional on genotype
    a<-factor_assoc(perm_g,d)
    b<-factor_assoc(g,perm_d)
    null[i,1L]<-max(a[,1L])
    null[i,2L]<-max(b[,2L])
  }
  p<-vapply(seq_len(ncol(null)),function(j)
     (1+sum(null[,j]>=obs_max[[j]]))/(n_permutations+1),numeric(1))
  names(p)<-colnames(null)
  list(
    status="retrospective_exploratory_post_fit_associations",
    observed_partial_r2=observed,
    observed_max_partial_r2=obs_max,
    null_max_partial_r2=null,
    empirical_p_max_across_factors=p,
    n_permutations=as.integer(n_permutations),
    min_possible_p=1/(n_permutations+1),
    design_adjustment="Genotype permutation within diet, diet permutation within genotype; partial R2 conditional on other experimental factor",
    caveat="Unsupervised factor scores were fitted without metadata; permutations are post-fit exploratory and do not provide independent biological validation, correct selected-source bias or ensure causal claims."
  )
}

mofa_real_between_seeds <- function(first,second) {
  if(!is.matrix(first)||!is.matrix(second)||
     !identical(rownames(first),rownames(second))||
     ncol(first)<1L||ncol(second)<1L)
    stop("MOFA2 seeds must contain exactly identical ordered biological subjects")
  correlations<-abs(stats::cor(first,second))
  if(any(!is.finite(correlations)))
    stop("Unidentifiable cross-seed latent factor correlations")
  # Do not silently assume factor order or sign is stable. Best matches
  # here are descriptive; duplicates are ALLOWED and disclosed explicitly,
  # never described as guaranteed one-to-one recovery.
  best<-apply(correlations,1L,max)
  matches<-colnames(correlations)[max.col(correlations,ties.method="first")]
  list(
    absolute_correlation=correlations,
    first_seed_factor_best_match=stats::setNames(matches,rownames(correlations)),
    first_seed_factor_best_abs_correlation=stats::setNames(best,rownames(correlations)),
    all_factors_match_uniquely=!anyDuplicated(matches),
    interpretation="Descriptive full-cohort factor reproducibility across two initializations; factors may rotate, permute or flip sign. Matching is not proof of stable biological signatures."
  )
}
