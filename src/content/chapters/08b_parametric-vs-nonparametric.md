---
id: "parametric-vs-nonparametric"
slug: "parametric-vs-nonparametric"
title: "PK de population : paramétrique ou non paramétrique ?"
description: "Deux façons d'estimer la distribution des paramètres individuels, sans changer nécessairement le modèle PK."
summary: "Comprendre ce que paramétrique et non paramétrique désignent réellement, leurs hypothèses et leurs diagnostics."
track: "core"
order: 8.2
duration: "15 min"
level: "intermediate"
tags: ["population PK", "parametric", "nonparametric", "NPAG", "distribution"]
prerequisites: ["variabilite-iiv-iov", "outils-estimation"]
glossary: ["Effets mixtes", "Vraisemblance", "NPAG"]
slides: []
sources: ["goutelle-parametric-nonparametric", "neely-pmetrics", "yamada-npag"]
reviewed_on: "2026-09-28"
review_type: "author"
quiz:
  - prompt: "Dans ce contexte, paramétrique ou non paramétrique décrit surtout..."
    options:
      - "la représentation de la distribution des paramètres dans la population"
      - "le nombre de compartiments du modèle PK"
      - "le choix entre analyse compartimentale et NCA"
    correct: 0
  - prompt: "Une distribution NPAG avec deux groupes de points prouve-t-elle deux phénotypes biologiques ?"
    options:
      - "non, ce signal doit être confirmé et peut aussi refléter le modèle, les données ou l'erreur"
      - "oui, toute multimodalité estimée correspond à deux phénotypes"
      - "oui, dès que les deux groupes ont des poids différents"
    correct: 0
  - prompt: "Une méthode non paramétrique est-elle sans hypothèses ?"
    options:
      - "non, structure, covariables, erreur, bornes et qualité des données restent déterminantes"
      - "oui, elle apprend directement la vérité à partir des observations"
      - "oui, à condition d'utiliser assez de points de support"
    correct: 0
---

<!-- step:title="Pourquoi ce chapitre" -->
Le mot **non paramétrique** est souvent mal compris. Ici, il ne signifie ni NCA, ni absence de modèle PK, ni modèle sans paramètres.

Les deux approches peuvent partager exactement les mêmes compartiments, équations différentielles, covariables et modèle d'erreur. Ce qui change surtout est la façon de représenter et d'estimer la **distribution jointe des paramètres individuels** dans la population.
<!-- /step -->

<!-- step:title="Intuition" viz="03_PopulationDistrib" -->
Imaginons que chaque patient possède un couple $(CL_i,V_i)$.

- Une approche **paramétrique** décrit le nuage avec une famille de distributions et un nombre fini de paramètres, par exemple moyenne, variances et covariance après transformation logarithmique.
- Une approche **non paramétrique** estime des positions possibles dans l'espace $(CL,V)$ et le poids associé à chacune, sans imposer une forme gaussienne à ce nuage.

:::key
Le modèle PK explique les trajectoires concentration-temps. La distribution de population explique comment ses paramètres varient entre patients. Ce sont deux niveaux distincts du modèle.
:::
<!-- /step -->

<!-- step:title="La formule décortiquée" -->
Dans un modèle paramétrique courant :

$$ \log(\theta_i) \sim \mathcal N(\mu,\Omega) $$

La forme de la distribution est choisie, puis ses paramètres $(\mu,\Omega)$ sont estimés.

Une estimation non paramétrique de la distribution mélangeante peut s'écrire :

$$ \widehat F = \sum_{k=1}^{K} w_k\,\delta_{\theta_k}, \qquad w_k \ge 0,\quad \sum_k w_k=1 $$

Les $\theta_k$ sont les **points de support** et les $w_k$ leurs probabilités. Dans les deux cas, on cherche à maximiser une vraisemblance de population :

$$ L(F)=\prod_i \int p(y_i\mid\theta)\,dF(\theta) $$

:::math
« Non paramétrique » porte sur la forme de $F$. La structure de $p(y_i\mid\theta)$, le modèle d'erreur et les limites de l'espace des paramètres restent spécifiés par le modélisateur.
:::
<!-- /step -->

<!-- step:title="Exemple concret" -->
Supposons deux mécanismes d'élimination réellement présents dans une population, produisant deux zones de clairance.

| Question | Approche paramétrique | Approche non paramétrique |
|---|---|---|
| Distribution initialement envisagée | souvent unimodale après transformation | forme non imposée |
| Résultat de population | paramètres de la distribution choisie | points de support et poids |
| Multimodalité | nécessite un modèle de mélange explicite | peut apparaître dans la distribution estimée |
| Résumé individuel | posterior/MAP ou échantillons | posterior sur les points de support |

Une approche non paramétrique peut mieux faire apparaître une asymétrie, un patient atypique ou plusieurs modes. Une approche paramétrique peut être plus parcimonieuse, plus régulière et plus facile à communiquer lorsque son hypothèse de distribution est adéquate.

Le choix doit être comparé sur la stabilité, les diagnostics, la validation externe et la performance pour l'usage prévu, pas sur une préférence de logiciel.
<!-- /step -->

<!-- step:title="Piège fréquent" -->
Un groupe de points de support n'est pas automatiquement une sous-population clinique.

:::pitfall
Une multimodalité apparente peut provenir d'un petit effectif, d'un mauvais modèle structurel, de covariables omises, de bornes inadéquates ou d'un modèle d'erreur mal spécifié. Elle constitue une hypothèse à examiner, pas une preuve biologique.
:::

Inversement, supposer une loi log-normale ne rend pas un modèle faux par principe. Une hypothèse paramétrique raisonnable peut stabiliser l'estimation quand les données sont peu informatives.
<!-- /step -->

<!-- step:title="À retenir" -->
- Paramétrique et non paramétrique décrivent ici la **distribution de population**, pas les équations PK.
- NPAG représente cette distribution par des points de support pondérés.
- L'approche non paramétrique assouplit la forme de la distribution, mais ne supprime pas les autres hypothèses.
- Aucun résultat multimodal ne doit être interprété biologiquement sans diagnostics et confirmation.
- Le bon choix dépend des données, de la stabilité et de l'objectif prédictif ou clinique.
<!-- /step -->
