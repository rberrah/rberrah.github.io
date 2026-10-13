# Complete R reference-method result tables, for use from the consented LOCAL R
# backend only. No external web services or global caches are involved.
# Scientific contract: show a top-100 preview, but do NOT disguise it as
# an exhaustive result. Every fitted feature and every fitted result column
# must be preserved, including non-significant genes and missing q values.
reference_complete_table <- function(x, original_features=NA_integer_,
                                     max_wire_bytes=64L*1024L*1024L) {
  if(is.null(x))stop("Complete reference export requires fitted results.")
  tab <- as.data.frame(x, check.names=FALSE, stringsAsFactors=FALSE)
  if(!"feature" %in% names(tab))stop("Reference result lacks feature IDs.")
  ids <- as.character(tab$feature)
  if(anyNA(ids)||any(!nzchar(ids))||anyDuplicated(ids))
    stop("Complete reference result contains missing or duplicated feature IDs.")
  if(nrow(tab)!=length(ids))stop("Inconsistent reference feature count.")
  if(!is.numeric(max_wire_bytes) || length(max_wire_bytes)!=1L ||
     !is.finite(max_wire_bytes) || max_wire_bytes < 256L)
    stop("Invalid maximum wire export size.")
  value_types <- vapply(tab,function(y) {
    if(is.integer(y))"integer" else if(is.numeric(y))"numeric"
    else if(is.logical(y))"logical" else "string"
  },character(1))
  all_rows <- nrow(tab)
  # This estimate is only a preflight; the final exact byte count is
  # verified below. This guard prevents accidentally serializing a multi-GB
  # study into one HTTP JSON response.
  if(as.double(object.size(tab))>max_wire_bytes*3){
    return(list(referenceTableStatus="too_large",referenceTableComplete=FALSE,
      referenceTableRows=all_rows,referenceTableExportedRows=0L,
      referenceTableColumns=as.list(names(tab)),
      referenceTableTypes=as.list(value_types),
      referenceTableCsv=NULL,referenceTableMessage=
      "Full R result exceeds local HTTP payload budget. Obtain the fitted full CSV from the R analysis output directory. Top rows are only a preview."))
  }
  lines <- character()
  conn <- textConnection("lines",open="w",local=TRUE)
  on.exit(if(isOpen(conn))close(conn),add=TRUE)
  utils::write.csv(tab,file=conn,row.names=FALSE,na="NA",quote=TRUE,
                   fileEncoding="")
  close(conn)
  csv <- paste0(paste(lines,collapse="\n"),"\n")
  bytes <- nchar(csv,type="bytes")
  if(bytes>max_wire_bytes){
    return(list(referenceTableStatus="too_large",referenceTableComplete=FALSE,
      referenceTableRows=all_rows,referenceTableExportedRows=0L,
      referenceTableColumns=as.list(names(tab)),
      referenceTableTypes=as.list(value_types),
      referenceTableCsv=NULL,referenceTableBytes=bytes,
      referenceTableMessage="Result exceeds the configured HTTP payload budget; full R CSV remains available from local analysis files, not this API response."))
  }
  if(!is.na(original_features)){
    original_features<-as.integer(original_features)
    if(original_features<all_rows)
      stop("Fitted reference result unexpectedly has more feature rows than input.")
  }
  list(referenceTableStatus="complete",referenceTableComplete=TRUE,
    referenceTableRows=all_rows,referenceTableExportedRows=all_rows,
    referenceTableOriginalFeatures=if(is.na(original_features))NULL else original_features,
    referenceTableExcludedBeforeFit=if(is.na(original_features))NULL else
      original_features-all_rows,
    referenceTableColumns=as.list(names(tab)),referenceTableTypes=as.list(value_types),
    referenceTableCsv=csv,referenceTableBytes=bytes,
    referenceTableCsvFormat="RFC4180-quoted UTF-8, NA token 'NA', unmodified original feature IDs",
    referenceTableMessage="This is the complete fitted reference table, not a biological or statistical certification. Raw IDs are unchanged; do not open untrusted CSV in spreadsheet software without formula-safety controls."
  )
}
