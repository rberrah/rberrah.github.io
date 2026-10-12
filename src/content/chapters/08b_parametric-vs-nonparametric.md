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
glossary: ["Effets mixtes", "Vraisemblance", "Distribution mélangeante", "NPAG", "NPOD", "Point de support"]
slides: []
sources: ["goutelle-parametric-nonparametric", "neely-pmetrics", "yamada-npag"]
reviewed_on: "2026-09-28"
review_type: "author"
review_pending: true
reviewed_hash: "6c23f6afe1aa871a444e5c285f8328e3249bb7f41bcf558d327306cef3eae440"
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

<!-- step:title="Intuition" viz="NPAGSupportPoints" -->
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

En pratique, une approche non paramétrique est particulièrement informative lorsqu'une forme imposée masque une asymétrie ou une multimodalité reproductible. Une approche paramétrique reste souvent préférable avec peu de données, lorsque la distribution choisie est adéquate ou lorsque la parcimonie et la stabilité priment. « Non paramétrique » ne signifie donc ni sans modèle, ni automatiquement plus flexible au sens utile, ni automatiquement meilleur.
<!-- /step -->

<!-- step:title="Benchmark à vérité connue" -->
Un benchmark reproductible a utilisé le même modèle IV à un compartiment, la même erreur et les mêmes temps pour trois distributions vraies de clairance. Le modèle de population est ajusté sur 90 sujets ; chez 180 sujets indépendants, la concentration à 1 h actualise la distribution individuelle avant de prédire celle à 8 h. NPAG est lancé avec deux graines et 40 ou 80 points initiaux.

| Distribution vraie | Méthode | Log-vraisemblance prédictive moyenne | Biais (mg/L) | RMSE (mg/L) | MAE (mg/L) | Couverture 90 % |
|---|---|---:|---:|---:|---:|---:|
| Log-normale | Paramétrique | -0,214 | 0,032 | 0,282 | 0,226 | 91,7 % |
| Log-normale | NPAG | -0,201 | 0,008 | 0,281 | 0,223 | 90,0 % |
| Asymétrique | Paramétrique | -0,526 | 0,051 | 0,361 | 0,282 | 83,9 % |
| Asymétrique | NPAG | -0,416 | 0,027 | 0,357 | 0,280 | 86,7 % |
| Bimodale | Paramétrique | -0,515 | 0,042 | 0,454 | 0,378 | 87,2 % |
| Bimodale | NPAG | -0,121 | 0,031 | 0,455 | 0,361 | 87,8 % |

Dans le contrôle log-normal, les RMSE sont pratiquement identiques : NPAG n'est pas nécessairement meilleur. Dans le scénario bimodal, il améliore nettement la vraisemblance prédictive et la MAE, mais pas la RMSE. Les deux initialisations NPAG donnent les mêmes métriques arrondies malgré un nombre final de points différent. Ces résultats sont conditionnels à ce modèle, ce dessin et cette erreur synthétiques ; ils ne constituent pas une validation clinique.
<!-- /step -->

<!-- step:title="Quand utiliser le non paramétrique ?" -->
Une représentation non paramétrique peut être utile pour examiner une asymétrie ou une multimodalité reproductible, une population hétérogène, ou un TDM qui doit conserver la distribution jointe complète. Elle reste conditionnelle au modèle structural, aux covariables, à l'erreur, aux bornes et au dessin.

Une représentation paramétrique peut rester préférable lorsque l'information est faible, qu'une forme simple décrit correctement les données, que la parcimonie stabilise l'estimation ou qu'un workflow exige une paramétrisation standard facilement communicable. Le choix est une question d'**adéquation à l'usage** : diagnostics et performances held-out priment sur l'étiquette de la méthode.
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
