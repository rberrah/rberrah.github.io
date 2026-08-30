ML_MANIFEST_VERSION <- 1L
if (!exists("APP_ROOT", inherits = TRUE)) {
  APP_ROOT <- normalizePath(getwd(), winslash = "/", mustWork = TRUE)
}
ML_ROOT <- file.path(APP_ROOT, "ml")
ML_MANIFEST_PATH <- file.path(ML_ROOT, "manifest.json")

model_sha256 <- function(model_id) {
  if (!requireNamespace("digest", quietly = TRUE)) return(NA_character_)
  record <- model_record(model_id)
  path <- file.path(MODEL_ROOT, record$file[[1]])
  digest::digest(path, algo = "sha256", file = TRUE, serialize = FALSE)
}

read_ml_manifest <- function() {
  if (!file.exists(ML_MANIFEST_PATH)) return(list(version = ML_MANIFEST_VERSION, artifacts = list()))
  manifest <- jsonlite::fromJSON(ML_MANIFEST_PATH, simplifyVector = FALSE)
  if (!identical(as.integer(manifest$version %||% 0), ML_MANIFEST_VERSION)) {
    stop("Unsupported hybrid ML manifest version.")
  }
  manifest$artifacts <- manifest$artifacts %||% list()
  manifest
}

ml_artifact_eligibility <- function(artifact, model_id, drug, route) {
  validation <- artifact$validation %||% list()
  identity_ok <- identical(artifact$baseModelId %||% "", model_id) &&
    identical(artifact$drug %||% "", drug) &&
    identical(artifact$route %||% "", route)
  expected_hash <- model_sha256(model_id)
  hash_ok <- is.character(expected_hash) && length(expected_hash) == 1L && !is.na(expected_hash) &&
    identical(tolower(artifact$baseModelSha256 %||% ""), tolower(expected_hash))
  positive <- function(name) {
    value <- suppressWarnings(as.numeric(validation[[name]] %||% NA_real_))
    is.finite(value) && value > 0
  }
  research_ok <- identity_ok && hash_ok &&
    positive("repeatedNestedCvGainPct") &&
    positive("untouchedHoldoutGainPct") &&
    positive("alternatePopPkGainPct")
  real_patient <- validation$realPatient %||% list()
  clinical_ok <- research_ok && identical(real_patient$status %||% "", "validated") &&
    is.finite(suppressWarnings(as.numeric(real_patient$gainPct %||% NA_real_))) &&
    as.numeric(real_patient$gainPct) > 0
  reasons <- c(
    if (!identity_ok) "molécule, voie ou modèle de base incompatible",
    if (!hash_ok) "empreinte SHA-256 du modèle incompatible ou indisponible",
    if (!positive("repeatedNestedCvGainPct")) "validation croisée répétée/imbriquée non favorable",
    if (!positive("untouchedHoldoutGainPct")) "jeu de test interne non touché non favorable",
    if (!positive("alternatePopPkGainPct")) "validation externe sur un autre PopPK non favorable",
    if (!clinical_ok) "validation sur patients réels absente ou non favorable"
  )
  list(research = research_ok, clinical = clinical_ok, reasons = unique(reasons))
}

compatible_ml_artifacts <- function(model_id, drug, route) {
  artifacts <- read_ml_manifest()$artifacts
  if (!length(artifacts)) return(list())
  candidates <- Filter(function(artifact) {
    eligibility <- ml_artifact_eligibility(artifact, model_id, drug, route)
    isTRUE(eligibility$research)
  }, artifacts)
  candidates
}

ml_feature_value <- function(feature, fit) {
  source <- feature$source %||% ""
  key <- feature$key %||% feature$name %||% ""
  if (!nzchar(key)) stop("Hybrid ML feature key is missing.")
  value <- switch(
    source,
    covariate = fit$current_covariates[[key]] %||% NA_real_,
    eta = if (is.null(fit$estimate)) NA_real_ else fit$estimate$final_eta[[1]][[key]] %||% NA_real_,
    map_parameter = if (is.null(fit$estimate)) NA_real_ else tryCatch(
      as.numeric(mapbayr::get_param(fit$estimate, key))[[1]],
      error = function(error) NA_real_
    ),
    stop("Unsupported hybrid ML feature source: ", source)
  )
  value <- suppressWarnings(as.numeric(value))
  if (length(value) != 1L || !is.finite(value)) stop("Hybrid ML feature is unavailable: ", key)
  value
}

resolve_ml_artifact_path <- function(relative_path) {
  relative_path <- as.character(relative_path %||% "")
  if (!nzchar(relative_path) || !grepl("\\.rds$", relative_path, ignore.case = TRUE)) {
    stop("Hybrid ML artifact must be an RDS file.")
  }
  root <- normalizePath(ML_ROOT, winslash = "/", mustWork = TRUE)
  path <- normalizePath(file.path(ML_ROOT, relative_path), winslash = "/", mustWork = TRUE)
  if (!startsWith(path, paste0(root, "/"))) stop("Hybrid ML artifact path escapes its controlled directory.")
  path
}

apply_ml_artifact <- function(fit, artifact) {
  if (is.null(fit$estimate)) stop("Hybrid ML correction requires an individual MAP estimate.")
  features <- artifact$featureSchema %||% list()
  if (!length(features)) stop("Hybrid ML feature schema is empty.")
  feature_names <- vapply(features, function(feature) as.character(feature$name %||% ""), character(1))
  if (any(!nzchar(feature_names)) || anyDuplicated(feature_names)) stop("Hybrid ML feature names are invalid.")
  values <- vapply(features, ml_feature_value, numeric(1), fit = fit)
  matrix <- matrix(values, nrow = 1L, dimnames = list(NULL, feature_names))

  if (!requireNamespace("xgboost", quietly = TRUE)) stop("Package xgboost unavailable; MAP fallback used.")
  booster <- readRDS(resolve_ml_artifact_path(artifact$artifactPath))
  if (!inherits(booster, "xgb.Booster")) stop("Hybrid ML artifact is not an xgboost booster.")
  correction_value <- as.numeric(stats::predict(booster, matrix))[[1]]
  correction <- artifact$correction %||% list()
  if (!identical(correction$type %||% "", "eta_additive")) stop("Only additive ETA corrections are supported.")
  eta_name <- as.character(correction$eta %||% "")
  center <- fit$estimate$final_eta[[1]]
  if (!eta_name %in% names(center)) stop("Hybrid ML correction references an unknown ETA: ", eta_name)
  maximum <- suppressWarnings(as.numeric(correction$maxAbsDelta %||% 0.5))
  if (!is.finite(maximum) || maximum <= 0 || maximum > 2) stop("Hybrid ML correction bound is invalid.")
  bounded <- max(-maximum, min(maximum, correction_value))
  center[[eta_name]] <- center[[eta_name]] + bounded
  fit$ml_eta_override <- center
  fit$ml_correction <- list(
    applied = TRUE,
    artifact_id = artifact$id %||% "unnamed",
    eta = eta_name,
    raw_delta = correction_value,
    applied_delta = bounded,
    bounded = !isTRUE(all.equal(correction_value, bounded)),
    clinical_validation = isTRUE(ml_artifact_eligibility(
      artifact,
      fit$id,
      model_record(fit$id)$drug[[1]],
      fit$contract$route
    )$clinical)
  )
  fit
}

apply_hybrid_ml_to_fits <- function(fits, route) {
  output <- lapply(names(fits), function(id) {
    fit <- fits[[id]]
    if (inherits(fit, "tdm_fit_error") || !id %in% MODEL_CATALOG$id) return(fit)
    record <- model_record(id)
    artifacts <- compatible_ml_artifacts(id, record$drug[[1]], route)
    if (!length(artifacts)) {
      fit$ml_correction <- list(applied = FALSE, reason = "no_compatible_artifact")
      return(fit)
    }
    tryCatch(
      apply_ml_artifact(fit, artifacts[[1]]),
      error = function(error) {
        fit$ml_correction <- list(applied = FALSE, reason = conditionMessage(error))
        fit
      }
    )
  })
  stats::setNames(output, names(fits))
}

ml_application_summary <- function(fits) {
  valid <- successful_fits(fits)
  applied <- vapply(valid, function(fit) isTRUE((fit$ml_correction %||% list())$applied), logical(1))
  if (any(applied)) {
    labels <- vapply(valid[applied], function(fit) fit$ml_correction$artifact_id, character(1))
    return(list(available = sum(applied), message = paste0("Correction ML hybride appliquée : ", paste(labels, collapse = ", "), ".")))
  }
  list(available = 0L, message = "Aucun artefact ML validé et compatible : estimation MAP conservée sans correction.")
}

ml_status_summary <- function(model_ids = character(), route = "") {
  if (!length(model_ids)) {
    return(list(available = 0L, message = "Aucun correcteur ML n'est appliqué aux modèles personnalisés."))
  }
  counts <- vapply(model_ids, function(id) {
    record <- model_record(id)
    length(compatible_ml_artifacts(id, record$drug[[1]], route))
  }, integer(1))
  list(
    available = sum(counts),
    message = if (sum(counts)) {
      paste(sum(counts), "correcteur(s) hybride(s) compatible(s) disponible(s).")
    } else {
      "Aucun artefact ML validé et compatible : estimation MAP conservée sans correction."
    }
  )
}
