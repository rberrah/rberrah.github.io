---
id: "valid-gof"
slug: "valid-gof"
title: "Graphiques diagnostiques (GOF)"
description: "Lire un modèle à l'œil : observations vs prédictions, résidus CWRES et détection des biais."
summary: "Les graphiques de goodness-of-fit : DV vs PRED/IPRED, CWRES vs temps/PRED, et ce qu'ils révèlent."
track: "valid"
order: 90
duration: "12 min"
level: "intermediate"
tags: ["validation", "diagnostic-plots", "gof", "residuals"]
slides: []
sources: ["hooker-cwres", "savic-karlsson-shrinkage", "mould-upton"]
reviewed_on: "2026-07-09"
quiz:
  - prompt: "Sur un graphique observations vs prédictions, un bon modèle donne..."
    options:
      - "un nuage symétrique et dispersé autour de la diagonale (identité)"
      - "un nuage incurvé passant sous la diagonale aux fortes valeurs"
      - "un alignement parfait, sans aucune dispersion autour de la droite"
    correct: 0
  - prompt: "Une tendance des CWRES en fonction du temps évoque d'abord..."
    options:
      - "une hypothèse de mauvaise spécification à explorer"
      - "un modèle d'erreur résiduelle mal dimensionné"
      - "une variance des effets aléatoires sous-estimée"
    correct: 0
  - prompt: "Les CWRES bien spécifiés doivent être..."
    options:
      - "centrés sur 0, sans tendance, majoritairement dans ±2"
      - "centrés sur 0 mais tous confinés dans ±1, sans exception"
      - "centrés sur 0, mais croissants avec la concentration prédite"
    correct: 0
---

<!-- step:title="Pourquoi ce chapitre" -->
Avant de faire confiance à un modèle, on le **regarde**. Les graphiques diagnostiques (goodness-of-fit, GOF) révèlent d'un coup d'œil les biais que les seuls chiffres masquent.

C'est la première étape — et souvent la plus parlante — de la validation d'un modèle.
<!-- /step -->

<!-- step:title="Intuition" viz="50_GOFPlots" -->
Deux questions simples : le modèle **prédit-il juste** ? Ses **erreurs sont-elles neutres** ?

Un bon modèle aligne observations et prédictions sur la **diagonale**, et laisse des résidus **centrés sur zéro**, sans structure. Montez la « mauvaise spécification » et voyez apparaître un biais systématique.
<!-- /step -->

<!-- step:title="La formule décortiquée" viz="50_GOFPlots" -->
Les graphiques canoniques :

- **DV vs PRED** (population) et **DV vs IPRED** (individuel) : nuage autour de l'identité $y=x$.
- **CWRES vs temps** et **CWRES vs PRED** : les résidus pondérés conditionnels doivent être **centrés sur 0**, sans tendance, ~95 % dans $[-2, 2]$.
- **|IWRES| vs PRED** : détecte une mauvaise **erreur résiduelle** (hétéroscédasticité).

:::note
Les **CWRES** (Hooker et al., *Pharm Res* 2007) remplacent les WRES car ils tiennent compte de la non-linéarité du modèle.
:::
<!-- /step -->

<!-- step:title="Exemple concret" viz="50_GOFPlots" -->
Si les points **DV vs PRED** s'incurvent (le modèle sous-prédit les fortes concentrations), le modèle structural devient suspect : peut-être manque-t-il un compartiment, une non-linéarité, une covariable ou une forme d'erreur adaptée.

Une tendance des **CWRES au cours du temps** (positifs tôt, négatifs tard) est compatible avec une mauvaise phase d'absorption ou d'élimination, mais ce n'est pas une signature unique.
<!-- /step -->

<!-- step:title="Cas pratique : lire les motifs" viz="62_ResidualPatterns" -->
Chaque **forme** de résidus oriente vers des hypothèses à tester : un **U** (ou U inversé) évoque souvent une mauvaise **structure** ; une **trompette** (nuage qui s'évase) évoque un **modèle d'erreur** inadapté ; une **pente** évoque un biais, parfois une **covariable manquante**.

Faites défiler les motifs. Le guide complet motif → cause → remède est détaillé dans le chapitre « Cas pratique : améliorer le modèle ».
<!-- /step -->

<!-- step:title="Piège fréquent" -->
Un beau IPRED vs DV ne suffit pas.

:::pitfall
Les graphiques **individuels** (IPRED) peuvent sembler parfaits alors que les EBE sont peu informatifs, notamment avec un **shrinkage** important. Le shrinkage n'est pas du surajustement en soi : il signale surtout que les diagnostics individuels portent peu d'information. Toujours regarder les diagnostics **population** (PRED, CWRES, VPC/NPDE).
:::
<!-- /step -->

<!-- step:title="À retenir" -->
- Les GOF révèlent visuellement les biais d'un modèle.
- DV vs PRED/IPRED : nuage sur la diagonale ; CWRES : centrés sur 0, sans tendance.
- Une tendance des CWRES suggère une mauvaise spécification structurale ou résiduelle, à confirmer.
- Méfiance : un IPRED parfait avec shrinkage élevé peut être peu informatif.
<!-- /step -->
