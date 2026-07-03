---
id: "onco-tgi"
slug: "onco-tgi"
title: "Croissance tumorale et exposition–réponse"
description: "Modéliser la taille tumorale : croissance non perturbée, effet du traitement et lien avec la survie."
summary: "Les modèles de croissance tumorale (Simeoni) et leur lien avec la survie (Claret) en oncologie."
track: "onco"
order: 30
duration: "14 min"
level: "advanced"
tags: ["oncology", "tumor-growth", "exposure-response"]
slides: []
quiz:
  - prompt: "Dans un modèle de croissance tumorale, l'effet du médicament est souvent proportionnel à..."
    options:
      - "la concentration et à la taille tumorale"
      - "la couleur de la tumeur"
      - "la dose uniquement, sans PK"
    correct: 0
  - prompt: "La dynamique précoce de la taille tumorale sert surtout à..."
    options:
      - "prédire la survie à plus long terme"
      - "remplacer tout essai clinique"
      - "fixer la posologie sans PK"
    correct: 0
---

<!-- step:title="Pourquoi ce chapitre" -->
En oncologie, la « réponse » n'est plus une concentration mais la **taille de la tumeur**, puis la **survie**. La pharmacométrie relie exposition (AUC) → dynamique tumorale → bénéfice clinique.

C'est un cas emblématique de modèle **PK/PD mécaniste** appliqué à une maladie.
<!-- /step -->

<!-- step:title="Intuition" viz="Turnover" -->
Une tumeur est un **système dynamique** : elle croît spontanément, et le traitement en tue une partie.

L'effet du médicament dépend de la **concentration** (donc de la PK) : plus l'exposition est forte et soutenue, plus la croissance est freinée — jusqu'à la régression.
<!-- /step -->

<!-- step:title="La formule décortiquée" viz="Turnover" -->
Le modèle de **Simeoni** (2004) sépare croissance non perturbée et effet du médicament :

$$ \frac{dW}{dt} = \frac{\lambda_0\,W}{\left[1 + (\lambda_0 W/\lambda_1)^{\psi}\right]^{1/\psi}} - k_2\,C\,W $$

La croissance passe d'**exponentielle** ($\lambda_0$) à **linéaire** ($\lambda_1$) ; le terme $-k_2\,C\,W$ est l'effet, proportionnel à la concentration et à la masse tumorale (des compartiments de « cellules mourantes » ajoutent un délai).

:::note
Réf. : Simeoni M. et al., *Cancer Res* 2004 (modèle TGI) ; le seuil de concentration $C_T = \lambda_0/k_2$ sépare régression et échappement.
:::
<!-- /step -->

<!-- step:title="Exemple concret" viz="EmaxHill" -->
On relie ensuite la **dynamique tumorale précoce** (ex. réduction à 6-8 semaines) à la **survie** : c'est l'approche **TGI-OS** de Claret.

Une exposition plus forte → plus de réduction tumorale → meilleure survie prédite — un cadre utilisé pour choisir doses et schémas avant les grands essais.

:::note
Réf. : Claret L. et al., *J Clin Oncol* 2009 (lien taille tumorale → survie).
:::
<!-- /step -->

<!-- step:title="Piège fréquent" -->
La taille tumorale précoce n'est pas la survie.

:::pitfall
Un bon effet sur la tumeur à court terme ne garantit pas le bénéfice de survie (résistance, toxicité, hétérogénéité). Les modèles **tumeur → survie** doivent être validés en externe, et la survie se modélise en **temps-jusqu'à-événement**, pas en simple corrélation.
:::
<!-- /step -->

<!-- step:title="À retenir" -->
- En onco, la réponse = taille tumorale puis survie ; l'effet dépend de l'exposition (PK).
- Modèle de Simeoni : croissance (exponentielle→linéaire) − effet proportionnel à C·W.
- L'approche TGI-OS relie la dynamique tumorale précoce à la survie (Claret).
- Réserve : court terme ≠ survie ; validation externe indispensable.
<!-- /step -->
