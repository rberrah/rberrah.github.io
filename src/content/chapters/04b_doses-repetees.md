---
id: "doses-repetees"
slug: "doses-repetees"
title: "Doses répétées et état d'équilibre"
description: "Accumulation, concentration à l'équilibre (Css) et dose de charge."
summary: "Ce qui se passe quand on répète les doses : accumulation, plateau et intervalle."
track: "core"
order: 4.5
duration: "12 min"
level: "beginner"
tags: ["steady-state", "accumulation", "dosing"]
slides: ["s12"]
quiz:
  - prompt: "La concentration moyenne à l'équilibre vaut..."
    options:
      - "Dose / (CL · τ)"
      - "Dose · CL · τ"
      - "CL / Dose"
    correct: 0
  - prompt: "Le temps pour atteindre l'état d'équilibre dépend surtout de..."
    options:
      - "la demi-vie (≈ 4 à 5 t½)"
      - "la dose administrée"
      - "la couleur du comprimé"
    correct: 0
  - prompt: "Une dose de charge sert à..."
    options:
      - "atteindre plus vite la zone thérapeutique"
      - "diminuer la Css finale"
      - "changer la demi-vie"
    correct: 0
---

<!-- step:title="Pourquoi ce chapitre" slides="s12" -->
Une seule dose est rarement suffisante : on **répète** l'administration pour maintenir la concentration dans la fenêtre thérapeutique.

Mais répéter n'est pas anodin : le médicament **s'accumule** tant qu'on redose avant élimination complète.
<!-- /step -->

<!-- step:title="Intuition" slides="s12" viz="MultiDose" -->
Reprenez l'image du réservoir : on le remplit d'un coup à chaque dose, il se vide entre deux.

Si on redose **avant** qu'il soit vide, le niveau moyen **monte** — jusqu'à ce que ce qui entre par intervalle égale ce qui sort. C'est l'**état d'équilibre** (plateau).

:::key
Faites varier l'intervalle $\tau$ : plus il est court devant la demi-vie, plus l'accumulation est forte.
:::
<!-- /step -->

<!-- step:title="La formule décortiquée" slides="s12" viz="MultiDose" -->
La **concentration moyenne à l'équilibre** ne dépend que de la clairance et de l'intervalle :

$$ C_{ss,\text{moy}} = \frac{\text{Dose}}{CL \cdot \tau} $$

Le **ratio d'accumulation** (bolus IV) mesure l'empilement :

$$ R_{ac} = \frac{1}{1 - e^{-k_e \tau}} $$

:::math
On atteint ~90 % de l'équilibre en **~4 demi-vies**, quel que soit la dose. La dose ne fixe pas la *vitesse* d'arrivée à l'équilibre — seulement son *niveau*.
:::
<!-- /step -->

<!-- step:title="Exemple concret" slides="s12" viz="MultiDose" -->
Réduisez $\tau$ de moitié : la Css moyenne double et l'accumulation grimpe. Réduisez la clairance (insuffisance rénale) : même schéma, mais Css plus haute — risque de toxicité.

Cochez **dose de charge** : une première dose plus forte amène tout de suite dans la fenêtre, sans changer le plateau final.
<!-- /step -->

<!-- step:title="Piège fréquent" slides="s12" -->
Ne confondez pas le **niveau** de l'équilibre et le **temps** pour l'atteindre.

:::pitfall
Augmenter la dose monte la Css mais n'accélère **pas** l'arrivée à l'équilibre (toujours ~5 t½). Pour aller plus vite dans la fenêtre : une **dose de charge**, pas une dose d'entretien plus forte.
:::
<!-- /step -->

<!-- step:title="À retenir" -->
- Redoser avant élimination complète → accumulation jusqu'à un plateau (Css).
- $C_{ss,\text{moy}} = \text{Dose}/(CL\cdot\tau)$ : la clairance et l'intervalle fixent le niveau.
- Le temps pour atteindre l'équilibre ≈ 4 à 5 demi-vies, indépendamment de la dose.
- La dose de charge accélère l'entrée dans la fenêtre ; l'entretien maintient la Css.
<!-- /step -->
