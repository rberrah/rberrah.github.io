#!/usr/bin/env Rscript
# Authentic Bioconductor R1 calibration matrix, not a claim of universal FDR
# control. Four predeclared study-design cells × 100 independent datasets;
# null and mixed-truth negative-binomial data, balanced/unbalanced groups.
# Scientific truth is used for independent POST-FIT assessment, never fed into
# the reference package other than the simulated group labels required by fit.
# Every replicate is reported including non-significant negative results.
source("multiomics-engine/advanced_methods.R")
packages<-c("DESeq2","edgeR","limma","statmod","jsonlite")
for(pkg in packages)
  if(!requireNamespace(pkg,quietly=TRUE))
    stop("Reference Bioconductor R1 simulation missing package: ",pkg)
repetitions<-as.integer(Sys.getenv("MULTIOMICS_RNASEQ_REPS","100"))
if(length(repetitions)!=1L||is.na(repetitions)||repetitions<30L||
   repetitions>1000L)
  stop("R1 number of Monte Carlo replicates must be in 30..1000")
out<-Sys.getenv("MULTIOMICS_VALIDATION_OUTPUT","")
if(!nzchar(out))out<-tempfile("rnaseq_r1_evidence_")
dir.create(out,recursive=TRUE,showWarnings=FALSE)

n_features<-400L
n_subjects<-40L
genes<-sprintf("ENSG_SIM_%04d",seq_len(n_features))
ids<-sprintf("BIO_%03d",seq_len(n_subjects))
q_threshold<-0.05
cases<-list(
  global_null_balanced=list(mixed=FALSE,unbalanced=FALSE),
  global_null_unbalanced=list(mixed=FALSE,unbalanced=TRUE),
  mixed_truth_balanced=list(mixed=TRUE,unbalanced=FALSE),
  mixed_truth_unbalanced=list(mixed=TRUE,unbalanced=TRUE)
)
methods<-list(
  DESeq2=list(q="padj",p="pvalue",effect="log2FoldChange"),
  edgeR_QL=list(q="FDR",p="PValue",effect="logFC"),
  limma_voom=list(q="adj.P.Val",p="P.Value",effect="logFC")
)
signal_effects<-c(rep(1.2,14L),rep(-1.2,14L),rep(0.65,12L),
                  rep(0,n_features-40L))
stopifnot(length(signal_effects)==n_features)

make_counts<-function(case,seed) {
  set.seed(seed)
  n_control<-if(isTRUE(case$unbalanced))12L else 20L
  condition<-factor(c(rep("control",n_control),
                      rep("treated",n_subjects-n_control)),
                    levels=c("control","treated"))
  batch<-if(isTRUE(case$unbalanced)) {
    factor(c(rep("B1",9L),rep("B2",3L),
             rep("B1",12L),rep("B2",16L)),levels=c("B1","B2"))
  } else factor(rep(c("B1","B2"),times=n_subjects/2L),
                levels=c("B1","B2"))
  meta<-data.frame(subject_id=ids,condition=condition,batch=batch,
                   row.names=ids,stringsAsFactors=FALSE)
  # Independent of phenotype, varying library sizes and dispersions.
  baselines<-exp(stats::runif(n_features,log(45),log(300)))
  dispersions<-stats::runif(n_features,0.08,0.32)
  size_factors<-exp(stats::rnorm(n_subjects,0,0.22))
  batch_coeff<-log(1.35)
  truth<-if(isTRUE(case$mixed))signal_effects else rep(0,n_features)
  counts<-vapply(seq_len(n_subjects),function(i){
    mu<-baselines*size_factors[[i]]*
       exp(batch_coeff*(as.character(batch[i])=="B2"))*
       2^(truth*(as.character(condition[i])=="treated"))
    stats::rnbinom(n_features,mu=mu,size=1/dispersions)
  },numeric(n_features))
  rownames(counts)<-genes
  colnames(counts)<-ids
  list(counts=t(counts),meta=meta,truth=truth,seed=seed)
}

evaluate_method<-function(tab,spec,truth,cell,rep,method) {
  if(!is.data.frame(tab)||!all(c("feature",spec$q,spec$p,spec$effect)%in%
      colnames(tab))||anyDuplicated(tab$feature)||
     anyNA(tab$feature)||!all(tab$feature%in%genes))
    stop(paste("Invalid R1 reference result feature/column schema:",method))
  original<-match(genes,tab$feature)
  qq<-rep(NA_real_,n_features)
  pp<-rep(NA_real_,n_features)
  est<-rep(NA_real_,n_features)
  available<-which(!is.na(original))
  qq[available]<-as.numeric(tab[[spec$q]][original[available]])
  pp[available]<-as.numeric(tab[[spec$p]][original[available]])
  est[available]<-as.numeric(tab[[spec$effect]][original[available]])
  if(!length(available)||any(is.finite(qq)&(qq<0|qq>1))||
     any(is.finite(pp)&(pp<0|pp>1))||
     any(!is.na(qq)&!is.finite(qq))||
     any(!is.na(pp)&!is.finite(pp))||
     any(is.finite(qq)&!is.finite(pp)))
    stop(paste("Invalid p/q output:",cell,rep,method))
  significant<-is.finite(qq)&qq<=q_threshold
  actual_signal<-truth!=0
  false_calls<-sum(significant&!actual_signal)
  true_calls<-sum(significant&actual_signal)
  total_calls<-sum(significant)
  recovered<-which(significant&actual_signal&is.finite(est))
  data.frame(
    scenario=cell,replicate=rep,method=method,
    seed=as.integer(20261011L+match(cell,names(cases))*100000L+rep),
    mixed_truth=any(actual_signal),n_subjects=n_subjects,
    n_features=n_features,n_signal=sum(actual_signal),
    fitted_features=nrow(tab),tested_finite_q=sum(is.finite(qq)),
    discoveries=total_calls,real_true_discoveries=true_calls,
    false_discoveries=false_calls,
    false_discovery_proportion=false_calls/max(1L,total_calls),
    any_false_discovery=as.integer(false_calls>0L),
    power=if(any(actual_signal))true_calls/sum(actual_signal) else NA_real_,
    estimated_log2fc_mae_recovered=if(length(recovered))
       mean(abs(est[recovered]-truth[recovered])) else NA_real_,
    error_type="known_simulation_truth",stringsAsFactors=FALSE
  )
}

bootstrap_interval<-function(x,seed) {
  x<-x[is.finite(x)]
  if(length(x)<30L)return(c(lower=NA_real_,upper=NA_real_))
  set.seed(as.integer(seed))
  boots<-replicate(1000L,mean(sample(x,length(x),replace=TRUE)))
  as.numeric(stats::quantile(boots,probs=c(.025,.975),names=FALSE))
}
summarise_cell<-function(part) {
  nr<-nrow(part)
  mean_fdr<-mean(part$false_discovery_proportion)
  ci<-bootstrap_interval(part$false_discovery_proportion,
    99500L+sum(utf8ToInt(part$scenario[[1L]]))+
      sum(utf8ToInt(part$method[[1L]])))
  coverage<-if(all(is.na(part$power)))c(NA_real_,NA_real_) else
    bootstrap_interval(part$power,123441L+
      sum(utf8ToInt(part$method[[1L]])))
  data.frame(
    scenario=part$scenario[[1L]],method=part$method[[1L]],
    independent_datasets=nr,nominal_fdr=q_threshold,
    empirical_fdr=mean_fdr,
    fdr_mc_standard_error=stats::sd(part$false_discovery_proportion)/sqrt(nr),
    bootstrap_95_fdr_low=ci[[1L]],bootstrap_95_fdr_high=ci[[2L]],
    probability_of_any_false_call=mean(part$any_false_discovery),
    mean_number_false_calls=mean(part$false_discoveries),
    mean_number_discoveries=mean(part$discoveries),
    empirical_power=if(all(is.na(part$power)))NA_real_ else mean(part$power),
    bootstrap_95_power_low=coverage[[1L]],
    bootstrap_95_power_high=coverage[[2L]],
    negative_results_included=TRUE,
    confirmatory_certification=FALSE,stringsAsFactors=FALSE
  )
}

recs<-vector("list",length(cases)*repetitions*length(methods))
index<-0L
for(cidx in seq_along(cases)) {
  cell<-names(cases)[[cidx]]
  spec<-cases[[cidx]]
  for(rep in seq_len(repetitions)) {
    seed<-as.integer(20261011L+cidx*100000L+rep)
    input<-make_counts(spec,seed)
    work<-tempfile(paste0("r1_",cell,"_",rep,"_"))
    dir.create(work)
    fits<-tryCatch({
      d<-run_deseq2_counts(input$counts,input$meta,file.path(work,"d"),
        design_formula=~batch+condition,
        contrast=c("condition","treated","control"))
      e<-run_edger_ql_counts(input$counts,input$meta,file.path(work,"e"),
        design_formula=~batch+condition,coefficient="conditiontreated")
      v<-run_voom_counts(input$counts,input$meta,file.path(work,"v"),
        design_formula=~batch+condition,coefficient="conditiontreated")
      list(DESeq2=d$results,edgeR_QL=e$results,limma_voom=v$results)
    },finally=unlink(work,recursive=TRUE,force=TRUE))
    for(method in names(methods)) {
      index<-index+1L
      recs[[index]]<-evaluate_method(fits[[method]],methods[[method]],
        input$truth,cell,rep,method)
    }
    if(rep%%20L==0L)
      cat(sprintf("R1 CALIBRATION progress case=%s %d/%d datasets; 3 authentic R fits/dataset\n",
                  cell,rep,repetitions))
  }
  # Preserve every completed cell even if a later cell aborts: failed or
  # adverse scientific findings must not disappear with the CI exception.
  utils::write.csv(do.call(rbind,recs[seq_len(index)]),
    file.path(out,"r1_rnaseq_calibration_completed_cells_partial.csv"),
    row.names=FALSE)
}
rows<-do.call(rbind,recs)
stopifnot(nrow(rows)==length(cases)*repetitions*length(methods),
 all(vapply(split(rows,paste(rows$scenario,rows$method,sep="/")),
   nrow,integer(1L))==repetitions))
parts<-split(rows,paste(rows$scenario,rows$method,sep="/"))
summary<-do.call(rbind,lapply(parts,summarise_cell))
rownames(summary)<-NULL
write.csv(rows,file.path(out,"r1_rnaseq_calibration_per_dataset.csv"),row.names=FALSE)
write.csv(summary,file.path(out,"r1_rnaseq_calibration_scenario_summary.csv"),row.names=FALSE)
manifest<-list(
  benchmark="RNAseq R1 genuine Bioconductor count-model calibration matrix",
  q_threshold=q_threshold,
  scenarios=names(cases),replicates_per_scenario=repetitions,
  independent_dataset_count=length(cases)*repetitions,
  authentic_fits=length(cases)*repetitions*length(methods),
  features=n_features,subjects=n_subjects,
  planted_mixed_truth_effects=as.list(signal_effects[1:40]),
  generator="NB gene-specific dispersion, variable library size, nonconfounded measured batch",
  methods=names(methods), versions=lapply(packages,function(z)
     as.character(utils::packageVersion(z))),
  training_and_truth="Group labels supplied for differential modelling; planted truth never used for fitting or selection",
  interpretation="Finite Monte Carlo evidence on specified synthetic designs only; post-hoc methodological benchmark, not proof of nominal FDR control for all distributions, biological validity, or an independent external cohort.",
  clinical_certification=FALSE, universal_validation=FALSE
)
names(manifest$versions)<-packages
jsonlite::write_json(manifest,file.path(out,"r1_rnaseq_calibration_manifest.json"),
  pretty=TRUE,auto_unbox=TRUE)
for(i in seq_len(nrow(summary))){
  z<-summary[i,,drop=FALSE]
  cat(sprintf("R1 %s %s: FDR=%.4f [%.4f, %.4f] MCSE=%.4f power=%s, %d independent datasets\n",
    z$scenario,z$method,z$empirical_fdr,z$bootstrap_95_fdr_low,
    z$bootstrap_95_fdr_high,z$fdr_mc_standard_error,
    if(is.finite(z$empirical_power))sprintf("%.3f",z$empirical_power) else "not-applicable",
    z$independent_datasets))
}
# Regression guard is deliberately LOOSE and detects only gross inflation:
# CI PASS IS NOT A CLAIM THAT FDR IS <= 0.05 OR NOMINALLY CONTROLLED.
if(any(!is.finite(summary$empirical_fdr))||
   any(summary$empirical_fdr>0.30))
  stop("R1 reference model gross simulated FDR inflation; inspect ALL negative evidence")
cat("R1 REAL BIOCONDUCTOR MATRIX EXECUTED: evidence preserved, NO NOMINAL FDR OR UNIVERSAL CONFIRMATORY CERTIFICATE\n")
