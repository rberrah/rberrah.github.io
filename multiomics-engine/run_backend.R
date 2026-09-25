#!/usr/bin/env Rscript
args <- commandArgs(trailingOnly=TRUE)
host <- if (length(args) >= 1L) args[[1]] else Sys.getenv("PMX_MULTIOMICS_HOST", "127.0.0.1")
port <- if (length(args) >= 2L) as.integer(args[[2]]) else as.integer(Sys.getenv("PMX_MULTIOMICS_PORT", "8787"))

if (!requireNamespace("plumber", quietly=TRUE)) stop("Install plumber first: install.packages('plumber')")
if (!requireNamespace("jsonlite", quietly=TRUE)) stop("Install jsonlite first: install.packages('jsonlite')")

api <- plumber::plumb(file.path("multiomics-engine", "server.R"))
cat(sprintf("PMx multi-omics reference R backend: http://%s:%d\n", host, port))
api$run(host=host, port=port, swagger=TRUE)
