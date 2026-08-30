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

time_input_ui <- function(prefix, index, time = 0, days_ago = 0, clock = "08:00", calendar = "") {
  tagList(
    conditionalPanel(
      condition = "input.time_entry_mode == 'relative_hours'",
      numericInput(paste0(prefix, "_time_", index), "Temps relatif (h)", time, step = 0.25)
    ),
    conditionalPanel(
      condition = "input.time_entry_mode == 'relative_days'",
      div(
        class = "compact-time-grid",
        numericInput(paste0(prefix, "_days_ago_", index), "Jours avant référence", days_ago, min = 0, step = 1),
        textInput(paste0(prefix, "_clock_", index), "Heure (HH:MM)", clock)
      )
    ),
    conditionalPanel(
      condition = "input.time_entry_mode == 'calendar'",
      textInput(
        paste0(prefix, "_calendar_", index),
        "Date/heure",
        calendar,
        placeholder = "JJ/MM HH:MM ou JJ/MM/AAAA HH:MM"
      )
    )
  )
}

dose_row_ui <- function(index, time = 0, amount = 1000, interval = 12, count = 4, infusion = 1, steady_state = FALSE) {
  div(
    id = paste0("dose_row_", index),
    class = "record-row dose-row",
    div(class = "record-index", paste0("A", index)),
    div(class = "time-entry", time_input_ui("dose", index, time = time)),
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
    conditionalPanel(
      condition = "input.administration_route == 'IV'",
      numericInput(paste0("dose_infusion_", index), "Perfusion (h, 0 = bolus IV)", infusion, min = 0, step = 0.25)
    ),
    conditionalPanel(
      condition = "input.administration_route == 'Oral'",
      div(class = "route-readonly", tags$strong("Voie orale"), span("La perfusion est imposée à 0 h."))
    )
  )
}

observation_row_ui <- function(index, time = 47.5, concentration = 18) {
  div(
    id = paste0("observation_row_", index),
    class = "record-row observation-row",
    div(class = "record-index", paste0("P", index)),
    div(class = "time-entry", time_input_ui("observation", index, time = time)),
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
              uiOutput("administration_route_ui"),
              conditionalPanel(
                "input.model_source == 'library'",
                selectInput("model_id", "Modèle principal", choices = model_choices, selected = DEFAULT_MODEL),
                checkboxInput("enable_averaging", "Activer le model averaging", FALSE),
                conditionalPanel(
                  "input.enable_averaging == true",
                  div(class = "custom-note", "Seuls les modèles de la même molécule compatibles avec la voie sélectionnée sont proposés."),
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
              conditionalPanel(
                "input.administration_route == 'IV'",
                numericInput("future_infusion", "Durée de perfusion (h, 0 = bolus IV)", 1, min = 0, step = 0.25)
              ),
              conditionalPanel(
                "input.administration_route == 'Oral'",
                div(class = "route-readonly compact", "Voie orale : durée de perfusion fixée à 0 h.")
              )
            )
          ),
          checkboxInput(
            "accept_disclaimer",
            "J'ai lu le statut et j'accepte d'utiliser ce prototype sous ma responsabilité.",
            FALSE
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
                    p("Saisissez des heures relatives, des jours avant une référence ou des dates civiles. Le moteur normalise ensuite l'origine sur la première administration.")
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
                div(
                  class = "timeline-controls",
                  selectInput(
                    "time_entry_mode",
                    "Format temporel",
                    choices = c(
                      "Heures relatives" = "relative_hours",
                      "Jours avant une date de référence" = "relative_days",
                      "Dates et heures" = "calendar"
                    ),
                    selected = "relative_hours"
                  ),
                  conditionalPanel(
                    "input.time_entry_mode != 'relative_hours'",
                    dateInput("reference_date", "Date de référence", value = Sys.Date(), format = "dd/mm/yyyy", language = "fr"),
                    textInput("reference_clock", "Heure de référence", value = format(Sys.time(), "%H:%M"))
                  )
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
                div(
                  class = "table-toolbar result-toolbar",
                  h3("Ajustement bayésien"),
                  downloadButton("download_report", "Créer le rapport", class = "btn-outline-primary btn-sm")
                ),
                uiOutput("current_exposure_summary"),
                plotOutput("fit_plot", height = "430px"),
                h3("Doses supplémentaires : poursuivre ou modifier"),
                uiOutput("future_comparison_summary"),
                plotOutput("future_comparison_plot", height = "430px"),
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
                h3("Distribution prédictive du meilleur scénario"),
                uiOutput("distribution_summary"),
                plotOutput("distribution_plot", height = "330px"),
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
      p("Chaque modèle est associé à l'article qui décrit ses paramètres et sa population. Toute nouvelle entrée est relue avant publication."),
      DTOutput("catalog_table")
    )
  ),
  nav_panel(
    "Réglages",
    value = "settings",
    div(
      class = "plain-page settings-page",
      h1("Réglages de simulation"),
      p("Ces paramètres s'appliquent à la prochaine analyse et sont inclus dans le rapport."),
      div(
        class = "settings-grid",
        div(
          class = "settings-group",
          h2("Résolution et projection"),
          selectInput("simulation_delta", "Pas de simulation", choices = c("Haute · 0,05 h" = 0.05, "Standard · 0,1 h" = 0.1, "Rapide · 0,25 h" = 0.25), selected = 0.1),
          numericInput("additional_doses", "Doses supplémentaires comparées", 6, min = 1, max = 30, step = 1),
          checkboxInput("show_component_profiles", "Afficher chaque modèle sur l'ajustement", TRUE)
        ),
        div(
          class = "settings-group",
          h2("Distribution prédictive"),
          numericInput("mc_replicates", "Réplications Monte Carlo", 250, min = 50, max = 1000, step = 50),
          selectInput("prediction_interval", "Intervalle prédictif", choices = c("80 %" = 80, "90 %" = 90, "95 %" = 95), selected = 90),
          checkboxGroupInput(
            "variability_components",
            "Composantes simulées",
            choices = c("Interindividuelle" = "IIV", "Résiduelle" = "RESID"),
            selected = "IIV"
          )
        )
      ),
      div(class = "privacy-notice settings-privacy", tags$strong("Pas de lien partageable"), span("Les données patient ne sont pas encodées dans l'URL afin d'éviter leur présence dans l'historique du navigateur, les journaux réseau ou les outils d'analytique."))
    )
  ),
  nav_panel(
    "Méthode",
    value = "method",
    div(
      class = "plain-page method-page",
      h1("Méthode et limites"),
      h2("Estimation individuelle"),
      p("Les effets aléatoires individuels sont estimés par maximum a posteriori avec mapbayr. Les administrations, covariables datées et concentrations sont converties en événements NM-TRAN puis simulées avec mrgsolve."),
      h2("Model averaging"),
      p("Chaque modèle analyse les mêmes données. Les prédictions sont moyennées avec des poids issus de la vraisemblance ou du critère d'Akaike. Le serveur refuse l'agrégation de modèles ne partageant pas la même molécule et la même voie d'administration."),
      h2("Exposition et scénarios"),
      p("L'AUC0-24 et la concentration avant la dose suivante sont calculées avec les paramètres individuels estimés. La projection compare le maintien de la dernière posologie à l'application du scénario classé en tête, sur le nombre de doses supplémentaires choisi dans Réglages."),
      h2("Distribution"),
      p("La distribution prédictive est une simulation Monte Carlo exploratoire. Elle mélange les modèles selon leurs poids et peut inclure la variabilité interindividuelle et l'erreur résiduelle publiées. Elle ne représente pas automatiquement un intervalle de confiance clinique validé."),
      h2("Sécurité"),
      p("Le serveur public ne compile jamais directement le C++ reçu. Pour un modèle Atelier Lego, il extrait une spécification JSON, la valide, régénère lui-même le code mrgsolve puis compile uniquement ce code contrôlé. Tout autre C++ reste refusé tant qu'il n'est pas exécuté dans un conteneur éphémère isolé."),
      p("Les imports JSON sont traités dans la session Shiny et leur fichier temporaire est supprimé immédiatement après lecture. Les exports sont produits à la demande sans base de données."),
      h2("Statut"),
      div(
        class = "status-disclaimer",
        tags$strong("Avertissement obligatoire"),
        p("Ce prototype est destiné à la recherche et à l'enseignement. Il n'est pas enregistré comme dispositif médical, ne garantit ni l'exactitude d'un résultat ni son applicabilité à un patient particulier et ne remplace pas le jugement clinique."),
        p("Toute décision de dose reste sous la responsabilité du professionnel de santé et exige la vérification de la voie, des horaires, des unités, de la population source, des covariables, des concentrations, de la fonction d'organe et des recommandations locales. Une validation indépendante et une gouvernance documentée sont nécessaires avant toute utilisation clinique.")
      )
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
  pending_lego_covariates <- reactiveVal(NULL)
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

  output$administration_route_ui <- renderUI({
    if (identical(input$model_source %||% "library", "custom")) {
      routes <- c("IV", "Oral")
    } else {
      shiny::req(input$model_id)
      routes <- model_routes(model_record(input$model_id))
    }
    current <- isolate(input$administration_route %||% "")
    selected <- if (current %in% routes) current else routes[[1]]
    selectInput(
      "administration_route",
      "Voie d'administration",
      choices = stats::setNames(routes, routes),
      selected = selected
    )
  })
  shiny::outputOptions(output, "administration_route_ui", suspendWhenHidden = FALSE)

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
    pending_lego_covariates(list(code = safe_code, definition = parse_covariates(safe_code)))
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
    ids <- if (!isTRUE(input$enable_averaging)) input$model_id else unique(c(input$model_id, input$average_model_ids %||% character()))
    route <- input$administration_route %||% ""
    shiny::req(nzchar(route))
    compatible <- vapply(ids, function(id) model_supports_route(model_record(id), route), logical(1))
    shiny::validate(shiny::need(all(compatible), "Tous les modèles moyennés doivent utiliser la même voie d'administration."))
    ids
  })

  output$average_models_ui <- renderUI({
    shiny::req(input$model_id)
    drug <- model_record(input$model_id)$drug[[1]]
    route <- input$administration_route %||% ""
    shiny::req(nzchar(route))
    choices <- catalog_choices(drug, route)
    checkboxGroupInput(
      "average_model_ids",
      paste0("Modèles de ", drug, " · voie ", route),
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

  observe({
    pending <- pending_lego_covariates()
    shiny::req(pending)
    shiny::req(identical(input$model_source, "custom"))
    shiny::req(identical(input$custom_code, pending$code))
    definition <- pending$definition
    input_ids <- unlist(lapply(seq_len(observation_count()), function(index) {
      paste0("observation_cov_", definition$name, "_", index)
    }))
    if (length(input_ids)) shiny::req(all(vapply(input_ids, function(id) !is.null(input[[id]]), logical(1))))

    for (index in seq_len(observation_count())) {
      for (definition_index in seq_len(nrow(definition))) {
        updateNumericInput(
          session,
          paste0("observation_cov_", definition$name[[definition_index]], "_", index),
          value = definition$value[[definition_index]]
        )
      }
    }
    pending_lego_covariates(NULL)
  })

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

  parse_clock_minutes <- function(value, label) {
    value <- trimws(as.character(value %||% ""))
    match <- regexec("^([01]?[0-9]|2[0-3]):([0-5][0-9])$", value)
    parts <- regmatches(value, match)[[1]]
    shiny::validate(shiny::need(length(parts) == 3L, paste0(label, " doit respecter HH:MM.")))
    as.numeric(parts[[2]]) * 60 + as.numeric(parts[[3]])
  }

  reference_datetime <- function() {
    date <- as.Date(input$reference_date %||% Sys.Date())
    minutes <- parse_clock_minutes(input$reference_clock %||% "00:00", "L'heure de référence")
    as.POSIXct(date, tz = "UTC") + minutes * 60
  }

  parse_calendar_datetime <- function(value, reference, label) {
    value <- trimws(as.character(value %||% ""))
    has_year <- grepl("^\\d{1,2}/\\d{1,2}/\\d{2,4}", value) || grepl("^\\d{4}-", value)
    year <- format(reference, "%Y", tz = "UTC")
    candidates <- if (has_year) value else paste(value, year)
    formats <- if (has_year) {
      c("%d/%m/%Y %H:%M", "%d/%m/%y %H:%M", "%Y-%m-%d %H:%M")
    } else {
      "%d/%m %H:%M %Y"
    }
    parsed <- NA_real_
    for (format in formats) {
      candidate <- suppressWarnings(as.POSIXct(strptime(candidates, format = format, tz = "UTC")))
      if (!is.na(candidate)) {
        parsed <- candidate
        break
      }
    }
    shiny::validate(shiny::need(!is.na(parsed), paste0(label, " est invalide. Utilisez JJ/MM HH:MM ou JJ/MM/AAAA HH:MM.")))
    if (!has_year && parsed > reference + 24 * 3600) {
      previous <- paste(value, as.integer(year) - 1L)
      parsed <- as.POSIXct(strptime(previous, format = "%d/%m %H:%M %Y", tz = "UTC"))
    }
    parsed
  }

  read_record_time <- function(prefix, index) {
    mode <- isolate(input$time_entry_mode %||% "relative_hours")
    if (identical(mode, "relative_hours")) {
      return(as.numeric(isolate(input[[paste0(prefix, "_time_", index)]])))
    }
    reference <- reference_datetime()
    if (identical(mode, "relative_days")) {
      days <- as.numeric(isolate(input[[paste0(prefix, "_days_ago_", index)]]))
      clock <- parse_clock_minutes(isolate(input[[paste0(prefix, "_clock_", index)]]), "L'heure saisie")
      reference_clock <- as.numeric(format(reference, "%H", tz = "UTC")) * 60 + as.numeric(format(reference, "%M", tz = "UTC"))
      return(-days * 24 + (clock - reference_clock) / 60)
    }
    parsed <- parse_calendar_datetime(
      isolate(input[[paste0(prefix, "_calendar_", index)]]),
      reference,
      paste0("La date de la ligne ", index)
    )
    as.numeric(difftime(parsed, reference, units = "hours"))
  }

  normalize_timeline <- function(doses, observation_records) {
    origin <- min(doses$time, na.rm = TRUE)
    doses$time <- doses$time - origin
    observation_records$raw$time <- observation_records$raw$time - origin
    observation_records$covariate_history$time <- observation_records$covariate_history$time - origin
    observation_records$observations$time <- observation_records$observations$time - origin
    shiny::validate(shiny::need(all(observation_records$raw$time >= 0), "Une concentration ou covariable est datée avant la première administration."))
    list(doses = doses, observations = observation_records, origin = origin)
  }

  read_doses <- function() {
    rows <- lapply(seq_len(isolate(dose_count())), function(index) {
      steady_state <- isTRUE(isolate(input[[paste0("dose_ss_", index)]]))
      count <- if (steady_state) 1L else as.integer(isolate(input[[paste0("dose_count_", index)]]))
      data.frame(
        time = read_record_time("dose", index),
        amount = as.numeric(isolate(input[[paste0("dose_amount_", index)]])),
        interval = as.numeric(isolate(input[[paste0("dose_interval_", index)]])),
        count = count,
        infusion = if (identical(isolate(input$administration_route), "Oral")) 0 else as.numeric(isolate(input[[paste0("dose_infusion_", index)]])),
        ss = as.integer(steady_state)
      )
    })
    data <- do.call(rbind, rows)
    shiny::validate(shiny::need(all(is.finite(as.matrix(data))), "Toutes les administrations doivent être numériques."))
    valid <- data$amount > 0 & data$interval >= 0 & data$count >= 1 & data$infusion >= 0 &
      data$ss %in% c(0L, 1L) & (data$ss == 0L | data$interval > 0)
    shiny::validate(shiny::need(all(valid), "Administration invalide. Un steady state nécessite un intervalle strictement positif."))
    data
  }

  read_observation_records <- function() {
    definition <- isolate(covariate_definition())
    rows <- lapply(seq_len(isolate(observation_count())), function(index) {
      row <- data.frame(
        time = read_record_time("observation", index),
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
    shiny::validate(shiny::need(all(is.finite(data$time)), "Le temps de prélèvement doit être valide."))
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
      timeline <- normalize_timeline(read_doses(), read_observation_records())
      doses <- timeline$doses
      observations <- timeline$observations$raw
      model_source <- isolate(input$model_source %||% "library")
      document <- list(
        schema = "pk-mipd-patient",
        version = 2L,
        privacy = list(containsIdentity = FALSE, customCodeIncluded = FALSE),
        timeline = list(mode = "relative_hours", origin = "first_administration"),
        model = list(
          source = model_source,
          id = if (identical(model_source, "library")) isolate(input$model_id) else NULL,
          route = isolate(input$administration_route),
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
          infusion = if (identical(isolate(input$administration_route), "Oral")) 0 else isolate(input$future_infusion)
        ),
        settings = list(
          delta = as.numeric(isolate(input$simulation_delta)),
          additionalDoses = as.integer(isolate(input$additional_doses)),
          monteCarloReplicates = as.integer(isolate(input$mc_replicates)),
          predictionInterval = as.numeric(isolate(input$prediction_interval)),
          variability = isolate(input$variability_components %||% character())
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
      version <- as.integer(document$version %||% 0)
      if (!identical(document$schema %||% "", "pk-mipd-patient") || !version %in% c(1L, 2L)) {
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
        record <- model_record(model$id)
        routes <- model_routes(record)
        route <- as.character(model$route %||% routes[[1]])
        if (!route %in% routes) route <- routes[[1]]
        averaging <- model$averaging %||% list()
        updateCheckboxInput(session, "enable_averaging", value = isTRUE(averaging$enabled))
        if ((averaging$scheme %||% "AIC") %in% c("AIC", "LL")) {
          updateSelectInput(session, "weighting_scheme", selected = averaging$scheme)
        }
        model_drug <- record$drug[[1]]
        route_compatible <- vapply(seq_len(nrow(MODEL_CATALOG)), function(index) {
          MODEL_CATALOG$drug[[index]] == model_drug && model_supports_route(MODEL_CATALOG[index, , drop = FALSE], route)
        }, logical(1))
        allowed_ids <- MODEL_CATALOG$id[route_compatible]
        selected_ids <- intersect(averaging$ids %||% character(), allowed_ids)
        expected_model_ids <- if (isTRUE(averaging$enabled)) unique(c(model$id, selected_ids)) else model$id
        session$onFlushed(function() {
          updateSelectInput(session, "administration_route", selected = route)
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

      settings <- document$settings %||% list()
      if ((settings$delta %||% "") %in% c(0.05, 0.1, 0.25)) updateSelectInput(session, "simulation_delta", selected = as.character(settings$delta))
      additional_doses <- suppressWarnings(as.integer(settings$additionalDoses %||% NA_integer_))
      if (is.finite(additional_doses) && additional_doses >= 1 && additional_doses <= 30) updateNumericInput(session, "additional_doses", value = additional_doses)
      mc_replicates <- suppressWarnings(as.integer(settings$monteCarloReplicates %||% NA_integer_))
      if (is.finite(mc_replicates) && mc_replicates >= 50 && mc_replicates <= 1000) updateNumericInput(session, "mc_replicates", value = mc_replicates)
      prediction_interval <- suppressWarnings(as.numeric(settings$predictionInterval %||% NA_real_))
      if (prediction_interval %in% c(80, 90, 95)) updateSelectInput(session, "prediction_interval", selected = as.character(prediction_interval))
      variability <- intersect(settings$variability %||% character(), c("IIV", "RESID"))
      if (length(variability)) updateCheckboxGroupInput(session, "variability_components", selected = variability)

      updateSelectInput(session, "time_entry_mode", selected = "relative_hours")
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
    route <- isolate(input$administration_route %||% "")
    if (identical(isolate(input$model_source), "custom")) {
      if (!nzchar(route)) route <- "IV"
      return(list(list(id = "custom", label = "Modèle personnalisé", code = isolate(input$custom_code), route = route, adm_cmt_name = NULL)))
    }
    primary_id <- isolate(input$model_id)
    primary_record <- model_record(primary_id)
    if (!nzchar(route)) route <- model_routes(primary_record)[[1]]
    ids <- if (!isTRUE(isolate(input$enable_averaging))) {
      primary_id
    } else {
      unique(c(primary_id, isolate(input$average_model_ids %||% character())))
    }
    compatible <- vapply(ids, function(id) model_supports_route(model_record(id), route), logical(1))
    shiny::validate(shiny::need(all(compatible), "Tous les modèles moyennés doivent utiliser la même voie d'administration."))
    lapply(ids, function(id) {
      record <- model_record(id)
      list(
        id = id,
        label = record$label[[1]],
        code = NULL,
        route = route,
        adm_cmt_name = model_administration_cmt(record, route)
      )
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
    contract <- validate_model_contract(model)
    specification <- model_specifications()[[1]]
    if (isTRUE(contract$ok)) contract$adm_cmt <- resolve_administration_cmt(model, contract, specification)
    contract$route <- specification$route
    contract
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
      span(paste0("Voie ", result$route, " · Administration CMT ", result$adm_cmt, " · Observation CMT ", result$obs_cmt, " · ", result$n_eta, " ETA · ", result$n_sigma, " erreurs résiduelles")),
      if (length(result$warnings)) tags$ul(lapply(result$warnings, tags$li))
    )
  })

  observeEvent(input$run_analysis, {
    tryCatch({
      shiny::validate(shiny::need(isTRUE(input$accept_disclaimer), "Lisez et acceptez l'avertissement avant de lancer l'analyse."))
      timeline <- normalize_timeline(read_doses(), read_observation_records())
      doses <- timeline$doses
      observation_records <- timeline$observations
      observations <- observation_records$observations
      covariates <- observation_records$baseline
      specifications <- model_specifications()
      intervals <- as.numeric(isolate(input$candidate_intervals))
      route <- isolate(input$administration_route)
      infusion <- if (identical(route, "Oral")) 0 else as.numeric(isolate(input$future_infusion))
      delta <- as.numeric(isolate(input$simulation_delta %||% 0.1))

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
        dose_ss <- if ("ss" %in% names(doses)) as.integer(doses$ss) else rep(0L, nrow(doses))
        known_dose_times <- doses$time + ifelse(dose_ss == 1L, 0, doses$interval * pmax(0, doses$count - 1))
        end_time <- max(c(known_dose_times, observations$time, 24), na.rm = TRUE) + 48
        profiles <- fit_profiles(fits, weights, end_time, delta = max(delta, 0.1))
        current_exposure <- current_regimen_exposure(fits, weights, doses)

        incProgress(0.58, detail = "Exploration des posologies")
        recommendations <- recommend_regimens(
          fits = fits,
          weights = weights,
          dose_min = isolate(input$dose_min),
          dose_max = isolate(input$dose_max),
          dose_step = isolate(input$dose_step),
          intervals = intervals,
          infusion = infusion,
          metric = isolate(input$target_metric),
          target_low = isolate(input$target_low),
          target_high = isolate(input$target_high),
          delta = delta
        )
        best <- recommendations[1, , drop = FALSE]
        best_profile <- simulate_averaged_regimen(
          fits,
          weights,
          dose = best$dose[[1]],
          interval = best$interval[[1]],
          infusion = infusion,
          delta = delta
        )$profile

        incProgress(0.76, detail = "Comparaison des doses futures")
        future_comparison <- compare_future_regimens(
          fits,
          weights,
          doses,
          observations,
          recommended = best,
          additional_doses = isolate(input$additional_doses %||% 6),
          delta = delta
        )

        incProgress(0.86, detail = "Distribution prédictive")
        variability <- isolate(input$variability_components %||% character())
        distribution <- simulate_regimen_distribution(
          fits,
          weights,
          dose = best$dose[[1]],
          interval = best$interval[[1]],
          infusion = infusion,
          metric = isolate(input$target_metric),
          replicates = isolate(input$mc_replicates %||% 250),
          interval_level = as.numeric(isolate(input$prediction_interval %||% 90)),
          delta = delta,
          include_iiv = "IIV" %in% variability,
          include_residual = "RESID" %in% variability
        )

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
          future_comparison = future_comparison,
          distribution = distribution,
          doses = doses,
          observations = observations,
          observation_records = observation_records$raw,
          route = route,
          infusion = infusion,
          target_metric = isolate(input$target_metric),
          target_low = isolate(input$target_low),
          target_high = isolate(input$target_high),
          weighting_scheme = isolate(input$weighting_scheme %||% "AIC"),
          settings = list(
            delta = delta,
            additional_doses = as.integer(isolate(input$additional_doses %||% 6)),
            mc_replicates = as.integer(isolate(input$mc_replicates %||% 250)),
            prediction_interval = as.numeric(isolate(input$prediction_interval %||% 90)),
            variability = variability,
            show_component_profiles = isTRUE(isolate(input$show_component_profiles))
          )
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
        tags$small(if (exposure$infusion > 0) {
          paste0("Perfusion IV : ", format_metric(exposure$infusion), " h")
        } else if (identical(result$route, "Oral")) {
          "Administration orale · perfusion = 0 h"
        } else {
          "Bolus IV · perfusion = 0 h"
        })
      ),
      div(span("Estimation"), strong(method), tags$small(if (length(result$weights) > 1) "Prédiction pondérée par model averaging" else "Modèle individuel sélectionné"))
    )
  })

  output$fit_plot <- renderPlot({
    result <- analysis_store()
    shiny::req(result)
    profiles <- result$fit_profiles
    shiny::validate(shiny::need(nrow(profiles$average), "Ajoutez au moins une concentration observée pour produire l'ajustement MAP."))

    plot <- ggplot()
    if (isTRUE(result$settings$show_component_profiles)) {
      plot <- plot + geom_line(
          data = profiles$per_model,
          aes(time, concentration, group = model),
          color = "#8c969f",
          linewidth = 0.6,
          alpha = 0.55
        )
    }
    plot +
      geom_line(data = profiles$average, aes(time, concentration), color = "#176b70", linewidth = 1.2) +
      geom_point(data = result$observations, aes(time, concentration), color = "#a4441f", size = 3) +
      labs(x = "Temps (h)", y = "Concentration", title = "Prédiction individuelle et observations") +
      theme_minimal(base_size = 13) +
      theme(panel.grid.minor = element_blank(), plot.title = element_text(face = "bold"))
  })

  output$future_comparison_summary <- renderUI({
    result <- analysis_store()
    if (is.null(result)) return(div(class = "empty-results", "La comparaison sera calculée avec l'analyse."))
    comparison <- result$future_comparison
    current <- comparison$scenarios[["Poursuite de la dernière posologie"]]
    recommended <- comparison$scenarios[["Application de la recommandation"]]
    div(
      class = "comparison-strip",
      div(span("Prochaine dose simulée"), strong(paste0("h ", format_metric(comparison$future_start)))),
      div(span("Poursuite"), strong(paste0(current$dose, " mg / ", current$interval, " h"))),
      div(span("Recommandation"), strong(paste0(recommended$dose, " mg / ", recommended$interval, " h"))),
      div(span("Projection"), strong(paste0(comparison$additional_doses, " doses supplémentaires")))
    )
  })

  output$future_comparison_plot <- renderPlot({
    result <- analysis_store()
    shiny::req(result)
    comparison <- result$future_comparison
    window_start <- max(0, comparison$decision_time - 24)
    ggplot(comparison$profiles, aes(time, concentration, color = scenario)) +
      geom_vline(xintercept = comparison$decision_time, color = "#66717c", linetype = "dashed") +
      geom_vline(xintercept = comparison$future_start, color = "#17202a", linetype = "dotted") +
      geom_line(linewidth = 1.05) +
      coord_cartesian(xlim = c(window_start, comparison$end_time)) +
      scale_color_manual(values = c(
        "Poursuite de la dernière posologie" = "#66717c",
        "Application de la recommandation" = "#176b70"
      )) +
      labs(x = "Temps depuis la première administration (h)", y = "Concentration", color = NULL) +
      theme_minimal(base_size = 13) +
      theme(panel.grid.minor = element_blank(), legend.position = "top")
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

  output$distribution_summary <- renderUI({
    result <- analysis_store()
    if (is.null(result)) return(div(class = "empty-results", "La distribution sera calculée avec l'analyse."))
    distribution <- result$distribution
    components <- c(
      if (isTRUE(distribution$include_iiv)) "variabilité interindividuelle",
      if (isTRUE(distribution$include_residual)) "erreur résiduelle",
      if (length(result$weights) > 1L) "incertitude entre modèles"
    )
    div(
      class = "distribution-strip",
      div(span("Médiane"), strong(format_metric(distribution$median))),
      div(span(paste0("Intervalle prédictif ", distribution$interval_level, " %")), strong(paste0(format_metric(distribution$lower), " – ", format_metric(distribution$upper)))),
      div(span("Composantes"), strong(if (length(components)) paste(components, collapse = ", ") else "Aucune variabilité aléatoire"))
    )
  })

  output$distribution_plot <- renderPlot({
    result <- analysis_store()
    shiny::req(result)
    distribution <- result$distribution
    metric_label <- switch(distribution$metric, AUC24 = "AUC 0-24 h", Cmin = "Cmin", Cmax = "Cmax")
    ggplot(distribution$data, aes(value)) +
      geom_histogram(bins = 30, fill = "#9fc9c8", color = "#176b70", linewidth = 0.25) +
      geom_vline(xintercept = c(distribution$lower, distribution$upper), color = "#a4441f", linetype = "dashed") +
      geom_vline(xintercept = distribution$median, color = "#176b70", linewidth = 1) +
      labs(x = metric_label, y = "Réplications", title = paste0("Distribution du scénario ", result$best$dose, " mg / ", result$best$interval, " h")) +
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
      colnames = c("Dose", "Intervalle", "Perfusion", "AUC24", "Cmin", "Cmax", "Valeur cible", "Dans cible", "Distance")
    ) |>
      formatStyle("in_target", target = "row", backgroundColor = styleEqual(c(TRUE, FALSE), c("#e8f4ed", "transparent")))
  })

  report_table <- function(data) {
    data <- as.data.frame(data, stringsAsFactors = FALSE)
    tags$table(
      tags$thead(tags$tr(lapply(names(data), tags$th))),
      tags$tbody(lapply(seq_len(nrow(data)), function(index) {
        tags$tr(lapply(data[index, , drop = FALSE], function(value) tags$td(as.character(value))))
      }))
    )
  }

  report_plot_uri <- function(plot, width = 9, height = 4.5) {
    path <- tempfile(fileext = ".png")
    on.exit(unlink(path, force = TRUE), add = TRUE)
    ggsave(path, plot = plot, width = width, height = height, dpi = 150, bg = "white")
    base64enc::dataURI(file = path, mime = "image/png")
  }

  output$download_report <- downloadHandler(
    filename = function() paste0("rapport-tdm-", Sys.Date(), ".html"),
    content = function(file) {
      result <- analysis_store()
      shiny::req(result)
      exposure <- result$current_exposure
      best <- result$best
      fit_plot <- ggplot() +
        geom_line(data = result$fit_profiles$average, aes(time, concentration), color = "#176b70", linewidth = 1.1) +
        geom_point(data = result$observations, aes(time, concentration), color = "#a4441f", size = 2.5) +
        labs(x = "Temps (h)", y = "Concentration") +
        theme_minimal(base_size = 11)
      comparison <- result$future_comparison
      comparison_plot <- ggplot(comparison$profiles, aes(time, concentration, color = scenario)) +
        geom_vline(xintercept = comparison$decision_time, color = "#66717c", linetype = "dashed") +
        geom_line(linewidth = 1) +
        scale_color_manual(values = c(
          "Poursuite de la dernière posologie" = "#66717c",
          "Application de la recommandation" = "#176b70"
        )) +
        labs(x = "Temps (h)", y = "Concentration", color = NULL) +
        theme_minimal(base_size = 11) +
        theme(legend.position = "top")

      model_table <- result$model_summary
      model_table$weight <- round(model_table$weight, 4)
      model_table$clearance <- round(model_table$clearance, 3)
      dose_table <- result$doses
      names(dose_table) <- c("Temps (h)", "Dose (mg)", "Intervalle (h)", "Nombre", "Perfusion (h)", "SS")
      observation_table <- result$observation_records
      names(observation_table)[names(observation_table) == "time"] <- "Temps (h)"
      names(observation_table)[names(observation_table) == "concentration"] <- "Concentration"
      references <- lapply(names(successful_fits(result$fits)), function(id) {
        if (!id %in% MODEL_CATALOG$id) return(tags$li("Modèle personnalisé de session"))
        record <- model_record(id)
        tags$li(record$citation[[1]], " · DOI ", record$doi[[1]])
      })

      document <- tags$html(
        tags$head(
          tags$meta(charset = "utf-8"),
          tags$title("Rapport TDM"),
          tags$style(HTML("body{font-family:Arial,sans-serif;color:#17202a;max-width:1050px;margin:32px auto;padding:0 24px;line-height:1.45}h1,h2{font-family:Georgia,serif}h1{border-bottom:3px solid #176b70;padding-bottom:12px}h2{margin-top:30px;border-bottom:1px solid #dfe4e8;padding-bottom:6px}.summary{display:grid;grid-template-columns:repeat(4,1fr);border:1px solid #dfe4e8}.summary div{padding:12px;border-right:1px solid #dfe4e8}.summary span{display:block;color:#66717c;font-size:11px;text-transform:uppercase}.summary strong{display:block;margin-top:4px}table{width:100%;border-collapse:collapse;font-size:12px}th,td{border:1px solid #dfe4e8;padding:7px;text-align:left}th{background:#f1f4f5}img{width:100%;height:auto}.warning{border-left:4px solid #b16916;background:#fffaf0;padding:12px 15px;margin-top:28px;color:#5e4b23}.meta{color:#66717c;font-size:12px}@media print{body{margin:0}.no-print{display:none}h2{break-after:avoid}table,img{break-inside:avoid}}"))
        ),
        tags$body(
          h1("Rapport d'analyse TDM"),
          p(class = "meta", paste0("Généré le ", format(Sys.time(), "%d/%m/%Y à %H:%M"), " · voie ", result$route, " · aucune donnée conservée après la session")),
          div(
            class = "summary",
            div(span("AUC0-24 actuelle"), strong(format_metric(exposure$auc24))),
            div(span("C0 actuelle"), strong(format_metric(exposure$c0))),
            div(span("Recommandation"), strong(paste0(best$dose, " mg / ", best$interval, " h"))),
            div(span("Cible"), strong(paste0(result$target_metric, " ", result$target_low, "–", result$target_high)))
          ),
          h2("Ajustement"),
          tags$img(src = report_plot_uri(fit_plot), alt = "Ajustement pharmacocinétique"),
          h2("Comparaison des doses supplémentaires"),
          p(paste0(comparison$additional_doses, " doses simulées à partir de h ", format_metric(comparison$future_start), ".")),
          tags$img(src = report_plot_uri(comparison_plot), alt = "Comparaison de posologies"),
          h2("Distribution prédictive"),
          p(paste0("Médiane ", format_metric(result$distribution$median), " · intervalle prédictif ", result$distribution$interval_level, " % : ", format_metric(result$distribution$lower), "–", format_metric(result$distribution$upper), ".")),
          h2("Modèles et pondérations"),
          report_table(model_table),
          h2("Administrations"),
          report_table(dose_table),
          h2("Concentrations et covariables"),
          report_table(observation_table),
          h2("Références"),
          tags$ul(references),
          div(
            class = "warning",
            tags$strong("Prototype de recherche et d'enseignement"),
            p("Ce rapport ne constitue pas une prescription ni une recommandation clinique validée. Vérifiez les données, unités, horaires, voie d'administration, population source et limites du modèle. Toute décision reste sous la responsabilité du professionnel de santé.")
          )
        )
      )
      htmltools::save_html(document, file = file)
    }
  )

  output$download_scenarios <- downloadHandler(
    filename = function() paste0("tdm-scenarios-", Sys.Date(), ".csv"),
    content = function(file) {
      shiny::req(analysis_store())
      utils::write.csv(analysis_store()$recommendations, file, row.names = FALSE, na = "")
    }
  )

  output$catalog_table <- renderDT({
    table <- MODEL_CATALOG[, c("drug", "model", "routes", "citation", "population", "doi", "modelType", "sourceStatus")]
    table$routes <- vapply(table$routes, function(routes) paste(routes, collapse = " + "), character(1))
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
      colnames = c("Molécule", "Modèle", "Voie", "Article source", "Population de l'article", "DOI", "Type", "Statut bibliographique")
    )
  })
}

shinyApp(ui = app_ui, server = server)
