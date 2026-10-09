#!/usr/bin/env Rscript
# Genuinely different published clinical cohorts: MAINZ trains native PMx;
# TRANSBIG supplies *unlabelled* external profiles to the Node scorer.
# Their outcome labels are written to a SEPARATE file opened only by R metrics.
args<-commandArgs(trailingOnly=TRUE)
if(length(args)!=3L)
  stop("Usage: Rscript scripts/export_mainz_transbig_pmx.R external/MAINZ external/TRANSBIG output")
if(!requireNamespace("Biobase",quietly=TRUE)||
   !requireNamespace("jsonlite",quietly=TRUE))
  stop("Biobase and jsonlite required.")
source_dirs<-args[1:2]; dest<-args[[3]]
expected<-c("mainz","transbig")
exps<-lapply(seq_along(expected),function(i){
  e<-new.env(parent=emptyenv())
  load(file.path(source_dirs[[i]],"data",paste0(expected[[i]],".rda")),envir=e)
  obj<-e[[expected[[i]]]]
  if(!methods::is(obj,"ExpressionSet"))
    stop(paste("Missing official ExpressionSet",expected[[i]]))
  obj
})
names(exps)<-expected
m<-Biobase::exprs(exps$mainz)
t<-Biobase::exprs(exps$transbig)
if(nrow(m)!=22283L||ncol(m)!=200L||nrow(t)!=22283L||ncol(t)!=198L)
  stop("Original cohorts changed; revise benchmarking contract.")
if(anyDuplicated(rownames(m))||anyDuplicated(rownames(t))||
   anyDuplicated(colnames(m))||anyDuplicated(colnames(t)))
  stop("Microarray sample or probe identifiers are duplicated within source.")
shared<-intersect(rownames(m),rownames(t))
if(length(shared)<21000L)stop("Insufficient shared HG-U133A measured probes.")
if(anyDuplicated(shared))stop("Shared probes are not unique.")
if(!identical(tolower(Biobase::annotation(exps$mainz)),
              tolower(Biobase::annotation(exps$transbig))))
  stop("Two published cohorts have unequal declared assay platforms.")
phe1<-Biobase::pData(exps$mainz)
phe2<-Biobase::pData(exps$transbig)
if(!"er"%in%names(phe1)||!"er"%in%names(phe2))
  stop("Both published clinical tables must contain the ER receptor status.")
decode_er<-function(column,where){
  x<-tolower(trimws(as.character(column)))
  positive<-c("1","positive","pos","er+","er positive","positive (er+)")
  negative<-c("0","negative","neg","er-","er negative","negative (er-)")
  allowed<-c(positive,negative,"","na","n/a","unknown")
  bad<-setdiff(unique(x[!is.na(x)]),allowed)
  if(length(bad))stop(paste("Unrecognized ER status in",where,":",paste(bad,collapse="; ")))
  y<-rep(NA_character_,length(x))
  y[x%in%positive]<-"ER_positive"
  y[x%in%negative]<-"ER_negative"
  y
}
er1<-decode_er(phe1$er,"MAINZ")
er2<-decode_er(phe2$er,"TRANSBIG")
keep1<-which(!is.na(er1))
keep2<-which(!is.na(er2))
if(length(keep1)<140L||length(keep2)<130L||
   any(table(factor(er1[keep1],levels=c("ER_negative","ER_positive")))<20L)||
   any(table(factor(er2[keep2],levels=c("ER_negative","ER_positive")))<20L))
  stop("Too few valid clinically labelled participants per dataset.")

# Guard direct sample-name overlap, then look for near-identical sample
# expression vectors over ALL shared measured probes, not patient metadata.
# Correlation is calculated on per-sample centered profiles. This is NOT a
# definitive same-patient identity test; undetected re-arrayed people may remain.
id_intersect<-intersect(colnames(m)[keep1],colnames(t)[keep2])
if(length(id_intersect))
  stop("Published cohorts reuse observed sample IDs: do not claim independent cohort.")
a<-m[shared,keep1,drop=FALSE]
b<-t[shared,keep2,drop=FALSE]
if(any(!is.finite(a))||any(!is.finite(b)))
  stop("Source has missing/nonfinite array profiles; source-specific masking requires an explicit study protocol.")
# Center columns per sample; compare every MAINZ patient to every TRANSBIG patient.
# The two matrices fit in memory. Blas crossproduct uses all 22k probes.
ac<-sweep(a,2,colMeans(a),"-")
bc<-sweep(b,2,colMeans(b),"-")
na<-sqrt(colSums(ac*ac))
nb<-sqrt(colSums(bc*bc))
if(any(na<=0)|any(nb<=0))stop("Constant patient profile detected.")
corr<-crossprod(ac,bc)/outer(na,nb)
max_corr<-max(corr)
max_abs_corr<-max(abs(corr))
n_suspect<-sum(corr>=.995)
cat(sprintf("CROSS STUDY IDENTITY AUDIT: shared named IDs=%d, max expr correlation=%.6f, suspected >=0.995=%d\n",
  length(id_intersect),max_corr,n_suspect))
if(n_suspect>0L)
  stop("Potential duplicate people across MAINZ and TRANSBIG: near-identical arrays. Independently adjudicate before certification.")
if(!is.finite(max_corr)||!is.finite(max_abs_corr))
  stop("Nonfinite cross-dataset correlation audit.")

# No global feature selection, no pooled centering, no test-phenotype use.
# 22,283 probes have native matched platform identifiers.
features<-as.character(shared)
build<-function(mat,indices,labels,tag,reveal_outcome){
  lapply(seq_along(indices),function(j){
    k<-indices[[j]]
    vals<-as.numeric(mat[,k])
    vals[!is.finite(vals)]<-NA_real_
    row<-list(id=sprintf("%s_%03d",tag,k),values=as.list(vals))
    if(reveal_outcome)row$outcome<-labels[[k]]
    row
  })
}
train_rows<-build(m[features,,drop=FALSE],keep1,er1,"MAINZ",TRUE)
test_rows<-build(t[features,,drop=FALSE],keep2,er2,"TRANSBIG",FALSE)
if(any(vapply(test_rows,function(r)"outcome"%in%names(r),logical(1))))
  stop("TRANSBIG outcomes leaked into model-scoring input.")
truth<-data.frame(subject_id=vapply(test_rows,function(r)r$id,character(1)),
  outcome=er2[keep2],stringsAsFactors=FALSE)
dir.create(dest,recursive=TRUE,showWarnings=FALSE)
jsonlite::write_json(list(features=features,rows=train_rows),
  file.path(dest,"train.json"),auto_unbox=TRUE,na="null",digits=9L)
jsonlite::write_json(list(features=features,rows=test_rows),
  file.path(dest,"test-unlabelled.json"),auto_unbox=TRUE,na="null",digits=9L)
write.csv(truth,file.path(dest,"holdout-truth.csv"),row.names=FALSE,quote=FALSE)
manifest<-list(
  train_study="MAINZ, Schmidt et al 2008, GSE11121",
  evaluation_study="TRANSBIG, Desmedt et al 2007, GSE7390",
  matrix_source="Two separate pinned official Bioconductor ExpressionSets",
  total_train_source=ncol(m),total_external_source=ncol(t),
  train_n=length(keep1),external_n=length(keep2),
  train_class_counts=as.list(table(er1[keep1])),
  external_class_counts=as.list(table(er2[keep2])),
  technology="Affymetrix HG-U133A for both studies",
  matching="Exact shared probe identifiers, no imputed unavailable panels",
  all_shared_probes=length(shared),global_probes_removed=0L,
  preprocessing="Upstream publisher-normalized data, not original CEL raw source",
  no_external_label_in_training_file=TRUE,
  cross_study_name_duplicate_count=length(id_intersect),
  expression_duplicate_audit=list(max_pair_correlation=max_corr,
    max_absolute_pair_correlation=max_abs_corr,
    suspected_pairs_above_0995=n_suspect),
  source_independence_supported_by_distinct_publications=TRUE,
  cross_platform_validation=FALSE,
  clinical_validation=FALSE,
  external_cohort_caution="Different studies, same measurement platform; cannot rule out all silent source or participant overlap from anonymized identifiers."
)
jsonlite::write_json(manifest,file.path(dest,"source-contract.json"),
  pretty=TRUE,auto_unbox=TRUE)
cat(sprintf("CROSS-STUDY EXPORT PASS: MAINZ train=%d TRANSBIG external=%d probes=%d ER+(train)=%d ER+(external)=%d\n",
  length(keep1),length(keep2),length(shared),
  sum(er1[keep1]=="ER_positive"),sum(er2[keep2]=="ER_positive")))
