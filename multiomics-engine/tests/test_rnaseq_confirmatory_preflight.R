#!/usr/bin/env Rscript
# Pure base-R R1 confirmatory-input contract. These tests deliberately do not
# require DESeq2; invalid studies must fail before any reference-package fit.
source("multiomics-engine/advanced_methods.R")

ids<-sprintf("S%02d",seq_len(12L))
features<-sprintf("ENSG%05d",seq_len(40L))
set.seed(20261011L)
counts<-matrix(sample(20:150,12L*40L,replace=TRUE),
 nrow=length(ids),dimnames=list(ids,features))
metadata<-data.frame(
 subject_id=paste0("P",seq_along(ids)),
 condition=factor(rep(c("control","treated"),each=6L),
   levels=c("control","treated")),
 batch=factor(rep(c("B1","B2"),times=6L)),
 age=seq(25,58,length.out=12),
 row.names=ids,stringsAsFactors=FALSE)
formula<-~batch+condition
contrast<-c("condition","treated","control")
audit<-rnaseq_confirmatory_preflight(counts,metadata,formula,contrast)
stopifnot(identical(audit$status,"eligible_for_reference_fitting_only"),
 audit$cohort_samples==12L,audit$measured_features==40L,
 audit$independent_subjects==12L,audit$residual_df==9L,
 identical(names(audit$group_sizes),c("control","treated")),
 !audit$certified,audit$rejected_silent_subject_loss,
 !audit$missing_or_unverified_batch)
# Valid order mismatch must be matched BY SAMPLE ID, not by source row order.
reordered<-metadata[12:1,,drop=FALSE]
again<-rnaseq_confirmatory_preflight(counts,reordered,formula,contrast)
stopifnot(identical(audit$group_sizes,again$group_sizes),
          identical(audit$residual_df,again$residual_df))

reject<-function(x=counts,m=metadata,f=formula,c=contrast) {
  inherits(try(rnaseq_confirmatory_preflight(x,m,f,c),silent=TRUE),"try-error")
}
bad<-counts;colnames(bad)[2L]<-colnames(bad)[1L]
stopifnot(reject(x=bad))
bad<-counts;rownames(bad)[2L]<-rownames(bad)[1L]
stopifnot(reject(x=bad))
bad<-counts;bad[1L,1L]<-NA_real_
stopifnot(reject(x=bad))
bad<-counts;bad[1L,1L]<--2
stopifnot(reject(x=bad))
bad<-counts;bad[1L,1L]<-bad[1L,1L]+0.25
stopifnot(reject(x=bad))
bad<-counts;bad[1L,]<-0
stopifnot(reject(x=bad))
stopifnot(reject(x=counts[,1:9,drop=FALSE]))

missing<-metadata[-1L,,drop=FALSE]
stopifnot(reject(m=missing))
extra<-rbind(metadata,data.frame(
 subject_id="P13",condition=factor("control",levels=levels(metadata$condition)),
 batch=factor("B1",levels=levels(metadata$batch)),
 age=42,row.names="S13"))
stopifnot(reject(m=extra))
bad<-metadata;bad$subject_id[[2L]]<-bad$subject_id[[1L]]
stopifnot(reject(m=bad))
bad<-metadata;bad$subject_id[[2L]]<-""
stopifnot(reject(m=bad))
bad<-metadata;bad$condition[1:4]<-"treated"
stopifnot(reject(m=bad)) # only 2 biological controls remain
bad<-metadata;bad$condition<-factor(rep("treated",12L))
stopifnot(reject(m=bad))
bad<-metadata;bad$batch<-factor(as.character(bad$condition))
stopifnot(reject(m=bad)) # completely confounded batch and condition
bad<-metadata;bad$batch[[1L]]<-NA_character_
stopifnot(reject(m=bad))
bad<-metadata;bad$age[[1L]]<-NA_real_
stopifnot(reject(m=bad,f=~batch+age+condition))

stopifnot(reject(f=~condition)) # known varying batch omitted
stopifnot(reject(f=~0+batch+condition))
stopifnot(reject(f=~batch*condition))
stopifnot(reject(f=~batch+log(age)+condition))
stopifnot(reject(f=~batch+age)) # no explicit condition main effect
stopifnot(reject(c=c("condition","other","control")))
stopifnot(reject(c=c("condition","control","control")))
stopifnot(reject(c=NULL))
stopifnot(inherits(try(run_deseq2_counts(counts,missing,tempfile(),
 formula,contrast,confirmatory_contract=TRUE),silent=TRUE),"try-error"))
# Must not turn successful R1 eligibility into an automatic conclusion.
stopifnot(!isTRUE(audit$certified),length(audit$limitations)>=3L)
# Real CSV-to-R bridge must reject dropped/duplicated source assay rows
# BEFORE aggregation makes those failures invisible to DESeq2 preflight.
source("multiomics-engine/server.R")
assay_manifest<-data.frame(
 assay_id=ids,sample_id=ids,subject_id=metadata$subject_id,
 condition=as.character(metadata$condition),
 batch=as.character(metadata$batch),stringsAsFactors=FALSE)
stopifnot(identical(rnaseq_confirmatory_assay_integrity(counts,assay_manifest)$status,
  "assay_identifiers_exact"))
assay_bad<-assay_manifest[-1L,,drop=FALSE]
stopifnot(inherits(try(rnaseq_confirmatory_assay_integrity(
 counts,assay_bad),silent=TRUE),"try-error"))
stopifnot(inherits(try(rnaseq_confirmatory_assay_integrity(
 counts[-1L,,drop=FALSE],assay_manifest),silent=TRUE),"try-error"))
assay_bad<-assay_manifest
assay_bad$assay_id[[2L]]<-assay_bad$assay_id[[1L]]
stopifnot(inherits(try(rnaseq_confirmatory_assay_integrity(
 counts,assay_bad),silent=TRUE),"try-error"))
assay_bad<-assay_manifest
assay_bad$sample_id[[2L]]<-assay_bad$sample_id[[1L]]
assay_bad$subject_id[[2L]]<-"a-different-subject"
stopifnot(inherits(try(rnaseq_confirmatory_assay_integrity(
 counts,assay_bad),silent=TRUE),"try-error"))
assay_bad<-assay_manifest
assay_bad$sample_id[[2L]]<-assay_bad$sample_id[[1L]]
assay_bad$condition[[2L]]<-"treated"
stopifnot(inherits(try(rnaseq_confirmatory_assay_integrity(
 counts,assay_bad),silent=TRUE),"try-error"))
cat("R1 RNA-SEQ STRICT PREFLIGHT CONTRACT: PASS (scientific eligibility, no certification)\n")
