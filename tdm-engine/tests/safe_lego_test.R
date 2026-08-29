suppressPackageStartupMessages({
  library(mrgsolve)
  library(jsonlite)
})

arguments <- commandArgs(trailingOnly = FALSE)
file_argument <- sub("^--file=", "", grep("^--file=", arguments, value = TRUE)[1])
APP_ROOT <- normalizePath(file.path(dirname(file_argument), ".."), winslash = "/", mustWork = TRUE)

source(file.path(APP_ROOT, "R", "model_library.R"), local = TRUE)

expect_error <- function(expression, pattern) {
  message <- tryCatch({
    force(expression)
    NULL
  }, error = function(error) conditionMessage(error))
  if (is.null(message) || !grepl(pattern, message, fixed = TRUE)) {
    stop("Expected error containing `", pattern, "`, got: ", message %||% "no error")
  }
}

`%||%` <- function(value, fallback) if (is.null(value) || !length(value)) fallback else value

oral_one_compartment <- list(
  version = 1,
  nodes = list(
    list(id = 1, kind = "depot", name = "depot", dose = 100),
    list(id = 2, kind = "central", name = "centr", dose = 0, vol = 30)
  ),
  edges = list(
    list(from = 1, to = 2, k = 1),
    list(from = 2, to = "OUT", k = 0.2)
  ),
  covariates = list(
    list(name = "WT", type = "continuous", target = "v_centr", reference = 70, comparison = 90, beta = 0.75),
    list(name = "SEX", type = "categorical", target = "v_centr", reference = 0, comparison = 1, beta = 0.2)
  )
)

safe_code <- lego_model_code(oral_one_compartment)
stopifnot(startsWith(safe_code, LEGO_SPEC_PREFIX))
stopifnot(grepl("$PARAM @covariates", safe_code, fixed = TRUE))
stopifnot(grepl("pow(WT/70", safe_code, fixed = TRUE))
stopifnot(grepl("exp(BETA_SEX_2 * (SEX == 1))", safe_code, fixed = TRUE))

legacy_specification <- oral_one_compartment
legacy_specification$covariates <- list(
  list(name = "WT", target = "v_centr", reference = 70, beta = 0.75)
)
legacy_code <- lego_model_code(legacy_specification)
stopifnot(grepl("pow(WT/70", legacy_code, fixed = TRUE))

session_dir <- tempfile("safe-lego-test-")
dir.create(session_dir, recursive = TRUE)
on.exit(unlink(session_dir, recursive = TRUE, force = TRUE), add = TRUE)

model <- compile_model(
  custom_code = safe_code,
  allow_custom = FALSE,
  custom_soloc = session_dir,
  custom_cache = new.env(parent = emptyenv())
)
contract <- validate_model_contract(model)
if (!isTRUE(contract$ok)) stop(paste(contract$errors, collapse = " | "))
stopifnot(all(c("WT", "SEX") %in% model_param_names(model)))
covariate_definition <- parse_covariates(safe_code)
stopifnot(nrow(covariate_definition) == 2L, all(c("WT", "SEX") %in% covariate_definition$name))

expect_error(
  compile_model(
    custom_code = "$GLOBAL\n#include <cstdlib>\n$MAIN\nsystem(\"whoami\");",
    allow_custom = FALSE,
    custom_soloc = session_dir
  ),
  "specification marker is missing"
)

injected <- oral_one_compartment
injected$nodes[[2]]$name <- "centr;system_call"
expect_error(lego_model_code(injected), "Invalid Lego text field")

unknown_source <- oral_one_compartment
unknown_source$nodes[[3]] <- list(
  id = 3, kind = "effect", name = "Ce", dose = 0, ke0 = 0.4, source = 999
)
expect_error(lego_model_code(unknown_source), "does not exist")

invalid_covariate <- oral_one_compartment
invalid_covariate$covariates[[1]]$name <- "DV"
expect_error(lego_model_code(invalid_covariate), "Reserved Lego covariate name")

unknown_target <- oral_one_compartment
unknown_target$covariates[[1]]$target <- "CL_DOES_NOT_EXIST"
expect_error(lego_model_code(unknown_target), "Unknown Lego covariate target")

invalid_type <- oral_one_compartment
invalid_type$covariates[[1]]$type <- "free_cpp"
expect_error(lego_model_code(invalid_type), "Invalid Lego text field")

same_categories <- oral_one_compartment
same_categories$covariates[[2]]$comparison <- 0
expect_error(lego_model_code(same_categories), "reference and comparison must differ")

cat("Safe Lego compilation OK; arbitrary C++ and invalid specifications rejected.\n")
