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
slides: ["s57", "s58", "s59", "s60", "s61", "s62", "s63", "s64"]
quiz:
  - prompt: "Un EBE est..."
    options:
      - "une estimation bayésienne empirique de l'effet aléatoire d'un individu"
      - "un titre de slide"
      - "une unité de concentration"
    correct: 0
  - prompt: "Le shrinkage est élevé quand..."
    options:
      - "les données individuelles sont faibles et les estimations se rapprochent de la population"
      - "tous les patients sont parfaitement observés"
      - "il n'y a aucun modèle de population"
    correct: 0
  - prompt: "L'estimation MAP combine..."
    options:
      - "l'information a priori de la population et les observations individuelles"
      - "la dernière observation seulement"
      - "la dose seulement"
    correct: 0
---

<!-- step:title="Pourquoi ce chapitre" slides="s57" -->
Les jeux de données cliniques sont souvent **pauvres** : une ou deux concentrations par patient, pas une courbe riche.

Le raisonnement bayésien permet au modèle de combiner ce que l'on sait de la population avec ce que l'on observe chez l'individu.
<!-- /step -->

<!-- step:title="Intuition" slides="s58,s59" viz="BayesUpdate" -->
Si vous ne voyez qu'une seule photo de la construction d'un élève, vous ne devriez pas ignorer ce que vous savez de toute la classe.

Le modèle de population est l'**attente a priori** ; la mesure individuelle **met à jour** cette attente.

:::key
Une estimation bayésienne ne saute pas à une conclusion extrême : elle éloigne l'estimation individuelle de la moyenne de classe seulement autant que les données le justifient.
:::
<!-- /step -->

<!-- step:title="La formule décortiquée" slides="s57,s59" viz="BayesUpdate" -->
Idée MAP simplifiée :

$$ \text{estimation individuelle} = \text{attente de population} + \text{écart soutenu par les données} $$

En notation PopPK, les paramètres individuels utilisent souvent des EBE :

$$ CL_i = CL_{\mathrm{typique}}\, e^{\hat{\eta}_i} $$

:::math
$\hat{\eta}_i$ est l'écart individuel **estimé**. Quand les données du patient sont pauvres, $\hat{\eta}_i$ est tiré vers 0 (vers la population) : c'est le shrinkage.
:::
<!-- /step -->

<!-- step:title="Exemple concret" slides="s60" -->
En suivi thérapeutique, une seule concentration après une dose peut mettre à jour la clairance estimée d'un patient.

Si la concentration observée est plus basse que prévu, le modèle peut inférer une clairance plus élevée — mais l'ampleur de l'ajustement dépend du **moment** du prélèvement, de l'erreur de dosage, de la variabilité a priori et de tout l'historique posologique.
<!-- /step -->

<!-- step:title="Piège fréquent" slides="s61,s62,s63,s64" -->
Ne sur-interprétez pas les EBE quand le shrinkage est élevé.

:::pitfall
Un shrinkage élevé signifie que les estimations individuelles sont fortement tirées vers la population parce que les données ne les identifient pas bien. Tracer des EBE « rétrécis » comme s'il s'agissait des vraies valeurs patient peut créer de **faux motifs** (fausses corrélations covariable-paramètre).
:::
<!-- /step -->

<!-- step:title="À retenir" -->
- Les EBE sont des estimations individuelles informées par le modèle de population.
- Le MAP combine l'a priori de population et les observations du patient.
- Le shrinkage avertit que les estimations individuelles sont peu informées.
- La mise à jour bayésienne est centrale en TDM, mais dépend de la qualité des données.
<!-- /step -->
