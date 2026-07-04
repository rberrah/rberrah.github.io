---
id: "valid-shrinkage"
slug: "valid-shrinkage"
title: "Le shrinkage : quand les EBE trompent"
description: "Pourquoi les estimations individuelles se replient vers la population — et ce que cela invalide."
summary: "Le shrinkage (eta et epsilon) : origine, mesure, conséquences sur les diagnostics et remèdes."
track: "valid"
order: 94
duration: "12 min"
level: "advanced"
tags: ["validation", "shrinkage", "ebe", "diagnostics"]
prerequisites: ["bayes-ebes", "math-bayes"]
glossary: ["Shrinkage", "EBE", "η", "ω / Ω", "Résidus (WRES/CWRES/IWRES/NPDE)"]
slides: []
quiz:
  - prompt: "Un eta-shrinkage élevé signifie que les EBE..."
    options:
      - "sont ramenés vers la moyenne de population (données individuelles peu informatives)"
      - "sont parfaitement estimés"
      - "n'existent pas"
    correct: 0
  - prompt: "Un epsilon-shrinkage élevé rend peu fiables..."
    options:
      - "les graphiques diagnostiques individuels (IPRED, IWRES)"
      - "la dose administrée"
      - "la valeur de la clairance de population"
    correct: 0
  - prompt: "Le eta-shrinkage se calcule par..."
    options:
      - "1 − SD(η̂) / ω"
      - "SD(η̂) × ω"
      - "la moyenne des concentrations"
    correct: 0
---

<!-- step:title="Pourquoi ce chapitre" -->
Les paramètres individuels d'un modèle de population ne sont pas mesurés : ils sont **estimés** (EBE, empirical Bayes estimates). Quand les données d'un patient sont pauvres, cette estimation se **replie vers la population** — c'est le **shrinkage**.

Ignorer ce phénomène conduit à sur-interpréter les EBE et à croire des diagnostics faussés. Ce chapitre approfondit ce qu'introduit le chapitre EBE du parcours fondamental.
<!-- /step -->

<!-- step:title="Intuition" viz="18_BayesianShrinkage" -->
Avec **beaucoup** de prélèvements, l'EBE reflète le vrai paramètre du patient. Avec **peu** de données, le modèle « ne voit pas » l'individu et rabat son estimation vers la **moyenne de population** (η̂ → 0).

Résultat : les EBE sont **artificiellement resserrés** autour de zéro. Réduisez l'information individuelle et regardez le nuage des η̂ se contracter.
<!-- /step -->

<!-- step:title="La formule décortiquée" viz="18_BayesianShrinkage" -->
Le **eta-shrinkage** compare la dispersion des EBE estimés à la variabilité du modèle $\omega$ :

$$ sh_\eta = 1 - \frac{SD(\hat\eta)}{\omega} $$

:::howto
**La métaphore de l'élastique.** Chaque estimation individuelle est reliée à la moyenne de population par un élastique. Beaucoup de données pour ce patient → l'élastique cède, l'estimation va où pointent ses données. Peu de données → l'élastique la ramène vers la population. Le shrinkage mesure **à quel point l'élastique a gagné**.

**Côté maths.** $SD(\hat\eta)$ est la dispersion **réelle** des écarts estimés ; $\omega$ est la dispersion que le modèle **attend**. Données riches : $SD(\hat\eta)\approx\omega$, donc $sh_\eta\approx 0$. Données pauvres : tous les $\hat\eta$ sont écrasés vers 0, $SD(\hat\eta)\to 0$, donc $sh_\eta\to 1$ (100 % de rétrécissement).
:::

- $sh_\eta \approx 0$ : les EBE couvrent bien la variabilité (données riches) ;
- $sh_\eta \to 1$ : tous les η̂ collent à 0 (données pauvres).

Le **epsilon-shrinkage** concerne l'erreur résiduelle, via les résidus individuels pondérés :

$$ sh_\varepsilon = 1 - SD(IWRES) $$

:::note
Réf. : Savic R.M. & Karlsson M.O., *AAPS J* 2009 — importance du shrinkage pour l'interprétation des diagnostics. Un shrinkage > 20–30 % est généralement jugé préoccupant.
:::
<!-- /step -->

<!-- step:title="Exemple concret" viz="18_BayesianShrinkage" -->
Un modèle avec **2 prélèvements par patient** donne un eta-shrinkage de 45 % sur la clairance : les η̂ sont massivement rabattus vers 0.

Conséquence directe : un graphique **η̂ vs covariable** (poids, ClCr) semble « plat » — non parce qu'il n'y a pas d'effet, mais parce que les η̂ sont écrasés. On peut **rater** une vraie covariable, ou en **inventer** une (corrélation fallacieuse).
<!-- /step -->

<!-- step:title="Piège fréquent" -->
Ne bâtissez pas un modèle de covariables sur des EBE rétrécis.

:::pitfall
Avec un shrinkage élevé, sélectionner des covariables sur les η̂ ou juger l'ajustement sur les graphiques **individuels** (IPRED, IWRES) est trompeur : ces diagnostics paraissent bons **par construction**. Il faut alors s'appuyer sur des diagnostics fondés sur la **simulation** (VPC, NPDE) et envisager de **simplifier** la variabilité (retirer un η mal identifié) ou d'enrichir l'échantillonnage.
:::
<!-- /step -->

<!-- step:title="À retenir" -->
- Les EBE se replient vers la population quand les données individuelles sont pauvres : c'est le shrinkage.
- eta-shrinkage = 1 − SD(η̂)/ω ; epsilon-shrinkage = 1 − SD(IWRES).
- Un shrinkage élevé (> 20–30 %) rend les diagnostics individuels et la sélection de covariables non fiables.
- Remèdes : diagnostics par simulation (VPC/NPDE), simplifier l'IIV, enrichir l'échantillonnage.
<!-- /step -->
