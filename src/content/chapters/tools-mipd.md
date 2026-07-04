---
id: "tools-mipd"
slug: "tools-mipd"
title: "TDM bayésien en pratique : mapbayr"
description: "Passer du modèle au patient : estimation MAP et ajustement de dose individuel, avec mapbayr."
summary: "Les outils de TDM/MIPD : estimation bayésienne (MAP) à partir de quelques prélèvements, avec mapbayr (R)."
track: "tools"
order: 203
duration: "11 min"
level: "intermediate"
tags: ["tools", "mapbayr", "tdm", "mipd"]
prerequisites: ["tools-overview", "bayes-ebes"]
glossary: ["MAP", "TDM", "EBE", "Precision dosing"]
slides: []
quiz:
  - prompt: "L'estimation MAP (maximum a posteriori) combine..."
    options:
      - "le modèle de population (a priori) et les concentrations du patient"
      - "seulement la dernière dose"
      - "seulement le poids"
    correct: 0
  - prompt: "mapbayr (R) s'appuie sur..."
    options:
      - "un modèle mrgsolve pour l'estimation MAP individuelle"
      - "une feuille de calcul"
      - "un générateur d'images"
    correct: 0
  - prompt: "Le MIPD (model-informed precision dosing) vise à..."
    options:
      - "individualiser la dose à partir du modèle et de mesures"
      - "donner la même dose à tous"
      - "supprimer le suivi"
    correct: 0
---

<!-- step:title="Pourquoi ce chapitre" -->
L'aboutissement clinique de la pharmacométrie est le **MIPD** (model-informed precision dosing) : utiliser un modèle de population **plus** quelques prélèvements d'un patient pour ajuster **sa** dose.

En R, **mapbayr** rend cette estimation bayésienne accessible à partir d'un modèle mrgsolve.
<!-- /step -->

<!-- step:title="Intuition" viz="TDMProfile" -->
On part de ce que dit la **population** (a priori). Une ou deux **concentrations** mesurées mettent à jour l'estimation des paramètres du patient. On simule alors sa courbe et on **ajuste la dose** vers la cible.

Peu de données suffisent, car le modèle « comble » ce qu'on n'a pas mesuré.
<!-- /step -->

<!-- step:title="La formule décortiquée" viz="BayesUpdate" -->
L'estimation **MAP** maximise le posterior : elle minimise l'écart aux données **plus** un rappel vers la population :

$$ \hat\eta_i = \arg\min_{\eta}\; \underbrace{\sum_j \frac{(y_j - f_j)^2}{\sigma_j^2}}_{\text{données}} + \underbrace{\eta^\top \Omega^{-1} \eta}_{\text{a priori}} $$

- **mapbayr** (R) : réalise cette estimation MAP à partir d'un **modèle mrgsolve** et de quelques concentrations, puis propose la dose atteignant la cible.

:::note
Réf. : mapbayr (F. Le Louedec et coll.), package R open-source ; s'inscrit dans le TDM bayésien (voir le chapitre TDM).
:::
<!-- /step -->

<!-- step:title="Exemple concret" viz="TDMProfile" -->
Un patient sous vancomycine : une résiduelle est mesurée. mapbayr estime **sa** clairance (ex. augmentée), simule son AUC₂₄, et propose la dose qui atteint la cible AUC/CMI — bien plus fiable qu'un abaque fixe.

C'est le même raisonnement que le chapitre TDM, **outillé** pour la pratique.
<!-- /step -->

<!-- step:title="Piège fréquent" -->
Un bon outil ne corrige pas un mauvais modèle a priori.

:::pitfall
Le MIPD hérite du **modèle de population** choisi : un a priori inadapté (mauvaise population, covariables ignorées) biaise l'estimation. Attention au **shrinkage** si les prélèvements sont trop pauvres, et au **moment** du prélèvement, qui conditionne l'information.
:::
<!-- /step -->

<!-- step:title="À retenir" -->
- Le MIPD individualise la dose à partir du modèle (a priori) et de mesures du patient.
- L'estimation MAP = données + rappel vers la population ; peu de prélèvements suffisent.
- mapbayr (R) réalise le MAP à partir d'un modèle mrgsolve et propose la dose cible.
- Dépend de la qualité de l'a priori ; attention au shrinkage et au moment du prélèvement.
<!-- /step -->
