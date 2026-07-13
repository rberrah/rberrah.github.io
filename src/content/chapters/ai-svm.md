---
id: "ai-svm"
slug: "ai-svm"
title: "Machines à vecteurs de support (SVM)"
description: "Séparer deux classes avec la marge la plus large possible, et courber la frontière par le kernel trick."
summary: "SVM : marge maximale, vecteurs de support, marge souple (C) et astuce du noyau."
track: "ai"
order: 16
duration: "13 min"
level: "advanced"
tags: ["ai", "svm", "classification", "kernel"]
slides: []
sources: ["cortes-vapnik-svm", "hastie-esl"]
reviewed_on: "2026-07-09"
quiz:
  - prompt: "Un SVM linéaire choisit la frontière qui..."
    options:
      - "maximise la marge entre les deux classes"
      - "passe par tous les points"
      - "minimise le nombre de covariables"
    correct: 0
  - prompt: "Les vecteurs de support sont..."
    options:
      - "les points situés sur (ou dans) la marge, qui définissent la frontière"
      - "toutes les observations"
      - "les points les plus éloignés"
    correct: 0
  - prompt: "Le kernel trick permet de..."
    options:
      - "séparer des classes non linéairement, sans calculer explicitement les nouvelles dimensions"
      - "supprimer la régularisation"
      - "transformer un SVM en arbre"
    correct: 0
---

<!-- step:title="Pourquoi ce chapitre" -->
Les **SVM** ont longtemps été l'outil de classification de référence, et restent utiles quand les données sont **peu nombreuses** mais bien structurées (ex. classer répondeurs / non-répondeurs).

Leur idée géométrique — la **marge maximale** — est élégante et éclaire beaucoup d'autres méthodes.
<!-- /step -->

<!-- step:title="Intuition" viz="41_SVMMargin" -->
Entre deux nuages de points, une infinité de droites séparent les classes. Laquelle choisir ? Le SVM prend celle qui laisse la **plus grande marge** de part et d'autre — la plus robuste.

Seuls les points **au bord** (les **vecteurs de support**) comptent : déplacer un point loin de la frontière ne change rien. Jouez sur $C$ pour élargir ou rétrécir la marge.
<!-- /step -->

<!-- step:title="La formule décortiquée" viz="41_SVMMargin" -->
La marge vaut $2/\lVert w\rVert$. La maximiser revient à :

$$ \min_{w,b}\ \tfrac{1}{2}\lVert w\rVert^2 \quad \text{s.c.}\quad y_i\,(w\cdot x_i + b) \ge 1 $$

En pratique on autorise des écarts (marge **souple**) via des variables $\xi_i$ et un paramètre $C$ :

$$ \min\ \tfrac{1}{2}\lVert w\rVert^2 + C\sum_i \xi_i $$

Grand $C$ → peu de tolérance (marge étroite) ; petit $C$ → marge large. Le **kernel trick** remplace $x\cdot x'$ par $K(x,x')$ pour séparer des classes **non linéairement** (noyau RBF, polynomial).

:::note
Réf. : Cortes C. & Vapnik V., *Support-Vector Networks*, Machine Learning 1995. Voir aussi les explications de **MLU-Explain**, https://mlu-explain.github.io.
:::
<!-- /step -->

<!-- step:title="Exemple concret" viz="41_SVMMargin" -->
Pour classer des patients **répondeurs vs non-répondeurs** à partir de quelques biomarqueurs, un SVM à noyau RBF trace une frontière courbe tolérant quelques exceptions (marge souple).

Le réglage de $C$ (et de la largeur du noyau $\gamma$) se fait par **validation croisée**.
<!-- /step -->

<!-- step:title="Piège fréquent" -->
Le SVM est sensible à l'échelle et au réglage.

:::pitfall
Sans **standardisation** des covariables, la marge est dominée par les variables à grande amplitude. Et un noyau trop flexible (grand $\gamma$, grand $C$) surajuste. Le SVM ne fournit pas de probabilités calibrées d'origine (il faut une étape supplémentaire).
:::
<!-- /step -->

<!-- step:title="À retenir" -->
- Le SVM maximise la marge entre classes ; seuls les vecteurs de support la définissent.
- Marge souple : $C$ arbitre tolérance aux erreurs vs largeur de la marge.
- Le kernel trick permet des frontières non linéaires sans expliciter les dimensions.
- Standardiser les covariables ; régler $C$ et $\gamma$ par validation croisée.
<!-- /step -->
