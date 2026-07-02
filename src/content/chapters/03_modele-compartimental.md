---
id: "clairance-volume-demi-vie"
slug: "clairance-volume-demi-vie"
title: "Clairance, volume et demi-vie"
description: "Le modèle à un compartiment : CL comme un débit, V comme un espace, la demi-vie comme leur rapport."
summary: "Introduction visuelle aux paramètres au cœur de la plupart des modèles PK."
track: "core"
order: 3
duration: "16 min"
level: "beginner"
tags: ["model", "ode", "cl", "v", "half-life"]
slides: ["s10", "s11", "s12", "s25"]
quiz:
  - prompt: "Après un bolus IV, la concentration initiale vaut..."
    options:
      - "Dose multipliée par CL"
      - "Dose divisée par V"
      - "Dose divisée par CL"
    correct: 1
  - prompt: "La demi-vie dépend de..."
    options:
      - "CL seulement"
      - "V seulement"
      - "à la fois V et CL"
    correct: 2
  - prompt: "Un V plus grand, à même dose, donne en général..."
    options:
      - "une concentration initiale plus basse"
      - "une concentration initiale plus haute"
      - "aucun changement de concentration"
    correct: 0
---

<!-- step:title="Pourquoi ce chapitre" slides="s10" viz="IVBolus" -->
Clairance, volume et demi-vie sont les trois premiers paramètres que l'on rencontre en PK. Ce sont aussi les plus faciles à confondre.

Le modèle à un compartiment est utile parce qu'il sépare trois idées distinctes :

- à quel point la dose est **diluée** ;
- à quelle vitesse le médicament **quitte** l'organisme ;
- combien de temps la concentration met à **diminuer de moitié**.
<!-- /step -->

<!-- step:title="Intuition" slides="s10,s11" viz="BucketSim" -->
Le cours en donne une image hydraulique très parlante : **le médicament est de l'eau dans un réservoir**.

- La **largeur du réservoir** est le **volume de distribution V** : à même quantité, un réservoir plus large donne un niveau plus bas.
- Le **niveau du liquide** est la **concentration C(t)**.
- L'**ouverture du robinet** est la **clairance CL** : plus il est ouvert, plus le réservoir se vide vite.

Manipulez le modèle : lancez la lecture, puis élargissez le réservoir ou ouvrez le robinet et regardez la courbe à droite.

:::key
Élargir le réservoir (augmenter V) et ouvrir le robinet (augmenter CL) n'ont pas le même effet : V abaisse le niveau de départ, CL accélère la vidange. La demi-vie combine les deux.
:::
<!-- /step -->

<!-- step:title="La formule décortiquée" slides="s12" viz="IVBolus" -->
Pour un bolus IV, la concentration initiale est :

$$ C_0 = \frac{\text{Dose}}{V} $$

et la quantité décroît selon :

$$ \frac{dA}{dt} = -\frac{CL}{V}\,A $$

Le rapport $CL/V$ est la constante d'élimination :

$$ k = \frac{CL}{V} $$

:::math
Le volume dilue (fixe $C_0$) ; la clairance est une **capacité d'épuration** (un débit, en L/h). Leur rapport, et lui seul, fixe la vitesse de décroissance.
:::
<!-- /step -->

<!-- step:title="Exemple concret" viz="IVBolus" -->
Les patients A et B reçoivent chacun 100 mg.

Si A a $V = 10\ \text{L}$, alors $C_0 = 10\ \text{mg/L}$. Si B a $V = 20\ \text{L}$, alors $C_0 = 5\ \text{mg/L}$.

Même dose, espace apparent différent, concentration de départ différente. Faites glisser V dans la figure : la courbe entière monte ou descend sans changer sa pente.
<!-- /step -->

<!-- step:title="Piège fréquent" slides="s25" viz="IVBolus" -->
La demi-vie n'est pas une propriété magique qui remplacerait clairance et volume :

$$ t_{1/2} = \frac{0{,}693\, V}{CL} $$

:::pitfall
Une demi-vie plus longue peut venir d'un volume plus grand, d'une clairance plus basse, ou des deux — des histoires biologiques différentes. Demandez toujours : **quel paramètre a changé ?**
:::
<!-- /step -->

<!-- step:title="À retenir" -->
- Le volume contrôle la dilution.
- La clairance contrôle la capacité d'épuration.
- La demi-vie se **déduit** du volume et de la clairance.
- Un modèle compartimental simple est d'abord un modèle pédagogique, puis un modèle prédictif s'il colle aux données.
<!-- /step -->
