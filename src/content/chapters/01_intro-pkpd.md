---
id: "pourquoi-pharmacometrie"
slug: "pourquoi-pharmacometrie"
title: "Pourquoi la pharmacométrie ?"
description: "PK vs PD, ADME, et pourquoi une même dose ne convient pas à tout le monde."
summary: "Une porte d'entrée pédagogique vers la PK, la PD, la variabilité et l'individualisation par les modèles."
track: "core"
order: 1
duration: "12 min"
level: "beginner"
tags: ["intro", "pk", "pd", "variability"]
slides: ["s01", "s02"]
sources: ["rowland-tozer", "holford-clearance", "mould-upton"]
reviewed_on: "2026-07-09"
quiz:
  - prompt: "La pharmacocinétique (PK) décrit surtout..."
    options:
      - "ce que le médicament fait à l'organisme"
      - "ce que l'organisme fait au médicament"
      - "la relation entre concentration et effet"
    correct: 1
  - prompt: "Dans la métaphore des blocs, la PD correspond le mieux à..."
    options:
      - "le trajet des blocs dans la salle"
      - "ce que fait la construction finale"
      - "la vitesse d'évacuation des blocs"
    correct: 1
  - prompt: "Deux patients reçoivent la même dose mais répondent différemment. C'est une bonne image de..."
    options:
      - "la variabilité interindividuelle"
      - "une erreur résiduelle de mesure"
      - "un effet fixe identique chez tous"
    correct: 0
---

<!-- step:title="Pourquoi ce chapitre" slides="s02" viz="BuildingBlocksPKPD" -->
Une dose est facile à écrire : **100 mg deux fois par jour**. La réponse clinique l'est beaucoup moins. Chez un même schéma posologique, un patient sera sous-exposé, un autre toxique, un troisième dans la zone utile.

La pharmacométrie est la discipline qui relie ces pièces par des modèles explicites :

$$ \text{Dose} \rightarrow \text{Concentration} \rightarrow \text{Effet} $$

:::key
L'objectif n'est pas de mémoriser des équations, mais de comprendre l'histoire que chaque équation raconte.
:::
<!-- /step -->

<!-- step:title="Intuition" slides="s02" viz="01_HumanBody" -->
Imaginez le médicament comme un lot de blocs qui entre dans une salle de classe.

La **PK** demande où vont les blocs et combien de temps ils restent :

- absorption : les blocs entrent dans la salle ;
- distribution : ils se répartissent sur les tables et les étagères ;
- métabolisme et élimination : ils sont transformés ou évacués.

La **PD** demande ce que produit la construction une fois assez de blocs en place : contrôle des symptômes, variation d'un biomarqueur, effet antibactérien… ou toxicité.

:::note
Règle mnémotechnique : **PK = ce que le corps fait au médicament**, **PD = ce que le médicament fait au corps**.
:::
<!-- /step -->

<!-- step:title="La formule décortiquée" viz="IVBolus" -->
Pour un bolus intraveineux dans un modèle à un compartiment, la concentration part de :

$$ C_0 = \frac{\text{Dose}}{V} $$

Rappelez-vous ce qu'est une **concentration** : une quantité rapportée à un volume. La concentration de départ, c'est donc la **dose divisée par le volume** dans lequel elle se dilue — un volume qu'en pharmacométrie on appelle le **volume de distribution** $V$.

La concentration décroît ensuite à mesure que l'organisme épure le médicament :

$$ C(t) = \frac{\text{Dose}}{V}\, e^{-\frac{CL}{V}\,t} $$

Cette décroissance est **exponentielle** : à la manière d'une suite géométrique, on retire à chaque unité de temps un même **pourcentage** de ce qui reste — pas une quantité fixe. Pour chiffrer cette vitesse, on dispose de deux mesures équivalentes :

- la **clairance** $CL$ — un débit épuré, une vitesse rapportée au volume ;
- la **constante d'élimination** $k_e = CL/V$ — une vitesse pure (par unité de temps).

Mais la mesure la plus **parlante** de cette décroissance reste la **demi-vie** $t_{1/2}$ : le temps qu'il faut pour éliminer la moitié du produit.

:::math
Le **volume** fixe la dilution initiale ; la **clairance** fixe la vitesse à laquelle le produit est retiré par rapport à cet espace. Le rapport $CL/V = k_e$ gouverne la pente, et $t_{1/2} = \ln 2 / k_e = 0{,}693\,V/CL$.

Dans un modèle **linéaire** (le cas simple), cette vitesse ne dépend **pas** de la concentration : la demi-vie est alors une propriété de la **molécule** (et de son volume), non de la dose reçue.
:::
<!-- /step -->

<!-- step:title="Exemple concret" viz="IVBolus" -->
Deux patients reçoivent la même dose IV.

Le patient A a une clairance de $4\ \text{L/h}$, le patient B de $8\ \text{L/h}$. Si leurs volumes sont proches, B retire les blocs environ deux fois plus vite et aura, en général, une exposition plus basse.

C'est pourquoi la pharmacométrie raisonne sur des **paramètres** (CL, V) plutôt que sur les seules concentrations observées : les paramètres expliquent *pourquoi* les courbes diffèrent.
<!-- /step -->

<!-- step:title="Piège fréquent" slides="s02" -->
**Tous les patients sont différents.** On sait aujourd'hui que le « *one size fits all* » — une même dose pour tous — est hélas faux. Mais ne rangez pas pour autant toutes les différences dans une seule boîte appelée « bruit ».

Une différence entre observations peut venir de sources très distinctes :

- **IIV** (variabilité inter-individuelle) : les patients sont des bâtisseurs différents ;
- **IOV** (variabilité inter-occasion) : le même patient change d'une occasion à l'autre ;
- **erreur résiduelle** : la mesure est imparfaite ;
- **biais du modèle** : la notice de montage oublie un élément important.

:::pitfall
Confondre ces sources rend le modèle plus simple en apparence, mais moins utile — et parfois trompeur.
:::
<!-- /step -->

<!-- step:title="À retenir" -->
- La PK décrit ce que l'organisme fait au médicament.
- La PD décrit ce que le médicament fait à l'organisme.
- Un modèle pharmacométrique est une notice de montage simplifiée reliant dose, concentration, effet et variabilité.
- Règle de l'étudiant : sachez raconter le mécanisme en mots avant de faire confiance à l'équation.
<!-- /step -->
