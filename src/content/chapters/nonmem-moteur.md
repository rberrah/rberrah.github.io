---
id: "nonmem-moteur"
slug: "nonmem-moteur"
title: "Le moteur de NONMEM — FOCE-I décortiqué"
description: "Ce que calcule vraiment la ligne ESTIMATION : linéarisation de Taylor autour des EBE, rôle de INTER, nature de l'OFV et lecture des statuts de terminaison."
summary: "FO, FOCE, FOCE-I, SAEM : où chaque méthode place sa tangente, pourquoi INTER compte avec une erreur proportionnelle, pourquoi les OFV de méthodes différentes ne se comparent pas, et ce que veut dire un rounding error."
track: "nonmem"
order: 5
duration: "10 min"
level: "intermediate"
tags: ["nonmem", "foce", "estimation", "ofv", "vraisemblance"]
prerequisites: ["tools-nonmem"]
glossary: []
slides: []
sources: ["wang-nonmem-methods", "bauer-nonmem-2", "lindstrom-bates", "wilks-1938"]
reviewed_on: "2026-07-14"
quiz:
  - prompt: "Pourquoi l'OFV d'un run METHOD=0 (FO) ne se compare-t-il pas à celui d'un run METHOD=1 INTER (FOCE-I) ?"
    options:
      - "Parce que chaque méthode calcule une approximation différente de la même intégrale : l'écart d'OFV mesure alors le changement d'approximation, pas un gain d'ajustement."
      - "Parce que FO estime moins de paramètres que FOCE-I : l'écart d'OFV doit d'abord être corrigé par la différence de degrés de liberté."
      - "Parce que FO travaille sur les concentrations et FOCE-I sur leurs logarithmes : il faut d'abord ramener les deux OFV sur une échelle commune."
    correct: 0
  - prompt: "Dans METHOD=1 INTER, à quoi sert exactement l'option INTER ?"
    options:
      - "À évaluer la variance résiduelle au η̂ individuel plutôt qu'à η = 0, ce qui change le résultat dès que l'erreur est proportionnelle ou combinée."
      - "À autoriser une corrélation entre les η de clairance et de volume, ce qui change le résultat dès que le bloc OMEGA est diagonal."
      - "À interpoler les prédictions entre deux temps d'observation, ce qui change le résultat dès que les prélèvements sont espacés."
    correct: 0
  - prompt: "Un run se termine par MINIMIZATION TERMINATED DUE TO ROUNDING ERRORS. Cela signifie que..."
    options:
      - "l'optimiseur n'atteint plus la précision demandée, souvent par sur-paramétrisation ou mauvais cadrage numérique : les estimations sont à vérifier, pas forcément à jeter."
      - "le modèle structural est réfuté par les données : il faut changer le nombre de compartiments avant d'envisager toute autre correction."
      - "le fichier de données contient des lignes aberrantes ou manquantes : il faut nettoyer les colonnes avant de relancer l'estimation."
    correct: 0
---

<!-- step:title="Pourquoi ce chapitre" -->
Un fichier de contrôle se lit vite : des blocs, des colonnes, un modèle. La ligne qui décide de tout tient pourtant en quelques mots — `$ESTIMATION METHOD=1 INTER`. Elle ne décrit pas le modèle : elle décrit la façon dont NONMEM va **évaluer** ce modèle.

Deux runs sur les mêmes données, avec le même modèle et deux `$ESTIMATION` différents, ne rendent ni les mêmes paramètres ni le même OFV. Tant qu'on ignore ce que cette ligne calcule, on lit les sorties de NONMEM comme un oracle : on subit le nombre au lieu de l'interpréter. Ce chapitre ouvre la boîte.
<!-- /step -->

<!-- step:title="Intuition" viz="66_FOCELinearization" -->
Le problème que NONMEM doit résoudre est une **intégrale**. Pour chaque sujet, la vraisemblance des observations exige de moyenner sur **tous les η possibles** — toutes les versions de ce patient compatibles avec la population. Si le modèle était linéaire en η, cette intégrale aurait une solution analytique et le sujet serait clos.

Un modèle PK ne l'est jamais. Une concentration dépend d'un terme en exponentielle, et la clairance qui s'y trouve dépend elle-même de $\exp(\eta)$. L'intégrale n'a pas de forme fermée : il faut l'approcher.

Alors on triche — et toute la question est **où** l'on triche. FO remplace le modèle par sa **tangente en η = 0** : la tangente du patient typique, appliquée à tout le monde. FOCE prend la tangente **en η̂ᵢ**, l'estimation bayésienne empirique (EBE) du sujet — là où ce patient se trouve réellement. Une approximation locale n'est bonne qu'au voisinage de son point d'appui ; FOCE déplace ce point d'appui sur chaque patient, un par un.

Le prix est immédiat : il faut retrouver η̂ᵢ pour chaque sujet, et recommencer à **chaque itération de population**, puisque θ et Ω bougent entre-temps. FOCE est une boucle d'optimisation à l'intérieur d'une boucle d'optimisation. FO n'a pas de boucle interne : c'est pourquoi il est rapide, et c'est exactement pourquoi il dérape dès que la variabilité interindividuelle est grande.
<!-- /step -->

<!-- step:title="La formule décortiquée" viz="66_FOCELinearization" -->
Le modèle individuel, avec une erreur proportionnelle :

$$ y_{ij} = f(t_{ij}, \theta, \eta_i)\,\big(1 + \varepsilon_{ij}\big), \qquad \eta_i \sim \mathcal{N}(0, \Omega), \quad \varepsilon_{ij} \sim \mathcal{N}(0, \sigma^2) $$

La vraisemblance du sujet *i* est l'intégrale à contourner :

$$ L_i = \int p(y_i \mid \eta_i)\; p(\eta_i)\; d\eta_i $$

Toutes les méthodes classiques la traitent par un **développement de Taylor d'ordre 1** autour d'un point d'appui $\eta^{*}$ :

$$ f(\eta_i) \;\approx\; f(\eta^{*}) \;+\; \underbrace{\frac{\partial f}{\partial \eta}\bigg|_{\eta^{*}}}_{\text{la pente}}\,(\eta_i - \eta^{*}) $$

Tout se joue sur le choix de $\eta^{*}$ :

| Ligne `$ESTIMATION` | Point d'appui | Boucle interne |
|---|---|---|
| `METHOD=0` (FO) | $\eta^{*} = 0$, le patient typique | non |
| `METHOD=1` (FOCE) | $\eta^{*} = \hat{\eta}_i$, l'EBE du sujet | oui |
| `METHOD=1 LAPLACIAN` | $\hat{\eta}_i$ + dérivées secondes | oui |
| `METHOD=SAEM`, `METHOD=IMP` | aucune linéarisation (stochastique) | sans objet |

**Ce que fait INTER.** Une fois la moyenne linéarisée, il reste à écrire la **variance conditionnelle** des observations. Avec une erreur proportionnelle :

$$ \mathrm{Var}(y_{ij} \mid \eta_i) = f(t_{ij}, \theta, \eta_i)^2\,\sigma^2 $$

Cette variance **dépend de η**. Sans `INTER`, NONMEM l'évalue tout de même en η = 0, avec la prédiction typique — alors que la moyenne, elle, a été linéarisée en η̂ᵢ. Avec `INTER`, la variance est évaluée en η̂ᵢ elle aussi. L'« interaction » du nom, c'est celle entre η et ε : **la taille de l'erreur résiduelle dépend de l'endroit où se trouve l'individu**.

Concrètement : un patient dont la clairance vaut la moitié de la clairance typique a des concentrations à peu près doubles, donc une erreur proportionnelle deux fois plus grande en valeur absolue. Sans `INTER`, NONMEM lui attribue l'erreur résiduelle du patient moyen ; ses observations sont mal pondérées, et sa contribution à la vraisemblance est fausse. Si l'erreur est **purement additive**, $\mathrm{Var}(y_{ij}\mid\eta_i) = \sigma^2$ ne dépend pas de η et `INTER` ne change **rien** — d'où la règle : `INTER` va avec les erreurs proportionnelle, combinée ou exponentielle, c'est-à-dire presque toute la PK.

**Ce qu'est l'OFV.** La fonction objective minimisée par NONMEM est

$$ OFV = -2 \sum_{i=1}^{N} \log \hat{L}_i $$

où $\hat{L}_i$ est la vraisemblance **approchée**, de la façon que la méthode a choisie. Deux remarques décident de toute la suite :

- NONMEM **omet une constante additive** (le terme en $\log 2\pi$ des lois normales). Son OFV est donc $-2\log L$ **à une constante près** : une valeur d'OFV isolée ne signifie rien, et ne se compare pas au « −2LL » affiché par un autre logiciel.
- Le chapeau de $\hat{L}_i$ n'est pas décoratif. FO, FOCE, FOCE-I et Laplace calculent **quatre fonctions différentes**. Comparer leurs OFV, c'est comparer deux approximations, pas deux ajustements.

**Le test du rapport de vraisemblance.** Pour deux modèles **emboîtés**, sur les **mêmes données**, avec la **même méthode** :

$$ \Delta OFV = OFV_{\text{base}} - OFV_{\text{complet}} \;\sim\; \chi^2_{\Delta df} \quad (\text{sous } H_0) $$

Seuils à 5 % : **3,84** pour 1 paramètre, 5,99 pour 2, 7,81 pour 3. La constante omise disparaît dans la soustraction — voilà pourquoi le ΔOFV est légitime là où l'OFV absolu ne l'est pas. Mais l'exigence « même méthode » n'est pas cosmétique : il faut aussi que le **biais d'approximation s'annule** dans la différence, et il ne s'annule que si les deux runs se trompent de la même manière.

```
; --- FOCE avec interaction : le cheval de bataille
$ESTIMATION METHOD=1 INTER MAXEVAL=9999 SIGDIGITS=3 PRINT=5 NOABORT
$COVARIANCE PRINT=E

; --- FO : rapide, historique, biaise des que l'IIV est grande
$ESTIMATION METHOD=0 MAXEVAL=9999 PRINT=5

; --- SAEM : pas de linearisation, mais l'OFV demande une etape a part
$ESTIMATION METHOD=SAEM INTERACTION NBURN=2000 NITER=1000 SEED=20260714
$ESTIMATION METHOD=IMP INTERACTION EONLY=1 NITER=10 ISAMPLE=3000 PRINT=1
```

:::note
SAEM **maximise sans jamais calculer la vraisemblance** : il n'y a pas d'OFV de maximum de vraisemblance à récupérer à la fin d'un run SAEM. D'où la seconde ligne `$ESTIMATION` : une étape d'évaluation par échantillonnage d'importance (`METHOD=IMP` avec `EONLY=1`) qui, elle, estime la vraisemblance. Oublier cette ligne, c'est se retrouver sans OFV exploitable.
:::
<!-- /step -->

<!-- step:title="Exemple concret" viz="15_OFVGame" -->
Étude à 60 sujets, modèle à 1 compartiment, erreur proportionnelle, IIV sur CL et V.

| Run | Modèle | Méthode | OFV | ΔOFV vs référence |
|---|---|---|---|---|
| 1 | base | FOCE-I | 1524,8 | référence |
| 2 | run 1 + exposant du poids sur CL (1 θ) | FOCE-I | 1512,1 | **12,7** > 3,84 → on garde |
| 3 | run 2 + âge sur V (1 θ) | FOCE-I | 1510,4 | **1,7** < 3,84 → on jette |

Jusqu'ici tout est régulier : modèles emboîtés, mêmes données, même `$ESTIMATION`, seuil à 3,84 pour 1 degré de liberté.

Vient maintenant la démonstration qui compte. On reprend le **run 1, strictement inchangé** — mêmes données, même modèle, mêmes valeurs initiales — et on remplace la seule ligne `$ESTIMATION` par `METHOD=0`. Résultat : **OFV = 1489,3**.

L'OFV a baissé de **35,5 points**. Aucun paramètre n'a été ajouté, aucune covariable n'a été testée, rien n'a été « amélioré » : seule l'**approximation** a changé. Un ΔOFV de 35,5 face à un seuil de 3,84 paraît écrasant — et il ne veut rigoureusement rien dire. C'est la meilleure preuve que l'OFV n'est pas une note absolue : c'est la valeur d'une fonction **qui dépend de la méthode**.

Passons au run 4 : modèle à 2 compartiments, IIV sur CL, V1, Q et V2, bloc OMEGA plein.

```
 MINIMIZATION TERMINATED
 DUE TO ROUNDING ERRORS (ERROR=134)
 NO. OF FUNCTION EVALUATIONS USED:  1287
 NO. OF SIG. DIGITS UNREPORTABLE
```

Le message ne dit pas « ton modèle est faux ». Il dit : « je n'arrive plus à gagner les 3 chiffres significatifs demandés ». Près de l'optimum, NONMEM calcule ses gradients par **différences finies** ; si la surface d'OFV est plate ou bruitée dans une direction, la variation utile passe **sous le bruit d'arrondi** et le pas suivant devient du hasard.

Ici, le diagnostic est lisible dans les sorties : l'ω de Q est descendue à $4 \cdot 10^{-7}$ et la corrélation estimée entre η_V1 et η_V2 vaut 0,98. Le modèle demande aux données de distinguer deux volumes qu'elles ne distinguent pas. Retirer l'η sur Q suffit à retrouver `MINIMIZATION SUCCESSFUL` et un `$COVARIANCE` qui aboutit.

:::howto
**Avant d'accuser le modèle**, écartez le numérique : des θ d'échelles très différentes (0,13 à côté de 45 000 — recadrez pour que tous les θ soient d'ordre 1), des valeurs initiales trop lointaines, un `SIGDIGITS` trop exigeant. Ensuite seulement, suspectez la sur-paramétrisation : une ω qui s'effondre vers 0, une corrélation qui monte à 0,99, un `$COVARIANCE` qui échoue.
:::
<!-- /step -->

<!-- step:title="Piège fréquent" -->
Les échecs de NONMEM sont bruyants ; ses **erreurs**, elles, sont silencieuses.

:::pitfall
`METHOD=1` **sans** `INTER` sur un modèle à erreur proportionnelle. Le run tourne, converge, affiche `MINIMIZATION SUCCESSFUL` et sort des paramètres d'allure parfaitement normale. **Rien ne vous prévient.** Pourtant la variance résiduelle a été évaluée au patient typique pour tout le monde : les sujets fortement exposés se voient attribuer une variance trop petite, donc un **poids trop grand** dans la vraisemblance ; les faiblement exposés, l'inverse. L'ω estimée absorbe cette mauvaise pondération. Et le biais grandit **avec l'IIV** — c'est-à-dire précisément quand on fait de la PK de population.
:::

Le piège symétrique est tout aussi répandu : lire `MINIMIZATION SUCCESSFUL` comme un **certificat de qualité**. Cette ligne dit qu'un algorithme d'optimisation s'est arrêté satisfait de sa propre précision numérique. Elle ne dit rien sur le fait que le modèle décrive la biologie, que les paramètres soient identifiables, ou que la VPC tienne. À l'inverse, un `ROUNDING ERRORS` ne condamne pas un modèle : il signale qu'on demande aux données plus qu'elles ne contiennent, ou que le problème est mal cadré numériquement.

:::key
Trois règles opérationnelles. **(1)** `INTER` dès que le modèle d'erreur dépend de la prédiction — proportionnel, combiné, exponentiel. **(2)** Un ΔOFV ne se lit qu'entre modèles emboîtés, sur les mêmes données, avec le même `$ESTIMATION`. **(3)** Un statut de terminaison est une information sur l'optimiseur, jamais un diagnostic de modèle.
:::
<!-- /step -->

<!-- step:title="À retenir" -->
- La vraisemblance de population est une **intégrale sans forme fermée** ; FO, FOCE et Laplace la contournent par une **linéarisation de Taylor**, SAEM et IMP par du stochastique.
- Tout tient au **point d'appui** : FO linéarise en η = 0 (le patient typique, pour tout le monde), FOCE en **η̂ᵢ** (l'EBE de chaque sujet) — au prix d'une boucle interne à chaque itération.
- **`INTER`** évalue la variance résiduelle en η̂ᵢ au lieu de η = 0 : indispensable avec une erreur proportionnelle ou combinée, sans effet avec une erreur purement additive.
- **OFV = −2 log L̂ à une constante additive près**, et le « chapeau » dépend de la méthode : les OFV de FO, FOCE-I, SAEM ou d'un autre logiciel **ne se comparent pas**.
- **ΔOFV ~ χ²** (seuil **3,84** à 1 ddl, 5 %) : uniquement entre modèles **emboîtés**, mêmes données, **même méthode** — la constante et le biais d'approximation s'annulent alors dans la différence.
- `MINIMIZATION SUCCESSFUL` n'est pas une validation ; `ROUNDING ERRORS` n'est pas une condamnation — c'est un signal de sur-paramétrisation ou de mauvais cadrage numérique.
<!-- /step -->
