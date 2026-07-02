---
id: "neural-ode"
slug: "neural-ode"
title: "Modèles grey-box et Neural ODE"
description: "Là où l'apprentissage automatique peut aider sans remplacer la pharmacologie."
summary: "Introduction prudente aux modèles PK hybrides, aux covariables par ML et aux Neural ODE."
track: "ai"
order: 11
duration: "13 min"
level: "advanced"
tags: ["ai", "machine-learning", "neural-ode", "grey-box"]
slides: ["s65", "s66", "s67", "s68", "s69", "s70"]
quiz:
  - prompt: "Un modèle grey-box combine..."
    options:
      - "une structure mécaniste et des composants flexibles pilotés par les données"
      - "aucune hypothèse et aucune donnée"
      - "seulement un tableur"
    correct: 0
  - prompt: "Une Neural ODE est utile quand..."
    options:
      - "on veut une dynamique flexible tout en gardant un cadre d'EDO"
      - "on veut éviter la validation"
      - "on n'a pas de variable temps"
    correct: 0
  - prompt: "Un risque majeur du ML en pharmacométrie est..."
    options:
      - "le surapprentissage et la mauvaise extrapolation"
      - "trop d'interprétabilité mécaniste"
      - "l'usage des unités"
    correct: 0
---

<!-- step:title="Pourquoi ce chapitre" slides="s65" viz="20_NeuralBox" -->
Les jeux de données modernes peuvent être vastes et complexes. L'apprentissage automatique aide à détecter des motifs, mais la pharmacométrie a toujours besoin de mécanismes, d'unités et d'incertitude.

:::key
L'objectif pratique n'est pas « l'IA à la place de la PK », mais de meilleurs modèles où les composants flexibles sont utilisés **avec prudence**.
:::
<!-- /step -->

<!-- step:title="Intuition" slides="s66,s67" viz="20_NeuralBox" -->
La PK mécaniste est une notice écrite par un enseignant. L'apprentissage automatique peut ajouter un **assistant flexible** qui remarque des motifs non spécifiés par l'enseignant.

Le danger : laisser l'assistant inventer une règle qui ne marche que pour la classe d'hier.
<!-- /step -->

<!-- step:title="La formule décortiquée" slides="s68" viz="20_NeuralBox" -->
Une EDO mécaniste pourrait être :

$$ \frac{dA}{dt} = f_{\mathrm{PK}}(A, \theta) $$

Un modèle grey-box ou Neural ODE l'étend :

$$ \frac{dA}{dt} = f_{\mathrm{PK}}(A, \theta) + f_{\mathrm{NN}}(A, x) $$

:::math
$f_{\mathrm{PK}}$ reste la partie mécaniste (interprétable, avec unités) ; $f_{\mathrm{NN}}$ est une correction apprise. Elle doit être **contrainte, vérifiée et interprétée** avec prudence, pas laissée libre.
:::
<!-- /step -->

<!-- step:title="Exemple concret" slides="s69,s70" viz="20_NeuralBox" -->
Un modèle de ML peut aider à classer des covariables, détecter des grappes d'EBE, ou capturer un motif non linéaire de biomarqueur.

Mais pour doser, le modèle doit encore répondre aux questions pharmacométriques de base : **quelles unités, où est l'incertitude, que se passe-t-il hors du domaine d'apprentissage ?**
<!-- /step -->

<!-- step:title="Piège fréquent" slides="s67" -->
Ne confondez pas exactitude prédictive dans un jeu de données et transportabilité scientifique.

:::pitfall
Un modèle flexible peut coller aux données observées tout en échouant sous une nouvelle dose, une nouvelle population ou un nouveau schéma de prélèvement. **L'extrapolation est là où la structure mécaniste gagne sa place.**
:::

:::clinical
Ne présentez jamais l'IA comme supérieure par défaut : sans validation externe ni incertitude affichée, un bon score interne ne garantit rien au lit du patient.
:::
<!-- /step -->

<!-- step:title="À retenir" -->
- L'IA peut soutenir la pharmacométrie, pas la remplacer.
- Les modèles grey-box combinent mécanisme et flexibilité.
- Les Neural ODE gardent une vision de système dynamique.
- Extrapolation, incertitude et interprétabilité restent essentielles.
<!-- /step -->
