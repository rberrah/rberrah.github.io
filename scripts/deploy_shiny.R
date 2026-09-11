# Run from the repository root; add --deploy after reviewing the manifest.
args <- commandArgs(trailingOnly = TRUE)
root <- normalizePath("tdm-engine", winslash = "/", mustWork = TRUE)
tracked <- system2("git", c("ls-files", "tdm-engine"), stdout = TRUE)
files <- sub("^tdm-engine/", "", tracked)
files <- files[grepl("^(app\\.R|R/[^/]+\\.R|www/[^/]+\\.(css|js)|models/[^/]+\\.(cpp|json)|ml/registry\\.json|ml/artifacts/[^/]+\\.rds)$", files)]
stopifnot("app.R" %in% files, "models/catalog.json" %in% files,
          all(file.exists(file.path(root, files))))
cat(paste(files, collapse = "\n"), "\n")
cat(length(files), "files;", round(sum(file.info(file.path(root, files))$size) / 1024^2, 1), "MiB\n")
deps <- rsconnect::appDependencies(root, appFiles = files)
print(deps[, intersect(c("Package", "Version", "Source"), names(deps))])
stopifnot(all(c("deSolve", "minpack.lm", "mrgsolve", "mapbayr") %in% deps$Package))
if ("--deploy" %in% args) {
  Sys.setenv(ALLOW_CUSTOM_MODELS = "false")
  rsconnect::deployApp(appDir = root, appFiles = files,
    appId = "17776160", appName = "MIPD_Engine", account = "tdmhub",
    server = "shinyapps.io", launch.browser = FALSE)
}
