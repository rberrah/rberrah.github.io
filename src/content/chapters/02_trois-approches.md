---
id: "trois-approches"
slug: "trois-approches"
title: "NCA vs PopPK vs PBPK"
description: "Trois manières d'apprendre à partir des données concentration-temps."
summary: "Comparaison pratique des approches descriptive, populationnelle et physiologique."
track: "core"
order: 2
duration: "14 min"
level: "beginner"
tags: ["approaches", "nca", "poppk", "pbpk"]
slides: ["s06", "s07", "s08", "s09"]
quiz:
  - prompt: "L'analyse non compartimentale (NCA) sert surtout à..."
    options:
      - "décrire l'exposition observée"
      - "simuler des patients non observés avec covariables"
      - "construire un modèle physiologique complet"
    correct: 0
  - prompt: "La PopPK est particulièrement utile quand on veut..."
    options:
      - "ignorer la variabilité"
      - "estimer les paramètres typiques et la variabilité d'une population"
      - "éviter tout modèle"
    correct: 1
  - prompt: "Un risque fréquent de la PBPK est..."
    options:
      - "trop peu de paramètres"
      - "la sur-paramétrisation au-delà de ce que les données soutiennent"
      - "de ne jamais utiliser la physiologie"
    correct: 1
---

<!-- step:title="Pourquoi ce chapitre" slides="s06" viz="04_ThreeApproaches" -->
Les mêmes données concentration-temps peuvent répondre à des questions différentes.

- « Quelle exposition avons-nous observée ? » → la **NCA** peut suffire.
- « Pourquoi les patients diffèrent-ils ? » → il faut la **PopPK**.
- « Que se passerait-il avec une autre physiologie ou une interaction ? » → la **PBPK** peut aider.

:::key
Choisir la méthode, c'est choisir la bonne échelle de carte. Les trois peuvent être valides, mais elles ne sont pas interchangeables.
:::
<!-- /step -->

<!-- step:title="Intuition" slides="s06,s07" viz="04_ThreeApproaches" -->
Imaginez que chaque patient bâtit avec la même boîte de blocs.

- La **NCA** mesure la construction finie : hauteur, largeur, surface totale.
- La **PopPK** estime la notice de montage *et* la façon dont les élèves varient autour d'elle.
- La **PBPK** reconstruit toute la salle : tables, étagères, portes et trajets entre elles.

La NCA est une règle graduée ; la PopPK, un modèle de classe ; la PBPK, un plan de bâtiment — puissant, mais chaque nouvelle pièce exige des hypothèses.
<!-- /step -->

<!-- step:title="La formule décortiquée" slides="s08" viz="04_ThreeApproaches" -->
La NCA résume souvent l'exposition par l'aire sous la courbe :

$$ \mathrm{AUC}_{0-\infty} \approx \mathrm{AUC}_{0-t} + \frac{C_t}{\lambda_z} $$

La PopPK modélise les paramètres individuels, par exemple :

$$ CL_i = CL_{\mathrm{typique}} \cdot e^{\eta_i} $$

:::math
À lire ainsi : chaque patient a une clairance proche de la valeur typique, multipliée par un écart individuel $e^{\eta_i}$. C'est le cœur des modèles à effets mixtes.
:::
<!-- /step -->

<!-- step:title="Exemple concret" slides="s07,s08" viz="12_VariabilitySandbox" -->
Supposons que les concentrations de warfarine varient beaucoup après des doses similaires.

La NCA dit *quels* patients ont eu l'AUC la plus élevée. La PopPK demande si la clairance dépend du poids, du génotype, de l'âge ou de médicaments associés. La PBPK explore des mécanismes (métabolisme hépatique, distribution tissulaire), au prix d'hypothèses physiologiques supplémentaires.

C'est **la question pratique** qui décide de l'outil.
<!-- /step -->

<!-- step:title="Piège fréquent" slides="s09" -->
N'utilisez pas la NCA comme si elle était prédictive.

:::pitfall
La NCA décrit parfaitement les profils observés, mais elle n'a ni effet aléatoire par patient, ni modèle de covariables, ni mécanisme pour simuler un schéma posologique inédit. Pour prédire, prenez un modèle conçu pour prédire.
:::
<!-- /step -->

<!-- step:title="À retenir" -->
- La NCA décrit l'exposition observée.
- La PopPK explique la variabilité de population et permet la simulation.
- La PBPK extrapole via la physiologie, mais dépend fortement des hypothèses.
- Partez de la question, puis choisissez la méthode.
<!-- /step -->
