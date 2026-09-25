#!/usr/bin/env Rscript
cran <- c("plumber","jsonlite","BiocManager","lmerTest")
missing_cran <- cran[!vapply(cran, requireNamespace, logical(1), quietly=TRUE)]
if (length(missing_cran)) install.packages(missing_cran, repos="https://cloud.r-project.org")

bioc <- c("DESeq2","limma","fgsea","MOFA2","mixOmics")
missing_bioc <- bioc[!vapply(bioc, requireNamespace, logical(1), quietly=TRUE)]
if (length(missing_bioc)) BiocManager::install(missing_bioc, ask=FALSE, update=FALSE)

cat("Backend package availability:\n")
for (pkg in c("plumber","jsonlite","DESeq2","limma","lmerTest","fgsea","MOFA2","mixOmics")) {
  cat(sprintf("  %-12s %s\n", pkg, if (requireNamespace(pkg, quietly=TRUE)) "OK" else "MISSING"))
}
