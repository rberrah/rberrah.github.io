---
id: "nca-intro"
slug: "nca-intro"
title: "Principes de l'analyse non-compartimentale"
description: "Estimer l'exposition sans supposer de structure : les hypothèses et la portée de la NCA."
summary: "Ce qu'est la NCA, ce qu'elle suppose (linéarité, phase terminale) et quand la préférer à un modèle."
track: "nca"
order: 80
duration: "11 min"
level: "beginner"
tags: ["nca", "auc", "exposure", "regulatory"]
slides: []
sources: ["yamaoka-moments", "ema-bioequivalence", "mager-jusko-tmdd", "gibaldi-perrier"]
reviewed_on: "2026-07-09"
quiz:
  - prompt: "La NCA se distingue d'un modèle compartimental car elle..."
    options:
      - "ne suppose aucune structure de compartiments"
      - "impose un modèle à deux compartiments par défaut"
      - "estime les constantes de transfert entre compartiments"
    correct: 0
  - prompt: "La NCA suppose principalement une cinétique..."
    options:
      - "linéaire (exposition proportionnelle à la dose)"
      - "saturable, de type Michaelis-Menten à haute dose"
      - "d'ordre zéro, à vitesse d'élimination constante"
    correct: 0
---

<!-- step:title="Pourquoi ce chapitre" -->
Avant tout modèle, on veut une mesure **robuste et simple** de l'exposition. La **NCA** (analyse non-compartimentale) fournit AUC, Cmax, demi-vie et clairance **sans supposer** de structure de compartiments.

C'est la méthode de référence en **bioéquivalence** et dans les premiers stades du développement.
<!-- /step -->

<!-- step:title="Intuition" viz="04_ThreeApproaches" -->
La NCA « laisse parler les données » : on relie les points, on mesure l'aire, on lit la pente terminale.

Pas de compartiments, pas d'équations différentielles à ajuster — mais aussi pas d'extrapolation mécaniste. C'est un instrument de **mesure**, pas de **prédiction**.
<!-- /step -->

<!-- step:title="La formule décortiquée" viz="04_ThreeApproaches" -->
La NCA repose sur deux piliers : l'**AUC** (exposition) et la **pente terminale** $\lambda_z$ (élimination).

$$ \text{AUC}_{0-\infty} = \text{AUC}_{0-t_{last}} + \frac{C_{last}}{\lambda_z} $$

Elle suppose une cinétique **linéaire** (l'AUC est proportionnelle à la dose) et une **phase terminale** log-linéaire bien définie.

:::note
Ce parcours approfondit le chapitre d'introduction du parcours fondamental ; les chapitres suivants détaillent l'AUC, les paramètres dérivés et le cas oral.
:::
<!-- /step -->

<!-- step:title="Exemple concret" viz="04_ThreeApproaches" -->
En **bioéquivalence**, on compare l'AUC et la Cmax d'un générique vs le princeps : la NCA suffit, car on ne cherche pas un mécanisme mais une **équivalence d'exposition**.

Les autorités (EMA, FDA) exigent d'ailleurs des critères NCA (rapports d'AUC/Cmax dans 80–125 %).
<!-- /step -->

<!-- step:title="Piège fréquent" -->
La NCA ne dispense pas de bons prélèvements.

:::pitfall
Si la **phase terminale** est mal échantillonnée, $\lambda_z$ et l'AUC extrapolée sont fausses. Et la NCA suppose la **linéarité** : à des doses saturantes (TMDD, Michaelis-Menten), l'AUC n'est plus proportionnelle à la dose et la NCA induit en erreur.
:::
<!-- /step -->

<!-- step:title="À retenir" -->
- La NCA estime l'exposition sans supposer de structure compartimentale.
- Piliers : AUC (exposition) et λz (pente terminale d'élimination).
- Méthode de référence en bioéquivalence (critères réglementaires).
- Suppose la linéarité et une phase terminale bien échantillonnée.
<!-- /step -->
