---
id: "nonmem-modele-structural"
slug: "nonmem-modele-structural"
title: "NONMEM — le modèle structural"
description: "Le control stream bloc par bloc : les ADVAN pré-programmés contre un système d'EDO écrit à la main, le choix du TRANS, et la mise à l'échelle."
summary: "Écrire le squelette déterministe d'un modèle NONMEM : la carte des blocs, ADVAN1 à ADVAN4 contre ADVAN13 avec DES, pourquoi on paramètre en CL et V, et pourquoi S2 décide de tout."
track: "nonmem"
order: 2
duration: "10 min"
level: "intermediate"
tags: ["nonmem", "control-stream", "advan", "trans", "ode"]
prerequisites: ["tools-nonmem"]
glossary: []
slides: []
sources: ["nonmem", "bauer-nonmem-1", "owen-fiedler-kelly", "rowland-tozer"]
reviewed_on: "2026-07-14"
quiz:
  - prompt: "Pour un modèle à 1 compartiment oral à élimination linéaire, pourquoi préférer ADVAN2 à ADVAN13 ?"
    options:
      - "ADVAN2 évalue une solution analytique exacte, sans intégrateur numérique ni tolérance à régler."
      - "ADVAN2 autorise une variabilité inter-individuelle sur KA, ce que la routine ADVAN13 interdit."
      - "ADVAN2 déduit automatiquement la mise à l'échelle du volume estimé dans le bloc de paramètres."
    correct: 0
  - prompt: "Pourquoi paramétrer en CL et V (TRANS2) plutôt qu'en constante d'élimination (TRANS1) ?"
    options:
      - "CL et V sont les paramètres primaires : covariables et allométrie s'y appliquent séparément et s'interprètent."
      - "TRANS1 est incompatible avec les routines à dépôt et ne permet donc pas de modéliser une absorption orale."
      - "La constante d'élimination est estimée avec une précision moindre car elle varie sur plusieurs décades."
    correct: 0
  - prompt: "Les doses sont en mg, le volume en L, et les concentrations mesurées sont rapportées en ng/mL. Quelle mise à l'échelle du compartiment central est correcte ?"
    options:
      - "S2 = V/1000, car A(2)/V donne des mg/L, soit 1000 fois moins que la valeur exprimée en ng/mL."
      - "S2 = V*1000, car il faut convertir en microgrammes les milligrammes dans lesquels la dose est exprimée."
      - "S2 = V, car NONMEM harmonise lui-même les unités à partir des colonnes déclarées dans le bloc INPUT."
    correct: 0
---

<!-- step:title="Pourquoi ce chapitre" -->
Le **modèle structural** est le squelette déterministe : la concentration que prédirait le modèle chez un patient sans aucun effet aléatoire. Tout le reste — variabilité, covariables, erreur résiduelle — se greffe dessus. Si le squelette est faux, aucun raffinement statistique ne le rattrape.

Dans NONMEM, ce squelette ne se choisit pas dans un menu : il se **déclare**, réparti sur plusieurs blocs qui doivent s'accorder entre eux. NM-TRAN vérifie la **syntaxe**, jamais l'**intention**. Un control stream qui compile, tourne et converge peut décrire un modèle que vous n'avez pas voulu — ce chapitre porte surtout sur les endroits où cela arrive.
<!-- /step -->

<!-- step:title="Intuition" viz="21_PopPKPlayground" -->
Écrire un modèle structural, c'est répondre à deux questions indépendantes.

**Quelle forme ?** Combien de compartiments, quelle voie d'entrée, élimination linéaire ou saturable. C'est de la pharmacologie, et cela se décide sur les données.

**Comment la calculer ?** NONMEM offre deux routes vers la *même* prédiction :

- une **routine ADVAN pré-programmée**, qui contient la solution analytique du système, déjà résolue une fois pour toutes ;
- un **système d'EDO** que vous écrivez à la main, que NONMEM intègre numériquement à chaque évaluation.

L'analogie : pour calculer une intégrale, on peut utiliser la primitive connue, ou lancer une quadrature numérique. Les deux donnent la même valeur ; la primitive est exacte et instantanée, la quadrature est générale mais coûte du temps et introduit une tolérance à régler.

:::key
La forme relève de la pharmacologie, la route relève de l'informatique. On choisit d'abord la forme, puis la route la moins chère qui sait la calculer — jamais l'inverse.
:::
<!-- /step -->

<!-- step:title="La formule décortiquée" -->
### La carte des blocs

Un control stream est une suite de blocs introduits par un dollar. Leur ordre n'est pas décoratif : NM-TRAN les lit de haut en bas et certains dépendent des précédents.

| Bloc | Rôle |
|---|---|
| `$PROBLEM` | Un titre libre, repris en tête du listing. Sans effet sur le calcul. |
| `$INPUT` | Nomme les colonnes du fichier **dans leur ordre d'apparition**. |
| `$DATA` | Le fichier et les lignes à ignorer. |
| `$SUBROUTINE` | Choisit la routine ADVAN et la paramétrisation TRANS. |
| `$MODEL` | Déclare les compartiments — uniquement pour les routines générales. |
| `$PK` | Calcule les paramètres du modèle pour chaque individu. C'est ici que vit le modèle structural. |
| `$DES` | Les dérivées, si vous écrivez vos EDO vous-même. |
| `$ERROR` | Relie la prédiction à l'observation. |
| `$THETA` | Valeurs initiales et bornes des effets fixes. |
| `$OMEGA` | Variances des effets aléatoires inter-individuels. |
| `$SIGMA` | Variances de l'erreur résiduelle. |
| `$ESTIMATION` | La méthode et ses options. |
| `$COVARIANCE` | Les erreurs standard des estimations. |
| `$TABLE` | Ce qu'on écrit sur disque pour les diagnostics. |

:::pitfall
Les colonnes sont appariées **par position, pas par nom**. NM-TRAN ne lit pas l'en-tête du CSV — `IGNORE=@` sert précisément à le sauter. Insérez une colonne au milieu du fichier sans mettre le bloc à jour, et tout se décale en silence : le poids devient le temps, et le modèle converge quand même.
:::

### Le système que résout ADVAN2

Prenons un compartiment avec absorption d'ordre 1. Deux quantités évoluent : $A_1$ au site d'absorption, $A_2$ dans le compartiment central.

$$ \frac{dA_1}{dt} = -k_a A_1, \qquad \frac{dA_2}{dt} = k_a A_1 - \frac{CL}{V} A_2 $$

Pour une dose unique $D$ de fraction biodisponible $F$, ce système a une solution fermée :

$$ C(t) = \frac{F D}{V} \cdot \frac{k_a}{k_a - k} \left( e^{-k t} - e^{-k_a t} \right), \qquad k = \frac{CL}{V} $$

C'est exactement ce que contient ADVAN2. La routine n'intègre rien : à chaque enregistrement d'événement, elle repart des quantités courantes et applique la solution analytique jusqu'à l'événement suivant. D'où sa vitesse, et l'absence de toute tolérance d'intégration.

### Choisir sa routine

Les routines analytiques couvrent les formes usuelles. La colonne « central » est celle qui décide de la mise à l'échelle, et c'est le détail qui se paie.

| Routine | Structure | Compartiment central | Paramétrage usuel |
|---|---|---|---|
| `ADVAN1` | 1 cpt, entrée directe (IV) | cmt 1 → `S1` | TRANS2 : CL, V |
| `ADVAN2` | 1 cpt, dépôt + absorption ordre 1 | cmt 2 → `S2` | TRANS2 : CL, V, KA |
| `ADVAN3` | 2 cpt, entrée directe (IV) | cmt 1 → `S1` | TRANS4 : CL, V1, Q, V2 |
| `ADVAN4` | 2 cpt, dépôt + absorption ordre 1 | cmt 2 → `S2` | TRANS4 : CL, V2, Q, V3, KA |

Avec les routines à dépôt, la dose entre en compartiment 1 et l'observation se lit en compartiment 2. Ajouter une absorption **décale donc toute la numérotation**.

### TRANS : pourquoi CL et V

Le TRANS ne change ni le modèle ni la prédiction — seulement les paramètres que vous fournissez. Pour ADVAN2, deux choix :

- **TRANS1** attend `K` et `KA` ;
- **TRANS2** attend `CL`, `V` et `KA`.

Notez déjà l'asymétrie : avec TRANS1, le volume n'est pas un paramètre de la routine, mais il faut quand même le fournir par la mise à l'échelle. On l'écrit donc de toute façon.

L'argument de fond est ailleurs. La clairance et le volume sont les paramètres **primaires** : ils correspondent à deux réalités physiologiques distinctes — une capacité d'épuration par unité de temps, un espace de dilution. La constante d'élimination est un **hybride dérivé** des deux :

$$ k = \frac{CL}{V} $$

Trois conséquences pratiques :

**Les covariables.** La fonction rénale agit sur l'épuration, la masse corporelle sur l'espace de distribution. Posée sur la clairance, une covariable dit quelque chose de vérifiable. Posée sur une constante hybride, elle mélange deux mécanismes et devient ininterprétable.

**L'allométrie.** Les exposants canoniques valent 0,75 sur la clairance et 1 sur le volume. Ils ne s'écrivent proprement que sur des paramètres primaires.

**La variabilité.** Avec une écriture log-normale, l'eta porté par la constante d'élimination n'est pas un eta libre — c'est une **différence** :

$$ k_i = \frac{\theta_{CL} e^{\eta_1}}{\theta_V e^{\eta_2}} = \frac{\theta_{CL}}{\theta_V} e^{\eta_1 - \eta_2}, \qquad \operatorname{Var}(\eta_1 - \eta_2) = \omega_1^2 + \omega_2^2 - 2\,\omega_{12} $$

Une seule variance estimée sur cette différence **confond** la variabilité de la clairance, celle du volume et leur covariance. Les trois deviennent inséparables, et il n'existe aucun moyen de les récupérer après coup.

### Quand écrire ses EDO

Les routines générales — ADVAN6, ADVAN8, ADVAN13 — intègrent numériquement un système que vous fournissez. ADVAN13 est le choix courant aujourd'hui. Il exige deux blocs de plus : la déclaration des compartiments, et les dérivées.

Voici une élimination saturable, que **aucune** routine analytique à dépôt ne sait décrire :

```
$SUBROUTINE ADVAN13 TOL=6

$MODEL
  COMP=(DEPOT,DEFDOSE)
  COMP=(CENTRAL,DEFOBS)

$PK
  KA = THETA(1)*EXP(ETA(1))
  V  = THETA(2)*EXP(ETA(2))
  VM = THETA(3)*EXP(ETA(3))
  KM = THETA(4)
  S2 = V

$DES
  CONC    = A(2)/V
  DADT(1) = -KA*A(1)
  DADT(2) =  KA*A(1) - VM*CONC/(KM + CONC)
```

Deux détails qui coûtent des heures. Dans les dérivées, la concentration se recalcule à la main : la prédiction mise à l'échelle n'y est pas disponible. Et `TOL` fixe la précision demandée à l'intégrateur — trop lâche, le bruit numérique se mêle au gradient et la minimisation part en vrille.

:::note
Entre les deux extrêmes, il existe un intermédiaire oublié : ADVAN5 et ADVAN7 traitent n'importe quelle structure **linéaire** par l'algèbre, sans intégration numérique. Pour une chaîne de compartiments de transit ou un schéma parent-métabolite, ils sont bien plus rapides qu'ADVAN13 pour un résultat identique. La règle : forme standard → routine analytique ; linéaire mais inhabituelle → ADVAN5 ou ADVAN7 ; non linéaire → ADVAN13.
:::
<!-- /step -->

<!-- step:title="Exemple concret" viz="21_PopPKPlayground" -->
Un antibiotique oral, dose unique de 500 mg, 40 volontaires, concentrations plasmatiques en mg/L sur 24 heures. Un compartiment suffit. Le control stream complet :

```
$PROBLEM  Antibiotique oral - 1 cpt, absorption ordre 1, dose unique 500 mg

$INPUT    ID TIME AMT DV MDV EVID WT
$DATA     oral500.csv IGNORE=@

$SUBROUTINE ADVAN2 TRANS2

$PK
  TVCL = THETA(1)
  TVV  = THETA(2)
  TVKA = THETA(3)

  CL = TVCL*EXP(ETA(1))
  V  = TVV *EXP(ETA(2))
  KA = TVKA*EXP(ETA(3))

  S2 = V

$ERROR
  IPRED = F
  Y     = IPRED*(1 + EPS(1)) + EPS(2)

$THETA
  (0, 12)     ; 1 CL/F (L/h)
  (0, 60)     ; 2 V/F  (L)
  (0, 1.2)    ; 3 KA   (1/h)

$OMEGA
  0.09        ; IIV CL - CV 31 %
  0.04        ; IIV V  - CV 20 %
  0.16        ; IIV KA - CV 42 %

$SIGMA
  0.01        ; proportionnel - 10 %
  0.0025      ; additif - ecart-type 0.05 mg/L

$ESTIMATION METHOD=1 INTER MAXEVAL=9999 PRINT=5 NOABORT
$COVARIANCE PRINT=E
$TABLE      ID TIME DV IPRED CWRES ETA1 ETA2 ETA3 ONEHEADER NOPRINT FILE=sdtab001
```

Ligne à ligne, ce qui compte vraiment :

`IGNORE=@` saute toute ligne dont le premier caractère non blanc est une lettre ou un arobase — donc l'en-tête et les commentaires, en une option.

`ADVAN2 TRANS2` fixe simultanément la forme et les paramètres attendus : dès lors, les trois noms `CL`, `V` et `KA` sont **obligatoires**, orthographe comprise. Un `CLE` au lieu de `CL` et la routine ne trouve pas sa clairance.

Dans le bloc de paramètres, la séparation entre `TVCL` et `CL` paraît gratuite sur un modèle sans covariable. Elle ne l'est pas : c'est l'emplacement où viendront s'insérer les covariables, en amont de l'exponentielle. Prendre l'habitude tout de suite évite une réécriture plus tard.

`S2 = V` est la ligne décisive. Elle dit : la prédiction est la quantité du compartiment 2 divisée par le volume, donc une concentration en mg/L — homogène aux données.

Dans le bloc d'erreur, `F` désigne la prédiction déjà mise à l'échelle. On la recopie dans `IPRED` uniquement pour pouvoir la sortir en table.

**Les résultats.** La minimisation aboutit, la matrice de covariance est obtenue.

| Paramètre | Estimation | RSE |
|---|---|---|
| CL/F (L/h) | 11,8 | 4,2 % |
| V/F (L) | 58,4 | 5,1 % |
| KA (1/h) | 1,31 | 9,7 % |

Ces valeurs se relisent en pharmacologie. La constante d'élimination vaut $k = 11{,}8 / 58{,}4 = 0{,}202\ \text{h}^{-1}$, soit une demi-vie de $\ln(2)/0{,}202 = 3{,}4$ heures. Le pic tombe à $t_{\max} = \ln(k_a/k)/(k_a - k) = 1{,}7$ heure, pour une concentration d'environ $6{,}1$ mg/L — cohérent avec le nuage observé.

:::note
Avec des données orales seules, la biodisponibilité n'est pas identifiable : elle n'apparaît dans la solution qu'au sein du produit $F D / V$. Les deux premiers paramètres sont donc des rapports, $CL/F$ et $V/F$, et c'est sous ce nom qu'ils doivent être rapportés. Écrire « V = 58,4 L » sans le $F$ au dénominateur est une surinterprétation, pas une simplification d'écriture.
:::
<!-- /step -->

<!-- step:title="Piège fréquent" -->
Le piège du modèle structural n'est presque jamais le choix du nombre de compartiments — cela, les diagnostics le signalent. C'est la **mise à l'échelle**, parce qu'elle échoue sans bruit.

Reprenons le même jeu de données, à un détail près : le laboratoire rend ses concentrations en **ng/mL**, pas en mg/L. Le control stream n'est pas touché, `S2 = V` reste en place. La dose est en mg, le volume en L, donc la prédiction sort en mg/L — numériquement **1000 fois plus petite** que la colonne d'observations.

NONMEM ne proteste pas. Il ne connaît pas les unités : il ajuste. La forme de la courbe fixe $k_a$ et $k$, qui restent justes ; seule l'échelle doit se plier, et le volume est la seule chose qui puisse la fournir.

| Paramètre | Attendu | Obtenu avec `S2 = V` |
|---|---|---|
| CL/F | 11,8 L/h | 0,0118 L/h |
| V/F | 58,4 L | 0,0584 L |
| Demi-vie | 3,4 h | 3,4 h |

Le run est « réussi ». La minimisation aboutit, la covariance passe, les RSE sont excellentes, les graphiques observé-prédit sont impeccables et la demi-vie est **exacte**. Seule alerte : un volume de distribution de 58 millilitres. La correction tient en trois caractères — `S2 = V/1000`.

:::pitfall
Aucun diagnostic statistique ne détecte une erreur d'unité, parce que ce n'est pas une erreur statistique : le modèle décrit parfaitement les données, dans la mauvaise échelle. Le seul filet est la **plausibilité physiologique** des valeurs absolues. Avant de lire le moindre graphique, demandez-vous si le volume et la clairance obtenus ont une taille d'organisme humain.
:::

La variante de la numérotation est plus bruyante, mais son message est trompeur. Vous passez d'une étude IV à une étude orale, donc d'ADVAN1 à ADVAN2, et vous laissez `S1 = V` en place. Le compartiment central est désormais le 2, et une mise à l'échelle non renseignée vaut 1 par défaut : la prédiction devient une **quantité en mg**, et le volume ne subsiste plus que dans le rapport $CL/V$.

Symptôme : la clairance et le volume ne sont plus identifiables séparément, seul leur rapport l'est. Le listing annonce alors un échec de l'étape de covariance ou une corrélation de 0,99 entre les deux. Le réflexe classique — fixer un paramètre, simplifier le modèle de variabilité — traite le symptôme. Le bug est une ligne plus haut, dans un `1` devenu `2`.

:::recall
La routine ADVAN décide du **numéro** du compartiment central ; les unités des données décident du **facteur**. Les deux se rencontrent sur la ligne de mise à l'échelle, et c'est la seule ligne du control stream que NONMEM ne peut jamais vérifier à votre place.
:::
<!-- /step -->

<!-- step:title="À retenir" -->
- Le modèle structural se déclare sur plusieurs blocs qui doivent s'accorder ; NM-TRAN valide la syntaxe, jamais l'intention.
- Les colonnes de données sont appariées par **position**, pas par nom : insérer une colonne sans mettre le bloc à jour décale tout en silence.
- Les routines analytiques (ADVAN1 à ADVAN4) portent la solution fermée du système : exactes, rapides, sans tolérance à régler. On ne passe aux EDO écrites à la main que si la forme l'impose.
- Non linéaire — saturation, TMDD — impose ADVAN13. Linéaire mais de forme inhabituelle : ADVAN5 ou ADVAN7 font le travail sans intégrateur.
- TRANS2 ne change pas le modèle, seulement les paramètres fournis. On paramètre en clairance et volume parce qu'eux seuls portent des covariables interprétables, acceptent l'allométrie, et gardent leurs variabilités séparées — un eta sur la constante d'élimination les confond irrémédiablement.
- Ajouter un dépôt décale la numérotation : le central passe du compartiment 1 au compartiment 2.
- La mise à l'échelle est la ligne la plus dangereuse du fichier. Une erreur d'unité produit un modèle qui converge, ajuste parfaitement, et se trompe d'un facteur 1000 sur les valeurs absolues. Le seul garde-fou est la plausibilité physiologique.
- Sur données orales seules, les estimations sont des rapports : on rapporte CL/F et V/F, jamais CL et V.
<!-- /step -->
