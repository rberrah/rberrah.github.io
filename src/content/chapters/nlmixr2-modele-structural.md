---
id: "nlmixr2-modele-structural"
slug: "nlmixr2-modele-structural"
title: "nlmixr2 — le modèle structural en R"
description: "La fonction R à deux blocs : ini({}) pour les nombres, model({}) pour les équations, EDO ou linCmt(), et la ligne cp ~ pour l'observation."
summary: "Écrire le modèle structural en nlmixr2 : ini contre model, le moteur rxode2, d/dt() contre linCmt(), et le tilde qui change de sens selon le bloc."
track: "nlmixr2"
order: 231
duration: "10 min"
level: "intermediate"
tags: ["nlmixr2", "rxode2", "structural-model", "ode"]
prerequisites: ["tools-nlmixr2"]
glossary: []
slides: []
sources: ["nlmixr2", "fidler-nlmixr", "wang-rxode"]
reviewed_on: "2026-07-14"
quiz:
  - prompt: "Dans le bloc ini, la ligne eta.cl ~ 0.09 déclare..."
    options:
      - "un effet aléatoire sur CL, dont la valeur initiale 0,09 est une variance, soit un CV d'environ 31 %"
      - "un effet aléatoire sur CL, dont la valeur initiale 0,09 est un écart-type, soit un CV d'environ 9 %"
      - "un paramètre de population initialisé à 0,09, que le modèle estimera comme une valeur typique"
    correct: 0
  - prompt: "linCmt() sélectionne le modèle de PK..."
    options:
      - "d'après les noms des paramètres définis dans le bloc model : ka, cl et v donnent un 1 compartiment oral"
      - "d'après un numéro de modèle passé en argument, exactement sur le principe des routines ADVAN de NONMEM"
      - "d'après le nombre de lignes d/dt() présentes dans le bloc model juste avant l'appel de linCmt()"
    correct: 0
  - prompt: "Dans le bloc model, la ligne cp ~ prop(prop.sd) signifie que..."
    options:
      - "cp est la prédiction confrontée aux observations, avec une erreur proportionnelle d'écart-type prop.sd"
      - "cp suit une loi de probabilité proportionnelle, dont le paramètre prop.sd est la variance à estimer"
      - "cp est un paramètre aléatoire supplémentaire, dont prop.sd fixe la variabilité inter-individuelle"
    correct: 0
---

<!-- step:title="Pourquoi ce chapitre" -->
Dans Monolix vous écrivez du mlxtran, dans NONMEM un control stream : deux langages qui ne servent qu'à ça, et deux fichiers que R ne sait pas lire. Dans nlmixr2, le modèle est une **fonction R**. Il tient dans le script, à côté de votre `read.csv()` ; vous le passez en argument, vous le rangez dans une liste, vous le versionnez avec le reste de l'analyse. La frontière entre le modèle et le code qui l'entoure disparaît.

Cette fonction a une forme imposée : deux blocs, `ini({...})` pour les nombres et `model({...})` pour les équations. Ce chapitre montre comment on y écrit un 1 compartiment oral — d'abord en équations différentielles, puis en `linCmt()` — et pourquoi le bloc `model` ressemble à du R sans tout à fait en être.
<!-- /step -->

<!-- step:title="Intuition" viz="OralAbsorptionExplorer" -->
La vraie question, quand on découvre un outil, est de savoir **où il coupe**. nlmixr2 ne coupe pas là où Monolix coupe.

- `ini({...})` ne contient que des **nombres** : où part la recherche, et quel paramètre est aléatoire. Aucune équation n'y a sa place.
- `model({...})` contient **toutes les équations** : la valeur typique, l'effet aléatoire, les EDO, la concentration, et la ligne d'observation.

La conséquence est immédiate et déroute tous ceux qui arrivent de Monolix : `cl <- exp(tcl + eta.cl)` s'écrit dans `model`, à trois lignes des `d/dt()`. La variabilité inter-individuelle — de la statistique pure — vit dans le même bloc que la structure. Il n'y a pas de `[INDIVIDUAL]` à chercher : la loi lognormale s'écrit à la main. C'est le découpage de NONMEM (`$THETA`/`$OMEGA` d'un côté, `$PK`/`$DES` de l'autre), transposé en R.

:::key
Le corps de la fonction n'est **jamais exécuté** comme du R ordinaire. nlmixr2 en lit le texte et en construit un objet de modèle. `ini` et `model` ne calculent rien : ce sont des marqueurs qui délimitent deux zones à analyser. D'où le détail qui surprend au premier run : on passe `oral1cpt` à `nlmixr2()` — le nom de la fonction, **sans parenthèses**.
:::
<!-- /step -->

<!-- step:title="La formule décortiquée" -->
Le 1 compartiment oral tient en deux quantités — le dépôt $A_d$, le central $A_c$ — et une division :

$$ \frac{dA_d}{dt} = -k_a A_d, \qquad \frac{dA_c}{dt} = k_a A_d - \frac{Cl}{V} A_c, \qquad C = \frac{A_c}{V} $$

**Version EDO.** Le système câblé à la main :

```r
oral1cpt <- function() {
  ini({
    tka <- log(0.9)      # <- : parametre de POPULATION. ka = 0.9 /h, pose sur
    tcl <- log(6.0)      #      l'echelle log pour garantir une valeur positive
    tv  <- log(45)
    eta.cl ~ 0.09        # ~  : effet ALEATOIRE ; 0.09 est une VARIANCE
    eta.v  ~ 0.04
    prop.sd <- 0.15      # <- : erreur residuelle, sur l'echelle ECART-TYPE
  })
  model({
    ka <- exp(tka)             # pas d'eta ici : ka est suppose sans IIV
    cl <- exp(tcl + eta.cl)    # la loi lognormale s'ecrit A LA MAIN
    v  <- exp(tv  + eta.v)

    d/dt(depot)   = -ka * depot                     # declarer d/dt CREE le compartiment
    d/dt(central) =  ka * depot - (cl/v) * central  # les EDO portent des QUANTITES

    cp = central / v           # la division par V est A VOTRE charge
    cp ~ prop(prop.sd)         # ligne d'OBSERVATION : cp est confronte a DV
  })
}
```

Ligne à ligne :

- Dans `ini`, `<-` déclare un paramètre de population, `~` déclare un effet aléatoire **et sa variance**. Il n'y a pas de matrice OMEGA à écrire : elle se déduit des lignes en `~`. Pour des etas corrélés, on donne le triangle inférieur : `eta.cl + eta.v ~ c(0.09, 0.03, 0.04)`.
- Toujours dans `ini`, `tcl <- c(-Inf, log(6.0), Inf)` fixe borne basse, valeur initiale et borne haute ; `label("Clairance (L/h)")` nomme la ligne dans la table de sortie ; `fix()` gèle le paramètre.
- Dans `model`, écrire `d/dt(depot)` **suffit** à créer le compartiment `depot` — il n'y a rien à déclarer ailleurs. Les compartiments sont numérotés dans leur **ordre d'apparition**, ce qui rend un `cmt` numérique fragile : réordonnez deux lignes et le jeu de données ne dose plus au bon endroit. Utilisez les **noms** dans la colonne `cmt`.
- `cp` n'est pas un mot-clé : c'est le nom que **vous** donnez à la prédiction.

**Version linCmt().** Le bloc `ini` ne change pas ; seul `model` maigrit :

```r
  model({
    ka <- exp(tka)
    cl <- exp(tcl + eta.cl)
    v  <- exp(tv  + eta.v)
    cp = linCmt()            # ka + cl + v en portee -> 1 cpt oral, rend une CONCENTRATION
    cp ~ prop(prop.sd)
  })
```

:::howto
`linCmt()` ne prend **aucun argument** : il regarde les paramètres que vous venez de définir et en déduit le modèle. `cl` et `v` seuls donnent un 1 compartiment IV ; ajoutez `ka` et vous obtenez l'absorption d'ordre 1 ; ajoutez `q` et `vp` et vous passez à deux compartiments. C'est l'idée de `pkmodel()` en mlxtran — le modèle choisi par les **noms** — à une différence près : ici les noms sont ceux de vos variables, pas d'arguments d'appel. Corollaire immédiat : baptisez votre volume `vd` et `linCmt()` ne reconnaît plus rien. Il route aussi la dose et rend directement une concentration, alors que la version EDO vous laisse les deux à faire. En nommant vos compartiments `depot` et `central`, vous gardez le même jeu de données pour les deux écritures.
:::

:::key
Le tilde fait **trois métiers** selon l'endroit où il tombe. Dans `ini`, `eta.cl ~ 0.09` déclare un effet aléatoire et sa variance. Dans `model`, sur la dernière ligne, `cp ~ prop(prop.sd)` déclare le modèle d'observation. Dans `model`, sur une ligne ordinaire, `ke ~ cl/v` calcule `ke` mais le **tient hors** de la table de sortie — la syntaxe rxode2 s'en sert pour ne pas noyer le fit sous les variables intermédiaires. Un seul caractère, trois sens : lisez toujours le tilde en fonction de son bloc.
:::

:::note
Réf. : documentation nlmixr2 et rxode2 pour la syntaxe des blocs `ini`/`model` et de `linCmt()` ; Fidler *et al.*, *CPT Pharmacometrics Syst Pharmacol* 2019 pour la spécification du modèle par fonction R ; Wang *et al.*, *CPT Pharmacometrics Syst Pharmacol* 2016 pour le moteur d'EDO (RxODE/rxode2).
:::
<!-- /step -->

<!-- step:title="Exemple concret" viz="OralAbsorptionExplorer" -->
Le modèle écrit, le reste du script est du R banal :

```r
library(nlmixr2)

dat <- read.csv("pk_oral.csv")     # ID TIME AMT DV EVID CMT ; dose 200 mg dans depot

fit <- nlmixr2(oral1cpt, dat, est = "saem",     # oral1cpt SANS parentheses
               control = saemControl(nBurn = 300, nEm = 400, seed = 42))

fit$parFixed    # table des parametres de population, RSE, CV des etas
head(fit)       # data.frame : ID TIME DV PRED IPRED CWRES eta.cl eta.v cl v cp ...
```

Avant de lire quoi que ce soit, vérifiez que la machine fait ce que vous croyez. Pour un sujet typique — **dose orale 200 mg**, $k_a = 0{,}9$ h⁻¹, $V = 45$ L, $Cl = 6{,}0$ L/h, $F = 1$ — la constante d'élimination vaut $k_e = Cl/V \approx 0{,}133$ h⁻¹, d'où un rapport $k_a/k_e = 6{,}75$ et un pic à

$$ t_{max} = \frac{\ln(k_a/k_e)}{k_a - k_e} = \frac{1{,}909}{0{,}767} \approx 2{,}49 \text{ h} $$

Comme $C_{max} = \frac{F \cdot D}{V}e^{-k_e t_{max}}$ pour ce modèle, on attend $C_{max} \approx 4{,}44 \times e^{-0{,}332} \approx 3{,}19$ mg/L, pour une exposition $AUC = F \cdot D / Cl \approx 33{,}3$ mg·h/L. Trois nombres calculés en trente secondes, qui disqualifient un modèle mal câblé avant qu'il ne vous coûte une demi-journée de diagnostics.

`fit` n'est pas un fichier de sortie à ouvrir dans un éditeur : c'est un **data.frame augmenté**, une ligne par observation, avec `PRED`, `IPRED`, `CWRES` et les etas déjà en colonnes, plus des tables (`fit$parFixed`, `fit$omega`) qui partent directement dans `ggplot2`. C'est là que se paie le choix du modèle-objet.

:::recall
Ne recopiez jamais `oral1cpt` pour en faire une variante. nlmixr2 modifie un modèle par **enchaînement** : `oral1cpt %>% ini(tka = log(1.4))` change une valeur initiale, et `oral1cpt %>% model(cl <- exp(tcl + eta.cl + b.wt*log(WT/70))) %>% ini(b.wt = 0.75)` remplace une équation et déclare le paramètre qu'elle introduit. Vous obtenez un **nouvel** objet, l'original reste intact, et l'écart entre deux modèles tient sur une ligne de votre script — pas dans le diff de deux fichiers texte de quarante lignes. C'est le bénéfice concret de « tout est du R ».
:::
<!-- /step -->

<!-- step:title="Piège fréquent" -->
Les fautes de syntaxe, dans nlmixr2, sont bruyantes : un paramètre déclaré dans `ini` mais absent de `model` fait échouer l'analyse avant même le premier run. Le piège coûteux est ailleurs, et il est muet.

:::pitfall
`eta.cl <- 0.09` au lieu de `eta.cl ~ 0.09`. Un caractère. Le nom commence toujours par `eta.`, `model` contient toujours `cl <- exp(tcl + eta.cl)`, tout compile, le run part. Mais `eta.cl` est devenu un **paramètre de population** : la clairance n'a plus d'IIV, tous les sujets partagent la même valeur, et `tcl` et `eta.cl` n'existent plus que par leur somme — deux nombres pour une seule information. nlmixr2 ne peut pas deviner votre intention : le préfixe `eta.` est une convention de lecture, **pas un mot-clé**. Le seul indice est discret : la table des effets aléatoires a une ligne de moins que ce que vous aviez en tête.
:::

Le symptôme, lui, ne ressemble pas du tout à la cause. Ce que vous verrez, si vous voyez quelque chose, c'est une étape de covariance qui échoue ou deux paramètres de population aux RSE aberrantes — la signature de leur confusion. Vous partirez chercher un problème de données ou d'identifiabilité. L'erreur est un tilde.

Le même bloc `ini` cache une seconde asymétrie, purement de lecture celle-là. `eta.cl ~ 0.09` donne une **variance** : l'écart-type vaut 0,3 et le CV lognormal environ 31 %, pas 9 %. Deux lignes plus bas, `prop.sd <- 0.15` donne un **écart-type** : 15 % d'erreur proportionnelle, là où NONMEM vous ferait écrire 0,0225 dans `$SIGMA`. Même bloc, même syntaxe, deux échelles. D'où le double réflexe : convertir avant de recopier une valeur initiale trouvée dans un run NONMEM, et convertir avant d'annoncer une IIV dans un rapport.
<!-- /step -->

<!-- step:title="À retenir" -->
- Le modèle est une fonction R à deux blocs : `ini({...})` ne contient que des nombres, `model({...})` que des équations. nlmixr2 **lit** le corps de la fonction, il ne l'exécute pas — d'où `nlmixr2(oral1cpt, ...)`, sans parenthèses.
- Le découpage est celui de NONMEM, pas celui de Monolix : `cl <- exp(tcl + eta.cl)` s'écrit à la main, dans le même bloc que les EDO. Aucun `[INDIVIDUAL]` à chercher.
- Dans `ini`, `<-` = paramètre de population, `~` = effet aléatoire et sa **variance** ; l'erreur résiduelle, elle, se déclare en **écart-type**.
- `d/dt(depot)` crée le compartiment par sa seule déclaration, les numéros suivent l'ordre d'apparition — dosez par **nom** — et la division par $V$ est à votre charge.
- `linCmt()` ne prend aucun argument : il choisit le modèle d'après les **noms** des paramètres en portée (`ka, cl, v` = 1 cpt oral), route la dose et rend une concentration.
- `cp ~ prop(prop.sd)` est la ligne d'observation ; le tilde change de sens selon son bloc.
- Un `<-` mis à la place d'un `~` dans `ini` supprime une IIV sans rien casser — et le symptôme désigne un autre coupable.
<!-- /step -->
