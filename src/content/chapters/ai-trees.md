---
id: "ai-trees"
slug: "ai-trees"
title: "Arbres de décision et forêts aléatoires"
description: "De l'arbre unique (des marches) à la forêt aléatoire (une moyenne robuste) : les briques du ML tabulaire."
summary: "Arbres CART, bagging, forêts aléatoires : comment on apprend des règles à partir de covariables."
track: "ai"
order: 14
duration: "14 min"
level: "intermediate"
tags: ["ai", "random-forest", "decision-tree", "machine-learning"]
slides: []
quiz:
  - prompt: "Un arbre de décision seul produit une fonction..."
    options:
      - "en marches (constante par morceaux), qui tend à surajuster"
      - "toujours linéaire"
      - "toujours lisse"
    correct: 0
  - prompt: "Une forêt aléatoire améliore l'arbre unique en..."
    options:
      - "moyennant de nombreux arbres décorrélés (bagging + sous-ensembles de variables)"
      - "augmentant la profondeur d'un seul arbre"
      - "supprimant les covariables"
    correct: 0
  - prompt: "L'importance des variables d'une forêt sert à..."
    options:
      - "repérer les covariables les plus prédictives"
      - "fixer la dose"
      - "calculer l'AUC par trapèzes"
    correct: 0
---

<!-- step:title="Pourquoi ce chapitre" -->
Les données pharmacométriques sont souvent **tabulaires** : covariables (poids, ClCr, génotype…) → une réponse (AUC, concentration, effet). Les **arbres** et les **forêts** apprennent directement des règles à partir de ces tableaux, sans modèle mécaniste.

Ce sont les briques de la plupart des méthodes de ML « classiques » utiles au TDM.
<!-- /step -->

<!-- step:title="Intuition" viz="40_TreeEnsemble" -->
Un **arbre** pose des questions successives (« ClCr < 60 ? ») et découpe l'espace en zones où la réponse est supposée constante : d'où une prédiction **en marches**.

Un arbre profond colle au bruit (surajustement). L'idée de la **forêt** : construire beaucoup d'arbres un peu différents et **moyenner** — le résultat se lisse et généralise mieux. Testez les modes « Arbre » puis « Forêt ».
<!-- /step -->

<!-- step:title="La formule décortiquée" viz="40_TreeEnsemble" -->
Un arbre choisit à chaque nœud le découpage qui **réduit le plus l'impureté**. En régression, on minimise la variance résiduelle :

$$ \text{split}^\star = \arg\min_{s}\ \big[\,SSE(\text{gauche}) + SSE(\text{droite})\,\big] $$

Une **forêt aléatoire** (Breiman) combine deux ingrédients de décorrélation : le **bagging** (chaque arbre sur un échantillon bootstrap) et un **sous-ensemble aléatoire de variables** à chaque nœud. La prédiction est la moyenne :

$$ \hat y(x) = \frac{1}{B}\sum_{b=1}^{B} T_b(x) $$

:::note
Réf. : Breiman L., *Random Forests*, Machine Learning 2001. Explications visuelles : **MLU-Explain** (Amazon Machine Learning University), https://mlu-explain.github.io — voir « Decision Trees » et « Random Forest ».
:::
<!-- /step -->

<!-- step:title="Exemple concret" viz="40_TreeEnsemble" -->
Pour estimer l'**AUC** d'un immunosuppresseur à partir de 2–3 concentrations et de covariables, une forêt aléatoire capture des interactions (ex. génotype × dose) qu'une régression linéaire manquerait.

Elle fournit aussi une **importance des variables** (chapitre suivant sur VSURF), utile pour savoir *quelles* covariables comptent.
<!-- /step -->

<!-- step:title="Piège fréquent" -->
Une forêt n'extrapole pas.

:::pitfall
Un arbre prédit une **constante** hors de la plage vue à l'entraînement : la forêt ne devine pas au-delà des données observées. Et une importance élevée n'implique pas une **relation causale** — juste un pouvoir prédictif dans ce jeu de données.
:::
<!-- /step -->

<!-- step:title="À retenir" -->
- Un arbre découpe l'espace des covariables → prédiction en marches, surajustement si trop profond.
- La forêt aléatoire moyenne de nombreux arbres décorrélés (bagging + variables aléatoires).
- Elle capte les interactions et fournit une importance des variables.
- Elle n'extrapole pas ; importance ≠ causalité.
<!-- /step -->
