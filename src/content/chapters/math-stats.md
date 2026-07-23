---
id: "math-stats"
slug: "math-stats"
title: "Statistiques utilisées en pharmacométrie"
description: "Distributions, variance, intervalles de confiance, tests et p-values : le langage statistique du domaine."
summary: "Les statistiques essentielles : loi normale et log-normale, variance, IC, tests d'hypothèse et corrélation."
track: "math"
order: 23
duration: "13 min"
level: "intermediate"
tags: ["maths", "statistics", "distributions", "confidence-interval"]
slides: []
sources: ["wilks-1938", "asa-pvalue", "davidian-giltinan", "mould-upton"]
reviewed_on: "2026-07-09"
quiz:
  - prompt: "Une clairance individuelle est souvent modélisée par une loi..."
    options:
      - "log-normale (positive, asymétrique)"
      - "normale, symétrique autour de sa valeur moyenne"
      - "exponentielle, décroissante depuis zéro"
    correct: 0
  - prompt: "Un intervalle de confiance à 95 % signifie que..."
    options:
      - "la procédure capture le vrai paramètre 95 fois sur 100 en répétant l'étude"
      - "le vrai paramètre a 95 % de probabilité d'être dans cet intervalle"
      - "95 % des observations individuelles tombent dans cet intervalle"
    correct: 0
  - prompt: "Une p-value faible indique..."
    options:
      - "des données peu probables sous l'hypothèse nulle"
      - "que l'effet observé est de grande taille"
      - "que l'hypothèse nulle est probablement fausse"
    correct: 0
---

<!-- step:title="Pourquoi ce chapitre" -->
La pharmacométrie **est** de la statistique appliquée : distributions de paramètres, variabilité, incertitude d'estimation, tests de covariables. Maîtriser ce vocabulaire évite les contresens (confondre variabilité et incertitude, effet et significativité).

Ce chapitre rassemble les outils utilisés partout dans le cours.
<!-- /step -->

<!-- step:title="Intuition" viz="03_PopulationDistrib" -->
Deux idées à distinguer : la **variabilité** (les patients diffèrent) et l'**incertitude** (on estime mal un paramètre avec peu de données).

Les paramètres PK positifs (CL, V) varient de façon **asymétrique** : d'où la loi **log-normale**. Les erreurs de mesure, elles, sont souvent supposées **normales**.
<!-- /step -->

<!-- step:title="La formule décortiquée" viz="03_PopulationDistrib" -->
Une clairance individuelle s'écrit typiquement :

$$ CL_i = CL_{pop}\cdot e^{\eta_i}, \qquad \eta_i \sim \mathcal{N}(0,\omega^2) $$

Sur l'échelle log, $\ln CL_i$ est **normale** de variance $\omega^2$ ; le **CV** approché vaut $\sqrt{e^{\omega^2}-1}\approx\omega$ pour $\omega$ petit.

:::math
Un **intervalle de confiance** à 95 % d'un paramètre $\hat\theta$ : $\hat\theta \pm 1{,}96\cdot SE(\hat\theta)$. Le **SE** vient de la précision d'estimation (voir la matrice de Fisher, chapitre suivant).
:::
<!-- /step -->

<!-- step:title="Exemple concret" viz="13_ResidualError" -->
On compare deux modèles emboîtés par un **test du rapport de vraisemblance** : la différence d'OFV ($-2\log L$) suit approximativement un $\chi^2$. Ajouter une covariable qui fait chuter l'OFV de 3,84 (1 ddl) est « significatif » à 5 %.

Mais **significatif ≠ pertinent** : un effet minuscule peut être significatif sur un gros jeu de données.
<!-- /step -->

<!-- step:title="Piège fréquent" -->
La p-value n'est pas la probabilité que l'hypothèse soit vraie.

:::pitfall
Une p-value mesure la **surprise des données** sous l'hypothèse nulle, pas la taille de l'effet ni sa pertinence clinique. Et corréler n'est pas expliquer : deux covariables corrélées (poids, ClCr) peuvent se substituer l'une à l'autre. Regardez toujours l'**amplitude** et son intervalle de confiance.
:::
<!-- /step -->

<!-- step:title="À retenir" -->
- Distinguer variabilité (entre patients) et incertitude (d'estimation).
- Paramètres positifs → loi log-normale ; erreur résiduelle → souvent normale.
- IC 95 % ≈ estimation ± 1,96·SE ; test du rapport de vraisemblance (ΔOFV ~ χ²).
- Significatif n'est pas pertinent ; toujours regarder l'amplitude de l'effet.
<!-- /step -->
