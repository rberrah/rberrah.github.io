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


# --- Published cross-omics truth pairs: NCI-60 IntLIM ---
nci_gm_root <- Sys.getenv("NCI60_GM_ROOT", "external/NCI60_GeneMetabolite_Data")
if (dir.exists(nci_gm_root)) {
  gene <- read.csv(file.path(nci_gm_root, "geneData.csv"), row.names = 1, check.names = FALSE)
  metab <- read.csv(file.path(nci_gm_root, "metabData.csv"), row.names = 1, check.names = FALSE)
  pdata <- read.csv(file.path(nci_gm_root, "pData.csv"), check.names = FALSE, stringsAsFactors = FALSE)

  export_pair <- function(gene_name, metab_name, filename) {
    stopifnot(gene_name %in% rownames(gene), metab_name %in% rownames(metab))
    p <- pdata[pdata$cancergroup %in% c("BPO", "Leukemia"), c("cell_line", "cancergroup")]
    common <- Reduce(intersect, list(p$cell_line, colnames(gene), colnames(metab)))
    p <- p[match(common, p$cell_line), , drop = FALSE]
    out <- data.frame(
      sample_id = common,
      condition = p$cancergroup,
      gene = as.numeric(gene[gene_name, common]),
      metabolite = as.numeric(metab[metab_name, common]),
      stringsAsFactors = FALSE,
      check.names = FALSE
    )
    write.csv(out, file.path(out_dir, filename), row.names = FALSE, quote = FALSE)
  }

  export_pair("FAM174B", "malic acid", "nci60_FAM174B_malic.csv")
  export_pair("DNER", "L-beta-imidazolelactic acid", "nci60_DNER_imidazole.csv")
  cat("\nNCI60_INTLIM_PAIRS\n")
  cat("gene_dim:", paste(dim(gene), collapse = "x"), "\n")
  cat("metab_dim:", paste(dim(metab), collapse = "x"), "\n")
}

# --- Published cross-omics truth pair: breast tumour vs normal ---
intlim_root <- Sys.getenv("INTLIM_ROOT", "external/IntLIMVignettes")
brca_root <- file.path(intlim_root, "BRCA_data")
if (dir.exists(brca_root)) {
  gene <- read.csv(file.path(brca_root, "geneData.csv"), row.names = 1, check.names = FALSE)
  metab <- read.csv(file.path(brca_root, "metabData.csv"), row.names = 1, check.names = FALSE)
  pdata <- read.csv(file.path(brca_root, "pData.csv"), check.names = FALSE, stringsAsFactors = FALSE)
  stopifnot("GPT2" %in% rownames(gene), "2-hydroxyglutarate" %in% rownames(metab))

  p <- pdata[pdata$DIAG %in% c("NORMAL", "TUMOR"), c("id", "DIAG")]
  common <- Reduce(intersect, list(p$id, colnames(gene), colnames(metab)))
  p <- p[match(common, p$id), , drop = FALSE]
  out <- data.frame(
    sample_id = common,
    condition = p$DIAG,
    gene = as.numeric(gene["GPT2", common]),
    metabolite = as.numeric(metab["2-hydroxyglutarate", common]),
    stringsAsFactors = FALSE,
    check.names = FALSE
  )
  write.csv(out, file.path(out_dir, "brca_GPT2_2HG.csv"), row.names = FALSE, quote = FALSE)
  cat("\nBRCA_INTLIM_PAIR\n")
  cat("paired_samples:", nrow(out), "\n")
}


# --- NCI-60 incomplete multi-omics from Bioconductor missRows ---
missrows_root <- Sys.getenv("MISSROWS_ROOT", "external/missRows")
missrows_file <- file.path(missrows_root, "data", "NCI60.rda")
if (file.exists(missrows_file)) {
  suppressWarnings(load(missrows_file))
  trans_ids <- colnames(NCI60$dataTables$trans)
  prote_ids <- colnames(NCI60$dataTables$prote)
  all_ids <- union(trans_ids, prote_ids)
  rows <- list()
  k <- 1L
  for (id in trans_ids) {
    rows[[k]] <- data.frame(subject_id=id, sample_id=id, assay_id=paste0("RNA_", id), omic="transcriptomics", condition="NCI60", stringsAsFactors=FALSE)
    k <- k + 1L
  }
  for (id in prote_ids) {
    rows[[k]] <- data.frame(subject_id=id, sample_id=id, assay_id=paste0("PROT_", id), omic="proteomics", condition="NCI60", stringsAsFactors=FALSE)
    k <- k + 1L
  }
  write.csv(do.call(rbind, rows), file.path(out_dir, "missrows_nci60_metadata.csv"), row.names=FALSE, quote=FALSE)
  cat("\nMISSROWS_NCI60\n")
  cat("transcriptomic_subjects:", length(trans_ids), "\n")
  cat("proteomic_subjects:", length(prote_ids), "\n")
  cat("union_subjects:", length(all_ids), "\n")
  cat("matched_subjects:", length(intersect(trans_ids, prote_ids)), "\n")
}


# --- Inspect public Aging HF/CD 3-omics demo objects for deterministic export ---
xomics_root <- Sys.getenv("XOMICS_ROOT", "external/xOmicsShiny")
for (fname in c("AgingHFCD_RNAseq.RData","AgingHFCD_Proteomics.RData","AgingHFCD_Metabolomics.RData")) {
  path <- file.path(xomics_root, "data", fname)
  if (file.exists(path)) {
    env <- new.env(parent=emptyenv())
    load(path, envir=env)
    cat("\nXOMICS_OBJECT", fname, "\n")
    cat("objects:", paste(ls(env), collapse=","), "\n")
    for (nm in ls(env)) {
      obj <- get(nm, envir=env)
      cat("object:", nm, "class:", paste(class(obj), collapse="/"), "\n")
      if (!is.null(dim(obj))) cat("dim:", paste(dim(obj), collapse="x"), "\n")
      if (is.list(obj)) cat("names:", paste(names(obj), collapse=","), "\n")
    }
  }
}
