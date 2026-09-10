pd_pk_ui <- function(id, t) {
  ns <- NS(id)
  tagList(
    radioButtons(ns("source"), t("Source PK", "PK source"), c("MIPD" = "library", "mrgsolve / Lego" = "code"), inline = TRUE),
    conditionalPanel(sprintf("input['%s']=='library'", ns("source")),
      selectInput(ns("model"), t("Modele PK", "PK model"), catalog_choices_i18n(), DEFAULT_MODEL), uiOutput(ns("route_ui"))),
    conditionalPanel(sprintf("input['%s']=='code'", ns("source")),
      textAreaInput(ns("code"), "mrgsolve / C++", rows = 8),
      selectInput(ns("custom_route"), t("Voie", "Route"), c("IV", "Oral"))),
    actionButton(ns("load"), t("Charger / compiler la PK", "Load / compile PK"), icon = icon("gears")),
    uiOutput(ns("status")),
    selectInput(ns("time_unit"), t("Unite de temps du code PK", "PK code time unit"), c("h" = "h", "day" = "day")),
    numericInput(ns("scale"), t("Facteur de conversion des concentrations vers les unites PD", "Concentration conversion factor to PD units"), 1, min = 1e-9),
    uiOutput(ns("outputs")),
    accordion(accordion_panel(t("Parametres et covariables PK fixes", "Fixed PK parameters and covariates"), uiOutput(ns("parameters"))))
  )
}

pd_pk_server <- function(id, soloc, cache, imported = reactive(NULL)) {
  moduleServer(id, function(input, output, session) {
    t <- function(fr, en) app_t(app_language_from_query(session$clientData$url_search %||% ""), fr, en)
    loaded <- reactiveVal(NULL)
    generation <- reactiveVal(0L)
    pending <- reactiveVal(NULL)
    output$route_ui <- renderUI({
      model <- input$model %||% DEFAULT_MODEL
      routes <- model_routes(model_record(model))
      selected <- if (identical(pending()$id, model)) pending()$route else isolate(input$route)
      if (is.null(selected) || !selected %in% routes) selected <- routes[[1]]
      selectInput(session$ns("route"), t("Voie", "Route"), routes, selected)
    })
    observeEvent(imported(), {
      spec <- imported(); if (is.null(spec)) return()
      pending(spec); loaded(NULL)
      updateRadioButtons(session, "source", selected = spec$source)
      if (spec$source == "code") {
        updateTextAreaInput(session, "code", value = spec$code)
        updateSelectInput(session, "custom_route", selected = spec$route %||% "IV")
      } else updateSelectInput(session, "model", selected = spec$id)
      updateSelectInput(session, "time_unit", selected = spec$time_unit %||% "h")
      updateNumericInput(session, "scale", value = spec$concentration_scale %||% 1)
    })
    observeEvent(input$load, tryCatch({
      value <- withProgress(message = t("Chargement PK", "Loading PK"), value = 0.3, {
        if (identical(input$source, "code")) {
          code <- input$code
          if (!is.character(code) || !nzchar(trimws(code)) || nchar(code, type = "bytes") > 200000) stop("Supply a complete mrgsolve model (maximum 200 kB).")
          model <- compile_model(custom_code = code, allow_custom = ALLOW_CUSTOM_MODELS, custom_soloc = soloc, custom_cache = cache) |> mrgsolve::zero_re()
          if (!length(model@cmtL) || !length(model_capture_names(model))) stop("PK requires compartments and a captured concentration.")
          adm <- tagged_compartment(model, "ADM")
          list(id = "custom-pk", label = "mrgsolve / Lego", model = model, code = code,
            adm_cmt = if (is.finite(adm)) adm else 1L, route = input$custom_route, source = "code")
        } else ddi_library_context(input$model, input$route)
      })
      generation(generation() + 1L)
      value$generation <- generation()
      loaded(value)
    }, error = function(e) showNotification(conditionMessage(e), type = "error", duration = 10)))
    valid_loaded <- reactive({
      value <- loaded()
      if (is.null(value)) return(NULL)
      if (identical(input$source, "code")) {
        if (!identical(value$code, input$code) || value$id != "custom-pk") return(NULL)
      } else if (!identical(value$id, input$model)) return(NULL)
      value
    })
    output$status <- renderUI(p(if (is.null(valid_loaded())) t("PK non chargee ou code modifie.", "PK not loaded or code modified.") else valid_loaded()$label))
    output$outputs <- renderUI({
      value <- valid_loaded(); shiny::req(value)
      captures <- model_capture_names(value$model)
      preferred <- intersect(c("CP", "CONC", "CONC_PLASMA", "CONCENTRATION", "DV"), captures)
      tagList(selectInput(session$ns("concentration"), t("Sortie concentration", "Concentration output"), captures, if (length(preferred)) preferred[[1]] else captures[[1]]),
        if (identical(value$id, "custom-pk")) selectInput(session$ns("adm"), t("Compartiment d'administration", "Administration compartment"), setNames(seq_along(value$model@cmtL), value$model@cmtL), value$adm_cmt))
    })
    output$parameters <- renderUI({
      value <- valid_loaded(); shiny::req(value)
      p <- as.list(mrgsolve::param(value$model))
      div(class = "pd-parameter-grid", lapply(names(p), function(name) numericInput(session$ns(paste0("param_", value$generation, "_", name)), name, p[[name]], step = NA)))
    })
    context <- reactive({
      value <- valid_loaded()
      if (is.null(value)) stop(t("Chargez / compilez le modele PK selectionne.", "Load / compile the selected PK model."))
      if (identical(value$id, "custom-pk")) {
        value$route <- input$custom_route %||% "IV"
        value$adm_cmt <- as.integer(input$adm %||% value$adm_cmt)
      } else value <- ddi_context_with_route(value, input$route)
      if (!value$adm_cmt %in% seq_along(value$model@cmtL)) stop("Invalid administration compartment.")
      p <- as.list(mrgsolve::param(value$model))
      for (name in names(p)) p[[name]] <- ddi_numeric(input[[paste0("param_", value$generation, "_", name)]] %||% p[[name]], name)
      value$model <- mrgsolve::param(value$model, p)
      captures <- model_capture_names(value$model)
      preferred <- intersect(c("CP", "CONC", "CONC_PLASMA", "CONCENTRATION", "DV"), captures)
      value$concentration <- input$concentration %||% if (length(preferred)) preferred[[1]] else captures[[1]]
      if (!value$concentration %in% captures) stop("Select the PK concentration output.")
      value$time_unit <- input$time_unit %||% "h"
      value$concentration_scale <- ddi_numeric(input$scale %||% 1, "Concentration scale", 1e-9, 1e9)
      value
    })
    session$onSessionEnded(function() { loaded(NULL); pending(NULL) })
    context
  })
}

# All input times use the caller's unit; infusion durations always use hours.
pd_pk_profile <- function(context, doses, horizon, hours_per_time = 1) {
  if (!context$time_unit %in% c("h", "day")) stop("PK time unit must be h or day.")
  if (context$route == "Oral" && any(doses$infusion > 0)) stop("Oral doses require infusion duration = 0.")
  if (nrow(doses) > 5000 || any(!is.finite(as.matrix(doses[c("time", "amount", "infusion")])))) stop("Invalid PK dose history.")
  scale_time <- hours_per_time / if (context$time_unit == "day") 24 else 1
  step <- 0.1 / hours_per_time
  knots <- c(doses$time, doses$time + doses$infusion / hours_per_time)
  grid <- sort(unique(c(seq(0, horizon, by = step), horizon, knots, knots - 1e-8 / hours_per_time)))
  grid <- grid[grid >= 0 & grid <= horizon]
  if (length(grid) > 200000) stop("PK preview grid limit exceeded.")
  obs <- data.frame(ID = 1, time = grid * scale_time, evid = 0, cmt = 0, amt = 0, rate = 0)
  events <- data.frame(ID = rep(1, nrow(doses)), time = doses$time * scale_time, evid = rep(1, nrow(doses)),
    cmt = rep(context$adm_cmt, nrow(doses)), amt = doses$amount,
    rate = ifelse(doses$infusion > 0, doses$amount / (doses$infusion / hours_per_time * scale_time), 0))
  data <- rbind(events, obs)
  data <- data[order(data$time, -data$evid), ]
  sim <- as.data.frame(mrgsolve::mrgsim_d(context$model, data = data, obsonly = TRUE, recsort = 3, nocb = FALSE))
  sim$time <- round(sim$time / scale_time, 10)
  sim <- sim[!duplicated(sim$time, fromLast = TRUE), ]
  c <- sim[[context$concentration]] * context$concentration_scale
  if (length(c) != nrow(sim) || any(!is.finite(c)) || any(c < -1e-7)) stop("Invalid PK concentration output.")
  data.frame(time = sim$time, concentration = pmax(0, c))
}

pd_pk_export_setup <- function(context) {
  if (is.null(context)) return("pk_context <- NULL")
  dump <- function(x) paste(capture.output(dput(x)), collapse = "\n")
  paste(c("# Requires mrgsolve and a compiler. Contains explicitly exported PK code and parameters.",
    "workdir <- tempfile('pd-pk-'); dir.create(workdir)",
    paste0("pk_context <- ", dump(context[intersect(names(context), c("label", "route", "adm_cmt", "concentration", "time_unit", "concentration_scale"))])),
    paste0("pk_context$model <- mrgsolve::mcode('pd_pk', ", dump(context$code), ", soloc=workdir, quiet=TRUE) |> mrgsolve::zero_re()"),
    paste0("pk_context$model <- mrgsolve::param(pk_context$model, ", dump(as.list(mrgsolve::param(context$model))), ")"),
    "# Unload the compiled model before deleting workdir after use."), collapse = "\n")
}
