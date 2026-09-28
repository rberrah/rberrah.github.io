options(warn = 1)
suppressPackageStartupMessages({
  library(mrgsolve)
  library(mapbayr)
  library(jsonlite)
})

`%||%` <- function(value, fallback) if (is.null(value) || !length(value)) fallback else value
APP_ROOT <- normalizePath(file.path(getwd(), "tdm-engine"), winslash = "/", mustWork = TRUE)
source(file.path(APP_ROOT, "R", "model_library.R"), local = TRUE)
source(file.path(APP_ROOT, "R", "pmetrics_engine.R"), local = TRUE)
source(file.path(APP_ROOT, "R", "engine.R"), local = TRUE)

stopifnot(requireNamespace("Pmetrics", quietly = TRUE))
artifact <- read_pmetrics_artifact("demo_one_comp_iv")
stopifnot(
  identical(artifact$structure$template, "one_compartment_iv"),
  abs(sum(artifact$support$prob) - 1) < 1e-12,
  nrow(artifact$support) == 3L
)

invalid <- artifact
invalid$supportPoints[[2]]$ke <- 2
stopifnot(inherits(try(validate_pmetrics_artifact(invalid), silent = TRUE), "try-error"))
polynomial <- artifact
polynomial$error$coefficients[[3]] <- -0.0002
stopifnot(identical(validate_pmetrics_artifact(polynomial)$error$coefficients[[3]], -0.0002))
stopifnot(inherits(try(pmetrics_artifact_path("../outside"), silent = TRUE), "try-error"))
stopifnot(pmetrics_residual_sd(20, list(type = "additive", initial = 5, coefficients = c(1, 0, 0, 0))) == sqrt(26))
stopifnot(pmetrics_residual_sd(20, list(type = "proportional", initial = 2, coefficients = c(1, 0, 0, 0))) == 2)

doses <- data.frame(
  time = 0, amount = 100, interval = 12, count = 1L,
  infusion = 0, ss = 0L, time_uncertainty = 0
)
times <- c(1, 4, 8)
observations <- data.frame(
  time = times,
  concentration = 100 * exp(-0.15 * times) / 30,
  time_uncertainty = 0
)
ss_doses <- doses
ss_doses$ss <- 1L
ss_events <- expand_pmetrics_doses(ss_doses, 36, min_ke = 0.01)
stopifnot(all(c(0, 12, 24, 36) %in% ss_events$time), min(ss_events$time) * 0.01 < log(1e-8))
map_directories_before <- list.files(tempdir(), pattern = "^pmetrics-map-", full.names = TRUE)

soloc <- tempfile("pmetrics-backend-compile-")
dir.create(soloc, recursive = TRUE)
on.exit(unlink(soloc, recursive = TRUE, force = TRUE), add = TRUE)
cache <- new.env(parent = emptyenv())
fit <- fit_one_model(
  specification = list(
    id = artifact$id, artifact_id = artifact$id, engine = "pmetrics",
    label = artifact$label, route = artifact$route, mode = artifact$mode
  ),
  doses = doses,
  observations = observations,
  covariates = list(),
  allow_custom = FALSE,
  custom_soloc = soloc,
  custom_cache = cache
)
map_directories_after <- list.files(tempdir(), pattern = "^pmetrics-map-", full.names = TRUE)

stopifnot(
  identical(fit$engine, "pmetrics"),
  isTRUE(fit$pmetrics$mapped),
  nrow(fit$posterior_points) == 3L,
  abs(sum(fit$posterior_points$prob) - 1) < 1e-10,
  all(c("ke", "v") %in% names(fit$posterior_parameters)),
  fit$posterior_points$prob[[which.min(abs(fit$posterior_points$ke - 0.15))]] > 0.99
)
stopifnot(setequal(map_directories_before, map_directories_after))

profile <- simulate_regimen(fit, dose = 100, interval = 12, infusion = 0, horizon = 24, delta = 0.25)
stopifnot(nrow(profile) > 50L, all(is.finite(profile$concentration)), all(profile$concentration >= 0))

distribution <- simulate_model_distribution(
  fit, dose = 100, interval = 12, infusion = 0,
  replicates = 30, delta = 0.25,
  include_posterior = TRUE, include_residual = TRUE
)
stopifnot(
  nrow(distribution$data) == 30L,
  identical(distribution$uncertainty_mode, "pmetrics_posterior_support"),
  all(is.finite(distribution$data$auc24))
)

specification <- list(
  id = artifact$id, artifact_id = artifact$id, engine = "pmetrics",
  label = artifact$label, route = artifact$route, mode = artifact$mode
)
fits <- fit_model_set(
  specifications = list(specification), doses = doses, observations = observations,
  covariates = list(), allow_custom = FALSE, custom_soloc = soloc, custom_cache = cache
)
weights <- compute_model_weights(fits)
profiles <- fit_profiles(fits, weights, end_time = 24, delta = 0.25)
exposure <- current_regimen_exposure(fits, weights, doses, observations)
recommendations <- recommend_regimens(
  fits, weights, dose_min = 80, dose_max = 120, dose_step = 20,
  intervals = c(12, 24), infusion = 0, metric = "AUC24",
  target_low = 15, target_high = 35, delta = 0.25
)
stopifnot(
  length(successful_fits(fits)) == 1L,
  identical(unname(weights), 1),
  nrow(profiles$average) > 50L,
  is.finite(exposure$steady_state_auc24),
  nrow(recommendations) == 6L,
  all(is.finite(recommendations$auc24))
)

population_fit <- fit_one_model(
  specification = list(
    id = artifact$id, artifact_id = artifact$id, engine = "pmetrics",
    label = artifact$label, route = artifact$route, mode = artifact$mode
  ),
  doses = doses,
  observations = observations[0, , drop = FALSE],
  covariates = list(),
  allow_custom = FALSE,
  custom_soloc = soloc,
  custom_cache = cache
)
stopifnot(!isTRUE(population_fit$pmetrics$mapped), abs(sum(population_fit$posterior_points$prob) - 1) < 1e-12)

cat("Pmetrics artifact, PM_model$map posterior, AUC/C0, dose grid and weighted support distribution OK.\n")
