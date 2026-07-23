---
id: "absorption-orale"
slug: "absorption-orale"
title: "Voie orale, Ka et temps de latence"
description: "Pourquoi une courbe orale monte avant de redescendre."
summary: "Explication accessible de la vitesse d'absorption, du temps de latence, du Cmax et du Tmax."
track: "core"
order: 4
duration: "12 min"
level: "beginner"
tags: ["oral", "absorption", "ka", "tlag"]
slides: ["s07"]
sources: ["savic-transit", "gibaldi-perrier", "rowland-tozer"]
reviewed_on: "2026-07-09"
quiz:
  - prompt: "Ka contrôle principalement..."
    options:
      - "la vitesse d'entrée du médicament dans le compartiment central"
      - "la vitesse d'élimination du médicament hors du compartiment central"
      - "la fraction de la dose qui atteint la circulation systémique"
    correct: 0
  - prompt: "Le temps de latence Tlag représente..."
    options:
      - "un délai avant le début de l'absorption"
      - "le temps pour atteindre la concentration maximale"
      - "la durée totale de la phase d'absorption"
    correct: 0
  - prompt: "Une cinétique flip-flop peut survenir quand..."
    options:
      - "l'absorption est plus lente que l'élimination"
      - "l'élimination est plus lente que l'absorption"
      - "la distribution est plus lente que l'élimination"
    correct: 0
---

<!-- step:title="Pourquoi ce chapitre" slides="s07" viz="OralAbsorption" -->
La plupart des médicaments ne sont pas injectés directement dans le plasma : ils sont avalés, absorbés, distribués, puis éliminés.

C'est pourquoi les courbes orales concentration-temps **montent**, atteignent un pic, puis redescendent. La phase ascendante n'est pas du bruit : c'est l'absorption.
<!-- /step -->

<!-- step:title="Intuition" slides="s07" viz="OralAbsorption" -->
Avec une dose orale, les blocs attendent d'abord hors de la salle principale.

La constante d'absorption $K_a$ fixe la vitesse d'entrée des blocs. Un temps de latence $T_{lag}$ signifie que la porte reste fermée un moment avant que l'entrée commence.

:::key
La courbe observée est une **compétition** entre l'entrée (absorption) et la sortie (élimination). Le pic apparaît quand les deux s'équilibrent.
:::
<!-- /step -->

<!-- step:title="La formule décortiquée" slides="s07" viz="OralAbsorption" -->
Un modèle oral d'ordre 1 courant (courbe de Bateman) :

$$ C(t) = \frac{\text{Dose}}{V}\,\frac{K_a}{K_a-k}\left(e^{-k(t-T_{lag})}-e^{-K_a(t-T_{lag})}\right) $$

Pas besoin de mémoriser l'expression entière : lisez-la comme une entrée par absorption ($K_a$) opposée à une sortie par élimination ($k = CL/V$).

:::math
Augmentez $K_a$ : le pic arrive plus tôt et plus haut. Augmentez $T_{lag}$ : tout le début de la courbe se décale vers la droite.
:::
<!-- /step -->

<!-- step:title="Compartiments de transit" slides="s07" viz="OralAbsorption" -->
Un modèle à un seul $K_a$ suppose une montée immédiate, ce qui colle mal quand l'absorption est **progressive** (dissolution, vidange gastrique).

Les **compartiments de transit** remplacent l'entrée unique par une **chaîne** de $n$ compartiments traversés au rythme $k_{tr}$. Le médicament met un **temps de transit moyen** $\text{MTT} = n / k_{tr}$ à parvenir au compartiment central.

$$ \frac{dT_1}{dt} = -k_{tr}\,T_1 \qquad \frac{dT_i}{dt} = k_{tr}\,(T_{i-1}-T_i) \qquad \frac{dA}{dt} = k_{tr}\,T_n - k\,A $$

:::key
Cochez « Comparer aux compartiments de transit » : plus $n$ augmente, plus la montée devient **arrondie et retardée** — une alternative souple au simple $T_{lag}$.
:::
<!-- /step -->

<!-- step:title="Exemple concret" slides="s07" viz="OralAbsorption" -->
Dans l'explorateur, augmentez $K_a$.

Le pic arrive en général plus tôt et plus haut, car les blocs entrent vite dans la salle avant que le nettoyage n'en retire beaucoup. Un $T_{lag}$ plus grand ne change pas la hauteur du pic, mais décale le début de la montée.
<!-- /step -->

<!-- step:title="Piège fréquent" slides="s07" -->
N'estimez pas la demi-vie d'élimination à l'aveugle à partir de la pente terminale orale.

:::pitfall
Si l'absorption est plus lente que l'élimination, la dernière partie de la courbe reflète l'**absorption**, pas l'élimination : c'est la cinétique **flip-flop**. La pente terminale trompe alors sur la vraie demi-vie.
:::
<!-- /step -->

<!-- step:title="À retenir" -->
- Un profil oral combine absorption et élimination.
- $K_a$ contrôle la vitesse d'entrée.
- $T_{lag}$ décale le début de l'absorption.
- Cmax et Tmax sont des résumés, pas des paramètres du modèle en eux-mêmes.
<!-- /step -->
