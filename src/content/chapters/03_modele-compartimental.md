---
id: "clairance-volume-demi-vie"
slug: "clairance-volume-demi-vie"
title: "Clairance et volume"
description: "Le modèle à un compartiment : CL comme un débit, V comme un espace — et la demi-vie comme une simple conséquence des deux."
summary: "Introduction visuelle aux paramètres au cœur de la plupart des modèles PK."
track: "core"
order: 3
duration: "16 min"
level: "beginner"
tags: ["model", "ode", "cl", "v", "half-life"]
glossary: ["CL", "V", "t½", "ke", "EDO", "Phases α et β", "Vss"]
slides: ["s03", "s04", "s05", "s06", "s08", "s09", "s12", "s67", "s74"]
sources: ["rowland-tozer", "holford-clearance", "gibaldi-perrier"]
reviewed_on: "2026-07-09"
quiz:
  - prompt: "Après un bolus IV, la concentration initiale vaut..."
    options:
      - "Dose multipliée par CL"
      - "Dose divisée par V"
      - "Dose divisée par CL"
    correct: 1
  - prompt: "La demi-vie dépend de..."
    options:
      - "de la clairance CL uniquement"
      - "du volume de distribution seul"
      - "à la fois de V et de CL"
    correct: 2
  - prompt: "Un V plus grand, à même dose, donne en général..."
    options:
      - "une concentration initiale plus basse"
      - "une concentration initiale plus haute"
      - "aucun changement de concentration"
    correct: 0
---

<!-- step:title="Pourquoi ce chapitre" slides="s67" viz="IVBolus" -->
Clairance, volume et demi-vie sont les trois premiers paramètres que l'on rencontre en PK. Ce sont aussi les plus faciles à confondre.

Le modèle à un compartiment est utile parce qu'il sépare trois idées distinctes :

- à quel point la dose est **diluée** ;
- à quelle vitesse le médicament **quitte** l'organisme ;
- combien de temps la concentration met à **diminuer de moitié**.
<!-- /step -->

<!-- step:title="Intuition" slides="s12" viz="BucketSim" -->
Le cours en donne une image hydraulique très parlante : **le médicament est de l'eau dans un réservoir**.

- La **largeur du réservoir** est le **volume de distribution V** : à même quantité, un réservoir plus large donne un niveau plus bas.
- Le **niveau du liquide** est la **concentration C(t)**.
- L'**ouverture du robinet** est la **clairance CL** : plus il est ouvert, plus le réservoir se vide vite.

Manipulez le modèle : lancez la lecture, puis élargissez le réservoir ou ouvrez le robinet et regardez la courbe à droite.

:::key
Élargir le réservoir (augmenter V) et ouvrir le robinet (augmenter CL) n'ont pas le même effet : V abaisse le niveau de départ, CL accélère la vidange. La demi-vie combine les deux.
:::

:::note
Ce volume est **apparent**, parfois carrément **fictif** : il traduit une dilution, pas un contenant réel. Un médicament très fixé aux tissus peut afficher un volume de distribution de **1 000 L** — impossible pour un corps humain. Cela signifie simplement que la concentration plasmatique mesurée est très basse au regard de la dose : le produit s'est massivement réparti hors du plasma.
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

:::clinical
Physiologiquement, la clairance est une **capacité d'extraction** : $CL = Q_{organe}\cdot E$ (débit sanguin de l'organe × coefficient d'extraction $E$). Elle s'additionne par voie : $CL_{tot} = CL_r$ (rénale) $+\ CL_{nr}$ (hépatique et autres).

La clairance de la créatinine n'approche que la **filtration glomérulaire** (DFG ≈ 120 mL/min), **pas** la clairance rénale totale. Celle-ci résulte aussi de la **sécrétion** et de la **réabsorption** tubulaires : en cas de réabsorption, la clairance rénale d'un médicament peut être très inférieure au DFG ; en cas de sécrétion active, elle peut au contraire le dépasser. La clairance de la créatinine n'est donc un bon estimateur de la clairance rénale que pour les molécules purement filtrées.
:::
<!-- /step -->

<!-- step:title="Exemple concret" viz="IVBolus" -->
Les patients A et B reçoivent chacun 100 mg.

Si A a $V = 10\ \text{L}$, alors $C_0 = 10\ \text{mg/L}$. Si B a $V = 20\ \text{L}$, alors $C_0 = 5\ \text{mg/L}$.

Même dose, espace apparent différent, concentration de départ différente. Faites glisser V dans la figure : la courbe entière monte ou descend sans changer sa pente.
<!-- /step -->

<!-- step:title="Deux compartiments" slides="s08" viz="10_PK2C" -->
Beaucoup de médicaments ne se distribuent pas instantanément : ils passent d'abord dans un **compartiment central** (sang, organes bien perfusés) puis, plus lentement, dans un **compartiment périphérique** (tissus).

Sur une courbe **semi-logarithmique**, cela donne **deux pentes** :

- la **phase α** (rapide) : distribution vers les tissus ;
- la **phase β** (lente) : élimination réelle.

:::key
D'où plusieurs volumes : $V_1$ (central), $V_{ss}$ (à l'équilibre) et $V_{aire}$ (de la phase β). La demi-vie terminale dépend de la phase β, pas de la distribution initiale.
:::

Comparez à la référence 1-compartiment : ignorer la distribution surestime les concentrations précoces.
<!-- /step -->

<!-- step:title="Piège fréquent" slides="s09" viz="IVBolus" -->
La demi-vie n'est **pas un vrai paramètre à part**, séparé de la clairance et du volume :

$$ t_{1/2} = \frac{0{,}693\, V}{CL} $$

Les deux paramètres **primaires** du modèle sont $CL$ et $V$ (ce sont eux qu'on estime, et qui portent un sens physiologique). La demi-vie n'en est qu'une **conséquence** — une reformulation commode, qu'on garde parce qu'un temps (en heures) « nous parle » plus qu'un débit divisé par un volume. La manipuler comme si elle pilotait la PK indépendamment de $CL$ et $V$ est une source classique de confusion.

:::pitfall
Une demi-vie plus longue peut venir d'un volume plus grand, d'une clairance plus basse, ou des deux — des histoires biologiques différentes. Demandez toujours : **quel paramètre primaire (CL ou V) a changé ?**
:::
<!-- /step -->

<!-- step:title="À retenir" -->
- $CL$ et $V$ sont les deux paramètres **primaires** : le volume contrôle la dilution, la clairance la capacité d'épuration.
- La demi-vie n'est pas un paramètre indépendant : elle se **déduit** de $V$ et de $CL$ ($t_{1/2} = 0{,}693\,V/CL$). On la garde parce qu'elle est plus parlante, pas parce qu'elle serait « plus fondamentale ».
- Le volume est **apparent**, parfois fictif : il peut dépasser tout volume corporel réel.
- Un modèle compartimental simple est d'abord un modèle pédagogique, puis un modèle prédictif s'il colle aux données.
<!-- /step -->
