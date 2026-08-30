suppressPackageStartupMessages({
  library(mrgsolve)
  library(mapbayr)
  library(xgboost)
  library(glmnet)
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

args <- commandArgs(trailingOnly = TRUE)
option_value <- function(prefix, default = NULL) {
  hit <- grep(paste0("^", prefix, "="), args, value = TRUE)
  if (length(hit)) sub(paste0("^", prefix, "="), "", hit[[1]]) else default
}

smoke <- "--smoke" %in% args
n_patients <- as.integer(option_value("--n", if (smoke) "24" else "300"))
base_argument <- option_value("--base", "all")
report_path <- option_value("--report", "")
seed <- as.integer(option_value("--seed", "20260830"))
if (!is.finite(n_patients) || n_patients < 18L) stop("--n must be at least 18 patients per model.")

VANCOMYCIN_MODELS <- c("vanco_goti", "vanco_pkjust", "vanco_roberts")
base_models <- if (identical(base_argument, "all")) VANCOMYCIN_MODELS else strsplit(base_argument, ",", fixed = TRUE)[[1]]
if (any(!base_models %in% VANCOMYCIN_MODELS)) stop("--base accepts only: ", paste(VANCOMYCIN_MODELS, collapse = ", "))
if (any(vapply(VANCOMYCIN_MODELS, function(id) !identical(model_routes(model_record(id)), "IV"), logical(1)))) {
  stop("Vancomycin ML training is restricted to IV-only models.")
}

OUTER_V <- if (smoke) 3L else 5L
OUTER_REPEATS <- if (smoke) 1L else 2L
INNER_V <- 4L

XGB_GRID <- if (smoke) {
  list(
    list(max_depth = 2L, eta = 0.05, min_child_weight = 5, subsample = 0.8, colsample_bytree = 0.8, nrounds = 80L),
    list(max_depth = 3L, eta = 0.03, min_child_weight = 8, subsample = 0.8, colsample_bytree = 1.0, nrounds = 120L)
  )
} else {
  full_grid <- expand.grid(
    max_depth = c(2L, 3L, 4L),
    eta = c(0.02, 0.05),
    min_child_weight = c(5, 15),
    stringsAsFactors = FALSE
  )
  full_grid |>
    split(seq_len(nrow(full_grid))) |>
    lapply(function(row) {
      list(
        max_depth = as.integer(row$max_depth), eta = row$eta,
        min_child_weight = row$min_child_weight, subsample = 0.8,
        colsample_bytree = 0.8, nrounds = 300L
      )
    })
}

set.seed(seed)
.compiled_models <- new.env(parent = emptyenv())

compiled_model <- function(model_id) {
  if (!exists(model_id, envir = .compiled_models, inherits = FALSE)) {
    assign(model_id, compile_model(model_id = model_id), envir = .compiled_models)
  }
  get(model_id, envir = .compiled_models, inherits = FALSE)
}

model_covariate_names <- function(model) {
  intersect(c("WT", "AGE", "CREAT", "CREAT2", "CRCL", "SEX", "HT", "DIAL"), model_param_names(model))
}

sample_covariates <- function() {
  sex <- sample(c(0, 1), 1)
  age <- stats::runif(1, 18, 90)
  weight <- stats::runif(1, 45, 130)
  creatinine <- stats::runif(1, 35, 260)
  height <- stats::runif(1, 145, 200)
  cockcroft <- (if (sex == 0) 1.23 else 1.04) * weight * (140 - age) / creatinine
  list(
    WT = weight, AGE = age, CREAT = creatinine, CREAT2 = creatinine,
    CRCL = max(5, min(220, cockcroft)), SEX = sex, HT = height,
    DIAL = stats::rbinom(1, 1, 0.08)
  )
}

sample_regimen <- function() {
  interval <- sample(c(8, 12, 24), 1, prob = c(0.15, 0.7, 0.15))
  infusion <- sample(c(1, 2, 4), 1, prob = c(0.6, 0.3, 0.1))
  list(
    amount = sample(c(500, 750, 1000, 1250, 1500, 2000), 1),
    interval = interval,
    infusion = min(infusion, interval)
  )
}

sample_eta <- function(model) {
  omega <- as.matrix(mrgsolve::omat(model))
  eta <- stats::rnorm(nrow(omega), 0, sqrt(pmax(diag(omega), 0)))
  limits <- 2.5 * sqrt(pmax(diag(omega), 0))
  eta <- pmax(-limits, pmin(limits, eta))
  stats::setNames(eta, paste0("ETA", seq_along(eta)))
}

profile_times <- function(regimen) {
  interval <- regimen$interval
  sort(unique(pmax(0.25, pmin(interval - 0.1, c(
    min(regimen$infusion, interval) * 0.5,
    min(regimen$infusion, interval),
    interval * 0.25,
    interval * 0.5,
    interval * 0.75,
    interval - 0.25
  )))))
}

simulate_profile <- function(model_id, covariates, eta, regimen, times) {
  record <- model_record(model_id)
  model <- compiled_model(model_id)
  parameters <- c(covariates[model_covariate_names(model)], as.list(eta))
  model <- safe_param(model, parameters)
  model <- mrgsolve::zero_re(model)
  compartment <- match(model_administration_cmt(record, "IV"), model@cmtL)
  event <- mrgsolve::ev(
    amt = regimen$amount,
    ii = regimen$interval,
    cmt = compartment,
    ss = 1,
    rate = regimen$amount / regimen$infusion
  )
  grid <- mrgsolve::tgrid(start = 0, end = 0, add = times)
  output <- model |>
    mrgsolve::ev(event) |>
    mrgsolve::mrgsim(tgrid = grid, obsonly = TRUE) |>
    as.data.frame()
  if (!"DV" %in% names(output)) stop("Model ", model_id, " does not capture DV.")
  output <- output[output$time %in% times & is.finite(output$DV), c("time", "DV"), drop = FALSE]
  if (nrow(output) != length(times)) stop("Unexpected simulation grid for ", model_id, ".")
  stats::setNames(output$DV, format(output$time, trim = TRUE, scientific = FALSE))
}

add_observation_error <- function(concentrations, model_id) {
  sigma <- diag(as.matrix(mrgsolve::smat(compiled_model(model_id))))
  proportional_sd <- if (length(sigma) >= 1L) sqrt(max(0, sigma[[1]])) else 0
  additive_sd <- if (length(sigma) >= 2L) sqrt(max(0, sigma[[2]])) else 0
  pmax(0.001, concentrations * (1 + stats::rnorm(length(concentrations), 0, proportional_sd)) +
    stats::rnorm(length(concentrations), 0, additive_sd))
}

fit_eta <- function(base_id, covariates, regimen, times, concentrations) {
  record <- model_record(base_id)
  model <- compiled_model(base_id)
  accepted <- covariates[model_covariate_names(model)]
  model <- safe_param(model, accepted)
  contract <- validate_model_contract(model)
  if (!isTRUE(contract$ok)) stop(paste(contract$errors, collapse = " | "))
  doses <- data.frame(
    time = 0, amount = regimen$amount, interval = regimen$interval,
    count = 1, infusion = regimen$infusion, ss = 1
  )
  observations <- data.frame(time = times, concentration = concentrations)
  data <- build_map_data(
    doses, observations,
    adm_cmt = match(model_administration_cmt(record, "IV"), model@cmtL),
    obs_cmt = contract$obs_cmt,
    covariates = accepted
  )
  estimate <- mapbayr::mapbayest(
    x = model, data = data, hessian = FALSE,
    verbose = FALSE, progress = FALSE
  )
  eta <- as.numeric(estimate$final_eta[[1]])
  names(eta) <- names(estimate$final_eta[[1]])
  clearance <- tryCatch(as.numeric(mapbayr::get_param(estimate, "CL"))[[1]], error = function(error) NA_real_)
  list(eta = eta, clearance = clearance)
}

make_patient_row <- function(base_id, generator_id, patient_id) {
  tryCatch({
    covariates <- sample_covariates()
    regimen <- sample_regimen()
    times <- profile_times(regimen)
    generator_eta <- sample_eta(compiled_model(generator_id))
    truth <- simulate_profile(generator_id, covariates, generator_eta, regimen, times)
    rich <- fit_eta(base_id, covariates, regimen, times, as.numeric(truth))

    sparse_count <- sample(c(1L, 2L), 1, prob = c(0.7, 0.3))
    sparse_indices <- if (sparse_count == 1L) {
      length(times)
    } else {
      sort(unique(c(sample(seq_len(max(1, length(times) - 1L)), 1), length(times))))
    }
    sparse_times <- times[sparse_indices]
    sparse_values <- add_observation_error(as.numeric(truth)[sparse_indices], generator_id)
    sparse <- fit_eta(base_id, covariates, regimen, sparse_times, sparse_values)
    if (!"ETA1" %in% names(rich$eta) || !"ETA1" %in% names(sparse$eta)) stop("ETA1 unavailable.")

    features <- c(
      stats::setNames(sparse$eta, paste0("MAP_", names(sparse$eta))),
      MAP_CL = sparse$clearance,
      unlist(covariates[model_covariate_names(compiled_model(base_id))]),
      DOSE = regimen$amount,
      INTERVAL = regimen$interval,
      INFUSION = regimen$infusion,
      LAST_CONC = tail(sparse_values, 1),
      LAST_TIME = tail(sparse_times, 1),
      N_OBS = length(sparse_times)
    )
    row <- as.data.frame(as.list(c(
      patient_id = patient_id,
      generator = match(generator_id, VANCOMYCIN_MODELS),
      DELTA_ETA1 = rich$eta[["ETA1"]] - sparse$eta[["ETA1"]],
      features
    )), check.names = FALSE)
    row
  }, error = function(error) {
    message("  patient ", patient_id, " skipped: ", conditionMessage(error))
    NULL
  })
}

make_cohort <- function(base_id, generator_ids, n, label) {
  cat("  ", label, ": ", n, " virtual patients from ", paste(generator_ids, collapse = ", "), "\n", sep = "")
  rows <- vector("list", n)
  for (index in seq_len(n)) {
    generator <- generator_ids[[((index - 1L) %% length(generator_ids)) + 1L]]
    rows[[index]] <- make_patient_row(base_id, generator, index)
    if (index %% max(1L, floor(n / 10L)) == 0L) cat(".")
  }
  cat("\n")
  cohort <- do.call(rbind, rows)
  if (is.null(cohort) || nrow(cohort) < max(12L, floor(0.6 * n))) {
    stop("Too few converged virtual patients for ", label, ".")
  }
  cohort[] <- lapply(cohort, as.numeric)
  cohort <- cohort[stats::complete.cases(cohort) & apply(cohort, 1, function(row) all(is.finite(row))), , drop = FALSE]
  cohort
}

predictor_names <- function(data) setdiff(names(data), c("patient_id", "generator", "DELTA_ETA1"))

fold_ids <- function(n, v, seed_value) {
  set.seed(seed_value)
  sample(rep(seq_len(min(v, n)), length.out = n))
}

fit_booster <- function(data, parameters, predictors) {
  matrix <- as.matrix(data[, predictors, drop = FALSE])
  dtrain <- xgboost::xgb.DMatrix(matrix, label = data$DELTA_ETA1)
  xgboost::xgb.train(
    params = list(
      objective = "reg:squarederror", eval_metric = "rmse",
      max_depth = parameters$max_depth, eta = parameters$eta,
      min_child_weight = parameters$min_child_weight,
      subsample = parameters$subsample, colsample_bytree = parameters$colsample_bytree,
      nthread = 1
    ),
    data = dtrain, nrounds = parameters$nrounds, verbose = 0
  )
}

select_xgb_parameters <- function(data, predictors, seed_value) {
  ids <- fold_ids(nrow(data), INNER_V, seed_value)
  scores <- vapply(seq_along(XGB_GRID), function(grid_index) {
    errors <- numeric()
    for (fold in sort(unique(ids))) {
      fit <- fit_booster(data[ids != fold, , drop = FALSE], XGB_GRID[[grid_index]], predictors)
      predicted <- stats::predict(fit, as.matrix(data[ids == fold, predictors, drop = FALSE]))
      errors <- c(errors, data$DELTA_ETA1[ids == fold] - predicted)
    }
    sqrt(mean(errors^2))
  }, numeric(1))
  XGB_GRID[[which.min(scores)]]
}

fit_elastic <- function(data, predictors, seed_value) {
  x <- as.matrix(data[, predictors, drop = FALSE])
  y <- data$DELTA_ETA1
  ids <- fold_ids(nrow(data), INNER_V, seed_value)
  candidates <- lapply(c(0, 0.5, 1), function(alpha) {
    fit <- glmnet::cv.glmnet(x, y, alpha = alpha, foldid = ids, standardize = TRUE)
    list(alpha = alpha, lambda = fit$lambda.min, score = min(fit$cvm))
  })
  best <- candidates[[which.min(vapply(candidates, `[[`, numeric(1), "score"))]]
  glmnet::glmnet(x, y, alpha = best$alpha, lambda = best$lambda, standardize = TRUE)
}

predict_elastic <- function(model, data, predictors) {
  as.numeric(stats::predict(model, newx = as.matrix(data[, predictors, drop = FALSE]), s = model$lambda[[1]]))
}

metric_row <- function(truth, prediction) {
  baseline <- sqrt(mean(truth^2))
  corrected <- sqrt(mean((truth - prediction)^2))
  c(rmse_map = baseline, rmse_corrected = corrected, gain_pct = 100 * (baseline - corrected) / baseline)
}

nested_validate <- function(data, predictors, seed_value) {
  truth <- xgb_prediction <- elastic_prediction <- numeric()
  for (repeat_index in seq_len(OUTER_REPEATS)) {
    ids <- fold_ids(nrow(data), OUTER_V, seed_value + repeat_index)
    for (fold in sort(unique(ids))) {
      analysis <- data[ids != fold, , drop = FALSE]
      assessment <- data[ids == fold, , drop = FALSE]
      parameters <- select_xgb_parameters(analysis, predictors, seed_value + repeat_index * 100L + fold)
      booster <- fit_booster(analysis, parameters, predictors)
      elastic <- fit_elastic(analysis, predictors, seed_value + repeat_index * 1000L + fold)
      truth <- c(truth, assessment$DELTA_ETA1)
      xgb_prediction <- c(xgb_prediction, stats::predict(booster, as.matrix(assessment[, predictors, drop = FALSE])))
      elastic_prediction <- c(elastic_prediction, predict_elastic(elastic, assessment, predictors))
    }
  }
  list(
    xgboost = metric_row(truth, xgb_prediction),
    elastic_net = metric_row(truth, elastic_prediction)
  )
}

evaluate_base_model <- function(base_id, index) {
  cat("\n=== ", base_id, " (IV) ===\n", sep = "")
  development <- make_cohort(base_id, base_id, n_patients, "development")
  alternate_ids <- setdiff(VANCOMYCIN_MODELS, base_id)
  alternate <- make_cohort(base_id, alternate_ids, n_patients, "alternate PopPK validation")

  set.seed(seed + index)
  holdout_indices <- sample(seq_len(nrow(development)), max(4L, floor(0.2 * nrow(development))))
  holdout <- development[holdout_indices, , drop = FALSE]
  training <- development[-holdout_indices, , drop = FALSE]
  predictors <- predictor_names(training)

  nested <- nested_validate(training, predictors, seed + index * 10000L)
  final_parameters <- select_xgb_parameters(training, predictors, seed + index * 20000L)
  booster <- fit_booster(training, final_parameters, predictors)
  elastic <- fit_elastic(training, predictors, seed + index * 30000L)
  holdout_xgb <- metric_row(holdout$DELTA_ETA1, stats::predict(booster, as.matrix(holdout[, predictors, drop = FALSE])))
  alternate_xgb <- metric_row(alternate$DELTA_ETA1, stats::predict(booster, as.matrix(alternate[, predictors, drop = FALSE])))
  holdout_elastic <- metric_row(holdout$DELTA_ETA1, predict_elastic(elastic, holdout, predictors))
  alternate_elastic <- metric_row(alternate$DELTA_ETA1, predict_elastic(elastic, alternate, predictors))

  publishable_research <- nested$xgboost[["gain_pct"]] > 0 &&
    holdout_xgb[["gain_pct"]] > 0 && alternate_xgb[["gain_pct"]] > 0
  cat(sprintf("  nested CV       XGB %+.1f%% | elastic net %+.1f%%\n", nested$xgboost[["gain_pct"]], nested$elastic_net[["gain_pct"]]))
  cat(sprintf("  untouched test  XGB %+.1f%% | elastic net %+.1f%%\n", holdout_xgb[["gain_pct"]], holdout_elastic[["gain_pct"]]))
  cat(sprintf("  alternate PopPK XGB %+.1f%% | elastic net %+.1f%%\n", alternate_xgb[["gain_pct"]], alternate_elastic[["gain_pct"]]))
  cat("  research gates: ", if (publishable_research) "PASS" else "FAIL", " (real-patient validation still required)\n", sep = "")

  data.frame(
    base_model = base_id,
    route = "IV",
    n_training = nrow(training), n_holdout = nrow(holdout), n_alternate = nrow(alternate),
    nested_xgb_gain_pct = nested$xgboost[["gain_pct"]],
    nested_elastic_gain_pct = nested$elastic_net[["gain_pct"]],
    holdout_xgb_gain_pct = holdout_xgb[["gain_pct"]],
    holdout_elastic_gain_pct = holdout_elastic[["gain_pct"]],
    alternate_xgb_gain_pct = alternate_xgb[["gain_pct"]],
    alternate_elastic_gain_pct = alternate_elastic[["gain_pct"]],
    research_gates_pass = publishable_research,
    real_patient_status = "pending",
    artifact_saved = FALSE,
    stringsAsFactors = FALSE
  )
}

cat("Vancomycin-only hybrid ML evaluation\n")
cat("No patient data are read or written; no booster is published to the runtime manifest.\n")
results <- do.call(rbind, lapply(seq_along(base_models), function(index) {
  evaluate_base_model(base_models[[index]], index)
}))

if (nzchar(report_path)) {
  directory <- dirname(report_path)
  if (!dir.exists(directory)) dir.create(directory, recursive = TRUE)
  utils::write.csv(results, report_path, row.names = FALSE)
  cat("Validation report written to ", normalizePath(report_path, winslash = "/", mustWork = TRUE), "\n", sep = "")
}

cat("\nSummary\n")
print(results, row.names = FALSE)
cat("\nNo artifact saved. manifest.json remains the publication gate.\n")
