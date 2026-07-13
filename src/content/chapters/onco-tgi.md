---
id: "onco-tgi"
slug: "onco-tgi"
title: "Croissance tumorale et modèles joints"
description: "Modéliser la taille tumorale (Claret), la relier à l'exposition, puis à la survie via un modèle joint."
summary: "Inhibition de croissance tumorale (Claret), lien exposition–réponse et modèle joint TGI–survie."
track: "onco"
order: 30
duration: "15 min"
level: "advanced"
tags: ["oncology", "tumor-growth", "joint-model", "survival"]
prerequisites: ["pd-survival"]
glossary: ["AUC", "Emax", "Covariable"]
slides: []
sources: ["claret-tgi-os", "simeoni", "wulfsohn-tsiatis-joint", "holford-tte-tutorial"]
reviewed_on: "2026-07-09"
quiz:
  - prompt: "Dans le modèle de Claret, l'effet du traitement sur la tumeur..."
    options:
      - "s'épuise avec le temps (apparition d'une résistance)"
      - "est constant à vie"
      - "ne dépend pas de l'exposition"
    correct: 0
  - prompt: "Un modèle joint TGI–survie relie..."
    options:
      - "la dynamique de la taille tumorale au risque de progression/décès"
      - "la dose au poids du patient uniquement"
      - "deux modèles PK indépendants"
    correct: 0
  - prompt: "Le paramètre β d'un modèle joint mesure..."
    options:
      - "la force du lien entre taille tumorale et hasard"
      - "la clairance du médicament"
      - "la biodisponibilité orale"
    correct: 0
---

<!-- step:title="Pourquoi ce chapitre" -->
En oncologie, la « réponse » n'est plus une concentration mais la **taille de la tumeur**, puis la **survie**. La pharmacométrie construit la chaîne : exposition (AUC) → dynamique tumorale → bénéfice clinique.

C'est le cœur des **modèles joints**, qui assemblent PK, taille tumorale (TGI) et survie pour anticiper les résultats d'un essai avant de le lancer.
<!-- /step -->

<!-- step:title="Intuition" viz="30_TumorGrowth" -->
Une tumeur **croît spontanément** (exponentielle) ; le traitement en **tue une partie**, d'autant plus que l'exposition est forte.

Mais l'effet n'est pas éternel : une **résistance** apparaît progressivement, l'effet s'épuise, et la tumeur peut **ré-échapper**. Montez l'exposition et observez le nadir, puis la reprise.
<!-- /step -->

<!-- step:title="La formule décortiquée" viz="30_TumorGrowth" -->
Le modèle de **Claret** décrit une croissance exponentielle freinée par un rétrécissement qui **s'épuise** :

$$ \frac{dTS}{dt} = K_{G}\,TS \;-\; K\cdot expo\cdot e^{-\lambda t}\,TS $$

- $K_G$ : vitesse de croissance non perturbée ;
- $K\cdot expo$ : rétrécissement proportionnel à l'**exposition** (concentration ou AUC) ;
- $e^{-\lambda t}$ : apparition progressive d'une **résistance** ($\lambda$).

Certaines variantes séparent une population **sensible** et une population **résistante** (fraction $f$).

:::note
Réf. : Claret L. et al., *J Clin Oncol* 2009 (TGI–OS) ; Simeoni M. et al., *Cancer Res* 2004 (modèle TGI avec seuil $C_T=\lambda_0/k_2$).
:::
<!-- /step -->

<!-- step:title="Le modele joint" viz="31_JointSurvival" -->
On **relie** ensuite la dynamique tumorale au **risque** de progression. Le hasard dépend de la taille tumorale via un paramètre de lien $\beta$ :

$$ h(t) = h_0(t)\cdot e^{\,\beta\, f(TS(t))}, \qquad S(t) = e^{-\int_0^t h} $$

:::howto
**La métaphore du thermostat.** Le hasard $h(t)$ est le risque instantané de progression, comme la puissance d'un chauffage. La taille tumorale joue le thermostat : plus la tumeur est grosse, plus $h$ monte. Le paramètre $\beta$ est la **sensibilité du thermostat** — $\beta$ grand = le risque réagit fortement à la tumeur.

**Côté maths.** $h_0(t)$ est le risque de base ; le facteur $e^{\beta f(TS)}$ le **module** (× > 1 si la tumeur grossit, × < 1 si elle régresse). La survie $S(t)=e^{-\int h}$ **accumule** ce risque : tant que $h$ reste bas (tumeur réduite), $S$ décroît lentement — la courbe de survie est repoussée vers la droite.
:::

$f$ peut être la taille courante, sa variation depuis le début (CFB), son AUC… Plus $|\beta|$ est grand, plus le lien tumeur → survie est fort. Faire régresser la tumeur **repousse la courbe de survie** vers la droite.
<!-- /step -->

<!-- step:title="Exemple concret" viz="31_JointSurvival" -->
Les modèles joints PK–TGI–survie sont très utilisés pour les **anticorps monoclonaux** d'immuno-oncologie (anti-PD-1, anti-TIM-3, anti-CD73, anti-NKG2A) : ils permettent de **prédire les résultats d'un essai** (par ex. une étude plateforme) avant sa réalisation.

En simulant l'exposition de chaque schéma, on prédit la réduction tumorale, donc la **survie sans progression (PFS)** — un outil de choix de dose et de design.
<!-- /step -->

<!-- step:title="Piège fréquent" -->
La taille tumorale précoce n'est pas la survie.

:::pitfall
Un bon effet tumoral à court terme ne garantit pas le bénéfice de survie (résistance, toxicité, hétérogénéité). Le lien tumeur → survie doit être **validé en externe** ; la survie se modélise en **temps-jusqu'à-événement** (hasard, censure), pas par une simple corrélation.
:::
<!-- /step -->

<!-- step:title="À retenir" -->
- La réponse oncologique = taille tumorale puis survie ; l'effet dépend de l'exposition (PK).
- Modèle de Claret : croissance $K_G$ − rétrécissement $K\cdot expo\cdot e^{-\lambda t}$ (résistance).
- Un modèle joint relie la taille tumorale au hasard de progression via $\beta$ → prédit la PFS.
- Application : anticorps d'immuno-oncologie, prédiction d'essais cliniques.
- Réserve : court terme ≠ survie ; validation externe indispensable.
<!-- /step -->
