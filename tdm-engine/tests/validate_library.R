suppressPackageStartupMessages({
  library(mrgsolve)
  library(jsonlite)
})

arguments <- commandArgs(trailingOnly = FALSE)
file_argument <- sub("^--file=", "", grep("^--file=", arguments, value = TRUE)[1])
APP_ROOT <- normalizePath(file.path(dirname(file_argument), ".."), winslash = "/", mustWork = TRUE)

source(file.path(APP_ROOT, "R", "model_library.R"), local = TRUE)

failures <- list()

for (model_id in MODEL_CATALOG$id) {
  result <- tryCatch({
    contract <- validate_model_contract(compile_model(model_id = model_id))
    if (!isTRUE(contract$ok)) stop(paste(contract$errors, collapse = " | "))
    contract
  }, error = function(error) error)

  if (inherits(result, "error")) {
    failures[[model_id]] <- conditionMessage(result)
    cat("FAIL ", model_id, ": ", conditionMessage(result), "\n", sep = "")
  } else {
    cat("OK   ", model_id, "\n", sep = "")
  }
}

if (length(failures)) {
  stop(length(failures), " model(s) failed library validation.")
}

cat("TDM library validation OK: ", nrow(MODEL_CATALOG), "/", nrow(MODEL_CATALOG), " models.\n", sep = "")
