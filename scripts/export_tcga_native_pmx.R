#!/usr/bin/env Rscript
# Export publisher-defined mRNA train/test partitions to a locked PMx
# contract. Labels for the heldout subjects are kept in a SEPARATE file.
args <- commandArgs(trailingOnly=TRUE)
if(length(args)!=2L)stop("Usage: Rscript scripts/export_tcga_native_pmx.R external/mixOmics output_dir")
if(!requireNamespace("jsonlite",quietly=TRUE))stop("jsonlite is required.")
root <- args[[1L]]; dir <- args[[2L]]
e <- new.env(parent=emptyenv())
load(file.path(root,"data","breast.TCGA.rda"),envir=e)
tcga <- e$breast.TCGA
train <- tcga$data.train; test <- tcga$data.test
if(is.null(train$mrna)||is.null(test$mrna))stop("Both publisher splits must have mRNA.")
if(nrow(train$mrna)!=150L||nrow(test$mrna)!=70L)
  stop("Publisher split changed; source contract must be reviewed.")
if(!is.null(test$protein)&&ncol(as.matrix(test$protein))>0L)
  stop("Unexpected test proteomics - verify original source and claims.")
shared <- intersect(colnames(train$mrna),colnames(test$mrna))
if(length(shared)<50L||anyDuplicated(shared))
  stop("Shared mRNA panel is invalid.")
features <- as.character(shared)
mkrows <- function(split,prefix,include_outcome){
  x <- as.matrix(split$mrna[,features,drop=FALSE])
  storage.mode(x)<-"double"
  seqRows <- seq_len(nrow(x))
  lapply(seqRows,function(i){
    vals <- as.numeric(x[i,])
    vals[!is.finite(vals)] <- NA_real_
    row <- list(id=sprintf("%s_%03d",prefix,i),
      values=as.list(vals))
    if(include_outcome)row$outcome <- as.character(split$subtype[[i]])
    row
  })
}
trainrows <- mkrows(train,"TCGA_TRAIN",TRUE)
testrows <- mkrows(test,"TCGA_HOLDOUT",FALSE)
names(testrows) <- NULL; names(trainrows) <- NULL
train_eligible <- Filter(function(r)r$outcome %in% c("Her2","LumA"),trainrows)
test_truth <- data.frame(subject_id=vapply(testrows,function(r)r$id,character(1)),
                        outcome=as.character(test$subtype),stringsAsFactors=FALSE)
if(length(train_eligible)!=105L ||
   sum(test_truth$outcome %in% c("Her2","LumA"))!=49L)
  stop("Unexpected subtype eligibility: manually review source.")
dir.create(dir,showWarnings=FALSE,recursive=TRUE)
jsonlite::write_json(list(features=features,rows=train_eligible),
  file.path(dir,"train.json"),auto_unbox=TRUE,pretty=FALSE,na="null")
jsonlite::write_json(list(features=features,rows=testrows),
  file.path(dir,"test-unlabelled.json"),auto_unbox=TRUE,pretty=FALSE,na="null")
utils::write.csv(test_truth,file.path(dir,"holdout-truth.csv"),
  row.names=FALSE,quote=FALSE)
jsonlite::write_json(list(
  source="mixOmics breast.TCGA immutable commit specified in CI",
  fullTrain=150L,fullTest=70L,eligibleTraining=105L,eligibleHoldout=49L,
  featureCount=length(features),
  sourcePreprocessing="Public source matrices already normalized/preselected upstream",
  modality="mRNA only; absent test proteomics",
  leakageBoundary="Training labels only in train.json; heldout labels isolated in holdout-truth.csv",
  independentHospital=FALSE,clinicalValidation=FALSE
),file.path(dir,"source-contract.json"),auto_unbox=TRUE,pretty=TRUE)
cat("TCGA PMx native export PASS: train=105 test=70 eligible_holdout=49 genes=",length(features),"\n",sep="")
