#!/usr/bin/env Rscript
source(file.path("multiomics-engine", "external_validation.R"))

binary <- data.frame(
  outcome = c(0,0,0,0,1,1,1,1),
  prediction = c(0.05,0.10,0.20,0.35,0.65,0.75,0.90,0.95)
)
b <- validate_external_predictions(
  binary,
  outcome_type = "binary",
  independent_cohort = TRUE,
  bootstrap_repetitions = 100,
  seed = 1
)
stopifnot(identical(b$status, "external_validation"))
stopifnot(identical(b$evaluation_status, "ok"))
stopifnot(b$metrics$auc > 0.95)
stopifnot(b$metrics$brier < 0.15)
stopifnot(is.finite(b$metrics$log_loss))
stopifnot(is.finite(b$bootstrap$lower), is.finite(b$bootstrap$upper))

not_asserted <- validate_external_predictions(
  binary,
  outcome_type = "binary",
  independent_cohort = FALSE,
  bootstrap_repetitions = 0
)
stopifnot(identical(not_asserted$status, "independent_status_not_asserted"))

continuous <- data.frame(
  outcome = 1:10,
  prediction = 1:10 + c(-0.1,0.1,-0.2,0.2,0,0.1,-0.1,0.2,-0.2,0)
)
cres <- validate_external_predictions(
  continuous,
  outcome_type = "continuous",
  independent_cohort = TRUE,
  bootstrap_repetitions = 50,
  seed = 2
)
stopifnot(cres$metrics$rmse < 0.25)
stopifnot(cres$metrics$r2 > 0.99)

survival <- data.frame(
  survival_time = c(1,2,3,4,5,6,7,8),
  survival_event = c(1,1,1,1,1,1,0,0),
  prediction = c(8,7,6,5,4,3,2,1)
)
sres <- validate_external_predictions(
  survival,
  outcome_type = "survival",
  independent_cohort = TRUE,
  bootstrap_repetitions = 50,
  seed = 3
)
stopifnot(identical(sres$metrics$status, "ok"))
stopifnot(sres$metrics$c_index > 0.95)

multiclass <- data.frame(
  outcome = c("A","A","B","B","C","C"),
  A = c(.9,.8,.1,.1,.1,.1),
  B = c(.05,.1,.8,.75,.1,.1),
  C = c(.05,.1,.1,.15,.8,.8),
  check.names = FALSE
)
mres <- validate_external_predictions(
  multiclass,
  outcome_type = "multiclass",
  probability_columns = c("A","B","C"),
  independent_cohort = TRUE,
  bootstrap_repetitions = 0
)
stopifnot(mres$metrics$accuracy == 1)
stopifnot(mres$metrics$balanced_accuracy == 1)

cat("multiomics external validation smoke: PASS\n")
