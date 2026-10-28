---
id: "ai-boosting"
slug: "ai-boosting"
title: "Gradient boosting : XGBoost et CatBoost"
description: "Additionner de petits arbres qui corrigent progressivement les erreurs : une famille puissante pour les données tabulaires."
summary: "Gradient boosting, XGBoost (régularisé, second ordre) et CatBoost (boosting ordonné, catégories)."
track: "ai"
order: 15
duration: "14 min"
level: "advanced"
tags: ["ai", "xgboost", "catboost", "gradient-boosting"]
prerequisites: ["ai-trees"]
glossary: ["XGBoost", "White / black / grey box"]
slides: []
sources: ["friedman-gbm", "chen-xgboost", "prokhorenkova-catboost", "woillard-ml-tacrolimus"]
reviewed_on: "2026-07-09"
review_type: "author"
review_pending: true
reviewed_hash: "5fc6c182d82d091ae9c7bb1533696a0b7c2bb2aa60524ba67bec742cbe3c4700"
quiz:
  - prompt: "Le principe du gradient boosting est de..."
    options:
      - "ajouter séquentiellement des arbres qui corrigent les résidus (le gradient)"
      - "moyenner des arbres profonds entraînés indépendamment en parallèle"
      - "entraîner un unique arbre très profond couvrant toutes les interactions"
    correct: 0
  - prompt: "Par rapport au gradient boosting classique, XGBoost ajoute surtout..."
    options:
      - "une régularisation et une optimisation au second ordre"
      - "une agrégation bootstrap des arbres pour réduire la variance"
      - "un élagage systématique de chaque arbre après l'entraînement"
    correct: 0
  - prompt: "CatBoost est particulièrement adapté quand..."
    options:
      - "il y a beaucoup de variables catégorielles"
      - "il y a de très nombreuses variables numériques continues"
      - "le jeu de données est trop petit pour tout autre modèle"
    correct: 0
---

<!-- step:title="Pourquoi ce chapitre" -->
Sur les données **tabulaires**, les méthodes de **gradient boosting** (XGBoost, CatBoost, LightGBM) sont des références prédictives fréquentes. Leur performance dépend néanmoins du jeu de données, du réglage, de la validation et du comparateur ; elles ne sont pas supérieures par principe à un modèle pharmacométrique.

Elles reposent sur les arbres du chapitre précédent, mais assemblés autrement.
<!-- /step -->

<!-- step:title="Intuition" viz="40_TreeEnsemble" -->
Une forêt fait la **moyenne** de plusieurs arbres. Le **boosting** fonctionne autrement : il part d'une première prédiction, puis ajoute un petit arbre pour l'améliorer. Avec une erreur quadratique, ce nouvel arbre cherche à corriger les écarts entre les valeurs prévues et les valeurs observées (les **résidus**).

**Exemple :** si le modèle prévoit une AUC de 80 alors que la valeur observée est 100, il manque 20. Un nouvel arbre peut apprendre à corriger une partie de cet écart. Cela ne garantit pas qu'il prédira aussi bien chez de nouveaux patients.

Passez le module en mode « Boosting » et augmentez les itérations : l'ajustement s'affine pas à pas, comme une mise au point progressive.
<!-- /step -->

<!-- step:title="La formule décortiquée" -->
On construit le modèle **additif** par étapes. À l'itération $m$ :

$$ F_m(x) = F_{m-1}(x) + \nu\, h_m(x) $$

Ici, $h_m$ est le nouvel arbre qui cherche à réduire l'erreur du modèle, et $\nu$ est un **petit coefficient** qui limite la correction ajoutée à chaque étape (le taux d'apprentissage). Le **gradient** indique dans quel sens modifier la prédiction pour réduire l'erreur ; avec une erreur quadratique, il est lié aux résidus. **XGBoost** ajoute des règles pour éviter des arbres inutilement compliqués (**régularisation**) et utilise aussi la courbure de l'erreur (**second ordre**) :

$$ \mathcal{L} = \sum_i \ell(y_i,\hat y_i) + \sum_k \Omega(f_k),\qquad \Omega(f)=\gamma T + \tfrac{1}{2}\lambda\lVert w\rVert^2 $$

**CatBoost** ajoute le *boosting ordonné* et un traitement natif des **variables catégorielles**, conçus notamment pour limiter le biais lié à l'utilisation de la cible lors de leur encodage.

:::note
Réf. : Friedman J.H., *Greedy function approximation* (gradient boosting), Ann. Statist. 2001 ; Chen & Guestrin, *XGBoost*, KDD 2016 ; Prokhorenkova et al., *CatBoost*, NeurIPS 2018. Fondations sur les arbres : **MLU-Explain**, https://mlu-explain.github.io.
:::
<!-- /step -->

<!-- step:title="Exemple concret" -->
Pour prédire une **exposition** à partir de covariables et de prélèvements épars, un XGBoost réglé dans les données d'entraînement peut être comparé à un estimateur bayésien sur des patients indépendants. L'un peut surpasser l'autre pour un dessin et une population donnés ; aucune hiérarchie générale ne peut être conclue sans cette comparaison.

CatBoost est conçu pour traiter directement des covariables **catégorielles** (centre, formulation, génotype codé en classes), mais celles qui identifient un centre peuvent aussi apprendre un effet non transportable.
<!-- /step -->

<!-- step:title="Piège fréquent" -->
Le boosting surajuste vite si on le laisse faire.

:::pitfall
Trop d'arbres, un $\nu$ trop grand ou des arbres trop profonds → le modèle apprend le **bruit**. Il faut une **validation** honnête (arrêt précoce, validation croisée) et se méfier des scores optimistes évalués sur les données d'entraînement.
:::
<!-- /step -->

<!-- step:title="À retenir" -->
- Boosting = ajouter des arbres l'un après l'autre pour réduire progressivement les erreurs de prédiction.
- $F_m = F_{m-1} + \nu\,h_m$ ; le taux d'apprentissage $\nu$ contrôle la vitesse.
- XGBoost : objectif régularisé + second ordre ; CatBoost : boosting ordonné + catégories.
- Puissant sur données tabulaires, mais surajuste sans validation (arrêt précoce).
<!-- /step -->
