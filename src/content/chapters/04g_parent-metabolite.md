---
id: "parent-metabolite"
slug: "parent-metabolite"
title: "Modèles parent/métabolite"
description: "Modéliser un médicament et son métabolite : formation, élimination, et qui limite la cinétique."
summary: "Le modèle parent → métabolite : fraction métabolisée, régime limité par la formation ou par l'élimination, métabolites actifs."
track: "core"
order: 4.8
duration: "13 min"
level: "advanced"
tags: ["metabolite", "parent", "formation", "active-metabolite"]
prerequisites: ["clairance-volume-demi-vie"]
glossary: ["CL", "t½", "ke", "Michaelis-Menten"]
slides: []
quiz:
  - prompt: "Dans un modèle parent/métabolite, le métabolite apparaît d'abord..."
    options:
      - "par formation à partir du parent (montée puis descente)"
      - "instantanément à sa concentration finale"
      - "avant l'administration"
    correct: 0
  - prompt: "Si le métabolite s'élimine plus lentement que le parent (km < k), sa pente terminale est..."
    options:
      - "gouvernée par sa propre élimination (km) : il persiste"
      - "toujours identique à celle du parent"
      - "nulle"
    correct: 0
  - prompt: "Un métabolite actif est important car..."
    options:
      - "il contribue à l'effet (et parfois à la toxicité)"
      - "il n'a jamais d'effet"
      - "il change la dose du parent"
    correct: 0
---

<!-- step:title="Pourquoi ce chapitre" -->
Beaucoup de médicaments sont **transformés** en un ou plusieurs métabolites. Ceux-ci peuvent être **inactifs**, **actifs** (contribuant à l'effet), ou **toxiques**. Les modéliser ensemble — parent **et** métabolite — est parfois indispensable.

C'est aussi un beau cas de couplage : la sortie du parent est l'**entrée** du métabolite.
<!-- /step -->

<!-- step:title="Intuition" viz="65_ParentMetabolite" -->
Le parent **décroît** ; le métabolite, lui, doit d'abord être **formé** — sa courbe **monte** puis **descend**, comme une absorption.

La question clé : qui est le plus lent ? Si le métabolite s'élimine **vite**, sa concentration suit celle du parent. S'il s'élimine **lentement**, il **persiste** longtemps après la disparition du parent.
<!-- /step -->

<!-- step:title="La formule décortiquée" viz="65_ParentMetabolite" -->
Le couplage s'écrit :

$$ \frac{dA_{par}}{dt} = -k\,A_{par}, \qquad \frac{dA_{met}}{dt} = f_m\,k\,A_{par} - k_m\,A_{met} $$

où $f_m$ est la **fraction métabolisée** (vers ce métabolite), $k$ et $k_m$ les constantes d'élimination.

:::howto
**La métaphore des deux seaux en cascade.** L'eau tombe du seau « parent » dans le seau « métabolite », qui fuit à son propre rythme. Si le second seau fuit **vite** (km grand), son niveau suit celui du premier ; s'il fuit **lentement** (km petit), il reste plein bien après que le premier soit vide.

**Côté maths.** La pente terminale du métabolite vaut $\min(k, k_m)$ : c'est **l'étape la plus lente** qui gouverne. Si $k_m > k$ (formation-limité), le métabolite disparaît au rythme du parent (**flip-flop** de métabolite) ; si $k_m < k$ (élimination-limité), il persiste.
:::
<!-- /step -->

<!-- step:title="Exemple concret" viz="65_ParentMetabolite" -->
La **morphine** produit le **M6G**, un métabolite **actif** (analgésique) éliminé par le rein : en insuffisance rénale, le M6G **s'accumule** (élimination-limité) et peut provoquer une sédation prolongée.

À l'inverse, un métabolite éliminé plus vite que le parent reste discret : sa cinétique n'est visible que tant que le parent l'alimente.
<!-- /step -->

<!-- step:title="Piège fréquent" -->
On ne peut pas toujours tout identifier.

:::pitfall
Avec les seules données du métabolite, on **ne sépare pas** $f_m$ de son volume : on estime $f_m/V_{met}$ (paramètres **apparents**), sauf à disposer d'une administration directe du métabolite. Et un métabolite **actif** ignoré fausse la relation exposition–effet : l'effet peut persister alors que le **parent** a disparu.
:::
<!-- /step -->

<!-- step:title="À retenir" -->
- Le métabolite est formé à partir du parent : sa courbe monte puis descend.
- dA_met/dt = fm·k·A_par − km·A_met ; la pente terminale = min(k, km) (l'étape la plus lente).
- km > k : formation-limité (suit le parent) ; km < k : élimination-limité (persiste).
- Métabolites actifs/toxiques : à modéliser ; fm et V souvent seulement apparents (fm/V).
<!-- /step -->
