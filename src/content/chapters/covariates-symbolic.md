---
id: "covariates-symbolic"
slug: "covariates-symbolic"
title: "Des réseaux neuronaux aux covariables symboliques"
description: "Apprendre une relation non linéaire puis proposer une équation interprétable."
summary: "Apprendre une relation non linéaire puis proposer une équation interprétable."
track: "covariates"
order: 4
duration: "13 min"
level: "intermediate"
tags: ["covariates","PK","PD"]
prerequisites: ["covariates-basics"]
glossary: ["Covariable", "White / black / grey box", "Neural ODE", "IIV", "ω / Ω"]
slides: []
sources: ["wahlquist-symbolic-covariates","cranmer-symbolic","hastie-esl","sanghavi-covariates"]
reviewed_on: "2026-10-09"
updated_on: "2026-10-09"
review_type: "author"
reviewed_hash: "c8ac87d3c2ff94d900af565e1047985a9bc22c304f07cfaf14f0dac884489fc2"
quiz: [{"prompt":"Une formule qui imite bien le réseau…","options":["doit encore être validée sur les observations","est forcément causale","hérite automatiquement d’une validation clinique"],"correct":0},{"prompt":"La séparation entraînement/test doit en général se faire…","options":["par patient","au hasard entre prélèvements d’un même patient","après le choix final de l’équation"],"correct":0},{"prompt":"Une formule symbolique déterministe fournit-elle OMEGA ?","options":["non, la variabilité doit être modélisée et estimée","oui, toujours","uniquement si elle est courte"],"correct":0}]
---

<!-- step:title="Pourquoi ce chapitre" viz="CovariateSymbolic" -->
Une relation trop complexe pour quelques puissances peut être apprise par un réseau. L'objectif pharmacométrique reste de comprendre quelle fonction modifie un paramètre et si elle prédit correctement de nouveaux patients, pas seulement de minimiser une erreur d'entraînement.
<!-- /step -->

<!-- step:title="Intuition" -->
Deux démarches sont distinctes : entraîner un réseau puis chercher une équation qui l'approche, ou apprendre directement un réseau symbolique composé d'opérations interprétables.

Wahlquist et collaborateurs ont étudié cette seconde démarche sur des données de propofol. Leur découverte de structure est déterministe ; elle ne fournit pas automatiquement une distribution d'effets aléatoires. Une intégration ultérieure dans un cadre à effets mixtes est un travail supplémentaire.
<!-- /step -->

<!-- step:title="La formule décortiquée" -->
Une architecture possible conserve la PK mécaniste :
$$ \theta_i=g_\phi(x_i),\qquad \dot A_i=f(A_i,\theta_i,D_i). $$
Une régression symbolique cherche ensuite une expression $s(x)$ conciliant fidélité à $g_\phi$ et simplicité. Par exemple :
$$ CL_i=\theta\exp\{\beta\log(z_i)+b(z_i-1)^2+\eta_i\},\qquad z_i=WT_i/70. $$
Cette formule est **illustrative** : elle n'est ni une équation publiée de propofol ni un résultat appris dans l'atelier. L'ETA est ajouté dans une étape de modélisation statistique explicitement définie.
<!-- /step -->

<!-- step:title="Exemple concret" viz="CovariateSymbolic" -->
Le graphique représente **42 patients simulés entre 40 et 90 kg**. Leur clairance individuelle suit la relation génératrice, multipliée par $\exp(\eta_i)$, avec $\eta_i\sim\mathcal N(0,\omega^2)$. Le curseur peut sortir de cette plage pour illustrer l'extrapolation, mais aucun patient n'est simulé dans les zones grisées. Les courbes candidates ne sont pas ajustées à ces points ; leur écart RMS mesure uniquement leur distance à la courbe typique entre 40 et 90 kg, pas une performance clinique.

Un protocole reproductible :
1. Séparer les patients d'entraînement, de validation et de test avant toute transformation.
2. Apprendre le réseau avec des contraintes de positivité, d'unités et de domaine.
3. Rechercher une formule sur les seules données autorisées pour le développement.
4. Choisir sa complexité sur la validation, puis figer la structure.
5. Réestimer les coefficients, la variabilité et l'erreur dans le modèle PK/PD complet.
6. Évaluer sur les patients de test intacts, puis dans une population externe.

Mesurer séparément l'écart formule–réseau et l'erreur de prédiction des observations. Une bonne imitation d'un mauvais réseau ne produit pas un bon modèle clinique.
<!-- /step -->

<!-- step:title="Piège fréquent" -->
Une formule courte peut extrapoler très mal : dénominateur proche de zéro, puissance d'une valeur négative, explosion hors du domaine. Sa lisibilité ne démontre ni causalité ni validité biologique.

**La relation covariable–paramètre est étayée dans une population et une plage de valeurs, pas partout où sa formule peut être calculée.** Si elle est développée sur des patients de **40 à 90 kg**, l'utiliser chez un patient de **20 ou 200 kg** constitue une extrapolation non validée. Cela exige une justification et une validation spécifiques ; une bonne concordance dans la plage étudiée ne suffit pas. Ce principe concerne aussi les modèles paramétriques classiques, pas seulement les réseaux ou la régression symbolique.

Sélectionner l'équation après avoir vu les performances sur le test contamine ce test. Une validation par lignes mélangeant les prélèvements d'un même patient entre entraînement et test produit également une fuite.
<!-- /step -->

<!-- step:title="À retenir" -->
- Réseau puis distillation et réseau symbolique direct sont deux voies possibles.
- Conserver une structure PK/PD ne suffit pas à valider la partie apprise.
- Figer et tester l'équation finale, pas uniquement le réseau.
- Documenter domaine, transformations, version, incertitude et limites.
- Hors de la plage étudiée, une valeur calculable n'est pas une prédiction validée.
<!-- /step -->
