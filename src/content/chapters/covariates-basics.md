---
id: "covariates-basics"
slug: "covariates-basics"
title: "Covariables : effets fixes, ETA et transformations"
description: "Séparer la relation systématique au patient et la variabilité interindividuelle restante."
summary: "Séparer la relation systématique au patient et la variabilité interindividuelle restante."
track: "covariates"
order: 1
duration: "12 min"
level: "intermediate"
tags: ["covariates","PK","PD"]
prerequisites: ["variabilite-iiv-iov"]
glossary: ["Covariable", "Centrage", "η", "ω / Ω", "Distribution lognormale", "Distribution logit-normale"]
slides: []
sources: ["monolix-covariates","simulx-individual","lavielle","sanghavi-covariates"]
reviewed_on: "2026-10-09"
updated_on: "2026-10-09"
review_type: "author"
quiz: [{"prompt":"Un bêta de covariable représente…","options":["un effet systématique sur un paramètre","un ETA individuel observé","une variance résiduelle"],"correct":0},{"prompt":"Pour une fraction strictement entre 0 et 1, un lien possible est…","options":["le logit","le logarithme seul","aucun lien ne peut la borner"],"correct":0},{"prompt":"Le poids agit sur CL et V :","options":["les deux effets peuvent avoir des coefficients différents","il faut nécessairement un bêta unique","cela impose une corrélation ETA de 1"],"correct":0}]
---

<!-- step:title="Pourquoi ce chapitre" viz="CovariateEffects" -->
Le poids, la fonction rénale, un génotype ou un biomarqueur peuvent expliquer une partie des différences de paramètres PK **ou PD**. Une covariable peut agir sur plusieurs paramètres, avec des coefficients distincts : poids sur CL et V, par exemple. Cela ne signifie pas que les ETA deviennent des covariables.
<!-- /step -->

<!-- step:title="Intuition" -->
Trois niveaux doivent rester séparés : la valeur mesurée $x_i$, son effet systématique décrit par un coefficient $\beta$, puis l'écart individuel $\eta_i$ restant après cet effet. Les ETA peuvent être corrélés entre paramètres via la matrice $\Omega$. Cette corrélation n'est pas la relation poids–clairance.

La distribution du poids dans une population simulée n'est pas non plus la distribution log-normale d'un paramètre conditionnellement au poids.

Une relation covariable–paramètre a un **domaine d'application**, défini notamment par la population et la plage étudiées. Une formule développée entre **40 et 90 kg** n'est pas automatiquement applicable à **20 ou 200 kg** : ce serait une extrapolation, à justifier et valider séparément. Rester dans la plage ne garantit pas non plus la validité chez tous les patients, notamment si leurs autres caractéristiques diffèrent.
<!-- /step -->

<!-- step:title="La formule décortiquée" -->
Pour un paramètre positif :
$$ \log(CL_i)=\log(CL_{ref})+\beta_{WT}\log(WT_i/70)+\eta_{CL,i},\qquad \eta_i\sim\mathcal N(0,\Omega) $$
Donc $CL_i=CL_{ref}(WT_i/70)^{\beta_{WT}}\exp(\eta_{CL,i})$. L'effet fixe et l'ETA sont additifs **sur l'échelle transformée**, mais ne remplissent pas le même rôle. La valeur typique à ETA nul est une médiane conditionnelle log-normale, pas sa moyenne arithmétique.

Une fonction de lien identité convient à un paramètre normal non contraint ; le logarithme garantit la positivité ; le logit maintient une fraction strictement entre 0 et 1. Le choix dépend du paramètre, pas du nom de la covariable.
<!-- /step -->

<!-- step:title="Exemple concret" viz="CovariateEffects" -->
Avec $CL_{ref}=4$ L/h, un poids de 35 kg et $\beta=0{,}75$, CL typique vaut environ 2,38 L/h. Un ETA de 0,2 multiplie cette valeur par $\exp(0{,}2)$, soit environ 2,91 L/h.

Dans Monolix, déclarer le poids comme covariable continue, créer sa transformation centrée, puis associer celle-ci à CL dans le modèle individuel. L'ETA de CL reste configuré séparément. Pour V, un autre coefficient peut être estimé, ou fixé si justifié. [Explorer ces effets](../../covariates/).
<!-- /step -->

<!-- step:title="Piège fréquent" -->
Une régression des ETA estimés sur le poids est un diagnostic exploratoire, pas un substitut à l'estimation conjointe du modèle de population. Le shrinkage, le plan de prélèvement et les corrélations entre covariables peuvent masquer ou créer des associations apparentes. L'ajout d'une covariable ne garantit pas une réduction de toutes les variances estimées.

Une association prédictive n'est pas automatiquement causale. Ne pas simuler indépendamment poids, âge et fonction rénale si cela produit des patients physiologiquement impossibles.
<!-- /step -->

<!-- step:title="À retenir" -->
- Bêta décrit une relation systématique ; ETA décrit une variabilité restante.
- Une même covariable peut avoir plusieurs effets.
- Référence, unités et transformation font partie du modèle.
- La matrice OMEGA et la distribution des covariables sont deux objets différents.
- Documenter la plage étudiée et ne pas confondre extrapolation et validation.
<!-- /step -->
