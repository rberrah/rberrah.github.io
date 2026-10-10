---
id: "covariates-physiology"
slug: "covariates-physiology"
title: "Covariables physiologiques : allométrie, Hill et PBPK"
description: "Décrire taille, maturation et fonction d’organe au-delà d’une exponentielle."
summary: "Décrire taille, maturation et fonction d’organe au-delà d’une exponentielle."
track: "covariates"
order: 3
duration: "14 min"
level: "intermediate"
tags: ["covariates","PK","PD"]
prerequisites: ["covariates-basics"]
glossary: ["Covariable", "Allométrie", "CLr", "DFG"]
slides: []
sources: ["anderson-holford-allometry","jones-rowland-yeo","goutelle-hill"]
reviewed_on: "2026-09-29"
review_type: "author"
reviewed_hash: "e175cdfddd62fc7b032a6f4c3fc950bed240b482d95de4592e6fbad32dd5a045"
quiz: [{"prompt":"À PMA = PMA50, le facteur de maturation vaut…","options":["0,5","1","h"],"correct":0},{"prompt":"Ajouter Hill à CL…","options":["ne suffit pas à construire un PBPK","rend automatiquement le modèle PBPK","supprime la variabilité individuelle"],"correct":0},{"prompt":"Un facteur de fonction rénale doit…","options":["respecter unités et composante d’élimination concernée","toujours multiplier toute la clairance","toujours être exponentiel"],"correct":0}]
---

<!-- step:title="Pourquoi ce chapitre" viz="CovariatePhysiology" -->
Une exponentielle n'est pas obligatoire. Une covariable peut modifier un débit, une activité enzymatique, un volume ou une capacité saturable. Une relation de Hill peut décrire la maturation sans que la variable d'entrée soit une concentration médicamenteuse.
<!-- /step -->

<!-- step:title="Intuition" -->
Séparer taille, maturation et fonction permet de formuler des hypothèses contrôlables. Une allométrie sur la masse seule ne représente pas nécessairement la maturation néonatale. L'exposant 0,75 est une hypothèse usuelle, pas une constante prouvée pour chaque médicament.

Un modèle PBPK décrit en plus une structure d'organes, des débits et des processus physiologiques. Ajouter une sigmoïde à CL dans un modèle compartimental ne suffit pas à le rendre PBPK.
<!-- /step -->

<!-- step:title="La formule décortiquée" -->
Un exemple de structure est :
$$ CL_i=CL_{70}\left(\frac{WT_i}{70}\right)^\alpha
\frac{PMA_i^h}{PMA_{50}^h+PMA_i^h}\,F_{\mathrm{organe},i}\exp(\eta_i). $$
PMA désigne l'âge post-menstruel, dans la même unité que $PMA_{50}$. Au point $PMA=PMA_{50}$, le facteur de maturation vaut 0,5 ; $h$ règle la pente. $CL_{70}$ est ici une asymptote à maturation complète et fonction d'organe de référence.

Une forme Emax $1+E_{\max}x/(EC_{50}+x)$ peut également être envisagée, avec des contraintes garantissant un facteur positif. Sa forme mathématique ne prouve pas un mécanisme récepteur.
<!-- /step -->

<!-- step:title="Exemple concret" viz="CovariatePhysiology" -->
Dans l'atelier, la taille est maintenue fixe pour isoler la maturation. Avec CLmax = 4 L/h, PMA50 = 50 semaines et h = 3, une PMA de 50 semaines donne CL = 2 L/h à ETA nul. Ces valeurs sont inventées pour l'enseignement, pas empruntées à une population pédiatrique.

Dans un modèle physiologique complet, la fonction rénale peut agir sur une composante rénale de CL et non sur toute la clairance. Conserver séparément les contributions rénale et non rénale évite d'imposer arbitrairement une disparition totale de CL.
<!-- /step -->

<!-- step:title="Piège fréquent" -->
Poids, âge et maturation sont corrélés : leur effet peut être difficile à séparer si la population couvre une plage étroite. Ne pas remplacer l'âge post-menstruel par l'âge postnatal sans modifier et réévaluer le modèle.

Le passage d'une formule de fonction rénale à une autre change parfois l'unité ou l'indexation à la surface corporelle. Une fonction saturable ajustée sur l'adulte ne justifie pas une extrapolation à l'enfant.
<!-- /step -->

<!-- step:title="À retenir" -->
- Définir les composantes physiologiques avant de choisir leur forme.
- Vérifier unités, bornes, asymptotes et valeur à la référence.
- Une sigmoïde est une relation possible, pas une preuve de PBPK.
- Valider les extrapolations dans la population visée.
<!-- /step -->
