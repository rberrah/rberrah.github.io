#!/usr/bin/env Rscript
# Frozen native PMx cross-PLATFORM contract: MAINZ (single-channel Affymetrix)
# learns; NKI (two-channel Agilent/Rosetta) supplies NO target labels to JS.
# Probe annotation is not outcome-dependent: exact, unambiguous numeric
# Entrez gene ID; median multiple probes per gene within each source.
# PRIMARY transfer uses a predeclared within-subject percentile rank across
# the identical mapped-gene panel to reduce global technology scale changes.
# No cohort-level target centering, feature filtering, ComBat or fitted normalization.
args<-commandArgs(trailingOnly=TRUE)
if(length(args)!=3L)
 stop("Usage: Rscript scripts/export_mainz_nki_crossplatform.R external/MAINZ external/NKI outdir")
if(!requireNamespace("Biobase",quietly=TRUE)||
   !requireNamespace("jsonlite",quietly=TRUE))stop("Biobase and jsonlite required.")
read_eset<-function(parent,slug){
 e<-new.env(parent=emptyenv())
 load(file.path(parent,"data",paste0(slug,".rda")),envir=e)
 x<-e[[slug]]
 if(!methods::is(x,"ExpressionSet"))stop(paste("Invalid ExpressionSet",slug))
 x
}
mainz<-read_eset(args[[1L]],"mainz")
nki<-read_eset(args[[2L]],"nki")
if(!identical(dim(Biobase::exprs(mainz)),c(22283L,200L))||
   !identical(dim(Biobase::exprs(nki)),c(24481L,337L)))
 stop("Source files changed: reassess external validation before proceeding.")
if(tolower(Biobase::annotation(mainz))!="hgu133a"||
   tolower(Biobase::annotation(nki))!="rosetta")
 stop("Expected distinct Affymetrix and Agilent/Rosetta technologies.")
clean_ids<-function(x){
 x<-trimws(as.character(x))
 x[is.na(x)|!grepl("^[1-9][0-9]*$",x)]<-NA_character_
 x
}
f1<-Biobase::fData(mainz);f2<-Biobase::fData(nki)
if(!"EntrezGene.ID"%in%names(f1)||!"EntrezGene.ID"%in%names(f2))
 stop("Source missing exact EntrezGene.ID mapping.")
id1<-clean_ids(f1[["EntrezGene.ID"]])
id2<-clean_ids(f2[["EntrezGene.ID"]])
shared<-sort(intersect(unique(stats::na.omit(id1)),unique(stats::na.omit(id2))))
if(length(shared)<5000L)stop("Too few unambiguous Entrez gene IDs across platforms.")
# No labels are involved in gene overlap or multiple-probe aggregation.
cat("CROSS PLATFORM MAPPING AUDIT: unique mapped MAINZ=",
 length(unique(stats::na.omit(id1)))," NKI=",
 length(unique(stats::na.omit(id2)))," shared=",length(shared),
 " MAINZ unmapped probes=",sum(is.na(id1))," NKI unmapped probes=",
 sum(is.na(id2)),"\n",sep="")
aggregate_gene_median<-function(eset,ids,genes){
 expr<-Biobase::exprs(eset)
 if(anyDuplicated(colnames(expr)))stop("Duplicate biological sample ID within study.")
 if(any(!is.finite(expr)))stop("Source contains nonfinite expression; explicit missingness policy required.")
 keep<-which(!is.na(ids)&ids%in%genes)
 groups<-split(keep,factor(ids[keep],levels=genes))
 if(length(groups)!=length(genes)||any(lengths(groups)==0L))
   stop("Exact gene mapping unexpectedly incomplete.")
 n<-ncol(expr)
 x<-vapply(groups,function(ii){
   if(length(ii)==1L)return(as.numeric(expr[ii,]))
   apply(expr[ii,,drop=FALSE],2L,stats::median)
 },numeric(n))
 x<-t(x)
 rownames(x)<-genes
 colnames(x)<-colnames(expr)
 if(!identical(dim(x),c(length(genes),n)))stop("Gene-median matrix dimension mismatch.")
 list(matrix=x,probes_per_gene=lengths(groups))
}
m<-aggregate_gene_median(mainz,id1,shared)
n<-aggregate_gene_median(nki,id2,shared)
if(!identical(rownames(m$matrix),rownames(n$matrix)))
 stop("Platform maps do not share identical gene ordering.")
# This scale-free transformation is defined a priori. It uses each sample's
# own values over a fixed gene panel, without any cohort- or label-dependent
# normalization. The biology may not transfer between different technologies:
# this benchmark measures that failure or success without choosing after scoring.
rank_per_patient<-function(mat){
 s<-apply(mat,2L,function(col){
   as.numeric(rank(col,ties.method="average"))/length(col)
 })
 dimnames(s)<-dimnames(mat)
 s
}
mat_m_rank<-rank_per_patient(m$matrix)
mat_n_rank<-rank_per_patient(n$matrix)
stopifnot(identical(dim(mat_m_rank),dim(m$matrix)),
          identical(dim(mat_n_rank),dim(n$matrix)))
decode_er<-function(eset,where){
 p<-Biobase::pData(eset)
 if(!"er"%in%names(p))stop(paste("ER phenotype missing in",where))
 x<-trimws(tolower(as.character(p$er)))
 if(any(!is.na(x)&!x%in%c("0","1","na","n/a","")))
  stop(paste("Unexpected ER labels in",where,":",paste(unique(x),collapse=",")))
 y<-rep(NA_character_,length(x))
 y[x=="1"]<-"ER_positive";y[x=="0"]<-"ER_negative"
 y
}
er_m<-decode_er(mainz,"MAINZ");er_n<-decode_er(nki,"NKI")
train_ix<-which(!is.na(er_m));test_ix<-which(!is.na(er_n))
if(length(train_ix)<150L||length(test_ix)<250L||
   any(table(factor(er_m[train_ix],levels=c("ER_negative","ER_positive")))<20L)||
   any(table(factor(er_n[test_ix],levels=c("ER_negative","ER_positive")))<20L))
 stop("Insufficient independent clinical ER class counts.")
# Check published source sample keys, but never assume that different IDs
# guarantee different patients. Clinical membership cannot be established
# from anonymized public expression matrices alone.
overlap_ids<-intersect(colnames(Biobase::exprs(mainz))[train_ix],
                       colnames(Biobase::exprs(nki))[test_ix])
if(length(overlap_ids))stop("Raw sample IDs overlap between the studies.")
# Agilent two-channel and Affymetrix one-channel expression profiles are
# different measurements; any correlation-based duplicate check is weak.
# Flag only near identity; do not claim confirmed nonoverlap.
center_cols<-function(x){
 z<-sweep(x,2L,colMeans(x),"-")
 sweep(z,2L,sqrt(colSums(z*z)),"/")
}
a<-center_cols(mat_m_rank[,train_ix,drop=FALSE])
b<-center_cols(mat_n_rank[,test_ix,drop=FALSE])
corr<-crossprod(a,b)
if(any(!is.finite(corr)))stop("Nonfinite cross-platform profile comparison.")
maxcorr<-max(corr)
suspect<-sum(corr>=0.9999)
if(suspect>0L)stop("Suspicious near-identical expression profiles across the two studies.")
cat(sprintf("CROSS PLATFORM SAMPLE CHECK: named overlaps=%d; max rank-profile correlation=%.5f; pairs >=0.9999=%d\n",
 length(overlap_ids),maxcorr,suspect))
# We always export the same prespecified gene panel in the same order.
# Sensitivity arm uses unmodified aggregated gene measurements and must
# be described as a predeclared (possibly nonportable) control.
write_arm<-function(tag,train_mat,test_mat,outdir){
 path<-file.path(outdir,tag)
 dir.create(path,recursive=TRUE,showWarnings=FALSE)
 encode<-function(mat,ix,labels,prefix,include_outcome){
  lapply(ix,function(k){
   row<-list(id=sprintf("%s_%03d",prefix,k),
             values=unname(as.numeric(mat[,k])))
   if(include_outcome)row$outcome<-labels[[k]]
   row
  })
 }
 input<-list(features=shared,rows=encode(train_mat,train_ix,er_m,"MAINZ",TRUE))
 evaluation<-list(features=shared,rows=encode(test_mat,test_ix,er_n,"NKI",FALSE))
 if(any(vapply(evaluation$rows,function(x)"outcome"%in%names(x),logical(1))))
  stop("Labels leaked into NKI scoring input.")
 jsonlite::write_json(input,file.path(path,"train.json"),
  auto_unbox=TRUE,na="null",digits=9L)
 jsonlite::write_json(evaluation,file.path(path,"test-unlabelled.json"),
  auto_unbox=TRUE,na="null",digits=9L)
 path
}
dest<-args[[3L]]
write_arm("primary_rank",mat_m_rank,mat_n_rank,dest)
write_arm("sensitivity_raw",m$matrix,n$matrix,dest)
truth<-data.frame(subject_id=sprintf("NKI_%03d",test_ix),
                  outcome=er_n[test_ix],stringsAsFactors=FALSE)
utils::write.csv(truth,file.path(dest,"external-truth.csv"),
                 row.names=FALSE,quote=FALSE)
manifest<-list(
 source_mainz="bioconductor-source/breastCancerMAINZ@63e11105cb8a7c854264e9a13f8c926b39f20ab0",
 source_nki="bioconductor-source/breastCancerNKI@94e197403d6adaeae613cdc95997ac6ac5b5a88e",
 source_mainz_probe_count=length(id1),
 source_nki_probe_count=length(id2),
 source_mainz_annotated_entrez_ids=length(unique(stats::na.omit(id1))),
 source_nki_annotated_entrez_ids=length(unique(stats::na.omit(id2))),
 source_mainz_unmapped_probe_count=sum(is.na(id1)),
 source_nki_unmapped_probe_count=sum(is.na(id2)),
 common_gene_count=length(shared),
 genes_with_multiple_mainz_probes=sum(m$probes_per_gene>1L),
 genes_with_multiple_nki_probes=sum(n$probes_per_gene>1L),
 annotation_contract="Only one exact positive numeric EntrezGene.ID per probe; ambiguous/multi-assigned or missing identifiers omitted; all remaining shared genes included",
 duplicate_probe_contract="Median of all probes assigned to each unique Entrez gene within each sample, no outcome-based optimization",
 mainz_n=length(train_ix),nki_n=length(test_ix),
 mainz_er_counts=as.list(table(er_m[train_ix])),
 nki_er_counts=as.list(table(er_n[test_ix])),
 raw_sample_id_overlap=length(overlap_ids),
 maximum_rank_profile_correlation=maxcorr,
 suspicious_profile_pairs=suspect,
 primary="primary_rank",
 primary_transform="Each sample independently percentile-ranks its aggregated genes within the same common gene universe: rank/nGenes. No fitted target-cohort normalization.",
 sensitivity="sensitivity_raw",
 sensitivity_transform="Original source-preprocessed Affymetrix and Agilent expression measurements after exact gene mapping, without cross-platform numerical alignment.",
 sample_independence="Distinct published studies, no matching source IDs or near-identical rank profiles, anonymous patient duplication cannot be conclusively excluded",
 labeling="0 -> ER_negative; 1 -> ER_positive in both Bioconductor clinical tables",
 target_outcome_blinding="No NKI outcome included in the JS scoring inputs; R evaluator reads external-truth.csv separately",
 evidence_limit="Cross-study cross-platform research benchmark. Upstream source preprocessing, assay contrasts, biological case mix and ER labelling differ, so clinical performance cannot be certified.",
 clinical_validation=FALSE
)
jsonlite::write_json(manifest,file.path(dest,"source-contract.json"),
 auto_unbox=TRUE,pretty=TRUE,na="null",null="null")
cat(sprintf("CROSS PLATFORM EXPORT PASS: MAINZ=%d, NKI=%d, common Entrez genes=%d, raw and rank arms exported\n",
 length(train_ix),length(test_ix),length(shared)))
