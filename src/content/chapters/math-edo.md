---
id: "math-edo"
slug: "math-edo"
title: "Équations différentielles et exponentielles"
description: "Pourquoi dA/dt = −k·A donne une décroissance exponentielle — la brique de tout modèle PK."
summary: "La base mathématique : taux de variation, solution exponentielle, semi-log et somme d'exponentielles."
track: "math"
order: 20
duration: "12 min"
level: "beginner"
tags: ["maths", "ode", "exponential"]
slides: []
sources: ["gibaldi-perrier", "rowland-tozer"]
reviewed_on: "2026-07-09"
quiz:
  - prompt: "La solution de dA/dt = −k·A est..."
    options:
      - "A(t) = A₀ · e^(−k·t)"
      - "A(t) = A₀ − k·t"
      - "A(t) = A₀ · e^(+k·t)"
    correct: 0
  - prompt: "Sur une échelle semi-logarithmique, une décroissance d'ordre 1 apparaît..."
    options:
      - "comme une droite"
      - "comme une courbe"
      - "comme un plateau"
    correct: 0
---

<!-- step:title="Pourquoi ce chapitre" -->
Tous les modèles PK sont des **équations différentielles** : elles décrivent comment une quantité **change** au cours du temps. Comprendre l'objet `dA/dt` démystifie le reste du cours.

Pas besoin d'être mathématicien : il suffit de lire une équation différentielle comme une **phrase** sur des vitesses.
<!-- /step -->

<!-- step:title="Intuition" viz="IVBolus" -->
Une équation différentielle relie une grandeur à sa **vitesse de variation**.

En PK d'ordre 1, la vitesse de sortie est **proportionnelle à ce qui reste** : plus il y a de médicament, plus il en part par unité de temps. Résultat : une **décroissance exponentielle**.
<!-- /step -->

<!-- step:title="La formule décortiquée" viz="IVBolus" -->
La brique de base :

$$ \frac{dA}{dt} = -k\,A \quad\Longrightarrow\quad A(t) = A_0\,e^{-k t} $$

Deux lectures utiles :

- la **demi-vie** $t_{1/2} = \ln(2)/k$ ne dépend que de $k$ ;
- en **échelle semi-log**, $\ln A(t) = \ln A_0 - k\,t$ devient une **droite** de pente $-k$.

:::math
C'est pourquoi on trace les concentrations en log : une seule phase = une droite ; deux phases = deux droites (bi-compartimental).
:::
<!-- /step -->

<!-- step:title="Exemple concret" viz="10_PK2C" -->
Quand il y a plusieurs compartiments, la solution est une **somme d'exponentielles** :

$$ C(t) = A\,e^{-\alpha t} + B\,e^{-\beta t} $$

Chaque exponentielle est une « phase » (distribution rapide α, élimination lente β). Passez la figure en semi-log : les deux pentes apparaissent.
<!-- /step -->

<!-- step:title="Piège fréquent" -->
Ne confondez pas décroissance **exponentielle** et **linéaire**.

:::pitfall
Une exponentielle ne devient jamais nulle « d'un coup » : elle diminue d'un facteur constant par demi-vie (50 %, 75 %, 87,5 %…). Lire une pente en échelle linéaire au lieu de semi-log est l'erreur classique.
:::
<!-- /step -->

<!-- step:title="À retenir" -->
- Une EDO relie une grandeur à sa vitesse de variation.
- Ordre 1 : $dA/dt = -k A \Rightarrow A(t)=A_0 e^{-kt}$, demi-vie $\ln2/k$.
- L'échelle semi-log linéarise ; le nombre de droites = nombre de compartiments.
- Modèle multi-compartimental = somme d'exponentielles.
<!-- /step -->
