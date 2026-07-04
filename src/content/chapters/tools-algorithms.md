---
id: "tools-algorithms"
slug: "tools-algorithms"
title: "Les algorithmes d'estimation : FOCE et SAEM"
description: "Pourquoi la vraisemblance des modèles à effets mixtes est difficile, et comment FOCE et SAEM la résolvent."
summary: "FOCE (linéarisation) vs SAEM (simulation stochastique) : deux façons d'estimer un modèle NLME, expliquées."
track: "tools"
order: 200
duration: "15 min"
level: "advanced"
tags: ["tools", "saem", "foce", "estimation"]
prerequisites: ["outils-estimation", "math-bayes"]
glossary: ["SAEM", "FOCE-I", "OFV", "Vraisemblance", "Effets mixtes"]
slides: []
quiz:
  - prompt: "La vraisemblance d'un modèle NLME est difficile car..."
    options:
      - "elle contient une intégrale sur les effets aléatoires, sans forme close"
      - "elle est toujours nulle"
      - "elle ne dépend pas des données"
    correct: 0
  - prompt: "FOCE approxime la vraisemblance en..."
    options:
      - "linéarisant le modèle autour des effets individuels estimés"
      - "simulant des milliers de patients"
      - "ignorant la variabilité"
    correct: 0
  - prompt: "SAEM évite la linéarisation en..."
    options:
      - "simulant les effets aléatoires (E) puis mettant à jour les paramètres (M)"
      - "supposant le modèle linéaire"
      - "fixant tous les paramètres"
    correct: 0
---

<!-- step:title="Pourquoi ce chapitre" -->
Estimer un modèle de population, c'est maximiser sa **vraisemblance**. Mais pour un modèle à effets mixtes **non linéaire**, cette vraisemblance n'a **pas de forme close** : elle contient une intégrale sur les effets aléatoires de chaque patient.

Deux grandes stratégies contournent ce mur : **linéariser** (FOCE) ou **simuler** (SAEM). Comprendre la différence éclaire tout le comportement des logiciels.
<!-- /step -->

<!-- step:title="Intuition" viz="66_FOCELinearization" -->
Le problème : pour un patient, on ne connaît pas ses effets aléatoires $\eta_i$ ; il faut « intégrer » sur toutes leurs valeurs possibles.

- **FOCE** remplace la courbe du modèle par sa **tangente** autour de la meilleure estimation individuelle : l'intégrale devient gaussienne, calculable.
- **SAEM** ne triche pas sur la forme : il **tire au sort** des valeurs plausibles de $\eta_i$ et fait converger les paramètres par moyennes successives.
<!-- /step -->

<!-- step:title="La formule décortiquée" viz="67_SAEMConvergence" -->
La vraisemblance à maximiser :

$$ L(\theta) = \prod_i \int p(y_i \mid \eta_i, \theta)\, p(\eta_i \mid \theta)\; d\eta_i $$

L'intégrale (sur $\eta_i$) n'a pas de solution analytique dès que le modèle $f$ est **non linéaire** en $\eta_i$. C'est là que FOCE et SAEM divergent.

:::math
On maximise en pratique $-2\log L$ (l'**OFV**). Comme les deux méthodes **approchent** différemment cette quantité, leurs OFV **ne sont pas comparables** entre elles.
:::
<!-- /step -->

<!-- step:title="FOCE : la linéarisation" viz="66_FOCELinearization" -->
**FOCE-I** (First-Order Conditional Estimation with Interaction) fait un **développement de Taylor au 1ᵉʳ ordre** du modèle autour des effets individuels estimés $\hat\eta_i$ (le mode a posteriori de chaque patient) :

$$ f(\eta_i) \approx f(\hat\eta_i) + \left.\frac{\partial f}{\partial \eta}\right|_{\hat\eta_i}(\eta_i - \hat\eta_i) $$

- **Conditional** : on linéarise autour du $\hat\eta_i$ **de chaque patient** (pas autour de 0 comme la vieille méthode « FO »).
- **Interaction** : on tient compte du fait que l'**erreur résiduelle** dépend de la prédiction individuelle.

:::howto
**La métaphore de la loupe.** Trop compliqué de mesurer une route courbe ? On la remplace, **près de chez soi**, par sa tangente. C'est exact au point, approximatif au loin.

**Conséquence.** FOCE est **rapide** mais **approximatif** : le biais grandit quand le modèle est **fortement non linéaire** ou les données **éparses**, et l'algorithme peut ne pas converger. C'est la méthode historique de **NONMEM**.
:::
<!-- /step -->

<!-- step:title="SAEM : la simulation" viz="67_SAEMConvergence" -->
**SAEM** (Stochastic Approximation Expectation-Maximization) est un algorithme **EM** pour variables latentes (ici les $\eta_i$), en deux temps répétés :

- **E (simulation)** : comme la loi $p(\eta_i \mid y_i, \theta)$ est intraitable, on en **tire** des échantillons par MCMC (au lieu de calculer une espérance) ;
- **M (maximisation)** : on met à jour $\theta, \Omega, \Sigma$ à partir de ces $\eta_i$ simulés.

L'**approximation stochastique** lisse le bruit des tirages avec un pas décroissant $\gamma_k$ (Robbins-Monro) :

$$ s_{k+1} = s_k + \gamma_k\big(S(\eta^{(k)}) - s_k\big) $$

:::howto
**La métaphore du sondage.** Plutôt que de calculer une moyenne exacte impossible, on **interroge un échantillon** à chaque itération, et on affine l'estimation en moyennant — de plus en plus finement.

**Conséquence.** SAEM ne linéarise **pas** : il converge vers le **vrai** maximum de vraisemblance (asymptotiquement), et reste **robuste** sur les modèles non linéaires et complexes. C'est le moteur de **Monolix** et une option de **nlmixr2/NONMEM**. La vraisemblance finale se calcule à part, par **échantillonnage d'importance**.
:::
<!-- /step -->

<!-- step:title="Exemple concret" viz="66_FOCELinearization" -->
Sur un modèle **simple**, FOCE-I et SAEM donnent quasiment les **mêmes** estimations : la linéarisation est fidèle.

Sur un modèle **difficile** (Emax raide, TMDD, données très éparses), FOCE-I peut **diverger** ou **biaiser** les estimations, là où SAEM converge tranquillement — d'où sa popularité croissante.
<!-- /step -->

<!-- step:title="Piège fréquent" -->
Comparer les OFV entre méthodes n'a pas de sens.

:::pitfall
FOCE et SAEM **approchent** la vraisemblance différemment : leurs **OFV ne sont pas comparables**. On ne compare l'OFV qu'à **méthode identique** et **mêmes données**. Enfin, la **convergence** d'un algorithme ne garantit pas un **bon modèle** : les diagnostics restent obligatoires.
:::
<!-- /step -->

<!-- step:title="À retenir" -->
- La vraisemblance NLME = une intégrale sur les effets aléatoires, sans forme close.
- FOCE : linéarise autour des η̂ individuels — rapide, approximatif, historique (NONMEM).
- SAEM : simule les η (E) puis met à jour les paramètres (M) — exact (ML), robuste (Monolix).
- Les OFV ne se comparent qu'à méthode et données identiques ; convergence ≠ bon modèle.
<!-- /step -->
