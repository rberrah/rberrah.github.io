if (.Platform$OS.type == "windows") invisible(suppressWarnings(Sys.setlocale("LC_CTYPE", ".UTF-8")))

suppressPackageStartupMessages({
  library(shiny)
  library(bslib)
  library(mrgsolve)
  library(mapbayr)
  library(dplyr)
  library(ggplot2)
  library(DT)
  library(jsonlite)
})

`%||%` <- function(value, fallback) {
  if (is.null(value) || !length(value)) fallback else value
}

format_metric <- function(value, digits = 1) {
  if (!length(value) || !is.finite(value[[1]])) return("Non calculable")
  format(round(as.numeric(value[[1]]), digits), nsmall = digits, trim = TRUE)
}

APP_ROOT <- normalizePath(getwd(), winslash = "/", mustWork = TRUE)
source(file.path(APP_ROOT, "R", "model_library.R"), local = TRUE)
source(file.path(APP_ROOT, "R", "engine.R"), local = TRUE)

ALLOW_CUSTOM_MODELS <- identical(tolower(Sys.getenv("ALLOW_CUSTOM_MODELS", "false")), "true")
DEFAULT_MODEL <- if ("vanco_roberts" %in% MODEL_CATALOG$id) "vanco_roberts" else MODEL_CATALOG$id[[1]]
DEFAULT_CODE <- read_library_code(DEFAULT_MODEL)

APP_THEME <- bs_theme(
  version = 5,
  bg = "#f7f8fa",
  fg = "#17202a",
  primary = "#176b70",
  secondary = "#5c6670",
  success = "#287a4d",
  warning = "#b16916",
  danger = "#a43d35"
)

model_choices <- catalog_choices()

dose_row_ui <- function(index, time = 0, amount = 1000, interval = 12, count = 4, infusion = 1, steady_state = FALSE) {
  div(
    id = paste0("dose_row_", index),
    class = "record-row dose-row",
    div(class = "record-index", paste0("A", index)),
    numericInput(paste0("dose_time_", index), "Début (h)", time, min = 0, step = 0.5),
    numericInput(paste0("dose_amount_", index), "Dose (mg)", amount, min = 0, step = 50),
    numericInput(paste0("dose_interval_", index), "Intervalle (h)", interval, min = 0, step = 1),
    div(
      class = "dose-repeat-control",
      checkboxInput(paste0("dose_ss_", index), "Steady state (ss = 1)", value = steady_state),
      conditionalPanel(
        condition = sprintf("input.dose_ss_%d != true", index),
        numericInput(paste0("dose_count_", index), "Nombre", count, min = 1, step = 1)
      )
    ),
    numericInput(paste0("dose_infusion_", index), "Perfusion (h, 0 = bolus ou oral)", infusion, min = 0, step = 0.25)
  )
}

observation_row_ui <- function(index, time = 47.5, concentration = 18) {
  div(
    id = paste0("observation_row_", index),
    class = "record-row observation-row",
    div(class = "record-index", paste0("P", index)),
    numericInput(paste0("observation_time_", index), "Temps (h)", time, min = 0, step = 0.25),
    numericInput(paste0("observation_concentration_", index), "Concentration", concentration, min = 0, step = 0.1),
    div(
      class = "observation-covariates",
      uiOutput(paste0("observation_covariates_", index))
    )
  )
}

app_ui <- page_navbar(
  title = div(class = "brand", span(class = "brand-mark", "Pk"), span("MIPD Engine")),
  id = "main_navigation",
  theme = APP_THEME,
  fillable = FALSE,
  header = tags$head(
    tags$link(rel = "stylesheet", href = "app.css"),
    tags$meta(name = "viewport", content = "width=device-width, initial-scale=1"),
    tags$script(HTML("(function () {
      window.addEventListener('message', function (event) {
        var query = new URLSearchParams(window.location.search);
        var payload = event.data || {};
        if (query.get('bridge') !== 'lego' || event.source !== window.opener) return;
        if (payload.type !== 'pk-lego-model' || typeof payload.code !== 'string') return;
        if (!window.Shiny || typeof window.Shiny.setInputValue !== 'function') return;
        window.Shiny.setInputValue('lego_model_import', {
          code: payload.code,
          spec: payload.spec || null,
          name: payload.name || 'lego_model',
          nonce: Date.now()
        }, { priority: 'event' });
        event.source.postMessage({ type: 'pk-lego-model-ack' }, event.origin);
      });
    })();"))
  ),
  nav_panel(
    "Analyse",
    value = "analysis",
    div(
      class = "analysis-shell",
      div(
        class = "safety-banner",
        div(
          tags$strong("Outil de recherche et d'enseignement"),
          span("Les résultats ne remplacent ni la validation locale du modèle ni le jugement clinique.")
        ),
        span(class = "engine-badge", "mrgsolve + mapbayr")
      ),
      layout_sidebar(
        sidebar = sidebar(
          width = 390,
          open = "always",
          div(class = "sidebar-heading", h2("Configuration"), uiOutput("engine_status")),
          accordion(
            id = "settings_accordion",
            open = c("model_settings", "target_settings"),
            accordion_panel(
              "Modèle",
              value = "model_settings",
              radioButtons(
                "model_source",
                NULL,
                choices = c("Biblioth\u00e8que" = "library", "Atelier Lego / C++" = "custom"),
                selected = "library",
                inline = TRUE
              ),
              conditionalPanel(
                "input.model_source == 'library'",
                selectInput("model_id", "Modèle principal", choices = model_choices, selected = DEFAULT_MODEL),
                checkboxInput("enable_averaging", "Activer le model averaging", FALSE),
                conditionalPanel(
                  "input.enable_averaging == true",
                  uiOutput("average_models_ui"),
                  selectInput(
                    "weighting_scheme",
                    "Pondération",
                    choices = c("Crit\u00e8re d'Akaike" = "AIC", "Log-vraisemblance" = "LL"),
                    selected = "AIC"
                  )
                )
              ),
              conditionalPanel(
                "input.model_source == 'custom'",
                div(
                  class = "custom-note local",
                  if (ALLOW_CUSTOM_MODELS) {
                    "Mode local : le C++ libre est autorisé et s'exécute avec les droits du processus R."
                  } else {
                    "Serveur public : seuls les modèles portant la spécification contrôlée de l'Atelier Lego sont acceptés. Le C++ libre reste bloqué."
                  }
                )
              ),
              actionButton("validate_model", "Valider le modèle", class = "btn-outline-primary w-100")
            ),
            accordion_panel(
              "Cible et grille de doses",
              value = "target_settings",
              selectInput(
                "target_metric",
                "Métrique",
                choices = c("AUC 0-24 h" = "AUC24", "Concentration minimale" = "Cmin", "Concentration maximale" = "Cmax")
              ),
              fluidRow(
                column(6, numericInput("target_low", "Borne basse", 400, min = 0)),
                column(6, numericInput("target_high", "Borne haute", 600, min = 0))
              ),
              fluidRow(
                column(4, numericInput("dose_min", "Dose min", 250, min = 0, step = 50)),
                column(4, numericInput("dose_max", "Dose max", 2000, min = 0, step = 50)),
                column(4, numericInput("dose_step", "Pas", 250, min = 1, step = 50))
              ),
              checkboxGroupInput(
                "candidate_intervals",
                "Intervalles testés",
                choices = c("6 h" = 6, "8 h" = 8, "12 h" = 12, "24 h" = 24, "48 h" = 48),
                selected = c(8, 12, 24),
                inline = TRUE
              ),
              numericInput("future_infusion", "Durée de perfusion (h, 0 = bolus ou oral)", 1, min = 0, step = 0.25)
            )
          ),
          actionButton("run_analysis", "Lancer l'analyse", class = "btn-primary run-button w-100")
        ),
        div(
          class = "workspace",
          navset_tab(
            id = "analysis_tabs",
            nav_panel(
              "Données",
              value = "data",
              div(
                class = "workspace-section",
                div(
                  class = "section-heading",
                  div(
                    h1("Historique thérapeutique"),
                    p("Temps exprimés en heures depuis la première administration renseignée.")
                  ),
                  div(
                    class = "patient-file-actions",
                    fileInput(
                      "upload_patient",
                      NULL,
                      accept = c("application/json", ".json"),
                      buttonLabel = "Importer JSON",
                      placeholder = "Aucun fichier"
                    ),
                    downloadButton("download_patient", "Exporter JSON", class = "btn-outline-secondary btn-sm")
                  )
                ),
                div(
                  class = "privacy-notice",
                  tags$strong("Session uniquement"),
                  span("Le fichier est lu, validé puis supprimé du stockage temporaire. Aucun identifiant, dossier patient ou code C++ n'est enregistré.")
                ),
                h3("Administrations"),
                div(id = "dose_rows", class = "record-list", dose_row_ui(1L)),
                div(
                  class = "row-actions",
                  actionButton("add_dose", "Ajouter une administration", class = "btn-outline-secondary btn-sm"),
                  actionButton("remove_dose", "Retirer la dernière", class = "btn-outline-secondary btn-sm")
                ),
                hr(),
                h3("Concentrations observées"),
                uiOutput("observation_covariate_notice"),
                div(id = "observation_rows", class = "record-list", observation_row_ui(1L)),
                div(
                  class = "row-actions",
                  actionButton("add_observation", "Ajouter un prélèvement", class = "btn-outline-secondary btn-sm"),
                  actionButton("remove_observation", "Retirer le dernier", class = "btn-outline-secondary btn-sm")
                )
              )
            ),
            nav_panel(
              "Ajustement",
              value = "fit",
              div(
                class = "workspace-section",
                uiOutput("fit_empty"),
                uiOutput("current_exposure_summary"),
                plotOutput("fit_plot", height = "430px"),
                h3("Modèles et pondérations"),
                DTOutput("model_table")
              )
            ),
            nav_panel(
              "Posologies",
              value = "dosing",
              div(
                class = "workspace-section",
                uiOutput("recommendation_summary"),
                plotOutput("recommended_profile", height = "410px"),
                div(class = "table-toolbar", h3("Scénarios classés"), downloadButton("download_scenarios", "Exporter CSV", class = "btn-outline-secondary btn-sm")),
                DTOutput("recommendation_table")
              )
            ),
            nav_panel(
              "Modèle",
              value = "model",
              div(
                class = "workspace-section model-workspace",
                uiOutput("model_contract"),
                conditionalPanel(
                  "input.model_source == 'library'",
                  pre(class = "model-code", textOutput("library_code", container = span))
                ),
                conditionalPanel(
                  "input.model_source == 'custom'",
                  textAreaInput("custom_code", "Modèle mrgsolve complet", value = DEFAULT_CODE, rows = 34, width = "100%")
                )
              )
            )
          )
        )
      )
    )
  ),
  nav_panel(
    "Bibliothèque",
    value = "library",
    div(
      class = "plain-page",
      h1("Bibliothèque de modèles"),
      p("Les modèles sont synchronisés depuis static/tdm/models. Un redéploiement suffit pour publier un fichier accepté par revue."),
      DTOutput("catalog_table")
    )
  ),
  nav_panel(
    "Méthode",
    value = "method",
    div(
      class = "plain-page method-page",
      h1("Méthode et limites"),
      h2("Estimation individuelle"),
      p("Les effets aléatoires individuels sont estimés par maximum a posteriori avec mapbayr. Les doses et concentrations utilisent le format NM-TRAN."),
      h2("Model averaging"),
      p("Chaque modèle analyse les mêmes données. Les prédictions sont moyennées avec des poids issus de la vraisemblance ou du critère d'Akaike."),
      h2("Sécurité"),
      p("Le serveur public ne compile jamais directement le C++ reçu. Pour un modèle Atelier Lego, il extrait une spécification JSON, la valide, régénère lui-même le code mrgsolve puis compile uniquement ce code contrôlé. Tout autre C++ reste refusé tant qu'il n'est pas exécuté dans un conteneur éphémère isolé."),
      p("Les imports JSON sont traités dans la session Shiny et leur fichier temporaire est supprimé immédiatement après lecture. Les exports sont produits à la demande sans base de données."),
      h2("Statut"),
      p("Prototype de recherche non enregistré comme dispositif médical. Toute utilisation clinique exige validation, qualification de l'hébergement, traçabilité et gouvernance des modèles.")
    )
  ),
  footer = div(class = "app-footer", "Pharmacométrie Pratique · moteur R mrgsolve/mapbayr · aucun dossier patient n'est persisté")
)

server <- function(input, output, session) {
  dose_count <- reactiveVal(1L)
  observation_count <- reactiveVal(1L)
  analysis_store <- reactiveVal(NULL)
  validation_store <- reactiveVal(NULL)
  query_applied <- reactiveVal(FALSE)
  pending_import_covariates <- reactiveVal(NULL)
  session_model_dir <- tempfile("pk-mipd-custom-session-")
  dir.create(session_model_dir, recursive = TRUE, showWarnings = FALSE)
  session_model_cache <- new.env(parent = emptyenv())

  session$onSessionEnded(function() {
    analysis_store(NULL)
    validation_store(NULL)
    loaded <- getLoadedDLLs()
    session_path <- normalizePath(session_model_dir, winslash = "/", mustWork = FALSE)
    dll_paths <- vapply(loaded, function(dll) dll[["path"]] %||% "", character(1))
    dll_paths <- dll_paths[nzchar(dll_paths)]
    normalized <- normalizePath(dll_paths, winslash = "/", mustWork = FALSE)
    for (path in unique(dll_paths[startsWith(normalized, session_path)])) {
      try(dyn.unload(path), silent = TRUE)
    }
    rm(list = ls(session_model_cache, all.names = TRUE), envir = session_model_cache)
    invisible(gc())
    unlink(session_model_dir, recursive = TRUE, force = TRUE)
  })

  insert_dose_row <- function(index, time = 0, amount = 1000, interval = 12, count = 4, infusion = 1, steady_state = FALSE) {
    insertUI(
      selector = "#dose_rows",
      where = "beforeEnd",
      ui = dose_row_ui(index, time, amount, interval, count, infusion, steady_state)
    )
  }

  insert_observation_row <- function(index, time = 47.5, concentration = 18) {
    register_observation_covariates(index)
    insertUI(
      selector = "#observation_rows",
      where = "beforeEnd",
      ui = observation_row_ui(index, time, concentration)
    )
  }

  observeEvent(input$add_dose, {
    index <- dose_count() + 1L
    dose_count(index)
    insert_dose_row(index, time = 48, amount = 1000, interval = 12, count = 4, infusion = 1, steady_state = FALSE)
  })

  observeEvent(input$remove_dose, {
    index <- dose_count()
    if (index <= 1L) return(showNotification("Au moins une administration est requise.", type = "warning"))
    removeUI(selector = paste0("#dose_row_", index))
    dose_count(index - 1L)
  })

  observeEvent(input$add_observation, {
    index <- observation_count() + 1L
    observation_count(index)
    insert_observation_row(index, time = 60, concentration = 15)
  })

  observeEvent(input$remove_observation, {
    index <- observation_count()
    if (index <= 1L) return(showNotification("Conservez une ligne et saisissez 0 pour une analyse populationnelle.", type = "message"))
    removeUI(selector = paste0("#observation_row_", index))
    observation_count(index - 1L)
  })

  observe({
    if (query_applied()) return()
    query <- parseQueryString(session$clientData$url_search %||% "")
    requested <- query$model %||% ""
    if (requested %in% MODEL_CATALOG$id) updateSelectInput(session, "model_id", selected = requested)
    if (identical(query$source %||% "", "custom")) updateRadioButtons(session, "model_source", selected = "custom")
    query_applied(TRUE)
  })

  shiny::observeEvent(input$lego_model_import, {
    payload <- input$lego_model_import
    code <- payload$code %||% ""
    if (!is.character(code) || length(code) != 1L || !nzchar(trimws(code))) return()
    if (nchar(code, type = "bytes") > 200000) {
      return(showNotification("Le modèle Lego dépasse la taille autorisée.", type = "error"))
    }
    safe_code <- tryCatch(
      safe_lego_model_code(code = code, specification = payload$spec %||% NULL),
      error = function(error) {
        showNotification(conditionMessage(error), type = "error", duration = 10)
        NULL
      }
    )
    if (is.null(safe_code)) return()
    updateRadioButtons(session, "model_source", selected = "custom")
    updateTextAreaInput(session, "custom_code", value = safe_code)
    validation_store(NULL)
    analysis_store(NULL)
    bslib::nav_select("analysis_tabs", "model")
    showNotification("Modèle Lego validé et régénéré côté serveur. Vérifiez-le avant de lancer l'analyse.", type = "message", duration = 5)
  }, ignoreInit = TRUE)

  selected_model_ids <- reactive({
    shiny::req(input$model_id)
    if (!identical(input$model_source, "library")) return(character())
    if (!isTRUE(input$enable_averaging)) return(input$model_id)
    unique(c(input$model_id, input$average_model_ids %||% character()))
  })

  output$average_models_ui <- renderUI({
    shiny::req(input$model_id)
    drug <- model_record(input$model_id)$drug[[1]]
    choices <- catalog_choices(drug)
    checkboxGroupInput(
      "average_model_ids",
      paste0("Modèles de ", drug),
      choices = choices,
      selected = input$model_id
    )
  })
  shiny::outputOptions(output, "average_models_ui", suspendWhenHidden = FALSE)

  covariate_definition <- reactive({
    if (identical(input$model_source, "custom")) return(parse_covariates(input$custom_code %||% DEFAULT_CODE))
    ids <- selected_model_ids()
    definitions <- lapply(ids, function(id) parse_covariates(read_library_code(id)))
    definitions <- Filter(nrow, definitions)
    if (!length(definitions)) return(data.frame(name = character(), value = numeric(), description = character()))
    combined <- do.call(rbind, definitions)
    combined[!duplicated(combined$name), , drop = FALSE]
  })

  register_observation_covariates <- function(index) {
    local({
      row_index <- index
      output_id <- paste0("observation_covariates_", row_index)
      output[[output_id]] <- renderUI({
        definition <- covariate_definition()
        if (!nrow(definition)) {
          return(div(class = "empty-state compact", "Aucune covariable pour ce modèle."))
        }

        tagList(lapply(seq_len(nrow(definition)), function(definition_index) {
          name <- definition$name[[definition_index]]
          input_id <- paste0("observation_cov_", name, "_", row_index)
          current <- isolate(input[[input_id]])
          value <- suppressWarnings(as.numeric(current))
          if (length(value) != 1L || !is.finite(value)) value <- definition$value[[definition_index]]
          numericInput(
            input_id,
            if (nzchar(definition$description[[definition_index]])) {
              paste0(name, " · ", definition$description[[definition_index]])
            } else {
              name
            },
            value = value
          )
        }))
      })
      shiny::outputOptions(output, output_id, suspendWhenHidden = FALSE)
    })
  }

  register_observation_covariates(1L)

  output$observation_covariate_notice <- renderUI({
    definition <- covariate_definition()
    if (!nrow(definition)) {
      return(div(class = "covariate-notice empty", "Ce modèle ne déclare aucune covariable."))
    }
    div(
      class = "covariate-notice",
      tags$strong("Covariables au moment du prélèvement"),
      span("Renseignez leur valeur sur chaque ligne. La dernière valeur connue est conservée jusqu'au prélèvement suivant.")
    )
  })
  shiny::outputOptions(output, "observation_covariate_notice", suspendWhenHidden = FALSE)

  read_doses <- function() {
    rows <- lapply(seq_len(isolate(dose_count())), function(index) {
      steady_state <- isTRUE(isolate(input[[paste0("dose_ss_", index)]]))
      count <- if (steady_state) 1L else as.integer(isolate(input[[paste0("dose_count_", index)]]))
      data.frame(
        time = as.numeric(isolate(input[[paste0("dose_time_", index)]])),
        amount = as.numeric(isolate(input[[paste0("dose_amount_", index)]])),
        interval = as.numeric(isolate(input[[paste0("dose_interval_", index)]])),
        count = count,
        infusion = as.numeric(isolate(input[[paste0("dose_infusion_", index)]])),
        ss = as.integer(steady_state)
      )
    })
    data <- do.call(rbind, rows)
    shiny::validate(shiny::need(all(is.finite(as.matrix(data))), "Toutes les administrations doivent être numériques."))
    valid <- data$time >= 0 & data$amount > 0 & data$interval >= 0 & data$count >= 1 & data$infusion >= 0 &
      data$ss %in% c(0L, 1L) & (data$ss == 0L | data$interval > 0)
    shiny::validate(shiny::need(all(valid), "Administration invalide. Un steady state nécessite un intervalle strictement positif."))
    data
  }

  read_observation_records <- function() {
    definition <- isolate(covariate_definition())
    rows <- lapply(seq_len(isolate(observation_count())), function(index) {
      row <- data.frame(
        time = as.numeric(isolate(input[[paste0("observation_time_", index)]])),
        concentration = as.numeric(isolate(input[[paste0("observation_concentration_", index)]])),
        stringsAsFactors = FALSE
      )
      for (definition_index in seq_len(nrow(definition))) {
        name <- definition$name[[definition_index]]
        candidate <- suppressWarnings(as.numeric(isolate(input[[paste0("observation_cov_", name, "_", index)]])))
        if (length(candidate) != 1L || !is.finite(candidate)) candidate <- definition$value[[definition_index]]
        row[[name]] <- candidate
      }
      row
    })
    data <- do.call(rbind, rows)
    shiny::validate(shiny::need(all(is.finite(data$time) & data$time >= 0), "Le temps de prélèvement doit être positif."))
    shiny::validate(shiny::need(all(is.finite(data$concentration) & data$concentration >= 0), "Les concentrations doivent être numériques et positives."))
    data <- data[order(data$time), , drop = FALSE]

    covariate_names <- definition$name
    covariate_history <- data[, c("time", covariate_names), drop = FALSE]
    baseline <- if (length(covariate_names)) {
      as.list(data[1, covariate_names, drop = FALSE])
    } else {
      list()
    }
    observations <- data[data$concentration > 0, c("time", "concentration"), drop = FALSE]
    list(observations = observations, covariate_history = covariate_history, baseline = baseline, raw = data)
  }

  replace_dose_rows <- function(data) {
    removeUI(selector = "#dose_rows .dose-row", multiple = TRUE, immediate = TRUE)
    dose_count(nrow(data))
    for (index in seq_len(nrow(data))) {
      insert_dose_row(
        index,
        time = data$time[[index]],
        amount = data$amount[[index]],
        interval = data$interval[[index]],
        count = data$count[[index]],
        infusion = data$infusion[[index]],
        steady_state = isTRUE(data$ss[[index]] == 1)
      )
    }
  }

  replace_observation_rows <- function(data, expected_model_ids = character()) {
    removeUI(selector = "#observation_rows .observation-row", multiple = TRUE, immediate = TRUE)
    observation_count(nrow(data))
    for (index in seq_len(nrow(data))) {
      insert_observation_row(index, data$time[[index]], data$concentration[[index]])
    }
    pending_import_covariates(list(data = data, expected_model_ids = expected_model_ids))
  }

  observe({
    pending <- pending_import_covariates()
    shiny::req(pending)
    expected_model_ids <- pending$expected_model_ids %||% character()
    if (length(expected_model_ids)) {
      shiny::req(all(expected_model_ids %in% selected_model_ids()))
    }
    data <- pending$data
    definition <- covariate_definition()
    covariate_names <- intersect(setdiff(names(data), c("time", "concentration")), definition$name)
    input_ids <- unlist(lapply(seq_len(nrow(data)), function(index) {
      paste0("observation_cov_", covariate_names, "_", index)
    }))
    if (length(input_ids)) shiny::req(all(vapply(input_ids, function(id) !is.null(input[[id]]), logical(1))))

    for (index in seq_len(nrow(data))) {
      for (name in covariate_names) {
        value <- suppressWarnings(as.numeric(data[[name]][[index]]))
        if (is.finite(value)) {
          updateNumericInput(session, paste0("observation_cov_", name, "_", index), value = value)
        }
      }
    }
    pending_import_covariates(NULL)
    showNotification("Données patient importées dans cette session.", type = "message", duration = 4)
  })

  validate_patient_table <- function(value, required, label, maximum_rows = 100L) {
    if (is.null(value)) stop("Section ", label, " absente du fichier.")
    data <- as.data.frame(value, stringsAsFactors = FALSE, check.names = FALSE)
    missing <- setdiff(required, names(data))
    if (length(missing)) stop("Colonnes manquantes dans ", label, " : ", paste(missing, collapse = ", "))
    if (!nrow(data) || nrow(data) > maximum_rows) stop(label, " doit contenir entre 1 et ", maximum_rows, " lignes.")
    if (ncol(data) > 50L || any(!grepl("^[A-Za-z][A-Za-z0-9_]*$", names(data)))) {
      stop("Noms ou nombre de colonnes invalides dans ", label, ".")
    }
    identity_pattern <- "(^id$|patient|name|nom|prenom|birth|naissance|email|phone|telephone|address|adresse|mrn|ipp|nir)"
    if (any(grepl(identity_pattern, names(data), ignore.case = TRUE))) {
      stop("Le fichier ne doit contenir aucun identifiant patient.")
    }
    for (name in names(data)) data[[name]] <- suppressWarnings(as.numeric(data[[name]]))
    if (!all(is.finite(as.matrix(data)))) stop("Toutes les valeurs de ", label, " doivent être numériques.")
    data
  }

  output$download_patient <- downloadHandler(
    filename = function() paste0("tdm-patient-", Sys.Date(), ".json"),
    content = function(file) {
      doses <- read_doses()
      observations <- read_observation_records()$raw
      model_source <- isolate(input$model_source %||% "library")
      document <- list(
        schema = "pk-mipd-patient",
        version = 1L,
        privacy = list(containsIdentity = FALSE, customCodeIncluded = FALSE),
        model = list(
          source = model_source,
          id = if (identical(model_source, "library")) isolate(input$model_id) else NULL,
          averaging = list(
            enabled = identical(model_source, "library") && isTRUE(isolate(input$enable_averaging)),
            ids = if (identical(model_source, "library")) isolate(input$average_model_ids %||% character()) else character(),
            scheme = isolate(input$weighting_scheme %||% "AIC")
          )
        ),
        doses = doses,
        observations = observations,
        target = list(
          metric = isolate(input$target_metric),
          low = isolate(input$target_low),
          high = isolate(input$target_high),
          doseMin = isolate(input$dose_min),
          doseMax = isolate(input$dose_max),
          doseStep = isolate(input$dose_step),
          intervals = as.numeric(isolate(input$candidate_intervals)),
          infusion = isolate(input$future_infusion)
        )
      )
      jsonlite::write_json(document, file, pretty = TRUE, auto_unbox = TRUE, dataframe = "rows", null = "null")
    }
  )

  observeEvent(input$upload_patient, {
    file_info <- input$upload_patient
    if (is.null(file_info)) return()
    tryCatch({
      if (file_info$size[[1]] > 1024 * 1024) stop("Le fichier patient est limité à 1 Mo.")
      document <- jsonlite::fromJSON(file_info$datapath[[1]], simplifyDataFrame = TRUE)
      unlink(file_info$datapath[[1]], force = TRUE)
      if (!identical(document$schema %||% "", "pk-mipd-patient") || !identical(as.integer(document$version %||% 0), 1L)) {
        stop("Format de fichier patient non reconnu.")
      }

      doses <- validate_patient_table(document$doses, c("time", "amount", "interval", "count", "infusion"), "administrations")
      observations <- validate_patient_table(document$observations, c("time", "concentration"), "observations")
      if (!"ss" %in% names(doses)) doses$ss <- 0
      invalid_doses <- doses$time < 0 | doses$amount <= 0 | doses$interval < 0 | doses$count < 1 | doses$infusion < 0 |
        !doses$ss %in% c(0, 1) | (doses$ss == 1 & doses$interval <= 0)
      if (any(invalid_doses)) stop("Administration invalide dans le fichier. Un steady state nécessite ss = 1 et un intervalle positif.")
      if (any(observations$time < 0 | observations$concentration < 0)) stop("Observation invalide dans le fichier.")
      doses$count <- as.integer(doses$count)
      doses$ss <- as.integer(doses$ss)

      model <- document$model %||% list()
      expected_model_ids <- character()
      if (identical(model$source %||% "", "library") && (model$id %||% "") %in% MODEL_CATALOG$id) {
        updateRadioButtons(session, "model_source", selected = "library")
        updateSelectInput(session, "model_id", selected = model$id)
        averaging <- model$averaging %||% list()
        updateCheckboxInput(session, "enable_averaging", value = isTRUE(averaging$enabled))
        if ((averaging$scheme %||% "AIC") %in% c("AIC", "LL")) {
          updateSelectInput(session, "weighting_scheme", selected = averaging$scheme)
        }
        model_drug <- model_record(model$id)$drug[[1]]
        allowed_ids <- MODEL_CATALOG$id[MODEL_CATALOG$drug == model_drug]
        selected_ids <- intersect(averaging$ids %||% character(), allowed_ids)
        expected_model_ids <- if (isTRUE(averaging$enabled)) unique(c(model$id, selected_ids)) else model$id
        session$onFlushed(function() {
          updateCheckboxGroupInput(session, "average_model_ids", selected = selected_ids)
        }, once = TRUE)
      } else if (identical(model$source %||% "", "custom")) {
        showNotification("Le code C++ personnalisé n'est jamais inclus dans l'export; recollez-le avant l'analyse.", type = "warning", duration = 8)
      }

      target <- document$target %||% list()
      if ((target$metric %||% "") %in% c("AUC24", "Cmin", "Cmax")) updateSelectInput(session, "target_metric", selected = target$metric)
      numeric_targets <- c(low = "target_low", high = "target_high", doseMin = "dose_min", doseMax = "dose_max", doseStep = "dose_step", infusion = "future_infusion")
      for (name in names(numeric_targets)) {
        value <- suppressWarnings(as.numeric(target[[name]] %||% NA_real_))
        if (is.finite(value) && value >= 0) updateNumericInput(session, numeric_targets[[name]], value = value)
      }
      intervals <- intersect(as.character(as.numeric(target$intervals %||% numeric())), c("6", "8", "12", "24", "48"))
      if (length(intervals)) updateCheckboxGroupInput(session, "candidate_intervals", selected = intervals)

      replace_dose_rows(doses)
      replace_observation_rows(observations, expected_model_ids)
      analysis_store(NULL)
      validation_store(NULL)
    }, error = function(error) {
      if (file.exists(file_info$datapath[[1]])) unlink(file_info$datapath[[1]], force = TRUE)
      showNotification(conditionMessage(error), type = "error", duration = 10)
    })
  }, ignoreInit = TRUE)

  model_specifications <- function() {
    if (identical(isolate(input$model_source), "custom")) {
      return(list(list(id = "custom", label = "Modèle personnalisé", code = isolate(input$custom_code))))
    }
    ids <- isolate(selected_model_ids())
    lapply(ids, function(id) {
      record <- model_record(id)
      list(id = id, label = record$label[[1]], code = NULL)
    })
  }

  validate_primary_model <- function() {
    if (identical(isolate(input$model_source), "custom")) {
      model <- compile_model(
        custom_code = isolate(input$custom_code),
        allow_custom = ALLOW_CUSTOM_MODELS,
        custom_soloc = session_model_dir,
        custom_cache = session_model_cache
      )
    } else {
      model <- compile_model(model_id = isolate(input$model_id))
    }
    validate_model_contract(model)
  }

  observeEvent(input$validate_model, {
    withProgress(message = "Compilation du modèle", value = 0.3, {
      result <- tryCatch(validate_primary_model(), error = function(error) list(ok = FALSE, errors = conditionMessage(error), warnings = character()))
      validation_store(result)
      incProgress(0.7)
    })
  })

  output$engine_status <- renderUI({
    result <- validation_store()
    if (is.null(result)) return(span(class = "status-pill idle", "Non validé"))
    if (isTRUE(result$ok)) span(class = "status-pill ok", "Modèle valide") else span(class = "status-pill error", "Erreur modèle")
  })

  output$library_code <- renderText({
    shiny::req(input$model_id)
    read_library_code(input$model_id)
  })

  output$model_contract <- renderUI({
    result <- validation_store()
    if (is.null(result)) return(div(class = "contract-note", "Cliquez sur « Valider le modèle » pour vérifier les tags, OMEGA, SIGMA et sorties capturées."))
    if (!isTRUE(result$ok)) {
      return(div(class = "contract-error", tags$strong("Modèle incompatible"), tags$ul(lapply(result$errors, tags$li))))
    }
    div(
      class = "contract-ok",
      tags$strong("Contrat mapbayr valide"),
      span(paste0("Administration CMT ", result$adm_cmt, " · Observation CMT ", result$obs_cmt, " · ", result$n_eta, " ETA · ", result$n_sigma, " erreurs résiduelles")),
      if (length(result$warnings)) tags$ul(lapply(result$warnings, tags$li))
    )
  })

  observeEvent(input$run_analysis, {
    tryCatch({
      doses <- read_doses()
      observation_records <- read_observation_records()
      observations <- observation_records$observations
      covariates <- observation_records$baseline
      specifications <- model_specifications()
      intervals <- as.numeric(isolate(input$candidate_intervals))

      shiny::validate(shiny::need(length(intervals), "Sélectionnez au moins un intervalle de dose."))
      shiny::validate(shiny::need(input$target_high > input$target_low, "La borne haute doit dépasser la borne basse."))
      shiny::validate(shiny::need(input$dose_max >= input$dose_min && input$dose_step > 0, "La grille de doses est invalide."))

      result <- withProgress(message = "Analyse pharmacométrique", value = 0, {
        incProgress(0.12, detail = "Compilation et validation")
        fits <- fit_model_set(
          specifications,
          doses,
          observations,
          covariates,
          ALLOW_CUSTOM_MODELS,
          covariate_history = observation_records$covariate_history,
          custom_soloc = session_model_dir,
          custom_cache = session_model_cache
        )
        valid <- successful_fits(fits)
        if (!length(valid)) {
          messages <- vapply(fits, function(item) item$message %||% "Unknown error", character(1))
          stop(paste(messages, collapse = " | "))
        }

        incProgress(0.32, detail = "Estimation MAP")
        weights <- compute_model_weights(fits, isolate(input$weighting_scheme %||% "AIC"))
        end_time <- max(c(doses$time + doses$interval * pmax(0, doses$count - 1), observations$time, 24), na.rm = TRUE) + 48
        profiles <- fit_profiles(fits, weights, end_time)
        current_exposure <- current_regimen_exposure(fits, weights, doses)

        incProgress(0.58, detail = "Exploration des posologies")
        recommendations <- recommend_regimens(
          fits = fits,
          weights = weights,
          dose_min = isolate(input$dose_min),
          dose_max = isolate(input$dose_max),
          dose_step = isolate(input$dose_step),
          intervals = intervals,
          infusion = isolate(input$future_infusion),
          metric = isolate(input$target_metric),
          target_low = isolate(input$target_low),
          target_high = isolate(input$target_high)
        )
        best <- recommendations[1, , drop = FALSE]
        best_profile <- simulate_averaged_regimen(
          fits,
          weights,
          dose = best$dose[[1]],
          interval = best$interval[[1]],
          infusion = isolate(input$future_infusion)
        )$profile

        incProgress(0.9, detail = "Préparation des résultats")
        list(
          fits = fits,
          weights = weights,
          model_summary = model_summary(fits, weights),
          fit_profiles = profiles,
          current_exposure = current_exposure,
          recommendations = recommendations,
          best = best,
          best_profile = best_profile,
          observations = observations,
          target_metric = isolate(input$target_metric),
          target_low = isolate(input$target_low),
          target_high = isolate(input$target_high),
          weighting_scheme = isolate(input$weighting_scheme %||% "AIC")
        )
      })
      analysis_store(result)
      bslib::nav_select("analysis_tabs", "fit")
      showNotification("Analyse terminée.", type = "message", duration = 3)
    }, error = function(error) {
      showNotification(conditionMessage(error), type = "error", duration = 10)
    })
  })

  output$fit_empty <- renderUI({
    if (is.null(analysis_store())) div(class = "empty-results", "Renseignez les données puis lancez l'analyse.")
  })

  output$current_exposure_summary <- renderUI({
    result <- analysis_store()
    if (is.null(result)) return(NULL)
    exposure <- result$current_exposure
    regimen_label <- if (isTRUE(exposure$steady_state)) {
      paste0(format_metric(exposure$dose), " mg / ", format_metric(exposure$interval), " h · État stationnaire")
    } else if (isTRUE(exposure$single_dose)) {
      paste0("Dose unique · ", format_metric(exposure$dose), " mg")
    } else {
      paste0(format_metric(exposure$dose), " mg / ", format_metric(exposure$interval), " h")
    }
    c0_detail <- if (isTRUE(exposure$single_dose)) {
      "À 24 h après la dose"
    } else {
      paste0("À ", format_metric(exposure$interval), " h, avant la dose suivante")
    }
    method <- if (any(vapply(successful_fits(result$fits), function(fit) !is.null(fit$estimate), logical(1)))) {
      "MAP bayésienne · mapbayr"
    } else {
      "Prédiction populationnelle"
    }
    div(
      class = "exposure-strip",
      div(span("AUC0-24 actuelle"), strong(format_metric(exposure$auc24)), tags$small("Selon le dernier schéma renseigné")),
      div(span("C0 actuelle"), strong(format_metric(exposure$c0)), tags$small(c0_detail)),
      div(
        span("Schéma actuel"),
        strong(regimen_label),
        tags$small(if (exposure$infusion > 0) paste0("Perfusion : ", format_metric(exposure$infusion), " h") else "Bolus ou oral · perfusion = 0 h")
      ),
      div(span("Estimation"), strong(method), tags$small(if (length(result$weights) > 1) "Prédiction pondérée par model averaging" else "Modèle individuel sélectionné"))
    )
  })

  output$fit_plot <- renderPlot({
    result <- analysis_store()
    shiny::req(result)
    profiles <- result$fit_profiles
    shiny::validate(shiny::need(nrow(profiles$average), "Ajoutez au moins une concentration observée pour produire l'ajustement MAP."))

    ggplot() +
      geom_line(
        data = profiles$per_model,
        aes(time, concentration, group = model),
        color = "#8c969f",
        linewidth = 0.6,
        alpha = 0.55
      ) +
      geom_line(data = profiles$average, aes(time, concentration), color = "#176b70", linewidth = 1.2) +
      geom_point(data = result$observations, aes(time, concentration), color = "#a4441f", size = 3) +
      labs(x = "Temps (h)", y = "Concentration", title = "Prédiction individuelle et observations") +
      theme_minimal(base_size = 13) +
      theme(panel.grid.minor = element_blank(), plot.title = element_text(face = "bold"))
  })

  output$model_table <- renderDT({
    result <- analysis_store()
    shiny::req(result)
    table <- result$model_summary
    table$weight <- round(table$weight, 4)
    table$clearance <- round(table$clearance, 3)
    datatable(
      table,
      rownames = FALSE,
      options = list(dom = "t", pageLength = nrow(table), scrollX = TRUE),
      colnames = c("Modèle", "Statut", "Poids", "CL", "ETA", "Détail")
    )
  })

  output$recommendation_summary <- renderUI({
    result <- analysis_store()
    if (is.null(result)) return(div(class = "empty-results", "Aucun scénario calculé."))
    best <- result$best
    div(
      class = "recommendation-strip",
      div(span("Scénario le plus proche de la cible"), strong(paste0(best$dose, " mg toutes les ", best$interval, " h"))),
      div(span(result$target_metric), strong(round(best$value, 1))),
      div(span("AUC 0-24 h"), strong(round(best$auc24, 1))),
      div(span("Cmin / Cmax"), strong(paste(round(best$cmin, 1), round(best$cmax, 1), sep = " / ")))
    )
  })

  output$recommended_profile <- renderPlot({
    result <- analysis_store()
    shiny::req(result)
    metric_label <- switch(result$target_metric, AUC24 = "AUC 0-24 h", Cmin = "Cmin", Cmax = "Cmax")
    ggplot(result$best_profile, aes(time, concentration)) +
      geom_line(color = "#176b70", linewidth = 1.2) +
      labs(
        x = "Temps depuis la dose (h)",
        y = "Concentration",
        title = paste0("Profil moyen pondéré · cible ", metric_label, " ", result$target_low, "–", result$target_high)
      ) +
      theme_minimal(base_size = 13) +
      theme(panel.grid.minor = element_blank(), plot.title = element_text(face = "bold"))
  })

  output$recommendation_table <- renderDT({
    result <- analysis_store()
    shiny::req(result)
    table <- head(result$recommendations, 50)
    table$auc24 <- round(table$auc24, 1)
    table$cmin <- round(table$cmin, 2)
    table$cmax <- round(table$cmax, 2)
    table$value <- round(table$value, 2)
    table$distance <- round(table$distance, 3)
    table$center_distance <- NULL
    datatable(
      table,
      rownames = FALSE,
      filter = "top",
      options = list(pageLength = 12, scrollX = TRUE),
      colnames = c("Dose", "Intervalle", "AUC24", "Cmin", "Cmax", "Valeur cible", "Dans cible", "Distance")
    ) |>
      formatStyle("in_target", target = "row", backgroundColor = styleEqual(c(TRUE, FALSE), c("#e8f4ed", "transparent")))
  })

  output$download_scenarios <- downloadHandler(
    filename = function() paste0("tdm-scenarios-", Sys.Date(), ".csv"),
    content = function(file) {
      shiny::req(analysis_store())
      utils::write.csv(analysis_store()$recommendations, file, row.names = FALSE, na = "")
    }
  )

  output$catalog_table <- renderDT({
    table <- MODEL_CATALOG[, c("drug", "source", "population", "doi", "provenance", "modelType", "sourceStatus")]
    has_doi <- !is.na(table$doi) & nzchar(table$doi)
    table$doi <- ifelse(
      has_doi,
      paste0('<a href="https://doi.org/', table$doi, '" target="_blank" rel="noopener noreferrer">', table$doi, "</a>"),
      "Source à confirmer"
    )
    table$sourceStatus <- ifelse(table$sourceStatus == "verified", "Vérifiée", ifelse(table$sourceStatus == "secondary", "Secondaire", "À confirmer"))
    datatable(
      table,
      rownames = FALSE,
      filter = "top",
      escape = FALSE,
      options = list(pageLength = 20, scrollX = TRUE),
      colnames = c("Molécule", "Source", "Population source", "DOI", "Provenance", "Type", "Statut")
    )
  })
}

shinyApp(ui = app_ui, server = server)
