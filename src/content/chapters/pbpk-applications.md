---
id: "pbpk-applications"
slug: "pbpk-applications"
title: "IVIVE, interactions et populations spéciales"
description: "À quoi sert la PBPK : relier la clairance in vitro à l'in vivo et soutenir l'évaluation des DDI et des populations spéciales."
summary: "IVIVE (clairance in vitro → in vivo), interactions médicamenteuses et extrapolation pédiatrique/grossesse."
track: "pbpk"
order: 73
duration: "12 min"
level: "advanced"
tags: ["pbpk", "ivive", "drug-interactions", "pediatrics"]
prerequisites: ["pbpk-intro", "pbpk-distribution"]
glossary: ["PBPK", "CL", "CLr", "Allométrie"]
slides: []
sources: ["rostami-hodjegan-ivive", "fda-pbpk", "ema-pbpk", "anderson-holford-allometry", "jones-pbpk-industry"]
updated_on: "2026-10-09"
reviewed_on: "2026-10-09"
quiz:
  - prompt: "L'IVIVE consiste à..."
    options:
      - "extrapoler une clairance mesurée in vitro vers l'in vivo"
      - "extrapoler la PK de l'animal vers l'homme par allométrie"
      - "déduire la clairance in vitro à partir des données cliniques"
    correct: 0
  - prompt: "Dans un scénario de DDI, un modèle PBPK représente l'interaction en..."
    options:
      - "modifiant l'activité enzymatique (inhibition/induction) dans le foie modélisé"
      - "modifiant le débit sanguin hépatique du perpétrateur et de la victime"
      - "additionnant simplement les clairances des deux médicaments coadministrés"
    correct: 0
  - prompt: "Pour la pédiatrie, la PBPK ajuste surtout..."
    options:
      - "les volumes, débits et la maturation enzymatique selon l'âge"
      - "uniquement le poids corporel, les autres paramètres restant fixes"
      - "surtout les coefficients de partage tissulaires (Kp) selon l'âge"
    correct: 0
---

<!-- step:title="Pourquoi ce chapitre" -->
La PBPK n'est pas qu'un exercice descriptif : elle peut **soutenir des prédictions conditionnelles** dans des situations où l'essai est difficile — première administration humaine, enfant, grossesse, interactions — si le modèle est qualifié pour la question posée.

Trois applications phares : l'**IVIVE**, les **interactions** et les **populations spéciales**.
<!-- /step -->

<!-- step:title="Intuition" viz="01_HumanBody" -->
On mesure au laboratoire une clairance sur des **microsomes** ou **hépatocytes**, puis on la « monte à l'échelle » de l'organe entier, puis du corps : c'est l'**IVIVE**.

En insérant cette clairance dans le foie du modèle, on obtient une prédiction de PK systémique avant toute donnée clinique d'exposition humaine. Cette prédiction reste conditionnelle aux hypothèses IVIVE et à leur vérification ultérieure.
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
Pour une **dose pédiatrique**, on part du modèle adulte et on ajuste débits, volumes et **maturation** des enzymes (un nourrisson n'a pas l'activité CYP d'un adulte). Le modèle informe la sélection d'une dose à tester ; il ne remplace pas l'évaluation clinique.

Pour une **interaction**, on simule la coadministration avec un inhibiteur du CYP3A afin d'estimer conditionnellement la hausse d'exposition et d'éclairer une décision réglementaire.
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
