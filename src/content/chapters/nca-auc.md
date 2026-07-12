---
id: "nca-auc"
slug: "nca-auc"
title: "AUC : trapèzes, extrapolation et λz"
description: "Calculer l'aire sous la courbe pas à pas : trapèzes linéaires/log, pente terminale et extrapolation."
summary: "La méthode des trapèzes, le choix linéaire vs log, l'estimation de λz et l'AUC extrapolée à l'infini."
track: "nca"
order: 81
duration: "12 min"
level: "intermediate"
tags: ["nca", "auc", "trapezoidal", "lambda-z"]
slides: []
sources: ["gabrielsson-weiner", "gibaldi-perrier", "rowland-tozer"]
reviewed_on: "2026-07-09"
quiz:
  - prompt: "La méthode des trapèzes calcule l'AUC en..."
    options:
      - "sommant l'aire de trapèzes entre points successifs"
      - "prenant la concentration maximale"
      - "dérivant la courbe"
    correct: 0
  - prompt: "λz (pente terminale) s'estime par régression log-linéaire..."
    options:
      - "sur les derniers points de la phase d'élimination"
      - "sur le pic de concentration"
      - "sur un seul point"
    correct: 0
  - prompt: "Une fraction extrapolée trop grande (> 20 %) signale..."
    options:
      - "un échantillonnage terminal insuffisant, AUC peu fiable"
      - "un excellent protocole"
      - "une dose trop faible"
    correct: 0
---

<!-- step:title="Pourquoi ce chapitre" -->
L'**AUC** est la mesure centrale d'exposition. Bien la calculer — et savoir quand elle est fiable — conditionne toute la NCA, de la bioéquivalence au TDM.

Ce chapitre décortique le calcul, trapèze par trapèze.
<!-- /step -->

<!-- step:title="Intuition" viz="08_AUCTrap" -->
On approche l'aire sous la courbe par une succession de **trapèzes** entre points de mesure. Plus les points sont rapprochés, plus l'approximation est fine.

Sur la phase descendante, un trapèze **logarithmique** épouse mieux la décroissance exponentielle qu'un trapèze linéaire.
<!-- /step -->

<!-- step:title="La formule décortiquée" viz="08_AUCTrap" -->
Entre deux points, l'aire du trapèze **linéaire** vaut :

$$ \Delta\text{AUC} = \frac{(C_i + C_{i+1})}{2}\,(t_{i+1}-t_i) $$

Puis on estime la **pente terminale** $\lambda_z$ par régression de $\ln C$ sur les derniers points, et on **extrapole** :

$$ \text{AUC}_{0-\infty} = \text{AUC}_{0-t_{last}} + \frac{C_{last}}{\lambda_z},\qquad t_{1/2} = \frac{\ln 2}{\lambda_z} $$

:::math
La **fraction extrapolée** = $\dfrac{C_{last}/\lambda_z}{\text{AUC}_{0-\infty}}$ doit rester faible (idéalement < 20 %).
:::
<!-- /step -->

<!-- step:title="Exemple concret" viz="08_AUCTrap" -->
Sur un profil IV, on somme les trapèzes jusqu'au dernier point, on lit $\lambda_z$ sur les 3–4 derniers points en semi-log, puis on ajoute $C_{last}/\lambda_z$.

L'atelier interactif montre comment le **choix des points terminaux** change $\lambda_z$ — et donc l'AUC extrapolée et la demi-vie.
<!-- /step -->

<!-- step:title="Piège fréquent" -->
λz est sensible au choix des points.

:::pitfall
Inclure des points **hors de la phase terminale** (encore en distribution) biaise $\lambda_z$. Trop peu de points terminaux, ou un $R^2$ médiocre, rendent la demi-vie et l'AUC∞ non fiables. Une **fraction extrapolée** élevée est un signal d'alarme.
:::
<!-- /step -->

<!-- step:title="À retenir" -->
- L'AUC se calcule par trapèzes (linéaires, ou log en phase descendante).
- λz = pente terminale (régression log-linéaire des derniers points) ; t½ = ln2/λz.
- AUC∞ = AUC observée + C_last/λz ; surveiller la fraction extrapolée (< 20 %).
- Le choix des points terminaux est critique pour λz.
<!-- /step -->
