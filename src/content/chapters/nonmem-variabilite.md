---
id: "nonmem-variabilite"
slug: "nonmem-variabilite"
title: "NONMEM — ETA, OMEGA et variabilité"
description: "Comment NONMEM code la variabilité : les ETA log-normaux, les blocs OMEGA diagonaux ou pleins, l'IOV par etas répétés, et la lecture du shrinkage."
summary: "Écrire et lire la variabilité dans un control stream : EXP(ETA), DIAGONAL vs BLOCK, SAME pour l'IOV, omega au carré vers CV%, shrinkage et covariables dans le bloc PK."
track: "nonmem"
order: 3
duration: "13 min"
level: "intermediate"
tags: ["nonmem", "variability", "omega", "iiv", "iov", "shrinkage"]
prerequisites: ["tools-nonmem"]
glossary: []
slides: []
sources: ["nonmem", "karlsson-sheiner-iov", "savic-karlsson-shrinkage", "jonsson-karlsson-scm"]
reviewed_on: "2026-07-14"
quiz:
  - prompt: "Dans un control stream, que représente la valeur 0.09 écrite dans `$OMEGA 0.09` ?"
    options:
      - "La variance de ETA(1) : l'écart-type vaut 0,3, soit environ 31 % de CV sur le paramètre."
      - "L'écart-type de ETA(1) : la variance vaut donc 0,0081, soit environ 9 % de CV sur le paramètre."
      - "Le CV du paramètre exprimé en fraction : la variabilité inter-individuelle vaut donc 9 %."
    correct: 0
  - prompt: "Par rapport à `$OMEGA DIAGONAL(2)`, qu'apporte `$OMEGA BLOCK(2)` sur deux etas ?"
    options:
      - "Il estime en plus la covariance entre les deux etas, soit 3 paramètres de variabilité au lieu de 2."
      - "Il contraint les deux variances à être égales entre elles, soit 1 paramètre de variabilité au lieu de 2."
      - "Il applique une transformation logit aux deux etas, ce qui borne la variabilité estimée entre 0 et 1."
    correct: 0
  - prompt: "Dans le codage classique de l'IOV, à quoi sert le mot-clé `SAME` sur les OMEGA d'occasion ?"
    options:
      - "À imposer la même variance à tous les etas d'occasion, de sorte que l'IOV coûte un seul paramètre estimé."
      - "À recopier la valeur de l'OMEGA précédent puis à la fixer, ce qui retire l'IOV de l'estimation."
      - "À forcer les etas d'occasion à prendre la même valeur chez un patient, ce qui annule l'IOV estimée."
    correct: 0
  - prompt: "Le listing indique ETASHRINKSD = 47 % sur ETA(2). Quelle conclusion est justifiée ?"
    options:
      - "Les EBE de ETA(2) sont tassés vers zéro : le graphique ETA(2) vs covariable est peu fiable pour trancher."
      - "Le modèle structural est mal spécifié sur ETA(2) : il faut ajouter un compartiment avant d'aller plus loin."
      - "L'OMEGA de ETA(2) est sous-estimé d'environ 47 % : il faut le fixer à une valeur plus élevée."
    correct: 0
---

<!-- step:title="Pourquoi ce chapitre" -->
Un control stream décrit deux choses très différentes avec la même économie de moyens : le **modèle typique** (les `THETA`) et la **variabilité autour de ce typique** (les `ETA`, les `EPS`). La première partie s'apprend vite. La seconde est celle qui décide, en pratique, si le modèle est publiable.

NONMEM ne vous protège de rien ici : une variance mise à la place d'un écart-type se compile sans un mot, et un modèle de variabilité mal posé produit des estimations plausibles mais fausses. Ce chapitre couvre les quatre gestes qui reviennent dans chaque projet : écrire un `ETA`, choisir entre `$OMEGA DIAGONAL` et `$OMEGA BLOCK`, coder l'IOV, et lire ce que le listing renvoie.
<!-- /step -->

<!-- step:title="Intuition" viz="12_VariabilitySandbox" -->
Imaginez la clairance comme une taille. La population a une taille typique ; chaque patient s'en écarte d'un facteur qui lui est propre et qui ne change pas d'un jour à l'autre.

NONMEM code cet écart individuel par un `ETA`, un nombre **centré sur zéro** tiré une fois par patient. Le typique est porté par un `THETA`, l'écart par un `ETA`, et le lien entre les deux est presque toujours **multiplicatif** :

- `ETA(1) = 0` → le patient est exactement typique ;
- `ETA(1) = +0.30` → sa clairance vaut environ 1,35 fois la typique ;
- `ETA(1) = -0.30` → environ 0,74 fois la typique.

:::key
Les `THETA` décrivent le patient moyen, les `ETA` décrivent la distance de chaque patient à ce moyen, les `EPS` décrivent le bruit de chaque mesure. Trois blocs, trois questions distinctes — les mélanger est la principale source de modèles ininterprétables.
:::
<!-- /step -->

<!-- step:title="La formule décortiquée" viz="03_PopulationDistrib" -->
### L'ETA log-normal

L'écriture canonique d'un paramètre PK dans le bloc `$PK` est :

```
$PK
  CL = THETA(1)*EXP(ETA(1))
  V  = THETA(2)*EXP(ETA(2))
```

soit, en notation mathématique :

$$ CL_i = \theta_{CL} \cdot e^{\eta_{i,1}}, \qquad \eta_{i,1} \sim \mathcal{N}(0,\ \omega_1^2) $$

L'`ETA` est normal, donc le **paramètre** est log-normal : toujours positif, asymétrique à droite. C'est exactement ce qu'on veut d'une clairance, qui ne peut pas être négative et dont quelques patients sont très éliminateurs. Une écriture additive (`CL = THETA(1) + ETA(1)`) autoriserait des clairances négatives et fait régulièrement échouer la minimisation ; on la réserve aux paramètres qui peuvent légitimement changer de signe.

### De omega au carré vers le CV%

Ce que vous écrivez dans `$OMEGA` est une **variance**, jamais un écart-type. Pour un modèle log-normal, le coefficient de variation exact du paramètre vaut :

$$ CV = \sqrt{e^{\omega^2} - 1} $$

et l'approximation de terrain $CV \approx \omega$ n'est bonne que tant que $\omega$ reste petit :

| `$OMEGA` ($\omega^2$) | $\omega$ | $CV$ approché | $CV$ exact |
|---|---|---|---|
| 0,04 | 0,20 | 20 % | 20,2 % |
| 0,09 | 0,30 | 30 % | 30,7 % |
| 0,16 | 0,40 | 40 % | 41,7 % |
| 0,50 | 0,71 | 71 % | 80,5 % |

:::pitfall
Écrire `$OMEGA 0.3` en pensant « 30 % de variabilité » déclare en réalité une variance de 0,30, soit un CV de 59 %. Le modèle tourne, converge, et vous rapportez le double de la variabilité réelle. Le contrôle réflexe : la valeur d'`$OMEGA` d'une IIV usuelle de 20 à 50 % vit entre **0,04 et 0,25**, pas entre 0,2 et 0,5.
:::

### DIAGONAL contre BLOCK

`$OMEGA` déclare la matrice de covariance des etas. Deux formes :

```
$OMEGA DIAGONAL(2)
  0.09          ; variance de ETA(1) — CL
  0.16          ; variance de ETA(2) — V
```

Ici les etas sont supposés **indépendants** : connaître la clairance d'un patient n'apprend rien sur son volume. Deux paramètres estimés.

```
$OMEGA BLOCK(2)
  0.09                 ; variance de ETA(1)
  0.054   0.16         ; covariance(1,2), puis variance de ETA(2)
```

`BLOCK(2)` estime en plus le terme hors diagonale, donné en **triangle inférieur** :

$$ \Omega = \begin{pmatrix} \omega_1^2 & \omega_{12} \\ \omega_{12} & \omega_2^2 \end{pmatrix}, \qquad r_{12} = \frac{\omega_{12}}{\omega_1\,\omega_2} = \frac{0{,}054}{0{,}30 \times 0{,}40} = 0{,}45 $$

Un `BLOCK(n)` coûte $n(n+1)/2$ paramètres au lieu de $n$ : le passage de 2 à 3 paramètres se juge par un test du rapport de vraisemblance à 1 degré de liberté, soit une baisse d'OFV de plus de 3,84 pour un risque de 5 %.

:::note
Une corrélation forte entre `ETA(CL)` et `ETA(V)` n'est pas un artefact à supprimer : elle est physiologique (un grand patient a souvent à la fois une clairance et un volume élevés) et l'ignorer biaise les simulations, qui produisent alors des patients à forte clairance et petit volume qui n'existent pas.
:::

### L'IOV par etas répétés

L'IOV se code en donnant au patient un eta **de plus par occasion**, tous tirés dans la même loi. La construction historique de Karlsson et Sheiner utilise des indicatrices d'occasion et le mot-clé `SAME` :

$$ CL_{ij} = \theta_{CL} \cdot e^{\eta_i + \kappa_{ij}}, \qquad \kappa_{ij} \sim \mathcal{N}(0,\ \omega_{\text{IOV}}^2) $$

```
$INPUT ID TIME AMT DV OCC WT CRCL

$PK
  OC1 = 0
  OC2 = 0
  IF(OCC.EQ.1) OC1 = 1
  IF(OCC.EQ.2) OC2 = 1
  IOV = OC1*ETA(3) + OC2*ETA(4)

  CL  = THETA(1)*EXP(ETA(1) + IOV)
  V   = THETA(2)*EXP(ETA(2))

$OMEGA BLOCK(2)
  0.09
  0.054  0.16
$OMEGA BLOCK(1) 0.04      ; variance de l'IOV — ETA(3)
$OMEGA BLOCK(1) SAME      ; ETA(4) partage cette variance
```

`SAME` est le point clé : sans lui, chaque occasion aurait sa propre variance, ce qui n'a aucun sens (l'IOV est une **propriété du médicament**, pas de la visite numéro 2) et multiplie les paramètres pour rien. Avec `SAME`, deux etas supplémentaires ne coûtent **qu'un seul** paramètre estimé.

### Les covariables dans le bloc PK

Une covariable ne s'ajoute pas à côté de l'eta : elle explique une part de ce que l'eta portait. On l'insère donc **dans le typique**, en amont du `EXP(ETA)` :

```
$PK
  TVCL = THETA(1)*(CRCL/90)**THETA(4)
  TVV  = THETA(2)*(WT/70)
  CL   = TVCL*EXP(ETA(1))
  V    = TVV *EXP(ETA(2))
  S1   = V
```

`TVCL` est la clairance typique **d'un patient ayant cette clairance de la créatinine** ; `ETA(1)` ne représente plus que ce que la CRCL n'explique pas. Une covariable qui marche se voit donc à la **baisse d'`$OMEGA`**, pas seulement à la baisse d'OFV.
<!-- /step -->

<!-- step:title="Exemple concret" viz="12_VariabilitySandbox" -->
Une analyse sur 48 patients, administration IV, un compartiment, avec entre 1 et 6 prélèvements par patient. On part d'un modèle sans covariable et sans corrélation.

| Run | Modèle de variabilité | Paramètres $\Omega$ | OFV | $\Delta$OFV |
|---|---|---|---|---|
| 001 | `DIAGONAL(2)`, sans covariable | 2 | 1842,6 | — |
| 002 | `BLOCK(2)`, sans covariable | 3 | 1831,9 | −10,7 |
| 003 | `BLOCK(2)` + CRCL sur CL | 4 | 1809,4 | −22,5 |

**Run 001 → 002.** Un paramètre de plus, l'OFV baisse de 10,7 ; le seuil à 1 degré de liberté est 3,84 au risque de 5 %. La corrélation est réelle et vaut $r = 0{,}45$ : le bloc est justifié.

**Run 002 → 003.** L'exposant `THETA(4)` sur la CRCL est estimé à 0,68. L'`$OMEGA` de `ETA(1)` passe de 0,14 à 0,09 :

$$ CV_{\text{avant}} = \sqrt{e^{0{,}14}-1} = 38{,}8\ \%, \qquad CV_{\text{après}} = \sqrt{e^{0{,}09}-1} = 30{,}7\ \% $$

La fonction rénale explique donc environ 8 points de CV sur la clairance. C'est cette phrase-là — pas le $\Delta$OFV de 22,5 — qui a un sens clinique et qui ira dans le rapport.

**Ce que dit le listing.** NONMEM imprime en fin de run les shrinkages, sous la forme `ETASHRINKSD(%)` :

```
ETASHRINKSD(%)   8.7   47.2
EBVSHRINKSD(%)   8.1   45.9
EPSSHRINKSD(%)  12.4
```

Formellement, le shrinkage compare la dispersion des EBE à la variabilité déclarée :

$$ Sh_\eta = 1 - \frac{SD(\hat{\eta}_i)}{\omega} $$

`ETA(1)` (clairance, informée par toute la courbe) est à 8,7 % : ses EBE sont fiables. `ETA(2)` (volume) est à 47,2 %, parce que les patients à prélèvement unique n'apportent presque aucune information sur la phase précoce. Sur ces patients-là, l'estimation individuelle **retombe vers la population**.
<!-- /step -->

<!-- step:title="Piège fréquent" -->
Le piège n'est pas d'obtenir un shrinkage élevé — c'est inévitable en données éparses. Le piège est de **continuer à faire des diagnostics comme si de rien n'était**.

Suite du run 003 : on trace `ETA(2)` contre le poids pour décider si le poids explique le volume. Le nuage est plat, la régression donne une pente quasi nulle. Conclusion apparente : le poids n'agit pas sur $V$, on ne le retient pas.

C'est une erreur de raisonnement. Avec 47 % de shrinkage, les EBE de `ETA(2)` ont été **tassés vers zéro** par le prior de population : la relation vraie est écrasée dans le nuage avant même d'être regardée. Le graphique ne dit pas « pas d'effet du poids » ; il dit « pas assez de données pour que cet eta parle ».

:::pitfall
Au-dessus de 20 à 30 % de shrinkage, les graphiques ETA vs covariable perdent leur valeur de preuve. Ils peuvent **masquer une relation réelle** (nuage aplati) et, plus vicieux, **fabriquer une tendance qui n'existe pas**, parce que la contraction vers zéro n'est pas la même selon la richesse du protocole de chaque patient. Les mêmes réserves valent pour les diagnostics IPRED, tassés par le shrinkage de l'EPS.
:::

Trois réflexes une fois le shrinkage constaté :

- **Tester la covariable dans le modèle**, pas sur le graphique : on l'inclut dans `$PK`, on relance, et on juge sur l'OFV et sur `$OMEGA`. Le test formel reste valide là où le nuage ment.
- **Ne pas fixer `$OMEGA` à la main** pour « corriger » le shrinkage. Le shrinkage mesure un manque d'information dans les données ; changer la valeur d'oméga ne crée pas de prélèvement supplémentaire, il déplace juste le problème.
- **Ne pas supprimer un eta au seul motif qu'il shrinke.** Un `ETA(2)` mal informé chez chaque patient peut rester nécessaire à la description correcte de la dispersion de la population.

:::recall
Le shrinkage disqualifie les **EBE** comme outil de diagnostic, pas les **paramètres de population**. `$OMEGA` reste estimé sur l'ensemble des sujets et garde son sens même quand les etas individuels sont muets.
:::
<!-- /step -->

<!-- step:title="À retenir" -->
- `CL = THETA(1)*EXP(ETA(1))` rend le paramètre log-normal : positif, asymétrique à droite — la forme par défaut pour une clairance ou un volume.
- Ce qu'on écrit dans `$OMEGA` est une **variance**. $CV = \sqrt{e^{\omega^2}-1}$ ; l'approximation $CV \approx \omega$ décroche au-delà de 40 %.
- `DIAGONAL` suppose les etas indépendants ; `BLOCK(n)` estime leurs covariances pour $n(n+1)/2$ paramètres, et se juge par un rapport de vraisemblance. La corrélation CL–V est physiologique : l'ignorer fausse les simulations.
- L'IOV se code par un eta par occasion, avec `SAME` pour leur imposer une variance commune — deux etas, un seul paramètre.
- Les covariables entrent dans le typique (`TVCL`), en amont de `EXP(ETA)` ; une bonne covariable fait baisser `$OMEGA`, pas seulement l'OFV.
- Un shrinkage supérieur à 20–30 % invalide les graphiques ETA vs covariable, dans les deux sens : il masque des relations vraies et en invente des fausses. On tranche alors dans le modèle, pas sur le nuage.
<!-- /step -->
