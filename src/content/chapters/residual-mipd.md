---
id: "residual-mipd"
slug: "residual-mipd"
title: "L'erreur résiduelle en MIPD : un levier caché"
description: "En dosage de précision, l'erreur résiduelle n'est pas une constante figée : elle arbitre le poids des données du patient face au modèle de population."
summary: "Pourquoi et comment ajuster σ en MAPBE : la balance prior ↔ données, le gain de précision sur l'AUC, le risque de surajustement, et une conduite pratique."
track: "tools"
order: 206
duration: "15 min"
level: "advanced"
tags: ["mipd", "mapbe", "residual", "tdm", "auc", "precision-dosing"]
prerequisites: ["erreur-residuelle", "bayes-ebes", "tools-mipd"]
glossary: ["MAP", "TDM", "RUV", "ε / σ", "Precision dosing"]
slides: []
sources: ["berrah-residual", "sheiner-forecasting", "hughes-keizer", "minichmayr-mipd"]
reviewed_on: "2026-07-09"
quiz:
  - prompt: "Dans l'objectif de l'estimation MAP, que fait une erreur résiduelle σ plus petite ?"
    options:
      - "Elle augmente le poids des concentrations observées : le postérieur suit les données du patient."
      - "Elle augmente le poids du prior de population : le postérieur reste très proche du modèle moyen."
      - "Elle n'élargit que les intervalles de prédiction, sans déplacer l'estimation ponctuelle."
    correct: 0
  - prompt: "Quel est le risque principal d'une erreur résiduelle fixée quasi nulle sur des données bruitées ou éparses ?"
    options:
      - "Le sous-ajustement : le postérieur reste collé au prior et néglige les concentrations mesurées."
      - "Le surajustement : le modèle prend le bruit pour un signal et produit des AUC implausibles."
      - "Le biais systématique : le modèle sous-estime toutes les AUC d'un décalage à peu près constant."
    correct: 1
  - prompt: "Selon Berrah et al., quelle valeur d'erreur proportionnelle constitue un bon défaut pragmatique en contexte analytique de haute qualité ?"
    options:
      - "Environ 1 % (le scénario « Flat1 »), petit mais non nul."
      - "La valeur publiée du modèle, reprise systématiquement telle quelle."
      - "Une erreur nulle (σ = 0), pour coller au plus près des mesures."
    correct: 0
---

<!-- step:title="Pourquoi ce chapitre" -->
En **dosage de précision guidé par modèle** (MIPD), on réutilise un modèle de population *publié* pour adapter la dose d'un nouveau patient à partir de **quelques prélèvements** (TDM). Le cœur du calcul est l'estimation **MAP** bayésienne : elle combine ces mesures éparses avec le savoir a priori du modèle.

Un paramètre passe presque toujours inaperçu dans ce transfert : l'**erreur résiduelle** σ. On la reprend « telle que publiée », sans se demander si elle est encore adaptée — autre laboratoire, autre technique de dosage, autres horaires de prélèvement. Or ce n'est pas une constante inerte : c'est un **levier** qui règle à quel point l'estimation écoute le patient plutôt que la population.

:::recall
Rappel du chapitre « L'erreur résiduelle » : σ modélise l'écart entre la prédiction individuelle et l'observation (imprécision du dosage, aléas de prélèvement, petits défauts du modèle). Ici, on s'intéresse à son **rôle en estimation MAP**, pas à sa forme (additive/proportionnelle).
:::
<!-- /step -->

<!-- step:title="Intuition" viz="MipdResidualLever" -->
L'estimation MAP est un **compromis permanent** entre deux voix : le **prior** (ce que la population dit du patient « moyen ») et les **données** (les prélèvements de *ce* patient). L'erreur résiduelle σ est le **bouton de volume** entre les deux.

Un **petit σ** monte le volume des données : le postérieur est tiré vers les points mesurés. Un **grand σ** laisse parler le prior : les paramètres restent proches de la population.

:::howto
**Comment lire le schéma.** La courbe pointillée est le prior (patient « moyen »). Les points sont les prélèvements de *ce* patient (dont la clairance diffère). Baissez σ : le poids passe aux données, la courbe postérieure quitte le prior pour épouser les points, et l'AUC estimée rejoint la vraie exposition individuelle.
:::
<!-- /step -->

<!-- step:title="La formule décortiquée" -->
Ce compromis est exactement ce que minimise le critère de l'estimation MAP, qui met en balance **deux forces** :

$$ \text{Critère} \;=\; \underbrace{\sum_{i} \frac{(y_i - \hat{y}_i)^2}{\sigma_i^2}}_{\text{fidélité aux données}} \;+\; \underbrace{\sum_{j} \frac{\eta_j^2}{\omega_j^2}}_{\text{fidélité au prior}} $$

- Le **premier terme** pénalise l'écart entre concentrations observées $y_i$ et prédites $\hat{y}_i$, **pondéré par $1/\sigma_i^2$**.
- Le **second terme** pénalise l'éloignement des paramètres individuels ($\eta_j$) par rapport à la population, pondéré par $1/\omega_j^2$.

La division par $\sigma_i^2$ dit tout : plus σ est **petit**, plus $1/\sigma_i^2$ est **grand**, plus une même erreur de prédiction **coûte cher** — l'algorithme est contraint de coller aux données plutôt qu'au prior.
<!-- /step -->

<!-- step:title="Exemple concret" -->
Puisque la valeur publiée de σ a été estimée sur *une autre* population et *d'autres* conditions, la garder aveuglément peut sous-exploiter les mesures du patient. La conséquence est directe : **réduire σ améliore la précision de l'AUC individuelle**.

C'est le résultat central de **Berrah et al. (2025)**. Sur des jeux riches de tacrolimus, iohexol et acide mycophénolique, avec seulement 3 prélèvements par patient, abaisser l'erreur proportionnelle a réduit la **RMSE** des AUC de **30 à 40 %** par rapport au modèle d'origine. Pour le tacrolimus, la RMSE tombe de **28,5 % à 16,3 %** en passant à une erreur de 1 % ; pour l'iohexol, une erreur quasi nulle atteint jusqu'à **40 %** de réduction.

:::key
Plus l'analytique est fiable, plus il est légitime de faire confiance aux mesures. Réduire σ **renforce l'influence des données observées** sur le postérieur, sans changer la structure du modèle ni collecter de prélèvements supplémentaires : un gain « gratuit » de précision.
:::

Fait notable de l'étude : c'est quand le modèle d'origine était **le moins précis** que la réduction de σ apportait le plus — l'augmentation du poids des données corrige en partie l'imprécision d'un modèle importé d'un autre contexte (par ex. développé sur des patients de réanimation puis appliqué en population générale).
<!-- /step -->

<!-- step:title="Piège fréquent" -->
Si un peu de données vaut mieux que trop de prior, faut-il pousser σ à **zéro** ? Non — et c'est là tout le sel.

:::pitfall
Avec des données **bruitées ou éparses**, un σ quasi nul fait interpréter chaque fluctuation de mesure comme un vrai signal biologique. Le modèle **poursuit le bruit** : les paramètres deviennent instables et l'AUC peut devenir absurde. Berrah et al. rapportent de rares cas de tacrolimus avec une AUC estimée **> 1000 mcg·h/L** lorsque σ était mis à zéro. Ce surajustement se repère à l'œil : la courbe postérieure épouse chaque point de trop près et donne des valeurs cliniquement invraisemblables.
:::

Dans leur analyse, ce piège restait rare (3 patients sur 321), mais il rappelle que σ code aussi le **bruit total d'observation** — imprécision analytique *plus* aléas pré-analytiques (horaires, manipulation) — et pas seulement le CV du dosage. Manipulez le curseur de bruit du schéma, ramenez σ à 1 % : la courbe postérieure se met à onduler vers les points bruités et l'écart d'AUC dérape.
<!-- /step -->

<!-- step:title="Que choisir en pratique" -->
La ligne de conduite proposée par Berrah et al. est un compromis entre individualisation et robustesse :

| Contexte | σ proportionnel conseillé |
|---|---|
| Analytique de haute qualité (LC-MS/MS), prélèvements bien tracés | ≈ **1 %** (« Flat1 »), petit mais **non nul** |
| Bruit d'observation plus élevé, TDM moins maîtrisé | **2 – 5 %** |
| En cas de doute | balayage rapide **0,5 – 3 %** + diagnostics (fits visuels, résidus) |
| Horaires imprécis / manipulation variable | ajouter un petit terme **additif** à l'erreur |

Le scénario **Flat1 (1 %)** ressort comme un bon défaut au niveau *population* ; au niveau *individuel*, l'erreur nulle était souvent la plus exacte pour capter les profils extrêmes, mais au prix d'un risque de surajustement. Un σ **petit mais non nul** empêche le prior d'écraser des données éparses tout en amortissant le bruit.

:::note
Cette approche est un **cousin** du *flattening the prior* de Hughes & Keizer (gonfler $\omega^2$ pour alléger le prior) : les deux redonnent du poids aux données. Berrah et al. agissent sur σ plutôt que sur $\omega$ pour isoler l'effet de l'erreur résiduelle. Dans les deux cas, l'étude recommande de **documenter explicitement** le paramètre choisi et sa justification lorsqu'on réutilise un modèle publié.
:::
<!-- /step -->

<!-- step:title="À retenir" -->
- En MIPD, l'erreur résiduelle σ n'est **pas** une constante figée : c'est un levier qui règle le poids des **données du patient** face au **prior** de population dans l'estimation MAP.
- **Réduire σ** renforce l'influence des mesures et **améliore la précision de l'AUC** — Berrah et al. rapportent 30–40 % de RMSE en moins (tacrolimus : 28,5 % → 16,3 % à 1 %), sans nouveau prélèvement ni redéveloppement du modèle.
- **σ trop petit** (≈ 0) sur des données bruitées → **surajustement** : le modèle suit le bruit et produit des AUC invraisemblables.
- Défaut pragmatique : **≈ 1 %** en contexte de haute qualité, **2–5 %** sinon ; vérifier par un balayage de sensibilité et des diagnostics ; ajouter un terme additif si les horaires sont imprécis.
- **Documenter** le σ retenu et sa justification lors de la réutilisation d'un modèle publié.

:::note
**Référence.** Berrah R, Minichmayr IK, Woillard JB, au nom du groupe Pharmacométrie de l'IATDMCT. *Better Dosing Through Better Error: Residual Error as a Hidden Lever in Model-Informed Precision Dosing.* Ther Drug Monit. 2025.
:::
<!-- /step -->
