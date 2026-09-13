# Only bounded synthetic lab parameters cross this bridge; no observations or code.
teaching_lab_import <- function(spec) {
  if (!is.list(spec) || !identical(spec$type, "pk-teaching-lab") ||
      !isTRUE(spec$version == 1) || length(spec$lab) != 1 || !spec$lab %in% c("distribution", "accumulation")) stop("Invalid teaching laboratory.")
  ranges <- list(dose = c(1, 1000), cl = c(0.1, 30), vc = c(5, 100), q = c(0, 50), vp = c(5, 200),
                 tau = c(1, 48), count = c(1, 20), loading = c(1, 4), end = c(12, 336))
  p <- spec$parameters
  if (!is.list(p) || !setequal(names(p), names(ranges)) || anyDuplicated(names(p))) stop("Invalid teaching parameters.")
  for (key in names(ranges)) {
    v <- p[[key]]
    if (!is.numeric(v) || length(v) != 1 || !is.finite(v) || v < ranges[[key]][1] || v > ranges[[key]][2]) stop(paste("Invalid teaching parameter:", key))
  }
  if (p$count != floor(p$count)) stop("Dose count must be an integer.")
  two <- identical(spec$lab, "distribution")
  doses <- data.frame(time = (seq_len(if (two) 1 else p$count) - 1) * p$tau,
    amount = p$dose, interval = p$tau, count = 1L, infusion = 0, ss = 0L,
    status = "administered", time_uncertainty = 0)
  if (!two) doses$amount[1] <- p$dose * p$loading
  nodes <- list(list(id = 1, kind = "central", name = "CENT", vol = p$vc, dose = doses$amount[1]))
  edges <- list(list(from = 1, to = "OUT", k = p$cl / p$vc, kinetics = "first_order", eliminationParameterization = "clearance", cl = p$cl))
  if (two) {
    nodes[[2]] <- list(id = 2, kind = "periph", name = "PERI", vol = p$vp, dose = 0)
    edges <- c(edges, list(list(from = 1, to = 2, k = p$q / p$vc), list(from = 2, to = 1, k = p$q / p$vp)))
  }
  code <- safe_lego_model_code(specification = list(version = 3, nodes = nodes, edges = edges, covariates = list()))
  list(code = code, doses = doses)
}
