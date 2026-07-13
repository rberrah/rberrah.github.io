---
id: "pbpk-distribution"
slug: "pbpk-distribution"
title: "Distribution tissulaire et coefficients de partage"
description: "Pourquoi une molécule s'accumule dans certains tissus : Kp, liaison protéique et lipophilie."
summary: "Coefficients de partage tissu/plasma (Kp), fraction libre et prédiction du volume de distribution."
track: "pbpk"
order: 71
duration: "12 min"
level: "advanced"
tags: ["pbpk", "partition", "protein-binding", "distribution"]
slides: []
sources: ["poulin-theil", "rodgers-rowland", "jones-rowland-yeo"]
reviewed_on: "2026-07-09"
quiz:
  - prompt: "Le coefficient de partage Kp,T décrit..."
    options:
      - "le rapport de concentration tissu/plasma à l'équilibre"
      - "la dose administrée"
      - "la vitesse d'élimination rénale"
    correct: 0
  - prompt: "Une molécule très lipophile aura tendance à..."
    options:
      - "s'accumuler dans les tissus gras (grand volume)"
      - "rester uniquement dans le plasma"
      - "être éliminée sans distribution"
    correct: 0
  - prompt: "Seule la fraction ... du médicament diffuse et agit."
    options:
      - "libre (non liée aux protéines)"
      - "liée aux protéines"
      - "métabolisée"
    correct: 0
---

<!-- step:title="Pourquoi ce chapitre" -->
La **distribution** décide où va le médicament et combien reste dans le sang. En PBPK, elle se résume aux **coefficients de partage** $K_p$ de chaque tissu — le maillon qui relie propriétés physico-chimiques et volume de distribution.

Bien prédire les $K_p$ est souvent la clé d'un modèle PBPK réaliste.
<!-- /step -->

<!-- step:title="Intuition" viz="01_HumanBody" -->
Chaque tissu « attire » plus ou moins la molécule : un composé lipophile s'accumule dans la **graisse**, un composé lié aux protéines reste davantage dans le **plasma**.

Le $K_p$ traduit cette affinité : c'est le rapport de concentration tissu/plasma une fois l'équilibre atteint.
<!-- /step -->

<!-- step:title="La formule décortiquée" viz="01_HumanBody" -->
Le volume de distribution global se reconstruit à partir des tissus :

$$ V_{ss} = V_p + \sum_T V_T\,K_{p,T} $$

Les $K_p$ se **prédisent** à partir de la lipophilie ($\log P$), du pKa et des fractions libres (méthodes de Poulin-Theil, Rodgers-Rowland). La **fraction libre** plasmatique $f_u$ pilote la partie active :

$$ C_{libre} = f_u\cdot C_{plasma} $$

:::math
Seule la fraction **libre** diffuse et agit. Un changement de liaison protéique (albumine basse) modifie $f_u$ — donc la distribution et parfois l'effet.
:::
<!-- /step -->

<!-- step:title="Exemple concret" viz="01_HumanBody" -->
Une molécule très lipophile ($\log P$ élevé) présente de grands $K_p$ dans les tissus gras → **grand volume de distribution**, demi-vie allongée, accumulation.

À l'inverse, un composé hydrophile fortement lié aux protéines reste dans le plasma : petit volume, distribution limitée.
<!-- /step -->

<!-- step:title="Piège fréquent" -->
La fraction libre est un piège classique.

:::pitfall
Raisonner sur la concentration **totale** en ignorant $f_u$ trompe : en cas d'hypoalbuminémie, la fraction libre monte alors que la concentration totale peut sembler « normale ». C'est la concentration **libre** qui compte pour l'effet et pour les interactions de liaison.
:::
<!-- /step -->

<!-- step:title="À retenir" -->
- Kp,T = affinité tissu/plasma ; il relie physico-chimie et distribution.
- Vss = Vp + Σ V_T·Kp,T ; les Kp se prédisent (Poulin-Theil, Rodgers-Rowland).
- Seule la fraction libre (fu) diffuse et agit ; l'albumine la module.
- Lipophilie élevée → accumulation graisseuse, grand volume, demi-vie longue.
<!-- /step -->
