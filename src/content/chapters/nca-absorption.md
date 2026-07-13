---
id: "nca-absorption"
slug: "nca-absorption"
title: "NCA après voie orale : Cmax, Tmax, F"
description: "Lire l'absorption sans modèle : pic, temps du pic, biodisponibilité absolue et relative."
summary: "Paramètres d'absorption en NCA : Cmax, Tmax, biodisponibilité et comparaison de formulations."
track: "nca"
order: 83
duration: "11 min"
level: "intermediate"
tags: ["nca", "bioavailability", "cmax", "oral"]
slides: []
sources: ["ema-bioequivalence", "fda-bioequivalence", "rowland-tozer"]
reviewed_on: "2026-07-09"
quiz:
  - prompt: "La biodisponibilité absolue F se calcule en comparant..."
    options:
      - "l'AUC orale (dose-normalisée) à l'AUC IV"
      - "Cmax à Tmax"
      - "λz oral à λz IV"
    correct: 0
  - prompt: "Cmax et Tmax renseignent surtout sur..."
    options:
      - "la vitesse d'absorption"
      - "la voie d'élimination"
      - "le volume de distribution"
    correct: 0
---

<!-- step:title="Pourquoi ce chapitre" -->
Par voie orale, le médicament doit être **absorbé** avant d'agir. La NCA quantifie cette absorption sans modèle : combien (**F**), à quelle hauteur (**Cmax**) et à quel moment (**Tmax**).

Ces paramètres sont au cœur des études de **formulation** et de **bioéquivalence**.
<!-- /step -->

<!-- step:title="Intuition" viz="OralAbsorption" -->
Après une prise orale, la concentration **monte** (absorption) puis **descend** (élimination) : le sommet est **Cmax**, atteint au temps **Tmax**.

Une absorption rapide donne un Cmax élevé et précoce ; une formulation à libération prolongée aplatit et retarde le pic.
<!-- /step -->

<!-- step:title="La formule décortiquée" viz="OralAbsorption" -->
La **biodisponibilité absolue** compare l'exposition orale à l'exposition IV, à dose égale :

$$ F = \frac{\text{AUC}_{oral}/\text{Dose}_{oral}}{\text{AUC}_{IV}/\text{Dose}_{IV}} $$

La **biodisponibilité relative** compare deux formulations orales (test vs référence). **Cmax** et **Tmax** se lisent directement sur la courbe (pas de calcul).

:::math
En **bioéquivalence**, on exige que les rapports test/référence de l'AUC et de la Cmax tombent dans **80–125 %** (IC 90 %).
:::
<!-- /step -->

<!-- step:title="Exemple concret" viz="OralAbsorption" -->
Un générique à AUC équivalente mais **Cmax plus haut** peut échouer la bioéquivalence : même exposition totale, mais vitesse d'absorption différente.

À l'inverse, une forme retard vise un Cmax plus bas et un Tmax retardé, pour lisser les concentrations.
<!-- /step -->

<!-- step:title="Piège fréquent" -->
Cmax dépend de l'échantillonnage.

:::pitfall
Cmax et Tmax sont des valeurs **observées** : si aucun prélèvement n'a lieu près du vrai pic, on **sous-estime** Cmax et on décale Tmax. Un plan de prélèvement dense autour du pic est indispensable pour l'absorption.
:::
<!-- /step -->

<!-- step:title="À retenir" -->
- Cmax et Tmax décrivent la vitesse d'absorption (valeurs observées).
- F absolue = AUC orale vs IV (dose-normalisées) ; F relative = deux formulations.
- Bioéquivalence : rapports AUC et Cmax dans 80–125 % (IC 90 %).
- L'échantillonnage autour du pic conditionne la fiabilité de Cmax/Tmax.
<!-- /step -->
