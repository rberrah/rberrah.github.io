---
id: "monolix-variabilite"
slug: "monolix-variabilite"
title: "Monolix — le bloc INDIVIDUAL, omega et covariables"
description: "Le modèle statistique en mlxtran : distributions logNormal, normal et logitNormal, corrélations entre effets aléatoires, IOV par niveau de variabilité, covariables et lecture du shrinkage."
summary: "Écrire et lire la variabilité dans Monolix : typical et sd, choix de la loi, correlation r(), varlevel pour l'IOV, bloc COVARIATE et transformations, omega et shrinkage dans les sorties."
track: "monolix"
order: 3
duration: "13 min"
level: "intermediate"
tags: ["monolix", "mlxtran", "variability", "omega", "iov", "covariates", "shrinkage"]
prerequisites: ["tools-monolix"]
glossary: []
slides: []
sources: ["monolix", "lavielle", "karlsson-sheiner-iov", "savic-karlsson-shrinkage"]
reviewed_on: "2026-07-14"
quiz:
  - prompt: "Vous traduisez en Monolix un modèle NONMEM dont l'IIV sur la clairance est déclarée par `$OMEGA 0.09`. Quelle valeur donner à `omega_cl` ?"
    options:
      - "0,3 : Monolix paramètre la variabilité par un écart-type, là où l'`$OMEGA` de NONMEM déclare une variance."
      - "0,09 : les deux logiciels déclarent la variabilité sur la même échelle, seul le nom du paramètre change entre eux."
      - "0,0081 : Monolix déclare lui aussi une variance, il faut donc élever au carré l'`$OMEGA` fourni par NONMEM."
    correct: 0
  - prompt: "Dans le bloc [INDIVIDUAL], que déclare la ligne `correlation = {level=id, r(cl, v)=corr_cl_v}` ?"
    options:
      - "Le coefficient de corrélation entre les effets aléatoires de cl et de v, estimé directement et borné entre −1 et 1."
      - "La covariance entre les effets aléatoires de cl et de v, dont il faut ensuite déduire la corrélation par une division."
      - "La corrélation entre les paramètres cl et v eux-mêmes, mesurée sur leur échelle naturelle et non sur celle des etas."
    correct: 0
  - prompt: "Dans `cl = {distribution=logNormal, typical=cl_pop, sd={omega_cl, gamma_cl}, varlevel={id, id*occ}}`, que représente `gamma_cl` ?"
    options:
      - "L'écart-type de l'effet aléatoire tiré à chaque occasion, commun à toutes les occasions par construction du niveau."
      - "L'écart-type de l'effet aléatoire propre au patient, que le second niveau vient recopier à l'identique sur chaque occasion."
      - "L'écart-type de l'erreur résiduelle mesurée au sein de chaque occasion, distincte de celle déclarée dans [LONGITUDINAL]."
    correct: 0
  - prompt: "Dans le bloc [COVARIATE], vous écrivez `tWT = log(WT)` au lieu de `log(WT/70)`. Quelle est la conséquence ?"
    options:
      - "L'ajustement reste le même, mais `v_pop` devient le volume d'un patient de 1 kg : mal conditionné, il n'est plus reportable."
      - "L'ajustement se dégrade nettement, car la covariable n'est plus sur une échelle compatible avec une loi logNormale."
      - "L'ajustement reste le même et `v_pop` garde son sens habituel : seule l'unité du coefficient `beta_v_tWT` change d'échelle."
    correct: 0
---

<!-- step:title="Pourquoi ce chapitre" -->
Le chapitre précédent a montré comment `[LONGITUDINAL]` répond à la question « quelle courbe suit un individu dont les paramètres sont donnés ». Reste l'autre moitié du travail : **d'où sortent ces paramètres**. Dans Monolix, toute la réponse tient dans un bloc, `[INDIVIDUAL]`, et dans son auxiliaire, `[COVARIATE]`.

Ce bloc est court — souvent cinq lignes. Chacune est pourtant une décision de modélisation entière : quelle loi, quelle dispersion, quelles corrélations, combien de niveaux de variabilité, quelles covariables. Et c'est ce bloc, pas le modèle structural, qui décide de ce que vous pourrez écrire dans le rapport. Ce chapitre lit ces lignes une à une, puis apprend à relire en face ce que Monolix renvoie : les `omega`, les `gamma`, les corrélations et le shrinkage.
<!-- /step -->

<!-- step:title="Intuition" viz="12_VariabilitySandbox" -->
Une ligne de `[INDIVIDUAL]` est une phrase complète. Lisez celle-ci à voix haute :

```
cl = {distribution=logNormal, typical=cl_pop, sd=omega_cl}
```

« La clairance est log-normale, centrée sur `cl_pop`, avec une dispersion `omega_cl`. » Trois informations : une **forme**, un **centre**, une **largeur**. Il n'en faut pas davantage pour dire d'où sort la clairance d'un patient.

Derrière chaque loi, il y a toujours **la même gaussienne**. Monolix n'estime jamais la variabilité sur l'échelle du paramètre : il l'estime sur l'échelle où elle est normale, puis fait ressortir le paramètre à travers une fonction de transformation.

- `normal` : aucune transformation, $\psi_i = \psi_{\text{pop}} + \eta_i$ — le paramètre est libre de changer de signe.
- `logNormal` : on ressort par $\exp$, donc $\psi_i = \psi_{\text{pop}}\,e^{\eta_i}$ — toujours strictement positif.
- `logitNormal` : on ressort par la réciproque du logit, donc $\psi_i$ reste enfermé dans $(0,1)$, quel que soit $\eta_i$.

:::key
Choisir une `distribution`, ce n'est pas choisir « la forme de l'histogramme ». C'est choisir **la contrainte** que le paramètre ne pourra jamais violer : libre, positif, ou borné. La gaussienne, elle, ne bouge jamais : c'est toujours un $\eta_i \sim \mathcal{N}(0, \omega^2)$ qui vit dessous. C'est d'ailleurs pourquoi les corrélations, l'IOV et les covariables se déclarent de la même façon quelle que soit la loi : tous portent sur les $\eta$, pas sur $\psi$.
:::
<!-- /step -->

<!-- step:title="La formule décortiquée" viz="03_PopulationDistrib" -->
### La ligne de base

```
[INDIVIDUAL]
input = {cl_pop, omega_cl, v_pop, omega_v, ka_pop}

DEFINITION:
cl = {distribution=logNormal, typical=cl_pop, sd=omega_cl}
v  = {distribution=logNormal, typical=v_pop,  sd=omega_v}
ka = {distribution=logNormal, typical=ka_pop, no-variability}
```

soit, pour la clairance :

$$ \log(Cl_i) = \log(cl_{\text{pop}}) + \eta_i, \qquad \eta_i \sim \mathcal{N}(0,\ \omega_{cl}^2) $$

Trois choses à savoir sur cette ligne.

**`typical` est la médiane, pas la moyenne.** Pour une log-normale, `cl_pop` est la valeur qui coupe la population en deux, pas son espérance. La moyenne vaut $cl_{\text{pop}}\,e^{\omega^2/2}$ : avec $\omega_{cl} = 0{,}29$, elle est 4 % au-dessus de `cl_pop`. L'écart est négligeable ici, mais il grandit vite avec $\omega$ — et c'est la médiane que vous rapportez.

**`no-variability` est un choix explicite.** La ligne `ka` existe toujours : elle déclare que $k_a$ est estimé, mais identique chez tout le monde. Retirer l'IIV ne se fait pas en effaçant une ligne, mais en remplaçant `sd=` par un mot-clé — ce qui vous force à assumer la décision.

**`sd` est un écart-type.** C'est la différence de paramétrisation la plus coûteuse entre les deux grands logiciels.

:::pitfall
NONMEM déclare une **variance** dans `$OMEGA` ; Monolix déclare un **écart-type** dans `sd`. Traduire un modèle en recopiant les chiffres — `$OMEGA 0.09` devenu `omega_cl = 0.09` — déclare une IIV de 9 % au lieu de 30 %. Rien ne plante : le SAEM part simplement d'une population beaucoup trop homogène, et selon le jeu de données il peut y rester. Le contrôle réflexe est arithmétique : `omega` d'une IIV usuelle de 20 à 50 % vit entre **0,2 et 0,5**, jamais entre 0,04 et 0,25.
:::

Le coefficient de variation exact du paramètre se déduit directement de `omega` :

$$ CV = \sqrt{e^{\omega^2} - 1} $$

| `omega` | $CV$ approché ($\approx \omega$) | $CV$ exact |
|---|---|---|
| 0,20 | 20 % | 20,2 % |
| 0,30 | 30 % | 30,7 % |
| 0,50 | 50 % | 53,3 % |
| 0,80 | 80 % | 94,7 % |

L'approximation $CV \approx \omega$ est excellente en dessous de 0,3 et décroche nettement au-delà de 0,5. C'est l'avantage ergonomique du choix de Monolix : la sortie se lit presque comme un CV, sans passer par une racine carrée.

### Choisir la loi

| `distribution` | Support | Pour quoi |
|---|---|---|
| `logNormal` | $(0, +\infty)$ | Le défaut : $Cl$, $V$, $k_a$, $EC_{50}$ — positifs, asymétriques à droite. |
| `normal` | $\mathbb{R}$ | Un paramètre qui peut légitimement changer de signe : une pente, un effet de traitement, un écart à une ligne de base. |
| `logitNormal` | $(0, 1)$, ou $(min, max)$ | Une fraction bornée : biodisponibilité $F$, effet maximal exprimé en fraction, proportion. |
| `probitNormal` | $(0, 1)$ | Alternative au logit, à queues un peu plus courtes. |
| `powerNormal` | $(0, +\infty)$ | Box-Cox : quand la log-normale est trop asymétrique pour vos données. |

La loi bornée s'écrit avec ses bornes :

```
F    = {distribution=logitNormal, typical=F_pop, sd=omega_F}          ; borne (0,1) par defaut
Emax = {distribution=logitNormal, min=0, max=1, typical=Emax_pop, sd=omega_Emax}
```

et l'effet aléatoire agit alors sur l'échelle du logit :

$$ \text{logit}(F_i) = \text{logit}(F_{\text{pop}}) + \eta_i, \qquad \text{logit}(x) = \log\frac{x}{1-x} $$

L'intérêt est structurel : aucune valeur de $\eta_i$, même absurde, ne peut faire sortir $F_i$ de $(0,1)$. Le SAEM peut donc explorer librement sans jamais produire une biodisponibilité de 1,4.

:::note
Contrepartie à connaître : `omega_F` n'est **plus un CV**. C'est une dispersion sur l'échelle du logit, sans interprétation directe en pourcentage. Et quand `typical` s'approche d'une borne, la loi devient très asymétrique : avec $F_{\text{pop}} = 0{,}9$ et $\omega_F = 1{,}5$, la distribution s'entasse contre 1 et traîne une longue queue vers le bas. Un `omega` de 1,5 sur un logit n'a rien d'aberrant — il faut le lire en simulant la distribution, pas en le comparant à un CV.
:::

### Les corrélations entre effets aléatoires

Par défaut, les $\eta$ sont indépendants. Une ligne suffit à les relier :

```
DEFINITION:
cl = {distribution=logNormal, typical=cl_pop, sd=omega_cl}
v  = {distribution=logNormal, typical=v_pop,  sd=omega_v}

correlation = {level=id, r(cl, v)=corr_cl_v}
```

Monolix estime ici le **coefficient de corrélation** lui-même, pas la covariance. C'est une différence de paramétrisation avec le `$OMEGA BLOCK` de NONMEM, et elle joue en votre faveur : $r$ est borné à $(-1,1)$, se lit sans calcul, et son estimation ne peut pas produire une matrice non définie positive. La covariance, si vous en avez besoin pour comparer avec un modèle NONMEM, se reconstruit :

$$ \omega_{cl,v} = r_{cl,v}\;\omega_{cl}\;\omega_v $$

Attention à ce que porte le mot : `r(cl, v)` est la corrélation entre $\eta_{cl}$ et $\eta_v$ — donc entre les **logarithmes** des paramètres, puisque c'est là que vivent les etas. Ce n'est pas la corrélation entre $Cl_i$ et $V_i$ mesurée sur leur échelle naturelle. Les deux sont proches quand les omega sont petits, et divergent quand ils sont grands.

### Les niveaux de variabilité : IIV et IOV

L'IOV ne s'obtient pas en ajoutant des etas, mais en déclarant un **niveau** de plus :

```
[INDIVIDUAL]
input = {cl_pop, omega_cl, gamma_cl, v_pop, omega_v}

DEFINITION:
cl = {distribution=logNormal, typical=cl_pop,
      sd={omega_cl, gamma_cl}, varlevel={id, id*occ}}
v  = {distribution=logNormal, typical=v_pop, sd=omega_v}
```

$$ \log(Cl_{ij}) = \log(cl_{\text{pop}}) + \eta_i + \kappa_{ij}, \qquad \eta_i \sim \mathcal{N}(0, \omega_{cl}^2), \quad \kappa_{ij} \sim \mathcal{N}(0, \gamma_{cl}^2) $$

Les deux listes se lisent **terme à terme** : `omega_cl` va avec le niveau `id` (un tirage par patient), `gamma_cl` avec le niveau `id*occ` (un tirage par patient **et par** occasion). La convention de nommage de Monolix suit ce découpage : `omega_` pour l'inter-individuel, `gamma_` pour l'inter-occasion.

:::key
Comparez avec NONMEM, où l'IOV se construit à la main : des indicatrices d'occasion, un `ETA` par occasion, et le mot-clé `SAME` pour leur imposer une variance commune. Chez Monolix, `varlevel` déclare un **niveau**, et un niveau n'a qu'une variance par construction — il n'y a rien à contraindre parce qu'il n'y a rien à répéter. La colonne d'occasion est déclarée une fois dans le jeu de données ; le nombre d'occasions ne change pas le nombre de paramètres estimés.
:::

### Les covariables

Les covariables se transforment dans leur propre bloc, puis se branchent dans `[INDIVIDUAL]` :

```
[COVARIATE]
input = {WT, CRCL, SEX}
SEX = {type=categorical, categories={F, M}}

EQUATION:
tWT   = log(WT/70)          ; centree sur un patient de reference
tCRCL = log(CRCL/90)

[INDIVIDUAL]
input = {cl_pop, omega_cl, tCRCL, beta_cl_tCRCL, SEX, beta_cl_SEX,
         v_pop, omega_v, tWT, beta_v_tWT}
SEX = {type=categorical, categories={F, M}}

DEFINITION:
cl = {distribution=logNormal, typical=cl_pop,
      covariate={tCRCL, SEX}, coefficient={beta_cl_tCRCL, {0, beta_cl_SEX}},
      sd=omega_cl}
v  = {distribution=logNormal, typical=v_pop,
      covariate=tWT, coefficient=beta_v_tWT, sd=omega_v}
```

soit :

$$ \log(Cl_i) = \log(cl_{\text{pop}}) + \beta_{CRCL}\log\!\left(\frac{CRCL_i}{90}\right) + \beta_{SEX}\,I_M(i) + \eta_i $$

avec $I_M(i) = 1$ si le patient est un homme et $0$ sinon.

Deux points de lecture. D'abord, le `0` dans `{0, beta_cl_SEX}` **épingle la catégorie de référence** : c'est lui qui décide que `cl_pop` est la clairance typique d'une **femme**. Sans référence fixée, chaque catégorie aurait son coefficient et le modèle serait non identifiable avec `cl_pop`.

Ensuite, remarquez ce que fait vraiment `covariate=tCRCL` sur une log-normale. La covariable entre **additivement sur l'échelle du log**, donc **multiplicativement** sur le paramètre :

$$ Cl_i = cl_{\text{pop}} \left(\frac{CRCL_i}{90}\right)^{\beta_{CRCL}} e^{\eta_i} $$

:::howto
Une covariable continue **log-transformée et centrée**, branchée avec un simple coefficient sur une loi logNormale, **est** le modèle puissance. C'est la même chose que le `TVCL = THETA(1)*(CRCL/90)**THETA(4)` de NONMEM, écrit autrement. L'allométrie sur le poids, exposant fixé à 0,75, s'obtient de la même façon en écrivant `tWT = log(WT/70)` et en fixant `beta_cl_tWT` à 0,75 plutôt qu'en l'estimant.
:::

Et la règle qui vaut dans les deux logiciels : une covariable retire à l'eta ce qu'elle explique. `cl_pop` est la clairance d'un patient **de référence**, `eta_cl` ne porte plus que le reste. Une covariable qui sert se voit donc à la **baisse d'`omega_cl`**, pas seulement à la baisse du $-2LL$.

:::note
Réf. : documentation Monolix / MonolixSuite (Lixoft — Simulations Plus) pour la syntaxe des blocs `[INDIVIDUAL]` et `[COVARIATE]` ; Lavielle M., *Mixed Effects Models for the Population Approach* (Chapman & Hall/CRC) pour la paramétrisation du modèle statistique ; Karlsson & Sheiner, *J Pharmacokinet Biopharm* 1993 pour la variabilité inter-occasion ; Savic & Karlsson, *AAPS J* 2009 pour le shrinkage.
:::
<!-- /step -->

<!-- step:title="Exemple concret" viz="12_VariabilitySandbox" -->
Une analyse sur **52 patients**, administration orale, un compartiment, deux visites de prélèvement par patient (jour 1 et jour 15) déclarées en colonne d'occasion. IIV sur $Cl$, $V$ et $k_a$, erreur combinée. On construit le modèle statistique par étapes.

| Run | Modèle de variabilité | Paramètres | $-2LL$ | $\Delta$ |
|---|---|---|---|---|
| 1 | IIV seule, etas indépendants | 8 | 1876,4 | — |
| 2 | + `correlation r(cl, v)` | 9 | 1863,1 | −13,3 |
| 3 | + IOV sur `cl` (`gamma_cl`) | 10 | 1841,7 | −21,4 |
| 4 | + CRCL sur `cl` | 11 | 1820,9 | −20,8 |

**Run 1 → 2.** $r$ est estimé à 0,52. Le seuil du rapport de vraisemblance à 1 degré de liberté est 3,84 au risque de 5 % : la corrélation est largement retenue. Elle est aussi attendue — un patient physiologiquement « grand » a souvent à la fois une clairance et un volume élevés — et l'ignorer ferait simuler des patients à forte clairance et petit volume qui n'existent pas.

**Run 2 → 3.** `gamma_cl` sort à 0,18, soit un $CV_{\text{IOV}}$ de 18,1 % ; et `omega_cl` **descend** de 0,42 à 0,36. C'est le résultat le plus instructif du tableau : une part de ce qu'on attribuait à « ce patient élimine fort » était en réalité « cette visite-là était différente ». Sans niveau d'occasion, l'IIV absorbe l'IOV et se retrouve surestimée.

**Run 3 → 4.** L'exposant sur la clairance de la créatinine est estimé à 0,71, et `omega_cl` passe de 0,36 à 0,29 :

$$ CV_{\text{avant}} = \sqrt{e^{0{,}36^2}-1} = 37{,}2\ \%, \qquad CV_{\text{après}} = \sqrt{e^{0{,}29^2}-1} = 29{,}6\ \% $$

La fonction rénale explique donc environ **8 points de CV** sur la clairance. C'est cette phrase-là, et non le $\Delta$ de 20,8, qui a un sens clinique et qui ira dans le rapport.

:::pitfall
Deux réserves sur ces $\Delta$. D'abord, le $-2LL$ de Monolix est calculé par **échantillonnage d'importance** : il porte une erreur de Monte-Carlo, et deux runs du même modèle ne rendent pas exactement le même chiffre. Un écart de 2 ou 3 points n'est pas interprétable ; les écarts ci-dessus, entre 13 et 21, sont très au-dessus du bruit. Ensuite, tester `gamma_cl = 0` place l'hypothèse nulle **sur le bord** de l'espace des paramètres (un écart-type ne peut pas être négatif) : le seuil de 3,84 y est conservateur, donc prudent. Tester `corr_cl_v = 0` ne pose pas ce problème, puisque 0 est à l'intérieur de $(-1,1)$.
:::

**Lire la sortie.** Monolix renvoie les paramètres de population avec leur erreur standard et leur RSE :

| Paramètre | Estimation | RSE (%) |
|---|---|---|
| `cl_pop` | 4,62 L/h | 4 |
| `v_pop` | 31,8 L | 4 |
| `ka_pop` | 1,14 h⁻¹ | 10 |
| `beta_cl_tCRCL` | 0,71 | 18 |
| `omega_cl` | 0,29 | 11 |
| `omega_v` | 0,38 | 13 |
| `omega_ka` | 0,52 | 19 |
| `gamma_cl` | 0,18 | 17 |
| `corr_cl_v` | 0,52 | 21 |

Tout se lit sans conversion : 0,29 d'écart-type, soit ~30 % de CV ; 0,52 de corrélation. Les paramètres de variabilité ont des RSE structurellement plus élevées que les effets fixes — c'est normal, il faut beaucoup de sujets pour estimer une dispersion. Au-delà de **50 % de RSE sur un `omega`**, en revanche, l'IIV n'est pas soutenue par les données et la question de la retirer se pose.

Et en face, le shrinkage :

| Effet aléatoire | Shrinkage |
|---|---|
| `eta_cl` | 9 % |
| `eta_v` | 14 % |
| `eta_ka` | 46 % |

$$ Sh_\eta = 1 - \frac{SD(\hat{\eta}_i)}{\omega} $$

$\eta_{cl}$, informé par toute la courbe, est fiable à 9 %. $\eta_{ka}$ est à 46 % : sans prélèvement précoce chez la plupart des patients, la phase d'absorption n'apporte presque aucune information individuelle, et l'estimation de chaque patient **retombe vers la population**.

:::recall
Une spécificité utile de Monolix : les paramètres individuels ne sont pas seulement un mode conditionnel (l'équivalent de l'EBE de NONMEM). Le SAEM échantillonne la **distribution conditionnelle** de chaque patient par MCMC, et Monolix peut restituer ces tirages. Les diagnostics construits sur des tirages simulés plutôt que sur un point tassé récupèrent une partie de l'information que le shrinkage détruit. Cela atténue le problème — cela ne l'efface pas : quand les données ne disent rien sur $k_a$ chez un patient, aucune méthode d'estimation individuelle ne l'inventera.
:::
<!-- /step -->

<!-- step:title="Piège fréquent" -->
Le poids est dans le jeu de données et vous voulez l'essayer sur le volume. Dans `[COVARIATE]`, vous écrivez `tWT = log(WT)` — la transformation log est bien là, c'est l'essentiel, non ?

Le run passe. `beta_v_tWT` sort à **0,98** : superbe, presque exactement l'allométrie attendue sur un volume. Le $-2LL$ baisse. `omega_v` baisse aussi. Tous les signes du succès sont là.

Puis vous regardez `v_pop` : **0,49 L**, RSE **140 %**.

:::pitfall
`log(WT) = 0` correspond à un patient de **1 kg**. En omettant le centrage, vous avez déplacé le point de référence du modèle vers un poids qui n'existe pas, et `v_pop` est devenu le volume extrapolé de ce patient fictif. Deux dégâts. **Interprétation** : `v_pop` n'est plus reportable — vous ne pouvez pas écrire « le volume typique est de 0,49 L » dans un rapport. **Conditionnement** : `v_pop` et `beta_v_tWT` deviennent quasi colinéaires (corrélation des estimations au-delà de 0,99), la matrice d'information de Fisher est mal conditionnée, et les intervalles de confiance des deux paramètres sont bons à jeter.
:::

Le plus déroutant, c'est que le modèle n'est **pas faux**. Puisque $\log(WT) = \log(WT/70) + \log(70)$, les deux écritures sont le même modèle à une reparamétrisation près : à l'optimum, la vraisemblance est identique, les prédictions sont identiques, `omega_v` et `beta_v_tWT` sont identiques. Seul `v_pop` change, de 31,8 L à $31{,}8 \times 70^{-0{,}98} \approx 0{,}49$ L.

C'est exactement ce qui rend le piège durable : rien ne signale l'erreur, parce qu'il n'y a pas d'erreur au sens du calcul. Le centrage n'est pas une nécessité statistique de l'ajustement — c'est ce qui rend le paramètre **lisible** et son estimation **bien posée**. En pratique, le mauvais conditionnement finit tout de même par se payer : le SAEM démarre d'une valeur initiale prévue pour 30 L alors que la solution est à 0,5 L, converge moins bien, et l'étape de calcul de la matrice de Fisher devient fragile.

:::recall
Le test tient en une phrase à compléter : « `cl_pop` est la clairance typique d'un patient qui… ». Si vous ne pouvez pas finir la phrase avec un patient qui pourrait entrer dans votre étude, votre centrage est cassé. Centrez sur une valeur **de référence réaliste** — la médiane de votre population, ou une valeur conventionnelle comme 70 kg — et le paramètre redevient à la fois interprétable et bien estimé.
:::
<!-- /step -->

<!-- step:title="À retenir" -->
- `[INDIVIDUAL]` porte tout le modèle statistique. Une ligne = une loi (`distribution`), un centre (`typical`, qui est la **médiane**) et une largeur (`sd`). `no-variability` retire l'IIV sans effacer la ligne.
- `sd` est un **écart-type**, là où l'`$OMEGA` de NONMEM est une **variance** : un modèle traduit en recopiant les chiffres déclare 9 % au lieu de 30 %. `omega` d'une IIV usuelle vit entre 0,2 et 0,5. $CV = \sqrt{e^{\omega^2}-1}$, et $CV \approx \omega$ décroche au-delà de 0,5.
- La loi choisit la **contrainte** : `logNormal` pour un paramètre positif, `normal` pour un paramètre qui peut changer de signe, `logitNormal` pour une fraction bornée — mais son `omega` n'est alors plus un CV.
- `correlation = {level=id, r(cl, v)=...}` estime le **coefficient de corrélation** entre les etas, borné et directement lisible ; la covariance se reconstruit par $r\,\omega_{cl}\,\omega_v$.
- L'IOV est un **niveau** (`varlevel={id, id*occ}`), pas une liste d'etas : une seule variance par construction, donc pas de `SAME` à écrire. Sans niveau d'occasion, l'IIV absorbe l'IOV et se retrouve surestimée.
- Sur une logNormale, `covariate=log(CRCL/90)` avec un coefficient **est** le modèle puissance. Une covariable utile fait baisser `omega`, pas seulement le $-2LL$.
- Centrez toujours les covariables continues : un `log(WT)` non centré donne le même ajustement mais rend `v_pop` illisible et son estimation mal conditionnée.
- Lecture des sorties : RSE > 50 % sur un `omega` = IIV non soutenue par les données ; shrinkage élevé = paramètres individuels tassés vers la population ; $\Delta(-2LL)$ de 2 ou 3 points = bruit de l'échantillonnage d'importance.
<!-- /step -->
