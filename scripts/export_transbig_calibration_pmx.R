#!/usr/bin/env Rscript
# Three-study experimental calibration: MAINZ trains PMx, TRANSBIG (Affy)
# alone supplies ER labels to learn ONE calibration intercept, NKI (Agilent)
# remains label-blind until the independent final-score stage.
# Important: NKI was analyzed in earlier publications/CI, so this is a
# RETROSPECTIVE METHOD-DEVELOPMENT study, NOT a fresh untouched validation.
args<-commandArgs(trailingOnly=TRUE)
if(length(args)!=3L)
 stop("Usage: Rscript scripts/export_transbig_calibration_pmx.R external/MAINZ external/TRANSBIG benchmark_outdir")
if(!requireNamespace("Biobase",quietly=TRUE)||
   !requireNamespace("jsonlite",quietly=TRUE))stop("Biobase/jsonlite required")
read_obj<-function(parent,slug){
 e<-new.env(parent=emptyenv())
 load(file.path(parent,"data",paste0(slug,".rda")),envir=e)
 z<-e[[slug]]
 if(!methods::is(z,"ExpressionSet"))stop("Expected ExpressionSet")
 z
}
mainz<-read_obj(args[[1L]],"mainz")
transbig<-read_obj(args[[2L]],"transbig")
if(!identical(dim(Biobase::exprs(mainz)),c(22283L,200L))||
   !identical(dim(Biobase::exprs(transbig)),c(22283L,198L))||
   tolower(Biobase::annotation(transbig))!="hgu133a")
 stop("Unexpected source dimension/platform: refuse to calibrate")
manifest<-jsonlite::read_json(file.path(args[[3L]],"source-contract.json"),simplifyVector=TRUE)
feature_source<-jsonlite::read_json(file.path(args[[3L]],"primary_rank","train.json"),simplifyVector=FALSE)
genes<-unlist(feature_source$features,use.names=FALSE)
if(length(genes)!=manifest$common_gene_count||
   length(genes)<5000L||anyDuplicated(genes)||
   !all(grepl("^[1-9][0-9]*$",genes)))
 stop("Original MAINZ/NKI mapped-gene universe is corrupted")
to_entrez<-function(x){
 s<-trimws(as.character(x))
 s[is.na(s)|!grepl("^[1-9][0-9]*$",s)]<-NA_character_
 s
}
ids_mainz<-to_entrez(Biobase::fData(mainz)[["EntrezGene.ID"]])
ids_cal<-to_entrez(Biobase::fData(transbig)[["EntrezGene.ID"]])
if(length(ids_cal)!=nrow(Biobase::exprs(transbig)))stop("Incomplete TRANSBIG feature mapping")
map_medians<-function(eset,ids,features){
 raw<-Biobase::exprs(eset)
 raw[!is.finite(raw)]<-NA_real_
 locations<-which(!is.na(ids)&ids%in%features)
 groups<-split(locations,factor(ids[locations],levels=features))
 n<-ncol(raw)
 gene_values<-vapply(groups,function(ii){
  if(!length(ii))return(rep(NA_real_,n))
  if(length(ii)==1L)return(as.numeric(raw[ii,]))
  apply(raw[ii,,drop=FALSE],2L,function(values){
   v<-values[is.finite(values)]
   if(!length(v))return(NA_real_)
   stats::median(v)
  })
 },numeric(n))
 x<-t(gene_values)
 rownames(x)<-features;colnames(x)<-colnames(raw)
 x
}
m<-map_medians(mainz,ids_mainz,genes)
cal<-map_medians(transbig,ids_cal,genes)
missing_entrez<-sum(rowSums(is.finite(cal))==0L)
if(missing_entrez/length(genes)>.15)
 stop("TRANSBIG calibration missing over 15% of mapped genes, panel unsuitable")
if(any(colSums(is.finite(cal))<length(genes)*.80))
 stop("Calibration subject missing over 20% of mapped genes")
raw_ids_m<-colnames(Biobase::exprs(mainz))
raw_ids_cal<-colnames(Biobase::exprs(transbig))
if(length(intersect(raw_ids_m,raw_ids_cal)))stop("MAINZ and TRANSBIG have overlapping source subject IDs")
# Near-duplicate profile audit restricted to common fully measured mapped genes.
audit_idx<-which(rowSums(is.finite(m))==ncol(m)&rowSums(is.finite(cal))==ncol(cal))
if(length(audit_idx)<1000L)stop("Too few complete genes for identity audit")
center<-function(x){
 z<-sweep(x,2L,colMeans(x),"-")
 sweep(z,2L,sqrt(colSums(z*z)),"/")
}
duplicates<-crossprod(center(m[audit_idx,,drop=FALSE]),center(cal[audit_idx,,drop=FALSE]))
if(any(!is.finite(duplicates))||any(duplicates>=.995))
 stop("Potential repeated patient between training MAINZ and calibration TRANSBIG")
p<-Biobase::pData(transbig)
if(!"er"%in%names(p))stop("ER outcome absent from TRANSBIG clinical table")
er<-trimws(tolower(as.character(p$er)))
if(any(!is.na(er)&!er%in%c("0","1","","na","n/a")))
 stop("TRANSBIG ER phenotype uses unrecognized coding")
outcome<-rep(NA_character_,length(er))
outcome[er=="1"]<-"ER_positive"
outcome[er=="0"]<-"ER_negative"
ix<-which(!is.na(outcome))
if(length(ix)<150L || any(table(outcome[ix])<20L))
 stop("Not enough calibration patients or both outcome classes.")
rank_col<-function(z){
 apply(z,2L,function(x){
  n<-sum(is.finite(x))
  if(n<1000L)stop("A subject has too few observed features for rank conversion.")
  as.numeric(rank(x,ties.method="average",na.last="keep"))/n
 })
}
rank_matrix<-rank_col(cal)
dimnames(rank_matrix)<-dimnames(cal)
save_arm<-function(arm,x){
 target<-file.path(args[[3L]],arm)
 rows<-lapply(ix,function(k){
  values<-unname(as.numeric(x[,k]))
  values[!is.finite(values)]<-NA_real_
  list(id=sprintf("TRANSBIG_CAL_%03d",k),values=values)
 })
 jsonlite::write_json(list(features=genes,rows=rows),
  file.path(target,"calibration-unlabelled.json"),
  auto_unbox=TRUE,na="null",digits=9L)
}
save_arm("primary_rank",rank_matrix)
save_arm("sensitivity_raw",cal)
truth<-data.frame(subject_id=sprintf("TRANSBIG_CAL_%03d",ix),
                  outcome=outcome[ix],stringsAsFactors=FALSE)
utils::write.csv(truth,file.path(args[[3L]],"transbig-calibration-truth.csv"),
 row.names=FALSE,quote=FALSE)
audit<-list(
 calibration_cohort="TRANSBIG GSE7390 (different Affymetrix study)",
 source_commit="44c052727769c051f965035725953b6883865743",
 raw_participants=198L,eligible_calibration_participants=length(ix),
 calibration_positive=sum(outcome[ix]=="ER_positive"),
 calibration_negative=sum(outcome[ix]=="ER_negative"),
 mapped_gene_panel=length(genes),unmapped_calibration_genes=missing_entrez,
 mainz_transbig_source_id_overlap=0L,
 max_cross_source_profile_correlation=max(duplicates),
 rank_primary="within-patient percentiles across exactly the original MAINZ/NKI gene panel",
 raw_sensitivity="published Affymetrix source expression levels on same gene panel",
 labels_blinded_to_js=TRUE,
 calibration_parameters_to_fit=1L,
 model_train_study="MAINZ",calibration_study="TRANSBIG",test_study="NKI",
 scope="RETROSPECTIVE METHOD DEVELOPMENT: prior PR40 used NKI labels, so NKI is NOT a novel untouched final test.",
 clinical_validity=FALSE
)
jsonlite::write_json(audit,file.path(args[[3L]],"transbig-calibration-contract.json"),
 auto_unbox=TRUE,pretty=TRUE,na="null")
cat(sprintf("TRANSBIG INDEPENDENT CALIBRATION INPUT PASS: training MAINZ=200, calibration TRANSBIG=%d, NKI final=337, genes=%d, no calibration labels in JS input\n",
 length(ix),length(genes)))
