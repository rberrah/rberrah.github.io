---
id: "pmetrics-nonparametric"
slug: "pmetrics-nonparametric"
title: "Modélisation non paramétrique avec Pmetrics"
description: "Construire, compiler et ajuster un premier modèle NPAG avec Pmetrics en R."
summary: "Un parcours pratique de PM_data et PM_model jusqu'aux points de support estimés par NPAG."
track: "core"
order: 8.3
duration: "18 min"
level: "advanced"
tags: ["Pmetrics", "NPAG", "nonparametric", "R", "population PK"]
prerequisites: ["parametric-vs-nonparametric", "outils-estimation"]
glossary: ["NPAG", "Point de support", "Vraisemblance"]
slides: []
sources: ["pmetrics", "neely-pmetrics", "yamada-npag"]
reviewed_on: "2026-09-29"
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
---

<!-- step:title="Pourquoi ce chapitre" -->
Pmetrics fournit dans R des outils de modélisation de population **paramétrique et non paramétrique**. Son moteur NPAG estime une distribution jointe discrète des paramètres, représentée par des points de support pondérés.

Ce chapitre montre le flux minimal moderne : données, modèle, compilation, ajustement et lecture du résultat. Il ne remplace pas la préparation des données ni la validation du modèle.
<!-- /step -->

<!-- step:title="Intuition" -->
Le flux Pmetrics repose sur trois objets :

1. `PM_data` valide et organise les événements, doses, observations et covariables ;
2. `PM_model` contient paramètres, équations, sorties et erreur ;
3. `PM_result` contient l'ajustement, notamment les points de support et leurs probabilités.

La création de `PM_model` prépare et compile le modèle. L'appel à `$fit()` combine ensuite le modèle et les données avec l'algorithme choisi, par défaut NPAG.

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
<!-- /step -->

<!-- step:title="Exemple concret" -->
Voici un modèle IV à un compartiment conforme à l'interface actuelle de Pmetrics :

```r
library(Pmetrics)

mod <- PM_model$new(
  pri = list(
    Ke = ab(0.02, 0.5),
    V  = ab(10, 100)
  ),
  eqn = function() {
    dX[1] = B[1] + R[1] - Ke * X[1]
  },
  out = function() {
    Y[1] = X[1] / V
  },
  err = list(
    proportional(1, c(0.05, 0.10, 0, 0))
  )
)

dat <- PM_data$new(data = "data.csv")
fit <- mod$fit(dat, algorithm = "NPAG", cycles = 100)
```

Après l'ajustement, `fit$final$popPoints` contient les valeurs des paramètres de chaque point de support et la colonne `prob` contient son poids. Il faut ensuite examiner convergence, prédictions, résidus, plausibilité des points, incertitude et validation.

L'entrée `B[1]` accepte les bolus (durée nulle), `R[1]` les perfusions. Les doses sont en mg, les temps en heures, `Ke` en h⁻¹ et `V` en L : la sortie est donc en mg/L. Le raccourci `one_comp_iv` de la bibliothèque ne doit pas remplacer sans vérification cette équation qui accepte les deux entrées.

`msd(m, s)` est une autre manière de définir les bornes : pour NPAG, il fournit l'intervalle `m ± 3s`, pas une obligation de distribution normale. `proportional(1, c(0.05, 0.10, 0, 0))` définit un polynôme d'erreur analytique et un facteur gamma initial ; ce n'est pas une matrice SIGMA de mrgsolve. Par défaut, ce facteur est estimable pendant l'ajustement de population.

:::note
Le nombre de points finaux est un résultat numérique de l'estimation. Il ne doit pas être lu directement comme un nombre de phénotypes cliniques.
:::
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

Le premier artefact disponible dans PMx Explain est une **démonstration synthétique IV à un compartiment**, pas une distribution estimée dans un article. Les autres structures et les covariables ne sont pas encore prises en charge par ce backend. Les données et fichiers d'ajustement sont temporaires ; les artefacts de démonstration publics ne contiennent pas de données patients.
<!-- /step -->

<!-- step:title="À retenir" -->
- `PM_data` porte les données, `PM_model` le modèle et `PM_result` l'ajustement.
- `PM_model$new()` prépare et compile le modèle ; `$fit(..., algorithm = "NPAG")` estime la distribution.
- `ab(min, max)` fixe des bornes absolues pour la recherche non paramétrique.
- Les points de support et leurs poids décrivent la distribution estimée, pas automatiquement des groupes biologiques.
- Le code du traducteur est un point de départ à vérifier, pas une analyse de population prête à publier.
<!-- /step -->
