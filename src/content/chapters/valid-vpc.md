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
slides: []
sources: ["bergstrand-pcvpc", "karlsson-holford-vpc", "keizer-psn-xpose"]
reviewed_on: "2026-07-09"
quiz:
  - prompt: "Une VPC compare..."
    options:
      - "les percentiles des observations à ceux de nombreuses simulations"
      - "deux doses"
      - "la Cmax et le Tmax"
    correct: 0
  - prompt: "La pcVPC (prediction-corrected) sert à..."
    options:
      - "corriger la variabilité due aux différences de dose/covariables entre sujets"
      - "supprimer les observations"
      - "augmenter la variabilité"
    correct: 0
  - prompt: "Si beaucoup d'observations tombent hors des intervalles simulés, alors..."
    options:
      - "le modèle reproduit mal les données"
      - "le modèle est parfait"
      - "il faut plus de dose"
    correct: 0
---

<!-- step:title="Pourquoi ce chapitre" -->
La question ultime : le modèle est-il capable de **régénérer** des données qui ressemblent aux vraies ? La **VPC** (visual predictive check) répond visuellement, en confrontant observations et simulations.

C'est le diagnostic de validation le plus utilisé et le plus attendu par les évaluateurs.
<!-- /step -->

<!-- step:title="Intuition" viz="17_VPCCrashTest" -->
On **simule** des centaines de jeux de données sous le modèle, on en calcule les percentiles (5ᵉ, 50ᵉ, 95ᵉ), puis on regarde si les **percentiles observés** tombent dans les **bandes simulées**.

Si oui, le modèle reproduit à la fois la tendance et la variabilité. Sinon, il y a un défaut de structure ou de variabilité.
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
Si la **médiane observée** sort de la bande simulée en phase terminale, le modèle décrit mal l'élimination. Si les **percentiles extrêmes** (5/95) sont trop resserrés dans la simulation, la **variabilité** (IIV ou erreur résiduelle) est sous-estimée.

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
- Sorties de bande : défaut de structure (médiane) ou de variabilité (extrêmes).
- Attention au binning ; la VPC vérifie la cohérence, pas la vérité.
<!-- /step -->
