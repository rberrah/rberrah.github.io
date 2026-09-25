#!/usr/bin/env Rscript
source(file.path("multiomics-engine", "server.R"))

stopifnot(exists("apply_ms_qc_reference"))
stopifnot(exists("reference_preprocess_matrix"))
stopifnot(exists("run_backend_analysis"))

# -------------------------------------------------------------------------
# 1) Reference MS QC: blank filter + pooled-QC LOESS + RSD + explicit MNAR
# -------------------------------------------------------------------------
assays <- c("BL1","BL2", paste0("QC",1:5), paste0("S",1:6))
orders <- seq_along(assays)
sample_type <- c("blank","blank", rep("pooled_qc",5), rep("biological",6))
meta <- data.frame(
  subject_id = assays,
  sample_id = assays,
  assay_id = assays,
  omic = "metabolomics",
  condition = c(rep("",7), rep(c("A","B"), each=3)),
  timepoint = "T0",
  batch = "B1",
  technical_replicate = "1",
  outcome = "",
  survival_time = "",
  survival_event = "",
  sample_type = sample_type,
  injection_order = orders,
  stringsAsFactors = FALSE
)

x <- cbind(
  MS_TRUE_SIGNAL = c(
    1,1,
    80,90,100,110,120,
    95,100,105,115,120,125
  ),
  MS_BLANK_CONTAM = c(
    10,11,
    18,19,20,21,22,
    20,21,19,22,20,21
  ),
  MS_UNSTABLE_QC = c(
    0.2,0.3,
    10,100,12,110,9,
    40,42,41,43,39,44
  ),
  MS_MNAR = c(
    0.1,0.1,
    50,51,49,50,52,
    60,NA,62,64,65,66
  )
)
rownames(x) <- assays

protocol <- list(
  msBlankFilter = "yes",
  msBlankFold = 5,
  msQcRsdFilter = "yes",
  msQcRsdThreshold = 0.30,
  msDriftCorrection = "yes",
  msMnarStrategy = "left_censored"
)
qc <- apply_ms_qc_reference(x, meta, protocol)

stopifnot(nrow(qc$matrix) == 6L)
stopifnot(!"MS_BLANK_CONTAM" %in% colnames(qc$matrix))
stopifnot(!"MS_UNSTABLE_QC" %in% colnames(qc$matrix))
stopifnot("MS_TRUE_SIGNAL" %in% colnames(qc$matrix))
stopifnot("MS_MNAR" %in% colnames(qc$matrix))
stopifnot(all(is.finite(qc$matrix[,"MS_MNAR"])))
stopifnot(qc$summary$blank_filtered_features >= 1L)
stopifnot(qc$summary$qc_rsd_filtered_features >= 1L)
stopifnot(qc$summary$drift_corrected_features >= 1L)
stopifnot(qc$summary$mnar_imputed_values >= 1L)

# -------------------------------------------------------------------------
# 2) Browser-to-R payload routing, without requiring heavy packages in CI
# -------------------------------------------------------------------------
metadata_csv <- paste(
  "subject_id,sample_id,assay_id,omic,condition,timepoint,batch,technical_replicate",
  "P1,P1,R1,transcriptomics,A,T0,B1,1",
  "P2,P2,R2,transcriptomics,A,T0,B1,1",
  "P3,P3,R3,transcriptomics,B,T0,B1,1",
  "P4,P4,R4,transcriptomics,B,T0,B1,1",
  "P1,P1,P1A,proteomics,A,T0,B1,1",
  "P2,P2,P2A,proteomics,A,T0,B1,1",
  "P3,P3,P3A,proteomics,B,T0,B1,1",
  "P4,P4,P4A,proteomics,B,T0,B1,1",
  sep="\n"
)

rna_csv <- paste(
  "feature_id,R1,R2,R3,R4",
  "GENE1,5,5.2,7.5,7.8",
  "GENE2,3,3.1,3.2,3.0",
  sep="\n"
)
protein_csv <- paste(
  "feature_id,P1A,P2A,P3A,P4A",
  "P001,4,4.1,5.5,5.7",
  "P002,2,2.2,2.1,2.0",
  sep="\n"
)

payload <- list(
  protocol = list(
    organism="human",
    objective="groups",
    longitudinal=FALSE,
    designType="independent",
    outcomeType="none",
    covariateColumns=list()
  ),
  dataTypes = list(
    transcriptomics="log_expression",
    proteomics="log_intensity"
  ),
  identifierTypes = list(
    transcriptomics="gene_symbol",
    proteomics="uniprot"
  ),
  columnMapping = list(
    subject_id="subject_id",
    sample_id="sample_id",
    assay_id="assay_id",
    omic="omic",
    condition="condition",
    timepoint="timepoint",
    batch="batch",
    technical_replicate="technical_replicate"
  ),
  metadataCsv = metadata_csv,
  matrices = list(
    transcriptomics=rna_csv,
    proteomics=protein_csv
  )
)

result <- run_backend_analysis(payload)
stopifnot(identical(result$status, "ok"))
stopifnot(all(c("transcriptomics","proteomics") %in% names(result$preprocessing)))
stopifnot("transcriptomics_differential" %in% names(result$methods))
stopifnot("proteomics_differential" %in% names(result$methods))
stopifnot(result$methods$transcriptomics_differential$status %in% c("ok","unavailable"))
stopifnot(result$methods$proteomics_differential$status %in% c("ok","unavailable"))
stopifnot(is.list(result$packages))

cat("multiomics reference R backend smoke: PASS\n")
