---
id: "ai-boosting"
slug: "ai-boosting"
title: "Gradient boosting : XGBoost et CatBoost"
description: "Additionner de petits arbres qui corrigent les erreurs du précédent : les modèles qui gagnent sur données tabulaires."
summary: "Gradient boosting, XGBoost (régularisé, second ordre) et CatBoost (boosting ordonné, catégories)."
track: "ai"
order: 15
duration: "14 min"
level: "advanced"
tags: ["ai", "xgboost", "catboost", "gradient-boosting"]
slides: []
quiz:
  - prompt: "Le principe du gradient boosting est de..."
    options:
      - "ajouter séquentiellement des arbres qui corrigent les résidus (le gradient)"
      - "moyenner des arbres indépendants"
      - "entraîner un seul très grand arbre"
    correct: 0
  - prompt: "Par rapport au gradient boosting classique, XGBoost ajoute surtout..."
    options:
      - "une régularisation et une optimisation au second ordre"
      - "la suppression des covariables"
      - "un modèle linéaire obligatoire"
    correct: 0
  - prompt: "CatBoost est particulièrement adapté quand..."
    options:
      - "il y a beaucoup de variables catégorielles"
      - "il n'y a aucune donnée"
      - "la réponse est constante"
    correct: 0
---

<!-- step:title="Pourquoi ce chapitre" -->
Sur les données **tabulaires**, les méthodes de **gradient boosting** (XGBoost, CatBoost, LightGBM) sont souvent les plus performantes — au point d'être le premier réflexe en compétition et de plus en plus utilisées en pharmacométrie (estimation d'AUC, TDM).

Elles reposent sur les arbres du chapitre précédent, mais assemblés autrement.
<!-- /step -->

<!-- step:title="Intuition" viz="40_TreeEnsemble" -->
Là où la forêt **moyenne** des arbres indépendants, le boosting les ajoute **séquentiellement** : chaque nouvel arbre corrige les **erreurs** (résidus) laissées par la somme des précédents.

Passez le module en mode « Boosting » et augmentez les itérations : l'ajustement s'affine pas à pas, comme une mise au point progressive.
<!-- /step -->

<!-- step:title="La formule décortiquée" viz="40_TreeEnsemble" -->
On construit le modèle **additif** par étapes. À l'itération $m$ :

$$ F_m(x) = F_{m-1}(x) + \nu\, h_m(x) $$

où $h_m$ ajuste le **gradient négatif** de la perte (les résidus pour une perte quadratique) et $\nu$ est le **taux d'apprentissage**. **XGBoost** minimise un objectif **régularisé** avec une approximation au **second ordre** :

$$ \mathcal{L} = \sum_i \ell(y_i,\hat y_i) + \sum_k \Omega(f_k),\qquad \Omega(f)=\gamma T + \tfrac{1}{2}\lambda\lVert w\rVert^2 $$

**CatBoost** ajoute le *boosting ordonné* (réduit le biais de fuite) et un traitement natif des **variables catégorielles**.

:::note
Réf. : Friedman J.H., *Greedy function approximation* (gradient boosting), Ann. Statist. 2001 ; Chen & Guestrin, *XGBoost*, KDD 2016 ; Prokhorenkova et al., *CatBoost*, NeurIPS 2018. Fondations sur les arbres : **MLU-Explain**, https://mlu-explain.github.io.
:::
<!-- /step -->

<!-- step:title="Exemple concret" viz="40_TreeEnsemble" -->
Pour prédire une **exposition** à partir de covariables et de prélèvements épars, un XGBoost bien réglé (profondeur faible, $\nu$ petit, beaucoup d'arbres) atteint souvent une meilleure précision qu'un modèle bayésien — à condition d'une base d'apprentissage riche.

CatBoost brille quand des covariables sont **catégorielles** (centre, formulation, génotype codé en classes).
<!-- /step -->

<!-- step:title="Piège fréquent" -->
Le boosting surajuste vite si on le laisse faire.

:::pitfall
Trop d'arbres, un $\nu$ trop grand ou des arbres trop profonds → le modèle apprend le **bruit**. Il faut une **validation** honnête (arrêt précoce, validation croisée) et se méfier des scores optimistes évalués sur les données d'entraînement.
:::
<!-- /step -->

<!-- step:title="À retenir" -->
- Boosting = arbres ajoutés séquentiellement, chacun corrigeant les résidus (le gradient).
- $F_m = F_{m-1} + \nu\,h_m$ ; le taux d'apprentissage $\nu$ contrôle la vitesse.
- XGBoost : objectif régularisé + second ordre ; CatBoost : boosting ordonné + catégories.
- Puissant sur données tabulaires, mais surajuste sans validation (arrêt précoce).
<!-- /step -->
