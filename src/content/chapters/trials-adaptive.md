---
id: "trials-adaptive"
slug: "trials-adaptive"
title: "Recherche de dose et designs adaptatifs"
description: "Trouver la bonne dose efficacement : approches fondées sur le modèle, MCP-Mod et analyses intermédiaires."
summary: "Dose-finding model-based, MCP-Mod et designs adaptatifs : apprendre en cours d'essai pour mieux décider."
track: "trials"
order: 103
duration: "12 min"
level: "advanced"
tags: ["clinical-trials", "adaptive-design", "dose-finding", "mcp-mod"]
slides: []
sources: ["bretz-mcp-mod", "holford-sheiner-dose-effect", "ich-e4", "mould-upton"]
reviewed_on: "2026-07-09"
quiz:
  - prompt: "Une recherche de dose fondée sur un modèle (model-based) est plus efficace car..."
    options:
      - "elle utilise la relation dose–réponse continue, pas seulement des comparaisons par paires"
      - "elle teste une seule dose"
      - "elle ignore l'efficacité"
    correct: 0
  - prompt: "Un design adaptatif permet de..."
    options:
      - "modifier l'essai selon des analyses intermédiaires prédéfinies"
      - "changer le protocole au hasard en cours de route"
      - "supprimer le groupe témoin"
    correct: 0
  - prompt: "MCP-Mod combine..."
    options:
      - "test de tendance dose–réponse et modélisation pour estimer la dose"
      - "deux modèles PK indépendants"
      - "une simple moyenne des groupes"
    correct: 0
---

<!-- step:title="Pourquoi ce chapitre" -->
Choisir la **dose** est la décision la plus coûteuse d'un développement. Les approches **fondées sur le modèle** et les designs **adaptatifs** trouvent la bonne dose avec moins de patients et plus de fiabilité que les comparaisons classiques.

C'est là que la pharmacométrie rejoint directement la stratégie d'essai.
<!-- /step -->

<!-- step:title="Intuition" viz="EmaxHill" -->
Comparer quelques doses deux à deux **gaspille** l'information : la relation dose–réponse est **continue**. Un modèle (souvent un Emax) relie toutes les doses et estime la **dose cible** (ex. celle donnant 80 % de l'effet).

Un design **adaptatif** va plus loin : il ajuste l'allocation des patients aux doses **en cours d'essai**, selon ce qu'on apprend.
<!-- /step -->

<!-- step:title="La formule décortiquée" viz="EmaxHill" -->
La dose cible se lit sur la courbe dose–réponse. Pour un Emax, la dose donnant une fraction $f$ de l'effet maximal :

$$ D_f = ED_{50}\cdot\frac{f}{1-f} $$

**MCP-Mod** combine deux étapes : un **test multiple** de la présence d'une tendance dose–réponse (MCP), puis une **modélisation** (Mod) pour estimer la dose. Les designs **adaptatifs** (allocation réactive, arrêt précoce pour futilité/efficacité) sont pré-spécifiés et simulés à l'avance.

:::note
Réf. : Bretz F., Pinheiro J. & Branson M. (MCP-Mod), *Biometrics* 2005 ; approche qualifiée par l'EMA/FDA pour la phase II de recherche de dose.
:::
<!-- /step -->

<!-- step:title="Exemple concret" viz="EmaxHill" -->
Au lieu de comparer 4 doses vs placebo par tests séparés, MCP-Mod établit qu'il existe une tendance, ajuste un Emax et estime la dose donnant l'effet visé — avec un **intervalle de confiance** exploitable pour la phase III.

Une analyse **intermédiaire** peut alors abandonner les doses inefficaces et concentrer les patients sur les doses prometteuses.
<!-- /step -->

<!-- step:title="Piège fréquent" -->
Adaptatif ne veut pas dire improvisé.

:::pitfall
Un design adaptatif doit être **entièrement pré-spécifié** et validé par simulation : changer les règles en cours de route gonfle le risque d'erreur de type I. Et estimer la dose par un **seul** modèle mal choisi biaise le résultat — d'où l'intérêt de la moyenne de modèles de MCP-Mod.
:::
<!-- /step -->

<!-- step:title="À retenir" -->
- Le dose-finding model-based exploite la courbe dose–réponse continue (Emax).
- MCP-Mod : test de tendance + modélisation → estimation de la dose cible.
- Les designs adaptatifs ajustent l'essai selon des analyses intermédiaires pré-spécifiées.
- Tout doit être pré-spécifié et simulé, sinon inflation du risque d'erreur.
<!-- /step -->
