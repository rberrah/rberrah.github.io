# Conservative, instrument-agnostic quantitative MS QA.
# Summarises predeclared sample types and raw peak areas without imputing
# censored signals, removing unknown features or making pathway claims.
ms_quantitative_assurance <- function(intensities, manifest,
  qc_rsd_threshold=.30, blank_fraction_threshold=.20,
  max_missing_fraction=.20, imbalance_threshold=.30) {
  x <- as.matrix(intensities)
  meta <- as.data.frame(manifest,stringsAsFactors=FALSE)
  needed <- c("assay_id","sample_type","condition","injection_order")
  thresholds <- c(qc_rsd_threshold,blank_fraction_threshold,
                  max_missing_fraction,imbalance_threshold)
  if(!is.numeric(x)||!nrow(x)||ncol(x)<2L||
     is.null(rownames(x))||is.null(colnames(x))||
     anyNA(rownames(x))||anyNA(colnames(x))||
     anyDuplicated(rownames(x))||anyDuplicated(colnames(x))||
     any(!nzchar(rownames(x)))||any(!nzchar(colnames(x)))||
     any(is.infinite(x))||any(x<0,na.rm=TRUE)||
     any(!needed%in%names(meta))||
     anyNA(meta[,needed])||anyDuplicated(meta$assay_id)||
     !identical(as.character(meta$assay_id),rownames(x))||
     any(!is.finite(thresholds))||
     any(thresholds<0)||any(thresholds>1))
    stop("MS QC needs aligned unique raw peak-area assays, known sample roles and valid thresholds.")
  roles <- tolower(trimws(as.character(meta$sample_type)))
  allowed <- c("biological","pooled_qc","blank")
  if(any(!roles%in%allowed))
    stop("Unknown MS sample_type: explicit biological, pooled_qc or blank required.")
  biological <- which(roles=="biological")
  qc <- which(roles=="pooled_qc")
  blanks <- which(roles=="blank")
  if(length(biological)<4L)stop("At least four biological assays required for descriptive MS QA.")
  groups <- trimws(as.character(meta$condition[biological]))
  if(any(!nzchar(groups)))stop("Biological samples lack group declaration.")
  order <- suppressWarnings(as.numeric(meta$injection_order))
  if(any(!is.finite(order)) || anyDuplicated(order))
    stop("Unique finite injection orders are needed for drift review.")
  tested <- x[biological,,drop=FALSE]
  missing <- colMeans(is.na(tested))
  qc_rsd <- rep(NA_real_,ncol(x))
  if(length(qc)>=3L){
    qc_rsd <- apply(x[qc,,drop=FALSE],2L,function(z){
      z <- z[is.finite(z)]
      if(length(z)<3L||mean(z)<=0) return(NA_real_)
      stats::sd(z)/mean(z)
    })
  }
  blank_fraction <- rep(NA_real_,ncol(x))
  if(length(blanks)>=2L) {
    numerator <- apply(x[blanks,,drop=FALSE],2L,function(z)
      if(any(is.finite(z)))stats::median(z,na.rm=TRUE)else NA_real_)
    denominator <- apply(tested,2L,function(z)
      if(any(is.finite(z)))stats::median(z,na.rm=TRUE)else NA_real_)
    blank_fraction <- ifelse(is.finite(denominator)&denominator>0,
      numerator/denominator,NA_real_)
  }
  strata <- sort(unique(groups))
  diff_missing <- rep(NA_real_,ncol(x))
  if(length(strata)==2L){
    rates <- vapply(strata,function(g)
      colMeans(is.na(tested[groups==g,,drop=FALSE])),numeric(ncol(x)))
    diff_missing <- abs(rates[,1L]-rates[,2L])
  }
  drift <- rep(NA_real_,ncol(x))
  # Spearman correlation is a SCREEN, not a validated drift correction.
  if(length(qc)>=5L)for(j in seq_len(ncol(x))){
    v <- x[qc,j]
    ok <- is.finite(v)
    if(sum(ok)>=5L && stats::sd(v[ok])>0)
      drift[[j]] <- suppressWarnings(stats::cor(order[qc][ok],v[ok],
                                                   method="spearman"))
  }
  table <- data.frame(feature_id=colnames(x),
    biological_missing_fraction=missing,
    pooled_qc_rsd=qc_rsd,
    blank_over_biological_ratio=blank_fraction,
    missingness_group_difference=diff_missing,
    pooled_qc_order_spearman=drift,
    flag_missing=missing>max_missing_fraction,
    flag_qc_variation=is.finite(qc_rsd)&qc_rsd>qc_rsd_threshold,
    flag_blank_signal=is.finite(blank_fraction)&
      blank_fraction>=blank_fraction_threshold,
    flag_group_missingness=is.finite(diff_missing)&
      diff_missing>=imbalance_threshold,
    stringsAsFactors=FALSE)
  coverage <- list(
    biological_assays=length(biological),
    pooled_qc_assays=length(qc),
    blank_assays=length(blanks),
    declared_groups=as.list(table(groups)),
    biological_missingness_evaluable=TRUE,
    pooled_qc_precision_evaluable=length(qc)>=3L,
    blank_background_evaluable=length(blanks)>=2L,
    pooled_qc_drift_screen_evaluable=length(qc)>=5L,
    missingness_group_imbalance_evaluable=length(strata)==2L)
  alerts <- character()
  if(!coverage$pooled_qc_precision_evaluable)
    alerts <- c(alerts,"pooled_qc_not_sufficient_for_rsd")
  if(!coverage$blank_background_evaluable)
    alerts <- c(alerts,"blanks_not_sufficient_for_background")
  if(!coverage$pooled_qc_drift_screen_evaluable)
    alerts <- c(alerts,"pooled_qc_not_sufficient_for_drift")
  if(!coverage$missingness_group_imbalance_evaluable)
    alerts <- c(alerts,"exactly_two_biological_groups_needed_for_missingness_comparison")
  for(flag in c("flag_missing","flag_qc_variation","flag_blank_signal",
                "flag_group_missingness")){
    if(any(table[[flag]]))
      alerts <- c(alerts,paste0(flag,"_",sum(table[[flag]])))
  }
  list(
    status=if(length(alerts))"scientific_review_required" else
      "measured_QC_screens_pass_not_certified",
    coverage=coverage,features=table,
    alerts=alerts,
    parameters=list(qc_rsd_threshold=qc_rsd_threshold,
      blank_fraction_threshold=blank_fraction_threshold,
      max_missing_fraction=max_missing_fraction,
      imbalance_threshold=imbalance_threshold),
    feature_exclusions_automatically_applied=FALSE,
    mnar_diagnosis_possible_from_this_table=FALSE,
    pathway_or_compound_identity_certified=FALSE,
    scientific_certified=FALSE,
    limitation=paste("Peak-area QC is descriptive; zero and NA differ;",
      "an absence of group missingness imbalance does not rule out MNAR.",
      "No drift correction or biological feature exclusion is selected after seeing p-values.")
  )
}
