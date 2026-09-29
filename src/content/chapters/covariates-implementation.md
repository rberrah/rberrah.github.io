---
id: "covariates-implementation"
slug: "covariates-implementation"
title: "Implémenter et valider un modèle de covariables"
description: "Un exemple reproductible mrgsolve et Monolix, avec unités, OMEGA, covariables temporelles et contrôles."
summary: "Un exemple reproductible mrgsolve et Monolix, avec unités, OMEGA, covariables temporelles et contrôles."
track: "covariates"
order: 5
duration: "20 min"
level: "advanced"
tags: ["covariates","mrgsolve","Monolix","validation"]
prerequisites: ["covariates-basics","covariates-groups","covariates-physiology","covariates-symbolic"]
glossary: []
slides: []
sources: ["monolix-covariates","simulx-individual","jonsson-covariates","pmetrics","hastie-esl","mrgsolve"]
reviewed_on: "2026-09-29"
quiz: [{"prompt":"Avec variances 0,09 et 0,04 et covariance 0,03, la corrélation vaut…","options":["0,5","0,03","1,5"],"correct":0},{"prompt":"Dans l’exemple structurel Monolix, l’IIV est configurée sur…","options":["Cl0 et V0","WT uniquement","betaWT et ratioGENO obligatoirement"],"correct":0},{"prompt":"Une interpolation utilisant une mesure future en prévision prospective…","options":["peut provoquer une fuite d’information","est toujours plus exacte cliniquement","équivaut au report de la dernière valeur"],"correct":0}]
---

<!-- step:title="Pourquoi ce chapitre" -->
Une formule correcte sur le papier peut être doublée, inversée ou appliquée au mauvais moment dans le logiciel. Ce chapitre relie la définition des données, les paramètres et les contrôles numériques. Les valeurs sont **pédagogiques**, sans objectif clinique.
<!-- /step -->

<!-- step:title="Intuition" -->
Un dictionnaire minimal précise : nom unique, unité, catégories autorisées, référence, moment de mesure et traitement des valeurs manquantes. Chaque effet précise ensuite sa cible, sa fonction et ses coefficients.

Choisir des références fixes rend les résultats comparables entre cohortes. Un centrage ou une standardisation appris dans les données doit être estimé uniquement sur l'entraînement puis conservé pour les nouveaux patients.
<!-- /step -->

<!-- step:title="La formule décortiquée" -->
Nous combinons poids et génotype :
$$ CL_i=4(WT_i/70)^{0.75}\,1.3^{GENO_i}\exp(\eta_{CL,i}),\qquad
V_i=30(WT_i/70)\exp(\eta_{V,i}). $$
$GENO$ est strictement 0 ou 1. La matrice
$$ \Omega=\begin{pmatrix}0.09&0.03\\0.03&0.04\end{pmatrix} $$
correspond aux écarts-types 0,3 et 0,2 et à une corrélation de 0,5. Une covariance n'est pas une corrélation. Les deux valeurs propres doivent être non négatives ; ici le déterminant est positif.

Ces relations multiplient les paramètres avant la simulation PK. Une courbe typique est obtenue à ETA et EPS nuls ; une simulation de population ajoute les tirages définis par OMEGA et SIGMA.
<!-- /step -->

<!-- step:title="Exemple concret" -->
Le modèle mrgsolve complet ci-dessous utilise les heures, mg et L. Dans un projet R, son fichier est nommé `covariates_example.cpp` :

```cpp
$PARAM TVCL=4, TVV=30, BWT=0.75, RGENO=1.3
$PARAM @annotated @covariate
WT : 70 : Weight (kg)
GENO : 0 : Genotype (0 or 1)
$CMT @annotated
CENT : Central [ADM, OBS]
$MAIN
double CL = TVCL*pow(WT/70.0,BWT)*pow(RGENO,GENO)*exp(ETA(1));
double V = TVV*(WT/70.0)*exp(ETA(2));
$OMEGA @block
0.09
0.03 0.04
$SIGMA 0.01 0
$ODE
dxdt_CENT = -(CL/V)*CENT;
$TABLE
double IPRED = CENT/V;
double DV = IPRED*(1+EPS(1))+EPS(2);
$CAPTURE CL V IPRED DV
```

Le contrôle suivant vérifie notamment que le poids agit sur CL **et** V :

```r
library(mrgsolve)
mod <- mread("covariates_example", project = ".")
typical <- mod |> zero_re() |> param(WT = 35, GENO = 0)
out <- typical |> ev(amt = 100, cmt = 1) |>
  mrgsim(end = 24, delta = 0.1)
stopifnot(abs(out$CL[1] - 4*(35/70)^0.75) < 1e-8)
stopifnot(abs(out$V[1] - 15) < 1e-8)
plot(out)
```

Une simulation de population doit en plus fournir les covariables par ID et tirer les ETA conjointement selon OMEGA, pas séparément si la covariance est non nulle. Pour un patient suivi dans le temps, les valeurs aux événements doivent être cohérentes avec l'historique.
<!-- /step -->

<!-- step:title="Implémentation Monolix" -->
Deux options exclusives pour le même effet :
1. **Modèle individuel** : covariable continue transformée `log(WT/70)`, effet bêta sur Cl et V ; génotype catégoriel avec référence 0. Le ratio 1,3 correspond à un bêta de `log(1.3)` sur Cl.
2. **Modèle structurel** : lire les covariables comme régresseurs et écrire explicitement les relations :

```mlxtran
[LONGITUDINAL]
input = {Cl0, V0, WT, GENO, betaWT, ratioGENO}
WT = {use=regressor}
GENO = {use=regressor}
PK:
Cl = Cl0*(WT/70)^betaWT*ratioGENO^GENO
V = V0*(WT/70)
Cc = pkmodel(V, Cl)
OUTPUT:
output = {Cc}
```

Pour reproduire les valeurs ci-dessus, définir Cl0 = 4, V0 = 30, betaWT = 0,75 et ratioGENO = 1,3 dans le projet. Configurer l'IIV log-normale sur **Cl0 et V0**, avec écarts-types 0,3 / 0,2 et corrélation 0,5 ; les coefficients de covariables peuvent être fixés. Ne pas réajouter les mêmes effets dans le modèle individuel.

Le fichier `[LONGITUDINAL]` seul ne transporte pas toute la configuration statistique du projet Monolix. Le bloc `[INDIVIDUAL]` documenté pour Simulx décrit des distributions, mais ne remplace pas la configuration de l'interface Monolix.
<!-- /step -->

<!-- step:title="Temps, données imparfaites et autres méthodes" -->
Une fonction rénale variant au cours du suivi doit être reliée aux dates de mesure. Une valeur reportée jusqu'à la mesure suivante (LOCF) et une interpolation linéaire sont des hypothèses différentes. En prédiction prospective, utiliser une mesure future pour interpoler le passé peut créer une fuite d'information. Dans Pmetrics, `interp("none")` décrit un report constant, alors que `interp()` permet une interpolation linéaire ; il faut encore définir l'effet dans les équations et disposer d'une distribution de population.

Autres relations utiles :
- **Splines/GAM** : $\log(CL)=\beta_0+\sum_j\beta_j B_j(x)+\eta$ ; conserver les nœuds et pénaliser la complexité.
- **Interactions** : l'effet d'une fonction d'organe peut dépendre d'un génotype ; prévoir suffisamment de sujets dans chaque combinaison.
- **Sélection régularisée ou effets préspécifiés** : alternatives aux procédures pas à pas. La recherche doit être répétée dans chaque pli d'entraînement.
- **Mesures bruitées ou manquantes** : imputation adaptée ou modèle explicite d'erreur de covariable. Ne pas remplacer silencieusement une valeur manquante par une valeur physiologique normale.

Les relations peuvent aussi agir sur des paramètres PD, tels que Emax, EC50 ou un taux de croissance, avec des contraintes adaptées.
<!-- /step -->

<!-- step:title="Piège fréquent" -->
Le fichier structurel, les coefficients, OMEGA et le modèle d'erreur constituent un ensemble. Un export qui ne contient que la structure ne reconstitue pas le modèle statistique complet.

Tester la valeur de référence, les limites, chaque catégorie et les unités. Comparer numériquement les prédictions entre logiciels avec les mêmes doses, covariables et ETA. Pour une sélection ou un modèle appris, vérifier calibration, biais, précision et utilité sur des patients non utilisés pendant le développement.
<!-- /step -->

<!-- step:title="À retenir" -->
- Une définition de covariable, plusieurs effets possibles.
- Même transformation et même référence dans tous les logiciels.
- Ne pas compter deux fois l'effet fixe ou l'IIV.
- Valider l'implémentation numérique et la pertinence prédictive séparément.
<!-- /step -->
