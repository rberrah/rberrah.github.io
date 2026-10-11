#!/usr/bin/env Rscript
# Actual MOFA2 / mofapy2 on paired, REAL public Nutrimouse omics.
# Nutrimouse RNA panel contains 120 AUTHOR-PRESELECTED genes of ~30k.
# Distinct genotype & diet are experimental biological factors, NOT batch.
# No measured technical batch labels are available: technical separation
# CANNOT be validated on this study. Preserve all negative findings.
#
# Fit: 2 prespecified random seeds; exact 40 paired animals, 3 latent factors.
# Exploratory post-fit audit: genotype conditional on diet, and diet
# conditional on genotype, 199 restricted null permutations, max over all
# factors (no selecting factor after seeing labels and quoting naïve p).
# Sensitivity: one MOFA2 fit with lipid-to-animal pairing deliberately broken.
# No factor is discarded for weak recovery; no superiority threshold.
args<-commandArgs(trailingOnly=TRUE)
if(length(args)!=2L)
 stop("Usage: Rscript multiomics-engine/tests/test_mofa_real_nutrimouse.R external/mixOmics output_dir")
source("multiomics-engine/advanced_methods.R")
source("multiomics-engine/mofa_real_metadata_audit.R")
if(!requireNamespace("MOFA2",quietly=TRUE)||
   !requireNamespace("jsonlite",quietly=TRUE))
 stop("This is a real MOFA2/mofapy2 benchmark: install reference packages.")
e<-new.env(parent=emptyenv())
load(file.path(args[[1L]],"data","nutrimouse.rda"),envir=e)
if(!exists("nutrimouse",envir=e,inherits=FALSE))
 stop("Immutable official Nutrimouse object not found")
study<-e$nutrimouse
if(!is.list(study)||!all(c("gene","lipid","genotype","diet")%in%names(study)))
 stop("Nutrimouse data schema changed: cannot interpret cohorts")
rna<-as.matrix(study$gene)
lipid<-as.matrix(study$lipid)
storage.mode(rna)<-"double"
storage.mode(lipid)<-"double"
if(!identical(dim(rna),c(40L,120L))||
   !identical(dim(lipid),c(40L,21L))||
   any(!is.finite(rna))||any(!is.finite(lipid))||
   is.null(colnames(rna))||is.null(colnames(lipid))||
   anyDuplicated(colnames(rna))||anyDuplicated(colnames(lipid)))
 stop("Original real Nutrimouse assays changed or have invalid features")
ids<-sprintf("NUTRIMOUSE_%03d",seq_len(40L))
rownames(rna)<-ids; rownames(lipid)<-ids
geno<-setNames(as.character(study$genotype),ids)
diet<-setNames(as.character(study$diet),ids)
if(length(geno)!=40L||length(diet)!=40L||
   anyNA(geno)||anyNA(diet)||
   length(unique(geno))!=2L||length(unique(diet))!=5L)
 stop("Nutrimouse biological experiment design changed")
design_check<-model.matrix(~factor(geno)+factor(diet))
if(qr(design_check)$rank!=ncol(design_check))
 stop("Genotype/diet are inseparable, no conditional association claims")
blocks<-list(transcriptomics=rna,lipidomics=lipid)
preflight<-mofa2_input_preflight(blocks,min_samples=32L)
if(!identical(preflight$status,"eligible_for_exploration")||
   preflight$nSharedSubjects!=40L)
 stop("Real MOFA2 pairing/preflight not eligible")
output<-args[[2L]]
dir.create(output,recursive=TRUE,showWarnings=FALSE)
seeds<-c(20261011L,20261012L)
records<-list()
score_sets<-list()
fit_and_audit<-function(experimental_blocks,seed,scenario){
  path<-file.path(output,paste0(scenario,"_seed_",seed))
  fit<-run_mofa2_blocks(
    experimental_blocks,path,factors=3L,seed=seed,
    convergence_mode="fast",min_samples=32L,
    max_features_per_block=NULL
  )
  if(!identical(fit$summary$matrixOrientation,
      "feature_rows_subject_columns_for_MOFA2")||
     !identical(fit$summary$implementationContract,
      "mofa2-feature-rows-sample-columns-v2")||
     !isTRUE(fit$summary$subjectIdentityPreserved)||
     fit$summary$samples!=40L)
    stop("Real MOFA2 changed biological sample identity or orientation")
  factor_df<-MOFA2::get_factors(fit$model,as.data.frame=TRUE)
  scores<-mofa_real_factor_matrix(factor_df,ids)
  audit<-mofa_real_metadata_audit(scores,geno,diet,
     n_permutations=199L,seed=20261011L)
  if(!all(c("genotype_given_diet","diet_given_genotype")%in%
          names(audit$empirical_p_max_across_factors)))
    stop("No genotype/diet conditional association audit available")
  # Simultaneous two biological endpoints, adjusted descriptively.
  bonferroni<-pmin(1,2*audit$empirical_p_max_across_factors)
  summary<-list(
    scenario=scenario,seed=seed,
    n_biological_animals=40L,
    effective_factors=ncol(scores),
    factor_names=colnames(scores),
    inputs_preselected_by_publication=TRUE,
    omic_count=2L,
    source_transcriptome_features=120L,
    source_lipid_features=21L,
    genotype_levels=as.list(table(geno)),
    diet_levels=as.list(table(diet)),
    max_conditional_r2=as.list(audit$observed_max_partial_r2),
    conditional_max_factor_empirical_p=as.list(audit$empirical_p_max_across_factors),
    two_endpoint_bonferroni_adjusted_p=as.list(bonferroni),
    permutation_count=audit$n_permutations,
    permutation_scope="Genotype permuted WITHIN diet, diet permuted WITHIN genotype, on fixed unsupervised factors, maximum over all factors for each test",
    model_backend="genuine Bioconductor MOFA2 via mofapy2 and HDF5, PMx run_mofa2_blocks",
    source_data_phenotypes_not_used_to_fit_mofa=TRUE,
    has_measured_technical_batch=FALSE,
    technical_batch_separation_validated=FALSE,
    interpretation="Exploratory retrospective biological associations, no proof of causation or cross-study reproducibility"
  )
  jsonlite::write_json(summary,file.path(path,"metadata_associations.json"),
    pretty=TRUE,auto_unbox=TRUE,na="null",digits=12L)
  utils::write.csv(audit$observed_partial_r2,
    file.path(path,"factor_conditional_partial_R2.csv"),row.names=TRUE)
  utils::write.csv(audit$null_max_partial_r2,
    file.path(path,"restricted_metadata_nulls.csv"),row.names=FALSE)
  utils::write.csv(scores,file.path(path,"ordered_animal_factor_scores.csv"),
    row.names=TRUE)
  cat(sprintf("REAL MOFA2 NUTRIMOUSE FIT PASS: scenario=%s seed=%d n=40 factors=%d maxR2_genotype_given_diet=%.4f maxR2_diet_given_genotype=%.4f p_genotype=%.4f p_diet=%.4f\n",
    scenario,seed,ncol(scores),
    audit$observed_max_partial_r2[["genotype_given_diet"]],
    audit$observed_max_partial_r2[["diet_given_genotype"]],
    audit$empirical_p_max_across_factors[["genotype_given_diet"]],
    audit$empirical_p_max_across_factors[["diet_given_genotype"]]))
  list(summary=summary,scores=scores)
}
for(seed in seeds){
  z<-fit_and_audit(blocks,seed,"paired")
  records[[length(records)+1L]]<-z$summary
  score_sets[[as.character(seed)]]<-z$scores
}
stability<-mofa_real_between_seeds(
  score_sets[[as.character(seeds[[1L]])]],
  score_sets[[as.character(seeds[[2L]])]]
)
# Sensitivity: break biological pairing by reassigning whole lipid profiles.
# The "omics are now on the wrong animal" perturbation is NOT a legitimate
# platform input; score difference should be disclosed but never used to
# choose an omic integration method from results on the same mice.
set.seed(20261011L)
shuffled<-sample(ids,size=length(ids),replace=FALSE)
if(sum(shuffled==ids)>3L)
 stop("Nutrimouse deliberately broken lipid pairing retained too many true pairs")
mispaired<-blocks
mispaired$lipidomics<-lipid[match(shuffled,ids),,drop=FALSE]
rownames(mispaired$lipidomics)<-ids
perturbed<-fit_and_audit(mispaired,seeds[[1L]],"broken_lipid_subject_pairing")
records[[length(records)+1L]]<-perturbed$summary
report<-list(
 study="Real Nutrimouse, true paired hepatic transcriptomic and lipid assays",
 source="mixOmics-org/mixOmics@ef3e760526623d9e91e945e4b50be48d764efc40",
 reference_package="Bioconductor MOFA2",
 package_version=as.character(utils::packageVersion("MOFA2")),
 exact_model_engine="PMx run_mofa2_blocks -> MOFA2::run_mofa(use_basilisk=TRUE)",
 total_biological_animals=40L,
 initializations=as.list(as.integer(seeds)),
 assayed_views=list(transcriptomics=120L,lipidomics=21L),
 gene_selection_caveat="Published transcriptomic panel 120 genes was preselected from roughly 30000 original genes in source study.",
 genotype_diet_not_technical_batch="Both are experimental biological/exposure labels; no machine batch IDs exist and technical batch is NOT assessed",
 model_fits=records,
 paired_two_seed_factor_correlations=stability,
 broken_pairing_matches=sum(shuffled==ids),
 broken_pairing_was_chosen_in_advance=TRUE,
 one_broken_pairing_seed_only=TRUE,
 no_technical_batch_validation=TRUE,
 no_external_cohort=TRUE,
 no_untouched_confirmatory_study=TRUE,
 no_supervised_biomarker_performance_claim=TRUE,
 caveats=c(
   "One retrospective 40-mouse study with author-preselected features; no unfiltered RNA-seq.",
   "Latent factor association is fitted and tested ON SAME experimental animals; label permutations are post-fit descriptive, not external confirmation.",
   "Genotype may be associated with diet; conditional partial-R2 and within-other-factor stratified nulls limit but cannot eliminate confounding.",
   "MOFA factors may rotate, flip sign, reorder or disappear across model initializations.",
   "Intentionally mismatching lipids is a falsification stress test, not a formal null or proof of synergy.",
   "No technical batch metadata exists; cannot claim biological-vs-technical factor separation on this dataset.",
   "Three MOFA model runs do not establish best factor number, generalizability, clinical validity or a validated biological mechanism.",
   "All associations, including null effects, are recorded, never filtered to winning seeds."
 ),
 publication_ready=FALSE,clinical_certification=FALSE
)
jsonlite::write_json(report,file.path(output,"real_nutrimouse_mofa2_report.json"),
  pretty=TRUE,auto_unbox=TRUE,na="null",digits=12L)
cat(sprintf("REAL MOFA2 NUTRIMOUSE ALL INPUTS AUDITED PASS: 40 mice, true paired seeds=2, broken pairing=1, no technical batch and NO CONFIRMATORY CLAIM\n"))
