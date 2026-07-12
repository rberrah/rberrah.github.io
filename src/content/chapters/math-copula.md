---
id: "math-copula"
slug: "math-copula"
title: "Copules et covariables corrélées"
description: "Séparer les lois marginales de leur dépendance : simuler des covariables réalistes avec les copules."
summary: "Les copules décrivent la dépendance entre covariables indépendamment de leurs marges — utile pour simuler."
track: "math"
order: 25
duration: "12 min"
level: "advanced"
tags: ["maths", "copula", "covariates", "simulation"]
slides: []
sources: ["bonate", "ette-williams", "davidian-giltinan"]
reviewed_on: "2026-07-09"
quiz:
  - prompt: "Une copule décrit..."
    options:
      - "la structure de dépendance entre variables, séparée de leurs lois marginales"
      - "la moyenne d'une variable"
      - "l'erreur résiduelle d'un modèle"
    correct: 0
  - prompt: "Pour simuler des patients virtuels réalistes, ignorer la corrélation poids–ClCr..."
    options:
      - "crée des combinaisons impossibles (ex. poids faible + ClCr énorme)"
      - "n'a aucune conséquence"
      - "améliore le modèle"
    correct: 0
  - prompt: "Le théorème de Sklar affirme qu'une loi jointe se décompose en..."
    options:
      - "ses marges et une copule"
      - "une seule exponentielle"
      - "un arbre de décision"
    correct: 0
---

<!-- step:title="Pourquoi ce chapitre" -->
Pour **simuler** des essais ou des patients virtuels, il faut générer des covariables **réalistes**. Or poids, taille, ClCr, âge sont **corrélés** : les tirer indépendamment produit des individus impossibles.

Les **copules** permettent de reproduire la dépendance observée tout en gardant les bonnes lois marginales.
<!-- /step -->

<!-- step:title="Intuition" viz="43_Copula" -->
L'idée clé : **séparer** deux questions. (1) Comment se distribue chaque covariable **seule** (sa marge) ? (2) Comment sont-elles **liées** entre elles (la dépendance) ?

Une copule ne décrit que la seconde. Faites varier la corrélation : les histogrammes marginaux ne bougent pas, seul le **lien** change.
<!-- /step -->

<!-- step:title="La formule décortiquée" viz="43_Copula" -->
Le **théorème de Sklar** décompose toute loi jointe $F$ :

$$ F(x_1,\dots,x_d) = C\big(F_1(x_1),\dots,F_d(x_d)\big) $$

où $C$ est la **copule** (une loi jointe à marges uniformes) et $F_j$ les marges. La **copule gaussienne** se construit à partir d'une corrélation $\rho$ :

$$ u_j = \Phi(z_j),\quad z \sim \mathcal{N}(0,\Sigma),\quad x_j = F_j^{-1}(u_j) $$

:::math
On estime $\Sigma$ (ou $\rho$) sur une base de covariables réelles, puis on **simule** : marges cliniquement plausibles + dépendance conservée.
:::
<!-- /step -->

<!-- step:title="Exemple concret" viz="43_Copula" -->
Pour un **VPC** ou une simulation d'essai, on veut des patients dont poids et ClCr covarient comme dans la vraie population. Une copule gaussienne calée sur les données évite de créer un sujet de 45 kg avec une ClCr de 160 mL/min.

Des copules non gaussiennes (Clayton, Gumbel) capturent des dépendances **de queue** (co-occurrence d'extrêmes).
<!-- /step -->

<!-- step:title="Piège fréquent" -->
La corrélation linéaire ne dit pas tout.

:::pitfall
Une copule gaussienne ne capture pas les **dépendances de queue** : deux covariables peuvent être faiblement corrélées « en moyenne » mais co-extrêmes (fragilité rénale + grand âge). Choisir la famille de copule selon la structure observée, et vérifier sur les données simulées.
:::
<!-- /step -->

<!-- step:title="À retenir" -->
- Une copule sépare les marges (chaque covariable) de la dépendance (leur lien).
- Théorème de Sklar : loi jointe = marges + copule.
- Utile pour simuler des covariables réalistes (VPC, essais virtuels) sans individus impossibles.
- La copule gaussienne ignore les dépendances de queue ; choisir la famille adaptée.
<!-- /step -->
