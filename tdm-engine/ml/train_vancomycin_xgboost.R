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
source(file.path(APP_ROOT, "R", "ml_engine.R"), local = TRUE)

args <- commandArgs(trailingOnly = TRUE)
option_value <- function(prefix, default = NULL) {
  hit <- grep(paste0("^", prefix, "="), args, value = TRUE)
  if (length(hit)) sub(paste0("^", prefix, "=", ""), "", hit[[1]]) else default
}

smoke <- "--smoke" %in% args
publish_research <- "--publish-research" %in% args
n_patients <- as.integer(option_value("--n", if (smoke) "24" else "1000"))
base_argument <- option_value("--base", "all")
mode_argument <- option_value("--mode", "intermittent")
report_path <- option_value("--report", "")
seed <- as.integer(option_value("--seed", "20260830"))
if (!is.finite(n_patients) || n_patients < 18L) stop("--n must be at least 18 patients per model.")
if (publish_research && (smoke || n_patients < 1000L)) {
  stop("Research publication requires a non-smoke run with at least 1000 virtual patients per validation cohort.")
}

VANCOMYCIN_MODELS <- c("vanco_goti", "vanco_pkjust", "vanco_roberts")
MODE_MODELS <- list(
  intermittent = c("vanco_goti", "vanco_pkjust"),
  continuous = c("vanco_pkjust", "vanco_roberts")
)
if (!mode_argument %in% names(MODE_MODELS)) stop("--mode accepts only: intermittent, continuous")
ACTIVE_MODELS <- MODE_MODELS[[mode_argument]]
base_models <- if (identical(base_argument, "all")) ACTIVE_MODELS else strsplit(base_argument, ",", fixed = TRUE)[[1]]
if (any(!base_models %in% ACTIVE_MODELS)) {
  stop("--base accepts only for ", mode_argument, ": ", paste(ACTIVE_MODELS, collapse = ", "))
}
if (any(vapply(VANCOMYCIN_MODELS, function(id) !identical(model_routes(model_record(id)), "IV"), logical(1)))) {
  stop("Vancomycin ML training is restricted to IV-only models.")
}

OUTER_V <- if (smoke) 3L else 5L
OUTER_REPEATS <- if (smoke) 1L else 2L
INNER_V <- if (smoke) 3L else 5L
MAX_RELATIVE_RMSE_PCT <- 15
MAX_ABSOLUTE_BIAS_PCT <- 10
MIN_WITHIN_20_PCT <- 80
MIN_AUC24 <- 100
MAX_AUC24 <- 1200
MAX_CONCENTRATION <- 120
DALEX_BACKGROUND_SIZE <- 200L

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
  lapply(seq_len(nrow(full_grid)), function(row) {
    list(
      max_depth = as.integer(full_grid$max_depth[[row]]),
      eta = full_grid$eta[[row]],
      min_child_weight = full_grid$min_child_weight[[row]],
      subsample = 0.8,
      colsample_bytree = 0.8,
      nrounds = 300L
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
    WT = weight,
    AGE = age,
    CREAT = creatinine,
    CREAT2 = creatinine,
    CRCL = max(5, min(220, cockcroft)),
    SEX = sex,
    HT = height,
    DIAL = stats::rbinom(1, 1, 0.08)
  )
}

sample_regimen <- function() {
  if (identical(mode_argument, "continuous")) {
    return(list(
      amount = sample(c(1000, 1500, 2000, 2500, 3000, 3500, 4000), 1),
      interval = 24,
      infusion = 24
    ))
  }
  interval <- sample(c(8, 12, 24), 1, prob = c(0.15, 0.7, 0.15))
  infusion <- sample(c(1, 2, 4), 1, prob = c(0.6, 0.3, 0.1))
  list(
    amount = sample(c(500, 750, 1000, 1250, 1500, 2000), 1),
    interval = interval,
    infusion = min(infusion, interval - 0.5)
  )
}

sample_eta <- function(model) {
  omega <- as.matrix(mrgsolve::omat(model))
  eta <- stats::rnorm(nrow(omega), 0, sqrt(pmax(diag(omega), 0)))
  limits <- 2.5 * sqrt(pmax(diag(omega), 0))
  eta <- pmax(-limits, pmin(limits, eta))
  stats::setNames(eta, paste0("ETA", seq_along(eta)))
}

simulate_rich_profile <- function(model_id, covariates, eta, regimen, delta = 0.1) {
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
    addl = max(0, floor((24 - 1e-8) / regimen$interval)),
    rate = regimen$amount / regimen$infusion
  )
  output <- model |>
    mrgsolve::ev(event) |>
    mrgsolve::mrgsim(start = 0, end = 24, delta = delta, recsort = 3) |>
    as.data.frame()
  if (!"DV" %in% names(output)) stop("Model ", model_id, " does not capture DV.")
  profile <- data.frame(time = output$time, concentration = pmax(0, output$DV))
  profile <- profile[!duplicated(profile$time, fromLast = TRUE), , drop = FALSE]
  if (nrow(profile) < 2L || any(!is.finite(profile$concentration))) stop("Invalid rich profile for ", model_id, ".")
  profile
}

add_observation_error <- function(concentrations, model_id) {
  sigma <- diag(as.matrix(mrgsolve::smat(compiled_model(model_id))))
  proportional_sd <- sqrt(max(0, sigma[[1]]))
  additive_sd <- sqrt(max(0, sigma[[2]]))
  pmax(
    0.001,
    concentrations * (1 + stats::rnorm(length(concentrations), 0, proportional_sd)) +
      stats::rnorm(length(concentrations), 0, additive_sd)
  )
}

sample_sparse_profile <- function(profile, regimen, model_id) {
  times <- if (identical(mode_argument, "continuous")) {
    sort(c(stats::runif(1, 4, 12), stats::runif(1, 12, 23.5)))
  } else {
    repeat {
      candidate <- sort(stats::runif(2, 0.2, regimen$interval - 0.15))
      if (diff(candidate) >= 0.5) break
    }
    candidate
  }
  concentrations <- stats::approx(
    profile$time,
    profile$concentration,
    xout = times,
    rule = 2,
    ties = "ordered"
  )$y
  data.frame(
    time = times,
    concentration = add_observation_error(concentrations, model_id)
  )
}

sparse_observation_features <- function(observations) {
  observations <- observations[order(observations$time), , drop = FALSE]
  last <- observations[nrow(observations), , drop = FALSE]
  has_previous <- nrow(observations) >= 2L
  previous <- if (has_previous) observations[nrow(observations) - 1L, , drop = FALSE] else NULL
  c(
    PREV_CONC = if (has_previous) previous$concentration[[1]] else 0,
    PREV_TIME = if (has_previous) previous$time[[1]] else 0,
    LAST_CONC = last$concentration[[1]],
    LAST_TIME = last$time[[1]],
    CONC_DIFF = if (has_previous) last$concentration[[1]] - previous$concentration[[1]] else 0,
    TIME_DIFF = if (has_previous) last$time[[1]] - previous$time[[1]] else 0,
    N_OBS = nrow(observations),
    HAS_PREV = as.integer(has_previous)
  )
}

vancomycin_specifications <- function() {
  lapply(ACTIVE_MODELS, function(id) {
    record <- model_record(id)
    list(
      id = id,
      label = record$label[[1]],
      code = NULL,
      route = "IV",
      mode = if (identical(mode_argument, "continuous")) "IV_CONTINUOUS" else "IV_INTERMITTENT",
      adm_cmt_name = model_administration_cmt(record, "IV")
    )
  })
}

fit_sparse_benchmarks <- function(base_id, covariates, regimen, observations) {
  doses <- data.frame(
    time = 0,
    amount = regimen$amount,
    interval = regimen$interval,
    count = 1,
    infusion = regimen$infusion,
    ss = 1
  )
  fits <- fit_model_set(
    specifications = vancomycin_specifications(),
    doses = doses,
    observations = observations,
    covariates = covariates,
    allow_custom = FALSE
  )
  valid <- successful_fits(fits)
  if (!base_id %in% names(valid)) {
    detail <- fits[[base_id]]$message %||% "unknown MAP error"
    stop("Sparse MAP failed for ", base_id, ": ", detail)
  }
  weights <- compute_model_weights(fits, "AIC")
  base_profile <- simulate_regimen(
    valid[[base_id]],
    dose = regimen$amount,
    interval = regimen$interval,
    infusion = regimen$infusion,
    horizon = 24,
    delta = 0.1
  )
  averaged <- simulate_averaged_regimen(
    fits,
    weights,
    dose = regimen$amount,
    interval = regimen$interval,
    infusion = regimen$infusion,
    horizon = 24,
    delta = 0.1
  )
  c(
    MAP_AUC24 = trap_auc(base_profile$time, base_profile$concentration),
    AVERAGED_AUC24 = averaged$metrics$auc24[[1]]
  )
}

make_patient_row <- function(base_id, generator_id, patient_id) {
  tryCatch({
    covariates <- sample_covariates()
    regimen <- sample_regimen()
    rich_profile <- simulate_rich_profile(
      generator_id,
      covariates,
      sample_eta(compiled_model(generator_id)),
      regimen
    )
    true_auc24 <- trap_auc(rich_profile$time, rich_profile$concentration)
    if (true_auc24 < MIN_AUC24 || true_auc24 > MAX_AUC24 || max(rich_profile$concentration) > MAX_CONCENTRATION) {
      stop("profile outside the prespecified vancomycin simulation domain")
    }
    observations <- sample_sparse_profile(rich_profile, regimen, generator_id)
    benchmarks <- fit_sparse_benchmarks(base_id, covariates, regimen, observations)
    model_covariates <- covariates[model_covariate_names(compiled_model(base_id))]
    features <- c(
      unlist(model_covariates),
      DOSE = regimen$amount,
      INTERVAL = regimen$interval,
      INFUSION = regimen$infusion,
      sparse_observation_features(observations)
    )
    as.data.frame(as.list(c(
      patient_id = patient_id,
      generator = match(generator_id, VANCOMYCIN_MODELS),
      TRUE_AUC24 = true_auc24,
      benchmarks,
      features
    )), check.names = FALSE)
  }, error = function(error) {
    if (!grepl("outside the prespecified", conditionMessage(error), fixed = TRUE)) {
      message("  patient ", patient_id, " skipped: ", conditionMessage(error))
    }
    NULL
  })
}

make_cohort <- function(base_id, generator_ids, n, label) {
  cat("  ", label, ": ", n, " virtual patients from ", paste(generator_ids, collapse = ", "), "\n", sep = "")
  rows <- list()
  attempts <- 0L
  progress_step <- max(1L, floor(n / 10L))
  last_reported <- 0L
  while (length(rows) < n && attempts < n * 6L) {
    attempts <- attempts + 1L
    generator <- generator_ids[[((attempts - 1L) %% length(generator_ids)) + 1L]]
    row <- make_patient_row(base_id, generator, attempts)
    if (!is.null(row)) rows[[length(rows) + 1L]] <- row
    if (length(rows) > last_reported && length(rows) %% progress_step == 0L) {
      cat(".")
      last_reported <- length(rows)
    }
  }
  cat("\n")
  cohort <- do.call(rbind, rows)
  if (is.null(cohort) || nrow(cohort) < n) {
    stop("Too few converged virtual patients for ", label, ".")
  }
  cohort[] <- lapply(cohort, as.numeric)
  cohort <- cohort[stats::complete.cases(cohort) & apply(cohort, 1, function(row) all(is.finite(row))), , drop = FALSE]
  cohort
}

NON_PREDICTORS <- c("patient_id", "generator", "TRUE_AUC24", "MAP_AUC24", "AVERAGED_AUC24")
predictor_names <- function(data) {
  candidates <- setdiff(names(data), NON_PREDICTORS)
  candidates[vapply(data[candidates], function(values) {
    stats::sd(values) > sqrt(.Machine$double.eps)
  }, logical(1))]
}

fold_ids <- function(n, v, seed_value) {
  set.seed(seed_value)
  sample(rep(seq_len(min(v, n)), length.out = n))
}

fit_booster <- function(data, parameters, predictors) {
  matrix <- as.matrix(data[, predictors, drop = FALSE])
  dtrain <- xgboost::xgb.DMatrix(matrix, label = data$TRUE_AUC24)
  xgboost::xgb.train(
    params = list(
      objective = "reg:squarederror",
      eval_metric = "rmse",
      base_score = mean(data$TRUE_AUC24),
      max_depth = parameters$max_depth,
      eta = parameters$eta,
      min_child_weight = parameters$min_child_weight,
      subsample = parameters$subsample,
      colsample_bytree = parameters$colsample_bytree,
      nthread = 1
    ),
    data = dtrain,
    nrounds = parameters$nrounds,
    verbose = 0
  )
}

select_xgb_parameters <- function(data, predictors, seed_value) {
  ids <- fold_ids(nrow(data), INNER_V, seed_value)
  scores <- vapply(seq_along(XGB_GRID), function(grid_index) {
    errors <- numeric()
    for (fold in sort(unique(ids))) {
      fit <- fit_booster(data[ids != fold, , drop = FALSE], XGB_GRID[[grid_index]], predictors)
      predicted <- stats::predict(fit, as.matrix(data[ids == fold, predictors, drop = FALSE]))
      errors <- c(errors, data$TRUE_AUC24[ids == fold] - predicted)
    }
    sqrt(mean(errors^2))
  }, numeric(1))
  XGB_GRID[[which.min(scores)]]
}

fit_elastic <- function(data, predictors, seed_value) {
  x <- as.matrix(data[, predictors, drop = FALSE])
  y <- data$TRUE_AUC24
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

auc_metrics <- function(truth, prediction) {
  keep <- is.finite(truth) & truth > 0 & is.finite(prediction)
  truth <- truth[keep]
  prediction <- prediction[keep]
  if (!length(truth)) return(c(rmse = Inf, relative_rmse_pct = Inf, relative_bias_pct = Inf, within_20_pct = 0))
  errors <- prediction - truth
  c(
    rmse = sqrt(mean(errors^2)),
    relative_rmse_pct = 100 * sqrt(mean(errors^2)) / mean(truth),
    relative_bias_pct = 100 * mean(errors) / mean(truth),
    within_20_pct = 100 * mean(abs(errors / truth) <= 0.2)
  )
}

gain_pct <- function(truth, baseline, candidate) {
  baseline_rmse <- auc_metrics(truth, baseline)[["rmse"]]
  candidate_rmse <- auc_metrics(truth, candidate)[["rmse"]]
  if (!is.finite(baseline_rmse) || baseline_rmse <= 0) return(NA_real_)
  100 * (baseline_rmse - candidate_rmse) / baseline_rmse
}

evaluation_bundle <- function(truth, xgboost, elastic_net, map, averaging) {
  list(
    xgboost = auc_metrics(truth, xgboost),
    elastic_net = auc_metrics(truth, elastic_net),
    map = auc_metrics(truth, map),
    averaging = auc_metrics(truth, averaging),
    xgb_gain_vs_map_pct = gain_pct(truth, map, xgboost),
    xgb_gain_vs_averaging_pct = gain_pct(truth, averaging, xgboost)
  )
}

nested_validate <- function(data, predictors, seed_value) {
  truth <- xgb_prediction <- elastic_prediction <- map_prediction <- averaging_prediction <- numeric()
  for (repeat_index in seq_len(OUTER_REPEATS)) {
    ids <- fold_ids(nrow(data), OUTER_V, seed_value + repeat_index)
    for (fold in sort(unique(ids))) {
      analysis <- data[ids != fold, , drop = FALSE]
      assessment <- data[ids == fold, , drop = FALSE]
      parameters <- select_xgb_parameters(analysis, predictors, seed_value + repeat_index * 100L + fold)
      booster <- fit_booster(analysis, parameters, predictors)
      elastic <- fit_elastic(analysis, predictors, seed_value + repeat_index * 1000L + fold)
      truth <- c(truth, assessment$TRUE_AUC24)
      xgb_prediction <- c(xgb_prediction, stats::predict(booster, as.matrix(assessment[, predictors, drop = FALSE])))
      elastic_prediction <- c(elastic_prediction, predict_elastic(elastic, assessment, predictors))
      map_prediction <- c(map_prediction, assessment$MAP_AUC24)
      averaging_prediction <- c(averaging_prediction, assessment$AVERAGED_AUC24)
    }
  }
  evaluation_bundle(truth, xgb_prediction, elastic_prediction, map_prediction, averaging_prediction)
}

evaluate_predictions <- function(data, booster, elastic, predictors) {
  evaluation_bundle(
    truth = data$TRUE_AUC24,
    xgboost = stats::predict(booster, as.matrix(data[, predictors, drop = FALSE])),
    elastic_net = predict_elastic(elastic, data, predictors),
    map = data$MAP_AUC24,
    averaging = data$AVERAGED_AUC24
  )
}

research_gates_pass <- function(...) {
  sets <- list(...)
  all(vapply(sets, function(metrics) {
    metrics$xgboost[["relative_rmse_pct"]] <= MAX_RELATIVE_RMSE_PCT &&
      abs(metrics$xgboost[["relative_bias_pct"]]) <= MAX_ABSOLUTE_BIAS_PCT &&
      metrics$xgboost[["within_20_pct"]] >= MIN_WITHIN_20_PCT
  }, logical(1)))
}

feature_schema <- function(base_id, predictors) {
  covariates <- model_covariate_names(compiled_model(base_id))
  regimen <- c("DOSE", "INTERVAL", "INFUSION")
  observation <- c("PREV_CONC", "PREV_TIME", "LAST_CONC", "LAST_TIME", "CONC_DIFF", "TIME_DIFF", "N_OBS", "HAS_PREV")
  lapply(predictors, function(name) {
    source <- if (name %in% covariates) {
      "covariate"
    } else if (name %in% regimen) {
      "regimen"
    } else if (name %in% observation) {
      "observation"
    } else {
      stop("No runtime feature source for ", name, ".")
    }
    list(name = name, source = source, key = name)
  })
}

validation_record <- function(metrics) {
  list(
    passed = metrics$xgboost[["relative_rmse_pct"]] <= MAX_RELATIVE_RMSE_PCT &&
      abs(metrics$xgboost[["relative_bias_pct"]]) <= MAX_ABSOLUTE_BIAS_PCT &&
      metrics$xgboost[["within_20_pct"]] >= MIN_WITHIN_20_PCT,
    relativeRmsePct = metrics$xgboost[["relative_rmse_pct"]],
    relativeBiasPct = metrics$xgboost[["relative_bias_pct"]],
    within20Pct = metrics$xgboost[["within_20_pct"]],
    gainVsMapPct = metrics$xgb_gain_vs_map_pct,
    gainVsAveragingPct = metrics$xgb_gain_vs_averaging_pct
  )
}

evaluate_base_model <- function(base_id, index) {
  cat("\n=== ", base_id, " (IV ", mode_argument, ", direct AUC24) ===\n", sep = "")
  validation_generators <- setdiff(ACTIVE_MODELS, base_id)
  development_generators <- base_id
  development <- make_cohort(base_id, development_generators, n_patients, "development")
  alternate <- make_cohort(base_id, validation_generators, n_patients, "unseen PopPK validation")

  set.seed(seed + index)
  holdout_indices <- sample(seq_len(nrow(development)), max(4L, floor(0.25 * nrow(development))))
  holdout <- development[holdout_indices, , drop = FALSE]
  training <- development[-holdout_indices, , drop = FALSE]
  predictors <- predictor_names(training)

  nested <- nested_validate(training, predictors, seed + index * 10000L)
  final_parameters <- select_xgb_parameters(training, predictors, seed + index * 20000L)
  booster <- fit_booster(training, final_parameters, predictors)
  set.seed(seed + index * 40000L)
  explanation_rows <- sample(
    seq_len(nrow(training)),
    min(DALEX_BACKGROUND_SIZE, nrow(training)),
    replace = FALSE
  )
  explanation_background <- training[explanation_rows, predictors, drop = FALSE]
  elastic <- fit_elastic(training, predictors, seed + index * 30000L)
  holdout_metrics <- evaluate_predictions(holdout, booster, elastic, predictors)
  alternate_metrics <- evaluate_predictions(alternate, booster, elastic, predictors)
  gates <- research_gates_pass(nested, holdout_metrics)

  print_metrics <- function(label, metrics) {
    cat(sprintf(
      "  %-17s XGB rRMSE %5.1f%%, bias %+5.1f%% | gain vs MAP %+6.1f%% | vs averaging %+6.1f%%\n",
      label,
      metrics$xgboost[["relative_rmse_pct"]],
      metrics$xgboost[["relative_bias_pct"]],
      metrics$xgb_gain_vs_map_pct,
      metrics$xgb_gain_vs_averaging_pct
    ))
  }
  print_metrics("nested CV", nested)
  print_metrics("untouched test", holdout_metrics)
  print_metrics("alternate PopPK", alternate_metrics)
  cat("  research gates: ", if (gates) "PASS" else "FAIL", " (unseen PopPK reported separately; vancomycin real-patient validation pending)\n", sep = "")

  row <- data.frame(
    base_model = base_id,
    development_generators = paste(development_generators, collapse = "+"),
    validation_generator = validation_generators,
    route = "IV",
    administration_mode = mode_argument,
    target = "AUC24",
    n_training = nrow(training),
    n_holdout = nrow(holdout),
    n_alternate = nrow(alternate),
    nested_xgb_relative_rmse_pct = nested$xgboost[["relative_rmse_pct"]],
    nested_xgb_relative_bias_pct = nested$xgboost[["relative_bias_pct"]],
    nested_xgb_within_20_pct = nested$xgboost[["within_20_pct"]],
    nested_xgb_gain_vs_map_pct = nested$xgb_gain_vs_map_pct,
    nested_xgb_gain_vs_averaging_pct = nested$xgb_gain_vs_averaging_pct,
    holdout_xgb_relative_rmse_pct = holdout_metrics$xgboost[["relative_rmse_pct"]],
    holdout_xgb_relative_bias_pct = holdout_metrics$xgboost[["relative_bias_pct"]],
    holdout_xgb_within_20_pct = holdout_metrics$xgboost[["within_20_pct"]],
    holdout_xgb_gain_vs_map_pct = holdout_metrics$xgb_gain_vs_map_pct,
    holdout_xgb_gain_vs_averaging_pct = holdout_metrics$xgb_gain_vs_averaging_pct,
    alternate_xgb_relative_rmse_pct = alternate_metrics$xgboost[["relative_rmse_pct"]],
    alternate_xgb_relative_bias_pct = alternate_metrics$xgboost[["relative_bias_pct"]],
    alternate_xgb_within_20_pct = alternate_metrics$xgboost[["within_20_pct"]],
    alternate_xgb_gain_vs_map_pct = alternate_metrics$xgb_gain_vs_map_pct,
    alternate_xgb_gain_vs_averaging_pct = alternate_metrics$xgb_gain_vs_averaging_pct,
    research_gates_pass = gates,
    real_patient_status = "pending",
    artifact_saved = FALSE,
    stringsAsFactors = FALSE
  )
  list(
    row = row,
    booster = booster,
    explanation_background = explanation_background,
    predictors = predictors,
    schema = feature_schema(base_id, predictors),
    parameters = final_parameters,
    feature_bounds = lapply(predictors, function(name) {
      list(min = min(training[[name]]), max = max(training[[name]]))
    }) |> stats::setNames(predictors),
    nested = nested,
    holdout = holdout_metrics,
    alternate = alternate_metrics
  )
}

publish_candidate <- function(evaluation) {
  row <- evaluation$row
  if (!isTRUE(row$research_gates_pass[[1]])) return(FALSE)
  base_id <- row$base_model[[1]]
  artifact_id <- paste0(base_id, "-", mode_argument, "-auc24-xgb-v2")
  artifact_directory <- file.path(ML_ROOT, "artifacts")
  if (!dir.exists(artifact_directory)) dir.create(artifact_directory, recursive = TRUE)
  artifact_file <- file.path(artifact_directory, paste0(artifact_id, ".rds"))
  background_file <- file.path(artifact_directory, paste0(artifact_id, "-dalex-background.rds"))
  saveRDS(evaluation$booster, artifact_file)
  saveRDS(evaluation$explanation_background, background_file)
  artifact_sha256 <- digest::digest(artifact_file, algo = "sha256", file = TRUE, serialize = FALSE)
  background_sha256 <- digest::digest(background_file, algo = "sha256", file = TRUE, serialize = FALSE)

  manifest <- read_ml_manifest()
  artifact <- list(
    id = artifact_id,
    drug = "Vancomycine",
    route = "IV",
    administrationMode = mode_argument,
    samplingProtocol = list(
      minimumObservations = 2L,
      steadyStateRequired = TRUE,
      description = "two concentrations across the same steady-state dosing interval"
    ),
    baseModelId = base_id,
    baseModelSha256 = model_sha256(base_id),
    artifactPath = paste0("artifacts/", basename(artifact_file)),
    artifactSha256 = artifact_sha256,
    explanation = list(
      type = "dalex_break_down",
      backgroundPath = paste0("artifacts/", basename(background_file)),
      backgroundSha256 = background_sha256,
      sampleSize = nrow(evaluation$explanation_background),
      synthetic = TRUE
    ),
    featureSchema = evaluation$schema,
    prediction = list(type = "auc24_direct", metric = "AUC24", unit = "mg.h/L", horizonHours = 24),
    methodology = list(
      label = "Simulation-trained direct AUC prediction",
      doi = "10.1016/j.phrs.2021.105578",
      developmentGenerators = strsplit(row$development_generators[[1]], "+", fixed = TRUE)[[1]],
      developmentModelSha256 = stats::setNames(
        lapply(strsplit(row$development_generators[[1]], "+", fixed = TRUE)[[1]], model_sha256),
        strsplit(row$development_generators[[1]], "+", fixed = TRUE)[[1]]
      ),
      unseenValidationGenerator = row$validation_generator[[1]],
      realPatientValidation = "Pending for vancomycin"
    ),
    training = list(
      seed = seed,
      nVirtualDevelopment = n_patients,
      nTraining = row$n_training[[1]],
      nUntouchedHoldout = row$n_holdout[[1]],
      nUnseenPopPk = row$n_alternate[[1]],
      hyperparameters = evaluation$parameters,
      software = list(
        R = R.version.string,
        mrgsolve = as.character(utils::packageVersion("mrgsolve")),
        mapbayr = as.character(utils::packageVersion("mapbayr")),
        xgboost = as.character(utils::packageVersion("xgboost")),
        glmnet = as.character(utils::packageVersion("glmnet"))
      )
    ),
    trainingDomain = list(
      auc24 = list(min = MIN_AUC24, max = MAX_AUC24),
      concentrationMax = MAX_CONCENTRATION,
      features = evaluation$feature_bounds
    ),
    validation = list(
      repeatedNestedCv = validation_record(evaluation$nested),
      untouchedHoldout = validation_record(evaluation$holdout),
      alternatePopPk = validation_record(evaluation$alternate),
      realPatient = list(status = "pending", gainPct = NULL)
    )
  )
  same_scope <- vapply(manifest$artifacts, function(item) {
    identical(item$baseModelId %||% "", base_id) &&
      identical(item$route %||% "", "IV") &&
      identical(item$administrationMode %||% "", mode_argument) &&
      identical(ml_prediction_type(item), "auc24_direct")
  }, logical(1))
  manifest$artifacts <- c(manifest$artifacts[!same_scope], list(artifact))
  jsonlite::write_json(manifest, ML_MANIFEST_PATH, auto_unbox = TRUE, pretty = TRUE, null = "null")
  TRUE
}

cat("Vancomycin simulation-trained direct AUC24 evaluation (", mode_argument, " IV)\n", sep = "")
cat("Methodological reference: doi:10.1016/j.phrs.2021.105578\n")
cat("No patient data are read or written. Research publication is explicit and validation-gated.\n")
evaluations <- lapply(seq_along(base_models), function(index) evaluate_base_model(base_models[[index]], index))

if (publish_research) {
  for (index in seq_along(evaluations)) {
    saved <- publish_candidate(evaluations[[index]])
    evaluations[[index]]$row$artifact_saved <- saved
    cat("  ", evaluations[[index]]$row$base_model[[1]], ": artifact ", if (saved) "published" else "not published", "\n", sep = "")
  }
}

results <- do.call(rbind, lapply(evaluations, `[[`, "row"))
if (nzchar(report_path)) {
  directory <- dirname(report_path)
  if (!dir.exists(directory)) dir.create(directory, recursive = TRUE)
  utils::write.csv(results, report_path, row.names = FALSE)
  cat("Validation report written to ", normalizePath(report_path, winslash = "/", mustWork = TRUE), "\n", sep = "")
}

cat("\nSummary\n")
print(results, row.names = FALSE)
if (!publish_research) cat("\nNo artifact saved. Use --publish-research only after a qualifying full run.\n")
