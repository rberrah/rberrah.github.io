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

format_metric <- function(value, digits = 1, lang = "fr") {
  if (!length(value) || !is.finite(value[[1]])) return(app_t(lang, "Non calculable", "Not available"))
  format(round(as.numeric(value[[1]]), digits), nsmall = digits, trim = TRUE)
}

APP_ROOT <- normalizePath(getwd(), winslash = "/", mustWork = TRUE)
source(file.path(APP_ROOT, "R", "model_library.R"), local = TRUE)
source(file.path(APP_ROOT, "R", "i18n.R"), local = TRUE)
source(file.path(APP_ROOT, "R", "engine.R"), local = TRUE)
source(file.path(APP_ROOT, "R", "ml_engine.R"), local = TRUE)

ml_concordance <- function(result, lang = "fr") {
  map_auc24 <- suppressWarnings(as.numeric(result$current_exposure$steady_state_auc24 %||% NA_real_))
  ml_auc24 <- suppressWarnings(as.numeric(result$ml_status$auc24 %||% NA_real_))
  if (!is.finite(map_auc24) || map_auc24 <= 0 || !is.finite(ml_auc24) || ml_auc24 <= 0) return(NULL)
  relative_gap <- 100 * (ml_auc24 / map_auc24 - 1)
  absolute_gap <- abs(relative_gap)
  level <- if (absolute_gap <= 10) "close" else if (absolute_gap <= 20) "moderate" else "divergent"
  interpretation <- switch(level,
    close = app_t(lang,
      paste0("Les estimations sont proches (écart relatif ", format_metric(absolute_gap), " %). Cette concordance soutient la cohérence du résultat pour ce profil, sans constituer une validation clinique du ML."),
      paste0("The estimates are close (relative difference ", format_metric(absolute_gap), "%). This agreement supports consistency for this profile but is not a clinical validation of ML.")),
    moderate = app_t(lang,
      paste0("L'écart entre MAP-BE et ML est modéré (", format_metric(absolute_gap), " %). Vérifiez en priorité les horaires, les doses et les covariables avant d'interpréter l'estimation ML."),
      paste0("The MAP-BE and ML estimates differ moderately (", format_metric(absolute_gap), "%). Check times, doses, and covariates before interpreting the ML estimate.")),
    divergent = app_t(lang,
      paste0("Les deux méthodes divergent de ", format_metric(absolute_gap), " %. Cette discordance doit conduire à contrôler les données et à privilégier l'analyse pharmacométrique validée; elle ne permet pas de choisir la valeur la plus favorable."),
      paste0("The two methods differ by ", format_metric(absolute_gap), "%. Check the data and prioritize the validated pharmacometric analysis; do not select the more favorable value."))
  )
  list(
    map_auc24 = map_auc24,
    ml_auc24 = ml_auc24,
    relative_gap = relative_gap,
    absolute_gap = absolute_gap,
    level = level,
    interpretation = interpretation
  )
}

build_ml_comparison_plot <- function(result, lang = "fr") {
  concordance <- ml_concordance(result, lang)
  if (is.null(concordance)) return(NULL)
  data <- data.frame(
    method = factor(c("MAP-BE", "ML"), levels = c("MAP-BE", "ML")),
    auc24 = c(concordance$map_auc24, concordance$ml_auc24)
  )
  color <- switch(concordance$level, close = "#287a4d", moderate = "#b16916", divergent = "#a43d35")
  limit_values <- data$auc24
  if (identical(result$target_metric, "AUC24")) {
    limit_values <- c(limit_values, result$target_low, result$target_high)
  }
  limit_span <- diff(range(limit_values, na.rm = TRUE))
  limit_padding <- max(25, 0.18 * if (is.finite(limit_span) && limit_span > 0) limit_span else max(limit_values))
  y_limits <- c(max(0, min(limit_values) - limit_padding), max(limit_values) + limit_padding)
  plot <- ggplot(data, aes(method, auc24, group = 1))
  if (identical(result$target_metric, "AUC24")) {
    plot <- plot + annotate(
      "rect",
      xmin = -Inf,
      xmax = Inf,
      ymin = result$target_low,
      ymax = result$target_high,
      fill = "#dcece5",
      alpha = 0.7
    )
  }
  plot +
    geom_line(color = color, linewidth = 1.2) +
    geom_point(aes(fill = method), shape = 21, size = 6, color = "white", stroke = 1.1) +
    geom_text(aes(label = sprintf("%.1f", auc24)), vjust = -1.15, fontface = "bold", color = "#17202a") +
    scale_fill_manual(values = c("MAP-BE" = "#176b70", "ML" = "#a4441f"), guide = "none") +
    coord_cartesian(ylim = y_limits, clip = "off") +
    labs(
      x = NULL,
      y = app_t(lang, "AUC0-24 à l'état stationnaire (mg.h/L)", "Steady-state AUC0-24 (mg.h/L)"),
      subtitle = if (identical(result$target_metric, "AUC24")) app_t(lang, "La zone verte représente la cible définie dans les réglages.", "The green area represents the target defined in settings.") else NULL,
      caption = paste(strwrap(concordance$interpretation, width = 105), collapse = "\n")
    ) +
    theme_minimal(base_size = 13) +
    theme(
      panel.grid.minor = element_blank(),
      panel.grid.major.x = element_blank(),
      axis.text.x = element_text(face = "bold", color = "#17202a"),
      plot.caption = element_text(hjust = 0, color = "#43515c", size = 10)
    )
}

ML_FEATURE_LABELS <- c(
  WT = "Poids",
  AGE = "Âge",
  CREAT = "Créatinine",
  SEX = "Sexe",
  DOSE = "Dose",
  INTERVAL = "Intervalle d'administration",
  INFUSION = "Durée de perfusion",
  PREV_CONC = "Première concentration récente",
  PREV_TIME = "Horaire de la première concentration",
  LAST_CONC = "Dernière concentration",
  LAST_TIME = "Horaire de la dernière concentration",
  CONC_DIFF = "Variation entre les concentrations",
  TIME_DIFF = "Délai entre les concentrations"
)

ML_FEATURE_LABELS_EN <- c(
  WT = "Weight", AGE = "Age", CREAT = "Creatinine", SEX = "Sex", DOSE = "Dose",
  INTERVAL = "Dosing interval", INFUSION = "Infusion duration",
  PREV_CONC = "First recent concentration", PREV_TIME = "First concentration time",
  LAST_CONC = "Last concentration", LAST_TIME = "Last concentration time",
  CONC_DIFF = "Concentration difference", TIME_DIFF = "Time between concentrations"
)

ml_feature_label <- function(name, lang = "fr") {
  labels <- if (identical(normalize_app_language(lang), "en")) ML_FEATURE_LABELS_EN else ML_FEATURE_LABELS
  label <- unname(labels[name])
  if (!length(label) || is.na(label) || !nzchar(label)) name else label
}

format_ml_feature_value <- function(name, value, lang = "fr") {
  value <- suppressWarnings(as.numeric(value))
  if (!is.finite(value)) return(app_t(lang, "valeur indisponible", "unavailable"))
  if (identical(name, "SEX")) return(if (value >= 0.5) app_t(lang, "femme (1)", "female (1)") else app_t(lang, "homme (0)", "male (0)"))
  unit <- switch(
    name,
    WT = " kg",
    AGE = app_t(lang, " ans", " years"),
    CREAT = " micromol/L",
    DOSE = " mg",
    INTERVAL = " h",
    INFUSION = " h",
    PREV_CONC = " mg/L",
    LAST_CONC = " mg/L",
    CONC_DIFF = " mg/L",
    PREV_TIME = app_t(lang, " h après la dose", " h after dose"),
    LAST_TIME = app_t(lang, " h après la dose", " h after dose"),
    TIME_DIFF = " h",
    ""
  )
  paste0(format(signif(value, 4), trim = TRUE), unit)
}

format_ml_domain_warning <- function(item, lang = "fr") {
  name <- as.character(item$feature %||% "")
  label <- ml_feature_label(name, lang)
  lower <- if (is.finite(item$min %||% NA_real_)) format_ml_feature_value(name, item$min, lang) else app_t(lang, "sans borne basse", "no lower bound")
  upper <- if (is.finite(item$max %||% NA_real_)) format_ml_feature_value(name, item$max, lang) else app_t(lang, "sans borne haute", "no upper bound")
  app_t(lang,
    paste0(label, " : ", format_ml_feature_value(name, item$value, lang), " ; plage d'entraînement [", lower, " ; ", upper, "]."),
    paste0(label, ": ", format_ml_feature_value(name, item$value, lang), "; training range [", lower, "; ", upper, "]."))
}

ml_domain_warning_block <- function(status, lang = "fr") {
  warnings <- status$domain_warnings %||% list()
  if (!length(warnings)) return(NULL)
  div(
    class = "ml-domain-warning",
    tags$strong(app_t(lang, "Avertissement : prédiction ML extrapolée", "Warning: extrapolated ML prediction")),
    tags$ul(lapply(warnings, function(item) tags$li(format_ml_domain_warning(item, lang)))),
    span(app_t(lang, "Le résultat ML est affiché à titre expérimental, mais sa fiabilité peut être réduite. La recommandation reste calculée par MAP-BE.", "The ML result is shown for experimental use, but reliability may be reduced. The recommendation remains MAP-BE based."))
  )
}

build_ml_explanation_plot <- function(explanation, max_features = 8L, lang = "fr") {
  if (!isTRUE((explanation %||% list())$available)) return(NULL)
  contributions <- as.data.frame(explanation$contributions, stringsAsFactors = FALSE)
  if (!nrow(contributions)) return(NULL)
  contributions <- contributions[order(-abs(contributions$contribution)), , drop = FALSE]
  labels <- vapply(seq_len(nrow(contributions)), function(index) {
    name <- contributions$variable[[index]]
    label <- ml_feature_label(name, lang)
    paste0(
      label,
      "\n",
      format_ml_feature_value(name, contributions$value[[index]], lang)
    )
  }, character(1))
  effects <- contributions$contribution
  if (length(effects) > max_features) {
    labels <- c(labels[seq_len(max_features)], app_t(lang, "Autres informations\ncombinées", "Other combined\ninformation"))
    effects <- c(effects[seq_len(max_features)], sum(effects[(max_features + 1L):length(effects)]))
  }
  data <- data.frame(
    label = factor(labels, levels = rev(labels)),
    effect = effects,
    direction = ifelse(effects >= 0, "increase", "decrease")
  )
  range <- max(abs(data$effect), na.rm = TRUE)
  if (!is.finite(range) || range <= 0) range <- 1
  ggplot(data, aes(effect, label, fill = direction)) +
    geom_col(width = 0.66) +
    geom_vline(xintercept = 0, color = "#17202a", linewidth = 0.5) +
    geom_text(
      aes(label = sprintf("%+.1f", effect), hjust = ifelse(effect >= 0, -0.15, 1.15)),
      color = "#17202a",
      size = 3.4
    ) +
    scale_fill_manual(values = c(increase = "#287a4d", decrease = "#a4441f"), guide = "none") +
    scale_x_continuous(limits = c(-1.45 * range, 1.45 * range)) +
    labs(
      x = app_t(lang, "Contribution à l'AUC24 ML (mg.h/L)", "Contribution to ML AUC24 (mg.h/L)"),
      y = NULL,
      subtitle = app_t(lang, "À droite, l'information augmente l'AUC prédite; à gauche, elle la diminue.", "Information to the right increases predicted AUC; information to the left decreases it."),
      caption = app_t(lang,
        paste0("Référence DALEX synthétique ", format_metric(explanation$baseline), " + contributions = AUC24 ML ", format_metric(explanation$prediction), " mg.h/L · référence fondée sur ", explanation$background_size, " profils simulés."),
        paste0("Synthetic DALEX baseline ", format_metric(explanation$baseline), " + contributions = ML AUC24 ", format_metric(explanation$prediction), " mg.h/L · baseline from ", explanation$background_size, " simulated profiles."))
    ) +
    theme_minimal(base_size = 13) +
    theme(
      panel.grid.major.y = element_blank(),
      panel.grid.minor = element_blank(),
      axis.text.y = element_text(size = 9.5, lineheight = 1.05, color = "#17202a"),
      plot.subtitle = element_text(size = 10, color = "#43515c"),
      plot.caption = element_text(size = 10, color = "#43515c", hjust = 0)
    )
}

ml_status_message <- function(status, lang = "fr") {
  message <- as.character(status$message %||% "")
  if (!identical(normalize_app_language(lang), "en")) return(message)
  auc24 <- suppressWarnings(as.numeric(status$auc24 %||% NA_real_))
  if (is.finite(auc24)) {
    suffix <- if (length(status$artifacts %||% character()) > 1L) " and model averaging." else "."
    warning <- if (length(status$domain_warnings %||% list())) paste0(" Warning: extrapolation outside the training domain for ", length(status$domain_warnings), " feature(s).") else ""
    return(paste0("Experimental ML AUC24: ", round(auc24, 1), " mg.h/L. Dose projections remain MAP based", suffix, warning))
  }
  if (grepl("prédicteur\\(s\\).*disponible", message)) return(paste(status$available %||% 0L, "research direct AUC24 predictor(s) available."))
  if (grepl("non activée", message, fixed = TRUE)) return("Experimental ML AUC24 not enabled: MAP estimate retained.")
  if (grepl("Artefacts ML incomplets", message, fixed = TRUE)) return("Incomplete ML artifacts for the selected models: aggregate estimate not shown.")
  if (grepl("modèle de session", message, fixed = TRUE)) return("ML: unavailable for a session model.")
  if (grepl("Aucun prédicteur", message, fixed = TRUE)) return("No validated compatible direct AUC24 predictor: MAP estimate retained.")
  if (grepl("AUC24 ML non appliquée", message, fixed = TRUE)) {
    reason <- sub("^AUC24 ML non appliquée : ", "", message)
    reason <- sub("\\. Estimation MAP conservée\\.$", "", reason)
    reason <- gsub("le prédicteur AUC24 ML exige au moins", "the ML AUC24 predictor requires at least", reason, fixed = TRUE)
    reason <- gsub("concentrations dans le dernier intervalle", "concentrations in the latest interval", reason, fixed = TRUE)
    reason <- gsub("une administration déclarée à l'état stationnaire", "an administration declared at steady state", reason, fixed = TRUE)
    return(paste0("ML AUC24 not applied: ", reason, ". MAP estimate retained."))
  }
  message
}

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

time_input_ui <- function(prefix, index, time = 0, days_ago = 0, clock = "08:00", calendar = "", lang = "fr") {
  localize_ui(tagList(
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
  ), lang)
}

dose_row_ui <- function(
  index,
  time = 0,
  amount = 1000,
  interval = 12,
  count = 4,
  infusion = 1,
  steady_state = FALSE,
  status = "administered",
  time_uncertainty = 0,
  lang = "fr"
) {
  localize_ui(div(
    id = paste0("dose_row_", index),
    class = "record-row dose-row",
    div(class = "record-index", paste0("A", index)),
    div(class = "time-entry", time_input_ui("dose", index, time = time, lang = lang)),
    numericInput(paste0("dose_amount_", index), "Dose (mg)", amount, min = 0, step = 50),
    selectInput(
      paste0("dose_status_", index),
      "Statut",
      choices = stats::setNames(
        c("administered", "uncertain", "missed"),
        if (identical(normalize_app_language(lang), "en")) c("Administered", "Uncertain time", "Missed / not taken") else c("Administr\u00e9e", "Horaire incertain", "Oubli\u00e9e / non prise")
      ),
      selected = status
    ),
    conditionalPanel(
      condition = sprintf("input.dose_status_%d == 'uncertain'", index),
      numericInput(paste0("dose_time_uncertainty_", index), "Incertitude horaire (± h)", time_uncertainty, min = 0, max = 24, step = 0.25)
    ),
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
    ),
    div(class = "row-validation", uiOutput(paste0("dose_validation_", index)))
  ), lang)
}

observation_row_ui <- function(
  index,
  time = 47.5,
  concentration = 18,
  blq = FALSE,
  lloq = 0,
  matrix = "unspecified",
  time_uncertainty = 0,
  lang = "fr"
) {
  localize_ui(div(
    id = paste0("observation_row_", index),
    class = "record-row observation-row",
    div(class = "record-index", paste0("P", index)),
    div(class = "time-entry", time_input_ui("observation", index, time = time, lang = lang)),
    numericInput(paste0("observation_concentration_", index), "Concentration", concentration, min = 0, step = 0.1),
    checkboxInput(paste0("observation_blq_", index), "Sous la limite de quantification (BLQ)", blq),
    conditionalPanel(
      condition = sprintf("input.observation_blq_%d == true", index),
      numericInput(paste0("observation_lloq_", index), "LLOQ", lloq, min = 0, step = 0.1)
    ),
    selectInput(
      paste0("observation_matrix_", index),
      "Matrice biologique",
      choices = stats::setNames(
        c("unspecified", "plasma", "serum", "whole_blood"),
        if (identical(normalize_app_language(lang), "en")) c("Unspecified", "Plasma", "Serum", "Whole blood") else c("Non pr\u00e9cis\u00e9e", "Plasma", "S\u00e9rum", "Sang total")
      ),
      selected = matrix
    ),
    checkboxInput(paste0("observation_time_uncertain_", index), "Horaire incertain", is.finite(time_uncertainty) && time_uncertainty > 0),
    conditionalPanel(
      condition = sprintf("input.observation_time_uncertain_%d == true", index),
      numericInput(paste0("observation_time_uncertainty_", index), "Incertitude horaire (± h)", time_uncertainty, min = 0, max = 24, step = 0.25)
    ),
    div(
      class = "observation-covariates",
      uiOutput(paste0("observation_covariates_", index))
    ),
    div(class = "row-validation", uiOutput(paste0("observation_validation_", index)))
  ), lang)
}

app_ui <- function(request) {
  lang <- app_language_from_request(request)
  model_choices <- catalog_choices_i18n(lang = lang)
  localize_ui(page_navbar(
  title = div(
    class = "brand",
    span(class = "brand-mark", "Pk"),
    span("MIPD Engine"),
    span(
      class = "app-language-switch",
      tags$button(type = "button", class = if (lang == "fr") "active" else NULL, onclick = "var u=new URL(location.href);u.searchParams.set('lang','fr');location.href=u;", "FR"),
      tags$button(type = "button", class = if (lang == "en") "active" else NULL, onclick = "var u=new URL(location.href);u.searchParams.set('lang','en');location.href=u;", "EN")
    )
  ),
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
      function labelSidebarToggles() {
        document.querySelectorAll('.collapse-toggle').forEach(function (button) {
          var open = button.getAttribute('aria-expanded') === 'true';
          var english = new URLSearchParams(window.location.search).get('lang') === 'en';
          var label = open ? (english ? 'Close configuration' : 'Fermer la configuration') : (english ? 'Open configuration' : 'Ouvrir la configuration');
          button.setAttribute('title', label);
          button.setAttribute('aria-label', label);
        });
      }
      document.addEventListener('DOMContentLoaded', function () {
        labelSidebarToggles();
        new MutationObserver(labelSidebarToggles).observe(document.body, {
          subtree: true,
          attributes: true,
          attributeFilter: ['aria-expanded']
        });
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
      tags$button(
        type = "button",
        class = "mobile-configure-button",
        onclick = "var button=document.querySelector('.bslib-sidebar-layout .collapse-toggle');if(button&&button.getAttribute('aria-expanded')!=='true'){button.click();}",
        "Configurer et lancer"
      ),
      layout_sidebar(
        sidebar = sidebar(
          width = 390,
          open = "desktop",
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
                choices = stats::setNames(c("library", "custom"), c("Biblioth\u00e8que", "Atelier Lego / C++")),
                selected = "library",
                inline = TRUE
              ),
              conditionalPanel(
                "input.model_source == 'library'",
                selectInput("model_id", "Modèle principal", choices = model_choices, selected = DEFAULT_MODEL)
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
              selectInput(
                "administration_route",
                "Voie d'administration",
                choices = "IV",
                selected = "IV"
              ),
              conditionalPanel(
                "input.model_source == 'library'",
                uiOutput("model_context_ui"),
                uiOutput("ml_status_ui"),
                checkboxInput("enable_averaging", "Activer le model averaging", FALSE),
                conditionalPanel(
                  "input.enable_averaging == true",
                  div(class = "custom-note", "Seuls les modèles de la même molécule compatibles avec la voie sélectionnée sont proposés."),
                  uiOutput("average_models_ui"),
                  selectInput(
                    "weighting_scheme",
                    "Pondération",
                    choices = stats::setNames(c("AIC", "LL"), if (lang == "en") c("Akaike criterion", "Log likelihood") else c("Crit\u00e8re d'Akaike", "Log-vraisemblance")),
                    selected = "AIC"
                  )
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
          div(
            class = "analysis-actions",
            checkboxInput(
              "accept_disclaimer",
              "J'ai lu le statut et j'accepte d'utiliser ce prototype sous ma responsabilité.",
              FALSE
            ),
            actionButton("run_analysis", "Lancer l'analyse", class = "btn-primary run-button w-100")
          )
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
                    choices = stats::setNames(
                      c("relative_hours", "relative_days", "calendar"),
                      if (lang == "en") c("Relative hours", "Days before a reference date", "Dates and times") else c("Heures relatives", "Jours avant une date de r\u00e9f\u00e9rence", "Dates et heures")
                    ),
                    selected = "relative_hours"
                  ),
                  conditionalPanel(
                    "input.time_entry_mode != 'relative_hours'",
                    dateInput("reference_date", "Date de référence", value = Sys.Date(), format = if (lang == "en") "yyyy-mm-dd" else "dd/mm/yyyy", language = lang),
                    textInput("reference_clock", "Heure de référence", value = format(Sys.time(), "%H:%M"))
                  )
                ),
                h3("Administrations"),
                div(id = "dose_rows", class = "record-list", dose_row_ui(1L, lang = lang)),
                div(
                  class = "row-actions",
                  actionButton("add_dose", "Ajouter une administration", class = "btn-outline-secondary btn-sm"),
                  actionButton("remove_dose", "Retirer la dernière", class = "btn-outline-secondary btn-sm")
                ),
                hr(),
                h3("Concentrations observées"),
                uiOutput("observation_covariate_notice"),
                div(id = "observation_rows", class = "record-list", observation_row_ui(1L, lang = lang)),
                div(
                  class = "row-actions",
                  actionButton("add_observation", "Ajouter un prélèvement", class = "btn-outline-secondary btn-sm"),
                  actionButton("remove_observation", "Retirer le dernier", class = "btn-outline-secondary btn-sm")
                ),
                uiOutput("data_quality_preview"),
                plotOutput("therapy_timeline", height = "250px")
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
                uiOutput("analysis_warnings"),
                uiOutput("current_exposure_summary"),
                plotOutput("fit_plot", height = "430px"),
                h3("Doses supplémentaires : poursuivre ou modifier"),
                uiOutput("future_comparison_summary"),
                plotOutput("future_comparison_plot", height = "430px"),
                uiOutput("ml_interpretation_panel"),
                h3("Sensibilité du model averaging"),
                uiOutput("averaging_sensitivity_summary"),
                DTOutput("averaging_sensitivity_table"),
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
          selectInput(
            "simulation_delta",
            "Pas de simulation",
            choices = stats::setNames(c(0.05, 0.1, 0.25), if (lang == "en") c("High · 0.05 h", "Standard · 0.1 h", "Fast · 0.25 h") else c("Haute \u00b7 0,05 h", "Standard \u00b7 0,1 h", "Rapide \u00b7 0,25 h")),
            selected = 0.1
          ),
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
            choices = stats::setNames(
              c("POSTERIOR", "RESID", "TIMING"),
              if (lang == "en") c("MAP posterior uncertainty", "Residual error", "Timing uncertainty") else c("Incertitude post\u00e9rieure MAP", "Erreur r\u00e9siduelle", "Incertitude des horaires")
            ),
            selected = "POSTERIOR"
          ),
          numericInput("posterior_replicates", "Réestimations avec horaires incertains", 20, min = 10, max = 40, step = 5),
          selectInput(
            "blq_method",
            "Concentrations BLQ",
            choices = if (lang == "en") c("Exclude from fit" = "exclude", "LLOQ / 2 (exploratory)" = "lloq_half") else c("Exclure de l'ajustement" = "exclude", "LLOQ / 2 (exploratoire)" = "lloq_half"),
            selected = "exclude"
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
      p("La robustesse est explorée avec des poids égaux, AIC, log-vraisemblance et des analyses laissant successivement de côté chaque modèle. Une divergence des doses proposées doit conduire à revoir l'applicabilité du model averaging."),
      h2("Exposition et scénarios"),
      p("L'exposition historique sur les dernières 24 heures est distinguée de l'exposition à l'état stationnaire du dernier schéma. La projection compare le maintien de la dernière posologie à l'application du scénario classé en tête, sur le nombre de doses supplémentaires choisi dans Réglages."),
      p("Les scénarios sont d'abord classés sur leur prédiction moyenne. La probabilité d'atteindre la cible, de sous-exposition et de surexposition est ensuite simulée pour les douze scénarios moyens les plus proches, puis utilisée pour leur classement final."),
      h2("Qualité des données"),
      p("Les doses oubliées sont exclues. Les horaires incertains peuvent faire l'objet de réestimations de sensibilité. Les valeurs BLQ sont exclues par défaut; l'imputation LLOQ/2 est uniquement exploratoire. La matrice, les unités et le domaine exact des covariables ne sont jamais convertis ou déduits automatiquement."),
      h2("Distribution"),
      p("La distribution prédictive est exploratoire. Après un ajustement, elle repose sur un bootstrap paramétrique de l'estimation MAP, auquel peuvent s'ajouter l'erreur résiduelle, l'incertitude des horaires et l'incertitude entre modèles. Sans concentration exploitable, elle revient à une simulation populationnelle."),
      h2("Apprentissage automatique"),
      p("Le module expérimental estime directement l'AUC24 avec XGBoost à partir de profils simulés par mrgsolve, selon la méthodologie publiée pour le tacrolimus (doi:10.1016/j.phrs.2021.105578). Il utilise les concentrations et horaires récents, la dose, l'intervalle, la durée de perfusion et les covariables du modèle. Une décomposition locale DALEX explique la prédiction par rapport à un échantillon de référence entièrement synthétique."),
      p("Chaque artefact reste lié au même modèle PK, à la même voie, au même schéma de variables et aux empreintes exactes du fichier mrgsolve et du booster. Il doit être favorable en validation croisée imbriquée et sur un test interne non touché; sa transportabilité vers un autre PopPK est rapportée séparément. Une variable hors des bornes empiriques d'entraînement est signalée comme extrapolation sans masquer l'estimation expérimentale; une donnée manquante, un protocole incompatible ou une AUC prédite invalide restent bloquants. L'estimation ML ne remplace pas les projections de dose MAP tant qu'une validation propre à la vancomycine sur patients externes n'est pas documentée."),
      h2("Sécurité"),
      p("Le serveur public ne compile jamais directement le C++ reçu. Pour un modèle Atelier Lego, il extrait une spécification JSON, la valide, régénère lui-même le code mrgsolve puis compile uniquement ce code contrôlé. Tout autre C++ reste refusé tant qu'il n'est pas exécuté dans un conteneur éphémère isolé."),
      p("Les imports JSON sont traités dans la session Shiny et leur fichier temporaire est supprimé immédiatement après lecture. Les exports sont produits à la demande sans base de données."),
      h2("Statut"),
      div(
        class = "status-disclaimer",
        tags$strong("Avertissement obligatoire"),
        p("Ce prototype est destiné à la recherche et à l'enseignement. Il n'est pas enregistré comme dispositif médical, ne garantit ni l'exactitude d'un résultat ni son applicabilité à un patient particulier et ne remplace pas le jugement clinique."),
        p("Toute décision de dose reste sous la responsabilité du professionnel de santé et exige la vérification de la voie, des horaires, des unités, de la population source, des covariables, des concentrations, de la fonction d'organe et des recommandations locales. Une validation indépendante et une gouvernance documentée sont nécessaires avant toute utilisation clinique."),
        p(
          "Si vous recherchez un véritable dispositif médical avec expertise, consultez ",
          tags$a(
            "ABIS du CHU de Limoges.",
            href = "https://abis.chu-limoges.fr/",
            target = "_blank",
            rel = "noopener noreferrer"
          )
        )
      )
    )
  ),
  footer = div(class = "app-footer", "Pharmacométrie Pratique · moteur R mrgsolve/mapbayr · aucun dossier patient n'est persisté")
), lang)
}

server <- function(input, output, session) {
  current_language <- reactive(app_language_from_query(session$clientData$url_search %||% ""))
  tx <- function(fr, en = NULL) app_t(current_language(), fr, en)
  localized <- function(value) localize_ui(value, current_language())
  current_model_id <- reactive({
    value <- input$model_id %||% ""
    if (length(value) && nzchar(value[[1]]) && value[[1]] %in% MODEL_CATALOG$id) value[[1]] else DEFAULT_MODEL
  })
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

  numeric_input_value <- function(id, fallback = NA_real_) {
    value <- suppressWarnings(as.numeric(input[[id]] %||% fallback))
    if (length(value) != 1L || !is.finite(value)) fallback else value
  }

  row_time_messages <- function(prefix, index) {
    mode <- input$time_entry_mode %||% "relative_hours"
    if (identical(mode, "relative_hours")) {
      value <- numeric_input_value(paste0(prefix, "_time_", index))
      return(if (!is.finite(value)) "Temps relatif manquant ou invalide." else character())
    }
    if (identical(mode, "relative_days")) {
      days <- numeric_input_value(paste0(prefix, "_days_ago_", index))
      clock <- trimws(as.character(input[[paste0(prefix, "_clock_", index)]] %||% ""))
      return(c(
        if (!is.finite(days) || days < 0) "Le nombre de jours doit être positif.",
        if (!grepl("^([01]?[0-9]|2[0-3]):[0-5][0-9]$", clock)) "L'heure doit respecter HH:MM."
      ))
    }
    value <- trimws(as.character(input[[paste0(prefix, "_calendar_", index)]] %||% ""))
    if (!grepl("^(\\d{1,2}/\\d{1,2}(/\\d{2,4})?|\\d{4}-\\d{2}-\\d{2})\\s+([01]?\\d|2[0-3]):[0-5]\\d$", value)) {
      "Utilisez JJ/MM HH:MM, JJ/MM/AAAA HH:MM ou AAAA-MM-JJ HH:MM."
    } else {
      character()
    }
  }

  dose_row_messages <- function(index) {
    status <- input[[paste0("dose_status_", index)]] %||% "administered"
    amount <- numeric_input_value(paste0("dose_amount_", index))
    interval <- numeric_input_value(paste0("dose_interval_", index))
    uncertainty <- if (identical(status, "uncertain")) numeric_input_value(paste0("dose_time_uncertainty_", index), 0) else 0
    steady_state <- isTRUE(input[[paste0("dose_ss_", index)]])
    count <- if (steady_state) 1 else numeric_input_value(paste0("dose_count_", index))
    infusion <- if (identical(input$administration_route, "Oral")) 0 else numeric_input_value(paste0("dose_infusion_", index))
    c(
      row_time_messages("dose", index),
      if (!is.finite(amount) || amount <= 0) "La dose doit être strictement positive.",
      if (!is.finite(interval) || interval < 0) "L'intervalle doit être positif ou nul.",
      if (steady_state && (!is.finite(interval) || interval <= 0)) "Le steady state exige un intervalle strictement positif.",
      if (!steady_state && (!is.finite(count) || count < 1)) "Le nombre d'administrations doit être au moins 1.",
      if (!is.finite(infusion) || infusion < 0) "La perfusion doit être positive ou nulle.",
      if (is.finite(infusion) && is.finite(interval) && interval > 0 && infusion > interval) "La perfusion dépasse l'intervalle entre deux doses.",
      if (!is.finite(uncertainty) || uncertainty < 0) "L'incertitude horaire doit être positive ou nulle.",
      if (identical(status, "uncertain") && (!is.finite(uncertainty) || uncertainty <= 0)) "Précisez une incertitude horaire pour cette dose.",
      if (identical(status, "missed")) "Cette dose sera exclue des administrations reçues."
    )
  }

  observation_row_messages <- function(index) {
    blq <- isTRUE(input[[paste0("observation_blq_", index)]])
    concentration <- numeric_input_value(paste0("observation_concentration_", index))
    lloq <- if (blq) numeric_input_value(paste0("observation_lloq_", index)) else 0
    uncertain <- isTRUE(input[[paste0("observation_time_uncertain_", index)]])
    uncertainty <- if (uncertain) numeric_input_value(paste0("observation_time_uncertainty_", index), 0) else 0
    matrix <- input[[paste0("observation_matrix_", index)]] %||% "unspecified"
    definition <- covariate_definition()
    invalid_covariates <- if (nrow(definition)) {
      definition$name[!vapply(definition$name, function(name) {
        is.finite(numeric_input_value(paste0("observation_cov_", name, "_", index)))
      }, logical(1))]
    } else {
      character()
    }
    c(
      row_time_messages("observation", index),
      if (!blq && (!is.finite(concentration) || concentration < 0)) "La concentration doit être positive ou nulle.",
      if (blq && (!is.finite(lloq) || lloq <= 0)) "Une LLOQ strictement positive est requise pour une valeur BLQ.",
      if (!is.finite(uncertainty) || uncertainty < 0) "L'incertitude horaire doit être positive ou nulle.",
      if (uncertain && (!is.finite(uncertainty) || uncertainty <= 0)) "Précisez une incertitude horaire pour ce prélèvement.",
      if (identical(matrix, "unspecified")) "Matrice biologique non précisée : vérifiez sa compatibilité avec l'article.",
      if (length(invalid_covariates)) paste0("Covariable(s) invalide(s) : ", paste(invalid_covariates, collapse = ", "), ".")
    )
  }

  validation_message_ui <- function(messages) {
    messages <- unique(messages[nzchar(messages)])
    if (!length(messages)) return(span(class = "validation-ok", "Ligne valide"))
    tags$ul(class = "validation-messages", lapply(messages, tags$li))
  }

  register_dose_validation <- function(index) {
    local({
      row_index <- index
      output_id <- paste0("dose_validation_", row_index)
      output[[output_id]] <- renderUI(localized(validation_message_ui(dose_row_messages(row_index))))
      shiny::outputOptions(output, output_id, suspendWhenHidden = FALSE)
    })
  }

  register_observation_validation <- function(index) {
    local({
      row_index <- index
      output_id <- paste0("observation_validation_", row_index)
      output[[output_id]] <- renderUI(localized(validation_message_ui(observation_row_messages(row_index))))
      shiny::outputOptions(output, output_id, suspendWhenHidden = FALSE)
    })
  }

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

  insert_dose_row <- function(index, time = 0, amount = 1000, interval = 12, count = 4, infusion = 1, steady_state = FALSE, status = "administered", time_uncertainty = 0) {
    register_dose_validation(index)
    insertUI(
      selector = "#dose_rows",
      where = "beforeEnd",
      ui = dose_row_ui(index, time, amount, interval, count, infusion, steady_state, status, time_uncertainty, lang = current_language())
    )
  }

  insert_observation_row <- function(index, time = 47.5, concentration = 18, blq = FALSE, lloq = 0, matrix = "unspecified", time_uncertainty = 0) {
    register_observation_covariates(index)
    register_observation_validation(index)
    insertUI(
      selector = "#observation_rows",
      where = "beforeEnd",
      ui = observation_row_ui(index, time, concentration, blq, lloq, matrix, time_uncertainty, lang = current_language())
    )
  }

  observeEvent(input$add_dose, {
    index <- dose_count() + 1L
    dose_count(index)
    insert_dose_row(index, time = 48, amount = 1000, interval = 12, count = 4, infusion = 1, steady_state = FALSE)
  })

  observeEvent(input$remove_dose, {
    index <- dose_count()
    if (index <= 1L) return(showNotification(tx("Au moins une administration est requise.", "At least one administration is required."), type = "warning"))
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
    if (index <= 1L) return(showNotification(tx("Conservez une ligne et saisissez 0 pour une analyse populationnelle.", "Keep one row and enter 0 for a population analysis."), type = "message"))
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

  observe({
    if (identical(input$model_source %||% "library", "custom")) {
      routes <- c("IV", "Oral")
    } else {
      model_id <- current_model_id()
      routes <- model_routes(model_record(model_id))
    }
    current <- isolate(input$administration_route %||% "")
    selected <- if (current %in% routes) current else routes[[1]]
    updateSelectInput(
      session,
      "administration_route",
      choices = stats::setNames(routes, routes),
      selected = selected
    )
  })

  shiny::observeEvent(input$lego_model_import, {
    payload <- input$lego_model_import
    code <- payload$code %||% ""
    if (!is.character(code) || length(code) != 1L || !nzchar(trimws(code))) return()
    if (nchar(code, type = "bytes") > 200000) {
      return(showNotification(tx("Le modèle Lego dépasse la taille autorisée.", "The Lego model exceeds the size limit."), type = "error"))
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
    showNotification(tx(
      "Modèle Lego validé et régénéré côté serveur. Vérifiez-le avant de lancer l'analyse.",
      "The Lego model was validated and regenerated on the server. Review it before running the analysis."
    ), type = "message", duration = 5)
  }, ignoreInit = TRUE)

  selected_model_ids <- reactive({
    if (!identical(input$model_source %||% "library", "library")) return(character())
    primary_id <- current_model_id()
    ids <- if (!isTRUE(input$enable_averaging)) primary_id else unique(c(primary_id, input$average_model_ids %||% character()))
    route <- input$administration_route %||% ""
    shiny::req(nzchar(route))
    compatible <- vapply(ids, function(id) model_supports_route(model_record(id), route), logical(1))
    shiny::validate(shiny::need(all(compatible), tx(
      "Tous les modèles moyennés doivent utiliser la même voie d'administration.",
      "All averaged models must use the same administration route."
    )))
    ids
  })

  output$average_models_ui <- renderUI({
    primary_id <- current_model_id()
    drug <- model_record(primary_id)$drug[[1]]
    route <- input$administration_route %||% ""
    shiny::req(nzchar(route))
    choices <- catalog_choices_i18n(drug, route, current_language())
    drug_label <- if (identical(current_language(), "en")) model_record(primary_id)$drugEn[[1]] else drug
    localized(checkboxGroupInput(
      "average_model_ids",
      tx(paste0("Modèles de ", drug_label, " · voie ", route), paste0(drug_label, " models · route ", route)),
      choices = choices,
      selected = primary_id
    ))
  })
  shiny::outputOptions(output, "average_models_ui", suspendWhenHidden = FALSE)

  output$model_context_ui <- renderUI({
    record <- model_record(current_model_id())
    english <- identical(current_language(), "en")
    tags_value <- if (english) record$populationTagsEn[[1]] %||% character() else record$populationTags[[1]] %||% character()
    routes <- paste(model_routes(record), collapse = " + ")
    doi <- as.character(record$doi[[1]] %||% "")
    drug <- if (english) record$drugEn[[1]] else record$drug[[1]]
    population <- if (english) record$populationEn[[1]] else record$population[[1]]
    div(
      class = "model-context",
      div(class = "model-context-head", tags$strong(record$model[[1]]), span(paste0(drug, " · ", routes))),
      p(population),
      div(class = "population-tags", lapply(tags_value, function(value) span(value))),
      if (nzchar(doi) && !is.na(doi)) {
        tags$a(paste0("DOI ", doi), href = paste0("https://doi.org/", doi), target = "_blank", rel = "noopener noreferrer")
      },
      div(class = "domain-reminder", tx(
        "Vérifiez que le patient, la matrice et les covariables restent dans le domaine de l'article source.",
        "Check that the patient, biological matrix, and covariates remain within the source article's domain."
      ))
    )
  })
  shiny::outputOptions(output, "model_context_ui", suspendWhenHidden = FALSE)

  output$ml_status_ui <- renderUI({
    if (identical(input$model_source %||% "library", "custom")) {
      return(div(class = "ml-status", tx("ML : indisponible pour un modèle de session.", "ML: unavailable for a session model.")))
    }
    status <- ml_status_summary(selected_model_ids(), input$administration_route %||% "")
    localized(tagList(
      div(class = if (status$available) "ml-status available" else "ml-status", ml_status_message(status, current_language())),
      if (status$available) {
        checkboxInput(
          "enable_experimental_ml",
          tx("Afficher l'estimation AUC24 ML expérimentale", "Show the experimental ML AUC24 estimate"),
          value = isTRUE(isolate(input$enable_experimental_ml))
        )
      }
    ))
  })
  shiny::outputOptions(output, "ml_status_ui", suspendWhenHidden = FALSE)

  covariate_definition <- reactive({
    if (identical(input$model_source, "custom")) return(parse_covariates(input$custom_code %||% DEFAULT_CODE))
    primary_id <- current_model_id()
    ids <- if (isTRUE(input$enable_averaging)) {
      unique(c(primary_id, input$average_model_ids %||% character()))
    } else {
      primary_id
    }
    ids <- intersect(ids, MODEL_CATALOG$id)
    if (!length(ids)) ids <- DEFAULT_MODEL
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
          return(div(class = "empty-state compact", tx("Aucune covariable pour ce modèle.", "This model has no covariates.")))
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

  register_dose_validation(1L)
  register_observation_covariates(1L)
  register_observation_validation(1L)

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
      return(div(class = "covariate-notice empty", tx("Ce modèle ne déclare aucune covariable.", "This model declares no covariates.")))
    }
    div(
      class = "covariate-notice",
      tags$strong(tx("Covariables au moment du prélèvement", "Covariates at sampling time")),
      span(tx(
        "Renseignez leur valeur sur chaque ligne. La dernière valeur connue est conservée jusqu'au prélèvement suivant.",
        "Enter their values on each row. The latest known value is carried forward until the next sample."
      ))
    )
  })
  shiny::outputOptions(output, "observation_covariate_notice", suspendWhenHidden = FALSE)

  parse_clock_minutes <- function(value, label) {
    value <- trimws(as.character(value %||% ""))
    match <- regexec("^([01]?[0-9]|2[0-3]):([0-5][0-9])$", value)
    parts <- regmatches(value, match)[[1]]
    shiny::validate(shiny::need(length(parts) == 3L, paste0(label, tx(" doit respecter HH:MM.", " must use HH:MM."))))
    as.numeric(parts[[2]]) * 60 + as.numeric(parts[[3]])
  }

  reference_datetime <- function() {
    date <- as.Date(input$reference_date %||% Sys.Date())
    minutes <- parse_clock_minutes(input$reference_clock %||% "00:00", tx("L'heure de référence", "Reference time"))
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
    shiny::validate(shiny::need(!is.na(parsed), paste0(label, tx(
      " est invalide. Utilisez JJ/MM HH:MM ou JJ/MM/AAAA HH:MM.",
      " is invalid. Use DD/MM HH:MM, DD/MM/YYYY HH:MM, or YYYY-MM-DD HH:MM."
    ))))
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
      clock <- parse_clock_minutes(isolate(input[[paste0(prefix, "_clock_", index)]]), tx("L'heure saisie", "Entered time"))
      reference_clock <- as.numeric(format(reference, "%H", tz = "UTC")) * 60 + as.numeric(format(reference, "%M", tz = "UTC"))
      return(-days * 24 + (clock - reference_clock) / 60)
    }
    parsed <- parse_calendar_datetime(
      isolate(input[[paste0(prefix, "_calendar_", index)]]),
      reference,
      tx(paste0("La date de la ligne ", index), paste0("Date on row ", index))
    )
    as.numeric(difftime(parsed, reference, units = "hours"))
  }

  normalize_timeline <- function(doses, observation_records) {
    origin <- min(doses$time, na.rm = TRUE)
    doses$time <- doses$time - origin
    observation_records$raw$time <- observation_records$raw$time - origin
    observation_records$covariate_history$time <- observation_records$covariate_history$time - origin
    observation_records$observations$time <- observation_records$observations$time - origin
    shiny::validate(shiny::need(all(observation_records$raw$time >= 0), tx(
      "Une concentration ou covariable est datée avant la première administration.",
      "A concentration or covariate is dated before the first administration."
    )))
    list(doses = doses, observations = observation_records, origin = origin)
  }

  read_doses <- function(include_missed = FALSE) {
    rows <- lapply(seq_len(isolate(dose_count())), function(index) {
      steady_state <- isTRUE(isolate(input[[paste0("dose_ss_", index)]]))
      status <- as.character(isolate(input[[paste0("dose_status_", index)]]) %||% "administered")
      count <- if (steady_state) 1L else as.integer(isolate(input[[paste0("dose_count_", index)]]))
      data.frame(
        time = read_record_time("dose", index),
        amount = as.numeric(isolate(input[[paste0("dose_amount_", index)]])),
        interval = as.numeric(isolate(input[[paste0("dose_interval_", index)]])),
        count = count,
        infusion = if (identical(isolate(input$administration_route), "Oral")) 0 else as.numeric(isolate(input[[paste0("dose_infusion_", index)]])),
        ss = as.integer(steady_state),
        status = status,
        time_uncertainty = if (identical(status, "uncertain")) as.numeric(isolate(input[[paste0("dose_time_uncertainty_", index)]]) %||% 0) else 0,
        stringsAsFactors = FALSE
      )
    })
    data <- do.call(rbind, rows)
    numeric_columns <- c("time", "amount", "interval", "count", "infusion", "ss", "time_uncertainty")
    shiny::validate(shiny::need(all(is.finite(as.matrix(data[, numeric_columns, drop = FALSE]))), tx("Toutes les administrations doivent être numériques.", "All administration values must be numeric.")))
    valid <- data$amount > 0 & data$interval >= 0 & data$count >= 1 & data$infusion >= 0 &
      data$ss %in% c(0L, 1L) & (data$ss == 0L | data$interval > 0) &
      data$status %in% c("administered", "uncertain", "missed") & data$time_uncertainty >= 0
    shiny::validate(shiny::need(all(valid), tx("Administration invalide. Un steady state nécessite un intervalle strictement positif.", "Invalid administration. Steady state requires a strictly positive interval.")))
    if (isTRUE(include_missed)) return(data)
    data <- data[data$status != "missed", , drop = FALSE]
    shiny::validate(shiny::need(nrow(data) > 0, tx("Au moins une dose administrée ou incertaine est requise.", "At least one administered or uncertain dose is required.")))
    data
  }

  read_observation_records <- function() {
    definition <- isolate(covariate_definition())
    rows <- lapply(seq_len(isolate(observation_count())), function(index) {
      blq <- isTRUE(isolate(input[[paste0("observation_blq_", index)]]))
      row <- data.frame(
        time = read_record_time("observation", index),
        concentration = as.numeric(isolate(input[[paste0("observation_concentration_", index)]])),
        blq = blq,
        lloq = if (blq) as.numeric(isolate(input[[paste0("observation_lloq_", index)]]) %||% 0) else 0,
        matrix = as.character(isolate(input[[paste0("observation_matrix_", index)]]) %||% "unspecified"),
        time_uncertainty = if (isTRUE(isolate(input[[paste0("observation_time_uncertain_", index)]]))) as.numeric(isolate(input[[paste0("observation_time_uncertainty_", index)]]) %||% 0) else 0,
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
    shiny::validate(shiny::need(all(is.finite(data$time)), tx("Le temps de prélèvement doit être valide.", "Sample time must be valid.")))
    concentration_valid <- (!data$blq & is.finite(data$concentration) & data$concentration >= 0) |
      (data$blq & is.finite(data$lloq) & data$lloq > 0)
    shiny::validate(shiny::need(all(concentration_valid), tx("Une concentration BLQ exige une LLOQ positive; les autres concentrations doivent être positives.", "A BLQ concentration requires a positive LLOQ; other concentrations must be non-negative.")))
    shiny::validate(shiny::need(all(data$matrix %in% c("unspecified", "plasma", "serum", "whole_blood")), tx("Matrice biologique invalide.", "Invalid biological matrix.")))
    shiny::validate(shiny::need(all(is.finite(data$time_uncertainty) & data$time_uncertainty >= 0), tx("Incertitude horaire invalide.", "Invalid time uncertainty.")))
    data <- data[order(data$time), , drop = FALSE]

    covariate_names <- definition$name
    covariate_history <- data[, c("time", covariate_names), drop = FALSE]
    baseline <- if (length(covariate_names)) {
      as.list(data[1, covariate_names, drop = FALSE])
    } else {
      list()
    }
    usable <- !data$blq & data$concentration > 0
    observations <- data[usable, c("time", "concentration", "time_uncertainty"), drop = FALSE]
    blq_method <- isolate(input$blq_method %||% "exclude")
    if (identical(blq_method, "lloq_half") && any(data$blq)) {
      blq_rows <- data[data$blq, c("time", "lloq", "time_uncertainty"), drop = FALSE]
      names(blq_rows)[names(blq_rows) == "lloq"] <- "concentration"
      blq_rows$concentration <- blq_rows$concentration / 2
      observations <- rbind(observations, blq_rows)
      observations <- observations[order(observations$time), , drop = FALSE]
    }
    list(observations = observations, covariate_history = covariate_history, baseline = baseline, raw = data)
  }

  output$data_quality_preview <- renderUI({
    reactiveValuesToList(input)
    dose_messages <- unlist(lapply(seq_len(dose_count()), dose_row_messages), use.names = FALSE)
    observation_messages <- unlist(lapply(seq_len(observation_count()), observation_row_messages), use.names = FALSE)
    messages <- unique(c(dose_messages, observation_messages))
    messages <- messages[nzchar(messages)]
    if (!length(messages)) {
      return(localized(div(class = "quality-summary ok", tags$strong("Saisie cohérente"), span("Aucune anomalie de forme détectée avant l'analyse."))))
    }
    localized(div(
      class = "quality-summary warning",
      tags$strong(tx(paste(length(messages), "point(s) à vérifier"), paste(length(messages), "item(s) to check"))),
      tags$ul(lapply(head(messages, 8), tags$li)),
      if (length(messages) > 8) span(tx(paste0("+ ", length(messages) - 8, " autre(s) message(s) dans les lignes."), paste0("+ ", length(messages) - 8, " other row message(s).")))
    ))
  })
  shiny::outputOptions(output, "data_quality_preview", suspendWhenHidden = FALSE)

  output$therapy_timeline <- renderPlot({
    reactiveValuesToList(input)
    preview <- tryCatch({
      doses <- read_doses(include_missed = TRUE)
      records <- read_observation_records()
      origin_candidates <- doses$time[doses$status != "missed"]
      if (!length(origin_candidates)) stop("Ajoutez une administration reçue.")
      origin <- min(origin_candidates, na.rm = TRUE)
      doses$time <- doses$time - origin
      records$raw$time <- records$raw$time - origin
      list(doses = doses, observations = records$raw)
    }, error = function(error) NULL)
    shiny::validate(shiny::need(!is.null(preview), tx("La frise apparaîtra lorsque les horaires seront cohérents.", "The timeline will appear once the times are consistent.")))

    dose_events <- do.call(rbind, lapply(seq_len(nrow(preview$doses)), function(index) {
      row <- preview$doses[index, , drop = FALSE]
      repetitions <- if (row$ss[[1]] == 1L || row$status[[1]] == "missed") 0 else max(0L, row$count[[1]] - 1L)
      data.frame(
        time = row$time[[1]] + seq.int(0L, repetitions) * row$interval[[1]],
        lane = tx("Administrations", "Administrations"),
        type = row$status[[1]],
        label = if (row$ss[[1]] == 1L) paste0(row$amount[[1]], " mg · SS") else paste0(row$amount[[1]], " mg"),
        stringsAsFactors = FALSE
      )
    }))
    samples <- data.frame(
      time = preview$observations$time,
      lane = tx("Prélèvements", "Samples"),
      type = ifelse(preview$observations$blq, "blq", "sample"),
      label = ifelse(preview$observations$blq, paste0("BLQ < ", preview$observations$lloq), as.character(preview$observations$concentration)),
      stringsAsFactors = FALSE
    )
    events <- rbind(dose_events, samples)
    ggplot(events, aes(time, lane, color = type, shape = type)) +
      geom_hline(yintercept = c(1, 2), color = "#dfe4e8", linewidth = 0.5) +
      geom_point(size = 3) +
      geom_text(aes(label = label), nudge_y = 0.16, check_overlap = TRUE, size = 3, color = "#17202a") +
      scale_color_manual(values = c(
        administered = "#176b70", uncertain = "#b16916", missed = "#a43d35",
        sample = "#a4441f", blq = "#66717c"
      ), drop = FALSE) +
      scale_shape_manual(values = c(administered = 16, uncertain = 17, missed = 4, sample = 15, blq = 1), drop = FALSE) +
      labs(x = tx("Temps depuis la première administration reçue (h)", "Time since first received administration (h)"), y = NULL, title = tx("Frise thérapeutique", "Treatment timeline"), color = NULL, shape = NULL) +
      theme_minimal(base_size = 11) +
      theme(panel.grid = element_blank(), legend.position = "bottom", plot.title = element_text(face = "bold", size = 12))
  })
  shiny::outputOptions(output, "therapy_timeline", suspendWhenHidden = FALSE)

  build_quality_diagnostics <- function(dose_records, observation_records, model_ids, blq_method) {
    english <- identical(current_language(), "en")
    messages <- c(
      if (any(dose_records$status == "missed")) tx(paste(sum(dose_records$status == "missed"), "dose(s) oubliée(s) exclue(s) du calcul."), paste(sum(dose_records$status == "missed"), "missed dose(s) excluded from calculations.")),
      if (any(dose_records$status == "uncertain")) tx(paste(sum(dose_records$status == "uncertain"), "dose(s) avec horaire incertain."), paste(sum(dose_records$status == "uncertain"), "dose(s) with uncertain time.")),
      if (any(observation_records$time_uncertainty > 0)) tx(paste(sum(observation_records$time_uncertainty > 0), "prélèvement(s) avec incertitude horaire."), paste(sum(observation_records$time_uncertainty > 0), "sample(s) with timing uncertainty.")),
      if (any(observation_records$blq)) {
        tx(
          paste(sum(observation_records$blq), "valeur(s) BLQ", if (identical(blq_method, "exclude")) "exclue(s) de l'ajustement." else "imputée(s) à LLOQ/2 (méthode exploratoire)."),
          paste(sum(observation_records$blq), "BLQ value(s)", if (identical(blq_method, "exclude")) "excluded from the fit." else "imputed as LLOQ/2 (exploratory method).")
        )
      },
      if (any(observation_records$matrix == "unspecified")) tx("Matrice biologique non précisée pour au moins un prélèvement.", "Biological matrix is unspecified for at least one sample."),
      if (length(unique(observation_records$matrix)) > 1L) tx("Plusieurs matrices biologiques sont mélangées sans conversion.", "Several biological matrices are mixed without conversion.")
    )

    bounds <- list(
      WT = c(2, 300), WEIGHT = c(2, 300), AGE = c(0, 110), BMI = c(10, 80),
      CRCL = c(0, 250), CLCR = c(0, 250), EGFR = c(0, 250), CREAT = c(5, 2000),
      SCR = c(5, 2000), ALB = c(5, 60), ALBUMIN = c(5, 60), HT = c(40, 230), HEIGHT = c(40, 230)
    )
    covariate_names <- intersect(names(observation_records), names(bounds))
    for (name in covariate_names) {
      limits <- bounds[[name]]
      values <- suppressWarnings(as.numeric(observation_records[[name]]))
      if (any(is.finite(values) & (values < limits[[1]] | values > limits[[2]]))) {
        messages <- c(messages, tx(
          paste0(name, " sort de la plage physiologique de contrôle ", limits[[1]], "–", limits[[2]], "."),
          paste0(name, " is outside the physiological screening range ", limits[[1]], "–", limits[[2]], ".")
        ))
      }
    }

    populations <- lapply(model_ids, function(id) {
      record <- model_record(id)
      list(
        model = paste(if (english) record$drugEn[[1]] else record$drug[[1]], record$model[[1]], sep = " - "),
        population = if (english) record$populationEn[[1]] else record$population[[1]],
        tags = if (english) record$populationTagsEn[[1]] %||% character() else record$populationTags[[1]] %||% character(),
        doi = record$doi[[1]] %||% "",
        model_type = if (english) record$modelTypeEn[[1]] %||% "" else record$modelType[[1]] %||% "",
        note = if (english) record$noteEn[[1]] %||% "" else record$note[[1]] %||% ""
      )
    })
    engineering <- Filter(function(item) grepl("déterministe|ingénierie|adapté|deterministic|engineering|adapted", item$model_type, ignore.case = TRUE), populations)
    if (length(engineering)) {
      messages <- c(messages, tx("Au moins un modèle est adapté ou déterministe : relisez sa note avant interprétation.", "At least one model is adapted or deterministic: review its note before interpretation."))
    }
    list(messages = unique(messages[nzchar(messages)]), populations = populations)
  }

  analysis_provenance <- function(specifications) {
    package_version <- function(name) {
      tryCatch(as.character(utils::packageVersion(name)), error = function(error) "non disponible")
    }
    models <- lapply(specifications, function(specification) {
      if (specification$id %in% MODEL_CATALOG$id) {
        list(id = specification$id, sha256 = model_sha256(specification$id))
      } else {
        code <- specification$code %||% ""
        hash <- if (requireNamespace("digest", quietly = TRUE)) digest::digest(code, algo = "sha256", serialize = FALSE) else short_hash(code)
        list(id = "custom", sha256 = hash)
      }
    })
    list(
      generated_at = format(Sys.time(), tz = "UTC", usetz = TRUE),
      r = R.version.string,
      packages = list(mrgsolve = package_version("mrgsolve"), mapbayr = package_version("mapbayr"), shiny = package_version("shiny")),
      models = models,
      assumptions = if (identical(current_language(), "en")) c(
        "Concentration units match the model; no automatic conversion.",
        "Covariates are carried forward to the next dated value.",
        "BLQ values are handled according to session settings.",
        "Exact domain ranges must be checked in each source article."
      ) else c(
        "Unités de concentration identiques à celles du modèle; aucune conversion automatique.",
        "Covariables reportées jusqu'à la valeur datée suivante.",
        "Valeurs BLQ traitées selon le réglage de session.",
        "Les plages de domaine exactes doivent être vérifiées dans chaque article source."
      )
    )
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
        steady_state = isTRUE(data$ss[[index]] == 1),
        status = as.character(data$status[[index]] %||% "administered"),
        time_uncertainty = as.numeric(data$time_uncertainty[[index]] %||% 0)
      )
    }
  }

  replace_observation_rows <- function(data, expected_model_ids = character()) {
    removeUI(selector = "#observation_rows .observation-row", multiple = TRUE, immediate = TRUE)
    observation_count(nrow(data))
    for (index in seq_len(nrow(data))) {
      insert_observation_row(
        index,
        data$time[[index]],
        data$concentration[[index]],
        blq = isTRUE(as.logical(data$blq[[index]] %||% FALSE)),
        lloq = as.numeric(data$lloq[[index]] %||% NA_real_),
        matrix = as.character(data$matrix[[index]] %||% "unspecified"),
        time_uncertainty = as.numeric(data$time_uncertainty[[index]] %||% 0)
      )
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
    observation_fields <- c("time", "concentration", "blq", "lloq", "matrix", "time_uncertainty")
    covariate_names <- intersect(setdiff(names(data), observation_fields), definition$name)
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
    showNotification(tx("Données patient importées dans cette session.", "Patient data imported into this session."), type = "message", duration = 4)
  })

  validate_patient_table <- function(value, required, label, maximum_rows = 100L, character_columns = character()) {
    if (is.null(value)) stop(tx(paste0("Section ", label, " absente du fichier."), paste0("Missing ", label, " section in the file.")))
    data <- as.data.frame(value, stringsAsFactors = FALSE, check.names = FALSE)
    missing <- setdiff(required, names(data))
    if (length(missing)) stop(tx(
      paste0("Colonnes manquantes dans ", label, " : ", paste(missing, collapse = ", ")),
      paste0("Missing columns in ", label, ": ", paste(missing, collapse = ", "))
    ))
    if (!nrow(data) || nrow(data) > maximum_rows) stop(tx(
      paste0(label, " doit contenir entre 1 et ", maximum_rows, " lignes."),
      paste0(label, " must contain between 1 and ", maximum_rows, " rows.")
    ))
    if (ncol(data) > 50L || any(!grepl("^[A-Za-z][A-Za-z0-9_]*$", names(data)))) {
      stop(tx(paste0("Noms ou nombre de colonnes invalides dans ", label, "."), paste0("Invalid column names or count in ", label, ".")))
    }
    identity_pattern <- "(^id$|patient|name|nom|prenom|birth|naissance|email|phone|telephone|address|adresse|mrn|ipp|nir)"
    if (any(grepl(identity_pattern, names(data), ignore.case = TRUE))) {
      stop(tx("Le fichier ne doit contenir aucun identifiant patient.", "The file must not contain any patient identifier."))
    }
    numeric_columns <- setdiff(names(data), character_columns)
    for (name in numeric_columns) data[[name]] <- suppressWarnings(as.numeric(data[[name]]))
    if (length(numeric_columns) && !all(is.finite(as.matrix(data[, numeric_columns, drop = FALSE])))) {
      stop(tx(paste0("Toutes les valeurs numériques de ", label, " doivent être valides."), paste0("All numeric values in ", label, " must be valid.")))
    }
    data
  }

  output$download_patient <- downloadHandler(
    filename = function() paste0("tdm-patient-", Sys.Date(), ".json"),
    content = function(file) {
      timeline <- normalize_timeline(read_doses(), read_observation_records())
      doses <- read_doses(include_missed = TRUE)
      doses$time <- doses$time - timeline$origin
      observations <- timeline$observations$raw
      model_source <- isolate(input$model_source %||% "library")
      document <- list(
        schema = "pk-mipd-patient",
        version = 3L,
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
          variability = isolate(input$variability_components %||% character()),
          posteriorReplicates = as.integer(isolate(input$posterior_replicates %||% 20)),
          blqMethod = isolate(input$blq_method %||% "exclude"),
          experimentalML = isTRUE(isolate(input$enable_experimental_ml))
        )
      )
      jsonlite::write_json(document, file, pretty = TRUE, auto_unbox = TRUE, dataframe = "rows", null = "null")
    }
  )

  observeEvent(input$upload_patient, {
    file_info <- input$upload_patient
    if (is.null(file_info)) return()
    tryCatch({
      if (file_info$size[[1]] > 1024 * 1024) stop(tx("Le fichier patient est limité à 1 Mo.", "The patient file is limited to 1 MB."))
      document <- jsonlite::fromJSON(file_info$datapath[[1]], simplifyDataFrame = TRUE)
      unlink(file_info$datapath[[1]], force = TRUE)
      version <- as.integer(document$version %||% 0)
      if (!identical(document$schema %||% "", "pk-mipd-patient") || !version %in% c(1L, 2L, 3L)) {
        stop(tx("Format de fichier patient non reconnu.", "Unrecognized patient file format."))
      }

      doses <- validate_patient_table(
        document$doses,
        c("time", "amount", "interval", "count", "infusion"),
        "administrations",
        character_columns = "status"
      )
      observations <- validate_patient_table(
        document$observations,
        c("time", "concentration"),
        "observations",
        character_columns = "matrix"
      )
      if (!"ss" %in% names(doses)) doses$ss <- 0
      if (!"status" %in% names(doses)) doses$status <- "administered"
      if (!"time_uncertainty" %in% names(doses)) doses$time_uncertainty <- 0
      if (!"blq" %in% names(observations)) observations$blq <- 0
      if (!"lloq" %in% names(observations)) observations$lloq <- 0
      if (!"matrix" %in% names(observations)) observations$matrix <- "unspecified"
      if (!"time_uncertainty" %in% names(observations)) observations$time_uncertainty <- 0
      invalid_doses <- doses$time < 0 | doses$amount <= 0 | doses$interval < 0 | doses$count < 1 | doses$infusion < 0 |
        !doses$ss %in% c(0, 1) | (doses$ss == 1 & doses$interval <= 0) |
        !doses$status %in% c("administered", "uncertain", "missed") | doses$time_uncertainty < 0
      if (any(invalid_doses)) stop(tx(
        "Administration invalide dans le fichier. Un steady state nécessite ss = 1 et un intervalle positif.",
        "Invalid administration in the file. Steady state requires ss = 1 and a positive interval."
      ))
      invalid_observations <- observations$time < 0 | observations$concentration < 0 |
        !observations$matrix %in% c("unspecified", "plasma", "serum", "whole_blood") |
        observations$time_uncertainty < 0 | (as.logical(observations$blq) & observations$lloq <= 0)
      if (any(invalid_observations)) stop(tx("Observation invalide dans le fichier.", "Invalid observation in the file."))
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
        showNotification(tx(
          "Le code C++ personnalisé n'est jamais inclus dans l'export; recollez-le avant l'analyse.",
          "Custom C++ code is never included in the export; paste it again before analysis."
        ), type = "warning", duration = 8)
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
      variability <- intersect(settings$variability %||% character(), c("POSTERIOR", "RESID", "TIMING", "IIV"))
      variability[variability == "IIV"] <- "POSTERIOR"
      if (length(variability)) updateCheckboxGroupInput(session, "variability_components", selected = variability)
      posterior_replicates <- suppressWarnings(as.integer(settings$posteriorReplicates %||% NA_integer_))
      if (is.finite(posterior_replicates) && posterior_replicates >= 10 && posterior_replicates <= 40) {
        updateNumericInput(session, "posterior_replicates", value = posterior_replicates)
      }
      if ((settings$blqMethod %||% "") %in% c("exclude", "lloq_half")) {
        updateSelectInput(session, "blq_method", selected = settings$blqMethod)
      }
      updateCheckboxInput(session, "enable_experimental_ml", value = isTRUE(settings$experimentalML))

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
    shiny::validate(shiny::need(all(compatible), tx("Tous les modèles moyennés doivent utiliser la même voie d'administration.", "All averaged models must use the same administration route.")))
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
    withProgress(message = tx("Compilation du modèle", "Compiling model"), value = 0.3, {
      result <- tryCatch(validate_primary_model(), error = function(error) list(ok = FALSE, errors = conditionMessage(error), warnings = character()))
      validation_store(result)
      incProgress(0.7)
    })
  })

  output$engine_status <- renderUI({
    result <- validation_store()
    if (is.null(result)) return(span(class = "status-pill idle", tx("Non validé", "Not validated")))
    if (isTRUE(result$ok)) span(class = "status-pill ok", tx("Modèle valide", "Valid model")) else span(class = "status-pill error", tx("Erreur modèle", "Model error"))
  })

  output$library_code <- renderText({
    read_library_code(current_model_id())
  })

  output$model_contract <- renderUI({
    result <- validation_store()
    if (is.null(result)) return(div(class = "contract-note", tx(
      "Cliquez sur « Valider le modèle » pour vérifier les tags, OMEGA, SIGMA et sorties capturées.",
      "Select ‘Validate model’ to check tags, OMEGA, SIGMA, and captured outputs."
    )))
    if (!isTRUE(result$ok)) {
      return(div(class = "contract-error", tags$strong(tx("Modèle incompatible", "Incompatible model")), tags$ul(lapply(result$errors, tags$li))))
    }
    div(
      class = "contract-ok",
      tags$strong(tx("Contrat mapbayr valide", "Valid mapbayr contract")),
      span(tx(
        paste0("Voie ", result$route, " · Administration CMT ", result$adm_cmt, " · Observation CMT ", result$obs_cmt, " · ", result$n_eta, " ETA · ", result$n_sigma, " erreurs résiduelles"),
        paste0("Route ", result$route, " · Administration CMT ", result$adm_cmt, " · Observation CMT ", result$obs_cmt, " · ", result$n_eta, " ETA · ", result$n_sigma, " residual errors")
      )),
      if (length(result$warnings)) tags$ul(lapply(result$warnings, tags$li))
    )
  })

  observeEvent(input$run_analysis, {
    analysis_stage <- tx("validation initiale", "initial validation")
    tryCatch({
      shiny::validate(shiny::need(isTRUE(input$accept_disclaimer), tx("Lisez et acceptez l'avertissement avant de lancer l'analyse.", "Read and accept the warning before running the analysis.")))
      analysis_stage <- tx("lecture de toutes les administrations", "reading all administrations")
      all_dose_records <- read_doses(include_missed = TRUE)
      analysis_stage <- tx("lecture des administrations reçues", "reading received administrations")
      administered_doses <- read_doses()
      analysis_stage <- tx("lecture des concentrations et covariables", "reading concentrations and covariates")
      entered_observations <- read_observation_records()
      analysis_stage <- tx("normalisation de la chronologie", "normalizing the timeline")
      timeline <- normalize_timeline(administered_doses, entered_observations)
      doses <- timeline$doses
      all_dose_records$time <- all_dose_records$time - timeline$origin
      observation_records <- timeline$observations
      observations <- observation_records$observations
      covariates <- observation_records$baseline
      specifications <- model_specifications()
      library_model_ids <- intersect(vapply(specifications, `[[`, character(1), "id"), MODEL_CATALOG$id)
      intervals <- as.numeric(isolate(input$candidate_intervals))
      route <- isolate(input$administration_route)
      infusion <- if (identical(route, "Oral")) 0 else as.numeric(isolate(input$future_infusion))
      delta <- as.numeric(isolate(input$simulation_delta %||% 0.1))
      variability <- isolate(input$variability_components %||% character())

      analysis_stage <- tx("validation des réglages", "validating settings")
      shiny::validate(shiny::need(length(intervals), tx("Sélectionnez au moins un intervalle de dose.", "Select at least one dosing interval.")))
      shiny::validate(shiny::need(input$target_high > input$target_low, tx("La borne haute doit dépasser la borne basse.", "The upper bound must exceed the lower bound.")))
      shiny::validate(shiny::need(input$dose_max >= input$dose_min && input$dose_step > 0, tx("La grille de doses est invalide.", "The dose grid is invalid.")))

      result <- withProgress(message = tx("Analyse pharmacométrique", "Pharmacometric analysis"), value = 0, {
        analysis_stage <- tx("ajustement MAP", "MAP fitting")
        incProgress(0.12, detail = tx("Compilation et validation", "Compilation and validation"))
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
        fits <- apply_hybrid_ml_to_fits(
          fits,
          route,
          enabled = isTRUE(isolate(input$enable_experimental_ml))
        )
        valid <- successful_fits(fits)
        if (!length(valid)) {
          messages <- vapply(fits, function(item) item$message %||% "Unknown error", character(1))
          stop(paste(messages, collapse = " | "))
        }

        analysis_stage <- tx("exposition actuelle", "current exposure")
        incProgress(0.32, detail = tx("Estimation MAP", "MAP estimation"))
        weights <- compute_model_weights(fits, isolate(input$weighting_scheme %||% "AIC"))
        dose_ss <- if ("ss" %in% names(doses)) as.integer(doses$ss) else rep(0L, nrow(doses))
        known_dose_times <- doses$time + ifelse(dose_ss == 1L, 0, doses$interval * pmax(0, doses$count - 1))
        end_time <- max(c(known_dose_times, observations$time, 24), na.rm = TRUE) + 48
        profiles <- fit_profiles(fits, weights, end_time, delta = max(delta, 0.1))
        current_exposure <- current_regimen_exposure(fits, weights, doses, observations)

        analysis_stage <- tx("grille de posologies", "dosage grid")
        incProgress(0.58, detail = tx("Exploration des posologies", "Exploring dosage regimens"))
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
        analysis_stage <- tx("probabilité d'atteindre la cible", "target attainment probability")
        recommendations <- rank_regimens_by_pta(
          recommendations = recommendations,
          fits = fits,
          weights = weights,
          metric = isolate(input$target_metric),
          target_low = isolate(input$target_low),
          target_high = isolate(input$target_high),
          replicates = min(150L, as.integer(isolate(input$mc_replicates %||% 250))),
          delta = delta,
          include_posterior = "POSTERIOR" %in% variability,
          include_residual = "RESID" %in% variability
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

        analysis_stage <- tx("sensibilité du model averaging", "model averaging sensitivity")
        averaging_sensitivity <- model_averaging_sensitivity(
          fits = fits,
          selected_weights = weights,
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

        analysis_stage <- tx("comparaison des doses futures", "future dose comparison")
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

        analysis_stage <- tx("distribution prédictive", "predictive distribution")
        incProgress(0.86, detail = tx("Distribution prédictive", "Predictive distribution"))
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
          include_posterior = "POSTERIOR" %in% variability,
          include_residual = "RESID" %in% variability,
          include_timing = "TIMING" %in% variability,
          timing_refits = as.integer(isolate(input$posterior_replicates %||% 20))
        )

        analysis_stage <- tx("qualité et traçabilité", "quality and traceability")
        incProgress(0.9, detail = tx("Préparation des résultats", "Preparing results"))
        quality <- build_quality_diagnostics(
          all_dose_records,
          observation_records$raw,
          library_model_ids,
          isolate(input$blq_method %||% "exclude")
        )
        list(
          fits = fits,
          weights = weights,
          model_summary = model_summary(fits, weights),
          fit_profiles = profiles,
          current_exposure = current_exposure,
          recommendations = recommendations,
          averaging_sensitivity = averaging_sensitivity,
          best = best,
          best_profile = best_profile,
          future_comparison = future_comparison,
          distribution = distribution,
          doses = doses,
          all_dose_records = all_dose_records,
          observations = observations,
          observation_records = observation_records$raw,
          route = route,
          infusion = infusion,
          target_metric = isolate(input$target_metric),
          target_low = isolate(input$target_low),
          target_high = isolate(input$target_high),
          weighting_scheme = isolate(input$weighting_scheme %||% "AIC"),
          quality = quality,
          provenance = analysis_provenance(specifications),
          ml_status = ml_application_summary(fits, weights),
          settings = list(
            delta = delta,
            additional_doses = as.integer(isolate(input$additional_doses %||% 6)),
            mc_replicates = as.integer(isolate(input$mc_replicates %||% 250)),
            posterior_replicates = as.integer(isolate(input$posterior_replicates %||% 20)),
            prediction_interval = as.numeric(isolate(input$prediction_interval %||% 90)),
            variability = variability,
            blq_method = isolate(input$blq_method %||% "exclude"),
            show_component_profiles = isTRUE(isolate(input$show_component_profiles))
          )
        )
      })
      analysis_store(result)
      bslib::nav_select("analysis_tabs", "fit")
      showNotification(tx("Analyse terminée.", "Analysis completed."), type = "message", duration = 3)
    }, error = function(error) {
      detail <- conditionMessage(error)
      if (!nzchar(detail)) detail <- tx("Une entrée réactive requise n'est pas disponible.", "A required reactive input is unavailable.")
      message("TDM analysis error [", analysis_stage, "] ", paste(class(error), collapse = "/"), ": ", detail)
      showNotification(paste0(analysis_stage, " : ", detail), type = "error", duration = 10)
    })
  })

  output$fit_empty <- renderUI({
    if (is.null(analysis_store())) div(class = "empty-results", tx("Renseignez les données puis lancez l'analyse.", "Enter the data, then run the analysis."))
  })

  output$analysis_warnings <- renderUI({
    result <- analysis_store()
    if (is.null(result)) return(NULL)
    population_rows <- lapply(result$quality$populations, function(item) {
      tags$li(tags$strong(item$model), paste0(" : ", item$population))
    })
    div(
      class = "analysis-diagnostics",
      tags$strong(tx("Applicabilité et qualité des données", "Applicability and data quality")),
      if (length(result$quality$messages)) tags$ul(lapply(result$quality$messages, tags$li)) else span(tx("Aucune anomalie générique détectée.", "No generic issue detected.")),
      if (length(population_rows)) tagList(span(tx("Populations sources à comparer au patient :", "Source populations to compare with the patient:")), tags$ul(population_rows)),
      span(class = "ml-result-status", ml_status_message(result$ml_status, current_language())),
      ml_domain_warning_block(result$ml_status, current_language())
    )
  })

  output$current_exposure_summary <- renderUI({
    result <- analysis_store()
    if (is.null(result)) return(NULL)
    exposure <- result$current_exposure
    regimen_label <- if (isTRUE(exposure$steady_state)) {
      tx(paste0(format_metric(exposure$dose), " mg / ", format_metric(exposure$interval), " h · État stationnaire"), paste0(format_metric(exposure$dose), " mg / ", format_metric(exposure$interval), " h · Steady state"))
    } else if (isTRUE(exposure$single_dose)) {
      tx(paste0("Dose unique · ", format_metric(exposure$dose), " mg"), paste0("Single dose · ", format_metric(exposure$dose), " mg"))
    } else {
      paste0(format_metric(exposure$dose), " mg / ", format_metric(exposure$interval), " h")
    }
    c0_detail <- if (isTRUE(exposure$single_dose)) {
      tx("À 24 h après la dose", "At 24 h after dose")
    } else {
      tx(paste0("À ", format_metric(exposure$interval), " h, avant la dose suivante"), paste0("At ", format_metric(exposure$interval), " h, before the next dose"))
    }
    method <- if (any(vapply(successful_fits(result$fits), function(fit) !is.null(fit$estimate), logical(1)))) {
      tx("MAP bayésienne · mapbayr", "Bayesian MAP · mapbayr")
    } else {
      tx("Prédiction populationnelle", "Population prediction")
    }
    div(
      class = "exposure-strip",
      div(
        span(tx("AUC actuelle · fenêtre glissante", "Current AUC · rolling window")),
        strong(format_metric(exposure$historical_auc24)),
        tags$small(tx(paste0("MAP sur les dernières ", format_metric(exposure$historical_coverage_hours), " h disponibles"), paste0("MAP over the latest ", format_metric(exposure$historical_coverage_hours), " available hours")))
      ),
      if (is.finite(result$ml_status$auc24 %||% NA_real_)) {
        div(
          span(tx("AUC24 ML expérimentale", "Experimental ML AUC24")),
          strong(format_metric(result$ml_status$auc24)),
          tags$small(tx("Estimation directe issue des prélèvements récents · non utilisée pour la recommandation", "Direct estimate from recent samples · not used for the recommendation"))
        )
      },
      div(
        span(tx("C0 actuelle", "Current C0")),
        strong(format_metric(exposure$historical_c0)),
        tags$small(tx(paste0("MAP juste avant la prochaine dose à h ", format_metric(exposure$historical_c0_time)), paste0("MAP immediately before the next dose at h ", format_metric(exposure$historical_c0_time))))
      ),
      div(span(tx("AUC0-24 à l'état stationnaire", "Steady-state AUC0-24")), strong(format_metric(exposure$steady_state_auc24)), tags$small(tx("Dernier schéma renseigné répété", "Last entered regimen repeated"))),
      div(span(tx("C0 à l'état stationnaire", "Steady-state C0")), strong(format_metric(exposure$steady_state_c0)), tags$small(c0_detail)),
      div(
        span(tx("Schéma actuel", "Current regimen")),
        strong(regimen_label),
        tags$small(if (exposure$infusion > 0) {
          tx(paste0("Perfusion IV : ", format_metric(exposure$infusion), " h"), paste0("IV infusion: ", format_metric(exposure$infusion), " h"))
        } else if (identical(result$route, "Oral")) {
          tx("Administration orale · perfusion = 0 h", "Oral administration · infusion = 0 h")
        } else {
          tx("Bolus IV · perfusion = 0 h", "IV bolus · infusion = 0 h")
        })
      ),
      div(span(tx("Estimation", "Estimate")), strong(method), tags$small(if (length(result$weights) > 1) tx("Prédiction pondérée par model averaging", "Prediction weighted by model averaging") else tx("Modèle individuel sélectionné", "Selected individual model")))
    )
  })

  output$fit_plot <- renderPlot({
    result <- analysis_store()
    shiny::req(result)
    profiles <- result$fit_profiles
    shiny::validate(shiny::need(nrow(profiles$average), tx("Ajoutez au moins une concentration observée pour produire l'ajustement MAP.", "Add at least one observed concentration to produce the MAP fit.")))

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
      labs(x = tx("Temps (h)", "Time (h)"), y = tx("Concentration", "Concentration"), title = tx("Prédiction individuelle et observations", "Individual prediction and observations")) +
      theme_minimal(base_size = 13) +
      theme(panel.grid.minor = element_blank(), plot.title = element_text(face = "bold"))
  })

  output$future_comparison_summary <- renderUI({
    result <- analysis_store()
    if (is.null(result)) return(div(class = "empty-results", tx("La comparaison sera calculée avec l'analyse.", "The comparison will be calculated with the analysis.")))
    comparison <- result$future_comparison
    current <- comparison$scenarios[[SCENARIO_MAINTAIN]]
    recommended <- comparison$scenarios[[SCENARIO_RECOMMENDED]]
    div(
      class = "comparison-strip",
      div(span(tx("Prochaine dose simulée", "Next simulated dose")), strong(paste0("h ", format_metric(comparison$future_start)))),
      div(span(tx("Poursuite", "Maintain")), strong(paste0(current$dose, " mg / ", current$interval, " h"))),
      div(span(tx("Recommandation", "Recommendation")), strong(paste0(recommended$dose, " mg / ", recommended$interval, " h"))),
      div(span(tx("Projection", "Projection")), strong(tx(paste0(comparison$additional_doses, " doses supplémentaires"), paste0(comparison$additional_doses, " additional doses"))))
    )
  })

  output$future_comparison_plot <- renderPlot({
    result <- analysis_store()
    shiny::req(result)
    comparison <- result$future_comparison
    window_start <- max(0, comparison$decision_time - 24)
    ggplot(comparison$profiles, aes(time, concentration, color = scenario, linetype = scenario)) +
      geom_vline(xintercept = comparison$decision_time, color = "#66717c", linetype = "dashed") +
      geom_vline(xintercept = comparison$future_start, color = "#17202a", linetype = "dotted") +
      geom_line(linewidth = 1.2) +
      coord_cartesian(xlim = c(window_start, comparison$end_time)) +
      scale_color_manual(values = stats::setNames(c("#3f4a54", "#176b70"), c(SCENARIO_MAINTAIN, SCENARIO_RECOMMENDED))) +
      scale_linetype_manual(values = stats::setNames(c("dashed", "solid"), c(SCENARIO_MAINTAIN, SCENARIO_RECOMMENDED))) +
      labs(x = tx("Temps depuis la première administration (h)", "Time since first administration (h)"), y = "Concentration", color = NULL, linetype = NULL) +
      theme_minimal(base_size = 13) +
      theme(panel.grid.minor = element_blank(), legend.position = "top")
  })

  output$ml_interpretation_panel <- renderUI({
    result <- analysis_store()
    if (is.null(result)) return(NULL)
    concordance <- ml_concordance(result, current_language())
    if (is.null(concordance)) return(NULL)
    explanation <- result$ml_status$explanation %||% list(available = FALSE, reason = "Explication DALEX indisponible.")
    agreement_label <- switch(
      concordance$level,
      close = tx("Estimations proches", "Close estimates"),
      moderate = tx("Écart modéré", "Moderate difference"),
      divergent = tx("Divergence importante", "Substantial divergence")
    )
    tagList(
      h3(tx("Concordance MAP-BE et ML", "MAP-BE and ML agreement")),
      ml_domain_warning_block(result$ml_status, current_language()),
      div(
        class = "comparison-strip ml-comparison-strip",
        div(span("AUC24 MAP-BE"), strong(format_metric(concordance$map_auc24)), tags$small("mrgsolve + mapbayr")),
        div(span("AUC24 ML"), strong(format_metric(concordance$ml_auc24)), tags$small("XGBoost direct")),
        div(
          span(tx("Écart relatif", "Relative difference")),
          strong(paste0(if (concordance$relative_gap >= 0) "+" else "", format_metric(concordance$relative_gap), " %")),
          tags$small(tx("ML par rapport au MAP-BE", "ML relative to MAP-BE"))
        ),
        div(span(tx("Lecture", "Interpretation")), strong(agreement_label), tags$small(concordance$interpretation))
      ),
      plotOutput("ml_comparison_plot", height = "330px"),
      h3(tx("Explication locale DALEX de l'AUC24 ML", "Local DALEX explanation of ML AUC24")),
      if (isTRUE(explanation$available)) {
        tagList(
          plotOutput("ml_explanation_plot", height = "470px"),
          div(
            class = "analysis-diagnostics ml-explanation-help",
            tags$strong(tx("Comment lire cette figure", "How to read this figure")),
            tags$ul(
              tags$li(tx("Chaque barre montre comment une information de ce patient déplace la prédiction par rapport à la référence synthétique DALEX.", "Each bar shows how one item of patient information shifts the prediction from the synthetic DALEX baseline.")),
              tags$li(tx("Les contributions expliquent le calcul de XGBoost; elles ne démontrent pas une relation causale.", "Contributions explain the XGBoost calculation; they do not establish causality.")),
              tags$li(tx("Une concordance MAP-BE/ML est un contrôle de cohérence, pas une validation clinique indépendante.", "MAP-BE/ML agreement is a consistency check, not an independent clinical validation."))
            )
          )
        )
      } else {
        div(class = "empty-state compact", tx(paste0("Explication DALEX indisponible : ", explanation$reason %||% "raison inconnue"), paste0("DALEX explanation unavailable: ", explanation$reason %||% "unknown reason")))
      }
    )
  })

  output$ml_comparison_plot <- renderPlot({
    result <- analysis_store()
    shiny::req(result)
    plot <- build_ml_comparison_plot(result, current_language())
    shiny::validate(shiny::need(!is.null(plot), tx("La comparaison MAP-BE/ML n'est pas calculable.", "The MAP-BE/ML comparison cannot be calculated.")))
    plot
  })

  output$ml_explanation_plot <- renderPlot({
    result <- analysis_store()
    shiny::req(result)
    plot <- build_ml_explanation_plot(result$ml_status$explanation, lang = current_language())
    shiny::validate(shiny::need(!is.null(plot), tx("L'explication DALEX n'est pas disponible.", "The DALEX explanation is unavailable.")))
    plot
  })

  output$averaging_sensitivity_summary <- renderUI({
    result <- analysis_store()
    if (is.null(result)) return(NULL)
    table <- result$averaging_sensitivity
    if (!nrow(table) || nrow(table) == 1L) {
      return(div(class = "empty-state compact", tx("Un seul jeu de poids distinct : aucune sensibilité inter-modèles calculable.", "Only one distinct weight set: no between-model sensitivity can be calculated.")))
    }
    div(
      class = "sensitivity-strip",
      div(span(tx("Dose proposée", "Proposed dose")), strong(paste0(min(table$dose), "–", max(table$dose), " mg"))),
      div(span(tx("Intervalles proposés", "Proposed intervals")), strong(paste(sort(unique(table$interval)), collapse = ", "), " h")),
      div(span(tx("Valeur cible", "Target value")), strong(paste0(format_metric(min(table$target_value)), "–", format_metric(max(table$target_value)))))
    )
  })

  output$averaging_sensitivity_table <- renderDT({
    result <- analysis_store()
    shiny::req(result)
    table <- result$averaging_sensitivity
    table[c("auc24", "cmin", "cmax", "target_value")] <- lapply(table[c("auc24", "cmin", "cmax", "target_value")], round, 2)
    datatable(
      table,
      rownames = FALSE,
      options = list(dom = "t", pageLength = nrow(table), scrollX = TRUE),
      colnames = app_t(current_language(), c("Analyse", "Dose", "Intervalle", "AUC24", "Cmin", "Cmax", "Valeur cible", "Dans cible", "Poids"))
    )
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
      colnames = app_t(current_language(), c("Modèle", "Statut", "Poids", "CL", "ETA", "AUC24 ML", "Détail"))
    )
  })

  output$recommendation_summary <- renderUI({
    result <- analysis_store()
    if (is.null(result)) return(div(class = "empty-results", tx("Aucun scénario calculé.", "No scenario calculated.")))
    best <- result$best
    div(
      class = "recommendation-strip",
      div(span(tx("Scénario le plus proche de la cible", "Scenario closest to target")), strong(tx(paste0(best$dose, " mg toutes les ", best$interval, " h"), paste0(best$dose, " mg every ", best$interval, " h")))),
      div(span(result$target_metric), strong(round(best$value, 1))),
      div(span(tx("Probabilité d'atteindre la cible", "Target attainment probability")), strong(if (is.finite(best$p_target)) paste0(round(100 * best$p_target), " %") else tx("Non calculée", "Not calculated"))),
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
        x = tx("Temps depuis la dose (h)", "Time since dose (h)"),
        y = "Concentration",
        title = tx(paste0("Profil moyen pondéré · cible ", metric_label, " ", result$target_low, "–", result$target_high), paste0("Weighted mean profile · target ", metric_label, " ", result$target_low, "–", result$target_high))
      ) +
      theme_minimal(base_size = 13) +
      theme(panel.grid.minor = element_blank(), plot.title = element_text(face = "bold"))
  })

  output$distribution_summary <- renderUI({
    result <- analysis_store()
    if (is.null(result)) return(div(class = "empty-results", tx("La distribution sera calculée avec l'analyse.", "The distribution will be calculated with the analysis.")))
    distribution <- result$distribution
    components <- c(
      if (isTRUE(distribution$include_posterior)) tx("incertitude postérieure MAP", "MAP posterior uncertainty"),
      if (isTRUE(distribution$include_residual)) tx("erreur résiduelle", "residual error"),
      if (isTRUE(distribution$include_timing) && isTRUE(distribution$timing_available)) tx("incertitude des horaires", "timing uncertainty"),
      if (length(result$weights) > 1L) tx("incertitude entre modèles", "between-model uncertainty")
    )
    div(
      class = "distribution-strip",
      div(span(tx("Médiane", "Median")), strong(format_metric(distribution$median))),
      div(span(tx(paste0("Intervalle prédictif ", distribution$interval_level, " %"), paste0("Prediction interval ", distribution$interval_level, "%"))), strong(paste0(format_metric(distribution$lower), " – ", format_metric(distribution$upper)))),
      div(span(tx("Composantes", "Components")), strong(if (length(components)) paste(components, collapse = ", ") else tx("Aucune variabilité aléatoire", "No random variability")))
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
      labs(x = metric_label, y = tx("Réplications", "Replicates"), title = tx(paste0("Distribution du scénario ", result$best$dose, " mg / ", result$best$interval, " h"), paste0("Scenario distribution ", result$best$dose, " mg / ", result$best$interval, " h"))) +
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
    table$p_under <- round(100 * table$p_under, 1)
    table$p_target <- round(100 * table$p_target, 1)
    table$p_over <- round(100 * table$p_over, 1)
    table$distance <- round(table$distance, 3)
    table$center_distance <- NULL
    table$pta_evaluated <- NULL
    datatable(
      table,
      rownames = FALSE,
      filter = "top",
      options = list(pageLength = 12, scrollX = TRUE),
      colnames = app_t(current_language(), c("Dose", "Intervalle", "Perfusion", "AUC24", "Cmin", "Cmax", "Valeur cible", "Dans cible", "Distance", "Sous-cible (%)", "Dans cible (%)", "Sur-cible (%)"))
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
    filename = function() paste0(if (identical(current_language(), "en")) "tdm-report-" else "rapport-tdm-", Sys.Date(), ".html"),
    content = function(file) {
      result <- analysis_store()
      shiny::req(result)
      exposure <- result$current_exposure
      best <- result$best
      fit_plot <- ggplot() +
        geom_line(data = result$fit_profiles$average, aes(time, concentration), color = "#176b70", linewidth = 1.1) +
        geom_point(data = result$observations, aes(time, concentration), color = "#a4441f", size = 2.5) +
        labs(x = tx("Temps (h)", "Time (h)"), y = "Concentration") +
        theme_minimal(base_size = 11)
      comparison <- result$future_comparison
      comparison_plot <- ggplot(comparison$profiles, aes(time, concentration, color = scenario, linetype = scenario)) +
        geom_vline(xintercept = comparison$decision_time, color = "#66717c", linetype = "dashed") +
        geom_line(linewidth = 1.15) +
        scale_color_manual(values = stats::setNames(c("#3f4a54", "#176b70"), c(SCENARIO_MAINTAIN, SCENARIO_RECOMMENDED))) +
        scale_linetype_manual(values = stats::setNames(c("dashed", "solid"), c(SCENARIO_MAINTAIN, SCENARIO_RECOMMENDED))) +
        labs(x = tx("Temps (h)", "Time (h)"), y = "Concentration", color = NULL, linetype = NULL) +
        theme_minimal(base_size = 11) +
        theme(legend.position = "top")
      concordance <- ml_concordance(result, current_language())
      ml_comparison_plot <- build_ml_comparison_plot(result, current_language())
      ml_explanation <- result$ml_status$explanation %||% list(available = FALSE)
      ml_explanation_plot <- build_ml_explanation_plot(ml_explanation, lang = current_language())

      model_table <- result$model_summary
      model_table$weight <- round(model_table$weight, 4)
      model_table$clearance <- round(model_table$clearance, 3)
      dose_table <- result$all_dose_records
      dose_names <- c(
        time = "Temps (h)", amount = "Dose (mg)", interval = "Intervalle (h)", count = "Nombre",
        infusion = "Perfusion (h)", ss = "SS", status = "Statut", time_uncertainty = "Incertitude horaire (± h)"
      )
      if (identical(current_language(), "en")) dose_names <- c(
        time = "Time (h)", amount = "Dose (mg)", interval = "Interval (h)", count = "Count",
        infusion = "Infusion (h)", ss = "SS", status = "Status", time_uncertainty = "Time uncertainty (± h)"
      )
      names(dose_table) <- unname(dose_names[names(dose_table)])
      observation_table <- result$observation_records
      names(observation_table)[names(observation_table) == "time"] <- "Temps (h)"
      names(observation_table)[names(observation_table) == "concentration"] <- "Concentration"
      if (identical(current_language(), "en")) names(observation_table)[names(observation_table) == "Temps (h)"] <- "Time (h)"
      references <- lapply(names(successful_fits(result$fits)), function(id) {
        if (!id %in% MODEL_CATALOG$id) return(tags$li(tx("Modèle personnalisé de session", "Custom session model")))
        record <- model_record(id)
        tags$li(record$citation[[1]], " · ", tags$a(paste0("DOI ", record$doi[[1]]), href = paste0("https://doi.org/", record$doi[[1]])))
      })
      sensitivity_table <- result$averaging_sensitivity
      sensitivity_table[c("auc24", "cmin", "cmax", "target_value")] <- lapply(sensitivity_table[c("auc24", "cmin", "cmax", "target_value")], round, 2)
      provenance <- result$provenance
      model_fingerprints <- lapply(provenance$models, function(item) {
        tags$li(paste0(item$id, " : ", item$sha256 %||% tx("empreinte indisponible", "fingerprint unavailable")))
      })

      document <- localize_ui(tags$html(
        tags$head(
          tags$meta(charset = "utf-8"),
          tags$title("Rapport TDM"),
          tags$style(HTML("body{font-family:Arial,sans-serif;color:#17202a;max-width:1050px;margin:32px auto;padding:0 24px;line-height:1.45}h1{border-bottom:3px solid #176b70;padding-bottom:12px}h2{margin-top:30px;border-bottom:1px solid #dfe4e8;padding-bottom:6px}.summary{display:grid;grid-template-columns:repeat(3,1fr);border:1px solid #dfe4e8}.summary div{padding:12px;border-right:1px solid #dfe4e8;border-bottom:1px solid #dfe4e8}.summary span{display:block;color:#66717c;font-size:11px;text-transform:uppercase}.summary strong{display:block;margin-top:4px}table{width:100%;border-collapse:collapse;font-size:12px}th,td{border:1px solid #dfe4e8;padding:7px;text-align:left}th{background:#f1f4f5}img{width:100%;height:auto}.warning{border-left:4px solid #b16916;background:#fffaf0;padding:12px 15px;margin-top:28px;color:#5e4b23}.meta{color:#66717c;font-size:12px}.provenance{font-family:Consolas,monospace;font-size:11px;overflow-wrap:anywhere}@media print{body{margin:0}.no-print{display:none}h2{break-after:avoid}table,img{break-inside:avoid}}"))
        ),
        tags$body(
          h1("Rapport d'analyse TDM"),
          p(class = "meta", tx(
            paste0("Généré le ", format(Sys.time(), "%d/%m/%Y à %H:%M"), " · voie ", result$route, " · aucune donnée conservée après la session"),
            paste0("Generated on ", format(Sys.time(), "%Y-%m-%d at %H:%M"), " · route ", result$route, " · no data retained after the session")
          )),
          div(
            class = "summary",
            div(span("AUC actuelle glissante"), strong(format_metric(exposure$historical_auc24))),
            if (is.finite(result$ml_status$auc24 %||% NA_real_)) {
              div(span("AUC24 ML expérimentale"), strong(format_metric(result$ml_status$auc24)))
            },
            div(span("C0 actuelle (MAP)"), strong(format_metric(exposure$historical_c0))),
            div(span("AUC0-24 à l'état stationnaire"), strong(format_metric(exposure$steady_state_auc24))),
            div(span("C0 à l'état stationnaire"), strong(format_metric(exposure$steady_state_c0))),
            div(span("Recommandation"), strong(paste0(best$dose, " mg / ", best$interval, " h"))),
            div(span("PTA / cible"), strong(paste0(round(100 * best$p_target), " % · ", result$target_metric, " ", result$target_low, "–", result$target_high)))
          ),
          h2("Applicabilité et qualité"),
          if (length(result$quality$messages)) tags$ul(lapply(result$quality$messages, tags$li)) else p("Aucune anomalie générique détectée."),
          tags$ul(lapply(result$quality$populations, function(item) tags$li(tags$strong(item$model), paste0(" : ", item$population)))),
          h2("Ajustement"),
          tags$img(src = report_plot_uri(fit_plot), alt = "Ajustement pharmacocinétique"),
          h2("Comparaison des doses supplémentaires"),
          p(tx(paste0(comparison$additional_doses, " doses simulées à partir de h ", format_metric(comparison$future_start), "."), paste0(comparison$additional_doses, " doses simulated from h ", format_metric(comparison$future_start), "."))),
          tags$img(src = report_plot_uri(comparison_plot), alt = "Comparaison de posologies"),
          if (!is.null(concordance) && !is.null(ml_comparison_plot)) {
            tagList(
              h2("Concordance MAP-BE et ML"),
              p(concordance$interpretation),
              tags$img(src = report_plot_uri(ml_comparison_plot, height = 4), alt = "Comparaison des AUC24 MAP-BE et ML")
            )
          },
          if (length(result$ml_status$domain_warnings %||% list())) {
            div(
              class = "warning",
              tags$strong("Avertissement : prédiction ML extrapolée"),
              tags$ul(lapply(
                result$ml_status$domain_warnings,
                function(item) tags$li(format_ml_domain_warning(item, current_language()))
              )),
              p("La recommandation de dose reste calculée par MAP-BE.")
            )
          },
          if (isTRUE(ml_explanation$available) && !is.null(ml_explanation_plot)) {
            tagList(
              h2("Explication locale DALEX de l'AUC24 ML"),
              p("Les contributions décrivent le calcul de XGBoost par rapport à une référence synthétique; elles ne sont pas causales."),
              tags$img(src = report_plot_uri(ml_explanation_plot, height = 6), alt = "Décomposition locale DALEX de l'AUC24 ML")
            )
          },
          h2("Distribution prédictive"),
          p(tx(
            paste0("Médiane ", format_metric(result$distribution$median), " · intervalle prédictif ", result$distribution$interval_level, " % : ", format_metric(result$distribution$lower), "–", format_metric(result$distribution$upper), "."),
            paste0("Median ", format_metric(result$distribution$median), " · ", result$distribution$interval_level, "% prediction interval: ", format_metric(result$distribution$lower), "–", format_metric(result$distribution$upper), ".")
          )),
          h2("Sensibilité du model averaging"),
          report_table(sensitivity_table),
          h2("Modèles et pondérations"),
          report_table(model_table),
          h2("Administrations"),
          report_table(dose_table),
          h2("Concentrations et covariables"),
          report_table(observation_table),
          h2("Références"),
          tags$ul(references),
          h2("Traçabilité"),
          p(class = "provenance", provenance$r),
          p(class = "provenance", paste0("mrgsolve ", provenance$packages$mrgsolve, " · mapbayr ", provenance$packages$mapbayr, " · shiny ", provenance$packages$shiny)),
          tags$strong("Empreintes SHA-256 des modèles"),
          tags$ul(class = "provenance", model_fingerprints),
          tags$strong("Hypothèses"),
          tags$ul(lapply(provenance$assumptions, tags$li)),
          p(class = "provenance", ml_status_message(result$ml_status, current_language())),
          div(
            class = "warning",
            tags$strong("Prototype de recherche et d'enseignement"),
            p("Ce rapport ne constitue pas une prescription ni une recommandation clinique validée. Vérifiez les données, unités, horaires, voie d'administration, population source et limites du modèle. Toute décision reste sous la responsabilité du professionnel de santé.")
          )
        )
      ), current_language())
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
    english <- identical(current_language(), "en")
    table <- MODEL_CATALOG[, c(if (english) "drugEn" else "drug", "model", "routes", "citation", if (english) "populationEn" else "population", "doi", if (english) "modelTypeEn" else "modelType", "sourceStatus")]
    table$routes <- vapply(table$routes, function(routes) paste(routes, collapse = " + "), character(1))
    has_doi <- !is.na(table$doi) & nzchar(table$doi)
    table$doi <- ifelse(
      has_doi,
      paste0('<a href="https://doi.org/', table$doi, '" target="_blank" rel="noopener noreferrer">', table$doi, "</a>"),
      tx("Source à confirmer", "Source to be confirmed")
    )
    table$sourceStatus <- ifelse(table$sourceStatus == "verified", tx("Vérifiée", "Verified"), ifelse(table$sourceStatus == "secondary", tx("Secondaire", "Secondary"), tx("À confirmer", "To be confirmed")))
    datatable(
      table,
      rownames = FALSE,
      filter = "top",
      escape = FALSE,
      options = list(pageLength = 20, scrollX = TRUE),
      colnames = app_t(current_language(), c("Molécule", "Modèle", "Voie", "Article source", "Population de l'article", "DOI", "Type", "Statut bibliographique"))
    )
  })
}

shinyApp(ui = app_ui, server = server)
