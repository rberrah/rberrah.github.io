---
id: "nlmixr2-avance"
slug: "nlmixr2-avance"
title: "nlmixr2 — pour aller plus loin"
description: "Paramètres bornés avec expit et probitInv, auto-initialisation par NCA, boucler sur des modèles en R, babelmixr2 et la simulation rxode2."
summary: "Le modèle est un objet R : ce que cela permet — bornes écrites à la main, boucles, pipelines, traduction vers NONMEM et Monolix — et ce que cela coûte vraiment."
track: "nlmixr2"
order: 6
duration: "10 min"
level: "intermediate"
tags: ["nlmixr2", "rxode2", "babelmixr2", "logit"]
prerequisites: ["tools-nlmixr2"]
glossary: []
slides: []
sources: ["nlmixr2", "fidler-nlmixr", "wang-rxode", "fda-poppk"]
reviewed_on: "2026-07-14"
quiz:
  - prompt: "Pour borner un paramètre dans ]0,1[ avec nlmixr2, on..."
    options:
      - "écrit la transformation soi-même dans le bloc model, par expit(tf + eta.f) : il n'y a pas de mot-clé de distribution, l'algèbre que l'on tape tient lieu de fonction de lien"
      - "déclare distribution = logitNormal dans le bloc ini, que nlmixr2 applique ensuite à l'effet aléatoire correspondant au moment de l'estimation"
      - "borne l'effet aléatoire lui-même dans le bloc ini, en assortissant la ligne eta.f ~ 0.81 d'une limite basse et d'une limite haute"
    correct: 0
  - prompt: "On pipe model(cl <- exp(tcl + eta.cl + b_cr * log(CRCL/90))) sans ajouter la ligne ini(b_cr = 0.5). nlmixr2..."
    options:
      - "déclare b_cr comme une covariable et attend donc une colonne b_cr dans le jeu de données : le run s'arrête sur une erreur qui accuse les données, alors que la faute est dans le modèle"
      - "estime quand même b_cr en lui attribuant d'office une valeur initiale de 1, et signale l'ajout par un simple message d'information dans la console"
      - "refuse de construire le modèle et renvoie une erreur de syntaxe indiquant que le paramètre b_cr n'a pas reçu de valeur initiale déclarée"
    correct: 0
  - prompt: "À propos des graines aléatoires sous nlmixr2 et rxode2..."
    options:
      - "le SAEM part d'une graine fixe par défaut : un run se reproduit à l'identique sans jamais montrer qu'il n'est qu'une réalisation parmi d'autres, et c'est en variant seed qu'on teste la robustesse"
      - "le SAEM tire une graine différente à chaque appel, si bien qu'il faut renseigner saemControl(seed=) pour qu'un même script rende deux fois exactement le même résultat"
      - "le SAEM et rxode2 héritent tous deux de la graine posée par set.seed(), si bien qu'un seul set.seed() en tête de script suffit à figer estimation et simulations"
    correct: 0
  - prompt: "Avec babelmixr2, lancer une estimation avec est = nonmem..."
    options:
      - "écrit le control stream, lance NONMEM et réimporte le résultat en objet de fit nlmixr2 : il faut donc une installation de NONMEM sous licence, et l'OFV obtenu ne se compare pas à celui d'un run SAEM"
      - "réimplémente les algorithmes de NONMEM à l'intérieur de nlmixr2, ce qui évite toute installation externe et reproduit exactement les estimations d'un run NONMEM natif"
      - "se contente de traduire le modèle en control stream à lancer ailleurs, l'OFV rapporté restant comparable à celui du run SAEM mené sur les mêmes données"
    correct: 0
---

<!-- step:title="Pourquoi ce chapitre" -->
Le chapitre précédent vous laisse avec un `nlmixr2(mod, data, est = "saem")` qui tourne. Il passe sous silence trois choses.

La première : nlmixr2 n'a **aucun mot-clé de distribution**. Là où Monolix déclare `logitNormal`, nlmixr2 attend que vous écriviez la transformation. C'est un choix de conception, et il coupe dans les deux sens.

La deuxième : le modèle n'est pas un fichier, c'est un **objet R**. La construction de modèle devient donc de la programmation — trente modèles candidats, c'est un `lapply`, pas trente dossiers. Avec les arêtes vives de la programmation en prime.

La troisième : les sorties. babelmixr2 écrit du NONMEM et du Monolix, rxode2 simule. Et il y a une conversation honnête à tenir sur ce que nlmixr2 ne fait pas encore.
<!-- /step -->

<!-- step:title="Intuition" viz="03_PopulationDistrib" -->
Regardez la ligne `cl <- exp(tcl + eta.cl)`. **Rien n'y déclare une log-normale.** Il n'y a pas de mot-clé, pas d'option, pas de table de distributions. C'est le `exp()` qui *est* la log-normale.

nlmixr2 n'impose qu'une seule chose, la même que tous les autres outils : $\eta_i \sim \mathcal{N}(0, \omega^2)$, un effet aléatoire normal qui vit sur toute la droite réelle. Tout le reste est de l'algèbre que vous tapez. La fonction que vous mettez autour de $\theta + \eta_i$ envoie cette droite réelle sur le domaine du paramètre — et cette fonction, c'est vous qui l'écrivez.

D'où deux conséquences symétriques.

**La première libère.** Borner un paramètre n'est pas un mot-clé qu'on espère trouver dans la documentation : c'est une fonction qu'on remplace. `exp()` couvre $]0, +\infty[$. `expit()` couvre $]0, 1[$. `expit(x, 0, 100)` couvre $]0, 100[$. `probitInv()` couvre $]0,1[$ par un autre chemin. Rien à déclarer, rien à chercher.

**La seconde coûte.** Personne ne vous relit. Monolix *sait* que votre $F$ est une logitNormale et adapte ce qu'il affiche ; nlmixr2 exécute l'algèbre que vous avez tapée et vous rend les nombres sur l'échelle où vous les avez tapés. Il n'y a pas de mot-clé sur lequel se tromper, et pas de mot-clé pour vous protéger.

:::key
La fonction de lien ne se déclare pas, elle **s'écrit**. Paramètre positif : `exp()`. Fraction dans ]0,1[ : `expit()` ou `probitInv()`. Grandeur bornée dans ]min,max[ : `expit(x, min, max)`. Grandeur qui peut légitimement être négative — une pente d'effet, une dérive de ligne de base : **rien du tout**, on écrit `tslope + eta.slope`, et c'est le bon choix, pas de la paresse.
:::

Et voici l'idée que tout le reste du chapitre ne fera que décliner : ce que nlmixr2 vous rapporte sur un paramètre borné — sa valeur initiale, son $\omega$, ses coefficients de covariables — vit sur l'**échelle de la transformation que vous avez écrite**, jamais sur celle du paramètre.
<!-- /step -->

<!-- step:title="La formule décortiquée" viz="12_VariabilitySandbox" -->
Un seul modèle gouverne tout le bloc `model` :

$$ \psi_i = h^{-1}\!\left(\theta + \sum_k \beta_k\, c_{ik} + \eta_i\right), \qquad \eta_i \sim \mathcal{N}(0, \omega^2) $$

Sous Monolix, on déclare $h$. Sous nlmixr2, on écrit **directement $h^{-1}$** : c'est le membre droit de la ligne. Le bloc `ini` porte la valeur initiale sur l'échelle de $h$, le bloc `model` applique $h^{-1}$ — les deux lignes doivent se répondre.

- $\mathbb{R}$ — `ini` : `tslope <- 0.2` ; `model` : `slope <- tslope + eta.slope`
- $]0,+\infty[$ — `ini` : `tcl <- log(3.4)` ; `model` : `cl <- exp(tcl + eta.cl)`
- $]0,1[$ — `ini` : `tf <- logit(0.62)` ; `model` : `fbio <- expit(tf + eta.f)`
- $]0,1[$ par probit — `ini` : `tf <- probit(0.62)` ; `model` : `fbio <- probitInv(tf + eta.f)`
- $]min,max[$ — `ini` : `temax <- logit(60, 0, 100)` ; `model` : `emax <- expit(temax + eta.emax, 0, 100)`

```r
mod <- function() {
  ini({
    tf  <- logit(0.62)     # 0.4895 : echelle logit, PAS 0.62
    tcl <- log(3.4)
    tv  <- log(45)
    tka <- log(1.1)
    eta.f  ~ 0.81          # omega = 0.9, sur l echelle logit
    eta.cl ~ 0.0784        # omega = 0.28, sur l echelle log
    prop.sd <- 0.14
  })
  model({
    fbio <- expit(tf + eta.f)      # borne dans ]0,1[ quelle que soit la valeur de eta
    cl   <- exp(tcl + eta.cl)
    v    <- exp(tv)
    ka   <- exp(tka)
    f(depot) <- fbio
    d/dt(depot) = -ka * depot
    d/dt(centr) =  ka * depot - (cl/v) * centr
    cp = centr / v
    cp ~ prop(prop.sd)
  })
}
```

Quelle que soit la valeur tirée pour $\eta_i$ — $-4$, $+4$ —, `fbio` reste dans ses bornes. C'est une garantie **structurelle** : aucun optimiseur ne peut la violer, puisqu'il n'y a rien à violer.

**Le piège de l'échelle du bloc ini.** `tf <- logit(0.62)` range **0,4895** dans la table des paramètres, pas 0,62. Écrire `tf <- 0.62` ne démarre donc pas à $F = 0{,}62$ mais à $\text{expit}(0{,}62) = 0{,}65$. L'écart est petit ; il n'en est pas moins une valeur initiale que vous croyez connaître et qui n'est pas celle que vous avez posée.

**Lire un $\omega$ borné.** rxode2 fournit la fonction qui fait le calcul :

```r
logitNormInfo(logit(0.62), sd = 0.9)
#>      mean       var        cv
#> 0.6028707 0.0346592 0.3088056
```

Trois nombres à confronter. La **médiane** vaut $\text{expit}(0{,}4895) = 0{,}62$ exactement — la transformation inverse conserve la médiane. La **moyenne** vaut 0,603, et non 0,62 : `expit` n'est pas linéaire, exactement comme une log-normale a pour médiane $e^{\theta}$ mais pour moyenne $e^{\theta + \omega^2/2}$. Et le **CV** vaut 31 %, quand $\omega$ vaut 0,9. Le tableau de résultats affichera 0,9 ; la population, elle, a 31 % de variabilité. Les deux nombres n'ont aucun rapport, et c'est `logitNormInfo()` qui fait le pont.

:::key
Borner un paramètre ne le rend pas **identifiable**. $F$ ne s'estime que contre une référence IV — ou, pour une biodisponibilité relative, contre le bras de référence. Sur des données orales seules, ce que vous estimez est $CL/F$ et $V/F$. Déclarer un $F$ borné sur ce jeu de données vous donne un paramètre que les données n'informent pas : `expit()` le maintiendra proprement dans ]0,1[ pendant qu'il dérive là où la valeur initiale l'a laissé. La borne tient, le paramètre ne veut rien dire. Une transformation empêche l'absurdité, elle ne crée pas l'information.
:::

**L'auto-initialisation.** babelmixr2 branche PKNCA sur le modèle : une analyse non compartimentale tourne, et ses résultats reviennent sous forme de valeurs initiales.

```r
mod_init <- nlmixr2(mod, dat, est = "pknca",
                    control = pkncaControl(concu = "ng/mL", doseu = "mg",
                                           timeu = "hr", volumeu = "L"))
```

L'objet rendu est **le même modèle, avec un bloc `ini` mis à jour**. Le plus instructif est la liste des unités : une $CL$ ou un $V$ tirés d'une NCA ne valent que si les unités sont justes, et les déclarer est ce qui rend la traduction possible. C'est aussi la faille — annoncez des ng/mL sur des données en µg/L et la fonction vous rendra des valeurs initiales fausses avec le même aplomb.

:::note
Réf. : projet nlmixr2 et documentation rxode2 (Fidler, Wang, Hallow et coll.) pour la syntaxe, les fonctions `logit`/`expit`/`probitInv`/`logitNormInfo` et le comportement de l'outil ; Fidler et coll., *CPT Pharmacometrics Syst. Pharmacol.* pour le projet nlmixr et sa comparaison aux moteurs établis ; Wang, Hallow & James, *CPT Pharmacometrics Syst. Pharmacol.* 2016 pour le moteur d'ODE et la simulation ; FDA, *Population Pharmacokinetics — Guidance for Industry* (2022) pour la déclaration du logiciel et de sa version dans un dossier.
:::
<!-- /step -->

<!-- step:title="Exemple concret" viz="MultiDose" -->
Un médicament IV, monocompartimental, 40 sujets, 8 prélèvements chacun — 320 observations. Trois covariables à trier sur la clairance.

```r
m0 <- function() {
  ini({
    tcl <- log(3.4)
    tv  <- log(45)
    eta.cl ~ 0.0784
    eta.v  ~ 0.0441
    prop.sd <- 0.14
  })
  model({
    cl <- exp(tcl + eta.cl)
    v  <- exp(tv + eta.v)
    d/dt(centr) = -(cl/v) * centr
    cp = centr / v
    cp ~ prop(prop.sd)
  })
}

mods <- list(
  base = m0,
  wt   = m0 |> model(cl <- exp(tcl + eta.cl + b_wt * log(WT/70)))   |> ini(b_wt = 0.75),
  crcl = m0 |> model(cl <- exp(tcl + eta.cl + b_cr * log(CRCL/90))) |> ini(b_cr = 0.5),
  both = m0 |> model(cl <- exp(tcl + eta.cl + b_wt * log(WT/70) +
                                              b_cr * log(CRCL/90))) |> ini(b_wt = 0.75, b_cr = 0.5)
)

fits <- lapply(mods, function(m)
  nlmixr2(m, dat, est = "saem", control = saemControl(print = 0, seed = 99)))

do.call(rbind, lapply(fits, function(f) f$objDf))
```

Le `model()` piped remplace la ligne qui définit `cl` ; le `ini()` qui suit déclare le nouveau paramètre. Quatre modèles, une liste, un `lapply` :

```
        OFV     npar    BIC
base   1284.6     6    1319.2
wt     1272.1     7    1312.5
crcl   1269.8     7    1310.2
both   1266.9     8    1313.0
```

La lecture est nette. CRCL seule contre le modèle de base : $\Delta OFV = 14{,}8$ à 1 ddl, soit $p = 1{,}2 \times 10^{-4}$. Ajouter le poids **par-dessus** CRCL : $\Delta OFV = 2{,}9$ à 1 ddl, en dessous du seuil de 3,84, soit $p = 0{,}09$ — et le BIC se dégrade (1313,0 contre 1310,2). On garde CRCL, on laisse le poids.

L'intérêt n'est pas la vitesse. C'est que ce tableau **est du code**. Relancez-le sur un nouvel extrait de données et tous les nombres se mettent à jour, ou aucun. Voilà ce que « tout est dans R » achète réellement : pas du confort, une traçabilité qui s'exécute.

**Puis on simule.** Deux schémas à dose journalière égale : 100 mg toutes les 12 h contre 200 mg toutes les 24 h. Avec $CL = 3{,}4$ L/h chez un sujet à 90 mL/min :

$$ C_{\text{ss,moy}} = \frac{D}{CL \times \tau} $$

- q12h : $100/(3{,}4 \times 12) = 2{,}45$ mg/L
- q24h : $200/(3{,}4 \times 24) = 2{,}45$ mg/L

Identiques, par construction. La moyenne se règle sur un coin de table. Les pics aussi, tant qu'on reste sur le sujet typique — avec $k = CL/V = 3{,}4/45 = 0{,}0756$ h⁻¹ :

$$ C_{\max,\text{ss}} = \frac{D/V}{1 - e^{-k\tau}} $$

- q12h : $(100/45)/(1 - e^{-0{,}907}) = 3{,}73$ mg/L
- q24h : $(200/45)/(1 - e^{-1{,}814}) = 5{,}31$ mg/L

Posons un seuil de toxicité à **6 mg/L**. Les deux schémas passent. Le patient typique est tranquille dans les deux cas.

Maintenant, la population :

```r
pop <- data.frame(id = 1:5000, CRCL = rlnorm(5000, log(90), 0.35))
ev  <- et(amt = 200, cmt = "centr", ii = 24, until = 24*20) |>
       et(time = seq(24*18, 24*20, by = 0.25)) |>
       et(id = 1:5000)

sim <- rxSolve(fits$crcl, ev, iCov = pop,
               nStud = 200, thetaMat = fits$crcl$thetaMat,
               dfSub = 40, dfObs = 320)
```

**3,5 % des sujets dépassent 6 mg/L sous q12h. 32 % sous q24h.**

Le calcul sur la valeur typique déclarait les deux schémas sûrs ; la simulation de population en met près d'un tiers au-dessus de la ligne. Cet écart est la raison d'être entière de la simulation de population — et il coûte trois lignes, parce que `rxSolve()` prend l'objet de fit lui-même.

:::key
`rxSolve(fit, ...)` simule **l'objet qui a été estimé** : même classe de garantie que Simulx relisant le fichier mlxtran. Pas de réimplémentation, donc pas de divergence silencieuse entre le code d'estimation et le code de simulation.
Mais regardez ce qui n'est **pas** dans le fit : `iCov`. La distribution des CRCL de votre population virtuelle est une hypothèse que vous écrivez. Tirer les CRCL log-normalement autour de 90 mL/min décrit une population de phase 1, pas les insuffisants rénaux pour lesquels la covariable a été mise dans le modèle. Cette ligne-là travaille autant que le modèle, et rien ne la relit.
:::

`thetaMat` propage l'incertitude sur les effets fixes, `dfSub` et `dfObs` celle sur $\omega$ et $\sigma$. Sans eux, le 32 % se rapporte comme s'il était connu exactement.

**Les sorties.** babelmixr2 ne fait pas que traduire :

```r
fit_nm  <- nlmixr2(mod_crcl, dat, est = "nonmem",  control = nonmemControl())
fit_mlx <- nlmixr2(mod_crcl, dat, est = "monolix", control = monolixControl())
```

Il écrit le control stream ou le projet mlxtran, lance le moteur, puis **réimporte les résultats en objet de fit nlmixr2**. `fit_nm$objf` répond, `vpcPlot(fit_nm)` trace : le même code de diagnostic tourne sur les trois moteurs. C'est moins un traducteur qu'un **banc d'essai** — une définition de modèle, trois moteurs, des diagnostics comparables. Dans l'autre sens, `nonmem2rx` et `monolix2rx` relisent des runs existants vers rxode2.
<!-- /step -->

<!-- step:title="Piège fréquent" -->
**Le piège du piping.** Oubliez la ligne `ini()` :

```r
m_crcl <- m0 |> model(cl <- exp(tcl + eta.cl + b_cr * log(CRCL/90)))
```

nlmixr2 affiche :

```
i add covariate `b_cr`
i add covariate `CRCL`
```

Un message d'**information**. Pas un avertissement. Dans un `lapply` sur trente modèles avec `print = 0`, il défile. Puis le run s'arrête :

```
Assertion on 'names(data)' failed: Names must include the elements
{'TIME','b_cr','WT'}, but is missing elements {'b_cr'}.
```

:::pitfall
L'erreur accuse votre jeu de données de manquer une colonne. Votre jeu de données va très bien. Dans un bloc `model()` pipé, **tout nom nu qui n'est pas déjà un paramètre est réputé venir des données** — c'est ainsi que `CRCL` est reconnue, et c'est pourquoi `b_cr` subit le même sort. C'est la ligne `ini()` qui le promeut en paramètre estimé. Même mécanisme, même piège pour une faute de frappe : pipez `b_wt` dans le modèle et écrivez `ini(bwt = 0.75)`, vous obtenez un paramètre orphelin et une colonne fantôme. Lisez les messages `i` — ils sont informatifs, mais ce sont les seuls endroits où la faute apparaît.
:::

**La reproductibilité, mais pas celle que vous croyez.** Tout est dans R, donc tout est reproductible. À moitié vrai, et c'est la moitié fausse qui est intéressante.

`saemControl()` part d'une **graine fixe, 99, par défaut**. Votre run SAEM se reproduit donc à la dernière décimale, à tous les coups — ce qui est précisément ce qui fait oublier que le SAEM est un algorithme *stochastique* et que vous regardez **une** réalisation. Une graine fixe donne de la reproductibilité, pas de la robustesse. Relancez sur quelques graines avant de croire un optimum.

Quant aux moteurs parallèles de rxode2 : tant que vous n'appelez pas `rxSetSeed()`, leur graine est tirée d'un nombre uniforme pris sur l'état de la graine R ordinaire. Votre script se reproduit quand même. Mais sur un grand nombre d'appels de simulation, ce tirage peut tomber deux fois sur la même graine de moteur — c'est le paradoxe des anniversaires — et deux réplicats « indépendants » partagent alors le même flux aléatoire. La panne n'est pas la non-reproductibilité : c'est une **corrélation silencieuse entre des runs que vous croyez indépendants**, et elle devient d'autant plus probable qu'on boucle davantage. C'est-à-dire exactement le mode de travail que ce chapitre vous vend.

```r
rxSetSeed(1234)   # graine des moteurs paralleles rxode2
set.seed(1234)    # graine R
fit <- nlmixr2(mod, dat, est = "saem", control = saemControl(seed = 1234))
```

Trois générateurs, trois graines. Aucune n'est celle de l'autre.

:::pitfall
`renv::snapshot()` fige les paquets. Il ne fige ni la chaîne de compilation C avec laquelle rxode2 compile votre modèle, ni votre BLAS. Consignez `sessionInfo()` et la plateforme à côté des résultats. « Tout est dans R » veut aussi dire que tout bouge : nlmixr2 et rxode2 sont activement développés, et développement actif signifie dérive de versions.
:::

**Les limites, honnêtement.** `est = "nonmem"` ne blanchit rien. babelmixr2 a besoin d'une installation de NONMEM sous licence — il ne vous en offre pas une. Le control stream produit est à vous : à relire, à défendre. Si vous ne savez pas expliquer une de ses lignes, vous ne pouvez pas la soumettre. Et l'OFV que NONMEM renvoie ne se compare pas à votre OFV SAEM : méthodes différentes, piège identique à toute comparaison inter-outils.

Sur le terrain réglementaire, soyons précis plutôt que polémiques. **Aucune agence ne certifie un logiciel de modélisation.** La guidance popPK de la FDA demande quel logiciel et quelle version ont servi, et attend une analyse documentée et reproductible. nlmixr2 n'est donc pas interdit, et les comparaisons inter-outils trouvent des estimations qui s'accordent avec NONMEM et Monolix. La friction est **organisationnelle, pas scientifique** : les procédures du CRO, la qualification d'installation, les habitudes du relecteur et la personne qui maintiendra l'analyse dans quatre ans sont toutes bâties autour de NONMEM. C'est un coût réel, et « mais les estimations concordent » n'y répond pas.

La maturité et la communauté suivent la même logique. Quand un message d'erreur NONMEM vous bloque, quinze ans d'archives de liste de diffusion l'ont probablement déjà vu. Sur un cas limite nlmixr2, vous serez peut-être le premier — et la réponse, quand elle viendra, viendra peut-être de la personne qui a écrit le code : c'est à la fois mieux et moins tenable à l'échelle. Le risque scientifique est faible ; le risque opérationnel est réel. C'est là-dessus qu'on décide, pas sur le prix de la licence.
<!-- /step -->

<!-- step:title="À retenir" -->
- nlmixr2 n'a **pas de mot-clé de distribution** : la fonction de lien s'écrit dans le bloc `model`. `exp()` pour $]0,+\infty[$, `expit()` ou `probitInv()` pour $]0,1[$, `expit(x, min, max)` pour un intervalle quelconque, rien du tout pour une grandeur qui peut être négative.
- Le bloc `ini` porte les valeurs **sur l'échelle de la transformation** : `tf <- logit(0.62)` range 0,4895. Écrire `tf <- 0.62` démarre en réalité à $F = 0{,}65$.
- Un $\omega$ borné ne se lit pas tel quel : $\omega = 0{,}9$ en logit autour de 0,62 donne une **médiane de 0,62, une moyenne de 0,603 et un CV de 31 %**. `logitNormInfo()` fait le calcul — utilisez-la plutôt que de rapporter $\omega$.
- Borner n'est pas identifier. Sur des données orales seules, $F$ n'est pas estimable : `expit()` le gardera dans ]0,1[ pendant qu'il dérive.
- Le modèle est un **objet R** : `|> model()` et `|> ini()` construisent des variantes, un `lapply` les estime, `$objDf` les compare. Le tableau de sélection devient du code qu'on relance.
- Attention au piping : un nom nu non déclaré dans `ini()` devient une **covariable**, donc une colonne attendue dans les données. L'erreur accusera votre jeu de données d'une faute commise dans le modèle.
- `rxSolve(fit, ...)` simule l'objet estimé — pas de réimplémentation. Mais `iCov`, la population virtuelle, est une hypothèse que vous écrivez ; `thetaMat`/`dfSub`/`dfObs` sont ce qui propage l'incertitude d'estimation.
- Graines : le SAEM démarre à 99 par défaut (reproductible n'est pas robuste — variez `seed`), rxode2 veut `rxSetSeed()` pour éviter des collisions de graines entre réplicats supposés indépendants.
- **babelmixr2** est un banc d'essai : un modèle, trois moteurs, des diagnostics communs. Il ne fournit ni licence NONMEM, ni OFV comparable d'une méthode à l'autre, ni dispense de relire le control stream.
- Les limites sont opérationnelles, pas scientifiques : aucune agence ne certifie un logiciel, mais les procédures, les outils et les compétences des équipes réglementaires sont bâtis autour de NONMEM.
<!-- /step -->
