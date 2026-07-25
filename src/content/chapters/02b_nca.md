---
id: "micro-macro"
slug: "micro-macro"
title: "Micro ou macro : deux écritures d'un même modèle"
description: "Le même modèle compartimental s'écrit en constantes de vitesse (ke, k12, k21) ou en clairances et volumes (CL, Q, V). Pourquoi on choisit CL/V."
summary: "Paramétrisation micro (constantes de vitesse) vs macro (clairances/volumes) : deux langages pour un même modèle, et pourquoi on garde CL/V."
track: "core"
order: 2.5
duration: "6 min"
level: "beginner"
tags: ["parametrisation", "micro", "macro", "clairance"]
slides: []
sources: ["gibaldi-perrier", "rowland-tozer", "holford-clearance"]
reviewed_on: "2026-07-14"
quiz:
  - prompt: "Dans un modèle à un compartiment, quelle égalité relie l'écriture micro à l'écriture macro ?"
    options:
      - "kₑ = CL / V"
      - "kₑ = CL × V"
      - "kₑ = V / CL"
    correct: 0
  - prompt: "Pourquoi ce cours privilégie-t-il l'écriture en CL, Q et V (macro) ?"
    options:
      - "parce que ces grandeurs ont un sens physiologique parlant (épuration, débit, espace de distribution)"
      - "parce que les constantes de vitesse micro sont fausses"
      - "parce que les logiciels n'acceptent que CL et V"
    correct: 0
  - prompt: "Une constante de transfert k₁₂ (micro)…"
    options:
      - "décrit une vitesse d'échange, sans grandeur physiologique directement mesurable"
      - "se mesure directement chez le patient au lit du malade"
      - "vaut toujours le double de k₂₁"
    correct: 0
---

<!-- step:title="Pourquoi ce chapitre" -->
Un même modèle compartimental peut s'écrire de **deux façons**. Elles décrivent exactement la même courbe : ce n'est pas une différence de modèle, mais une différence de **langage**.

- L'écriture **micro** utilise des **constantes de vitesse** : $k_e$ (élimination), $k_{12}$ et $k_{21}$ (échanges entre compartiments).
- L'écriture **macro** utilise des **clairances et des volumes** : $CL$ (épuration), $Q$ (débit inter-compartimental), $V_1$, $V_2$.

Ce court chapitre précise le lien entre les deux, et pourquoi la suite du cours garde le langage **macro**.
<!-- /step -->

<!-- step:title="Intuition" -->
Les deux écritures sont comme deux systèmes de coordonnées pour décrire le même point.

- Les constantes **micro** disent « à quelle **vitesse** » le médicament passe d'un compartiment à l'autre. Ce sont des taux, par unité de temps.
- Les grandeurs **macro** disent « **quelle capacité** d'épuration » ($CL$), « **quel débit** » entre compartiments ($Q$) et « **quel espace** » de distribution ($V$). Ce sont des grandeurs **physiologiques**.

Une constante de vitesse comme $k_{12}$ ne se mesure pas au chevet du patient ; une clairance, un volume, un débit sanguin, si — au moins par analogie physiologique.
<!-- /step -->

<!-- step:title="La formule décortiquée" viz="10_PK2C" -->
Le pont entre les deux est purement algébrique. Pour un modèle à **un compartiment** :

$$ k_e = \frac{CL}{V} $$

Pour un modèle à **deux compartiments** (central 1, périphérique 2), les constantes micro se déduisent des grandeurs macro :

$$ k_e = \frac{CL}{V_1}, \qquad k_{12} = \frac{Q}{V_1}, \qquad k_{21} = \frac{Q}{V_2} $$

:::math
Chaque constante de vitesse est un **rapport d'un débit sur un volume**. C'est la même information, réécrite : connaître $CL, Q, V_1, V_2$ suffit à retrouver toutes les constantes micro, et réciproquement.
:::
<!-- /step -->

<!-- step:title="Exemple concret" viz="10_PK2C" -->
Prenons un modèle à deux compartiments avec $CL = 6$ L/h, $Q = 4$ L/h, $V_1 = 30$ L, $V_2 = 20$ L.

En écriture micro : $k_e = 6/30 = 0{,}20$ h⁻¹, $k_{12} = 4/30 = 0{,}13$ h⁻¹, $k_{21} = 4/20 = 0{,}20$ h⁻¹.

Les deux jeux de nombres décrivent **la même courbe**. Mais « $CL = 6$ L/h » dit tout de suite quelque chose d'utile au clinicien (la capacité d'épuration), là où « $k_e = 0{,}20$ h⁻¹ » demande un détour.
<!-- /step -->

<!-- step:title="Piège fréquent" -->
Ne mélangez pas les deux écritures dans une même équation, et sachez toujours **laquelle** un article ou un logiciel utilise.

:::pitfall
Comparer ou transférer des paramètres d'un modèle à l'autre sans vérifier la paramétrisation est une erreur classique : un $k_{12}$ n'est pas un $Q$, et deux modèles « équivalents » peuvent afficher des nombres très différents selon l'écriture choisie. Les constantes micro n'ont par ailleurs **pas** de sens physiologique directement mesurable — c'est une raison de plus de raisonner en $CL$, $Q$, $V$.
:::
<!-- /step -->

<!-- step:title="À retenir" -->
- Un modèle compartimental s'écrit en **micro** (constantes de vitesse $k_e$, $k_{12}$, $k_{21}$) **ou** en **macro** (clairances et volumes $CL$, $Q$, $V$) : même courbe, deux langages.
- Le pont est algébrique : chaque constante de vitesse est un **débit divisé par un volume** ($k_e = CL/V$, $k_{12} = Q/V_1$, $k_{21} = Q/V_2$).
- **On choisit le langage macro** ($CL$, $Q$, $V$) pour la suite : ces grandeurs parlent à la médecine (épuration, débit, espace de distribution), là où les constantes micro sont équivalentes mais peu interprétables.
<!-- /step -->
