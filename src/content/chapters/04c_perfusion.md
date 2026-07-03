---
id: "perfusion"
slug: "perfusion"
title: "Perfusion IV et cinétique d'ordre 0"
description: "Une entrée à débit constant (ordre 0) qui construit un plateau : Css = R0/CL."
summary: "La perfusion intraveineuse : montée vers l'état d'équilibre, Css et décroissance à l'arrêt."
track: "core"
order: 4.7
duration: "11 min"
level: "beginner"
tags: ["infusion", "zero-order", "steady-state"]
slides: ["s12"]
quiz:
  - prompt: "Une entrée d'ordre 0 signifie que le débit d'entrée est..."
    options:
      - "constant, indépendant de la concentration"
      - "proportionnel à la concentration"
      - "nul"
    correct: 0
  - prompt: "La concentration à l'équilibre d'une perfusion vaut..."
    options:
      - "R0 / CL"
      - "R0 · CL"
      - "R0 / V"
    correct: 0
  - prompt: "Doubler le débit de perfusion R0..."
    options:
      - "double la Css sans changer le temps pour l'atteindre"
      - "atteint la Css deux fois plus vite"
      - "ne change pas la Css"
    correct: 0
---

<!-- step:title="Pourquoi ce chapitre" slides="s12" -->
Beaucoup de médicaments hospitaliers sont administrés en **perfusion intraveineuse** : un débit **constant** pendant plusieurs heures.

C'est le cas modèle de la **cinétique d'ordre 0** en entrée : contrairement à l'absorption orale (proportionnelle à ce qui reste), le débit ne dépend pas de la concentration.
<!-- /step -->

<!-- step:title="Intuition" slides="s12" viz="Infusion" -->
Reprenez le réservoir : un robinet d'entrée coule à **débit fixe** (ordre 0), tandis que la fuite de sortie est **proportionnelle au niveau** (ordre 1, la clairance).

Au début, l'entrée l'emporte et le niveau monte. Puis la sortie augmente avec le niveau… jusqu'à ce que **entrée = sortie** : le plateau, l'**état d'équilibre** (Css).

:::key
Faites varier le débit R₀ : il fixe la **hauteur** du plateau, pas la vitesse pour l'atteindre.
:::
<!-- /step -->

<!-- step:title="La formule décortiquée" slides="s12" viz="Infusion" -->
Pendant la perfusion, la concentration monte selon :

$$ C(t) = \frac{R_0}{CL}\left(1 - e^{-\frac{CL}{V}\,t}\right) $$

et tend vers le plateau :

$$ C_{ss} = \frac{R_0}{CL} $$

:::math
La Css ne dépend que du **débit** et de la **clairance**. On atteint ~90 % de la Css en **~4 demi-vies** ; à l'arrêt, la décroissance est exponentielle (élimination d'ordre 1).
:::
<!-- /step -->

<!-- step:title="Exemple concret" slides="s12" viz="Infusion" -->
Doublez R₀ : la Css double, mais le temps pour l'atteindre est inchangé (il dépend de la demi-vie).

Réduisez la clairance (insuffisance rénale) : à débit égal, la Css monte — risque d'accumulation. Une perfusion trop courte s'arrête **avant** le plateau : on n'atteint jamais la Css visée.
<!-- /step -->

<!-- step:title="Piège fréquent" slides="s12" -->
Ne cherchez pas à atteindre la Css « plus vite » en augmentant le débit.

:::pitfall
Augmenter R₀ monte le plateau, mais le **temps** d'arrivée à l'équilibre reste ~5 demi-vies. Pour aller vite dans la fenêtre : une **dose de charge** (bolus) en début de perfusion, pas un débit d'entretien plus élevé.
:::
<!-- /step -->

<!-- step:title="À retenir" -->
- Perfusion = entrée d'ordre 0 (débit constant) + élimination d'ordre 1.
- $C_{ss} = R_0/CL$ : le débit et la clairance fixent le plateau.
- ~4 à 5 demi-vies pour atteindre (ou quitter) l'équilibre, indépendamment du débit.
- Dose de charge = atteindre la fenêtre vite ; perfusion = la maintenir.
<!-- /step -->
