if (!exists("APP_ROOT", inherits = TRUE)) {
  APP_ROOT <- normalizePath(getwd(), winslash = "/", mustWork = TRUE)
}

MODEL_ROOT <- file.path(APP_ROOT, "models")
MODEL_CACHE_DIR <- file.path(tempdir(), "pk-mipd-model-cache")
dir.create(MODEL_CACHE_DIR, recursive = TRUE, showWarnings = FALSE)

catalog_path <- file.path(MODEL_ROOT, "catalog.json")
if (!file.exists(catalog_path)) {
  stop("Missing model catalog. Run `npm run tdm:index` from the repository root.")
}

MODEL_CATALOG <- jsonlite::fromJSON(catalog_path, simplifyDataFrame = TRUE)$models
MODEL_CATALOG$label <- paste(MODEL_CATALOG$drug, MODEL_CATALOG$source, sep = " - ")

.model_cache <- new.env(parent = emptyenv())

short_hash <- function(text) {
  hash <- 2166136261 %% 2147483647
  for (byte in as.integer(charToRaw(enc2utf8(text)))) {
    hash <- (hash * 31 + byte) %% 2147483647
  }
  sprintf("%08x", as.integer(hash))
}

safe_model_id <- function(value) {
  value <- gsub("[^A-Za-z0-9_]", "_", value)
  substr(value, 1, 48)
}

catalog_choices <- function(drug = NULL) {
  rows <- MODEL_CATALOG
  if (!is.null(drug)) rows <- rows[rows$drug == drug, , drop = FALSE]
  stats::setNames(rows$id, rows$label)
}

model_record <- function(model_id) {
  row <- MODEL_CATALOG[MODEL_CATALOG$id == model_id, , drop = FALSE]
  if (nrow(row) != 1) stop("Unknown library model: ", model_id)
  row
}

read_library_code <- function(model_id) {
  row <- model_record(model_id)
  path <- file.path(MODEL_ROOT, row$file[[1]])
  paste(readLines(path, warn = FALSE, encoding = "UTF-8"), collapse = "\n")
}

parse_covariates <- function(code) {
  lines <- strsplit(code, "\n", fixed = TRUE)[[1]]
  starts <- which(grepl("^\\s*\\$PARAM.*@covariates", lines, ignore.case = TRUE))
  if (!length(starts)) {
    return(data.frame(name = character(), value = numeric(), description = character()))
  }

  parsed <- list()
  index <- 1L
  for (start in starts) {
    following <- if (start < length(lines)) seq.int(start + 1L, length(lines)) else integer()
    stop_at <- following[grepl("^\\s*\\$[A-Za-z]", lines[following])][1]
    if (is.na(stop_at)) stop_at <- length(lines) + 1L
    block <- lines[seq.int(start + 1L, stop_at - 1L)]

    for (line in block) {
      clean <- trimws(sub("//.*$", "", line))
      if (!nzchar(clean)) next
      parts <- trimws(strsplit(clean, ":", fixed = TRUE)[[1]])
      if (length(parts) < 2 || !grepl("^[A-Za-z_][A-Za-z0-9_]*$", parts[[1]])) next
      value <- suppressWarnings(as.numeric(parts[[2]]))
      if (!is.finite(value)) next
      parsed[[index]] <- data.frame(
        name = parts[[1]],
        value = value,
        description = if (length(parts) > 2) paste(parts[-c(1, 2)], collapse = ": ") else "",
        stringsAsFactors = FALSE
      )
      index <- index + 1L
    }
  }

  if (!length(parsed)) {
    return(data.frame(name = character(), value = numeric(), description = character()))
  }
  unique(do.call(rbind, parsed))
}

LEGO_SPEC_PREFIX <- "// PK_LEGO_SPEC_V1:"
LEGO_NODE_KINDS <- c("depot", "transit", "central", "periph", "metab", "effect", "response")
LEGO_VOLUME_KINDS <- c("central", "periph", "metab")
LEGO_PD_KINDS <- c("effect", "response")
LEGO_RESERVED_COVARIATES <- c(
  "ID", "TIME", "CMT", "AMT", "EVID", "RATE", "II", "ADDL", "SS", "DV", "MDV", "IPRED", "ETA", "EPS"
)

lego_record_list <- function(value, field) {
  if (is.null(value)) return(list())
  if (is.data.frame(value)) {
    return(lapply(seq_len(nrow(value)), function(index) as.list(value[index, , drop = FALSE])))
  }
  if (!is.list(value)) stop("Lego field `", field, "` must be an array.")
  value
}

lego_scalar <- function(value, field, default = NULL) {
  if (is.null(value) || !length(value)) {
    if (!is.null(default)) return(default)
    stop("Missing Lego field `", field, "`.")
  }
  if (is.list(value)) value <- unlist(value, recursive = TRUE, use.names = FALSE)
  if (length(value) != 1L) stop("Lego field `", field, "` must contain one value.")
  value[[1]]
}

lego_number <- function(value, field, minimum, maximum, default = NULL, integer = FALSE) {
  raw <- lego_scalar(value, field, default)
  number <- suppressWarnings(as.numeric(raw))
  if (length(number) != 1L || !is.finite(number) || number < minimum || number > maximum) {
    stop("Invalid Lego numeric field `", field, "`.")
  }
  if (isTRUE(integer) && abs(number - round(number)) > .Machine$double.eps^0.5) {
    stop("Lego field `", field, "` must be an integer.")
  }
  if (isTRUE(integer)) as.integer(round(number)) else number
}

lego_text <- function(value, field, pattern, maximum = 32L) {
  text <- as.character(lego_scalar(value, field))
  if (nchar(text, type = "bytes") > maximum || !grepl(pattern, text, perl = TRUE)) {
    stop("Invalid Lego text field `", field, "`.")
  }
  text
}

normalize_lego_spec <- function(specification) {
  if (!is.list(specification)) stop("The Lego specification must be a JSON object.")
  version <- lego_number(specification$version, "version", 1, 1, integer = TRUE)
  input_nodes <- lego_record_list(specification$nodes, "nodes")
  input_edges <- lego_record_list(specification$edges, "edges")
  input_covariates <- lego_record_list(specification$covariates, "covariates")

  if (!length(input_nodes) || length(input_nodes) > 20L) {
    stop("A Lego model must contain between 1 and 20 compartments.")
  }
  if (length(input_edges) > 60L) stop("A Lego model cannot contain more than 60 transfers.")
  if (length(input_covariates) > 10L) stop("A Lego model cannot contain more than 10 covariates.")

  nodes <- lapply(seq_along(input_nodes), function(index) {
    input <- input_nodes[[index]]
    if (!is.list(input)) stop("Each Lego compartment must be an object.")
    id <- lego_number(input$id, paste0("nodes[", index, "].id"), 1, 1000000, integer = TRUE)
    kind <- lego_text(input$kind, paste0("nodes[", index, "].kind"), "^[a-z]+$", 16L)
    if (!kind %in% LEGO_NODE_KINDS) stop("Unsupported Lego compartment kind: ", kind)
    name <- lego_text(input$name, paste0("nodes[", index, "].name"), "^[A-Za-z_][A-Za-z0-9_]*$", 32L)
    node <- list(
      id = id,
      kind = kind,
      name = name,
      dose = lego_number(input$dose, paste0("nodes[", index, "].dose"), 0, 1e9, default = 0)
    )
    if (kind %in% LEGO_VOLUME_KINDS) {
      node$vol <- lego_number(input$vol, paste0("nodes[", index, "].vol"), 1e-6, 1e9)
    }
    if (identical(kind, "effect")) {
      node$ke0 <- lego_number(input$ke0, paste0("nodes[", index, "].ke0"), 0, 1e6, default = 0.4)
      node$source <- lego_number(input$source, paste0("nodes[", index, "].source"), 1, 1000000, integer = TRUE)
    }
    if (identical(kind, "response")) {
      node$kin <- lego_number(input$kin, paste0("nodes[", index, "].kin"), 0, 1e12, default = 10)
      node$kout <- lego_number(input$kout, paste0("nodes[", index, "].kout"), 1e-12, 1e6, default = 0.15)
      node$smax <- lego_number(input$smax, paste0("nodes[", index, "].smax"), -1e6, 1e6, default = 3)
      node$sc50 <- lego_number(input$sc50, paste0("nodes[", index, "].sc50"), 1e-12, 1e12, default = 3)
      node$source <- lego_number(input$source, paste0("nodes[", index, "].source"), 1, 1000000, integer = TRUE)
    }
    node
  })

  node_ids <- vapply(nodes, `[[`, integer(1), "id")
  node_names <- vapply(nodes, `[[`, character(1), "name")
  if (anyDuplicated(node_ids)) stop("Lego compartment identifiers must be unique.")
  if (anyDuplicated(node_names)) stop("Lego compartment names must be unique.")

  for (node in nodes) {
    if (node$kind %in% LEGO_PD_KINDS && !node$source %in% node_ids) {
      stop("The source of Lego compartment `", node$name, "` does not exist.")
    }
  }

  edges <- lapply(seq_along(input_edges), function(index) {
    input <- input_edges[[index]]
    if (!is.list(input)) stop("Each Lego transfer must be an object.")
    from <- lego_number(input$from, paste0("edges[", index, "].from"), 1, 1000000, integer = TRUE)
    if (!from %in% node_ids) stop("A Lego transfer references an unknown source compartment.")
    raw_to <- lego_scalar(input$to, paste0("edges[", index, "].to"))
    to <- if (identical(as.character(raw_to), "OUT")) {
      "OUT"
    } else {
      lego_number(raw_to, paste0("edges[", index, "].to"), 1, 1000000, integer = TRUE)
    }
    if (!identical(to, "OUT") && !to %in% node_ids) {
      stop("A Lego transfer references an unknown destination compartment.")
    }
    if (!identical(to, "OUT") && identical(from, to)) stop("A Lego transfer cannot loop to itself.")
    list(
      from = from,
      to = to,
      k = lego_number(input$k, paste0("edges[", index, "].k"), 0, 1e6)
    )
  })

  edge_keys <- vapply(edges, function(edge) paste(edge$from, edge$to, sep = "->"), character(1))
  if (anyDuplicated(edge_keys)) stop("Duplicate Lego transfers are not supported.")
  if (!any(vapply(nodes, function(node) node$kind %in% LEGO_VOLUME_KINDS, logical(1)))) {
    stop("A Lego TDM model requires a central, peripheral or metabolite compartment.")
  }

  covariates <- lapply(seq_along(input_covariates), function(index) {
    input <- input_covariates[[index]]
    if (!is.list(input)) stop("Each Lego covariate must be an object.")
    name <- lego_text(input$name, paste0("covariates[", index, "].name"), "^[A-Z][A-Z0-9_]*$", 24L)
    if (name %in% LEGO_RESERVED_COVARIATES || grepl("^(ETA|EPS)[0-9]*$", name)) {
      stop("Reserved Lego covariate name: ", name)
    }
    list(
      name = name,
      target = lego_text(input$target, paste0("covariates[", index, "].target"), "^[A-Za-z_][A-Za-z0-9_]*$", 96L),
      reference = lego_number(input$reference, paste0("covariates[", index, "].reference"), 1e-12, 1e12),
      beta = lego_number(input$beta, paste0("covariates[", index, "].beta"), -10, 10)
    )
  })
  covariate_names <- vapply(covariates, `[[`, character(1), "name")
  if (anyDuplicated(covariate_names)) stop("Lego covariate names must be unique.")

  list(version = version, nodes = nodes, edges = edges, covariates = covariates)
}

lego_spec_from_code <- function(code) {
  if (!is.character(code) || length(code) != 1L || nchar(code, type = "bytes") > 200000L) {
    stop("The pasted Lego model is empty or too large.")
  }
  lines <- strsplit(code, "\n", fixed = TRUE)[[1]]
  marker <- lines[startsWith(trimws(lines), LEGO_SPEC_PREFIX)][1]
  if (is.na(marker) || !nzchar(marker)) {
    stop("Public compilation accepts only models generated by Atelier Lego. The Lego specification marker is missing.")
  }
  encoded <- substring(trimws(marker), nchar(LEGO_SPEC_PREFIX) + 1L)
  if (!nzchar(encoded) || nchar(encoded, type = "bytes") > 100000L) stop("Invalid Lego specification marker.")
  decoded <- utils::URLdecode(encoded)
  specification <- tryCatch(
    jsonlite::fromJSON(decoded, simplifyVector = FALSE),
    error = function(error) stop("Invalid Lego specification JSON: ", conditionMessage(error))
  )
  normalize_lego_spec(specification)
}

lego_format_number <- function(value) {
  formatted <- format(round(as.numeric(value), 6), scientific = FALSE, trim = TRUE, nsmall = 0)
  sub("\\.$", "", formatted)
}

lego_model_code <- function(specification) {
  spec <- normalize_lego_spec(specification)
  nodes <- spec$nodes
  edges <- spec$edges
  ids <- vapply(nodes, `[[`, integer(1), "id")
  internal <- stats::setNames(
    vapply(nodes, function(node) paste0("L", node$id, "_", node$name), character(1)),
    as.character(ids)
  )
  name_for <- function(id) unname(internal[[as.character(id)]])
  client_name_for <- function(id) nodes[[match(id, ids)]]$name
  volume_nodes <- Filter(function(node) node$kind %in% LEGO_VOLUME_KINDS, nodes)
  central_nodes <- Filter(function(node) identical(node$kind, "central"), nodes)
  observed <- if (length(central_nodes)) central_nodes[[1]] else volume_nodes[[1]]
  dosed <- Filter(function(node) is.finite(node$dose) && node$dose > 0, nodes)
  mass_nodes <- Filter(function(node) !node$kind %in% LEGO_PD_KINDS, nodes)
  adm <- if (length(dosed)) dosed[[1]] else if (length(mass_nodes)) mass_nodes[[1]] else nodes[[1]]

  parameters <- list()
  for (edge in edges) {
    from <- name_for(edge$from)
    to <- if (identical(edge$to, "OUT")) "e" else name_for(edge$to)
    parameters[[length(parameters) + 1L]] <- list(
      name = paste0("k_", from, "_", to),
      client_name = paste0("k_", client_name_for(edge$from), "_", if (identical(edge$to, "OUT")) "e" else client_name_for(edge$to)),
      value = edge$k,
      note = if (identical(edge$to, "OUT")) paste0("elimination from ", from) else paste0("transfer ", from, " to ", to),
      iiv = identical(edge$to, "OUT")
    )
  }
  for (node in volume_nodes) {
    name <- name_for(node$id)
    parameters[[length(parameters) + 1L]] <- list(
      name = paste0("v_", name), client_name = paste0("v_", node$name), value = node$vol, note = paste0("volume of ", name), iiv = identical(node$kind, "central")
    )
  }
  for (node in nodes) {
    name <- name_for(node$id)
    if (identical(node$kind, "effect")) {
      parameters[[length(parameters) + 1L]] <- list(name = paste0("ke0_", name), client_name = paste0("ke0_", node$name), value = node$ke0, note = paste0("effect equilibration for ", name), iiv = FALSE)
    }
    if (identical(node$kind, "response")) {
      parameters <- c(parameters, list(
        list(name = paste0("kin_", name), client_name = paste0("kin_", node$name), value = node$kin, note = paste0("production of ", name), iiv = FALSE),
        list(name = paste0("kout_", name), client_name = paste0("kout_", node$name), value = node$kout, note = paste0("degradation of ", name), iiv = FALSE),
        list(name = paste0("smax_", name), client_name = paste0("smax_", node$name), value = node$smax, note = paste0("maximum effect on ", name), iiv = FALSE),
        list(name = paste0("sc50_", name), client_name = paste0("sc50_", node$name), value = node$sc50, note = paste0("half effect concentration for ", name), iiv = FALSE)
      ))
    }
  }
  if (!length(parameters)) stop("The Lego model does not expose any pharmacometric parameter.")

  client_parameter_names <- vapply(parameters, `[[`, character(1), "client_name")
  if (anyDuplicated(client_parameter_names)) stop("Lego parameter targets must be unique.")
  covariate_effects <- lapply(seq_along(spec$covariates), function(index) {
    covariate <- spec$covariates[[index]]
    target_index <- match(covariate$target, client_parameter_names)
    if (is.na(target_index)) stop("Unknown Lego covariate target: ", covariate$target)
    c(covariate, list(
      target_name = parameters[[target_index]]$name,
      beta_name = paste0("BETA_", covariate$name, "_", index)
    ))
  })

  random_parameters <- Filter(function(parameter) isTRUE(parameter$iiv), parameters)
  if (!length(random_parameters)) random_parameters <- parameters[1]
  eta_index <- stats::setNames(seq_along(random_parameters), vapply(random_parameters, `[[`, character(1), "name"))
  width <- max(8L, nchar(paste0("TV_", vapply(parameters, `[[`, character(1), "name"))))
  pad <- function(text) sprintf("%-*s", width, text)
  spec_json <- jsonlite::toJSON(spec, auto_unbox = TRUE, null = "null", digits = 10)
  marker <- paste0(LEGO_SPEC_PREFIX, utils::URLencode(spec_json, reserved = TRUE))
  lines <- c(marker, "$PARAM @annotated")

  for (parameter in parameters) {
    lines <- c(lines, paste0(pad(paste0("TV_", parameter$name)), " : ", lego_format_number(parameter$value), " : ", parameter$note))
  }
  for (covariate in covariate_effects) {
    lines <- c(lines, paste0(covariate$beta_name, " : ", lego_format_number(covariate$beta), " : power effect of ", covariate$name, " on ", covariate$target))
  }
  for (index in seq_along(random_parameters)) {
    parameter <- random_parameters[[index]]
    lines <- c(lines, paste0(pad(paste0("ETA", index)), " : 0 : individual effect on ", parameter$name))
  }
  if (length(covariate_effects)) {
    lines <- c(lines, "", "$PARAM @covariates @annotated")
    for (covariate in covariate_effects) {
      lines <- c(lines, paste0(covariate$name, " : ", lego_format_number(covariate$reference), " : continuous covariate, reference value"))
    }
  }

  lines <- c(lines, "", "$OMEGA @annotated")
  for (parameter in random_parameters) {
    lines <- c(lines, paste0("IIV_", parameter$name, " : 0.09 : interindividual variance on ", parameter$name))
  }
  lines <- c(
    lines,
    "",
    "$SIGMA @annotated",
    "PROP : 0.04 : proportional residual variance",
    "ADD  : 0.01 : additive residual variance",
    "",
    "$CMT @annotated"
  )
  for (node in nodes) {
    name <- name_for(node$id)
    tags <- c(if (identical(node$id, adm$id)) "ADM", if (identical(node$id, observed$id)) "OBS")
    tag_text <- if (length(tags)) paste0(" [", paste(tags, collapse = ", "), "]") else ""
    lines <- c(lines, paste0(pad(name), " : model state ", name, tag_text))
  }

  lines <- c(lines, "", "$MAIN")
  for (parameter in parameters) {
    index <- unname(eta_index[parameter$name])
    eta <- if (length(index) && is.finite(index)) paste0(" * exp(ETA", index, " + ETA(", index, "))") else ""
    effects <- Filter(function(covariate) identical(covariate$target_name, parameter$name), covariate_effects)
    effect_code <- paste0(vapply(
      effects,
      function(covariate) paste0(" * pow(", covariate$name, "/", lego_format_number(covariate$reference), ", ", covariate$beta_name, ")"),
      character(1)
    ), collapse = "")
    lines <- c(lines, paste0("double ", parameter$name, " = TV_", parameter$name, effect_code, eta, ";"))
  }
  response_nodes <- Filter(function(node) identical(node$kind, "response"), nodes)
  for (node in response_nodes) {
    name <- name_for(node$id)
    lines <- c(lines, paste0(name, "_0 = kin_", name, "/kout_", name, ";"))
  }

  driver_concentration <- function(node) {
    source <- nodes[[match(node$source, ids)]]
    source_name <- name_for(source$id)
    if (source$kind %in% LEGO_VOLUME_KINDS) paste0("(", source_name, "/v_", source_name, ")") else source_name
  }
  mass_terms <- function(node) {
    incoming <- Filter(function(edge) !identical(edge$to, "OUT") && identical(edge$to, node$id), edges)
    outgoing <- Filter(function(edge) identical(edge$from, node$id), edges)
    terms <- c(
      vapply(incoming, function(edge) paste0("+ k_", name_for(edge$from), "_", name_for(edge$to), "*", name_for(edge$from)), character(1)),
      vapply(outgoing, function(edge) paste0("- k_", name_for(edge$from), "_", if (identical(edge$to, "OUT")) "e" else name_for(edge$to), "*", name_for(edge$from)), character(1))
    )
    if (length(terms)) paste(terms, collapse = " ") else "0"
  }

  lines <- c(lines, "", "$ODE")
  for (node in nodes) {
    name <- name_for(node$id)
    if (identical(node$kind, "effect")) {
      lines <- c(lines, paste0("dxdt_", name, " = ke0_", name, "*", "(", driver_concentration(node), " - ", name, ");"))
    } else if (identical(node$kind, "response")) {
      driver <- driver_concentration(node)
      lines <- c(lines, paste0("dxdt_", name, " = kin_", name, "*(1 + smax_", name, "*", driver, "/(sc50_", name, " + ", driver, ")) - kout_", name, "*", name, ";"))
    } else {
      lines <- c(lines, paste0("dxdt_", name, " = ", mass_terms(node), ";"))
    }
  }

  lines <- c(lines, "", "$TABLE")
  for (node in volume_nodes) {
    name <- name_for(node$id)
    lines <- c(lines, paste0("double CONC_", name, " = ", name, "/v_", name, ";"))
  }
  observed_name <- name_for(observed$id)
  lines <- c(
    lines,
    paste0("double IPRED = CONC_", observed_name, ";"),
    "double DV = IPRED * (1 + EPS(1)) + EPS(2);",
    "if (DV < 0) DV = 0;",
    "",
    "$CAPTURE @annotated",
    "DV : simulated concentration with residual error"
  )
  for (node in volume_nodes) {
    name <- name_for(node$id)
    lines <- c(lines, paste0("CONC_", name, " : concentration in ", name))
  }
  paste(lines, collapse = "\n")
}

safe_lego_model_code <- function(code = NULL, specification = NULL) {
  spec <- if (!is.null(specification)) normalize_lego_spec(specification) else lego_spec_from_code(code)
  lego_model_code(spec)
}

compile_model <- function(
  model_id = NULL,
  custom_code = NULL,
  allow_custom = FALSE,
  custom_soloc = NULL,
  custom_cache = NULL
) {
  if (!is.null(custom_code)) {
    if (!nzchar(trimws(custom_code))) stop("Paste a complete mrgsolve model before compiling.")
    safe_lego <- !isTRUE(allow_custom)
    if (safe_lego) custom_code <- safe_lego_model_code(code = custom_code)
    if (is.null(custom_soloc) || !dir.exists(custom_soloc)) {
      stop("A session-scoped compilation directory is required for custom models.")
    }
    key <- safe_model_id(paste0("custom_", short_hash(custom_code)))
    if (!is.null(custom_cache) && !is.null(custom_cache[[key]])) return(custom_cache[[key]])
    if (safe_lego && !is.null(custom_cache) && length(ls(custom_cache, all.names = TRUE)) >= 5L) {
      stop("This session has reached the limit of five distinct Lego model compilations.")
    }
    model <- mrgsolve::mcode(key, custom_code, soloc = custom_soloc, quiet = TRUE)
    if (!is.null(custom_cache)) custom_cache[[key]] <- model
    return(model)
  }

  row <- model_record(model_id)
  key <- row$id[[1]]
  if (!is.null(.model_cache[[key]])) return(.model_cache[[key]])
  model <- mrgsolve::mread(
    model = key,
    project = MODEL_ROOT,
    file = row$file[[1]],
    soloc = MODEL_CACHE_DIR,
    quiet = TRUE
  )
  .model_cache[[key]] <- model
  model
}

model_param_names <- function(model) names(as.list(mrgsolve::param(model)))

safe_param <- function(model, values) {
  if (is.null(values) || !length(values)) return(model)
  values <- as.list(values)
  values <- values[names(values) %in% model_param_names(model)]
  if (!length(values)) return(model)
  mrgsolve::param(model, values)
}

tagged_compartment <- function(model, tag) {
  annotations <- tryCatch(model@annot$data, error = function(error) data.frame())
  if (!nrow(annotations) || !all(c("block", "name", "options") %in% names(annotations))) return(NA_integer_)
  rows <- annotations[
    annotations$block == "CMT" & grepl(paste0("(^|,\\s*)", tag, "(\\s*,|$)"), annotations$options),
    ,
    drop = FALSE
  ]
  if (!nrow(rows)) return(NA_integer_)
  match(rows$name[[1]], model@cmtL)
}

model_capture_names <- function(model) {
  simulation <- model |>
    mrgsolve::zero_re() |>
    mrgsolve::mrgsim(end = 0, delta = 1) |>
    as.data.frame()
  setdiff(names(simulation), c("ID", "time"))
}

validate_model_contract <- function(model) {
  errors <- character()
  warnings <- character()
  adm <- tagged_compartment(model, "ADM")
  obs <- tagged_compartment(model, "OBS")
  captures <- tryCatch(model_capture_names(model), error = function(error) character())
  omega <- tryCatch(as.matrix(mrgsolve::omat(model)), error = function(error) matrix(numeric(), 0, 0))
  sigma <- tryCatch(as.matrix(mrgsolve::smat(model)), error = function(error) matrix(numeric(), 0, 0))

  if (!is.finite(adm)) errors <- c(errors, "No [ADM] compartment tag was found.")
  if (!is.finite(obs)) errors <- c(errors, "No [OBS] compartment tag was found.")
  if (!length(captures)) errors <- c(errors, "The model does not expose any captured prediction.")
  if (!"DV" %in% captures) warnings <- c(warnings, "DV is not captured; another concentration column will be used.")
  if (!nrow(omega)) errors <- c(errors, "OMEGA is missing; MAP estimation requires random effects.")
  if (!nrow(sigma)) errors <- c(errors, "SIGMA is missing; MAP estimation requires a residual error model.")
  if (!all(paste0("ETA", seq_len(nrow(omega))) %in% model_param_names(model))) {
    errors <- c(errors, "Each OMEGA term must have a matching ETA1, ETA2, ... parameter for mapbayr.")
  }

  list(
    ok = !length(errors),
    errors = unique(errors),
    warnings = unique(warnings),
    adm_cmt = adm,
    obs_cmt = obs,
    captures = captures,
    n_eta = nrow(omega),
    n_sigma = nrow(sigma)
  )
}

pick_concentration_column <- function(data) {
  preferred <- c("DV", "CP", "CONC", "CONC_PLASMA", "CONCENTRATION")
  found <- preferred[preferred %in% names(data)][1]
  if (is.na(found)) stop("No concentration output found. Capture DV, CP or CONC in the model.")
  found
}
