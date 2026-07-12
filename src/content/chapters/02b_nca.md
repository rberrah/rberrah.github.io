---
id: "nca"
slug: "nca"
title: "L'analyse non compartimentale (NCA)"
description: "Décrire l'exposition sans modèle : AUC, Cmax, λz et les ordres de cinétique."
summary: "Une plongée dans la NCA : paramètres primaires/secondaires, trapèzes, extrapolation et limites."
track: "core"
order: 2.5
duration: "14 min"
level: "beginner"
tags: ["nca", "auc", "approaches"]
slides: ["s23", "s34", "s45"]
quiz:
  - prompt: "La NCA a surtout besoin de..."
    options:
      - "la dose et la voie d'administration"
      - "un modèle physiologique complet"
      - "un réseau de neurones entraîné"
    correct: 0
  - prompt: "Une cinétique d'ordre 1 signifie que la vitesse..."
    options:
      - "est proportionnelle à la concentration"
      - "est constante quelle que soit la concentration"
      - "est nulle"
    correct: 0
  - prompt: "L'extrapolation de l'AUC jusqu'à l'infini utilise..."
    options:
      - "la dernière concentration et la pente terminale λz"
      - "uniquement la dose"
      - "le poids du patient"
    correct: 0
---

<!-- step:title="Pourquoi ce chapitre" slides="s23" viz="04_ThreeApproaches" -->
Avant de construire un modèle, on peut déjà **décrire** ce qu'on observe. C'est le rôle de l'**analyse non compartimentale** (NCA).

Elle ne demande que la **dose** et la **voie d'administration**, calcule l'exposition par géométrie et algèbre, et sert souvent à **valider grossièrement** un protocole (ordre de grandeur de la demi-vie) avant une analyse plus lourde.
<!-- /step -->

<!-- step:title="Intuition" slides="s34" viz="AUCTrap" -->
La NCA « laisse parler les données » : pas de compartiments, pas d'hypothèse de structure.

On mesure directement la surface sous la courbe (l'**exposition**) en découpant le profil en **trapèzes** entre les points de prélèvement.
<!-- /step -->

<!-- step:title="Ordres de cinétique" slides="s34" viz="AUCTrap" -->
Les transferts ADME suivent des **vitesses**. Trois régimes reviennent sans cesse :

- **Ordre 1** : la vitesse est **proportionnelle à la concentration** (plus il y a de médicament, plus ça va vite). La décroissance est exponentielle.
- **Ordre 0** : la vitesse est **constante** (ex. perfusion, enzyme saturée) — plus il y en a, plus c'est long.
- **Michaélien** : saturable — d'ordre 1 à basse concentration, d'ordre 0 quand les enzymes/transporteurs saturent. La saturation annonce souvent la zone toxique.

:::note
Une même cinétique peut **alterner** les ordres selon la concentration.
:::
<!-- /step -->

<!-- step:title="La formule décortiquée" slides="s34" viz="AUCTrap" -->
On classe les paramètres NCA par **P-H-A-M** : **P**ente (ke, ka), **H**auteur (C0, Cmax, Css), **A**ire (AUC), **M**oment (AUMC).

L'aire par trapèzes couvre les points observés ; on **extrapole** la queue par la pente terminale :

$$ \mathrm{AUC}_{0-\infty} = \mathrm{AUC}_{0-t} + \frac{C_{last}}{\lambda_z} $$

:::math
On en déduit les paramètres « primaires » : clairance $CL/F = \text{Dose}/\mathrm{AUC}$, demi-vie $t_{1/2} = \ln 2/\lambda_z$, et volume $V_z/F = CL/\lambda_z$.
:::
<!-- /step -->

<!-- step:title="Exemple concret" slides="s45" viz="AUCTrap" -->
Pour la warfarine, la NCA donne rapidement l'AUC de chaque sujet et une demi-vie approximative.

Mais dès qu'on veut expliquer **pourquoi** les patients diffèrent (poids, génotype) ou **simuler** une autre posologie, il faut passer à une approche compartimentale / PopPK.
<!-- /step -->

<!-- step:title="Piège fréquent" slides="s45" -->
La NCA décrit, elle ne prédit pas — et elle est sensible à l'échantillonnage.

:::pitfall
La **méthode analytique** compte : une limite de quantification élevée peut masquer une phase de décroissance, changeant radicalement la demi-vie estimée. Trop peu de points en fin de courbe rendent λz (donc l'AUC extrapolée) peu fiable.
:::
<!-- /step -->

<!-- step:title="À retenir" -->
- La NCA est descriptive : dose + voie suffisent, robuste mais non prédictive.
- Ordres de cinétique : 1 (proportionnel), 0 (constant), michaélien (saturable).
- AUC par trapèzes + extrapolation $C_{last}/\lambda_z$ ; on en tire CL/F, t½, Vz/F.
- Rappel : ~5 à 6 demi-vies pour éliminer (ou atteindre) l'essentiel.

:::note
**Pour aller plus loin.** Ce chapitre est la **porte d'entrée** du tronc commun. Le parcours d'approfondissement **« Analyse non-compartimentale »** (4 chapitres) reprend le sujet en détail : calcul de l'AUC, paramètres dérivés, phase d'absorption.
:::
<!-- /step -->
