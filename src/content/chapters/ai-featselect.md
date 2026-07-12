---
id: "ai-featselect"
slug: "ai-featselect"
title: "Sélection de variables : VSURF et OrdinalForest"
description: "Choisir les covariables qui comptent vraiment — et gérer une réponse ordinale — avec les forêts aléatoires."
summary: "Importance des variables, sélection automatique par VSURF, et forêts pour réponses ordinales (OrdinalForest)."
track: "ai"
order: 17
duration: "12 min"
level: "advanced"
tags: ["ai", "feature-selection", "vsurf", "ordinal-forest"]
slides: []
sources: ["genuer-vsurf", "guyon-featsel", "breiman-rf", "hastie-esl"]
reviewed_on: "2026-07-09"
quiz:
  - prompt: "VSURF sélectionne les variables en..."
    options:
      - "deux étapes (interprétation puis prédiction) fondées sur l'importance des forêts"
      - "gardant toutes les variables"
      - "tirant au hasard"
    correct: 0
  - prompt: "OrdinalForest est conçu pour une réponse..."
    options:
      - "ordinale (catégories ordonnées, ex. grades de toxicité)"
      - "strictement continue"
      - "binaire uniquement"
    correct: 0
  - prompt: "Garder des variables de bruit (importance quasi nulle)..."
    options:
      - "dégrade la généralisation (surajustement)"
      - "améliore toujours le modèle"
      - "n'a aucun effet"
    correct: 0
---

<!-- step:title="Pourquoi ce chapitre" -->
Avec des dizaines de covariables candidates, on veut savoir **lesquelles gardent** un pouvoir prédictif — pour un modèle plus simple, plus robuste et plus interprétable.

Deux outils issus de l'équipe **forêts aléatoires** francophone sont particulièrement utiles : **VSURF** (sélection) et **OrdinalForest** (réponse ordinale).
<!-- /step -->

<!-- step:title="Intuition" viz="42_VarImportance" -->
Une forêt attribue à chaque covariable une **importance** (perte de performance quand on la brouille). On trie, puis on **coupe** au bon niveau.

Trop bas : on garde du bruit. Trop haut : on jette des variables utiles. Déplacez le seuil et regardez quelles covariables survivent.
<!-- /step -->

<!-- step:title="La formule décortiquée" viz="42_VarImportance" -->
L'**importance par permutation** mesure la hausse d'erreur quand la variable $j$ est permutée aléatoirement :

$$ VI_j = \frac{1}{B}\sum_{b} \big(\,err_b^{\text{perm}(j)} - err_b\,\big) $$

**VSURF** automatise la décision en trois temps : (1) **seuillage** (éliminer le bruit), (2) **interprétation** (garder toutes les variables liées), (3) **prédiction** (sous-ensemble minimal qui prédit bien).

**OrdinalForest** adapte la forêt à une réponse **ordinale** (catégories ordonnées) en optimisant des scores de partition — idéal pour des **grades** (toxicité 0→4, RECIST).

:::note
Réf. : Genuer R., Poggi J.-M. & Tuleau-Malot C., *VSURF: Variable Selection Using Random Forests* (Pattern Recognition Letters 2010 ; package R, R Journal 2015) ; Hornung R., *Ordinal Forests* (J. Classif. 2020). Voir aussi **MLU-Explain**, https://mlu-explain.github.io.
:::
<!-- /step -->

<!-- step:title="Exemple concret" viz="42_VarImportance" -->
Pour un modèle de **toxicité hématologique** (grades 0 à 4), OrdinalForest respecte l'ordre des grades ; VSURF isole les covariables clés (ClCr, poids, génotype) parmi des dizaines de candidates.

On obtient un modèle **parcimonieux** : moins de variables, meilleure généralisation, message clinique plus clair.
<!-- /step -->

<!-- step:title="Piège fréquent" -->
Importance n'est pas causalité — et dépend des corrélations.

:::pitfall
Deux covariables **corrélées** se partagent l'importance (l'une peut masquer l'autre). Une variable importante n'est pas forcément **causale**. Enfin, refaire la sélection à l'intérieur d'une validation croisée est indispensable pour ne pas surestimer la performance.
:::
<!-- /step -->

<!-- step:title="À retenir" -->
- L'importance (par permutation) classe les covariables selon leur pouvoir prédictif.
- VSURF sélectionne en deux temps : interprétation (tout ce qui compte) puis prédiction (minimal).
- OrdinalForest gère les réponses ordinales (grades de toxicité, RECIST).
- Attention aux corrélations, à la causalité et à la fuite dans la validation.
<!-- /step -->
