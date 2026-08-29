trap_auc <- function(time, concentration) {
  keep <- is.finite(time) & is.finite(concentration)
  time <- time[keep]
  concentration <- concentration[keep]
  if (length(time) < 2) return(NA_real_)
  order_index <- order(time)
  time <- time[order_index]
  concentration <- concentration[order_index]
  sum(diff(time) * (head(concentration, -1) + tail(concentration, -1)) / 2)
}

carry_covariates <- function(event_times, covariate_history, covariates) {
  history_names <- if (is.null(covariate_history)) character() else setdiff(names(covariate_history), "time")
  names_to_apply <- unique(c(names(covariates), history_names))
  if (!length(names_to_apply)) return(data.frame(row.names = seq_along(event_times)))

  output <- list()
  for (name in names_to_apply) {
    fallback <- suppressWarnings(as.numeric(covariates[[name]] %||% NA_real_))
    if (length(fallback) != 1L || !is.finite(fallback)) fallback <- NA_real_
    history <- data.frame()
    if (!is.null(covariate_history) && all(c("time", name) %in% names(covariate_history))) {
      history <- data.frame(
        time = suppressWarnings(as.numeric(covariate_history$time)),
        value = suppressWarnings(as.numeric(covariate_history[[name]]))
      )
      history <- history[is.finite(history$time) & is.finite(history$value), , drop = FALSE]
      history <- history[order(history$time), , drop = FALSE]
    }

    if (!nrow(history)) {
      output[[name]] <- rep(fallback, length(event_times))
      next
    }
    positions <- findInterval(event_times, history$time)
    positions[positions == 0L] <- 1L
    output[[name]] <- history$value[positions]
  }
  as.data.frame(output, check.names = FALSE)
}

build_map_data <- function(doses, observations, adm_cmt, obs_cmt, covariates, covariate_history = NULL) {
  if (!nrow(doses)) stop("At least one administered dose is required.")
  dose_ss <- if ("ss" %in% names(doses)) as.integer(doses$ss) else rep(0L, nrow(doses))
  if (any(!dose_ss %in% c(0L, 1L)) || any(dose_ss == 1L & doses$interval <= 0)) {
    stop("Steady-state doses require ss = 1 and a positive interval.")
  }

  dose_rows <- data.frame(
    ID = 1,
    time = doses$time,
    evid = 1,
    cmt = adm_cmt,
    amt = doses$amount,
    rate = ifelse(doses$infusion > 0, doses$amount / doses$infusion, 0),
    ii = doses$interval,
    addl = ifelse(dose_ss == 1L, 0, pmax(0, doses$count - 1)),
    ss = dose_ss,
    DV = NA_real_,
    mdv = 1,
    stringsAsFactors = FALSE
  )

  observation_rows <- data.frame(
    ID = rep(1, nrow(observations)),
    time = observations$time,
    evid = rep(0, nrow(observations)),
    cmt = rep(obs_cmt, nrow(observations)),
    amt = rep(0, nrow(observations)),
    rate = rep(0, nrow(observations)),
    ii = rep(0, nrow(observations)),
    addl = rep(0, nrow(observations)),
    ss = rep(0L, nrow(observations)),
    DV = observations$concentration,
    mdv = rep(0, nrow(observations)),
    stringsAsFactors = FALSE
  )

  data <- rbind(dose_rows, observation_rows)
  data <- data[order(data$time, -data$evid), , drop = FALSE]
  time_covariates <- carry_covariates(data$time, covariate_history, covariates)
  for (name in names(time_covariates)) data[[name]] <- time_covariates[[name]]
  rownames(data) <- NULL
  data
}

fit_one_model <- function(
  specification,
  doses,
  observations,
  covariates,
  allow_custom,
  covariate_history = NULL,
  custom_soloc = NULL,
  custom_cache = NULL
) {
  model <- compile_model(
    model_id = specification$id,
    custom_code = specification$code,
    allow_custom = allow_custom,
    custom_soloc = custom_soloc,
    custom_cache = custom_cache
  )
  accepted_covariates <- model_param_names(model)
  model_covariates <- covariates[names(covariates) %in% accepted_covariates]
  current_covariates <- model_covariates
  if (!is.null(covariate_history)) {
    history_names <- intersect(setdiff(names(covariate_history), "time"), accepted_covariates)
    covariate_history <- covariate_history[, c("time", history_names), drop = FALSE]
    history_order <- order(suppressWarnings(as.numeric(covariate_history$time)))
    for (name in history_names) {
      values <- suppressWarnings(as.numeric(covariate_history[[name]][history_order]))
      values <- values[is.finite(values)]
      if (length(values)) current_covariates[[name]] <- tail(values, 1)
    }
  }
  model <- safe_param(model, model_covariates)
  contract <- validate_model_contract(model)
  if (!contract$ok) stop(paste(contract$errors, collapse = " "))

  data <- build_map_data(
    doses = doses,
    observations = observations,
    adm_cmt = contract$adm_cmt,
    obs_cmt = contract$obs_cmt,
    covariates = model_covariates,
    covariate_history = covariate_history
  )

  estimate <- NULL
  if (nrow(observations)) {
    estimate <- mapbayr::mapbayest(
      x = model,
      data = data,
      hessian = TRUE,
      verbose = FALSE,
      progress = FALSE
    )
  }

  list(
    id = specification$id %||% "custom",
    label = specification$label,
    model = model,
    estimate = estimate,
    data = data,
    contract = contract,
    current_covariates = current_covariates
  )
}

fit_model_set <- function(
  specifications,
  doses,
  observations,
  covariates,
  allow_custom,
  covariate_history = NULL,
  custom_soloc = NULL,
  custom_cache = NULL
) {
  fits <- lapply(specifications, function(specification) {
    tryCatch(
      fit_one_model(
        specification,
        doses,
        observations,
        covariates,
        allow_custom,
        covariate_history,
        custom_soloc,
        custom_cache
      ),
      error = function(error) structure(list(
        id = specification$id %||% "custom",
        label = specification$label,
        message = conditionMessage(error)
      ), class = "tdm_fit_error")
    )
  })
  names(fits) <- vapply(specifications, function(item) item$id %||% "custom", character(1))
  fits
}

successful_fits <- function(fits) {
  Filter(function(item) !inherits(item, "tdm_fit_error"), fits)
}

compute_model_weights <- function(fits, scheme = "AIC") {
  valid <- successful_fits(fits)
  if (!length(valid)) return(numeric())
  estimates <- lapply(valid, `[[`, "estimate")
  if (length(valid) == 1 || any(vapply(estimates, is.null, logical(1)))) {
    return(stats::setNames(rep(1 / length(valid), length(valid)), names(valid)))
  }

  weights <- tryCatch(
    mapbayr::compute_weights(estlist = estimates, scheme = scheme),
    error = function(error) NULL
  )
  if (is.null(weights)) {
    return(stats::setNames(rep(1 / length(valid), length(valid)), names(valid)))
  }
  values <- as.numeric(weights[1, ])
  stats::setNames(values / sum(values), colnames(weights))
}

individual_model <- function(fit) {
  model <- if (is.null(fit$estimate)) fit$model else mapbayr::use_posterior(fit$estimate)
  model <- safe_param(model, fit$current_covariates %||% list())
  mrgsolve::zero_re(model)
}

simulate_regimen <- function(fit, dose, interval, infusion, horizon = 24, delta = 0.1) {
  model <- individual_model(fit)
  extra_doses <- max(0, floor((horizon - 1e-8) / interval))
  event <- mrgsolve::ev(
    amt = dose,
    ii = interval,
    cmt = fit$contract$adm_cmt,
    ss = 1,
    addl = extra_doses,
    rate = if (infusion > 0) dose / infusion else 0
  )
  simulation <- model |>
    mrgsolve::ev(event) |>
    mrgsolve::mrgsim(start = 0, end = horizon, delta = delta, recsort = 3) |>
    as.data.frame()
  column <- pick_concentration_column(simulation)
  data.frame(
    time = simulation$time,
    concentration = pmax(0, simulation[[column]]),
    model = fit$id,
    stringsAsFactors = FALSE
  )
}

average_profiles <- function(profiles, weights) {
  if (!length(profiles)) stop("No simulation profile is available.")
  grid <- sort(unique(unlist(lapply(profiles, `[[`, "time"))))
  averaged <- rep(0, length(grid))
  used_weight <- 0
  for (name in names(profiles)) {
    weight <- weights[[name]] %||% 0
    if (!is.finite(weight) || weight <= 0) next
    profile <- profiles[[name]]
    averaged <- averaged + stats::approx(
      profile$time,
      profile$concentration,
      xout = grid,
      rule = 2,
      ties = "ordered"
    )$y * weight
    used_weight <- used_weight + weight
  }
  if (used_weight <= 0) stop("No valid model weight is available.")
  data.frame(time = grid, concentration = averaged / used_weight)
}

profile_metrics <- function(profile) {
  data.frame(
    auc24 = trap_auc(profile$time, profile$concentration),
    cmin = min(profile$concentration, na.rm = TRUE),
    cmax = max(profile$concentration, na.rm = TRUE)
  )
}

simulate_averaged_regimen <- function(fits, weights, dose, interval, infusion) {
  valid <- successful_fits(fits)
  profiles <- lapply(valid, simulate_regimen, dose = dose, interval = interval, infusion = infusion)
  names(profiles) <- names(valid)
  averaged <- average_profiles(profiles, weights)
  list(profile = averaged, metrics = profile_metrics(averaged), per_model = profiles)
}

current_regimen_exposure <- function(fits, weights, doses) {
  if (!nrow(doses)) stop("At least one administered dose is required.")
  dose_ss <- if ("ss" %in% names(doses)) as.integer(doses$ss) else rep(0L, nrow(doses))
  last_administration <- doses$time + ifelse(dose_ss == 1L, 0, doses$interval * pmax(0, doses$count - 1))
  regimen <- doses[which.max(last_administration), , drop = FALSE]
  steady_state <- "ss" %in% names(regimen) && isTRUE(as.integer(regimen$ss[[1]]) == 1L)
  recorded_interval <- as.numeric(regimen$interval[[1]])
  single_dose <- !steady_state && (!is.finite(recorded_interval) || recorded_interval <= 0)
  interval <- if (single_dose) 24 else recorded_interval
  dose <- as.numeric(regimen$amount[[1]])
  infusion <- as.numeric(regimen$infusion[[1]])
  valid <- successful_fits(fits)
  if (!length(valid)) stop("No fitted model is available for current exposure.")

  auc_profiles <- lapply(
    valid,
    simulate_regimen,
    dose = dose,
    interval = interval,
    infusion = infusion,
    horizon = 24,
    delta = 0.05
  )
  names(auc_profiles) <- names(valid)
  average_auc_profile <- average_profiles(auc_profiles, weights)
  auc_rows <- average_auc_profile$time >= 0 & average_auc_profile$time <= 24
  auc24 <- trap_auc(
    average_auc_profile$time[auc_rows],
    average_auc_profile$concentration[auc_rows]
  )

  trough_profiles <- lapply(
    valid,
    simulate_regimen,
    dose = dose,
    interval = interval,
    infusion = infusion,
    horizon = interval,
    delta = min(0.05, interval / 100)
  )
  names(trough_profiles) <- names(valid)
  average_trough_profile <- average_profiles(trough_profiles, weights)
  c0 <- stats::approx(
    average_trough_profile$time,
    average_trough_profile$concentration,
    xout = interval,
    rule = 2,
    ties = "ordered"
  )$y[[1]]

  list(
    auc24 = auc24,
    c0 = c0,
    dose = dose,
    interval = interval,
    recorded_interval = recorded_interval,
    infusion = infusion,
    steady_state = steady_state,
    single_dose = single_dose
  )
}

recommend_regimens <- function(
  fits,
  weights,
  dose_min,
  dose_max,
  dose_step,
  intervals,
  infusion,
  metric,
  target_low,
  target_high
) {
  doses <- seq(dose_min, dose_max, by = dose_step)
  scenarios <- expand.grid(
    dose = doses,
    interval = intervals,
    KEEP.OUT.ATTRS = FALSE,
    stringsAsFactors = FALSE
  )
  if (nrow(scenarios) > 500) stop("The dose grid is too large; use a wider dose step.")

  metrics <- lapply(seq_len(nrow(scenarios)), function(index) {
    result <- simulate_averaged_regimen(
      fits,
      weights,
      dose = scenarios$dose[[index]],
      interval = scenarios$interval[[index]],
      infusion = infusion
    )$metrics
    result
  })
  metrics <- do.call(rbind, metrics)
  output <- cbind(scenarios, metrics)
  selected <- switch(metric, AUC24 = output$auc24, Cmin = output$cmin, Cmax = output$cmax)
  span <- max(target_high - target_low, .Machine$double.eps)
  output$value <- selected
  output$in_target <- selected >= target_low & selected <= target_high
  output$distance <- ifelse(
    selected < target_low,
    (target_low - selected) / span,
    ifelse(selected > target_high, (selected - target_high) / span, 0)
  )
  center <- (target_low + target_high) / 2
  output$center_distance <- abs(selected - center) / max(abs(center), .Machine$double.eps)
  output <- output[order(output$distance, output$center_distance, output$dose), , drop = FALSE]
  rownames(output) <- NULL
  output
}

fit_profiles <- function(fits, weights, end_time) {
  valid <- successful_fits(fits)
  profiles <- list()
  for (name in names(valid)) {
    estimate <- valid[[name]]$estimate
    if (is.null(estimate)) next
    augmented <- mapbayr::augment(estimate, end = end_time, delta = 0.25)$aug_tab
    profile <- augmented[augmented$type == "IPRED", c("time", "value"), drop = FALSE]
    names(profile) <- c("time", "concentration")
    profile$model <- name
    profiles[[name]] <- profile
  }
  if (!length(profiles)) return(list(per_model = data.frame(), average = data.frame()))
  list(
    per_model = do.call(rbind, profiles),
    average = average_profiles(profiles, weights)
  )
}

model_summary <- function(fits, weights) {
  rows <- lapply(names(fits), function(name) {
    fit <- fits[[name]]
    if (inherits(fit, "tdm_fit_error")) {
      return(data.frame(
        model = fit$label,
        status = "Error",
        weight = 0,
        clearance = NA_real_,
        eta = "",
        detail = fit$message,
        stringsAsFactors = FALSE
      ))
    }
    clearance <- tryCatch(
      if (is.null(fit$estimate)) NA_real_ else as.numeric(mapbayr::get_param(fit$estimate, "CL"))[[1]],
      error = function(error) NA_real_
    )
    eta <- tryCatch(
      if (is.null(fit$estimate)) "Population" else paste(round(mapbayr::get_eta(fit$estimate), 4), collapse = ", "),
      error = function(error) ""
    )
    data.frame(
      model = fit$label,
      status = if (is.null(fit$estimate)) "Population" else "MAP",
      weight = weights[[name]] %||% 0,
      clearance = clearance,
      eta = eta,
      detail = paste0(fit$contract$n_eta, " ETA; ", fit$contract$n_sigma, " residual terms"),
      stringsAsFactors = FALSE
    )
  })
  do.call(rbind, rows)
}
