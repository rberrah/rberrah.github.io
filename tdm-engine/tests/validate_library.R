suppressPackageStartupMessages({
  library(mrgsolve)
  library(jsonlite)
})

arguments <- commandArgs(trailingOnly = FALSE)
file_argument <- sub("^--file=", "", grep("^--file=", arguments, value = TRUE)[1])
APP_ROOT <- normalizePath(file.path(dirname(file_argument), ".."), winslash = "/", mustWork = TRUE)

source(file.path(APP_ROOT, "R", "model_library.R"), local = TRUE)

failures <- list()

required_metadata <- c("model", "citation", "doi", "population", "modelType", "sourceStatus")
missing_metadata <- setdiff(required_metadata, names(MODEL_CATALOG))
if (length(missing_metadata)) stop("Missing catalog metadata: ", paste(missing_metadata, collapse = ", "))
if (any(c("source", "provenance") %in% names(MODEL_CATALOG))) {
  stop("Application provenance and filename-derived source fields are forbidden in the model catalog.")
}
if (any(!nzchar(MODEL_CATALOG$citation)) || any(!nzchar(MODEL_CATALOG$doi))) {
  stop("Every library model must cite an article and a DOI.")
}
if (any(grepl("\\bDDI\\b", MODEL_CATALOG$model, ignore.case = TRUE))) {
  stop("Technical DDI suffixes are forbidden in displayed model names.")
}
woillard <- MODEL_CATALOG[MODEL_CATALOG$id == "tacrolimus_woillard_ddi", , drop = FALSE]
if (nrow(woillard) != 1L || !identical(woillard$model[[1]], "Woillard")) {
  stop("The tacrolimus Woillard model must be displayed as `Woillard`.")
}

for (model_id in MODEL_CATALOG$id) {
  result <- tryCatch({
    record <- model_record(model_id)
    routes <- model_routes(record)
    if (!length(routes) || any(!routes %in% c("IV", "Oral")) || anyDuplicated(routes)) {
      stop("Invalid administration routes: ", paste(routes, collapse = ", "))
    }
    model <- compile_model(model_id = model_id)
    contract <- validate_model_contract(model)
    if (!isTRUE(contract$ok)) stop(paste(contract$errors, collapse = " | "))
    for (route in routes) {
      compartment <- model_administration_cmt(record, route)
      if (!compartment %in% model@cmtL) {
        stop(route, " administration compartment `", compartment, "` is absent from the compiled model.")
      }
    }
    contract
  }, error = function(error) error)

  if (inherits(result, "error")) {
    failures[[model_id]] <- conditionMessage(result)
    cat("FAIL ", model_id, ": ", conditionMessage(result), "\n", sep = "")
  } else {
    cat("OK   ", model_id, "\n", sep = "")
  }
}

vancomycin_routes <- lapply(c("vanco_goti", "vanco_pkjust", "vanco_roberts"), function(id) {
  model_routes(model_record(id))
})
if (!all(vapply(vancomycin_routes, identical, logical(1), "IV"))) {
  stop("All vancomycin models must be IV-only.")
}
if (!identical(model_routes(model_record("tacrolimus_woillard_ddi")), "Oral")) {
  stop("The Woillard tacrolimus model must be oral-only.")
}

if (length(failures)) {
  stop(length(failures), " model(s) failed library validation.")
}

cat("TDM library validation OK: ", nrow(MODEL_CATALOG), "/", nrow(MODEL_CATALOG), " models.\n", sep = "")
