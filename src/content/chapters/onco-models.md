---
id: "onco-models"
slug: "onco-models"
title: "Catalogue des modèles en oncologie"
description: "Panorama des modèles usuels : croissance tumorale, résistance, toxicité et liens à la survie."
summary: "Une carte des modèles oncologiques (Gompertz, Simeoni, Claret, Stein, Wang, deux populations, Friberg, joints)."
track: "onco"
order: 32
duration: "15 min"
level: "advanced"
tags: ["oncology", "tumor-growth", "models", "catalog"]
slides: []
sources: ["simeoni", "claret-tgi-os", "stein-tumor-growth", "friberg"]
reviewed_on: "2026-07-09"
quiz:
  - prompt: "Le modèle de croissance de Gompertz décrit une croissance..."
    options:
      - "qui ralentit quand la tumeur approche sa taille limite (plateau)"
      - "qui reste exponentielle à taux constant, sans jamais plafonner"
      - "qui devient linéaire dès que la tumeur dépasse un seuil de taille"
    correct: 0
  - prompt: "Les modèles à deux populations cellulaires servent surtout à représenter..."
    options:
      - "la résistance : cellules sensibles au traitement vs résistantes"
      - "la variabilité entre deux sous-groupes de patients (mixture)"
      - "la diffusion du médicament entre deux compartiments tissulaires"
    correct: 0
  - prompt: "Un modèle TGI-OS relie..."
    options:
      - "la dynamique tumorale précoce à la survie globale du patient"
      - "l'exposition plasmatique à la réduction tumorale précoce"
      - "la profondeur du nadir hématologique à la dose reçue"
    correct: 0
---

<!-- step:title="Pourquoi ce chapitre" -->
L'oncologie foisonne de modèles ; il est facile de s'y perdre. Ce chapitre en dresse la **carte** : croissance non perturbée, effet du traitement, résistance, toxicité, et liens à la survie.

L'objectif n'est pas d'apprendre chaque équation par cœur, mais de savoir **lequel choisir** et pourquoi.
<!-- /step -->

<!-- step:title="Intuition" viz="30_TumorGrowth" -->
Tout modèle TGI combine deux briques : une **croissance** (comment la tumeur grossit seule) et un **effet** (comment le traitement la freine).

Les modèles diffèrent par la **forme de croissance** (exponentielle, ralentie, plafonnée) et par la façon dont l'**effet** et la **résistance** entrent.
<!-- /step -->

<!-- step:title="La formule décortiquée" viz="30_TumorGrowth" -->
Les **croissances** classiques :

$$ \text{Exponentielle: } \dot W = \lambda W \quad|\quad \text{Gompertz: } \dot W = \lambda W\ln\!\frac{W_\infty}{W} \quad|\quad \text{Logistique: } \dot W = \lambda W\Big(1-\frac{W}{W_\infty}\Big) $$

Les modèles **avec traitement** les plus utilisés :

- **Simeoni** : croissance exponentielle→linéaire, effet $-k_2\,C\,W$, compartiments de cellules mourantes.
- **Claret** (TGI-OS) : rétrécissement $K\cdot expo$ qui **s'épuise** ($e^{-\lambda t}$, résistance).
- **Stein / Wang** : décomposition en une fraction qui régresse et une qui recroît (SLD).
- **Deux populations** : cellules **sensibles** (décroissent) et **résistantes** (croissent), avec mutations possibles.

:::note
Réf. : Gompertz (1825) ; Norton-Simon ; Simeoni *Cancer Res* 2004 ; Claret *J Clin Oncol* 2009 ; Stein *Clin Cancer Res* 2008 ; Wang *Clin Pharmacol Ther* 2009 ; Bonate. Oncologie mathématique : équipe **COMPO** (Marseille — S. Benzekry, J. Ciccolini).
:::
<!-- /step -->

<!-- step:title="Exemple concret" viz="31_JointSurvival" -->
Une fois la tumeur modélisée, on la **relie** à des issues cliniques :

- **TGI-OS / TGI-PFS** : la dynamique tumorale précoce (ex. réduction à 8 semaines) prédit la survie.
- **Modèle joint** : le hasard de progression dépend en continu de la taille tumorale.
- **Toxicité** : le modèle de **Friberg** (myélosuppression) borne la dose administrable.

Ensemble, ils forment le socle du choix de dose en oncologie.
<!-- /step -->

<!-- step:title="Piège fréquent" -->
Un modèle plus complexe n'est pas forcément meilleur.

:::pitfall
Sans données assez riches (plusieurs doses, suivi long), un modèle à deux populations ou à résistance est **non identifiable** : ses paramètres deviennent arbitraires. Choisir la complexité selon les données, et valider en externe — surtout avant d'extrapoler à la survie.
:::
<!-- /step -->

<!-- step:title="À retenir" -->
- Croissances : exponentielle, Gompertz, logistique (ralentissement/plateau).
- Avec traitement : Simeoni, Claret (résistance), Stein/Wang, deux populations.
- Liens cliniques : TGI-OS/PFS, modèles joints ; toxicité via Friberg.
- Adapter la complexité aux données ; valider avant d'extrapoler à la survie.
<!-- /step -->
