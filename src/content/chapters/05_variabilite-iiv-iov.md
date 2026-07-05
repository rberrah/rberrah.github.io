---
id: "variabilite-iiv-iov"
slug: "variabilite-iiv-iov"
title: "IIV, IOV et erreur résiduelle"
description: "Séparer différences entre patients, différences entre occasions et bruit de mesure."
summary: "Guide pratique pour nommer les différentes sources de variabilité en PopPK."
track: "core"
order: 5
duration: "14 min"
level: "intermediate"
tags: ["variability", "iiv", "iov", "residual-error"]
slides: ["s11", "s13", "s14", "s15", "s16", "s17"]
quiz:
  - prompt: "L'IIV désigne..."
    options:
      - "les différences entre patients"
      - "les différences entre appareils de dosage seulement"
      - "les différences entre noms de médicaments"
    correct: 0
  - prompt: "L'IOV désigne..."
    options:
      - "les différences chez un même patient d'une occasion à l'autre"
      - "la valeur typique"
      - "l'EDO structurale"
    correct: 0
  - prompt: "L'erreur résiduelle correspond surtout à..."
    options:
      - "l'écart inexpliqué au niveau de l'observation"
      - "toute la variabilité de population"
      - "l'effet d'une covariable"
    correct: 0
---

<!-- step:title="Pourquoi ce chapitre" slides="s14" viz="12_VariabilitySandbox" -->
La variabilité n'est pas une nuisance à cacher. C'est souvent la raison principale pour laquelle la pharmacométrie est utile.

Un bon modèle dit **quelles** différences sont entre patients, **lesquelles** surviennent chez un même patient au cours du temps, et **lesquelles** restent au niveau de la mesure.
<!-- /step -->

<!-- step:title="Intuition" slides="s13,s14" viz="12_VariabilitySandbox" -->
Dans une classe, les élèves ne construisent pas tous à la même vitesse.

Certains sont durablement plus rapides. Certains sont rapides lundi et lents vendredi. Et certaines photos de la construction finale sont floues. Ce sont **trois problèmes différents** :

- **Effet fixe** : la notice de montage typique de la classe.
- **IIV** (variabilité inter-individuelle) : chaque élève a un style de construction personnel.
- **IOV** (variabilité inter-occasion) : le même élève change d'une séance à l'autre.
- **Erreur résiduelle** : la photo est imparfaite, ou le modèle rate un petit détail.

:::key
Garder ces couches séparées est l'une des compétences PopPK les plus importantes.
:::
<!-- /step -->

<!-- step:title="La formule décortiquée" slides="s13" viz="12_VariabilitySandbox" -->
Un modèle de paramètre PopPK courant :

$$ CL_i = CL_{\mathrm{typique}}\, e^{\eta_i} $$

où $\eta_i$ est l'écart propre au patient. Pour un paramètre spécifique à l'occasion :

$$ CL_{ij} = CL_{\mathrm{typique}}\, e^{\eta_i + \kappa_{ij}} $$

:::math
$\eta_i$ ne change pas d'une visite à l'autre (c'est l'IIV) ; $\kappa_{ij}$ décrit l'occasion $j$ du patient $i$ (c'est l'IOV). L'erreur résiduelle, elle, agit sur chaque **observation**.
:::
<!-- /step -->

<!-- step:title="Exemple concret" slides="s17" viz="12_VariabilitySandbox" -->
Dans un jeu de données warfarine, deux patients peuvent avoir des clairances typiques différentes : c'est l'IIV.

Le même patient peut aussi avoir une clairance différente à une visite ultérieure (alimentation, observance, fonction hépatique, interactions) : c'est l'IOV.

Et l'INR ou la concentration mesurée peut encore s'écarter du modèle : c'est l'erreur résiduelle.
<!-- /step -->

<!-- step:title="Un cas chiffré" slides="s17" viz="12_VariabilitySandbox" -->
Prenons une population de clairance typique $CL_{pop} = 5\ \text{L/h}$, avec une IIV de 30 % et une erreur résiduelle proportionnelle de 10 %.

| Source | Écart | Calcul | CL (L/h) |
|---|---|---|---|
| Population | — | $CL_{pop}$ | 5,0 |
| IIV — patient A | $\eta_A = +0{,}18$ | $5 \cdot e^{0{,}18}$ | 6,0 |
| IIV — patient B | $\eta_B = -0{,}36$ | $5 \cdot e^{-0{,}36}$ | 3,5 |
| IOV — A, occasion 2 | $\kappa = +0{,}22$ | $5 \cdot e^{\eta_A + \kappa}$ | 7,5 |

Lecture : le patient A élimine plus vite que le typique (6,0 vs 5,0), B plus lentement (3,5) — c'est l'**IIV**. Le même patient A passe de 6,0 à 7,5 entre deux occasions — c'est l'**IOV**. Et chaque point mesuré reste dispersé de ±10 % autour de sa prédiction individuelle — c'est l'**erreur résiduelle**.

:::key
Trois couches, trois nombres : $\eta$ situe le patient, $\kappa$ décale une occasion, $\varepsilon$ bruite chaque mesure.
:::
<!-- /step -->

<!-- step:title="Piège fréquent" slides="s16" -->
N'utilisez pas l'erreur résiduelle pour absorber tous les écarts.

:::pitfall
Si les courbes des patients diffèrent systématiquement, l'erreur résiduelle est la mauvaise explication. Si le même patient change selon la visite, l'IIV seule ne suffit pas. Et si le modèle structural est faux, ajouter des effets aléatoires ne fait souvent que **masquer** le problème.
:::
<!-- /step -->

<!-- step:title="À retenir" -->
- L'IIV est la variabilité entre patients.
- L'IOV est la variabilité intra-patient, entre occasions.
- L'erreur résiduelle est l'écart au niveau de l'observation.
- Mieux nommer la variabilité, c'est mieux interpréter le modèle.
<!-- /step -->
