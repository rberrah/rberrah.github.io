---
id: "pbpk-applications"
slug: "pbpk-applications"
title: "IVIVE, interactions et populations spéciales"
description: "À quoi sert vraiment la PBPK : extrapoler la clairance in vitro, prédire les DDI et adapter aux populations."
summary: "IVIVE (clairance in vitro → in vivo), interactions médicamenteuses et extrapolation pédiatrique/grossesse."
track: "pbpk"
order: 73
duration: "12 min"
level: "advanced"
tags: ["pbpk", "ivive", "drug-interactions", "pediatrics"]
slides: []
sources: ["jones-rowland-yeo", "anderson-holford-allometry", "holford-clearance", "certara"]
reviewed_on: "2026-07-09"
quiz:
  - prompt: "L'IVIVE consiste à..."
    options:
      - "extrapoler une clairance mesurée in vitro vers l'in vivo"
      - "mesurer l'AUC chez l'animal"
      - "ignorer le métabolisme"
    correct: 0
  - prompt: "La PBPK prédit une interaction (DDI) en..."
    options:
      - "modifiant l'activité enzymatique (inhibition/induction) dans le foie modélisé"
      - "changeant la couleur du médicament"
      - "supprimant la dose"
    correct: 0
  - prompt: "Pour la pédiatrie, la PBPK ajuste surtout..."
    options:
      - "les volumes, débits et la maturation enzymatique selon l'âge"
      - "rien, la dose est proportionnelle au poids"
      - "seulement la couleur"
    correct: 0
---

<!-- step:title="Pourquoi ce chapitre" -->
La PBPK n'est pas qu'un bel exercice : elle **prédit** dans des situations où l'essai est difficile ou impossible — première dose chez l'homme, enfant, femme enceinte, interactions.

Trois applications phares : l'**IVIVE**, les **interactions** et les **populations spéciales**.
<!-- /step -->

<!-- step:title="Intuition" viz="01_HumanBody" -->
On mesure au laboratoire une clairance sur des **microsomes** ou **hépatocytes**, puis on la « monte à l'échelle » de l'organe entier, puis du corps : c'est l'**IVIVE**.

En insérant cette clairance dans le foie du modèle, on prédit la PK systémique — sans jamais avoir dosé l'homme.
<!-- /step -->

<!-- step:title="La formule décortiquée" viz="01_HumanBody" -->
La clairance hépatique in vivo se reconstruit par le **modèle de perfusion** (well-stirred) :

$$ CL_h = \frac{Q_h\cdot f_u\cdot CL_{int}}{Q_h + f_u\cdot CL_{int}} $$

où $CL_{int}$ (clairance intrinsèque) vient de l'in vitro. Une **interaction** se modélise en modifiant $CL_{int}$ : un inhibiteur la réduit, un inducteur l'augmente.

:::note
Réf. : Rostami-Hodjegan A. (IVIVE, Simcyp) ; guides EMA/FDA sur l'usage réglementaire de la PBPK pour les DDI et la pédiatrie. Modélisation mécaniste : école de **Leiden** (LACDR).
:::
<!-- /step -->

<!-- step:title="Exemple concret" viz="01_HumanBody" -->
Pour une **dose pédiatrique**, on part du modèle adulte et on ajuste débits, volumes et **maturation** des enzymes (un nourrisson n'a pas l'activité CYP d'un adulte). Le modèle propose une dose avant tout essai.

Pour une **interaction**, on simule co-administration avec un inhibiteur du CYP3A et on prédit la hausse d'exposition — utile pour la notice.
<!-- /step -->

<!-- step:title="Piège fréquent" -->
La prédiction vaut ce que valent ses entrées.

:::pitfall
Une IVIVE peut **sous-estimer** la clairance (facteurs d'échelle, transporteurs non capturés). Une prédiction de DDI dépend fortement de la $CL_{int}$ et de la $f_u$. La PBPK réglementaire exige une **qualification** du modèle sur des données connues avant toute extrapolation.
:::
<!-- /step -->

<!-- step:title="À retenir" -->
- IVIVE : extrapoler CL_int in vitro → CL hépatique in vivo (modèle well-stirred).
- Les DDI se modélisent en modifiant l'activité enzymatique (inhibition/induction).
- Pédiatrie/grossesse : ajuster volumes, débits et maturation enzymatique.
- La PBPK réglementaire doit être qualifiée sur des données connues.
<!-- /step -->
