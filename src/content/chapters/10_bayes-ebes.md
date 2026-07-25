---
id: "bayes-ebes"
slug: "bayes-ebes"
title: "Raisonnement bayésien, EBE et shrinkage"
description: "Comment les estimations individuelles empruntent de la force à la population."
summary: "Explication pratique des estimations MAP, des EBE et de l'importance du shrinkage."
track: "core"
order: 10
duration: "14 min"
level: "intermediate"
tags: ["bayes", "ebes", "shrinkage", "tdm"]
slides: ["s53", "s54", "s55", "s57", "s58", "s60", "s61"]
sources: ["sheiner-forecasting", "savic-karlsson-shrinkage", "mapbayr", "sheiner-beal-estimation", "berrah-residual", "hughes-keizer"]
reviewed_on: "2026-07-09"
quiz:
  - prompt: "Un EBE est..."
    options:
      - "une estimation bayésienne empirique de l'effet aléatoire d'un individu"
      - "l'estimation d'un effet fixe commun à tous les patients de la population"
      - "la valeur typique de population avant toute mesure individuelle"
    correct: 0
  - prompt: "Le shrinkage est élevé quand..."
    options:
      - "les données individuelles sont pauvres et les EBE tirés vers la population"
      - "les données individuelles sont riches et très informatives sur le patient"
      - "la variabilité inter-individuelle estimée du paramètre est très grande"
    correct: 0
  - prompt: "L'estimation MAP combine..."
    options:
      - "l'information a priori de la population et les observations individuelles"
      - "les observations individuelles seules, sans a priori de population"
      - "l'a priori de population seul, sans les mesures du patient"
    correct: 0
---

<!-- step:title="Pourquoi ce chapitre" slides="s53" -->
Les jeux de données cliniques sont souvent **pauvres** : une ou deux concentrations par patient, pas une courbe riche.

Le raisonnement bayésien permet au modèle de combiner ce que l'on sait de la population avec ce que l'on observe chez l'individu.
<!-- /step -->

<!-- step:title="Intuition" slides="s55" viz="BayesUpdate" -->
Si vous ne voyez qu'une seule photo de la construction d'un élève, vous ne devriez pas ignorer ce que vous savez de toute la classe.

Le modèle de population est l'**attente a priori** ; la mesure individuelle **met à jour** cette attente.

:::key
Une estimation bayésienne ne saute pas à une conclusion extrême : elle éloigne l'estimation individuelle de la moyenne de classe seulement autant que les données le justifient.
:::
<!-- /step -->

<!-- step:title="La formule décortiquée" slides="s53,s54" viz="BayesUpdate" -->
Le raisonnement bayésien part du **théorème de Bayes**. Pour l'écart individuel $\eta_i$ :

$$ \underbrace{p(\eta_i \mid y_i)}_{\text{a posteriori}} \;\propto\; \underbrace{p(y_i \mid \eta_i)}_{\text{vraisemblance}} \;\times\; \underbrace{p(\eta_i)}_{\text{a priori}} $$

L'**a priori** $p(\eta_i)$ est le modèle de population (une gaussienne de variance $\Omega$, la variabilité inter-individuelle). La **vraisemblance** $p(y_i \mid \eta_i)$ mesure l'accord aux observations, pondéré par l'**erreur résiduelle** $\sigma$.

L'estimation **MAP** (*maximum a posteriori*) maximise cet a posteriori, ce qui revient à minimiser l'objectif individuel :

$$ \hat{\eta}_i = \arg\min_{\eta}\;\sum_j \frac{\bigl(y_{ij} - f(\eta)\bigr)^2}{\sigma^2} \;+\; \eta^{\mathsf T}\,\Omega^{-1}\,\eta $$

L'individu s'écrit alors avec son EBE : $CL_i = CL_{\mathrm{typique}}\, e^{\hat{\eta}_i}$.

:::math
Lisez les **deux termes** comme une balance :

- le premier **colle aux données** — d'autant plus fort que l'erreur résiduelle $\sigma$ est **petite** ;
- le second **rappelle vers la population** ($\eta = 0$) — d'autant plus fort que la variabilité $\Omega$ est **petite**.

Quand les données sont pauvres (ou $\sigma$ grand), le second terme l'emporte et $\hat{\eta}_i \to 0$ : c'est le **shrinkage**.
:::
<!-- /step -->

<!-- step:title="Exemple concret" slides="s58" -->
En suivi thérapeutique, une seule concentration après une dose peut mettre à jour la clairance estimée d'un patient.

Si la concentration observée est plus basse que prévu, le modèle peut inférer une clairance plus élevée — mais l'ampleur de l'ajustement dépend du **moment** du prélèvement, de l'erreur de dosage, de la variabilité a priori et de tout l'historique posologique.

:::note
**La qualité de l'estimation bayésienne dépend directement de $\sigma$ et $\Omega$.** Mal spécifier l'erreur résiduelle biaise l'estimation individuelle : un $\sigma$ trop petit fait **trop confiance** à une mesure bruitée (sous-shrinkage), un $\sigma$ trop grand **écrase** l'information du patient vers la population. C'est le levier étudié par Berrah *et al.* — l'erreur résiduelle comme « levier caché » du dosage de précision. Symétriquement, Hughes & Keizer montrent qu'**assouplir sélectivement l'a priori** (*flatten the prior* : élargir $\Omega$) laisse davantage parler les données et peut **surpasser** le MAP bayésien standard.
:::
<!-- /step -->

<!-- step:title="Piège fréquent" slides="s57" -->
Ne sur-interprétez pas les EBE quand le shrinkage est élevé.

:::pitfall
Un shrinkage élevé signifie que les estimations individuelles sont fortement tirées vers la population parce que les données ne les identifient pas bien. Tracer des EBE « rétrécis » comme s'il s'agissait des vraies valeurs patient peut créer de **faux motifs** (fausses corrélations covariable-paramètre).
:::
<!-- /step -->

<!-- step:title="À retenir" -->
- Les EBE sont des estimations individuelles informées par le modèle de population.
- Le MAP combine l'a priori de population et les observations du patient (théorème de Bayes).
- L'estimation arbitre entre coller aux données (pondéré par $\sigma$) et rappeler vers la population (pondéré par $\Omega$) : elle dépend **fortement** de l'erreur résiduelle et de la variabilité choisies.
- Le shrinkage avertit que les estimations individuelles sont peu informées.
- La mise à jour bayésienne est centrale en TDM, mais dépend de la qualité des données et de la spécification de $\sigma$ et $\Omega$.
<!-- /step -->
