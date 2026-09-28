# Independent validation of frozen model predictions.
#
# This module deliberately evaluates predictions that were generated without
# refitting on the validation cohort. It does not perform feature selection,
# tune hyperparameters or retrain a multi-omics model on validation data.
# That separation is the core safeguard against calling internal resampling
# "external validation".

validation_clip_probability <- function(x, eps = 1e-6) {
  pmin(1 - eps, pmax(eps, as.numeric(x)))
}

validation_average_ranks <- function(x) {
  x <- as.numeric(x)
  out <- rep(NA_real_, length(x))
  ok <- is.finite(x)
  out[ok] <- rank(x[ok], ties.method = "average")
  out
}

validation_binary_auc <- function(observed, score) {
  y <- as.integer(observed)
  s <- as.numeric(score)
  ok <- is.finite(y) & is.finite(s) & y %in% c(0L, 1L)
  y <- y[ok]
  s <- s[ok]
  n1 <- sum(y == 1L)
  n0 <- sum(y == 0L)
  if (!n1 || !n0) return(NA_real_)
  ranks <- rank(s, ties.method = "average")
  (sum(ranks[y == 1L]) - n1 * (n1 + 1) / 2) / (n1 * n0)
}

validation_binary_metrics <- function(observed, prediction, prediction_kind = c("probability", "score")) {
  prediction_kind <- match.arg(prediction_kind)
  y <- as.integer(observed)
  p <- as.numeric(prediction)
  ok <- is.finite(y) & is.finite(p) & y %in% c(0L, 1L)
  y <- y[ok]
  p <- p[ok]
  if (length(y) < 4L || length(unique(y)) < 2L) {
    return(list(status = "not_estimable", n = length(y), reason = "Both binary classes and at least four evaluable observations are required."))
  }
  auc <- validation_binary_auc(y, p)
  result <- list(
    status = "ok",
    n = length(y),
    events = sum(y == 1L),
    non_events = sum(y == 0L),
    auc = auc,
    prediction_kind = prediction_kind
  )
  if (identical(prediction_kind, "probability")) {
    prob <- validation_clip_probability(p)
    result$brier <- mean((prob - y)^2)
    result$log_loss <- -mean(y * log(prob) + (1 - y) * log(1 - prob))
    lp <- qlogis(prob)
    calibration <- try(stats::glm(y ~ lp, family = stats::binomial()), silent = TRUE)
    if (!inherits(calibration, "try-error")) {
      coefs <- stats::coef(calibration)
      result$calibration_intercept <- unname(coefs[[1]])
      result$calibration_slope <- unname(coefs[[2]])
    } else {
      result$calibration_intercept <- NA_real_
      result$calibration_slope <- NA_real_
    }
  }
  result
}

validation_continuous_metrics <- function(observed, prediction) {
  y <- as.numeric(observed)
  p <- as.numeric(prediction)
  ok <- is.finite(y) & is.finite(p)
  y <- y[ok]
  p <- p[ok]
  if (length(y) < 3L) return(list(status = "not_estimable", n = length(y), reason = "At least three evaluable observations are required."))
  residual <- p - y
  sst <- sum((y - mean(y))^2)
  r2 <- if (sst > 0) 1 - sum(residual^2) / sst else NA_real_
  calibration <- try(stats::lm(y ~ p), silent = TRUE)
  list(
    status = "ok",
    n = length(y),
    rmse = sqrt(mean(residual^2)),
    mae = mean(abs(residual)),
    r2 = r2,
    calibration_intercept = if (!inherits(calibration, "try-error")) unname(stats::coef(calibration)[[1]]) else NA_real_,
    calibration_slope = if (!inherits(calibration, "try-error")) unname(stats::coef(calibration)[[2]]) else NA_real_
  )
}

validation_poisson_deviance <- function(observed, prediction) {
  y <- as.numeric(observed)
  mu <- pmax(as.numeric(prediction), 1e-12)
  ok <- is.finite(y) & is.finite(mu) & y >= 0 & mu > 0
  y <- y[ok]
  mu <- mu[ok]
  if (!length(y)) return(NA_real_)
  terms <- ifelse(y == 0, mu, y * log(y / mu) - (y - mu))
  2 * mean(terms)
}

validation_count_metrics <- function(observed, prediction) {
  base <- validation_continuous_metrics(observed, prediction)
  if (!identical(base$status, "ok")) return(base)
  base$mean_poisson_deviance <- validation_poisson_deviance(observed, prediction)
  base
}

validation_harrell_cindex <- function(time, event, risk) {
  time <- as.numeric(time)
  event <- as.integer(event)
  risk <- as.numeric(risk)
  ok <- is.finite(time) & is.finite(event) & is.finite(risk) & time >= 0 & event %in% c(0L, 1L)
  time <- time[ok]
  event <- event[ok]
  risk <- risk[ok]
  comparable <- 0
  concordant <- 0
  tied <- 0
  n <- length(time)
  if (n < 2L) return(list(c_index = NA_real_, comparable_pairs = 0L))
  for (i in seq_len(n - 1L)) {
    for (j in (i + 1L):n) {
      earlier <- NA_integer_
      later <- NA_integer_
      if (time[[i]] < time[[j]] && event[[i]] == 1L) {
        earlier <- i; later <- j
      } else if (time[[j]] < time[[i]] && event[[j]] == 1L) {
        earlier <- j; later <- i
      } else {
        next
      }
      comparable <- comparable + 1L
      if (risk[[earlier]] > risk[[later]]) concordant <- concordant + 1L
      else if (risk[[earlier]] == risk[[later]]) tied <- tied + 1L
    }
  }
  list(
    c_index = if (comparable) (concordant + 0.5 * tied) / comparable else NA_real_,
    comparable_pairs = comparable,
    concordant_pairs = concordant,
    tied_risk_pairs = tied
  )
}

validation_survival_metrics <- function(time, event, risk) {
  time <- as.numeric(time)
  event <- as.integer(event)
  risk <- as.numeric(risk)
  ok <- is.finite(time) & is.finite(event) & is.finite(risk) & time >= 0 & event %in% c(0L, 1L)
  time <- time[ok]
  event <- event[ok]
  risk <- risk[ok]
  if (length(time) < 5L || sum(event == 1L) < 2L) {
    return(list(status = "not_estimable", n = length(time), events = sum(event == 1L), reason = "At least five subjects and two observed events are required."))
  }
  ci <- validation_harrell_cindex(time, event, risk)
  list(
    status = "ok",
    n = length(time),
    events = sum(event == 1L),
    censored = sum(event == 0L),
    c_index = ci$c_index,
    comparable_pairs = ci$comparable_pairs,
    tied_risk_pairs = ci$tied_risk_pairs
  )
}

validation_multiclass_metrics <- function(observed, probabilities) {
  y <- as.character(observed)
  probs <- as.matrix(probabilities)
  storage.mode(probs) <- "double"
  if (is.null(colnames(probs)) || any(!nzchar(colnames(probs)))) {
    stop("Multiclass probability columns must be named with the corresponding outcome classes.", call. = FALSE)
  }
  ok <- nzchar(y) & y %in% colnames(probs) & apply(probs, 1, function(row) all(is.finite(row)))
  y <- y[ok]
  probs <- probs[ok, , drop = FALSE]
  if (length(y) < 5L || length(unique(y)) < 2L) return(list(status = "not_estimable", n = length(y)))
  rs <- rowSums(probs)
  valid_sum <- is.finite(rs) & rs > 0
  y <- y[valid_sum]
  probs <- probs[valid_sum, , drop = FALSE]
  probs <- probs / rowSums(probs)
  predicted <- colnames(probs)[max.col(probs, ties.method = "first")]
  truth_index <- match(y, colnames(probs))
  p_true <- validation_clip_probability(probs[cbind(seq_along(y), truth_index)])
  class_recall <- vapply(unique(y), function(cls) mean(predicted[y == cls] == cls), numeric(1))
  one_vs_rest_auc <- vapply(colnames(probs), function(cls) {
    validation_binary_auc(as.integer(y == cls), probs[, cls])
  }, numeric(1))
  finite_auc <- one_vs_rest_auc[is.finite(one_vs_rest_auc)]
  list(
    status = "ok",
    n = length(y),
    classes = as.list(table(y)),
    accuracy = mean(predicted == y),
    balanced_accuracy = mean(class_recall, na.rm = TRUE),
    log_loss = -mean(log(p_true)),
    macro_auc_ovr = if (length(finite_auc)) mean(finite_auc) else NA_real_,
    per_class_auc_ovr = as.list(one_vs_rest_auc)
  )
}

validation_percentile_ci <- function(values, level = 0.95) {
  values <- as.numeric(values)
  values <- values[is.finite(values)]
  if (length(values) < 20L) return(c(lower = NA_real_, upper = NA_real_))
  alpha <- (1 - level) / 2
  out <- unname(stats::quantile(values, probs = c(alpha, 1 - alpha), names = FALSE, type = 7))
  names(out) <- c("lower", "upper")
  out
}

validation_bootstrap_scalar <- function(data, metric_fn, repetitions = 1000L, seed = 20260928L, level = 0.95) {
  repetitions <- as.integer(max(0L, repetitions))
  if (!repetitions || nrow(data) < 5L) {
    return(list(
      repetitions = repetitions,
      valid_repetitions = 0L,
      estimate_distribution = numeric(),
      ci = c(lower = NA_real_, upper = NA_real_)
    ))
  }
  set.seed(as.integer(seed))
  values <- rep(NA_real_, repetitions)
  for (b in seq_len(repetitions)) {
    idx <- sample.int(nrow(data), nrow(data), replace = TRUE)
    candidate <- suppressWarnings(as.numeric(metric_fn(data[idx, , drop = FALSE])))
    values[[b]] <- if (length(candidate) && is.finite(candidate[[1]])) candidate[[1]] else NA_real_
  }
  valid <- sum(is.finite(values))
  list(
    repetitions = repetitions,
    valid_repetitions = valid,
    invalid_repetitions = repetitions - valid,
    seed = as.integer(seed),
    ci_level = level,
    ci = validation_percentile_ci(values, level),
    estimate_distribution = values
  )
}

validate_external_predictions <- function(
  data,
  outcome_type,
  prediction_column = "prediction",
  outcome_column = "outcome",
  prediction_kind = "probability",
  time_column = "survival_time",
  event_column = "survival_event",
  probability_columns = NULL,
  independent_cohort = FALSE,
  cohort_label = NULL,
  bootstrap_repetitions = 1000L,
  seed = 20260928L
) {
  data <- as.data.frame(data, stringsAsFactors = FALSE)
  outcome_type <- tolower(trimws(as.character(outcome_type)))
  allowed <- c("binary", "continuous", "count", "survival", "multiclass")
  if (!outcome_type %in% allowed) stop("Unsupported outcome_type.", call. = FALSE)

  required <- switch(
    outcome_type,
    survival = c(time_column, event_column, prediction_column),
    multiclass = c(outcome_column, probability_columns),
    c(outcome_column, prediction_column)
  )
  missing_columns <- setdiff(required, names(data))
  if (length(missing_columns)) stop(paste("Missing validation column(s):", paste(missing_columns, collapse = ", ")), call. = FALSE)

  metrics <- switch(
    outcome_type,
    binary = validation_binary_metrics(data[[outcome_column]], data[[prediction_column]], prediction_kind),
    continuous = validation_continuous_metrics(data[[outcome_column]], data[[prediction_column]]),
    count = validation_count_metrics(data[[outcome_column]], data[[prediction_column]]),
    survival = validation_survival_metrics(data[[time_column]], data[[event_column]], data[[prediction_column]]),
    multiclass = validation_multiclass_metrics(data[[outcome_column]], data[, probability_columns, drop = FALSE])
  )

  primary_name <- switch(outcome_type, binary = "auc", continuous = "rmse", count = "rmse", survival = "c_index", multiclass = "balanced_accuracy")
  bootstrap <- NULL
  if (identical(metrics$status, "ok") && outcome_type != "multiclass") {
    metric_fn <- switch(
      outcome_type,
      binary = function(d) validation_binary_metrics(d[[outcome_column]], d[[prediction_column]], prediction_kind)[[primary_name]],
      continuous = function(d) validation_continuous_metrics(d[[outcome_column]], d[[prediction_column]])[[primary_name]],
      count = function(d) validation_count_metrics(d[[outcome_column]], d[[prediction_column]])[[primary_name]],
      survival = function(d) validation_survival_metrics(d[[time_column]], d[[event_column]], d[[prediction_column]])[[primary_name]]
    )
    boot <- validation_bootstrap_scalar(data, metric_fn, repetitions = bootstrap_repetitions, seed = seed)
    bootstrap <- list(
      metric = primary_name,
      repetitions = boot$repetitions,
      valid_repetitions = boot$valid_repetitions %||% 0L,
      invalid_repetitions = boot$invalid_repetitions %||% 0L,
      seed = boot$seed %||% as.integer(seed),
      ci_level = boot$ci_level %||% 0.95,
      lower = unname(boot$ci[["lower"]]),
      upper = unname(boot$ci[["upper"]]),
      note = "Percentile bootstrap uncertainty on the frozen external predictions; non-estimable resamples are retained as missing and never replaceable by refitting."
    )
  }

  status <- if (isTRUE(independent_cohort)) "external_validation" else "independent_status_not_asserted"
  list(
    status = status,
    evaluation_status = metrics$status,
    cohort = cohort_label,
    independent_cohort_asserted = isTRUE(independent_cohort),
    outcome_type = outcome_type,
    primary_metric = primary_name,
    metrics = metrics,
    bootstrap = bootstrap,
    seed = as.integer(seed),
    methodological_boundary = if (isTRUE(independent_cohort)) {
      "Predictions are evaluated as supplied and are not refit or tuned on this cohort. Independence is asserted by the analyst and must be supported by study provenance."
    } else {
      "Predictions are evaluated without refitting, but the software cannot verify that this cohort is genuinely independent from model development. Do not label this external validation until provenance establishes independence."
    }
  )
}

`%||%` <- function(x, y) if (is.null(x) || !length(x) || all(is.na(x))) y else x
