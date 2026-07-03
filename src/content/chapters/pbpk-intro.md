---
id: "pbpk-intro"
slug: "pbpk-intro"
title: "Principes de la PBPK"
description: "Construire un modèle à partir de la physiologie : organes, débits sanguins et bilans de masse."
summary: "La logique PBPK : compartiments = organes reliés par la circulation, perfusion vs perméabilité."
track: "pbpk"
order: 70
duration: "13 min"
level: "advanced"
tags: ["pbpk", "physiology", "blood-flow", "mechanistic"]
slides: []
quiz:
  - prompt: "Dans un modèle PBPK, les compartiments représentent..."
    options:
      - "des organes réels reliés par la circulation sanguine"
      - "des abstractions mathématiques sans sens physiologique"
      - "des doses"
    correct: 0
  - prompt: "Un organe 'perfusion-limited' est limité par..."
    options:
      - "le débit sanguin qui l'irrigue"
      - "la couleur du tissu"
      - "la dose administrée"
    correct: 0
  - prompt: "L'atout majeur de la PBPK est de..."
    options:
      - "extrapoler entre espèces, doses et populations via la physiologie"
      - "éviter toute donnée"
      - "supprimer la variabilité"
    correct: 0
---

<!-- step:title="Pourquoi ce chapitre" -->
La **PBPK** (physiologically-based PK) construit le modèle à partir de la **physiologie réelle** : chaque compartiment est un organe, relié aux autres par le sang. Contrairement aux modèles empiriques, ses paramètres ont un **sens biologique**.

Cela permet d'**extrapoler** là où les données manquent : animal → homme, adulte → enfant, interactions médicamenteuses.
<!-- /step -->

<!-- step:title="Intuition" viz="01_HumanBody" -->
Imaginez le corps comme un réseau d'organes (foie, reins, muscle, graisse…) irrigués par la circulation. Le médicament **circule**, se **distribue** dans chaque tissu selon son affinité, et est **éliminé** là où se trouvent les enzymes/reins.

Chaque organe est un petit réservoir avec une entrée et une sortie sanguines.
<!-- /step -->

<!-- step:title="La formule décortiquée" viz="01_HumanBody" -->
Chaque tissu suit un **bilan de masse**. Pour un organe *perfusion-limited* :

$$ V_T\frac{dC_T}{dt} = Q_T\left(C_{art} - \frac{C_T}{K_{p,T}}\right) $$

- $Q_T$ : débit sanguin de l'organe ; $V_T$ : son volume ;
- $K_{p,T}$ : coefficient de **partage** tissu/plasma (affinité) ;
- l'élimination s'ajoute dans les organes épurateurs (foie, reins).

Quand la membrane freine l'entrée, on passe à un modèle *permeability-limited* (deux sous-compartiments).

:::note
Réf. : Jones H. & Rowland-Yeo K., *Basic concepts in PBPK modeling* (CPT:PSP 2013). Écoles de modélisation mécaniste : **Leiden** (LACDR) et Simcyp/Certara.
:::
<!-- /step -->

<!-- step:title="Exemple concret" viz="01_HumanBody" -->
Pour prédire la PK chez l'**enfant**, on ajuste les débits, volumes et maturités enzymatiques selon l'âge — la structure du modèle, elle, reste la même.

C'est pourquoi la PBPK est de plus en plus acceptée par les **autorités** pour justifier des doses pédiatriques ou évaluer des interactions.
<!-- /step -->

<!-- step:title="Piège fréquent" -->
Mécaniste ne veut pas dire infaillible.

:::pitfall
Un modèle PBPK cumule **beaucoup de paramètres** (débits, Kp, fractions libres, activités enzymatiques). Chaque hypothèse fausse se propage. Sans données pour le **vérifier** (au moins partiellement), la complexité donne une fausse impression de certitude.
:::
<!-- /step -->

<!-- step:title="À retenir" -->
- PBPK = compartiments physiologiques (organes) reliés par les débits sanguins.
- Organe perfusion-limited : bilan de masse avec Q_T, V_T et le partage Kp.
- Force : extrapolation inter-espèces, pédiatrie, interactions (via la physiologie).
- Faiblesse : nombreux paramètres et hypothèses à vérifier.
<!-- /step -->
