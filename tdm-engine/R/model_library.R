if (!exists("APP_ROOT", inherits = TRUE)) {
  APP_ROOT <- normalizePath(getwd(), winslash = "/", mustWork = TRUE)
}

MODEL_ROOT <- file.path(APP_ROOT, "models")
MODEL_CACHE_DIR <- file.path(tempdir(), "pk-mipd-model-cache")
dir.create(MODEL_CACHE_DIR, recursive = TRUE, showWarnings = FALSE)

catalog_path <- file.path(MODEL_ROOT, "catalog.json")
if (!file.exists(catalog_path)) {
  stop("Missing model catalog. Run `npm run tdm:index` from the repository root.")
}

MODEL_CATALOG <- jsonlite::fromJSON(catalog_path, simplifyDataFrame = TRUE)$models
MODEL_CATALOG$label <- paste(MODEL_CATALOG$drug, MODEL_CATALOG$source, sep = " - ")

.model_cache <- new.env(parent = emptyenv())

short_hash <- function(text) {
  hash <- 2166136261 %% 2147483647
  for (byte in as.integer(charToRaw(enc2utf8(text)))) {
    hash <- (hash * 31 + byte) %% 2147483647
  }
  sprintf("%08x", as.integer(hash))
}

safe_model_id <- function(value) {
  value <- gsub("[^A-Za-z0-9_]", "_", value)
  substr(value, 1, 48)
}

catalog_choices <- function(drug = NULL) {
  rows <- MODEL_CATALOG
  if (!is.null(drug)) rows <- rows[rows$drug == drug, , drop = FALSE]
  stats::setNames(rows$id, rows$label)
}

model_record <- function(model_id) {
  row <- MODEL_CATALOG[MODEL_CATALOG$id == model_id, , drop = FALSE]
  if (nrow(row) != 1) stop("Unknown library model: ", model_id)
  row
}

read_library_code <- function(model_id) {
  row <- model_record(model_id)
  path <- file.path(MODEL_ROOT, row$file[[1]])
  paste(readLines(path, warn = FALSE, encoding = "UTF-8"), collapse = "\n")
}

parse_covariates <- function(code) {
  lines <- strsplit(code, "\n", fixed = TRUE)[[1]]
  starts <- which(grepl("^\\s*\\$PARAM.*@covariates", lines, ignore.case = TRUE))
  if (!length(starts)) {
    return(data.frame(name = character(), value = numeric(), description = character()))
  }

  parsed <- list()
  index <- 1L
  for (start in starts) {
    following <- if (start < length(lines)) seq.int(start + 1L, length(lines)) else integer()
    stop_at <- following[grepl("^\\s*\\$[A-Za-z]", lines[following])][1]
    if (is.na(stop_at)) stop_at <- length(lines) + 1L
    block <- lines[seq.int(start + 1L, stop_at - 1L)]

    for (line in block) {
      clean <- trimws(sub("//.*$", "", line))
      if (!nzchar(clean)) next
      parts <- trimws(strsplit(clean, ":", fixed = TRUE)[[1]])
      if (length(parts) < 2 || !grepl("^[A-Za-z_][A-Za-z0-9_]*$", parts[[1]])) next
      value <- suppressWarnings(as.numeric(parts[[2]]))
      if (!is.finite(value)) next
      parsed[[index]] <- data.frame(
        name = parts[[1]],
        value = value,
        description = if (length(parts) > 2) paste(parts[-c(1, 2)], collapse = ": ") else "",
        stringsAsFactors = FALSE
      )
      index <- index + 1L
    }
  }

  if (!length(parsed)) {
    return(data.frame(name = character(), value = numeric(), description = character()))
  }
  unique(do.call(rbind, parsed))
}

compile_model <- function(
  model_id = NULL,
  custom_code = NULL,
  allow_custom = FALSE,
  custom_soloc = NULL,
  custom_cache = NULL
) {
  if (!is.null(custom_code)) {
    if (!isTRUE(allow_custom)) stop("Custom model compilation is disabled on this server.")
    if (!nzchar(trimws(custom_code))) stop("Paste a complete mrgsolve model before compiling.")
    if (is.null(custom_soloc) || !dir.exists(custom_soloc)) {
      stop("A session-scoped compilation directory is required for custom models.")
    }
    key <- safe_model_id(paste0("custom_", short_hash(custom_code)))
    if (!is.null(custom_cache) && !is.null(custom_cache[[key]])) return(custom_cache[[key]])
    model <- mrgsolve::mcode(key, custom_code, soloc = custom_soloc, quiet = TRUE)
    if (!is.null(custom_cache)) custom_cache[[key]] <- model
    return(model)
  }

  row <- model_record(model_id)
  key <- row$id[[1]]
  if (!is.null(.model_cache[[key]])) return(.model_cache[[key]])
  model <- mrgsolve::mread(
    model = key,
    project = MODEL_ROOT,
    file = row$file[[1]],
    soloc = MODEL_CACHE_DIR,
    quiet = TRUE
  )
  .model_cache[[key]] <- model
  model
}

model_param_names <- function(model) names(as.list(mrgsolve::param(model)))

safe_param <- function(model, values) {
  if (is.null(values) || !length(values)) return(model)
  values <- as.list(values)
  values <- values[names(values) %in% model_param_names(model)]
  if (!length(values)) return(model)
  mrgsolve::param(model, values)
}

tagged_compartment <- function(model, tag) {
  annotations <- tryCatch(model@annot$data, error = function(error) data.frame())
  if (!nrow(annotations) || !all(c("block", "name", "options") %in% names(annotations))) return(NA_integer_)
  rows <- annotations[
    annotations$block == "CMT" & grepl(paste0("(^|,\\s*)", tag, "(\\s*,|$)"), annotations$options),
    ,
    drop = FALSE
  ]
  if (!nrow(rows)) return(NA_integer_)
  match(rows$name[[1]], model@cmtL)
}

model_capture_names <- function(model) {
  simulation <- model |>
    mrgsolve::zero_re() |>
    mrgsolve::mrgsim(end = 0, delta = 1) |>
    as.data.frame()
  setdiff(names(simulation), c("ID", "time"))
}

validate_model_contract <- function(model) {
  errors <- character()
  warnings <- character()
  adm <- tagged_compartment(model, "ADM")
  obs <- tagged_compartment(model, "OBS")
  captures <- tryCatch(model_capture_names(model), error = function(error) character())
  omega <- tryCatch(as.matrix(mrgsolve::omat(model)), error = function(error) matrix(numeric(), 0, 0))
  sigma <- tryCatch(as.matrix(mrgsolve::smat(model)), error = function(error) matrix(numeric(), 0, 0))

  if (!is.finite(adm)) errors <- c(errors, "No [ADM] compartment tag was found.")
  if (!is.finite(obs)) errors <- c(errors, "No [OBS] compartment tag was found.")
  if (!length(captures)) errors <- c(errors, "The model does not expose any captured prediction.")
  if (!"DV" %in% captures) warnings <- c(warnings, "DV is not captured; another concentration column will be used.")
  if (!nrow(omega)) errors <- c(errors, "OMEGA is missing; MAP estimation requires random effects.")
  if (!nrow(sigma)) errors <- c(errors, "SIGMA is missing; MAP estimation requires a residual error model.")
  if (!all(paste0("ETA", seq_len(nrow(omega))) %in% model_param_names(model))) {
    errors <- c(errors, "Each OMEGA term must have a matching ETA1, ETA2, ... parameter for mapbayr.")
  }

  list(
    ok = !length(errors),
    errors = unique(errors),
    warnings = unique(warnings),
    adm_cmt = adm,
    obs_cmt = obs,
    captures = captures,
    n_eta = nrow(omega),
    n_sigma = nrow(sigma)
  )
}

pick_concentration_column <- function(data) {
  preferred <- c("DV", "CP", "CONC", "CONC_PLASMA", "CONCENTRATION")
  found <- preferred[preferred %in% names(data)][1]
  if (is.na(found)) stop("No concentration output found. Capture DV, CP or CONC in the model.")
  found
}
