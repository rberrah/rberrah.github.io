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

doses <- data.frame(time = 0, amount = 1000, interval = 12, count = 4, infusion = 1)
observations <- data.frame(time = 47.5, concentration = 18)
covariates <- list(WT = 70, AGE = 65, CREAT = 90, CREAT2 = 90, SEX = 0, HT = 175, DIAL = 0)
covariate_history <- data.frame(
  time = c(0, 47.5),
  WT = c(70, 74),
  AGE = c(65, 65),
  CREAT = c(90, 110),
  CREAT2 = c(90, 110),
  SEX = c(0, 0),
  HT = c(175, 175),
  DIAL = c(0, 0)
)
model_ids <- c("vanco_goti", "vanco_pkjust", "vanco_revilla", "vanco_roberts")
specifications <- lapply(model_ids, function(id) {
  record <- model_record(id)
  list(id = id, label = record$label[[1]], code = NULL)
})

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

weights <- compute_model_weights(fits, scheme = "AIC")
stopifnot(length(weights) == 4, abs(sum(weights) - 1) < 1e-8)

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

current_exposure <- current_regimen_exposure(fits, weights, doses)
stopifnot(is.finite(current_exposure$auc24), current_exposure$auc24 > 0)
stopifnot(is.finite(current_exposure$c0), current_exposure$c0 >= 0)
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

stopifnot(nrow(recommendations) == 9)
stopifnot(all(is.finite(recommendations$auc24)))
stopifnot(all(recommendations$auc24 > 0))

best <- recommendations[1, ]
cat("TDM engine smoke test OK\n")
cat("Weights:", paste(names(weights), round(weights, 4), collapse = " | "), "\n")
cat("Current exposure: AUC0-24", round(current_exposure$auc24, 1), "; C0", round(current_exposure$c0, 2), "\n")
cat("Best tested scenario:", best$dose, "mg every", best$interval, "h; AUC24", round(best$auc24, 1), "\n")
