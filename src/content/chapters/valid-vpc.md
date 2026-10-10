---
id: "valid-vpc"
slug: "valid-vpc"
title: "VPC et pcVPC : le test prédictif visuel"
description: "Le modèle reproduit-il la réalité ? Comparer les percentiles observés aux percentiles simulés."
summary: "La visual predictive check (VPC) et sa version corrigée (pcVPC) : principe, lecture et pièges."
track: "valid"
order: 93
duration: "13 min"
level: "advanced"
tags: ["validation", "vpc", "pcvpc", "simulation"]
prerequisites: ["validation-vpc", "valid-gof"]
glossary: ["VPC", "Binning", "PRED / IPRED"]
slides: []
sources: ["bergstrand-pcvpc", "karlsson-holford-vpc", "ema-poppk"]
updated_on: "2026-10-10"
reviewed_on: "2026-10-10"
review_type: "author"
reviewed_hash: "085c8bf93d34d8efdb66eb95ffa649ebcd9f7eda6a405833878398a2b57785db"
scientific_values: {"lower_percentile":5,"median_percentile":50,"upper_percentile":95,"demo_replicates":500,"demo_subjects":60}
units: {"percentiles":"percent","replicates":"datasets","subjects":"patients"}
quiz:
  - prompt: "Une VPC compare..."
    options:
      - "les percentiles des observations à ceux de nombreuses simulations"
      - "les prédictions individuelles aux observations, patient par patient"
      - "les percentiles observés à la courbe de prédiction typique (PRED)"
    correct: 0
  - prompt: "La pcVPC (prediction-corrected) sert à..."
    options:
      - "corriger la variabilité due aux différences de dose entre sujets"
      - "regrouper les observations en intervalles de temps optimaux"
      - "corriger le biais de linéarisation dans le calcul des résidus"
    correct: 0
  - prompt: "Si beaucoup d'observations tombent hors des intervalles simulés, alors..."
    options:
      - "le modèle reproduit mal la tendance ou la variabilité observées"
      - "les bandes simulées sont trop étroites, il suffit de les élargir"
      - "le nombre de simulations est trop faible pour conclure"
    correct: 0
---

<!-- step:title="Pourquoi ce chapitre" -->
La question ultime : le modèle est-il capable de **régénérer** des données qui ressemblent aux vraies ? La **VPC** (visual predictive check) répond visuellement, en confrontant observations et simulations.

C'est le diagnostic de validation le plus utilisé et le plus attendu par les évaluateurs.
<!-- /step -->

<!-- step:title="Intuition" viz="17_VPCCrashTest" -->
On **simule** des centaines de jeux de données sous le modèle, on en calcule les percentiles (5ᵉ, 50ᵉ, 95ᵉ), puis on regarde si les **percentiles observés** tombent dans les **bandes simulées**.

Une concordance soutient la capacité prédictive du modèle dans ce plan. Des écarts structurés suggèrent une inadéquation qui peut venir de la structure, de la variabilité, de l'erreur résiduelle, des covariables, du plan ou du binning.
<!-- /step -->

<!-- step:title="La formule décortiquée" viz="17_VPCCrashTest" -->
La VPC classique compare, par intervalle de temps (**binning**) :

- percentiles **observés** (médiane, 5 %, 95 %) ;
- **intervalles de confiance** de ces percentiles issus des simulations.

Quand les doses ou covariables **diffèrent** entre sujets, la variabilité de prédiction brouille la VPC : la **pcVPC** normalise chaque observation par sa prédiction typique pour retirer cette variabilité « attendue » :

$$ Y^{pc}_{ij} = Y_{ij}\cdot\frac{\overline{PRED}_{\text{bin}}}{PRED_{ij}} $$

:::note
Réf. : Karlsson & Holford (VPC) ; Bergstrand M. et al., *AAPS J* 2011 (prediction-corrected VPC).
:::
<!-- /step -->

<!-- step:title="Exemple concret" viz="17_VPCCrashTest" -->
Si la **médiane observée** sort de façon répétée de la bande simulée en phase terminale, une mauvaise description de l'élimination fait partie des hypothèses à tester, sans être la seule. Des **percentiles extrêmes** mal reproduits peuvent être compatibles avec une IIV ou une erreur résiduelle inadéquate, mais aussi avec le design, le binning ou une structure incorrecte.

La pcVPC clarifie ces lectures quand le protocole mélange plusieurs doses.
<!-- /step -->

<!-- step:title="Piège fréquent" -->
Un mauvais binning fausse tout.

:::pitfall
Des **intervalles de temps** mal choisis (bins trop larges ou mal placés) créent des artefacts qui imitent un défaut de modèle — ou en masquent un. Et une VPC non corrigée sur des données à doses multiples est **trompeuse** : préférer la pcVPC. La VPC vérifie la cohérence, elle ne prouve pas la justesse.
:::
<!-- /step -->

<!-- step:title="À retenir" -->
- La VPC confronte percentiles observés et simulés (tendance + variabilité).
- La pcVPC corrige les différences de dose/covariables entre sujets.
- Des sorties de bande répétées génèrent des hypothèses ; elles n'identifient pas seules la composante fautive.
- Attention au binning ; la VPC vérifie la cohérence, pas la vérité.
<!-- /step -->
