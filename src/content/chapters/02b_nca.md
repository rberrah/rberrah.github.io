---
id: "micro-macro"
slug: "micro-macro"
title: "Constantes de vitesse ou clairances et volumes"
description: "Le même modèle compartimental s'écrit en constantes de vitesse (ke, k12, k21) ou en clairances et volumes (CL, Q, V), sans confondre ces derniers avec les macroconstantes alpha et bêta."
summary: "Deux paramétrisations équivalentes d'un modèle compartimental, et le sens précis des termes microconstantes et macroconstantes."
track: "core"
order: 2.5
duration: "6 min"
level: "beginner"
tags: ["parametrisation", "micro", "macro", "clairance"]
prerequisites: ["trois-approches"]
glossary: ["CL", "V", "Q", "ke"]
slides: []
sources: ["gibaldi-perrier", "rowland-tozer", "holford-clearance"]
updated_on: "2026-10-09"
reviewed_on: "2026-10-09"
review_type: "author"
review_pending: true
reviewed_hash: "7533cd15fbaa793e3c73af47c154be31e2dc57cb7866717a8d68a44114b4e2f9"
quiz:
  - prompt: "Dans un modèle à un compartiment, quelle égalité relie la constante d'élimination à CL et V ?"
    options:
      - "kₑ = CL / V"
      - "kₑ = CL × V"
      - "kₑ = V / CL"
    correct: 0
  - prompt: "Pourquoi ce cours privilégie-t-il l'écriture en CL, Q et V ?"
    options:
      - "parce que ces grandeurs ont une interprétation physiologique utile, même si elles restent des paramètres de modèle"
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
Un même modèle compartimental peut s'écrire avec des **constantes de vitesse** ou avec des **clairances et volumes**. À conditions initiales et échelles cohérentes, ces paramétrisations décrivent le même système : ce n'est pas une différence de structure.

- Les **microconstantes** sont des **constantes de vitesse** : $k_e$ (élimination), $k_{12}$ et $k_{21}$ (échanges entre compartiments).
- La paramétrisation en **clairances et volumes** utilise $CL$ (épuration), $Q$ (clairance inter-compartimentale), $V_1$ et $V_2$.

Dans la nomenclature classique d'une équation biexponentielle, les **macroconstantes** sont plutôt les pentes hybrides $\alpha$, $\beta$ et leurs coefficients $A$, $B$. Appeler globalement $CL/Q/V$ « macro » est donc un raccourci ambigu ; la suite du cours dira **paramétrisation en clairances et volumes**.
<!-- /step -->

<!-- step:title="Intuition" -->
Les deux écritures sont comme deux systèmes de coordonnées pour décrire le même point.

- Les constantes de vitesse disent « à quelle **vitesse relative** » le médicament quitte un compartiment. Ce sont des taux, par unité de temps.
- Les clairances et volumes disent « **quelle capacité** d'épuration » ($CL$), « **quelle clairance apparente** » entre compartiments ($Q$) et « **quel espace apparent** » de distribution ($V$). Ils ont une interprétation physiologique utile, mais restent des paramètres de modèle : $Q$ n'est pas forcément un débit anatomique mesuré, et $V$ est souvent apparent.

Une constante de vitesse comme $k_{12}$ ne se mesure pas au chevet du patient ; une clairance, un volume ou un débit apparent sont plus parlants — au moins par analogie physiologique.
<!-- /step -->

<!-- step:title="La formule décortiquée" viz="10_PK2C" -->
Le pont entre les deux est purement algébrique. Pour un modèle à **un compartiment** :

$$ k_e = \frac{CL}{V} $$

Pour un modèle à **deux compartiments** (central 1, périphérique 2), les constantes de vitesse se déduisent de $CL$, $Q$, $V_1$ et $V_2$ :

$$ k_e = \frac{CL}{V_1}, \qquad k_{12} = \frac{Q}{V_1}, \qquad k_{21} = \frac{Q}{V_2} $$

:::math
Chaque constante de vitesse est un **rapport d'une clairance sur un volume**. Connaître $CL, Q, V_1, V_2$ suffit donc à retrouver ces constantes. L'inverse exige au moins une information d'échelle, par exemple $V_1$ : les constantes de vitesse seules ne permettent pas de reconstruire simultanément toutes les clairances et tous les volumes.
:::
<!-- /step -->

<!-- step:title="Exemple concret" viz="10_PK2C" -->
Prenons un modèle à deux compartiments avec $CL = 6$ L/h, $Q = 4$ L/h, $V_1 = 30$ L, $V_2 = 20$ L.

En constantes de vitesse : $k_e = 6/30 = 0{,}20$ h⁻¹, $k_{12} = 4/30 = 0{,}13$ h⁻¹, $k_{21} = 4/20 = 0{,}20$ h⁻¹.

Les deux jeux de nombres décrivent **la même courbe**. Mais « $CL = 6$ L/h » dit tout de suite quelque chose d'utile au clinicien (la capacité d'épuration), là où « $k_e = 0{,}20$ h⁻¹ » demande un détour.
<!-- /step -->

<!-- step:title="Piège fréquent" -->
Ne mélangez pas les paramétrisations dans une même équation, et sachez toujours **laquelle** un article ou un logiciel utilise.

:::pitfall
Comparer ou transférer des paramètres d'un modèle à l'autre sans vérifier la paramétrisation est une erreur classique : un $k_{12}$ n'est pas un $Q$, et deux modèles « équivalents » peuvent afficher des nombres très différents selon l'écriture choisie. Les constantes micro n'ont par ailleurs **pas** de sens physiologique directement mesurable — c'est une raison de plus de raisonner en $CL$, $Q$, $V$, sans oublier leur caractère apparent.
:::
<!-- /step -->

<!-- step:title="À retenir" -->
- Un modèle compartimental peut s'écrire avec des **microconstantes** ($k_e$, $k_{12}$, $k_{21}$) ou avec des **clairances et volumes** ($CL$, $Q$, $V$) : même système, deux paramétrisations.
- Le pont est algébrique : chaque constante de vitesse est un **débit divisé par un volume** ($k_e = CL/V$, $k_{12} = Q/V_1$, $k_{21} = Q/V_2$).
- La suite privilégie $CL$, $Q$ et $V$ pour leur interprétation, tout en réservant le terme **macroconstantes** aux pentes et coefficients hybrides ($\alpha$, $\beta$, $A$, $B$) lorsque cette écriture est utilisée.
<!-- /step -->
