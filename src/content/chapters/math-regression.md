---
id: "math-regression"
slug: "math-regression"
title: "Régression, vraisemblance et estimation"
description: "Des moindres carrés à la vraisemblance : comment on ajuste un modèle à des données."
summary: "Estimer, c'est chercher les paramètres les plus plausibles : régression log-linéaire, OFV, AIC."
track: "math"
order: 21
duration: "13 min"
level: "intermediate"
tags: ["maths", "regression", "likelihood", "estimation"]
slides: []
sources: ["sheiner-beal-estimation", "davidian-giltinan", "gibaldi-perrier", "bonate"]
reviewed_on: "2026-07-09"
quiz:
  - prompt: "Estimer un paramètre par maximum de vraisemblance, c'est chercher la valeur qui..."
    options:
      - "rend les données observées les plus plausibles"
      - "annule tous les résidus"
      - "maximise le nombre de paramètres"
    correct: 0
  - prompt: "Une régression log-linéaire ln(C) vs t donne directement..."
    options:
      - "la constante d'élimination (pente) et C₀ (ordonnée à l'origine)"
      - "la dose"
      - "le poids du patient"
    correct: 0
---

<!-- step:title="Pourquoi ce chapitre" -->
Un modèle sans **estimation** n'est qu'une hypothèse. Estimer, c'est trouver les valeurs de paramètres qui **collent le mieux** aux données.

On passe des **moindres carrés** (minimiser l'écart) à la **vraisemblance** (rendre les données plausibles), fondement de la PopPK.
<!-- /step -->

<!-- step:title="Intuition" viz="EstimationFit" -->
Imaginez déplacer une courbe jusqu'à ce qu'elle passe au plus près des points.

Un **critère** mesure la distance courbe–points ; l'estimation cherche le minimum de ce critère. C'est exactement ce que fait l'atelier interactif ci-contre.
<!-- /step -->

<!-- step:title="La formule décortiquée" viz="EstimationFit" -->
Les **moindres carrés** minimisent $\sum (y_i - \hat y_i)^2$. La **vraisemblance** va plus loin : elle pondère chaque écart par sa variabilité attendue, et l'on minimise :

$$ -2\log L = \sum \frac{(y_i - \hat y_i)^2}{\sigma_i^2} + \dots $$

:::math
Cas simple utilisé en TP : une **régression log-linéaire** $\ln C = \ln C_0 - k_e\,t$ donne $k_e$ (pente) et $C_0$ (ordonnée), d'où $V_d = \text{Dose}/C_0$ et $CL = k_e\cdot V_d$.
:::
<!-- /step -->

<!-- step:title="Exemple concret" viz="AUCTrap" -->
Sur un profil IV en semi-log, la **pente terminale** estime $k_e$ ; l'ordonnée estime $C_0$.

C'est la démarche des TP de M2 (E. Curis) : à partir des concentrations, la régression fournit $k_e$, $V_d$ et $CL$ — puis l'AUC par trapèzes complète l'analyse NCA.
<!-- /step -->

<!-- step:title="Piège fréquent" -->
Coller aux points n'est pas le but ultime.

:::pitfall
Avec assez de paramètres, on passe par **tous** les points (surajustement) tout en prédisant mal. L'AIC/BIC pénalise la complexité ; la régression doit aussi respecter la **pondération** (erreur additive vs proportionnelle).
:::
<!-- /step -->

<!-- step:title="À retenir" -->
- Estimer = chercher les paramètres les plus plausibles (moindres carrés → vraisemblance).
- Régression log-linéaire : pente = kₑ, ordonnée = C₀ ⇒ Vd et CL.
- L'OFV (−2 log L) se minimise ; l'AIC/BIC arbitre la complexité.
- Surajuster ≠ bien prédire.
<!-- /step -->
