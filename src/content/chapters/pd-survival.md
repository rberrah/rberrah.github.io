---
id: "pd-survival"
slug: "pd-survival"
title: "Études de survie : OS, PFS et time-to-event"
description: "Modéliser le temps jusqu'à un événement : hasard, survie, Kaplan-Meier, censure et modèles paramétriques."
summary: "Analyse de survie en pharmacométrie : OS vs PFS, fonction de hasard, censure, modèles paramétriques et liens à l'exposition."
track: "pd"
order: 64
duration: "15 min"
level: "advanced"
tags: ["pharmacodynamics", "survival", "time-to-event", "os-pfs"]
slides: []
quiz:
  - prompt: "La différence entre OS et PFS est que..."
    options:
      - "l'OS mesure le temps jusqu'au décès, la PFS jusqu'à progression ou décès"
      - "l'OS est toujours plus courte que la PFS"
      - "ce sont des synonymes"
    correct: 0
  - prompt: "La censure (à droite) survient quand..."
    options:
      - "l'événement n'a pas eu lieu à la fin du suivi"
      - "le patient a deux événements"
      - "la dose est inconnue"
    correct: 0
  - prompt: "Relier l'exposition à la survie via un modèle de hasard permet de..."
    options:
      - "prédire l'effet d'une dose sur l'OS/PFS"
      - "calculer l'AUC"
      - "mesurer la Cmax"
    correct: 0
---

<!-- step:title="Pourquoi ce chapitre" -->
En oncologie et au-delà, le critère final n'est pas une concentration ni une taille, mais un **temps jusqu'à événement** : décès (**OS**, overall survival) ou progression (**PFS**, progression-free survival).

La pharmacométrie relie **exposition → biomarqueur → survie**, ce qui permet d'anticiper l'effet d'une dose sur le bénéfice clinique.
<!-- /step -->

<!-- step:title="Intuition" viz="44_Survival" -->
La **survie** $S(t)$ est la probabilité de ne pas avoir eu l'événement au temps $t$ : elle part de 1 et décroît. La **PFS** chute avant l'**OS** (progresser précède mourir).

Un traitement efficace **décale** ces courbes vers la droite. Jouez sur le hazard ratio et observez la survie médiane augmenter.
<!-- /step -->

<!-- step:title="La formule décortiquée" viz="44_Survival" -->
Tout repose sur la **fonction de hasard** $h(t)$ — le risque instantané d'événement :

$$ S(t) = \exp\!\left(-\int_0^t h(u)\,du\right), \qquad h(t) = -\frac{S'(t)}{S(t)} $$

On choisit une forme paramétrique (exponentielle, **Weibull**, Gompertz, log-logistique). L'effet d'un covariable ou de l'exposition entre par un modèle à hasards proportionnels :

$$ h(t) = h_0(t)\,\exp(\beta\,x) $$

où $x$ peut être l'exposition ou un biomarqueur dynamique (taille tumorale) — c'est le **modèle joint**.

:::note
Réf. : méthodologie time-to-event en NLME développée notamment à **IAME** (Bichat) et à **Leiden** ; en oncologie mathématique, l'équipe **COMPO** (Marseille — Ciccolini, Benzekry) relie modèles mécanistes et survie.
:::
<!-- /step -->

<!-- step:title="Exemple concret" viz="44_Survival" -->
Dans un essai, on estime un **hazard ratio** entre bras : HR = 0,65 signifie 35 % de risque instantané en moins. La **survie médiane** (temps où $S=0{,}5$) résume le bénéfice.

En reliant l'AUC au hasard, on **simule** l'effet d'un schéma posologique sur la PFS avant de le tester — un usage clé de la modélisation.
<!-- /step -->

<!-- step:title="Le lien avec le machine learning" viz="44_Survival" -->
Le ML enrichit l'analyse de survie : des modèles comme **DeepSurv** ou **Dynamic-DeepHit** apprennent des hasards non linéaires et dépendants du temps à partir de nombreuses covariables.

:::note
Réf. : travaux du **van der Schaar Lab** (Cambridge — Dynamic-DeepHit, AutoPrognosis) sur la survie par apprentissage automatique ; en TDM/pharmacométrie appliquée, l'équipe de **J.-B. Woillard** (Limoges).
:::
<!-- /step -->

<!-- step:title="Piège fréquent" -->
La censure et les critères de substitution trompent.

:::pitfall
Ignorer la **censure** (patients non suivis jusqu'à l'événement) biaise l'estimation : les modèles de survie l'intègrent explicitement. Et un bon effet sur la **PFS** ne garantit pas un gain d'**OS** (critère de substitution imparfait) — à valider, jamais à présumer.
:::
<!-- /step -->

<!-- step:title="À retenir" -->
- OS = temps jusqu'au décès ; PFS = jusqu'à progression ou décès (chute plus tôt).
- S(t) = exp(−∫h) ; formes paramétriques (Weibull…) ; hasards proportionnels h0·exp(βx).
- Relier exposition/biomarqueur au hasard (modèle joint) → prédire OS/PFS d'une dose.
- Gérer la censure ; PFS n'est pas un substitut garanti de l'OS.
<!-- /step -->
