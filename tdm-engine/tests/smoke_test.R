suppressPackageStartupMessages({
  library(mrgsolve)
  library(mapbayr)
  library(dplyr)
  library(jsonlite)
})

`%||%` <- function(value, fallback) {
  if (is.null(value) || !length(value)) fallback else value
}

arguments <- commandArgs(trailingOnly = FALSE)
file_argument <- sub("^--file=", "", grep("^--file=", arguments, value = TRUE)[1])
APP_ROOT <- normalizePath(file.path(dirname(file_argument), ".."), winslash = "/", mustWork = TRUE)

source(file.path(APP_ROOT, "R", "model_library.R"), local = TRUE)
source(file.path(APP_ROOT, "R", "engine.R"), local = TRUE)
source(file.path(APP_ROOT, "R", "ml_engine.R"), local = TRUE)

doses <- data.frame(time = 0, amount = 1000, interval = 12, count = 4, infusion = 1, ss = 0)
observations <- data.frame(time = 47.5, concentration = 18)
covariates <- list(WT = 70, AGE = 65, CREAT = 90, CREAT2 = 90, CRCL = 90, SEX = 0, HT = 175, DIAL = 0)
covariate_history <- data.frame(
  time = c(0, 47.5),
  WT = c(70, 74),
  AGE = c(65, 65),
  CREAT = c(90, 110),
  CREAT2 = c(90, 110),
  CRCL = c(90, 110),
  SEX = c(0, 0),
  HT = c(175, 175),
  DIAL = c(0, 0)
)
model_ids <- c("vanco_goti", "vanco_pkjust", "vanco_roberts")
specifications <- lapply(model_ids, function(id) {
  record <- model_record(id)
  list(
    id = id,
    label = record$label[[1]],
    code = NULL,
    route = "IV",
    adm_cmt_name = model_administration_cmt(record, "IV")
  )
})

mellon_record <- model_record("amox_mellon")
stopifnot(identical(model_routes(mellon_record), c("IV", "Oral")))
mellon_model <- compile_model(model_id = "amox_mellon")
mellon_contract <- validate_model_contract(mellon_model)
stopifnot(resolve_administration_cmt(
  mellon_model,
  mellon_contract,
  list(label = "Mellon oral", adm_cmt_name = model_administration_cmt(mellon_record, "Oral"))
) == match("DEPOT", mellon_model@cmtL))

route_error <- tryCatch({
  validate_model_route_set(list(list(route = "IV"), list(route = "Oral")))
  NULL
}, error = identity)
stopifnot(inherits(route_error, "error"))

fits <- fit_model_set(
  specifications,
  doses,
  observations,
  covariates,
  allow_custom = FALSE,
  covariate_history = covariate_history
)
valid <- successful_fits(fits)
if (length(valid) != length(model_ids)) {
  messages <- vapply(fits, function(item) item$message %||% "OK", character(1))
  stop("Some vancomycin models failed: ", paste(messages, collapse = " | "))
}
stopifnot(identical(as.numeric(valid[[1]]$current_covariates$WT), 74))

steady_doses <- data.frame(time = 0, amount = 1000, interval = 12, count = 1, infusion = 0, ss = 1)
steady_observations <- data.frame(time = 11.5, concentration = 18)
steady_fits <- fit_model_set(
  specifications[match("vanco_roberts", model_ids)],
  steady_doses,
  steady_observations,
  covariates,
  allow_custom = FALSE,
  covariate_history = covariate_history
)
steady_valid <- successful_fits(steady_fits)
if (length(steady_valid) != 1L) stop("The steady-state MAP fit failed: ", steady_fits[[1]]$message %||% "unknown error")
steady_dose_row <- steady_valid[[1]]$data[steady_valid[[1]]$data$evid == 1, , drop = FALSE]
stopifnot(nrow(steady_dose_row) == 1L, steady_dose_row$ss[[1]] == 1L, steady_dose_row$addl[[1]] == 0)
steady_exposure <- current_regimen_exposure(steady_fits, c(vanco_roberts = 1), steady_doses)
stopifnot(isTRUE(steady_exposure$steady_state), !isTRUE(steady_exposure$single_dose))

weights <- compute_model_weights(fits, scheme = "AIC")
stopifnot(length(weights) == length(model_ids), abs(sum(weights) - 1) < 1e-8)

carried <- carry_covariates(
  event_times = c(0, 12, 47.5, 60),
  covariate_history = covariate_history[, c("time", "WT")],
  covariates = list(WT = 70)
)
stopifnot(identical(as.numeric(carried$WT), c(70, 70, 74, 74)))

profiles <- fit_profiles(fits, weights, end_time = 96)
stopifnot(nrow(profiles$per_model) > 0, nrow(profiles$average) > 0)
stopifnot(all(is.finite(profiles$average$concentration)))

summary_table <- model_summary(fits, weights)
stopifnot(nrow(summary_table) == length(model_ids))

current_exposure <- current_regimen_exposure(fits, weights, doses, observations)
stopifnot(is.finite(current_exposure$auc24), current_exposure$auc24 > 0)
stopifnot(is.finite(current_exposure$c0), current_exposure$c0 >= 0)
stopifnot(is.finite(current_exposure$steady_state_auc24), current_exposure$steady_state_auc24 > 0)
stopifnot(is.finite(current_exposure$steady_state_c0), current_exposure$steady_state_c0 >= 0)
stopifnot(identical(current_exposure$interval, 12))

recommendations <- recommend_regimens(
  fits = fits,
  weights = weights,
  dose_min = 500,
  dose_max = 1500,
  dose_step = 500,
  intervals = c(8, 12, 24),
  infusion = 1,
  metric = "AUC24",
  target_low = 400,
  target_high = 600
)

recommendations <- rank_regimens_by_pta(
  recommendations,
  fits,
  weights,
  metric = "AUC24",
  target_low = 400,
  target_high = 600,
  replicates = 40,
  delta = 0.2,
  top_n = 3
)

stopifnot(nrow(recommendations) == 9)
stopifnot(all(is.finite(recommendations$auc24)))
stopifnot(all(recommendations$auc24 > 0))

best <- recommendations[1, ]
comparison <- compare_future_regimens(
  fits,
  weights,
  doses,
  observations,
  recommended = best,
  additional_doses = 4,
  delta = 0.2
)
stopifnot(nrow(comparison$profiles) > 0)
stopifnot(identical(sort(unique(comparison$profiles$scenario)), sort(c(
  SCENARIO_MAINTAIN,
  SCENARIO_RECOMMENDED
))))

distribution <- simulate_regimen_distribution(
  fits,
  weights,
  dose = best$dose,
  interval = best$interval,
  infusion = best$infusion,
  metric = "AUC24",
  replicates = 60,
  interval_level = 90,
  delta = 0.2,
  include_posterior = TRUE,
  include_residual = FALSE
)
stopifnot(nrow(distribution$data) == 60L)
stopifnot(all(is.finite(c(distribution$lower, distribution$median, distribution$upper))))
stopifnot(distribution$lower <= distribution$median, distribution$median <= distribution$upper)
stopifnot(distribution$lower < distribution$upper)

sensitivity <- model_averaging_sensitivity(
  fits, weights,
  dose_min = 500, dose_max = 1500, dose_step = 500,
  intervals = c(8, 12, 24), infusion = 1,
  metric = "AUC24", target_low = 400, target_high = 600,
  delta = 0.2
)
stopifnot(nrow(sensitivity) >= 2L, all(is.finite(sensitivity$target_value)))
stopifnot(length(read_ml_manifest()$artifacts) == 0L)

default_fits <- fit_model_set(
  specifications[match("vanco_roberts", model_ids)],
  doses,
  observations,
  list(WT = 74.8, CRCL = 90.7),
  allow_custom = FALSE,
  covariate_history = data.frame(time = 47.5, WT = 74.8, CRCL = 90.7)
)
default_weights <- compute_model_weights(default_fits, "AIC")
default_recommendations <- recommend_regimens(
  default_fits, default_weights,
  dose_min = 250, dose_max = 2000, dose_step = 250,
  intervals = c(8, 12, 24), infusion = 1,
  metric = "AUC24", target_low = 400, target_high = 600,
  delta = 0.1
)
default_recommendations <- rank_regimens_by_pta(
  default_recommendations, default_fits, default_weights,
  metric = "AUC24", target_low = 400, target_high = 600,
  replicates = 150, delta = 0.1
)
default_best <- default_recommendations[1, , drop = FALSE]
default_sensitivity <- model_averaging_sensitivity(
  default_fits, default_weights,
  dose_min = 250, dose_max = 2000, dose_step = 250,
  intervals = c(8, 12, 24), infusion = 1,
  metric = "AUC24", target_low = 400, target_high = 600,
  delta = 0.1
)
default_distribution <- simulate_regimen_distribution(
  default_fits, default_weights,
  dose = default_best$dose, interval = default_best$interval, infusion = 1,
  metric = "AUC24", replicates = 250, interval_level = 90, delta = 0.1,
  include_posterior = TRUE, include_residual = FALSE, include_timing = FALSE
)
stopifnot(nrow(default_sensitivity) == 1L, nrow(default_distribution$data) == 250L)
stopifnot(isTRUE(default_distribution$posterior_available))

default_fits <- apply_hybrid_ml_to_fits(default_fits, "IV")
stopifnot(!isTRUE(default_fits[[1]]$ml_correction$applied))
hash <- model_sha256("vanco_roberts")
if (!is.na(hash)) {
  eligible_artifact <- list(
    id = "test-artifact",
    baseModelId = "vanco_roberts",
    baseModelSha256 = hash,
    drug = "Vancomycine",
    route = "IV",
    validation = list(
      repeatedNestedCvGainPct = 5,
      untouchedHoldoutGainPct = 3,
      alternatePopPkGainPct = 2,
      realPatient = list(status = "pending")
    )
  )
  eligibility <- ml_artifact_eligibility(eligible_artifact, "vanco_roberts", "Vancomycine", "IV")
  stopifnot(isTRUE(eligibility$research), !isTRUE(eligibility$clinical))
  eligible_artifact$validation$untouchedHoldoutGainPct <- -1
  stopifnot(!isTRUE(ml_artifact_eligibility(eligible_artifact, "vanco_roberts", "Vancomycine", "IV")$research))
}

cat("TDM engine smoke test OK\n")
cat("Weights:", paste(names(weights), round(weights, 4), collapse = " | "), "\n")
cat("Current exposure: AUC0-24", round(current_exposure$auc24, 1), "; C0", round(current_exposure$c0, 2), "\n")
cat("Best tested scenario:", best$dose, "mg every", best$interval, "h; AUC24", round(best$auc24, 1), "\n")
