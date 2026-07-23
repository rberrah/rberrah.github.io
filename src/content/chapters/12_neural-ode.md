---
id: "neural-ode"
slug: "neural-ode"
title: "Modèles grey-box et Neural ODE"
description: "Là où l'apprentissage automatique peut aider sans remplacer la pharmacologie."
summary: "Introduction prudente aux modèles PK hybrides, aux covariables par ML et aux Neural ODE."
track: "ai"
order: 12
duration: "13 min"
level: "advanced"
tags: ["ai", "machine-learning", "neural-ode", "grey-box"]
slides: ["s63", "s65", "s66", "s68", "s69", "s70", "s71"]
sources: ["chen-neural-ode", "hughes-keizer", "woillard-ml-tacrolimus", "genuer-vsurf"]
reviewed_on: "2026-07-09"
quiz:
  - prompt: "Un modèle grey-box combine..."
    options:
      - "une structure mécaniste et des composants flexibles pilotés par les données"
      - "une structure entièrement mécaniste qui interdit tout composant appris des données"
      - "un réseau de neurones libre, sans aucune structure mécaniste sous-jacente"
    correct: 0
  - prompt: "Une Neural ODE est utile quand..."
    options:
      - "on veut une dynamique flexible tout en gardant un cadre d'EDO"
      - "on veut une solution analytique fermée sans résoudre la moindre EDO"
      - "on veut remplacer l'EDO par un réseau statique sans notion de temps"
    correct: 0
  - prompt: "Un risque majeur du ML en pharmacométrie est..."
    options:
      - "le surapprentissage et la mauvaise extrapolation"
      - "le sous-apprentissage dû à un modèle trop fortement contraint"
      - "la convergence trop lente de l'algorithme d'optimisation"
    correct: 0
---

<!-- step:title="Pourquoi ce chapitre" slides="s65" viz="20_NeuralBox" -->
Les jeux de données modernes peuvent être vastes et complexes. L'apprentissage automatique aide à détecter des motifs, mais la pharmacométrie a toujours besoin de mécanismes, d'unités et d'incertitude.

:::key
L'objectif pratique n'est pas « l'IA à la place de la PK », mais de meilleurs modèles où les composants flexibles sont utilisés **avec prudence**.
:::
<!-- /step -->

<!-- step:title="Intuition" slides="s66" viz="20_NeuralBox" -->
La PK mécaniste est une notice écrite par un enseignant. L'apprentissage automatique peut ajouter un **assistant flexible** qui remarque des motifs non spécifiés par l'enseignant.

Le danger : laisser l'assistant inventer une règle qui ne marche que pour la classe d'hier.
<!-- /step -->

<!-- step:title="Trois usages en pharmacométrie" slides="s66,s68,s69" viz="20_NeuralBox" -->
Le cours distingue trois rôles concrets de l'IA :

- **Sélection** (forêts aléatoires / VSURF) : trier des dizaines de covariables et repérer les vraiment influentes, au-delà du forward/backward manuel.
- **Prédiction** (ex. XGBoost) : apprendre directement une relation — par exemple concentration → AUC — sans passer par une équation différentielle.
- **Hybridation** (Neural ODE) : garder la structure mécaniste et ne confier au réseau que la partie inconnue.

:::note
Usage voisin : **clusteriser les EBE** pour découvrir des phénotypes (métaboliseurs lents/rapides) et générer des hypothèses cliniques.
:::
<!-- /step -->

<!-- step:title="La formule décortiquée" slides="s70" viz="20_NeuralBox" -->
Une EDO mécaniste pourrait être :

$$ \frac{dA}{dt} = f_{\mathrm{PK}}(A, \theta) $$

Un modèle grey-box ou Neural ODE l'étend :

$$ \frac{dA}{dt} = f_{\mathrm{PK}}(A, \theta) + f_{\mathrm{NN}}(A, x) $$

:::math
$f_{\mathrm{PK}}$ reste la partie mécaniste (interprétable, avec unités) ; $f_{\mathrm{NN}}$ est une correction apprise. Elle doit être **contrainte, vérifiée et interprétée** avec prudence, pas laissée libre.
:::
<!-- /step -->

<!-- step:title="Exemple concret" slides="s68,s69" viz="20_NeuralBox" -->
Un modèle de ML peut aider à classer des covariables, détecter des grappes d'EBE, ou capturer un motif non linéaire de biomarqueur.

Mais pour doser, le modèle doit encore répondre aux questions pharmacométriques de base : **quelles unités, où est l'incertitude, que se passe-t-il hors du domaine d'apprentissage ?**
<!-- /step -->

<!-- step:title="Piège fréquent" slides="s71" -->
Ne confondez pas exactitude prédictive dans un jeu de données et transportabilité scientifique.

:::pitfall
Un modèle flexible peut coller aux données observées tout en échouant sous une nouvelle dose, une nouvelle population ou un nouveau schéma de prélèvement. **L'extrapolation est là où la structure mécaniste gagne sa place.**
:::

:::clinical
Ne présentez jamais l'IA comme supérieure par défaut : sans validation externe ni incertitude affichée, un bon score interne ne garantit rien au lit du patient.
:::
<!-- /step -->

<!-- step:title="À retenir" slides="s70,s71" -->
- Trois usages : **sélection** (VSURF), **prédiction** (XGBoost), **hybridation** (Neural ODE).
- Les modèles grey-box combinent mécanisme et flexibilité ; les Neural ODE gardent une vision de système dynamique.
- Horizon : le **jumeau numérique** du patient (consortium DIGPHAT), fusion physiologie + IA.
- Conclusion clinique : **l'IA n'est pas magique, elle est utile**. Le médecin décide ; l'algorithme réduit l'incertitude. Extrapolation, incertitude et interprétabilité restent essentielles.

:::note
**Pour aller plus loin.** Ce chapitre est la **porte d'entrée** du tronc commun. Le parcours **« IA en pharmacométrie »** est un **approfondissement avancé, orienté recherche** (arbres, boosting, SVM, clustering, sélection de variables, LLM). C'est un domaine en **évolution rapide** : il n'est pas requis pour maîtriser les fondamentaux, et son contenu vieillit plus vite que le reste du site.
:::
<!-- /step -->
