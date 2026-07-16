---
id: "infectio-viral"
slug: "infectio-viral"
title: "Dynamique virale et modèles d'infection"
description: "Modéliser la charge virale sous traitement : cellules cibles, décroissance biphasique et efficacité."
summary: "Les modèles de cinétique virale (cellules cibles) : décroissance biphasique, efficacité et émergence de résistance."
track: "infectio"
order: 42
duration: "13 min"
level: "advanced"
tags: ["infectious-diseases", "viral-dynamics", "target-cell", "resistance"]
slides: []
sources: ["neumann-hcv", "perelson-hiv"]
reviewed_on: "2026-07-09"
quiz:
  - prompt: "Dans un modèle de cinétique virale, la décroissance biphasique reflète..."
    options:
      - "la clairance du virus libre puis la perte des cellules infectées"
      - "deux erreurs de mesure"
      - "la dose et le poids"
    correct: 0
  - prompt: "Le paramètre d'efficacité ε d'un antiviral représente..."
    options:
      - "la fraction de production virale bloquée"
      - "la clairance rénale"
      - "le volume de distribution"
    correct: 0
  - prompt: "Une efficacité insuffisante favorise..."
    options:
      - "l'émergence de résistance (réplication résiduelle)"
      - "une guérison plus rapide"
      - "une baisse de la charge virale"
    correct: 0
---

<!-- step:title="Pourquoi ce chapitre" -->
En infectiologie virale (VIH, VHC, grippe, COVID, Ebola), le critère n'est pas une concentration mais la **charge virale**. La modéliser sous traitement permet de quantifier l'**efficacité** d'un antiviral et d'anticiper la **résistance**.

C'est un champ majeur de la pharmacométrie mécaniste appliquée à l'infection.
<!-- /step -->

<!-- step:title="Intuition" viz="45_ViralKinetics" -->
Le virus se **produit** (cellules infectées) et se **claire** en permanence. Un antiviral **bloque la production** : la charge virale chute.

La chute est **biphasique** : d'abord rapide (élimination du virus libre déjà présent), puis plus lente (élimination des cellules infectées). Faites varier l'efficacité et observez les deux pentes.
<!-- /step -->

<!-- step:title="La formule décortiquée" viz="45_ViralKinetics" -->
Le modèle à **cellules cibles** couple cellules infectées $I$ et virus $V$ :

$$ \frac{dI}{dt} = -\delta\,I, \qquad \frac{dV}{dt} = (1-\varepsilon)\,p\,I - c\,V $$

- $\varepsilon$ : **efficacité** (fraction de production bloquée) ;
- $c$ : clairance du virus libre (phase 1, rapide) ;
- $\delta$ : perte des cellules infectées (phase 2, lente).

À forte efficacité, la première pente ≈ $c$, la seconde ≈ $\delta$.

:::note
Réf. : Neumann A.U. et al., *Science* 1998 (dynamique du VHC sous interféron) ; Perelson A.S. (dynamique du VIH). En France, l'équipe **IAME** (Bichat — J. Guedj) modélise VHC, Ebola et COVID ; école de **Leiden** (LACDR) pour la modélisation de l'infection.
:::
<!-- /step -->

<!-- step:title="Exemple concret" viz="45_ViralKinetics" -->
Pour le **VHC**, ce sont deux lectures différentes de la phase 1 qu'il faut distinguer : sa **pente** mesure la clairance du virus libre ($c$), tandis que la **profondeur** de la chute — le palier atteint, $\approx V_0(1-\varepsilon)$ — mesure l'**efficacité** $\varepsilon$ du traitement. La phase 2, elle, donne la vitesse d'élimination des hépatocytes infectés — d'où une prédiction du **temps de guérison**.

Ce cadre a guidé le développement des antiviraux à action directe et l'optimisation des durées de traitement.
<!-- /step -->

<!-- step:title="Piège fréquent" -->
Une charge virale qui remonte n'est pas toujours un échec pharmacologique.

:::pitfall
Une efficacité incomplète laisse une **réplication résiduelle** où des variants **résistants** peuvent émerger : la charge virale rebondit malgré un traitement « présent ». Distinguer inobservance, exposition insuffisante (PK) et résistance (virologie) est essentiel — et impose de relier le modèle viral à la **PK** du médicament.
:::
<!-- /step -->

<!-- step:title="À retenir" -->
- La charge virale se modélise par un système cellules infectées ↔ virus libre.
- Décroissance biphasique : clairance du virus (c) puis perte des cellules infectées (δ).
- L'efficacité ε (production bloquée) fixe l'**amplitude** de la chute de phase 1 ; c'est sa **pente** qui reflète la clairance virale c. Confondre les deux, c'est lire un taux (en j⁻¹) là où on cherche une fraction (entre 0 et 1).
- Une efficacité insuffisante favorise la résistance ; relier au modèle PK.
<!-- /step -->
