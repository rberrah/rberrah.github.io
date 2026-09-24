args <- commandArgs(trailingOnly = TRUE)
out_dir <- if (length(args) >= 1) args[[1]] else "tmp/public-benchmarks"
dir.create(out_dir, recursive = TRUE, showWarnings = FALSE)

mixomics_root <- Sys.getenv("MIXOMICS_ROOT", "external/mixOmics")

write_matrix <- function(x, feature_ids, assay_ids, path) {
  stopifnot(nrow(x) == length(assay_ids))
  stopifnot(ncol(x) == length(feature_ids))
  out <- data.frame(feature_id = feature_ids, t(as.matrix(x)), check.names = FALSE)
  colnames(out) <- c("feature_id", assay_ids)
  write.csv(out, path, row.names = FALSE, quote = FALSE)
}

write_metadata <- function(subject_ids, assay_ids_by_omic, condition, out_path, extra = list()) {
  rows <- list()
  idx <- 1L
  for (i in seq_along(subject_ids)) {
    for (omic in names(assay_ids_by_omic)) {
      row <- data.frame(
        subject_id = subject_ids[[i]],
        sample_id = subject_ids[[i]],
        assay_id = assay_ids_by_omic[[omic]][[i]],
        omic = omic,
        condition = as.character(condition[[i]]),
        timepoint = "",
        batch = "",
        technical_replicate = "1",
        outcome = "",
        stringsAsFactors = FALSE,
        check.names = FALSE
      )
      if (length(extra)) {
        for (nm in names(extra)) row[[nm]] <- as.character(extra[[nm]][[i]])
      }
      rows[[idx]] <- row
      idx <- idx + 1L
    }
  }
  write.csv(do.call(rbind, rows), out_path, row.names = FALSE, quote = FALSE)
}

# --- Nutrimouse ---
load(file.path(mixomics_root, "data", "nutrimouse.rda"))
nutri_dir <- file.path(out_dir, "nutrimouse")
dir.create(nutri_dir, recursive = TRUE, showWarnings = FALSE)

n <- nrow(nutrimouse$gene)
subjects <- sprintf("MOUSE%03d", seq_len(n))
rna_ids <- sprintf("RNA%03d", seq_len(n))
met_ids <- sprintf("MET%03d", seq_len(n))

write_matrix(nutrimouse$gene, colnames(nutrimouse$gene), rna_ids, file.path(nutri_dir, "transcriptomics.csv"))
write_matrix(nutrimouse$lipid, colnames(nutrimouse$lipid), met_ids, file.path(nutri_dir, "metabolomics.csv"))
write_metadata(
  subjects,
  list(transcriptomics = rna_ids, metabolomics = met_ids),
  nutrimouse$genotype,
  file.path(nutri_dir, "metadata.csv"),
  extra = list(diet = nutrimouse$diet)
)

cat("NUTRIMOUSE\n")
cat("subjects:", n, "\n")
cat("genotype:", paste(names(table(nutrimouse$genotype)), as.integer(table(nutrimouse$genotype)), collapse = "; "), "\n")
cat("diet:", paste(names(table(nutrimouse$diet)), as.integer(table(nutrimouse$diet)), collapse = "; "), "\n")
cat("gene_dim:", paste(dim(nutrimouse$gene), collapse = "x"), "\n")
cat("lipid_dim:", paste(dim(nutrimouse$lipid), collapse = "x"), "\n")
cat("gene_range:", paste(signif(range(as.matrix(nutrimouse$gene), na.rm = TRUE), 5), collapse = ".."), "\n")
cat("lipid_range:", paste(signif(range(as.matrix(nutrimouse$lipid), na.rm = TRUE), 5), collapse = ".."), "\n")
cat("gene_names:", paste(colnames(nutrimouse$gene), collapse = ","), "\n")
cat("lipid_names:", paste(colnames(nutrimouse$lipid), collapse = ","), "\n")

# --- breast.TCGA: HER2-enriched vs LumA ---
load(file.path(mixomics_root, "data", "breast.TCGA.rda"))
tcga <- breast.TCGA$data.train
keep <- as.character(tcga$subtype) %in% c("Her2", "LumA")
mrna <- tcga$mrna[keep, , drop = FALSE]
protein <- tcga$protein[keep, , drop = FALSE]
subtype <- droplevels(tcga$subtype[keep])

tcga_dir <- file.path(out_dir, "tcga-her2-luma")
dir.create(tcga_dir, recursive = TRUE, showWarnings = FALSE)

n2 <- nrow(mrna)
subjects2 <- sprintf("TCGA%03d", seq_len(n2))
rna2 <- sprintf("RNA%03d", seq_len(n2))
prot2 <- sprintf("PROT%03d", seq_len(n2))

write_matrix(mrna, colnames(mrna), rna2, file.path(tcga_dir, "transcriptomics.csv"))
write_matrix(protein, colnames(protein), prot2, file.path(tcga_dir, "proteomics.csv"))
write_metadata(
  subjects2,
  list(transcriptomics = rna2, proteomics = prot2),
  subtype,
  file.path(tcga_dir, "metadata.csv")
)

cat("\nTCGA_HER2_LUMA\n")
cat("subjects:", n2, "\n")
cat("subtype:", paste(names(table(subtype)), as.integer(table(subtype)), collapse = "; "), "\n")
cat("mrna_dim:", paste(dim(mrna), collapse = "x"), "\n")
cat("protein_dim:", paste(dim(protein), collapse = "x"), "\n")
cat("mrna_range:", paste(signif(range(as.matrix(mrna), na.rm = TRUE), 5), collapse = ".."), "\n")
cat("protein_range:", paste(signif(range(as.matrix(protein), na.rm = TRUE), 5), collapse = ".."), "\n")

marker_pattern <- "(?i)(ERBB2|HER2|GRB7|STARD3|PGAP3)"
cat("mrna_marker_features:", paste(grep(marker_pattern, colnames(mrna), value = TRUE, perl = TRUE), collapse = ","), "\n")
cat("protein_marker_features:", paste(grep(marker_pattern, colnames(protein), value = TRUE, perl = TRUE), collapse = ","), "\n")
