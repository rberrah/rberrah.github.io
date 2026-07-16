---
id: "nlmixr2-variabilite"
slug: "nlmixr2-variabilite"
title: "nlmixr2 — ini, model et la variabilité"
description: "Le modèle statistique en R : le tilde qui déclare un eta, la convention log-transformée des theta, les blocs de covariance, l'IOV par niveau, les covariables et la lecture de fit$omega et fit$shrink."
summary: "Écrire et lire la variabilité dans nlmixr2 : eta.cl ~ 0.1 est une variance, tcl vit sur l'échelle log, ~ c() pour un bloc de covariance, la barre verticale pour l'IOV, et la table parFixed qui rétro-transforme tout."
track: "nlmixr2"
order: 3
duration: "13 min"
level: "intermediate"
tags: ["nlmixr2", "variability", "omega", "iiv", "iov", "covariates", "shrinkage"]
prerequisites: ["tools-nlmixr2"]
glossary: []
slides: []
sources: ["nlmixr2", "fidler-nlmixr", "karlsson-sheiner-iov", "savic-karlsson-shrinkage"]
reviewed_on: "2026-07-14"
quiz:
  - prompt: "Dans `ini({...})`, vous écrivez `eta.cl ~ 0.1`. Que déclare la valeur 0,1 ?"
    options:
      - "Une variance : l'écart-type de l'eta vaut 0,32, soit environ 32 % de CV sur la clairance."
      - "Un écart-type : la variance de l'eta vaut donc 0,01, soit environ 10 % de CV sur la clairance."
      - "Un CV exprimé en fraction : la variabilité inter-individuelle sur la clairance vaut donc 10 %."
    correct: 0
  - prompt: "Dans `eta.cl + eta.v ~ c(0.1, 0.05, 0.1)`, que représente la valeur 0,05 ?"
    options:
      - "La covariance entre eta.cl et eta.v : le triangle inférieur se lit var(eta.cl), covariance, var(eta.v)."
      - "La variance de eta.v : le vecteur se lit var(eta.cl), var(eta.v), puis la covariance donnée en dernier."
      - "La corrélation entre eta.cl et eta.v : nlmixr2 estime le coefficient lui-même plutôt que la covariance."
    correct: 0
  - prompt: "Vous déclarez `iov.cl ~ 0.03 | occ` sur un jeu de données comptant quatre occasions. Combien de paramètres de variabilité l'IOV ajoute-t-elle ?"
    options:
      - "Un seul : le niveau déclaré par la barre verticale porte une variance unique, quel que soit le nombre d'occasions."
      - "Quatre : chaque occasion reçoit sa propre variance, qu'il faut ensuite contraindre à rester égale aux autres."
      - "Trois : la première occasion sert de référence et les trois suivantes reçoivent chacune leur propre variance."
    correct: 0
  - prompt: "Le modèle contient `ka <- exp(tka + eta.ka)` et vous traduisez le `$THETA (0, 1.2)` de NONMEM par `tka <- c(0, log(1.2))`. Que fait réellement cette borne ?"
    options:
      - "Elle interdit toute ka typique inférieure à 1 h⁻¹, car la borne porte sur tka, donc sur le logarithme de ka."
      - "Elle interdit toute ka typique négative, ce qui reproduit fidèlement le `(0, 1.2)` du control stream d'origine."
      - "Elle reste sans effet, car l'exponentielle écrite dans le modèle garantit déjà que ka demeure strictement positive."
    correct: 0
---

<!-- step:title="Pourquoi ce chapitre" -->
Le chapitre d'introduction a montré la carcasse d'un modèle nlmixr2 : une fonction R, un bloc `ini({})`, un bloc `model({})`. Cette découpe paraît anodine — les chiffres d'un côté, les équations de l'autre. Elle ne l'est pas. Elle **répartit une seule décision de modélisation sur deux blocs**, et c'est de là que viennent la plupart des modèles nlmixr2 qui tournent sans rien dire et rapportent autre chose que ce qu'on croit.

Prenez la ligne la plus banale de l'écosystème : `cl <- exp(tcl + eta.cl)`. Elle dit que la clairance est log-normale. Mais l'échelle logarithmique qu'elle installe a une conséquence sur une valeur écrite **dans l'autre bloc**, trente lignes plus haut, et rien dans R ne vérifie que les deux se répondent. Une valeur initiale, une borne, un `%RSE` : les trois changent de sens selon ce que vous avez écrit dans `model({})`.

Ce chapitre couvre les cinq gestes du modèle statistique en nlmixr2 — déclarer un eta, corréler des etas, coder l'IOV, brancher une covariable, lire les sorties — en gardant partout la même question : **sur quelle échelle vit le nombre que je suis en train d'écrire**.
<!-- /step -->

<!-- step:title="Intuition" viz="12_VariabilitySandbox" -->
La grammaire de `ini({})` tient en trois signes. Ce ne sont pas des détails de style : chacun **déclare une nature de paramètre**, et c'est le seul moyen que nlmixr2 a de savoir à quoi il a affaire.

- `<-` (ou `=`) déclare un **effet fixe** : `tcl <- log(4.5)`. Un theta, une valeur estimée pour toute la population.
- `~` déclare un **effet aléatoire** : `eta.cl ~ 0.1`. Un oméga, une dispersion autour du typique.
- `|` déclare un **niveau** de variabilité : `iov.cl ~ 0.03 | occ`. Un tirage par occasion et non plus par patient.

Le nom, lui, ne déclare rien. `tcl` n'est pas un mot réservé : le `t` est une **convention humaine** pour « theta de cl », lisible par vous, ignorée par la machine. Vous pourriez l'appeler `bidule`. Ce qui fait de `tcl` un paramètre log-transformé, ce n'est pas son nom ni sa valeur initiale `log(4.5)` — c'est l'`exp()` que **vous** écrivez autour de lui dans `model({})`.

:::key
`ini({})` ne dit pas ce que les paramètres **signifient**, seulement ce qu'ils **sont** (fixe, aléatoire, niveau) et **où la recherche démarre**. Le sens vit entièrement dans `model({})`. C'est pourquoi nlmixr2 **relit votre `model({})`** pour produire ses sorties : en y voyant `cl <- exp(tcl + eta.cl)`, il comprend que `tcl` est un log, et vous rend une colonne rétro-transformée en L/h. Cette intelligence est réelle et vous fait gagner du temps, mais elle est **descriptive, pas normative** : elle constate ce que vous avez écrit, elle ne corrige jamais un désaccord entre les deux blocs.
:::
<!-- /step -->

<!-- step:title="La formule décortiquée" viz="03_PopulationDistrib" -->
### Le modèle de base

```r
mod <- function() {
  ini({
    tcl <- log(4.5)        # clairance typique, sur l echelle log
    tv  <- log(32)
    tka <- log(1.1)
    eta.cl ~ 0.1           # VARIANCE de l eta, pas un ecart-type
    eta.v  ~ 0.1
    eta.ka ~ 0.2
    prop.err <- 0.15
  })
  model({
    cl <- exp(tcl + eta.cl)
    v  <- exp(tv  + eta.v)
    ka <- exp(tka + eta.ka)
    d/dt(depot) = -ka*depot
    d/dt(centr) =  ka*depot - (cl/v)*centr
    cp = centr/v
    cp ~ prop(prop.err)
  })
}
fit <- nlmixr2(mod, dat, est = "saem")
```

soit, pour la clairance :

$$ \log(Cl_i) = t_{cl} + \eta_{i,cl}, \qquad \eta_{i,cl} \sim \mathcal{N}(0,\ \omega_{cl}^2) $$

### La convention du t, et pourquoi elle existe

Comparez à l'écriture NONMEM du même modèle, `CL = THETA(1)*EXP(ETA(1))`. Les deux décrivent la **même** log-normale, mais ils n'estiment pas le même nombre :

$$ Cl_i = \underbrace{e^{t_{cl}}}_{\theta_{CL}} \cdot e^{\eta_{i,cl}} \qquad \Longrightarrow \qquad \theta_{CL} = e^{t_{cl}}, \quad t_{cl} = \log(\theta_{CL}) $$

Chez NONMEM, l'`EXP` n'enveloppe que l'eta : `THETA(1)` est une clairance, en L/h, sur l'échelle **naturelle**. Chez nlmixr2, l'`exp()` enveloppe **theta et eta ensemble** : `tcl` n'est pas une clairance, c'est un logarithme de clairance, sans unité. `tcl = 1.52` ne veut rien dire tant qu'on ne l'a pas exponentié en 4,57 L/h.

Cette convention n'est pas un caprice, et elle n'est pas obligatoire — `cl <- tcl * exp(eta.cl)` avec `tcl <- 4.5` fonctionne parfaitement. Si tous les exemples de nlmixr2 mettent quand même les theta sur l'échelle log, c'est pour une raison précise : **un paramètre log-transformé n'a besoin d'aucune borne**. L'exponentielle ne peut structurellement pas rendre un nombre négatif, quelle que soit la valeur de `tcl`, y compris $-40$. La positivité est garantie par la forme du modèle, pas par une contrainte imposée à l'optimiseur — et l'optimiseur, lui, travaille sur un paramètre libre, ce qui lui convient beaucoup mieux.

:::key
Écrire `tcl <- log(4.5)` plutôt que `tcl <- c(0, 4.5)`, c'est **remplacer une contrainte par une reparamétrisation**. Retenez la raison : elle explique à la fois pourquoi la convention existe, pourquoi les bornes sont rares en nlmixr2, et pourquoi la borne que vous ajouterez par réflexe sera presque toujours une erreur — on y revient dans le piège.
:::

### La valeur après le tilde est une variance

`eta.cl ~ 0.1` déclare $\omega_{cl}^2 = 0{,}1$. C'est la même échelle que l'`$OMEGA` de NONMEM, et l'inverse de la `sd` de Monolix. Pour une log-normale, le CV exact du paramètre vaut :

$$ CV = \sqrt{e^{\omega^2} - 1} $$

| `ini` ($\omega^2$) | $\omega$ | $CV$ approché | $CV$ exact |
|---|---|---|---|
| 0,04 | 0,20 | 20 % | 20,2 % |
| 0,09 | 0,30 | 30 % | 30,7 % |
| 0,10 | 0,32 | 32 % | 32,4 % |
| 0,16 | 0,40 | 40 % | 41,7 % |
| 0,50 | 0,71 | 71 % | 80,5 % |

Le `~ 0.1` qui traîne dans tous les tutoriels — y compris dans le chapitre précédent — n'est donc pas un chiffre magique : c'est **32 % de CV**, une supposition de départ délibérément raisonnable pour un paramètre PK. Vous avez maintenant de quoi la remplacer par la vôtre.

:::pitfall
Le contrôle réflexe est arithmétique et vaut dans les deux sens de traduction. La valeur après le `~` d'une IIV usuelle de 20 à 50 % vit entre **0,04 et 0,25**, jamais entre 0,2 et 0,5. Un modèle Monolix recopié tel quel — `sd=0.3` devenu `eta.cl ~ 0.3` — déclare 59 % de CV au lieu de 30 %. Rien ne plante, le run converge, et vous rapportez le double de la variabilité réelle.
:::

### Le bloc de covariance

Par défaut, les etas sont indépendants. On les corrèle en les **additionnant** à gauche du tilde :

```r
ini({
  tcl <- log(4.5)
  tv  <- log(32)
  eta.cl + eta.v ~ c(0.1,
                     0.05, 0.1)
  eta.ka ~ 0.2
})
```

Le `c()` donne le **triangle inférieur** de la matrice de covariance, ligne par ligne — exactement comme le `$OMEGA BLOCK` de NONMEM :

$$ \Omega = \begin{pmatrix} 0{,}10 & 0{,}05 \\ 0{,}05 & 0{,}10 \end{pmatrix}, \qquad r_{cl,v} = \frac{0{,}05}{\sqrt{0{,}10}\times\sqrt{0{,}10}} = 0{,}5 $$

L'ordre est donc `var(eta.cl)`, `cov(eta.cl, eta.v)`, `var(eta.v)` : la covariance est **au milieu**, pas à la fin. Si vous préférez déclarer ce que vous lisez plutôt que ce qui est estimé, `cor()` accepte les écarts-types sur la diagonale et la corrélation hors diagonale :

```r
  eta.cl + eta.v ~ cor(0.32,
                       0.5, 0.32)
```

Les deux blocs ci-dessus décrivent la même matrice. Seule change la façon dont **vous** écrivez la valeur initiale ; le paramètre estimé reste la covariance.

:::note
La corrélation entre $\eta_{cl}$ et $\eta_{v}$ est physiologique — un patient massif a souvent à la fois une clairance et un volume élevés. L'ignorer ne dégrade pas beaucoup l'ajustement, mais fausse les **simulations** : le modèle diagonal fabrique des patients à forte clairance et petit volume qui n'existent pas dans la nature.
:::

### L'IOV se déclare comme un niveau

nlmixr2 ne code pas l'IOV avec des etas répétés. Il la déclare comme un **niveau de variabilité**, avec une barre verticale :

```r
ini({
  tcl <- log(4.5)
  eta.cl ~ 0.1
  iov.cl ~ 0.03 | occ      # entre occasions, pas entre patients
})
model({
  cl <- exp(tcl + eta.cl + iov.cl)
  ...
})
```

$$ \log(Cl_{ij}) = t_{cl} + \eta_{i,cl} + \kappa_{ij}, \qquad \eta_{i,cl} \sim \mathcal{N}(0, \omega_{cl}^2), \quad \kappa_{ij} \sim \mathcal{N}(0, \omega_{\text{IOV}}^2) $$

`| occ` se lit « variabilité **entre** `occ` », par symétrie avec l'IIV qui est la variabilité entre `id`. La colonne `occ` est une colonne ordinaire du jeu de données, que vous construisez vous-même (par exemple `dat$occ <- ifelse(dat$TIME < 336, 1, 2)`).

:::key
Le point qui compte : le niveau porte **une seule variance**, partagée par toutes les occasions. Deux occasions ou huit, `iov.cl` reste **un paramètre estimé** — seul le nombre de valeurs individuelles $\kappa_{ij}$ grandit. C'est le même service que le `SAME` de NONMEM, mais obtenu par construction : il n'y a rien à contraindre parce qu'il n'y a rien à répéter. C'est exactement l'esprit du `varlevel` de Monolix. Contrepartie honnête à connaître : nlmixr2 ne gère pas les **corrélations entre termes d'IOV**, là où NONMEM sait les mettre dans un même `BLOCK`.
:::

### Les covariables sont du R ordinaire

Ici nlmixr2 est plus direct que ses deux concurrents : il n'y a **pas de bloc de covariables**. Toute colonne du jeu de données est directement utilisable dans `model({})`, et la transformation s'écrit sur place.

```r
ini({
  tcl <- log(4.5)
  beta.cl.crcl <- 0.7
  beta.cl.sex  <- 0.1
  eta.cl ~ 0.1
})
model({
  cl <- exp(tcl + beta.cl.crcl*log(CRCL/90) + beta.cl.sex*SEX + eta.cl)
})
```

avec `SEX` codée 0/1 dans les données. Regardez ce que l'échelle log fait gratuitement : la covariable entre **additivement sur le log**, donc **multiplicativement** sur le paramètre.

$$ Cl_i = e^{t_{cl}} \left(\frac{CRCL_i}{90}\right)^{\beta_{CRCL}} e^{\beta_{SEX} I_M(i)} \; e^{\eta_{i,cl}} $$

:::howto
Une covariable continue log-transformée et centrée, ajoutée avec un simple coefficient à l'intérieur de l'`exp()`, **est** le modèle puissance. C'est le `TVCL = THETA(1)*(CRCL/90)**THETA(4)` de NONMEM, écrit sans opérateur de puissance. L'allométrie sur le poids s'obtient de la même façon : `beta.cl.wt*log(WT/70)` avec `beta.cl.wt <- fix(0.75)` pour l'imposer plutôt que l'estimer.
:::

Et la règle qui vaut dans les trois logiciels : une covariable **retire à l'eta ce qu'elle explique**. `exp(tcl)` devient la clairance d'un patient de référence — ici 90 mL/min de CRCL et `SEX = 0` — et `eta.cl` ne porte plus que le reste. Une covariable qui sert se voit donc à la **baisse de l'oméga**, pas seulement à la baisse de l'OFV.

:::note
Réf. : documentation du projet nlmixr2 pour la syntaxe des blocs `ini()`/`model()`, les niveaux de variabilité et le contenu de l'objet `fit` ; Fidler et coll., *CPT Pharmacometrics Syst Pharmacol* pour le projet nlmixr ; Karlsson & Sheiner, *J Pharmacokinet Biopharm* 1993 pour la variabilité inter-occasion ; Savic & Karlsson, *AAPS J* 2009 pour le shrinkage.
:::
<!-- /step -->

<!-- step:title="Exemple concret" viz="12_VariabilitySandbox" -->
**44 patients**, administration orale, un compartiment avec absorption d'ordre 1, erreur proportionnelle. Deux occasions de prélèvement par patient : un profil riche au jour 1, deux points résiduels au jour 21. On construit le modèle statistique par étapes, en SAEM.

| Run | Modèle de variabilité | Paramètres | OFV | $\Delta$ |
|---|---|---|---|---|
| 1 | trois etas indépendants | 7 | 1682,4 | — |
| 2 | + bloc `eta.cl + eta.v ~ c(...)` | 8 | 1670,1 | −12,3 |
| 3 | + IOV sur `cl` au niveau `occ` | 9 | 1651,8 | −18,3 |
| 4 | + CRCL sur `cl` | 10 | 1633,6 | −18,2 |

**Run 1 → 2.** La corrélation sort à $r = 0{,}45$. Un paramètre de plus, l'OFV baisse de 12,3, très au-dessus du seuil de 3,84 à 1 degré de liberté : le bloc est retenu.

**Run 2 → 3.** `iov.cl` s'estime à 19,2 % de CV, et le BSV de la clairance **descend** de 41,2 % à 35,1 %. C'est le résultat le plus instructif du tableau : une part de ce qu'on attribuait à « ce patient élimine fort » était en réalité « cette visite-là était différente ». Sans niveau d'occasion, l'IIV **absorbe l'IOV** et se retrouve surestimée — et un modèle qui surestime l'IIV surestime aussi la dispersion des simulations dont vous tirerez une recommandation de dose.

**Run 3 → 4.** L'exposant sur la clairance de la créatinine sort à 0,71, et le BSV de la clairance passe de 35,1 % à 29,9 %. La fonction rénale explique donc environ **5 points de CV**. C'est cette phrase-là, et non le $\Delta$ de 18,2, qui a un sens clinique et qui ira dans le rapport.

:::note
L'OFV d'un fit SAEM n'est pas produit par l'algorithme lui-même : nlmixr2 le calcule **après coup**, par une approximation FOCEi, et l'en-tête du fit l'annonce (`OBJF by FOCEi approximation`). Deux conséquences pratiques. Ces $\Delta$ ne sont comparables qu'entre runs dont l'OFV a été obtenu **de la même façon** — la règle « même méthode » du chapitre d'introduction s'applique ici littéralement. Et tester `iov.cl = 0` place l'hypothèse nulle **sur le bord** de l'espace des paramètres, une variance ne pouvant pas être négative : le seuil de 3,84 y est conservateur, donc prudent.
:::

### La table des paramètres

C'est la vraie force ergonomique de nlmixr2 : tout est dans **une seule table**, déjà rétro-transformée.

```
── nlmixr² SAEM(ODE); OBJF by FOCEi approximation ──

  Parameter      Est.     SE  %RSE  Back-transformed(95%CI)  BSV(CV%)  Shrink(SD)%
  tcl            1.52  0.043   2.8       4.57 (4.20, 4.97)       29.9        7.6%
  tv             3.46  0.048   1.4       31.8 (28.9, 35.0)       39.1       12.8%
  tka           0.131  0.104    79       1.14 (0.93, 1.40)       52.4       45.3%
  beta.cl.crcl   0.71  0.128    18       0.71 (0.46, 0.96)
  prop.err      0.116  0.009   7.8                    0.116
  iov.cl                                                          19.2
```

Trois colonnes méritent qu'on s'y arrête.

**`Est.` est sur l'échelle estimée**, `Back-transformed` sur l'échelle utile. `tcl = 1,52` n'est pas reportable ; $e^{1{,}52} = 4{,}57$ L/h l'est. Cette colonne n'a rien de magique : nlmixr2 l'a produite en **lisant l'`exp()`** de votre `model({})`. La ligne `beta.cl.crcl` le montre bien — comme aucune exponentielle ne l'entoure, la valeur rétro-transformée est identique à l'estimation, seul l'intervalle de confiance est ajouté.

**`BSV(CV%)` vous épargne la racine carrée.** 29,9 % est le $\sqrt{e^{\omega^2}-1}$ de l'oméga de `eta.cl`. Notez que `iov.cl` apparaît sur sa propre ligne, avec sa dispersion mais sans estimation ni erreur standard : c'est un niveau de variabilité, pas un effet fixe.

:::pitfall
`%RSE` sur un theta log-transformé n'est **pas** la RSE que vous liriez dans un listing NONMEM, et ne se juge pas au même aune. Regardez `tka` : 79 % de RSE, un chiffre qui déclencherait partout ailleurs un réflexe de suppression. Mais l'intervalle rétro-transformé est (0,93 – 1,40), soit un facteur 1,5 du bas en haut — une absorption tout à fait correctement estimée. L'explication est arithmétique : la RSE est le rapport $SE/|Est|$ calculé **sur l'échelle log**, et $t_{ka} = 0{,}131$ est proche de zéro parce que $k_a$ est proche de 1 h⁻¹. Un dénominateur qui frôle zéro fait exploser le rapport sans que rien ne se dégrade. Sur un theta log-transformé, jugez l'incertitude sur l'**intervalle rétro-transformé**, jamais sur le `%RSE`.
:::

### Les objets à interroger

La table imprimée résume ; l'objet `fit` contient tout, sous forme de matrices R directement réutilisables.

```r
fit$omega     # covariance complete des effets aleatoires
fit$omegaR    # meme matrice : SD sur la diagonale, correlations hors diagonale
fit$shrink    # shrinkage et statistiques de distribution des etas
fit$eta       # les etas individuels, un par patient
fit$iov       # les kappa individuels, par patient et par occasion
```

```
> fit$omega
       eta.cl  eta.v eta.ka
eta.cl 0.0856 0.0497 0.0000
eta.v  0.0497 0.1422 0.0000
eta.ka 0.0000 0.0000 0.2426

> fit$omegaR
       eta.cl  eta.v eta.ka
eta.cl 0.2926 0.4500 0.0000
eta.v  0.4500 0.3771 0.0000
eta.ka 0.0000 0.0000 0.4925
```

`fit$omega` et `fit$omegaR` décrivent la même chose dans deux langues. La première est celle que le modèle estime ; la seconde est celle que vous savez lire — on y voit d'un coup d'œil $\omega_{cl} = 0{,}29$, $\omega_{v} = 0{,}38$ et $r_{cl,v} = 0{,}45$, sans diviser quoi que ce soit. Les zéros de la colonne `eta.ka` ne sont pas des estimations proches de zéro : ce sont des **cases jamais estimées**, puisque `eta.ka` a été déclaré hors du bloc.

Et le shrinkage, déjà présent dans la colonne `Shrink(SD)%` :

$$ Sh_\eta = 1 - \frac{SD(\hat{\eta}_i)}{\omega} $$

$\eta_{cl}$ est à 7,6 % : informée par la courbe entière, la clairance individuelle est fiable. $\eta_{ka}$ est à 45,3 %, et la raison se lit dans le protocole — seul le jour 1 porte des prélèvements précoces, donc la phase d'absorption n'est renseignée qu'à moitié des occasions. Chez les patients concernés, l'estimation individuelle **retombe vers la population**.

:::recall
Le shrinkage disqualifie les **etas individuels** comme outil de diagnostic, pas les **paramètres de population**. L'oméga de `eta.ka` reste estimé sur l'ensemble des 44 sujets et garde son sens même quand `fit$eta` est muet patient par patient. Concrètement : à 45 % de shrinkage, un graphique de `eta.ka` contre le poids ne tranche rien, ni dans un sens ni dans l'autre — on teste la covariable **dans le modèle**, on ne la juge pas sur le nuage.
:::
<!-- /step -->

<!-- step:title="Piège fréquent" -->
Vous traduisez en nlmixr2 un modèle NONMEM qui tourne depuis des années. Le control stream contient :

```
$THETA (0, 1.2)          ; KA
$PK
  KA = THETA(3)*EXP(ETA(3))
```

Le `(0, ...)` est ici parfaitement correct et parfaitement idiomatique : `THETA(3)` est une constante d'absorption en h⁻¹, elle doit rester positive, on le lui dit. Vous transposez fidèlement :

```r
ini({
  tka <- c(0, log(1.2))     # « comme dans NONMEM : borne basse a 0 »
  eta.ka ~ 0.2
})
model({
  ka <- exp(tka + eta.ka)
})
```

Vous lancez en `est = "focei"`. Le run se termine. `tka` sort à **0,0000**, `ka` rétro-transformée à **1,00 h⁻¹** — pile. La SE est aberrante, le `%RSE` part en vrille. Vous relancez le même fichier en `est = "saem"` : cette fois `tka = -0,478`, soit **0,62 h⁻¹**, et les diagnostics de la phase d'absorption redeviennent propres.

Deux méthodes, un seul fichier, deux réponses. La conclusion tentante — « SAEM et FOCEI ne sont pas d'accord, c'est un artefact d'algorithme » — est fausse, et elle vous ferait passer des jours à comparer des moteurs alors que le bug est dans une parenthèse.

:::pitfall
La borne ne porte pas sur `ka`. Elle porte sur **`tka`**, et `tka` est un logarithme. `tka > 0` signifie donc $k_a > e^0$, soit **`ka` > 1 h⁻¹**. Vous n'avez pas écrit « l'absorption est positive » : vous avez écrit « l'absorption est plus rapide qu'une heure de demi-vie d'absorption ». Comme la vraie valeur est 0,62 h⁻¹, l'optimiseur pousse le paramètre contre la borne et **s'y colle**. La signature à reconnaître : un paramètre qui se pose exactement sur une valeur ronde, avec une erreur standard cassée.
:::

Reste l'asymétrie, qui est le vrai danger. **SAEM ne gère pas les bornes** et les ignore — nlmixr2 vous en avertit d'ailleurs dans la console. **FOCEI, lui, les respecte** : son optimiseur externe accepte des contraintes de boîte, et il ne dit rien puisqu'il fait exactement ce qu'on lui a demandé. Le moteur qui vous prévient est donc celui qui n'avait pas de problème, et le moteur qui vous donne le mauvais chiffre est celui qui se tait. Un avertissement noyé dans un mur de sortie R, et l'affaire est jouée.

Le correctif tient en trois caractères :

```r
tka <- log(1.2)           # aucune borne, et c est volontaire
```

:::recall
La borne n'était pas seulement **mal échelonnée** : elle était **inutile**. `exp()` ne peut pas rendre un nombre négatif, quelle que soit la valeur de `tka` — la positivité est déjà garantie par la forme du modèle. C'est précisément le marché que vous avez accepté en adoptant la convention log : vous avez troqué la contrainte contre la reparamétrisation, et il ne faut pas payer les deux. Règle de terrain : sur un paramètre enveloppé d'`exp()`, ne mettez **aucune** borne. Si vous en écrivez une malgré tout, demandez-vous à voix haute quelle valeur elle interdit **sur l'échelle naturelle** — et vérifiez que ce n'est pas une valeur que vos patients pourraient avoir.
:::
<!-- /step -->

<!-- step:title="À retenir" -->
- La grammaire de `ini({})` tient en trois signes : `<-` déclare un effet fixe, `~` un effet aléatoire, `|` un niveau de variabilité. Le nom `tcl` ne déclare rien — le `t` est une convention humaine.
- Ce qui rend `tcl` log-transformé, c'est l'`exp()` de `model({})`, pas sa valeur initiale. nlmixr2 relit votre `model({})` pour rétro-transformer ses sorties : il **constate** ce que vous avez écrit, il ne corrige jamais un désaccord entre les deux blocs.
- La valeur après le `~` est une **variance**, comme l'`$OMEGA` de NONMEM et à l'inverse de la `sd` de Monolix. $CV = \sqrt{e^{\omega^2}-1}$ ; le `~ 0.1` des tutoriels vaut 32 % de CV ; une IIV usuelle vit entre 0,04 et 0,25.
- `eta.cl + eta.v ~ c(0.1, 0.05, 0.1)` donne le **triangle inférieur** de la covariance : la covariance est au **milieu**. `cor()` permet de saisir SD et corrélation à la place.
- L'IOV est un **niveau** (`iov.cl ~ 0.03 | occ`) : une seule variance quel que soit le nombre d'occasions, donc pas de `SAME` à écrire. Sans elle, l'IIV absorbe l'IOV et se retrouve surestimée.
- Les covariables sont du R ordinaire dans `model({})`, sans bloc dédié. Sur l'échelle log, `beta*log(CRCL/90)` **est** le modèle puissance. Une bonne covariable fait baisser l'oméga, pas seulement l'OFV.
- Sur un theta log-transformé, le `%RSE` est trompeur près de zéro : jugez sur l'**intervalle rétro-transformé**. `fit$omegaR` se lit sans calcul (SD sur la diagonale, corrélations ailleurs) ; `fit$shrink` au-delà de 20–30 % invalide les graphiques eta contre covariable.
- Ne mettez **aucune borne** sur un paramètre enveloppé d'`exp()` : elle est inutile et son échelle est trompeuse. SAEM les ignore en vous prévenant, FOCEI les applique en silence — le moteur dangereux est celui qui se tait.
<!-- /step -->
