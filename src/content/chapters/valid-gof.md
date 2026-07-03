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
quiz:
  - prompt: "Sur un graphique observations vs prédictions, un bon modèle donne..."
    options:
      - "un nuage symétrique autour de la diagonale (identité)"
      - "des points tous au-dessus de la diagonale"
      - "une droite horizontale"
    correct: 0
  - prompt: "Une tendance des CWRES en fonction du temps indique..."
    options:
      - "une mauvaise spécification du modèle structural"
      - "un bon ajustement"
      - "une erreur d'unité"
    correct: 0
  - prompt: "Les CWRES bien spécifiés doivent être..."
    options:
      - "centrés sur 0, sans tendance, majoritairement dans ±2"
      - "tous positifs"
      - "croissants avec le temps"
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
Si les points **DV vs PRED** s'incurvent (le modèle sous-prédit les fortes concentrations), le modèle structural est en cause : peut-être manque-t-il un compartiment ou une non-linéarité.

Une tendance des **CWRES au cours du temps** (positifs tôt, négatifs tard) trahit une mauvaise phase d'absorption ou d'élimination.
<!-- /step -->

<!-- step:title="Piège fréquent" -->
Un beau IPRED vs DV ne suffit pas.

:::pitfall
Les graphiques **individuels** (IPRED) peuvent sembler parfaits par **surajustement** (shrinkage élevé) alors que le modèle de population est mauvais. Toujours regarder les diagnostics **population** (PRED, CWRES) et se méfier d'un shrinkage important.
:::
<!-- /step -->

<!-- step:title="À retenir" -->
- Les GOF révèlent visuellement les biais d'un modèle.
- DV vs PRED/IPRED : nuage sur la diagonale ; CWRES : centrés sur 0, sans tendance.
- Une tendance des CWRES = mauvaise spécification structurale ou résiduelle.
- Méfiance : un IPRED parfait peut venir d'un shrinkage élevé.
<!-- /step -->
