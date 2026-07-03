---
id: "pbpk-absorption"
slug: "pbpk-absorption"
title: "Absorption orale et premier passage en PBPK"
description: "Du comprimé à la veine porte : dissolution, perméabilité, transit et effet de premier passage."
summary: "Modèles d'absorption orale mécanistes (ACAT/ADAM), classification BCS et premier passage hépatique."
track: "pbpk"
order: 72
duration: "12 min"
level: "advanced"
tags: ["pbpk", "absorption", "first-pass", "bcs"]
slides: []
quiz:
  - prompt: "Un modèle d'absorption mécaniste (ACAT/ADAM) découpe l'intestin en..."
    options:
      - "segments successifs avec dissolution, perméabilité et transit"
      - "un seul compartiment instantané"
      - "aucun compartiment"
    correct: 0
  - prompt: "L'effet de premier passage hépatique réduit..."
    options:
      - "la fraction de dose atteignant la circulation systémique"
      - "la demi-vie terminale"
      - "le volume de distribution"
    correct: 0
  - prompt: "Dans la classification BCS, une molécule dépend surtout de sa..."
    options:
      - "solubilité et sa perméabilité"
      - "couleur"
      - "dose létale"
    correct: 0
---

<!-- step:title="Pourquoi ce chapitre" -->
Pour un médicament **oral**, la biodisponibilité dépend d'une cascade : dissolution, perméabilité intestinale, transit, puis **premier passage** hépatique. La PBPK modélise chaque étape mécaniquement.

Cela permet de prédire l'effet d'une **formulation**, d'un repas ou d'une interaction sur l'absorption.
<!-- /step -->

<!-- step:title="Intuition" viz="OralAbsorption" -->
Le comprimé doit d'abord **se dissoudre**, puis la molécule doit **traverser** la paroi intestinale, le tout pendant qu'elle **transite** le long de l'intestin.

Chaque segment intestinal a son pH, sa surface et son transit : un modèle mécaniste (ACAT, ADAM) les enchaîne.
<!-- /step -->

<!-- step:title="La formule décortiquée" viz="OralAbsorption" -->
La biodisponibilité orale se factorise :

$$ F = f_a \cdot F_g \cdot F_h $$

- $f_a$ : fraction dissoute et absorbée (solubilité × perméabilité) ;
- $F_g$ : fraction échappant au métabolisme intestinal ;
- $F_h$ : fraction échappant au **premier passage** hépatique, $F_h = 1 - E_h$.

La **classification BCS** (solubilité/perméabilité) prédit le facteur limitant.

:::math
$F_h$ relie extraction hépatique et clairance : $E_h = \dfrac{CL_h}{Q_h}$. Un fort extracteur a un premier passage important et une biodisponibilité basse.
:::
<!-- /step -->

<!-- step:title="Exemple concret" viz="OralAbsorption" -->
Une molécule **BCS II** (peu soluble, bien perméable) voit son absorption **limitée par la dissolution** : une formulation améliorant la solubilité augmente $f_a$ et donc $F$.

Un fort extracteur hépatique aura une biodisponibilité orale faible et **variable** (sensible aux inhibiteurs/inducteurs enzymatiques).
<!-- /step -->

<!-- step:title="Piège fréquent" -->
Absorption n'est pas biodisponibilité.

:::pitfall
Une molécule peut être **bien absorbée** ($f_a$ élevé) mais peu biodisponible à cause d'un fort **premier passage** ($F_h$ bas). Confondre les deux mène à de mauvaises décisions de formulation. Le repas, le pH gastrique et les transporteurs compliquent encore la prédiction.
:::
<!-- /step -->

<!-- step:title="À retenir" -->
- L'absorption orale mécaniste enchaîne dissolution, perméabilité et transit (ACAT/ADAM).
- F = fa · Fg · Fh ; le premier passage hépatique (Fh = 1 − Eh) peut dominer.
- La classification BCS (solubilité/perméabilité) indique le facteur limitant.
- Bien absorbé ≠ biodisponible ; attention au premier passage et aux transporteurs.
<!-- /step -->
