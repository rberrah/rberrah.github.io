---
id: "tdm"
slug: "tdm"
title: "Suivi thérapeutique (TDM)"
description: "Comment les modèles soutiennent l'ajustement de dose individuel sans remplacer le clinicien."
summary: "Mesurer, estimer (Bayes), ajuster : le suivi thérapeutique et son interprétation prudente."
track: "core"
order: 11
duration: "12 min"
level: "intermediate"
tags: ["tdm", "bayesian", "clinical-use", "conclusion"]
slides: ["s59", "s62", "s72"]
sources: ["minichmayr-mipd", "woillard-tacrolimus", "rybak-vanco", "iatdmct"]
reviewed_on: "2026-07-09"
quiz:
  - prompt: "Le suivi thérapeutique (TDM) utilise les mesures de médicament pour..."
    options:
      - "éclairer l'interprétation de l'exposition et les décisions posologiques futures"
      - "remplacer tout jugement clinique"
      - "éviter de connaître l'heure du prélèvement"
    correct: 0
  - prompt: "Pour un TDM basé sur un modèle, le moment du prélèvement est..."
    options:
      - "critique"
      - "sans importance"
      - "toujours inconnu"
    correct: 0
  - prompt: "Ce site pédagogique doit servir à..."
    options:
      - "apprendre des concepts, pas à doser un patient précis"
      - "des prescriptions automatiques"
      - "ignorer l'incertitude"
    correct: 0
---

<!-- step:title="Pourquoi ce chapitre" slides="s59" -->
Le suivi thérapeutique (TDM) est le moment où la pharmacométrie devient concrète : une dose a été donnée, une concentration a été mesurée, et une décision peut suivre.

Le modèle aide à **interpréter** la mesure dans son contexte. Il ne remplace pas la responsabilité clinique.
<!-- /step -->

<!-- step:title="Intuition" slides="s62" viz="TDMProfile" -->
Une concentration sans horaire, c'est comme une photo sans savoir quand elle a été prise.

La construction venait-elle de commencer, était-elle près de son pic, ou déjà en démontage ? Le moment change l'interprétation.

:::key
Le modèle utilise l'historique des doses et l'heure du prélèvement pour distinguer « patient qui bâtit lentement », « patient qui perd des blocs » et « photo prise trop tard ».
:::
<!-- /step -->

<!-- step:title="La formule décortiquée" slides="s59" -->
Un flux de TDM bayésien combine :

$$ \text{modèle de population} + \text{historique des doses} + \text{heure du prélèvement} + \text{concentration mesurée} $$

:::math
La sortie est une estimation individuelle **mise à jour, avec son incertitude** — pas une vérité garantie. C'est le raisonnement du chapitre bayésien appliqué au lit du patient.
:::
<!-- /step -->

<!-- step:title="Exemple concret" slides="s62" -->
Pour le tacrolimus, la vancomycine, les aminosides ou des modèles liés à la warfarine, une seule valeur mesurée n'est utile que si le contexte est correct.

Dose, heures d'administration, heure du prélèvement, détails du dosage, fonction rénale ou hépatique, observance et médicaments en interaction peuvent tous compter.
<!-- /step -->

<!-- step:title="Piège fréquent" slides="s72" -->
Ne traitez pas la sortie du modèle comme une prescription.

:::pitfall
Un modèle peut soutenir le raisonnement, montrer l'incertitude et simuler des scénarios. Les décisions posologiques individuelles exigent des outils validés, une gouvernance clinique et des protocoles locaux.
:::

:::clinical
Ce site enseigne des concepts uniquement. Ce n'est pas un conseil médical, et il ne fournit aucun ajustement posologique patient-spécifique.
:::
<!-- /step -->

<!-- step:title="À retenir" -->
- Le TDM interprète les mesures dans le temps et le contexte.
- Les modèles bayésiens empruntent de la force à la population tout en s'ajustant au patient.
- L'incertitude doit rester visible.
- Ce site est pédagogique ; il ne remplace pas le jugement clinique.
<!-- /step -->
