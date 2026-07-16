---
id: "nonmem-avance"
slug: "nonmem-avance"
title: "NONMEM — pour aller plus loin"
description: "Distributions logit et normale, information a priori, MU-referencing, écosystème PsN/Xpose/Pirana et simulation."
summary: "Les outils qui font passer NONMEM du modèle qui tourne à l'analyse qui tient : paramètres bornés, a priori, MU-referencing, PsN."
track: "nonmem"
order: 215
duration: "10 min"
level: "intermediate"
tags: ["nonmem", "mu-referencing", "prior", "psn"]
prerequisites: ["tools-nonmem"]
glossary: []
slides: []
sources: ["bauer-nonmem-1", "bauer-nonmem-2", "keizer-psn-xpose", "jonsson-karlsson-scm"]
reviewed_on: "2026-07-14"
quiz:
  - prompt: "Le MU-referencing accélère SAEM parce que..."
    options:
      - "MU_n ne dépend que des THETA et de covariables constantes chez le sujet, ce qui rend la mise à jour des paramètres de population analytique à chaque itération"
      - "il réduit le nombre de sujets simulés pendant l'étape E, si bien que chaque itération traite beaucoup moins de données individuelles"
      - "il remplace l'intégration numérique de la vraisemblance par une linéarisation du modèle autour des valeurs nulles des ETA"
    correct: 0
  - prompt: "Pour une biodisponibilité qui doit rester entre 0 et 1, la paramétrisation adaptée est..."
    options:
      - "logit : F1 = 1/(1+EXP(-(THETA(1)+ETA(1)))), qui contraint F1 dans ]0,1[ quelle que soit la valeur tirée pour ETA(1)"
      - "log-normale : F1 = THETA(1)*EXP(ETA(1)), qui garantit la positivité de F1 quelle que soit la valeur tirée pour ETA(1)"
      - "normale : F1 = THETA(1)+ETA(1), les bornes inférieure et supérieure étant déclarées dans le bloc THETA"
    correct: 0
  - prompt: "Un a priori sur un paramètre se justifie surtout quand..."
    options:
      - "les nouvelles données ne peuvent pas informer ce paramètre, alors qu'une source publiée en donne une estimation et son incertitude"
      - "les nouvelles données informent bien ce paramètre, et l'a priori sert à confirmer que la valeur publiée est reproduite"
      - "le paramètre est celui que l'étude cherche à mesurer, et l'a priori sert à réduire son erreur type finale"
    correct: 0
---

<!-- step:title="Pourquoi ce chapitre" -->
Le chapitre précédent s'arrête au control stream minimal : un modèle de structure, des ETA log-normaux, FOCE-I. Cela suffit à faire **tourner** un modèle, pas à **mener une analyse**.

Trois murs se dressent vite. Un paramètre **borné** — une biodisponibilité, une fraction de répondeurs — que la log-normale laisse allègrement dépasser 1. Des données **trop pauvres** pour tout estimer, alors qu'un modèle publié existe déjà. Un SAEM qui met huit heures là où il devrait en mettre une.

NONMEM répond aux trois. Mais chaque réponse s'écrit **à la main**, et rien ne vous prévient si vous l'écrivez mal.
<!-- /step -->

<!-- step:title="Intuition" viz="03_PopulationDistrib" -->
Écrire `CL = THETA(1)*EXP(ETA(1))` n'est pas un rite : c'est un **choix de distribution**.

Ce que NONMEM impose, c'est que ETA(1) soit tiré d'une normale centrée, de variance $\omega^2$. La **fonction** qui transforme cet ETA en paramètre, c'est vous qui la choisissez. L'exponentielle envoie la droite réelle sur les réels positifs : parfaite pour une clairance, positive et sans plafond.

Une biodisponibilité, elle, vit entre 0 et 1. Avec $\omega = 0{,}4$ autour d'une valeur typique de 0,70, la log-normale produit sans broncher des individus à 1,6. NONMEM ne proteste pas : il simule tranquillement 160 % de la dose absorbée.

La solution n'est pas de brider l'ETA — c'est de **changer la fonction**. La logistique envoie la droite réelle sur l'intervalle ]0, 1[ : quelle que soit la valeur tirée, le paramètre reste où il doit être. Et pour une grandeur qui peut légitimement être négative — une pente d'effet, une dérive de ligne de base — l'identité, donc une **normale**, est le bon choix et non un pis-aller.

:::key
Choisissez la transformation d'après le **domaine physique** du paramètre, jamais par habitude.
:::
<!-- /step -->

<!-- step:title="La formule décortiquée" viz="16_SAEMCycle" -->
**Logit — pour un paramètre borné**

Sur l'échelle logit, le paramètre redevient non borné, donc compatible avec un ETA normal :

$$\text{logit}(F_1) = \log\frac{F_1}{1 - F_1} = \theta_1 + \eta_1$$

On revient dans l'intervalle par la réciproque :

$$F_1 = \frac{1}{1 + e^{-(\theta_1 + \eta_1)}}$$

```
$PK
  LGT  = THETA(1) + ETA(1)     ; echelle logit, non bornee
  F1   = 1/(1 + EXP(-LGT))     ; ramene dans ]0,1[
  BASE = THETA(2) + ETA(2)     ; normale : peut etre negative
  CL   = THETA(3)*EXP(ETA(3))  ; log-normale : le cas classique
```

Avec THETA(1) = 0,85, la valeur typique vaut $1/(1+e^{-0{,}85}) = 0{,}70$. L'ETA peut valoir −3 ou +3, F1 restera dans ]0, 1[.

**MU-referencing — déclarer l'espérance**

Le MU-referencing consiste à écrire explicitement, pour chaque ETA, l'espérance du paramètre **sur son échelle de transformation** :

```
$PK
  MU_1 = LOG(THETA(1))              ; CL
  MU_2 = LOG(THETA(2))              ; V
  CL   = EXP(MU_1 + ETA(1))
  V    = EXP(MU_2 + ETA(2))
$ESTIMATION METHOD=SAEM INTERACTION NBURN=2000 NITER=1000 PRINT=100
```

Deux règles, non négociables. `MU_n` ne dépend que des THETA et de covariables **constantes chez l'individu** — jamais d'un ETA, jamais d'une valeur qui change entre deux lignes du même sujet. Et le paramètre s'écrit **exactement** `MU_n + ETA(n)` sur l'échelle choisie.

Pourquoi cela accélère : à chaque itération, SAEM simule les effets individuels (étape E) puis met à jour les paramètres de population (étape M). Si le lien est `paramètre = MU_n + ETA(n)`, alors sur cette échelle le modèle est **linéaire en ETA** — l'étape M se résout par une **formule fermée**, une moyenne et une covariance des valeurs simulées. Sans MU-referencing, NONMEM ignore que cette structure existe et doit lancer une recherche numérique à chaque itération. Le gain se compte en facteur, pas en pourcentage. Pour METHOD=BAYES c'est plus radical encore : l'échantillonnage de Gibbs **suppose** cette structure.

**Information a priori**

Un a priori ajoute une **pénalité** à l'OFV : s'éloigner de la valeur attendue coûte, proportionnellement à la confiance qu'on lui accorde.

$$OFV_{\text{total}} = OFV_{\text{données}} + (\theta - \theta_{\text{prior}})^{\top}\Sigma_{\text{prior}}^{-1}(\theta - \theta_{\text{prior}})$$

```
$PRIOR   NWPRI NTHETA=3 NETA=2 NTHP=1 NETP=0
$THETAP  (1.1) FIX            ; moyenne a priori de KA, en h-1
$THETAPV (0.0121) FIX         ; variance de cet a priori (ET = 0.11)
```

`NTHP=1` : seul le premier THETA reçoit un a priori, les deux autres restent libres. Attention, le bloc THETAPV attend une **variance**, pas un écart-type — ici $0{,}11^2 = 0{,}0121$.

:::note
Réf. : Bauer, *NONMEM Tutorial* — Part I pour les blocs et options, Part II pour SAEM, BAYES et le MU-referencing.
:::
<!-- /step -->

<!-- step:title="Exemple concret" -->
Extrapolation pédiatrique. Vous disposez d'un modèle adulte publié — absorption d'ordre 1, KA = 1,1 h⁻¹, CL = 4,2 L/h, V = 32 L — et d'une nouvelle étude : **24 enfants, 2 prélèvements chacun, tous les deux après le pic**. Soit 48 concentrations pour trois paramètres de structure et leurs variabilités.

En estimation libre, KA part à 11 h⁻¹ avec un ET de 40 %, et V le suit dans l'absurde. La raison est mécanique : **aucun prélèvement précoce ne renseigne la phase d'absorption**. KA n'est pas estimable ici, et le laisser libre contamine CL et V.

On lui donne donc un a priori, centré sur la valeur adulte, avec l'incertitude publiée :

```
$PRIOR   NWPRI NTHETA=3 NETA=2 NTHP=1 NETP=0
$THETAP  (1.1) FIX
$THETAPV (0.0121) FIX
$ESTIMATION METHOD=SAEM INTERACTION NBURN=2000 NITER=1000
$ESTIMATION METHOD=IMP EONLY=1 NITER=10 ISAMPLE=3000   ; OFV exact
```

KA se stabilise à 1,2 h⁻¹. Surtout, CL et V — les paramètres que l'étude renseigne **réellement** — redeviennent estimables, avec des ET de 12 % et 15 %.

:::key
On met un a priori sur ce que les nouvelles données **ne peuvent pas** apprendre, jamais sur ce qu'on veut mesurer. Un a priori sur la clairance pédiatrique répondrait à la question **à la place** de l'étude.
:::

Reste à vérifier le modèle. NONMEM ne trace **aucun** graphique : tout passe par l'écosystème R, piloté en ligne de commande par PsN.

```
execute run12.mod                          # lancer, ranger les sorties
bootstrap -samples=1000 run12.mod          # IC des parametres par reechantillonnage
vpc -samples=500 -auto_bin=auto run12.mod  # VPC
scm -config_file=scm.conf run12.mod        # forward inclusion / backward elimination
```

Xpose lit ces sorties et produit les diagnostics en R ; Pirana sert d'atelier pour comparer les runs. Quand on veut seulement **simuler**, un bloc de simulation remplace celui d'estimation :

```
$SIMULATION (20260716) ONLYSIM SUBPROBLEMS=500
```

La graine rend la simulation reproductible, `ONLYSIM` coupe l'estimation, `SUBPROBLEMS=500` génère 500 jeux de données virtuels — le moteur des VPC et des essais cliniques simulés.
<!-- /step -->

<!-- step:title="Piège fréquent" -->
Le MU-referencing est le piège le plus coûteux, parce qu'il **échoue en silence**. Ce control stream tourne, converge, et rend un résultat :

```
$PK
  MU_1 = LOG(THETA(1))
  CL   = THETA(1)*EXP(ETA(1))        ; MU_1 declare mais jamais utilise
  MU_2 = LOG(THETA(2)) + 0.3*ETA(1)  ; interdit : MU depend d un ETA
  V    = EXP(MU_2 + ETA(2))
```

:::pitfall
Ligne 3 : `MU_1` est déclaré, mais `CL` ne s'écrit pas `EXP(MU_1 + ETA(1))`. Mathématiquement c'est la même chose ; pour l'étape M, non — la formule fermée ne s'applique plus. Ligne 4 : `MU_2` dépend d'`ETA(1)`, ce qui casse l'hypothèse de linéarité. Dans les deux cas : ni message, ni avertissement. Juste un SAEM qui rampe, ou qui converge à côté sans que rien ne le signale.
:::

Second piège, plus discret : **l'a priori trop serré**. Une variance a priori de 0,0001 sur KA, c'est un ET de 0,01 pour une valeur de 1,1 — vous avez **fixé** le paramètre sans l'écrire. Le modèle convergera, les ET rapportés seront flatteurs, et l'incertitude réelle aura disparu du dossier. Un a priori doit refléter l'incertitude **réelle** de sa source, erreur type publiée comprise.
<!-- /step -->

<!-- step:title="À retenir" -->
- La **transformation**, pas l'ETA, définit le domaine d'un paramètre : `EXP()` pour un positif non borné, logit pour une fraction dans ]0, 1[, identité pour une grandeur qui peut être négative.
- Le **MU-referencing** — `MU_n` fonction des seuls THETA et covariables individuelles constantes, puis paramètre écrit exactement `MU_n + ETA(n)` — rend l'étape M analytique : SAEM accélère nettement, et BAYES en dépend.
- Un **a priori** injecte un modèle publié dans une analyse pauvre en données ; il se met sur ce que les données ne peuvent pas informer, jamais sur ce qu'on veut mesurer.
- **PsN** automatise bootstrap, VPC et SCM ; **Xpose** trace ; **Pirana** organise. NONMEM ne produit aucun graphique : l'écosystème n'est pas un luxe.
- Le bloc `$SIMULATION` — une graine, des `SUBPROBLEMS` — transforme un modèle estimé en générateur de populations virtuelles.
<!-- /step -->
