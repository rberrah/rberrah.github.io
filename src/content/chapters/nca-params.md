---
id: "nca-params"
slug: "nca-params"
title: "Paramètres dérivés : CL, Vz, Vss, MRT"
description: "De l'AUC aux paramètres : clairance, volumes de distribution et temps de séjour moyen."
summary: "Comment la NCA dérive clairance, Vz, Vss et MRT à partir de l'AUC et des moments de la courbe."
track: "nca"
order: 82
duration: "12 min"
level: "intermediate"
tags: ["nca", "clearance", "volume", "mrt"]
slides: []
sources: ["yamaoka-moments", "holford-clearance", "gibaldi-perrier"]
reviewed_on: "2026-07-09"
quiz:
  - prompt: "Après une dose IV, la clairance se calcule par..."
    options:
      - "CL = Dose / AUC∞"
      - "CL = Dose × AUC"
      - "CL = Cmax / t½"
    correct: 0
  - prompt: "Le temps de séjour moyen (MRT) est le rapport..."
    options:
      - "AUMC / AUC"
      - "AUC / Cmax"
      - "Dose / λz"
    correct: 0
  - prompt: "Vss (volume à l'état d'équilibre) se calcule (IV) par..."
    options:
      - "CL × MRT"
      - "Dose / Cmax"
      - "AUC / Dose"
    correct: 0
---

<!-- step:title="Pourquoi ce chapitre" -->
L'AUC seule ne suffit pas : on veut la **clairance** (capacité d'épuration) et le **volume** (ampleur de distribution). La NCA les dérive directement, sans modèle.

Ces paramètres permettent de comparer molécules, doses et populations.
<!-- /step -->

<!-- step:title="Intuition" viz="09_PK1C" -->
La **clairance** est le volume de sang totalement épuré par unité de temps : plus l'AUC est petite pour une dose donnée, plus l'organisme épure vite.

Le **volume** relie la quantité dans le corps à la concentration plasmatique : grand volume = molécule qui « part » dans les tissus.
<!-- /step -->

<!-- step:title="La formule décortiquée" viz="09_PK1C" -->
Après une dose **IV**, les relations clés :

$$ CL = \frac{\text{Dose}}{\text{AUC}_{0-\infty}}, \qquad V_z = \frac{CL}{\lambda_z} $$

Les **moments** de la courbe donnent le temps de séjour moyen et le volume à l'équilibre :

$$ MRT = \frac{\text{AUMC}}{\text{AUC}}, \qquad V_{ss} = CL\cdot MRT $$

:::math
$V_z$ dépend de $\lambda_z$ (phase terminale) ; $V_{ss}$ est indépendant de la voie d'élimination et souvent préféré pour la distribution.
:::
<!-- /step -->

<!-- step:title="Exemple concret" viz="09_PK1C" -->
Dose IV de 100 mg, AUC∞ = 20 mg·h/L → $CL = 5$ L/h. Si $\lambda_z = 0{,}1$ h⁻¹, alors $V_z = 50$ L.

Comparer $V_z$ et $V_{ss}$ renseigne sur la distribution ; comparer $CL$ à la fonction rénale/hépatique oriente sur la voie d'élimination.
<!-- /step -->

<!-- step:title="Piège fréquent" -->
Après voie orale, CL et V sont « apparents ».

:::pitfall
Sans IV, on ne connaît pas la fraction absorbée $F$ : on obtient $CL/F$ et $V/F$ (**apparents**). Comparer un $CL/F$ oral à un $CL$ IV sans tenir compte de $F$ est une erreur classique. Les moments (AUMC) sont aussi très sensibles à l'échantillonnage terminal.
:::
<!-- /step -->

<!-- step:title="À retenir" -->
- CL = Dose/AUC∞ (IV) ; Vz = CL/λz.
- MRT = AUMC/AUC ; Vss = CL·MRT (préféré pour la distribution).
- Par voie orale, on obtient CL/F et V/F (apparents), car F est inconnu.
- Les moments (AUMC) amplifient les erreurs d'échantillonnage terminal.
<!-- /step -->
