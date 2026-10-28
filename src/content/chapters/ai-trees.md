---
id: "ai-trees"
slug: "ai-trees"
title: "Arbres de décision et forêts aléatoires"
description: "De l'arbre unique (des marches) à la forêt aléatoire (une moyenne moins variable) : les briques du ML tabulaire."
summary: "Arbres CART, bagging, forêts aléatoires : comment on apprend des règles à partir de covariables."
track: "ai"
order: 14
duration: "14 min"
level: "intermediate"
tags: ["ai", "random-forest", "decision-tree", "machine-learning"]
prerequisites: ["math-stats"]
glossary: ["White / black / grey box", "XGBoost"]
slides: []
sources: ["breiman-rf", "efron-bootstrap", "hastie-esl"]
reviewed_on: "2026-07-09"
review_type: "author"
review_pending: true
reviewed_hash: "be6a274de7921f51b5849335a81c423aca670eee2d7da6ada37b796880103142"
quiz:
  - prompt: "Un arbre de décision seul produit une fonction..."
    options:
      - "en marches (constante par morceaux), qui tend à surajuster"
      - "linéaire par morceaux, avec une pente ajustée dans chaque zone"
      - "lisse et continue, obtenue en interpolant entre les feuilles"
    correct: 0
  - prompt: "Une forêt aléatoire améliore l'arbre unique en..."
    options:
      - "moyennant de nombreux arbres décorrélés (bagging + sous-ensembles de variables)"
      - "augmentant sans limite la profondeur d'un unique arbre très détaillé"
      - "élaguant agressivement un seul arbre pour réduire sa variance résiduelle"
    correct: 0
  - prompt: "L'importance des variables d'une forêt sert à..."
    options:
      - "repérer les covariables les plus prédictives"
      - "mesurer l'effet causal de chaque covariable sur la réponse"
      - "classer les patients selon leur profil de covariables"
    correct: 0
---

<!-- step:title="Pourquoi ce chapitre" -->
Les données pharmacométriques sont souvent **tabulaires** : covariables (poids, ClCr, génotype…) → une réponse (AUC, concentration, effet). Les **arbres** et les **forêts** apprennent directement des règles à partir de ces tableaux, sans modèle mécaniste.

Ce sont les briques de la plupart des méthodes de ML « classiques » utiles au TDM.
<!-- /step -->

<!-- step:title="Intuition" viz="40_TreeEnsemble" -->
Un **arbre** pose des questions successives (« ClCr < 60 ? ») et découpe l'espace en zones où la réponse est supposée constante : d'où une prédiction **en marches**.

Un arbre très détaillé peut aussi apprendre les particularités des patients étudiés au lieu d'apprendre une règle utile : c'est le **surajustement**. Pour limiter ce problème, une **forêt** fait travailler plusieurs arbres et calcule la moyenne de leurs prédictions. Si les arbres font des erreurs différentes, certaines se compensent. Mais s'ils se trompent tous de la même façon, la moyenne reste fausse. Testez « Arbre », puis « Forêt » : déplacez ensuite le profil hors des valeurs utilisées pour apprendre.
<!-- /step -->

<!-- step:title="La formule décortiquée" -->
À chaque question, l'arbre cherche une séparation qui regroupe des patients ayant des résultats proches. Par exemple, séparer les patients selon leur poids peut réduire les différences d'AUC *à l'intérieur* des deux groupes. On mesure les différences restantes par la **somme des erreurs au carré (SSE)** :

$$ \text{split}^\star = \arg\min_{s}\ \big[\,SSE(\text{gauche}) + SSE(\text{droite})\,\big] $$

Une **forêt aléatoire** construit plusieurs arbres à partir de tirages différents des patients (**bootstrap**) et ne propose pas toujours les mêmes variables à chaque question. Les arbres ne sont donc pas identiques. Pour un nouveau patient, on calcule simplement la **moyenne** de leurs prédictions :

$$ \hat y(x) = \frac{1}{B}\sum_{b=1}^{B} T_b(x) $$

:::note
Réf. : Breiman L., *Random Forests*, Machine Learning 2001. Explications visuelles : **MLU-Explain** (Amazon Machine Learning University), https://mlu-explain.github.io — voir « Decision Trees » et « Random Forest ».
:::
<!-- /step -->

<!-- step:title="Exemple concret" -->
Pour estimer l'**AUC** d'un immunosuppresseur à partir de 2–3 concentrations et de covariables, une forêt aléatoire peut apprendre des interactions (ex. génotype × dose) qu'une régression linéaire sans terme d'interaction ne représenterait pas.

Elle fournit aussi une **importance des variables** (chapitre suivant sur VSURF), utile pour savoir *quelles* covariables comptent.
<!-- /step -->

<!-- step:title="Piège fréquent" -->
Une forêt de régression standard n'extrapole pas naturellement.

:::pitfall
Un arbre prédit une **constante** dans chaque feuille ; une forêt de régression standard moyenne des valeurs apprises et ne prolonge pas une tendance au-delà du domaine observé. Une importance élevée n'implique pas une **relation causale** — seulement une contribution prédictive dans ce jeu de données et avec cet algorithme.
:::
<!-- /step -->

<!-- step:title="À retenir" -->
- Un arbre découpe l'espace des covariables → prédiction en marches, surajustement si trop profond.
- Une forêt moyenne plusieurs arbres différents : certaines erreurs se compensent, mais la moyenne peut encore être fausse.
- Elle capte les interactions et fournit une importance des variables.
- Elle n'extrapole pas ; importance ≠ causalité.
<!-- /step -->
