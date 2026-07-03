---
id: "trials-interpretation"
slug: "trials-interpretation"
title: "Interpréter un modèle : effets de covariables"
description: "Du paramètre à la décision : lire les effets de covariables, les forest plots et leur pertinence clinique."
summary: "Interpréter les effets de covariables : forest plots, pertinence clinique vs significativité, adaptation de dose."
track: "trials"
order: 102
duration: "12 min"
level: "intermediate"
tags: ["clinical-trials", "interpretation", "covariates", "forest-plot"]
slides: []
quiz:
  - prompt: "Un forest plot d'effets de covariables montre..."
    options:
      - "l'ampleur de chaque effet (ratio) avec son intervalle de confiance"
      - "la concentration au cours du temps"
      - "la structure du modèle"
    correct: 0
  - prompt: "Un effet de covariable est cliniquement pertinent s'il..."
    options:
      - "sort de la zone jugée sans conséquence (ex. ±20 %)"
      - "est simplement statistiquement significatif"
      - "concerne beaucoup de patients"
    correct: 0
  - prompt: "Un intervalle de confiance qui croise 1 (pas d'effet) signifie..."
    options:
      - "que l'effet est incertain"
      - "que l'effet est fort"
      - "qu'il faut augmenter la dose"
    correct: 0
---

<!-- step:title="Pourquoi ce chapitre" -->
Un modèle n'a de valeur que s'il **change une décision**. Interpréter les effets de covariables — et juger leur **pertinence clinique** — permet de dire s'il faut adapter la dose selon le poids, la fonction rénale ou le génotype.

C'est le pont entre l'analyse statistique et la pratique.
<!-- /step -->

<!-- step:title="Intuition" viz="53_ForestPlot" -->
Un **forest plot** aligne les effets : chaque covariable déplace un paramètre (ex. la clairance) d'un certain **facteur**, avec une barre d'incertitude.

Deux repères : la ligne à **1** (pas d'effet) et une **bande** de non-pertinence clinique. Un effet compte s'il **sort** de la bande et si sa barre ne croise pas 1.
<!-- /step -->

<!-- step:title="La formule décortiquée" viz="53_ForestPlot" -->
Un effet de covariable s'exprime en **ratio** par rapport au patient de référence, par exemple :

$$ \frac{CL(x)}{CL_{ref}} = \left(\frac{x}{x_{ref}}\right)^{\theta} $$

On juge sur **deux critères** conjoints :

- **statistique** : l'IC à 95 % du ratio exclut-il 1 ?
- **clinique** : le ratio dépasse-t-il le seuil de pertinence (souvent ±20 %, soit la zone 0,8–1,25) ?

:::note
Un effet peut être significatif (grand échantillon) mais **cliniquement négligeable**, et inversement un effet pertinent peut rester incertain (IC large).
:::
<!-- /step -->

<!-- step:title="Exemple concret" viz="53_ForestPlot" -->
Sur le forest plot, une **ClCr basse** réduit la clairance de 38 % (IC hors bande) : adaptation de dose justifiée. Le **sexe** déplace la clairance de 5 % (dans la bande, IC croisant 1) : sans conséquence.

C'est ainsi qu'on construit des **recommandations posologiques** par sous-groupe.
<!-- /step -->

<!-- step:title="Piège fréquent" -->
Significatif n'est pas pertinent.

:::pitfall
Sur un grand jeu de données, presque tout devient **statistiquement significatif**. La question utile est l'**ampleur** : un effet de 5 % ne change pas la dose. Et attention aux covariables **corrélées** (poids et ClCr), dont les effets se confondent.
:::
<!-- /step -->

<!-- step:title="À retenir" -->
- Le forest plot montre l'ampleur et l'incertitude de chaque effet de covariable.
- Effet exprimé en ratio vs référence ; juger statistique ET clinique.
- Pertinent = hors bande (ex. ±20 %) et IC ne croisant pas 1.
- Significatif ≠ pertinent ; méfiance sur les covariables corrélées.
<!-- /step -->
