---
id: "math-fisher"
slug: "math-fisher"
title: "Matrice d'information de Fisher et design optimal"
description: "Combien d'information un protocole apporte-t-il ? La FIM relie design, précision et nombre de prélèvements."
summary: "Matrice de Fisher, borne de Cramér-Rao, erreurs standards (RSE) et optimisation des temps de prélèvement (PFIM)."
track: "math"
order: 24
duration: "13 min"
level: "advanced"
tags: ["maths", "fisher-information", "optimal-design", "precision"]
slides: []
quiz:
  - prompt: "La matrice d'information de Fisher (FIM) sert à..."
    options:
      - "prédire la précision d'estimation des paramètres selon le design"
      - "calculer l'AUC"
      - "choisir la dose thérapeutique"
    correct: 0
  - prompt: "La borne de Cramér-Rao dit que la variance d'un estimateur non biaisé est..."
    options:
      - "au moins l'inverse de l'information de Fisher"
      - "toujours nulle"
      - "indépendante du design"
    correct: 0
  - prompt: "Un design optimal cherche à..."
    options:
      - "placer les prélèvements aux temps les plus informatifs"
      - "multiplier les prélèvements au hasard"
      - "réduire le nombre de patients à un"
    correct: 0
---

<!-- step:title="Pourquoi ce chapitre" -->
Avant de lancer une étude, une question cruciale : **où et quand prélever** pour estimer les paramètres avec précision, sans gaspiller de prélèvements ? La **matrice d'information de Fisher** (FIM) répond quantitativement.

C'est le fondement du **design optimal** de protocoles (échantillonnage clairsemé, populations fragiles).
<!-- /step -->

<!-- step:title="Intuition" viz="EstimationFit" -->
Certains temps de prélèvement sont **très informatifs** (la phase d'élimination pour la pente), d'autres presque inutiles (deux points collés).

Plus l'information est grande, plus la « vallée » de la vraisemblance est **étroite** autour de l'optimum → estimation précise. La FIM mesure cette courbure.
<!-- /step -->

<!-- step:title="La formule décortiquée" viz="EstimationFit" -->
La FIM est l'espérance de la courbure de la log-vraisemblance :

$$ I(\theta) = -\,\mathbb{E}\!\left[\frac{\partial^2 \log L}{\partial\theta\,\partial\theta^\top}\right] $$

La **borne de Cramér-Rao** en découle : pour tout estimateur non biaisé,

$$ \mathrm{Var}(\hat\theta) \ge I(\theta)^{-1} $$

Les **erreurs standards** (et donc les RSE %) s'obtiennent de $\sqrt{\text{diag}(I^{-1})}$. Un **design optimal** (critère D-optimalité) maximise $\det I(\theta)$.

:::note
Réf. : approche largement développée par l'équipe **IAME** (Inserm / Université Paris Cité, Bichat) — France Mentré et coll., logiciel **PFIM** pour le design optimal en modèles non linéaires à effets mixtes ; école de **Leiden** (LACDR) pour la modélisation PK/PD.
:::
<!-- /step -->

<!-- step:title="Exemple concret" viz="EstimationFit" -->
Pour un modèle mono-compartimental, la FIM indique que placer un prélèvement **précoce** (absorption/pic) et un **tardif** (pente d'élimination) estime mieux $CL$ et $V$ que trois points au milieu.

En pédiatrie, où chaque prélèvement compte, PFIM permet de concevoir un protocole **à 2–3 points** qui reste informatif.
<!-- /step -->

<!-- step:title="Piège fréquent" -->
La FIM prédit la précision, pas l'exactitude.

:::pitfall
La FIM suppose le **modèle correct** et repose souvent sur une **linéarisation** : elle donne une précision **optimiste** si le modèle est faux ou fortement non linéaire. Elle ne protège pas d'un biais dû à un mauvais modèle structural.
:::
<!-- /step -->

<!-- step:title="À retenir" -->
- La FIM relie le design (temps, doses, nombre de sujets) à la précision d'estimation.
- Cramér-Rao : Var(θ̂) ≥ I(θ)⁻¹ ; les RSE viennent de √diag(I⁻¹).
- Le design D-optimal maximise det(I) → prélèvements aux temps informatifs (PFIM, IAME).
- La FIM suppose le modèle vrai : précision ≠ exactitude.
<!-- /step -->
