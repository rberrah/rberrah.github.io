---
id: "monolix-avance"
slug: "monolix-avance"
title: "Monolix — pour aller plus loin"
description: "Distributions bornées logit et probit, auto-initialisation, tests automatiques de covariables, MonolixSuite et export NONMEM."
summary: "Ce qui sépare un modèle qui tourne d'une analyse qui tient : paramètres bornés, initialisation, tri des covariables, Simulx et le passage à NONMEM."
track: "monolix"
order: 225
duration: "10 min"
level: "intermediate"
tags: ["monolix", "mlxtran", "logit", "simulx"]
prerequisites: ["tools-monolix"]
glossary: []
slides: []
sources: ["monolix", "lavielle", "jonsson-karlsson-scm", "ribbing-selection-bias"]
reviewed_on: "2026-07-14"
quiz:
  - prompt: "Pour un paramètre déclaré logitNormal, le omega estimé par Monolix représente..."
    options:
      - "l'écart-type de l'effet aléatoire sur l'échelle logit ; il ne se lit pas comme un CV et ne se compare pas à celui d'une logNormale"
      - "le coefficient de variation du paramètre entre individus, comme pour une logNormale : omega = 0,85 signifie donc 85 % de variabilité"
      - "l'écart-type du paramètre sur son échelle naturelle, borné lui aussi dans ]0,1[ par construction de la distribution"
    correct: 0
  - prompt: "L'export d'un projet Monolix vers NONMEM produit..."
    options:
      - "un brouillon de control stream à relire et à relancer : la traduction porte sur la syntaxe, pas sur l'algorithme, donc les estimations diffèrent"
      - "une reproduction fidèle du run Monolix : le modèle et les données étant identiques, les estimations et l'OFV se retrouvent à l'identique après relance"
      - "une simple conversion du jeu de données au format NONMEM, tout le modèle restant à réécrire entièrement à la main dans le control stream"
    correct: 0
  - prompt: "L'auto-initialisation des paramètres dans Monolix..."
    options:
      - "propose un point de départ pour les paramètres de structure, mais ne valide ni le modèle structural ni les unités du jeu de données"
      - "estime les paramètres de population par une méthode rapide, que le SAEM se contente ensuite d'affiner à la marge sans les remettre en cause"
      - "garantit que le SAEM démarre dans le bon bassin d'attraction et met le run à l'abri des optimums locaux dès la première itération"
    correct: 0
---

<!-- step:title="Pourquoi ce chapitre" -->
Les chapitres précédents vous laissent avec un modèle qui **tourne** : une structure dans `[LONGITUDINAL]`, des paramètres log-normaux, un SAEM qui converge. C'est le début d'une analyse, pas son terme.

Trois murs arrivent vite. Une **biodisponibilité** : déclarée log-normale, elle dépassera 1, et Monolix simulera sans broncher des individus qui absorbent 150 % de leur dose. Une **liste de covariables** à trier, sans lancer trente projets à la main. Et, le jour où le dossier part à l'agence, un **control stream NONMEM**.

Monolix répond aux trois. À chaque fois, la réponse est plus subtile que le bouton qui la déclenche.
<!-- /step -->

<!-- step:title="Intuition" viz="03_PopulationDistrib" -->
Dans le bloc `[INDIVIDUAL]`, le mot-clé `distribution=` n'est pas une étiquette de présentation : c'est le choix d'une **fonction de lien**.

Monolix impose une seule chose, la même que NONMEM : l'effet aléatoire $\eta_i$ est tiré d'une normale centrée. Or une normale vit sur toute la droite réelle, de $-\infty$ à $+\infty$. Une clairance, elle, est positive ; une biodisponibilité vit entre 0 et 1 ; une fraction de répondeurs aussi. Il faut donc une fonction qui envoie la droite réelle **exactement** sur le domaine du paramètre — ni plus large, ni plus étroit.

C'est tout ce que fait `distribution=`. `logNormal` choisit l'exponentielle et couvre $]0, +\infty[$. `logitNormal` choisit la logistique et couvre $]0, 1[$. `probitNormal` couvre le même intervalle par un autre chemin, la fonction de répartition normale. Le domaine du paramètre commande ; l'habitude, non.

:::key
Un paramètre borné ne se traite pas en bridant l'ETA — c'est impossible, il est normal par construction — mais en **changeant la fonction**. Positif sans plafond : `logNormal`. Fraction dans ]0,1[ : `logitNormal` ou `probitNormal`. Grandeur qui peut légitimement être négative, une pente d'effet, une dérive de ligne de base : `normal`, et c'est le bon choix, pas un pis-aller.
:::

Cette idée a une conséquence que tout le reste du chapitre ne fera que décliner : ce que Monolix vous rapporte sur un paramètre — son $\omega$, ses coefficients de covariables, sa traduction en NONMEM — vit sur l'**échelle de la fonction de lien**, jamais sur celle du paramètre.
<!-- /step -->

<!-- step:title="La formule décortiquée" viz="12_VariabilitySandbox" -->
Un seul modèle gouverne tout le bloc `[INDIVIDUAL]` :

$$ h(\psi_i) = h(\psi_{\text{pop}}) + \sum_k \beta_k\, c_{ik} + \eta_i, \qquad \eta_i \sim \mathcal{N}(0, \omega^2) $$

Le paramètre individuel $\psi_i$, une fois passé dans $h$, s'écrit comme une valeur typique plus des effets de covariables plus un effet aléatoire normal. Changer de distribution, c'est **changer $h$** — rien d'autre :

- `normal` : $h(x) = x$, domaine $\mathbb{R}$ ;
- `logNormal` : $h(x) = \log x$, domaine $]0, +\infty[$ ;
- `logitNormal` : $h(x) = \log\frac{x}{1-x}$, domaine $]0, 1[$ ;
- `probitNormal` : $h(x) = \Phi^{-1}(x)$, domaine $]0, 1[$.

Pour la logit, on revient dans l'intervalle par la réciproque :

$$ \psi_i = \frac{1}{1 + e^{-h(\psi_i)}} $$

Quelle que soit la valeur tirée pour $\eta_i$ — $-4$, $+4$ — le paramètre reste dans ses bornes. C'est une garantie **structurelle**, pas une contrainte numérique qu'un optimiseur pourrait violer.

```
[INDIVIDUAL]
input = {F_pop, omega_F, Cl_pop, omega_Cl, V_pop, omega_V}

DEFINITION:
F  = {distribution=logitNormal, typical=F_pop,  sd=omega_F}   ; borne dans ]0,1[
Cl = {distribution=logNormal,   typical=Cl_pop, sd=omega_Cl}  ; positif, sans plafond
V  = {distribution=logNormal,   typical=V_pop,  sd=omega_V}
```

Attention à la lecture : `typical=F_pop` se déclare et se rapporte sur l'échelle **naturelle** (Monolix affiche 0,70), tandis que `sd=omega_F` porte sur l'échelle **logit**. Les deux nombres de la même ligne ne vivent pas au même endroit.

La logit ne se limite pas à ]0,1[. Avec des bornes explicites, elle s'étend à n'importe quel intervalle — un $E_{max}$ qui ne peut pas dépasser 100 % d'inhibition, un coefficient de Hill entre 1 et 5 :

```
Emax = {distribution=logitNormal, min=0, max=100, typical=Emax_pop, sd=omega_E}
```

La transformation devient alors $h(\psi) = \log\frac{\psi - \psi_{\min}}{\psi_{\max} - \psi}$, qui redonne bien la logit usuelle pour $\min = 0$ et $\max = 1$.

**Les covariables passent par la même porte.** Elles s'ajoutent sur l'échelle de $h$, pas sur celle du paramètre :

```
[COVARIATE]
input = {WT}
EQUATION:
lWT = log(WT/70)                      ; centrage sur 70 kg

[INDIVIDUAL]
input = {Cl_pop, omega_Cl, beta_Cl_lWT, lWT}
DEFINITION:
Cl = {distribution=logNormal, typical=Cl_pop,
      covariate=lWT, coefficient=beta_Cl_lWT, sd=omega_Cl}
```

Ici $\log Cl_i = \log Cl_{\text{pop}} + \beta \log(WT/70) + \eta_i$ : $\beta$ est l'exposant allométrique, et l'écrire ainsi le rend directement testable. Mais si la même mécanique s'applique à une `logitNormal`, alors $\beta$ agit sur $\text{logit}(F)$ — ce n'est **pas** un effet sur $F$, et il ne s'interprète pas en pourcentage de $F$.

**Les tests automatiques.** Monolix rapporte, sans run supplémentaire, deux familles de tests. Sur les covariables **déjà dans le modèle**, un test de Wald sur chaque $\beta$ ($H_0 : \beta = 0$). Sur les covariables **absentes du modèle**, des tests de corrélation entre les effets aléatoires et chaque covariable candidate : corrélation de Pearson pour une covariable continue, analyse de variance pour une catégorielle. Un p petit signale un $\eta$ qui garde une structure que le modèle n'explique pas — donc une covariable qui vaut le coup d'être essayée. La procédure automatique (COSSAC) enchaîne ces tests pour construire le modèle de covariables pas à pas.

:::key
Ces tests portent sur des échantillons de la **distribution conditionnelle** des effets aléatoires, pas sur leur mode. Ce n'est pas un détail d'implémentation : les modes individuels sont rétrécis vers zéro quand les données sont pauvres, et ce rétrécissement efface précisément la corrélation qu'on cherche. Échantillonner la distribution complète préserve le signal.
:::

:::note
Réf. : documentation Monolix / MonolixSuite (Lixoft — Simulations Plus) pour la syntaxe et les fonctionnalités ; Lavielle M., *Mixed Effects Models for the Population Approach* (Chapman & Hall/CRC) pour le modèle $h(\psi) = h(\psi_{\text{pop}}) + \beta c + \eta$ et la distribution conditionnelle ; Jonsson & Karlsson, *Pharm. Res.* 1998 pour la construction pas à pas du modèle de covariables ; Ribbing & Jonsson, *J. Pharmacokinet. Pharmacodyn.* 2004 pour sa puissance et son biais de sélection.
:::
<!-- /step -->

<!-- step:title="Exemple concret" viz="03_PopulationDistrib" -->
Une biodisponibilité orale, valeur typique **0,70**, à décrire chez 40 sujets.

**En log-normale, avec $\omega = 0{,}4$.** La distribution est $F_i = 0{,}70 \times e^{\eta_i}$. Pour que $F_i$ dépasse 1, il faut $\eta_i > \log(1/0{,}70) = 0{,}357$, soit $z = 0{,}357/0{,}4 = 0{,}89$. La table normale donne :

$$ P(F_i > 1) = 1 - \Phi(0{,}89) \approx 0{,}19 $$

**Près d'un sujet simulé sur cinq absorbe plus que sa dose.** Le 95ᵉ percentile vaut $0{,}70 \times e^{1{,}96 \times 0{,}4} = 1{,}53$ : 153 % de la dose. Le modèle tourne, le SAEM converge, la VPC peut même être acceptable sur la plage observée — et la simulation reste une absurdité physique.

**En logit-normale, avec $\omega = 0{,}85$.** La valeur typique devient $\text{logit}(0{,}70) = \log(0{,}70/0{,}30) = 0{,}847$. L'intervalle à 90 % des individus se calcule sur l'échelle logit puis se rabat :

$$ 0{,}847 \pm 1{,}96 \times 0{,}85 = [-0{,}819 ;\ 2{,}513] \;\longrightarrow\; [0{,}31 ;\ 0{,}93] $$

Bornes respectées par construction, pour toute valeur de $\eta$.

**Et en probit, avec $\omega = 0{,}50$ ?** La valeur typique devient $\Phi^{-1}(0{,}70) = 0{,}524$, et le même calcul donne $[0{,}32 ;\ 0{,}93]$.

Regardez ces deux dernières lignes. **$\omega = 0{,}85$ en logit et $\omega = 0{,}50$ en probit décrivent la même population**, à un centième près. Deux nombres qui n'ont rien à voir, une seule biologie. Le rapport est ici voisin de 1,7 — sa valeur exacte dépend du critère qu'on se donne pour dire que deux dispersions se ressemblent, la logistique ayant des queues plus lourdes que la normale. En pratique, logit et probit s'ajustent presque toujours aussi bien l'une que l'autre ; le probit se justifie surtout quand le paramètre **est** déjà une probabilité issue d'un mécanisme normal latent (un modèle à seuil). Le choix entre les deux compte donc beaucoup moins que le fait d'avoir compris ce que $\omega$ mesure.

**Le reste de la suite.** Le modèle une fois estimé, la MonolixSuite le réutilise **sans le réécrire**, parce que tous ses outils lisent le même fichier mlxtran : **Datxplore** explore le jeu de données avant toute modélisation ; **Mlxplore** explore le modèle sans données, à coups de curseurs sur les paramètres ; **Simulx** simule à partir du modèle estimé — nouveaux schémas posologiques, nouvelle population, essai clinique virtuel ; **PKanalix** couvre la NCA.

:::key
Le vrai gain n'est pas la liste d'outils, c'est le **fichier de modèle unique**. Le modèle que vous simulez est, littéralement, celui que vous avez estimé. Là où réimplémenter un modèle NONMEM dans un simulateur R fait courir le risque d'une divergence silencieuse entre les deux codes, ici la classe de bug n'existe pas.
:::

Et Mlxplore mérite mieux que sa réputation d'outil pédagogique : c'est souvent le **meilleur initialiseur** disponible. Bouger un $k_a$ de 0,3 à 3 en regardant la courbe se déformer vous apprend le modèle ; l'auto-initialisation, elle, vous rend un nombre.
<!-- /step -->

<!-- step:title="Piège fréquent" -->
Monolix affiche les $\omega$ dans une seule colonne, quelle que soit la distribution. C'est là que ça casse.

:::pitfall
**Un $\omega$ de logit-normale n'est pas un CV.** Le raccourci « $\omega \approx$ CV » est vrai pour une log-normale à faible variabilité — $\omega = 0{,}3$ donne $\text{CV} = \sqrt{e^{0{,}09}-1} = 30{,}7\ \%$ — et il ne se transporte **nulle part** ailleurs. Reprenez l'exemple : $\omega_F = 0{,}85$ en logit donne 90 % des sujets dans $[0{,}31 ; 0{,}93]$. Le même 0,85 en log-normale donnerait $[0{,}13 ; 3{,}70]$. Même nombre dans le tableau, populations sans rapport. Écrire « variabilité de 85 % sur F » dans un rapport, c'est écrire un chiffre qui ne veut rien dire. Pour une distribution bornée, ne rapportez pas $\omega$ tel quel : rapportez l'**intervalle de prédiction** sur l'échelle naturelle, ou simulez-le.
:::

Le même piège frappe à l'export, sous un autre visage. NONMEM n'a pas de mot-clé `logitNormal` : la traduction doit écrire la transformation à la main dans `$PK`.

```
$PK
  LGT = THETA(1) + ETA(1)      ; echelle logit
  F1  = 1/(1 + EXP(-LGT))      ; retour dans ]0,1[
```

:::pitfall
Le `THETA(1)` du control stream exporté vaut **0,847**, pas 0,70 : c'est $\text{logit}(0{,}70)$. Mettez les deux tableaux de résultats côte à côte et ils sembleront se contredire. Rien n'est cassé — les deux nombres désignent la même biodisponibilité, sur deux échelles. C'est en refaisant la transformation inverse, pas en comparant les lignes, qu'on vérifie un export.
:::

Deux mises en garde pour finir, dans le même esprit.

**L'auto-initialisation ne diagnostique rien.** Elle propose un point de départ pour les paramètres de structure ; elle ne sait pas que votre modèle est faux, ni que vos concentrations sont en ng/mL alors que vos doses sont en mg. Elle trouvera consciencieusement les valeurs qui ajustent le mieux un jeu de données faux. Son intérêt réel est ailleurs : quand elle renvoie un $V$ de 3 000 L pour un médicament IV, ce n'est pas un mauvais point de départ, c'est un **symptôme** — lisez-le comme tel. À l'inverse, le SAEM de Monolix est nettement plus robuste aux valeurs initiales que FOCE, grâce au recuit simulé de la phase de chauffe qui maintient les variances larges au début et laisse la chaîne explorer. C'est précisément pourquoi l'auto-init est un confort, pas un sauvetage.

**Les tests de covariables sont un crible, pas une décision.** Un p à 0,03 sur une corrélation $\eta$–covariable dit qu'il y a du signal, pas qu'il faut garder la covariable. Enchaîner les inclusions automatiques sur trente candidates fait remonter des effets qui doivent tout au hasard, et **surestime** systématiquement l'amplitude de ceux qu'on retient — c'est le biais de sélection décrit par Ribbing et Jonsson : le seuil qui laisse passer un effet retient de préférence les jeux de données où il paraît, par chance, plus fort qu'il n'est. Un effet doit survivre à trois questions : est-il **plausible** cliniquement, tient-il en **backward elimination**, et change-t-il quelque chose à la **dose** qu'on recommandera ?
<!-- /step -->

<!-- step:title="À retenir" -->
- `distribution=` choisit une **fonction de lien** $h$ qui envoie $\mathbb{R}$ sur le domaine du paramètre. Le modèle est toujours $h(\psi_i) = h(\psi_{\text{pop}}) + \sum \beta_k c_{ik} + \eta_i$ ; seule $h$ change.
- `logitNormal` et `probitNormal` bornent un paramètre dans ]0,1[ — ou dans ]min,max[ avec des bornes explicites — **par construction**, pour toute valeur de $\eta$. Une biodisponibilité log-normale, elle, dépasse 1 sans que rien ne le signale.
- $\omega$ et $\beta$ vivent sur l'échelle de $h$, pas sur celle du paramètre. « $\omega \approx$ CV » ne vaut que pour la log-normale à faible variabilité : pour une distribution bornée, rapportez un intervalle de prédiction.
- L'**auto-initialisation** donne un point de départ, pas un diagnostic ; le recuit simulé du SAEM rend de toute façon Monolix peu sensible aux valeurs initiales. Une proposition absurde est un symptôme du modèle ou des unités.
- Les **tests automatiques** (Wald sur les $\beta$, corrélations $\eta$–covariables) trient les candidates sans run supplémentaire, en échantillonnant la distribution conditionnelle pour échapper au rétrécissement. Ils cribleront, ils ne décideront pas : le biais de sélection est réel.
- La **MonolixSuite** partage un seul fichier mlxtran — Datxplore (données), Mlxplore (modèle), Monolix (estimation), Simulx (simulation), PKanalix (NCA) : le modèle simulé est celui qui a été estimé.
- L'**export NONMEM** est un brouillon de control stream, pas un clone : algorithme différent, OFV non comparable, paramètres bornés réécrits en transformations explicites. On le relance et on le rediagnostique.
<!-- /step -->
