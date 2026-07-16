---
id: "monolix-modele-structural"
slug: "monolix-modele-structural"
title: "Monolix — le modèle structural en mlxtran"
description: "Le bloc [LONGITUDINAL] : bibliothèque pkmodel() ou EDO écrites à la main, conditions initiales, t0 et routage de la dose."
summary: "Écrire le modèle structural en mlxtran : input, EQUATION:, pkmodel() contre ddt_, et DEFINITION: pour l'observation."
track: "monolix"
order: 2
duration: "10 min"
level: "intermediate"
tags: ["monolix", "mlxtran", "structural-model", "ode"]
prerequisites: ["tools-monolix"]
glossary: []
slides: []
sources: ["monolix", "lavielle", "savic-transit"]
reviewed_on: "2026-07-14"
quiz:
  - prompt: "Dans un fichier mlxtran, le bloc [LONGITUDINAL] contient..."
    options:
      - "le modèle structural : les équations qui, pour des paramètres donnés, prédisent la courbe"
      - "le modèle statistique : les lois des paramètres individuels et leur variabilité"
      - "les données longitudinales : les temps, les doses et les concentrations observées"
    correct: 0
  - prompt: "Avec un système d'EDO écrit à la main dans EQUATION:, la dose du jeu de données..."
    options:
      - "doit être routée explicitement vers un compartiment, par exemple par depot(target=Ad)"
      - "est routée automatiquement vers le premier compartiment déclaré dans le bloc EQUATION:"
      - "est routée automatiquement, comme avec pkmodel(), sans macro d'administration à écrire"
    correct: 0
  - prompt: "Dans pkmodel(), le choix du modèle de PK se fait..."
    options:
      - "par les noms des arguments passés : ka, V, Cl décrivent un 1 compartiment oral"
      - "par un numéro de modèle donné en premier argument, comme les ADVAN de NONMEM"
      - "par une option du bloc DEFINITION: qui déclare le nombre de compartiments"
    correct: 0
---

<!-- step:title="Pourquoi ce chapitre" -->
Le **modèle structural**, c'est la machine qui transforme une dose et un temps en une concentration prédite. Tout le reste — variabilité, covariables, erreur résiduelle — vient se greffer dessus. Si cette machine est fausse, aucun SAEM ne la rattrapera : il ajustera au mieux les paramètres d'un modèle qui ne peut pas décrire les données.

Dans Monolix, elle s'écrit en **mlxtran**, dans le bloc `[LONGITUDINAL]`. Deux routes s'offrent à vous : appeler la **bibliothèque** avec `pkmodel()`, ou écrire vous-même le **système d'équations différentielles** avec `ddt_`. Ce chapitre montre les deux sur le même modèle — un 1 compartiment oral — et explique quand basculer de l'une à l'autre.
<!-- /step -->

<!-- step:title="Intuition" viz="21_PopPKPlayground" -->
mlxtran vous force à répondre **séparément** à deux questions que la modélisation de population mélange toujours :

1. **Pour un individu dont les paramètres sont donnés, quelle courbe suit la concentration ?** C'est le modèle **structural** — le bloc `[LONGITUDINAL]`.
2. **Comment ces paramètres varient-ils d'un individu à l'autre ?** C'est le modèle **statistique** — le bloc `[INDIVIDUAL]`.

Cette séparation est le trait de conception du langage, pas une coquetterie de présentation. Elle a une conséquence très concrète : le fichier de modèle structural que vous écrivez à la main ne contient **que** `[LONGITUDINAL]`. Le bloc `[INDIVIDUAL]` est écrit par l'interface à partir de vos choix dans l'onglet du modèle statistique. Passer une loi de logNormale à normale, ajouter une IIV, brancher une covariable : rien de tout cela ne touche à vos équations.

:::key
Comparez avec NONMEM, où `$PK` héberge dans le même bloc la valeur typique (`TVCL = THETA(1)`) **et** l'effet aléatoire (`CL = TVCL*EXP(ETA(1))`). Chez Monolix, la frontière entre structure et statistique n'est pas une discipline de rédaction : c'est un bloc.
:::
<!-- /step -->

<!-- step:title="La formule décortiquée" -->
Le 1 compartiment oral, ce sont deux compartiments d'**amounts** — le dépôt $A_d$ et le central $A_c$ — et une concentration qui n'est qu'une division :

$$ \frac{dA_d}{dt} = -k_a A_d, \qquad \frac{dA_c}{dt} = k_a A_d - \frac{Cl}{V} A_c, \qquad C_c = \frac{A_c}{V} $$

**Version bibliothèque.** On décrit le modèle par son nom, pas par ses équations :

```
[LONGITUDINAL]
input = {ka, V, Cl}       ; parametres RECUS, pas estimes ici

EQUATION:
Cc = pkmodel(ka, V, Cl)   ; 1 cpt, absorption d'ordre 1 ; rend une CONCENTRATION

DEFINITION:
y1 = {distribution=normal, prediction=Cc, errorModel=combined1(a, b)}

OUTPUT:
output = {y1}
```

**Version EDO à la main.** Le même modèle, câblé à la main :

```
[LONGITUDINAL]
input = {ka, V, Cl}

PK:
depot(target = Ad)        ; OU atterrit la dose du jeu de donnees

EQUATION:
t0   = 0                  ; instant ou s'appliquent les conditions initiales
Ad_0 = 0                  ; conditions initiales : <nom>_0 (0 par defaut)
Ac_0 = 0

ddt_Ad = -ka * Ad         ; declarer ddt_Ad SUFFIT a creer le compartiment Ad
ddt_Ac =  ka * Ad - (Cl/V) * Ac

Cc = Ac / V               ; ici la division est a VOTRE charge

DEFINITION:
y1 = {distribution=normal, prediction=Cc, errorModel=combined1(a, b)}

OUTPUT:
output = {y1}
```

Ligne à ligne :

- `input = {ka, V, Cl}` : les paramètres que le bloc **reçoit**. Ils ne sont pas estimés ici — c'est `[INDIVIDUAL]` qui les fournira. C'est la prise de courant entre structure et statistique.
- `EQUATION:` accueille les EDO **et** les équations algébriques ; l'ordre d'écriture des `ddt_` n'a pas d'importance, le solveur résout le système.
- `t0` fixe l'instant où s'appliquent les conditions initiales. Sans `t0` explicite, l'intégration démarre au premier événement du sujet. Cela devient critique dès qu'un modèle a une **ligne de base** non nulle (turnover, PD) : il faut alors démarrer le système à son état d'équilibre, pas à zéro.
- `DEFINITION:` est le **modèle d'observation** : il relie une prédiction (`Cc`) à une observation (`y1`) par une loi et un modèle d'erreur. C'est déjà de la statistique — mais de la statistique *résiduelle*, qui reste dans `[LONGITUDINAL]` parce qu'elle porte sur l'observation, pas sur l'individu.

:::howto
**Le nom des arguments EST le sélecteur de modèle.** `pkmodel(V, Cl)` donne un 1 compartiment IV ; ajoutez `ka` et vous obtenez l'absorption d'ordre 1 ; ajoutez `k12, k21` et vous passez à deux compartiments ; ajoutez `Tlag`, `Tk0` ou `F` et vous décrivez latence, ordre zéro, biodisponibilité. Là où NONMEM vous fait choisir un **numéro** d'ADVAN, mlxtran vous fait nommer les **paramètres** que vous voulez estimer — le modèle s'en déduit.
:::

Pourquoi écrire les EDO soi-même, alors ? Parce que le jour où la structure sort du catalogue, la bibliothèque s'arrête. Une chaîne de **transit** (Savic 2007), par exemple, s'obtient en allongeant le système :

```
PK:
depot(target = Atr1)

EQUATION:
ddt_Atr1 = -ktr*Atr1
ddt_Atr2 =  ktr*Atr1 - ktr*Atr2
ddt_Ac   =  ktr*Atr2 - (Cl/V)*Ac
```

avec un temps de transit moyen $MTT = (n+1)/k_{tr}$, ici $n = 2$ compartiments de transit. Même logique pour un turnover enzymatique, une clairance variable dans le temps ou une cible saturable : dès qu'un terme dépend de l'état du système, on passe aux `ddt_`.

:::note
Réf. : documentation Monolix / MonolixSuite (Lixoft — Simulations Plus) pour la syntaxe des blocs ; Lavielle M., *Mixed Effects Models for the Population Approach* (Chapman & Hall/CRC) pour la décomposition structural/statistique ; Savic *et al.*, *J Pharmacokinet Pharmacodyn* 2007 pour les compartiments de transit.
:::
<!-- /step -->

<!-- step:title="Exemple concret" viz="21_PopPKPlayground" -->
Prenons un individu : **dose orale 100 mg**, $k_a = 1{,}2$ h⁻¹, $V = 32$ L, $Cl = 4{,}8$ L/h, $F = 1$.

La constante d'élimination vaut $k_e = Cl/V = 4{,}8/32 = 0{,}15$ h⁻¹, soit un rapport $k_a/k_e = 8$. Le pic tombe à

$$ t_{max} = \frac{\ln(k_a/k_e)}{k_a - k_e} = \frac{\ln 8}{1{,}05} \approx 1{,}98 \text{ h} $$

et, comme $C_{max} = \frac{F \cdot D}{V}e^{-k_e t_{max}}$ pour ce modèle, on attend $C_{max} \approx 3{,}125 \times e^{-0{,}297} \approx 2{,}32$ mg/L, pour une exposition $AUC = F \cdot D / Cl \approx 20{,}8$ mg·h/L.

Ces trois nombres sont votre **test de recette**. Les deux écritures ci-dessus décrivent le même modèle : elles doivent rendre la même courbe, au chiffre près. D'où le réflexe qui évite le plus de dégâts lors d'un passage à la main :

:::recall
Ne partez jamais d'une page blanche. Écrivez d'abord la version `pkmodel()`, faites-la tourner, notez la courbe. Réécrivez-la ensuite en `ddt_` et vérifiez que vous **retrouvez exactement** la même prédiction. C'est seulement une fois cette égalité obtenue que vous ajoutez votre complexité (transit, saturation, turnover). Sinon, vous ne saurez jamais si un écart vient de votre nouveauté ou d'une faute de câblage.
:::
<!-- /step -->

<!-- step:title="Piège fréquent" -->
Le piège n'est pas d'oublier `depot()` — ça, Monolix vous le signale : la dose n'a aucune porte d'entrée, le système reste à ses conditions initiales et la prédiction est plate à zéro. C'est bruyant, donc bénin.

:::pitfall
Le vrai piège, c'est `depot(target = Ac)` au lieu de `depot(target = Ad)` — une lettre. Le modèle est **valide**, il compile, il tourne, le SAEM converge et les diagnostics s'affichent. Mais la dose atterrit directement dans le central : vous avez estimé un **bolus IV**. Et $A_d$, jamais rempli, reste nul pour toujours, donc $k_a$ n'a plus **aucune** influence sur la vraisemblance. Sa valeur ne bouge quasiment pas de son initialisation, avec une RSE énorme, et la phase d'absorption est ratée sur tous les sujets à la fois. Rien n'a planté : c'est précisément ce qui rend l'erreur coûteuse.
:::

La leçon dépasse la faute de frappe : avec `pkmodel()`, le routage de la dose fait partie du modèle que vous appelez ; avec vos propres `ddt_`, il devient **votre** responsabilité, et rien dans la syntaxe ne vous rappellera que vous l'avez mal exercée. Un paramètre à la RSE aberrante n'est pas toujours un problème d'identifiabilité des données : vérifiez d'abord qu'il agit encore sur la prédiction.
<!-- /step -->

<!-- step:title="À retenir" -->
- Le modèle structural vit dans `[LONGITUDINAL]` ; `input` déclare les paramètres reçus, `[INDIVIDUAL]` les fournit. Écrire un modèle à la main, c'est écrire `[LONGITUDINAL]` seul.
- `pkmodel()` : le modèle est sélectionné par le **nom des arguments** (`ka, V, Cl` = 1 cpt oral) et rend directement une concentration, dose routée comprise.
- `ddt_` : vous écrivez les EDO sur des **quantités**, vous fixez `t0` et les `<nom>_0`, vous divisez par $V$ vous-même, et vous routez la dose avec `depot(target=...)`.
- `DEFINITION:` porte le modèle d'observation (loi + modèle d'erreur), pas la variabilité inter-individuelle.
- Passage bibliothèque → EDO : reproduisez d'abord la courbe de référence à l'identique, puis ajoutez la complexité.
- Une dose routée dans le mauvais compartiment ne fait pas planter le run — elle rend un paramètre muet.
<!-- /step -->
