---
id: "outils-estimation"
slug: "outils-estimation"
title: "Outils et estimation"
description: "Ce que cherchent vraiment NONMEM, Monolix, nlmixr2, FOCE-I et SAEM."
summary: "Guide conceptuel des outils d'estimation et des fonctions objectif, sans en faire un manuel logiciel."
track: "core"
order: 8
duration: "12 min"
level: "intermediate"
tags: ["tools", "estimation", "nonmem", "monolix", "nlmixr2"]
slides: ["s10", "s38", "s39", "s40", "s41", "s42"]
sources: ["sheiner-beal-estimation", "lavielle", "keizer-psn-xpose", "owen-fiedler-kelly"]
reviewed_on: "2026-07-09"
quiz:
  - prompt: "Estimer signifie..."
    options:
      - "trouver des valeurs de paramètres qui rendent le modèle plausible pour les données"
      - "tracer une courbe à la main seulement"
      - "retirer la variabilité des données"
    correct: 0
  - prompt: "FOCE-I et SAEM sont..."
    options:
      - "des algorithmes d'estimation"
      - "des classes de médicaments"
      - "des unités de clairance"
    correct: 0
  - prompt: "Un AIC plus bas est utile mais..."
    options:
      - "doit s'interpréter avec les diagnostics et la plausibilité"
      - "prouve toujours que le modèle est cliniquement correct"
      - "supprime le besoin de validation"
    correct: 0
---

<!-- step:title="Pourquoi ce chapitre" slides="s38" -->
Le logiciel ne rend pas la modélisation automatique.

NONMEM, Monolix et nlmixr2 aident à **estimer** les paramètres, mais le modélisateur choisit encore la structure, le modèle de variabilité, les covariables, les diagnostics et l'interprétation.
<!-- /step -->

<!-- step:title="Intuition" slides="s41" viz="EstimationFit" -->
Estimer, c'est essayer de nombreuses notices de montage et demander laquelle explique le mieux les résultats de la classe.

:::key
L'ordinateur **cherche** ; le modélisateur **décide** si la réponse a un sens pharmacologique. Une notice avec trop de pièces réglables peut coller aux photos tout en enseignant la mauvaise leçon.
:::
<!-- /step -->

<!-- step:title="La formule décortiquée" slides="s42" -->
Beaucoup de comparaisons reposent sur la vraisemblance : des données plus plausibles sous le modèle = un meilleur ajustement. L'AIC ajoute une pénalité de complexité :

$$ \mathrm{AIC} = -2 \log L + 2p $$

où $p$ est le nombre de paramètres estimés.

:::math
Baisser $-2\log L$ (mieux coller) est bon ; mais chaque paramètre ajouté coûte $+2$. L'AIC arbitre entre ajustement et parcimonie — sans garantir la pertinence clinique.
:::
<!-- /step -->

<!-- step:title="Exemple concret" slides="s39,s40" -->
Dans un exercice de construction de modèle warfarine, on peut comparer :

- un compartiment contre deux compartiments ;
- erreur résiduelle additive contre proportionnelle ;
- sans covariable contre effet du poids ou du génotype ;
- réponse directe contre réponse de turnover.

Le meilleur modèle n'est pas seulement celui à la plus petite fonction objectif : il doit aussi être **stable, interprétable et diagnostiquement crédible**.
<!-- /step -->

<!-- step:title="Piège fréquent" slides="s41" -->
Ne confondez pas un algorithme avec une conclusion scientifique.

:::pitfall
FOCE-I, SAEM et consorts sont des outils d'estimation. Ils peuvent échouer, converger vers une solution locale, ou soutenir un modèle trop complexe. Vérifiez toujours paramètres, incertitude, diagnostics et plausibilité biologique.
:::
<!-- /step -->

<!-- step:title="À retenir" -->
- L'estimation trouve les paramètres du modèle à partir des données.
- Les outils implémentent des algorithmes, pas du jugement.
- AIC et vraisemblance sont utiles, mais insuffisants.
- Un modèle stable et interprétable vaut mieux qu'un ajustement impressionnant mais fragile.

:::note
**Pour aller plus loin.** Ce chapitre est la **porte d'entrée** du tronc commun. Le parcours d'approfondissement **« Outils & logiciels »** (7 chapitres) entre dans le concret : NONMEM, Monolix, nlmixr2, algorithmes d'estimation, simulation et TDM bayésien.
:::
<!-- /step -->
