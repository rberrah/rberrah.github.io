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

L'absorption ne dépend pas que de la molécule : elle dépend aussi de la **galénique** (la forme pharmaceutique). Un même principe actif en comprimé à libération immédiate, en gélule ou en forme à libération prolongée entre dans le sang à des vitesses très différentes. C'est pourquoi la vitesse d'absorption est un paramètre à **estimer**, pas une constante universelle de la molécule.
<!-- /step -->

<!-- step:title="Intuition" slides="s07" viz="OralAbsorption" -->
Commençons par le modèle le plus simple : une **seule** constante d'absorption.

Avec une dose orale, les blocs attendent d'abord hors de la salle principale. La constante d'absorption $K_a$ fixe la **vitesse d'entrée** des blocs dans le compartiment central : plus $K_a$ est grande, plus l'entrée est rapide.

:::key
La courbe observée est une **compétition** entre l'entrée (absorption, pilotée par $K_a$) et la sortie (élimination, pilotée par $k = CL/V$). Le pic apparaît quand les deux flux s'équilibrent.
:::
<!-- /step -->

<!-- step:title="La formule décortiquée" slides="s07" viz="OralAbsorption" -->
Le modèle oral d'ordre 1 le plus simple (courbe de Bateman), **sans latence** :

$$ C(t) = \frac{\text{Dose}}{V}\,\frac{K_a}{K_a-k}\left(e^{-kt}-e^{-K_a t}\right) $$

Pas besoin de mémoriser l'expression entière : lisez-la comme une entrée par absorption ($K_a$) opposée à une sortie par élimination ($k = CL/V$). Les deux exponentielles se soustraient : au début l'absorption domine (la courbe monte), puis l'élimination l'emporte (la courbe descend).

:::math
Augmentez $K_a$ : le pic arrive plus tôt et plus haut. C'est le seul paramètre qui gouverne la **vitesse** de la montée dans ce modèle de base.
:::
<!-- /step -->

<!-- step:title="Temps de latence" slides="s07" viz="OralAbsorption" -->
Parfois, rien n'entre dans le sang pendant un moment après la prise (temps de désagrégation, vidange gastrique). On ajoute alors un **temps de latence** $T_{lag}$, qui décale simplement le départ de l'absorption :

$$ C(t) = \frac{\text{Dose}}{V}\,\frac{K_a}{K_a-k}\left(e^{-k(t-T_{lag})}-e^{-K_a(t-T_{lag})}\right) \quad \text{pour } t \geq T_{lag} $$

:::note
Le temps de latence est avant tout un **outil mathématique**, avec peu de sens physiologique direct, mais **très utile** pour décrire un retard d'absorption sans compliquer le modèle. C'est une « rustine » commode : elle capte le délai observé sans prétendre expliquer *pourquoi* il existe.
:::

Dans l'explorateur : augmentez $T_{lag}$ et tout le début de la courbe se décale vers la droite, sans changer la hauteur du pic.
<!-- /step -->

<!-- step:title="Compartiments de transit" slides="s07" viz="OralAbsorption" -->
Le $T_{lag}$ décale le départ mais garde une montée brutale. Quand l'absorption est **progressive** (dissolution, vidange gastrique), on peut faire mieux — et de façon plus physiologique — avec les compartiments de transit.

Un modèle à un seul $K_a$ suppose une montée immédiate, ce qui colle mal à une entrée étalée dans le temps.

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
