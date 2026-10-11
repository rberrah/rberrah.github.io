#!/usr/bin/env Rscript
# Fit a ONE-PARAMETER offset calibration on TRANSBIG labels ONLY.
# NKI outcomes are not opened. NKI frozen model scores are held constant,
# and a single additive log-odds intercept is applied afterwards.
args<-commandArgs(trailingOnly=TRUE)
if(length(args)!=1L)
 stop("Usage: Rscript scripts/fit_transbig_calibration_pmx.R outdir")
out<-args[[1L]]
if(!requireNamespace("jsonlite",quietly=TRUE))stop("jsonlite required")
contract<-jsonlite::read_json(file.path(out,"transbig-calibration-contract.json"),simplifyVector=TRUE)
if(contract$calibration_parameters_to_fit!=1L ||
   contract$eligible_calibration_participants<150L)
 stop("Calibration experiment must use a separate sufficient cohort and one parameter.")
truth<-utils::read.csv(file.path(out,"transbig-calibration-truth.csv"),
                      stringsAsFactors=FALSE)
if(nrow(truth)!=contract$eligible_calibration_participants ||
   anyDuplicated(truth$subject_id)||anyNA(truth$subject_id)||
   !identical(sort(unique(truth$outcome)),sort(c("ER_positive","ER_negative"))))
 stop("Invalid TRANSBIG calibration labels.")
clip_for_logit<-function(x)stats::qlogis(pmax(1e-6,pmin(1-1e-6,x)))
fit_intercept<-function(y,p){
  logit<-clip_for_logit(p)
  objective<-function(a)mean(stats::plogis(logit+a))-mean(y)
  left<-objective(-40)
  right<-objective(40)
  if(!is.finite(left)||!is.finite(right)||left>=0||right<=0)
    stop("Cannot reliably fit independent calibration intercept.")
  root<-stats::uniroot(objective,interval=c(-40,40),tol=1e-12)$root
  if(!is.finite(root))stop("Invalid learned calibration intercept.")
  root
}
for(arm in c("primary_rank","sensitivity_raw")){
  path<-file.path(out,arm)
  cal<-read.csv(file.path(path,"transbig-calibration-frozen-scores.csv"),
      stringsAsFactors=FALSE)
  nki<-read.csv(file.path(path,"external-predictions.csv"),
      stringsAsFactors=FALSE)
  if(nrow(cal)!=nrow(truth)||anyDuplicated(cal$subject_id)||
     !setequal(cal$subject_id,truth$subject_id)||
     nrow(nki)!=337L||anyDuplicated(nki$subject_id)||
     any(cal$subject_id%in%nki$subject_id))
    stop("Calibration/test study identity contract is violated.")
  if(any(!is.finite(cal$prediction)) ||
     any(cal$prediction<0|cal$prediction>1) ||
     any(!is.finite(nki$prediction)) ||
     any(nki$prediction<0|nki$prediction>1))
    stop("Frozen source probabilities invalid; no repair permitted.")
  dataset<-merge(truth,cal,by="subject_id",sort=FALSE)
  yy<-as.integer(dataset$outcome=="ER_positive")
  a<-fit_intercept(yy,dataset$prediction)
  predicted_cal<-stats::plogis(clip_for_logit(dataset$prediction)+a)
  if(abs(mean(predicted_cal)-mean(yy))>1e-8)
    stop("Intercept-only calibrator did not satisfy observed TRANSBIG prevalence.")
  nki_calibrated<-stats::plogis(clip_for_logit(nki$prediction)+a)
  if(any(!is.finite(nki_calibrated))||any(nki_calibrated<0|nki_calibrated>1))
    stop("Invalid frozen NKI calibrated predictions.")
  # Exact replay: no NKI labels ever used and no model refitting on NKI.
  holdout<-data.frame(subject_id=nki$subject_id,prediction=nki_calibrated)
  utils::write.csv(holdout,file.path(path,"nki-frozen-transbig-calibrated-scores.csv"),
   quote=FALSE,row.names=FALSE)
  score_model<-list(
    method="ONE PARAMETER logistic intercept-only calibration, slope fixed at 1",
    intercept=a,slope_fixed=1L,fit_cohort="TRANSBIG",fit_n=nrow(dataset),
    fit_er_positive_count=sum(yy),score_cohort="NKI",score_n=nrow(nki),
    prediction_input="Native MAINZ-only frozen model scores",
    calibration_did_not_touch_feature_or_ridge_parameters=TRUE,
    input_clip_for_logit=1e-6,
    transbig_original_brier=mean((dataset$prediction-yy)^2),
    transbig_in_sample_calibrated_brier=mean((predicted_cal-yy)^2),
    nki_labels_ever_opened_in_calibration=FALSE,
    interpretation="RETROSPECTIVE development; source NKI labels were previously evaluated in PR40, so this is NOT a new prospective evaluation.",
    clinical_certification=FALSE
  )
  jsonlite::write_json(score_model,file.path(path,"transbig-only-calibrator.json"),
     pretty=TRUE,auto_unbox=TRUE,na="null")
  cat(sprintf("INDEPENDENT COHORT CALIBRATOR FIT PASS: arm=%s TRANSBIG=%d intercept=%.6f NKI=frozen337\n",
       arm,nrow(dataset),a))
}
