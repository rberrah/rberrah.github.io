---
id: "tools-simulation"
slug: "tools-simulation"
title: "Simulation : mrgsolve & rxode2"
description: "Générer rapidement des profils, des VPC et des essais virtuels à partir d'un modèle."
summary: "Les simulateurs d'ODE en R (mrgsolve, rxode2) : à quoi ils servent et comment ils s'articulent avec l'estimation."
track: "tools"
order: 204
duration: "11 min"
level: "intermediate"
tags: ["tools", "mrgsolve", "rxode2", "simulation"]
prerequisites: ["tools-nlmixr2"]
glossary: ["mrgsolve", "nlmixr2 / rxode2", "VPC", "Jumeau numérique"]
slides: []
sources: ["mrgsolve", "fidler-nlmixr", "bergstrand-pcvpc", "mould-upton"]
reviewed_on: "2026-07-09"
quiz:
  - prompt: "mrgsolve et rxode2 servent surtout à..."
    options:
      - "simuler rapidement des ODE et de grandes populations (R)"
      - "estimer les paramètres à partir de données"
      - "dessiner des molécules"
    correct: 0
  - prompt: "Une VPC nécessite de..."
    options:
      - "simuler de nombreux jeux de données sous le modèle"
      - "une seule prédiction typique"
      - "aucune simulation"
    correct: 0
  - prompt: "Simuler un « essai virtuel » permet de..."
    options:
      - "évaluer designs et doses avant l'essai réel"
      - "remplacer la pharmacologie"
      - "supprimer la variabilité"
    correct: 0
---

<!-- step:title="Pourquoi ce chapitre" -->
Une fois un modèle estimé, la moitié de sa valeur vient de la **simulation** : prédire des scénarios de dose, construire une VPC, générer des essais virtuels. Il faut un moteur **rapide** capable d'intégrer des ODE sur de grandes populations.

En R, deux outils dominent : **mrgsolve** et **rxode2**.
<!-- /step -->

<!-- step:title="Intuition" viz="21_PopPKPlayground" -->
Simuler, c'est **faire tourner le modèle en avant** : donner des paramètres (et leur variabilité), un schéma de dose, et lire les concentrations prédites.

Répété sur des milliers de patients virtuels, cela donne des **distributions** — la base de la VPC et des essais simulés.
<!-- /step -->

<!-- step:title="La formule décortiquée" viz="21_PopPKPlayground" -->
Le simulateur intègre le système d'ODE du modèle :

$$ \frac{dA}{dt} = f(A, \theta_i, t), \qquad \theta_i = \theta\cdot e^{\eta_i} $$

- **mrgsolve** : intégrateur C++ très rapide, pensé pour la simulation d'essais et le TDM (base de mapbayr).
- **rxode2** : le moteur d'ODE sous **nlmixr2**, utilisable seul pour simuler.

:::note
La simulation réutilise le **modèle estimé** (θ, Ω, Σ). Propager l'**incertitude** des paramètres (pas seulement la variabilité) pour des prédictions honnêtes.
:::
<!-- /step -->

<!-- step:title="Exemple concret" viz="21_PopPKPlayground" -->
Pour une **VPC**, on simule des centaines de jeux sous le modèle et on compare les percentiles aux observations. Pour un **essai virtuel**, on teste plusieurs doses et tailles d'échantillon afin d'estimer la probabilité de succès.

mrgsolve rend ces simulations quasi instantanées, même sur des dizaines de milliers de sujets.
<!-- /step -->

<!-- step:title="Piège fréquent" -->
Une simulation hérite des faiblesses du modèle.

:::pitfall
« Garbage in, garbage out » : une simulation n'est fiable que si le modèle est **validé** et si l'on propage l'**incertitude** des paramètres. Simuler hors du **domaine** des données (doses, populations non observées) est une extrapolation risquée.
:::
<!-- /step -->

<!-- step:title="À retenir" -->
- mrgsolve / rxode2 : intégrateurs d'ODE rapides en R pour la simulation.
- Simuler = faire tourner le modèle en avant, avec variabilité, sur une population virtuelle.
- Usages : VPC, scénarios de dose, essais virtuels ; mrgsolve est la base de mapbayr.
- Propager l'incertitude ; ne pas extrapoler hors du domaine des données.
<!-- /step -->
