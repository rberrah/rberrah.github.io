---
id: "pmetrics-nonparametric"
slug: "pmetrics-nonparametric"
title: "Modélisation non paramétrique avec Pmetrics"
description: "Construire, compiler et ajuster un premier modèle NPAG avec Pmetrics en R."
summary: "Un parcours pratique de PM_data et PM_model jusqu'aux points de support estimés par NPAG."
track: "core"
order: 8.3
duration: "22 min"
level: "advanced"
tags: ["Pmetrics", "NPAG", "NPOD", "nonparametric", "R", "population PK"]
prerequisites: ["parametric-vs-nonparametric", "outils-estimation"]
glossary: ["NPAG", "NPOD", "Point de support", "Distribution mélangeante", "Vraisemblance"]
slides: []
sources: ["pmetrics", "neely-pmetrics", "yamada-npag"]
software_verified_on: "2026-10-12"
software_version: "Pmetrics 3.2.6"
reviewed_on: "2026-10-12"
review_type: "author"
review_pending: true
reviewed_hash: "87e8d5446c855f14801c8072fe2f8474ab13af76d73195ab1320dcbb05c7a653"
quiz:
  - prompt: "Dans Pmetrics, ab(0.02, 0.5) définit pour NPAG..."
    options:
      - "les bornes absolues de recherche du paramètre"
      - "un intervalle de confiance à 95 %"
      - "une loi normale de moyenne 0.02 et d'écart-type 0.5"
    correct: 0
  - prompt: "Quel objet Pmetrics associe les données au format attendu ?"
    options:
      - "PM_data"
      - "PM_model"
      - "PM_result"
    correct: 0
  - prompt: "Le code exporté par le Traducteur de modèles suffit-il à lancer une analyse NPAG définitive ?"
    options:
      - "non, il faut vérifier les bornes, l'erreur, les données et les choix statistiques"
      - "oui, les valeurs du schéma constituent automatiquement les priors définitifs"
      - "oui, si le modèle contient un seul compartiment"
    correct: 0
  - prompt: "Deux régions de points de support apparaissent après un ajustement NPAG. Que peut-on conclure ?"
    options:
      - "c'est un signal de multimodalité à vérifier, pas la preuve de deux phénotypes"
      - "deux phénotypes biologiques sont démontrés"
      - "le nombre de régions est toujours égal au nombre de covariables manquantes"
    correct: 0
---

<!-- step:title="Pourquoi ce chapitre" -->
Pmetrics fournit dans R des outils de modélisation de population **paramétrique et non paramétrique**. Son moteur NPAG estime une distribution jointe discrète des paramètres, représentée par des points de support pondérés.

Ce chapitre montre le flux minimal moderne : données, modèle, compilation, ajustement et lecture du résultat. Il ne remplace pas la préparation des données ni la validation du modèle.
<!-- /step -->

<!-- step:title="Intuition" viz="NPAGSupportPoints" -->
Le flux Pmetrics repose sur trois objets :

1. `PM_data` valide et organise les événements, doses, observations et covariables ;
2. `PM_model` contient paramètres, équations, sorties et erreur ;
3. `PM_result` contient l'ajustement, notamment les points de support et leurs probabilités.

La création de `PM_model` prépare et compile le modèle. L'appel à `$fit()` combine ensuite le modèle et les données avec l'algorithme choisi, par défaut NPAG. `NPrun()` appartient à l'interface historique ; le cours utilise l'API actuelle `PM_data` / `PM_model` / `PM_result`.

:::key
Compiler le modèle vérifie sa syntaxe et sa structure. Cela ne prouve ni son identifiabilité, ni sa pertinence pharmacologique, ni sa transportabilité.
:::
<!-- /step -->

<!-- step:title="La formule décortiquée" -->
NPAG cherche une distribution :

$$ \widehat F = \sum_{k=1}^{K} w_k\delta_{\theta_k} $$

qui maximise la vraisemblance des observations. Dans Pmetrics, une déclaration comme :

```r
Ke = ab(0.02, 0.5)
```

définit les **bornes absolues** explorées par NPAG pour `Ke`. Ce n'est pas un intervalle de confiance. Des bornes trop étroites tronquent la recherche ; des bornes démesurées peuvent rendre l'exploration inefficace ou favoriser des solutions peu plausibles.

Le modèle d'erreur pondère aussi la contribution de chaque observation. Il doit traduire l'erreur analytique et la discordance résiduelle de façon défendable.

Un point de support est un **vecteur complet de paramètres** associé à un poids. Ce n'est ni un patient, ni un cluster clinique, ni un phénotype. Le nombre de points finaux n'est donc pas un décompte de sous-populations. La propriété « au plus un point par sujet » concerne la construction NPAG ; elle ne doit pas être généralisée à toute estimation non paramétrique.
<!-- /step -->

<!-- step:title="Exemple concret" -->
Voici un modèle IV à un compartiment conforme à l'interface actuelle de Pmetrics :

```r
library(Pmetrics)

mod <- PM_model$new(
  pri = list(
    ke = ab(0.02, 0.5),
    v  = ab(10, 100)
  ),
  eqn = function() {
    dx[1] <- b[1] + rateiv[1] - ke * x[1]
  },
  out = function() {
    y[1] <- x[1] / v
  },
  err = list(
    proportional(1, c(0.05, 0.10, 0, 0))
  )
)

dat <- PM_data$new("data.csv", quiet = TRUE)
fit <- mod$fit(
  data = dat, path = "npag-run", run = 1,
  algorithm = "NPAG", cycles = 100,
  prior = "sobol", points = 200, seed = 22
)
```

Après l'ajustement, `fit$final$popPoints` contient les valeurs des paramètres de chaque point de support et la colonne `prob` contient son poids. Il faut ensuite examiner convergence, prédictions, résidus, plausibilité des points, incertitude et validation.

L'entrée `b[1]` accepte les bolus (durée nulle), `rateiv[1]` les perfusions. Les doses sont en mg, les temps en heures, `ke` en h⁻¹ et `v` en L : la sortie est donc en mg/L. Le raccourci `one_comp_iv` de la bibliothèque ne doit pas remplacer sans vérification cette équation qui accepte les deux entrées.

`msd(m, s)` est une autre manière de définir les bornes : pour NPAG, il fournit l'intervalle `m ± 3s`, pas une obligation de distribution normale. `proportional(1, c(0.05, 0.10, 0, 0))` définit un polynôme d'erreur analytique et un facteur gamma initial ; ce n'est pas une matrice SIGMA de mrgsolve. Par défaut, ce facteur est estimable pendant l'ajustement de population.

:::note
Le nombre de points finaux est un résultat numérique de l'estimation. Il ne doit pas être lu directement comme un nombre de phénotypes cliniques.
:::
<!-- /step -->

<!-- step:title="Exemple officiel reproductible" -->
Pmetrics 3.2.6 distribue un jeu tutoriel de 51 sujets, `bimodal_ke.csv`, avec deux formulations officielles du même modèle IV à un compartiment : le raccourci analytique `one_comp_iv` et une équation ODE explicite.

**Version réellement testée ici : 3.2.6.** C'est la dernière release GitHub étiquetée lors de la vérification du 12 octobre 2026 et la version épinglée dans la CI native. La documentation en ligne de développement mentionne déjà une dépréciation introduite en 3.2.7 : la colonne d'occasion `block` devient `occasion`, avec mise à niveau des anciens objets par `PM_upgrade()`. Aucun exemple actif de ce cours n'utilise cette colonne ; tout nouvel exemple doit employer `occasion`, et une ancienne fixture utilisant `block` ne doit être dite compatible qu'après test avec la version concernée.

PMx Explain charge ce fichier directement depuis le paquet installé, sans recopier les données. Le script `tdm-engine/benchmarks/pmetrics_official_example.R` reprend les bornes `ke = [0,001 ; 3] h⁻¹`, `v = [25 ; 250] L`, l'erreur additive officielle, la graine 22 et l'ajustement NPAG. Il vérifie les poids, les bornes et compare les moyennes populationnelles des deux formulations.

Avec la configuration officielle complète (2028 points Sobol, 1000 cycles), l'écart relatif maximal observé le 11 octobre 2026 est de **0,025 %**, pour une tolérance préspécifiée de 2 %. Ce résultat vérifie la reproduction logicielle des deux formulations dans cet environnement ; il ne constitue ni une validation clinique ni une preuve de multimodalité biologique.

Source redistribuable : [exemples officiels Pmetrics 3.2.6](https://github.com/LAPKB/Pmetrics/tree/v3.2.6/inst/Examples).
<!-- /step -->

<!-- step:title="NPAG et NPOD" -->
Pmetrics propose notamment deux algorithmes non paramétriques :

| Algorithme | Principe pratique | Point de vigilance |
|---|---|---|
| **NPAG** | recherche adaptative sur une grille de points puis optimisation des poids | résultat sensible aux bornes, au modèle d'erreur et à l'information contenue dans les données |
| **NPOD** | optimisation non paramétrique fondée sur les gradients de vraisemblance | algorithme distinct, encore en développement actif et potentiellement plus sensible aux minima locaux |

Ils estiment tous deux une distribution mélangeante discrète, mais ne doivent pas être supposés interchangeables. Comparez convergence, stabilité entre initialisations, vraisemblance prédictive et performance pour l'usage prévu. Pmetrics utilise `algorithm = "NPAG"` par défaut ; NPOD doit être demandé explicitement et traité comme expérimental dans PMx Explain.

**NPAG est une méthode, pas un synonyme de Pmetrics.** Pmetrics fournit une implémentation historique et spécialisée de NPAG ainsi que NPOD. nlmixr2 7 propose aussi `est = "npag"` et une méthode bayésienne non paramétrique `est = "npb"`, actuellement décrites par ses auteurs comme expérimentales. Les interfaces, diagnostics et niveaux de maturité diffèrent : cette proximité de noms ne justifie ni interchangeabilité automatique ni classement entre logiciels.
<!-- /step -->

<!-- step:title="Du Traducteur à Pmetrics" -->
Le **Traducteur de modèles** de PMx Explain peut importer un modèle Pmetrics représentable par les blocs Lego et exporter un squelette Pmetrics 3.

L'export conserve la structure, les covariables représentables, les équations, les sorties et une traduction explicite de l'erreur lorsqu'elle est compatible. Les valeurs du Builder sont exportées comme points de départ déterministes : avant un ajustement NPAG, il faut remplacer ou élargir ces valeurs par des intervalles `ab(min, max)` scientifiquement justifiés.

Une condition ou une équation que les blocs ne peuvent pas représenter fidèlement doit rester dans Pmetrics. Le traducteur refuse alors la conversion partielle plutôt que de modifier silencieusement le modèle.
<!-- /step -->

<!-- step:title="Piège fréquent" -->
Un ajustement qui converge n'est pas nécessairement fiable.

:::pitfall
Vérifiez les unités, l'affectation des entrées `B[]` et `R[]`, les compartiments observés `Y[]`, les bornes `ab()`, les coefficients d'erreur, les covariables et les temps d'événements. Une erreur à l'un de ces niveaux peut produire une distribution numérique apparemment propre mais scientifiquement fausse.
:::

Ne comparez pas une estimation paramétrique et NPAG uniquement par leur apparence. Utilisez des diagnostics comparables et une validation adaptée à l'objectif.
<!-- /step -->

<!-- step:title="Réutiliser une distribution pour le TDM" -->
Une individualisation exige un **modèle structurel, son modèle d'erreur et les points de support pondérés estimés en population**. Les seules bornes `ab()` ne constituent pas cette distribution.

Dans le moteur TDM, le backend Pmetrics appelle `PM_model$map()` avec un prior pondéré. Les positions des points restent fixées ; leurs probabilités sont actualisées par les concentrations du patient. Ce n'est pas un nouvel ajustement NPAG de population. La courbe centrale utilise les paramètres moyens postérieurs ; les simulations d'incertitude tirent des couples de paramètres parmi les points, avec leurs poids, sans les remplacer par une loi normale. La moyenne des paramètres, le point le plus probable et la moyenne des courbes ne sont généralement pas identiques.

```text
distribution populationnelle
        ↓
points de support + poids
        ↓
concentration du patient
        ↓
poids postérieurs via PM_model$map()
        ↓
distribution individuelle
        ↓
prédiction d'exposition
```

Une simulation qui tire directement un point conserve la distribution discrète estimée. Une simulation semi-paramétrique peut ajouter une dispersion locale autour de chaque point ; elle crée alors un mélange continu qui n'est plus la distribution NPAG originale. Les deux sorties doivent être nommées séparément.

Les trois artefacts disponibles sont des **démonstrations synthétiques** IV à un compartiment, orale à un compartiment et IV à deux compartiments ; ce ne sont pas des distributions estimées dans des articles. Les covariables ne sont pas encore prises en charge par ce backend. Les données et fichiers d'ajustement sont temporaires ; les artefacts de démonstration publics ne contiennent pas de données patients.

**Disponibilité vérifiée le 12 octobre 2026 :** backend natif testé localement et présent dans le dépôt. Un test navigateur du moteur public confirme que la source Pmetrics n'y est pas disponible. Il ne s'agit pas d'une incompatibilité générale entre Pmetrics et Shiny : le déploiement Shinyapps.io testé reste bloqué par la version Rust/Cargo de son image de construction. Aucune ancienne version de Pmetrics n'a été imposée pour contourner ce blocage. Le traducteur Pmetrics et ce cours restent accessibles sur le site.
<!-- /step -->

<!-- step:title="À retenir" -->
- `PM_data` porte les données, `PM_model` le modèle et `PM_result` l'ajustement.
- `PM_model$new()` prépare et compile le modèle ; `$fit(..., algorithm = "NPAG")` estime la distribution.
- NPAG et NPOD sont deux algorithmes distincts ; NPOD reste expérimental dans PMx Explain.
- `ab(min, max)` fixe des bornes absolues pour la recherche non paramétrique.
- Les points de support et leurs poids décrivent la distribution estimée, pas automatiquement des groupes biologiques.
- Le code du traducteur est un point de départ à vérifier, pas une analyse de population prête à publier.
<!-- /step -->
