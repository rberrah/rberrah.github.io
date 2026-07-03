---
id: "trials-cts"
slug: "trials-cts"
title: "Simulation d'essais cliniques"
description: "Tester un essai avant de le faire : populations virtuelles, schémas posologiques et probabilité de succès."
summary: "La simulation d'essais cliniques (CTS) : générer des patients virtuels pour comparer designs et doses."
track: "trials"
order: 101
duration: "13 min"
level: "advanced"
tags: ["clinical-trials", "simulation", "cts", "power"]
slides: []
quiz:
  - prompt: "La simulation d'essais cliniques (CTS) permet de..."
    options:
      - "évaluer designs, doses et puissance avant de lancer l'essai"
      - "remplacer définitivement les essais réels"
      - "mesurer une concentration"
    correct: 0
  - prompt: "Pour simuler une population virtuelle réaliste, il faut..."
    options:
      - "un modèle PK/PD + des covariables corrélées + la variabilité"
      - "seulement la dose moyenne"
      - "un unique patient typique"
    correct: 0
  - prompt: "La probabilité de succès d'un essai (power) dépend surtout de..."
    options:
      - "la taille d'effet, la variabilité et la taille d'échantillon"
      - "la couleur du comprimé"
      - "le nom de la molécule"
    correct: 0
---

<!-- step:title="Pourquoi ce chapitre" -->
Un essai clinique coûte des années et des millions. La **simulation d'essais cliniques** (CTS) permet de le « répéter » virtuellement : quel design, quelle dose, quelle taille d'échantillon donnent la meilleure chance de succès ?

C'est l'aboutissement de la modélisation : transformer un modèle en **décision** de développement.
<!-- /step -->

<!-- step:title="Intuition" viz="12_VariabilitySandbox" -->
On génère des **patients virtuels** — chacun avec ses covariables et sa variabilité — puis on leur applique le protocole simulé et le modèle PK/PD.

En répétant l'essai des milliers de fois, on obtient la **distribution** des résultats possibles, donc la probabilité d'atteindre le critère (le « power »).
<!-- /step -->

<!-- step:title="La formule décortiquée" viz="12_VariabilitySandbox" -->
Une CTS enchaîne trois briques :

1. un **modèle de population** virtuelle (covariables corrélées — voir les copules) ;
2. un **modèle PK/PD** (avec IIV, IOV, erreur résiduelle) ;
3. un **modèle d'essai** (schéma, critères d'inclusion, analyse, règles d'arrêt).

On estime alors des métriques : **probabilité de succès**, dose optimale, taille d'échantillon nécessaire.

:::note
Réf. : Holford N., Kimko H. et al. — cadre de la simulation d'essais cliniques ; utilisée pour les designs adaptatifs et le choix de dose.
:::
<!-- /step -->

<!-- step:title="Exemple concret" viz="12_VariabilitySandbox" -->
Avant une phase III, on simule plusieurs **doses** et **tailles d'échantillon** : la simulation montre qu'à 200 patients la puissance n'est que de 60 %, mais atteint 85 % à 300 — une information décisive pour le design.

On peut aussi tester la robustesse à la **non-observance** ou à des écarts au protocole.
<!-- /step -->

<!-- step:title="Piège fréquent" -->
La simulation hérite des faiblesses du modèle.

:::pitfall
Une CTS ne vaut que ce que valent ses **hypothèses** : un modèle mal validé, une variabilité sous-estimée ou des covariables irréalistes produisent une confiance illusoire. Il faut propager l'**incertitude des paramètres** (pas seulement la variabilité) pour des prédictions honnêtes.
:::
<!-- /step -->

<!-- step:title="À retenir" -->
- La CTS « rejoue » un essai sur des populations virtuelles pour éclairer le design.
- Trois briques : population virtuelle + modèle PK/PD + modèle d'essai.
- Fournit probabilité de succès, dose et taille d'échantillon.
- Propager l'incertitude des paramètres, sinon confiance illusoire.
<!-- /step -->
