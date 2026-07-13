---
id: "math-bayes"
slug: "math-bayes"
title: "Estimation bayésienne"
description: "Combiner une connaissance a priori et des données : le théorème de Bayes, du prior au posterior."
summary: "Prior × vraisemblance → posterior : le raisonnement bayésien, l'estimation MAP et le rétrécissement."
track: "math"
order: 22
duration: "13 min"
level: "intermediate"
tags: ["maths", "bayes", "estimation", "prior"]
prerequisites: ["math-regression"]
glossary: ["Théorème de Bayes", "A priori / prior", "A posteriori / posterior", "Vraisemblance", "MAP", "Shrinkage"]
slides: []
sources: ["sheiner-forecasting", "savic-karlsson-shrinkage", "mapbayr", "minichmayr-mipd"]
reviewed_on: "2026-07-09"
quiz:
  - prompt: "Le théorème de Bayes combine..."
    options:
      - "une information a priori (prior) et la vraisemblance des données"
      - "uniquement les données observées"
      - "uniquement l'avis de l'expert"
    correct: 0
  - prompt: "L'estimation MAP (maximum a posteriori) retient..."
    options:
      - "le sommet de la distribution a posteriori"
      - "la moyenne du prior seul"
      - "la plus grande observation"
    correct: 0
  - prompt: "Quand les données individuelles sont peu informatives, l'estimation bayésienne..."
    options:
      - "se rapproche du prior (rétrécissement / shrinkage)"
      - "ignore le prior"
      - "diverge vers l'infini"
    correct: 0
---

<!-- step:title="Pourquoi ce chapitre" -->
En pharmacométrie, on connaît déjà **beaucoup** avant de voir un patient : la population nous dit à quoi ressemblent une clairance ou un volume « typiques ». L'**estimation bayésienne** formalise la façon de **mettre à jour** cette connaissance avec les quelques mesures du patient.

C'est le socle mathématique du TDM bayésien (suivi thérapeutique), des EBE (estimations des paramètres individuels) et du MIPD (dosage de précision guidé par modèle).
<!-- /step -->

<!-- step:title="Intuition" viz="BayesUpdate" -->
Partez d'une **croyance a priori** (le patient ressemble à la population). Chaque **mesure** déplace cette croyance : peu de données → on reste proche du prior ; beaucoup de données → on suit les observations.

Le résultat, le **posterior**, est un compromis pondéré entre les deux. Ajoutez des points et regardez la distribution se resserrer.
<!-- /step -->

<!-- step:title="La formule décortiquée" viz="BayesUpdate" -->
Le **théorème de Bayes** relie ces trois ingrédients :

$$ p(\theta \mid y) \;=\; \frac{p(y \mid \theta)\,p(\theta)}{p(y)} \;\propto\; \underbrace{p(y \mid \theta)}_{\text{vraisemblance}}\;\underbrace{p(\theta)}_{\text{prior}} $$

:::howto
**La métaphore du pile ou face.** Vous croyez une pièce équilibrée (prior : 50/50). Vous la lancez 10 fois, vous obtenez 8 faces (données). Vous ne concluez ni « 50 % » (ce serait ignorer les données), ni « 80 % » (ce serait ignorer votre a priori) : vous vous arrêtez **entre les deux** — d'autant plus près de 80 % que vous aviez peu de convictions et beaucoup de lancers.

**Côté maths.** Lisez la formule de droite à gauche : on part du **prior** $p(\theta)$ (ce qu'on croit avant), on le **multiplie** par la **vraisemblance** $p(y\mid\theta)$ (à quel point cette valeur de $\theta$ rend les données observées probables), et le dénominateur $p(y)$ ne fait que **renormaliser** pour obtenir une vraie probabilité. Le **posterior** $p(\theta\mid y)$ est donc le prior « corrigé » par les données.
:::

Dans le cas **gaussien conjugué**, le posterior reste gaussien et sa moyenne est une **moyenne pondérée** par les précisions (inverses des variances) :

$$ \hat\theta = \frac{\tau_0\,\mu_0 + \tau_d\,\bar y}{\tau_0 + \tau_d}, \qquad \tau = 1/\sigma^2 $$

:::math
L'estimation **MAP** (maximum a posteriori) prend le sommet de $p(\theta\mid y)$. En PopPK, elle revient à minimiser l'écart aux données **plus** un terme qui rappelle vers le prior : $-2\log L + \sum \eta^2/\omega^2$.
:::
<!-- /step -->

<!-- step:title="Exemple concret" viz="BayesUpdate" -->
Un patient a une clairance a priori de 5 L/h (population). Une résiduelle mesurée est un peu basse. Le posterior déplace l'estimation vers ~4 L/h — **sans** croire aveuglément à une seule mesure bruitée.

Avec deux ou trois prélèvements concordants, le posterior se resserre et s'éloigne franchement du prior : c'est exactement l'ajustement de dose bayésien.
<!-- /step -->

<!-- step:title="Piège fréquent" -->
Le prior n'est pas neutre.

:::pitfall
Un prior **mal choisi** (mauvais modèle de population, covariables ignorées) tire le posterior au mauvais endroit. Et quand les données sont pauvres, l'estimation « colle » au prior : c'est le **rétrécissement** (shrinkage). Un shrinkage élevé (> 20–30 %) rend les EBE peu informatifs et fausse les graphiques de diagnostic.
:::
<!-- /step -->

<!-- step:title="À retenir" -->
- Bayes : posterior ∝ vraisemblance × prior — on met à jour une croyance avec les données.
- Cas gaussien : le posterior est une moyenne pondérée par les précisions.
- L'estimation MAP = sommet du posterior = base des EBE et du TDM bayésien.
- Données pauvres → rétrécissement vers le prior (shrinkage) : à surveiller.
<!-- /step -->
