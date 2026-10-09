#!/usr/bin/env Rscript
# A new high-dimensional validation scenario for the NATIVE PMx frozen model.
# The source Bioconductor ALL dataset provides ALL measured probes:
# no publisher-significance ranking, outcome-based prefilter or gene selection.
# IMPORTANT: same-source stratified split, NOT an independent hospital cohort.
args<-commandArgs(trailingOnly=TRUE)
if(length(args)!=2L)stop("Usage: Rscript scripts/export_all_unselected_pmx.R external/ALL output")
root<-args[[1L]];dest<-args[[2L]]
if(!requireNamespace("Biobase",quietly=TRUE)||
   !requireNamespace("jsonlite",quietly=TRUE))
  stop("Biobase and jsonlite are required.")
e<-new.env(parent=emptyenv())
load(file.path(root,"data","ALL.rda"),envir=e)
all<-e$ALL
if(!methods::is(all,"ExpressionSet"))stop("Expected Bioconductor ExpressionSet.")
phe<-Biobase::pData(all)
expr<-Biobase::exprs(all)
if(nrow(expr)!=12625L||ncol(expr)!=128L)stop("ALL source dimensions changed.")
if(anyDuplicated(rownames(expr))||anyDuplicated(colnames(expr)))
  stop("Nonunique measured probe or sample identifiers.")
if(!all(c("BT","mol.biol")%in%colnames(phe)))stop("Required original phenotypes absent.")
chosen<-grepl("^B",as.character(phe$BT))&
  as.character(phe$mol.biol)%in%c("BCR/ABL","NEG")
sample_ids<-which(chosen)
if(length(sample_ids)!=79L)stop("Unexpected B-cell ALL eligible-subtype count.")
pheno<-as.character(phe$mol.biol[chosen])
names(pheno)<-colnames(expr)[chosen]
if(anyNA(pheno)||!all(c("BCR/ABL","NEG")%in%pheno))
  stop("Both prespecified molecular phenotypes are required.")
# Fixed-seed, per-class assignment: eligibility and split are determined
# once in the exporter; all future model hyperparameters use TRAIN only.
set.seed(20261009L)
training<-integer()
for(class in c("BCR/ABL","NEG")){
  idx<-sample_ids[pheno==class]
  training<-c(training,sample(idx,size=floor(length(idx)*.75),replace=FALSE))
}
train_ix<-sort(training)
test_ix<-sort(setdiff(sample_ids,train_ix))
if(length(train_ix)<48L||length(test_ix)<18L)
  stop("Unusable frozen internal holdout sizes.")
train_ph<-as.character(phe$mol.biol[train_ix])
test_ph<-as.character(phe$mol.biol[test_ix])
if(any(table(train_ph)<8L)||any(table(test_ph)<4L))
  stop("One class too rare for the prespecified split.")
# Critical: retain all 12,625 measured probes unchanged and in
# their original order; no global variance, q-value or missingness filter.
feat<-as.character(rownames(expr))
make_rows<-function(idx,prefix,with_labels){
  lapply(seq_along(idx),function(k){
    values<-as.numeric(expr[,idx[[k]]])
    values[!is.finite(values)]<-NA_real_
    result<-list(id=sprintf("%s_%03d",prefix,k),values=as.list(values))
    if(with_labels)result$outcome<-as.character(phe$mol.biol[idx[[k]]])
    result
  })
}
train_rows<-make_rows(train_ix,"ALL_TRAIN",TRUE)
test_rows<-make_rows(test_ix,"ALL_TEST",FALSE)
if(any(vapply(test_rows,function(r)"outcome"%in%names(r),logical(1))))
  stop("Holdout labels leaked into the scoring export.")
truth<-data.frame(subject_id=vapply(test_rows,function(r)r$id,character(1)),
                  outcome=test_ph,stringsAsFactors=FALSE)
dir.create(dest,recursive=TRUE,showWarnings=FALSE)
jsonlite::write_json(list(features=feat,rows=train_rows),
  file.path(dest,"train.json"),auto_unbox=TRUE,na="null",digits=9L)
jsonlite::write_json(list(features=feat,rows=test_rows),
  file.path(dest,"test-unlabelled.json"),auto_unbox=TRUE,na="null",digits=9L)
utils::write.csv(truth,file.path(dest,"holdout-truth.csv"),
  row.names=FALSE,quote=FALSE)
source_contract<-list(
  dataset="Bioconductor ALL: DFCI Ritz Laboratory ALL ExpressionSet",
  source_pinned_at="bioconductor-source/ALL at immutable commit in workflow",
  source_dimension=list(probes=nrow(expr),patients=ncol(expr)),
  biologically_eligible_subjects=length(sample_ids),
  train_n=length(train_ix),heldout_n=length(test_ix),
  training_class_counts=as.list(table(train_ph)),
  heldout_class_counts=as.list(table(test_ph)),
  measured_features=length(feat),removed_features=0L,
  feature_policy="ALL 12,625 probes, original source order, no filtering or source significance ranking",
  preprocessed_at_source=TRUE,
  cohort_split="fixed-seed (20261009) per-class split performed by this benchmark, not publisher-heldout",
  independentHospital=FALSE,independentSource=FALSE,
  objective="BCR/ABL vs NEG, B-lineage ALL only",
  biologicalCaution="Old preprocessed microarray dataset; same-source partitions and class confounders; no cross-laboratory external validity."
)
jsonlite::write_json(source_contract,file.path(dest,"source-contract.json"),
  auto_unbox=TRUE,pretty=TRUE)
cat("ALL EXPORT PASS: 12625 unselected probes, train=",length(train_ix),
    ", heldout=",length(test_ix),", both classes represented\n",sep="")
