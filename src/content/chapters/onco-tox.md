---
id: "onco-tox"
slug: "onco-tox"
title: "Toxicité hématologique : le modèle de Friberg"
description: "Modéliser la neutropénie chimio-induite : prolifération, maturation et rétrocontrôle."
summary: "Le modèle semi-mécaniste de Friberg pour la myélosuppression, toxicité dose-limitante."
track: "onco"
order: 31
duration: "13 min"
level: "advanced"
tags: ["oncology", "toxicity", "neutropenia", "friberg"]
slides: []
sources: ["friberg", "dayneka-jusko-indirect"]
reviewed_on: "2026-07-09"
quiz:
  - prompt: "Dans le modèle de Friberg, le nadir des neutrophiles survient..."
    options:
      - "avec un délai (temps de maturation), après le pic de concentration"
      - "exactement au pic de concentration"
      - "avant l'administration"
    correct: 0
  - prompt: "Le rétrocontrôle (Circ₀/Circ)^γ sert à..."
    options:
      - "faire remonter la production après le nadir"
      - "supprimer la toxicité"
      - "changer la clairance du médicament"
    correct: 0
---

<!-- step:title="Pourquoi ce chapitre" -->
La **neutropénie** est la toxicité **dose-limitante** de nombreuses chimiothérapies. La modéliser permet de prédire la profondeur et le moment du **nadir**, et d'ajuster dose et schéma.

C'est le pendant « toxicité » de l'exposition–réponse tumorale.
<!-- /step -->

<!-- step:title="Intuition" viz="32_Myelosuppression" -->
La moelle produit des cellules qui **mûrissent** avant d'arriver dans le sang. Le médicament freine la **prolifération** ; l'effet sur les neutrophiles circulants apparaît donc **en retard** (le temps de maturation).

Puis un **rétrocontrôle** relance la production : les neutrophiles remontent, parfois au-dessus de la normale (rebond).
<!-- /step -->

<!-- step:title="La formule décortiquée" viz="32_Myelosuppression" -->
Le modèle de **Friberg** (2002) chaîne un compartiment de prolifération, des compartiments de **transit** (maturation) et les cellules circulantes :

$$ \frac{dProl}{dt} = k_{prol}\,Prol\,(1 - E_{drug})\left(\frac{Circ_0}{Circ}\right)^{\gamma} - k_{tr}\,Prol $$

- $E_{drug}$ : effet (souvent linéaire, $slope\cdot C$) inhibant la prolifération ;
- les **transits** ($k_{tr}$) créent le délai du nadir (MTT) ;
- le terme $(Circ_0/Circ)^{\gamma}$ est le **rétrocontrôle** homéostatique.

:::note
Réf. : Friberg L.E. et al., *J Clin Oncol* 2002 — modèle semi-mécaniste de myélosuppression, réutilisable pour plaquettes et leucocytes.
:::
<!-- /step -->

<!-- step:title="Exemple concret" viz="32_Myelosuppression" -->
Plus l'**exposition** est forte, plus le nadir est **profond** ; le nadir survient ~1–2 semaines après la cure (temps de maturation), pas au pic plasmatique.

On simule alors des schémas (dose, intervalle) qui gardent le nadir au-dessus d'un seuil de sécurité.
<!-- /step -->

<!-- step:title="Piège fréquent" -->
Ne confondez pas le moment du **pic de concentration** et celui du **nadir**.

:::pitfall
Le délai du nadir vient de la maturation (transits), pas de la PK. Et la toxicité peut être **cumulative** sur plusieurs cures : un modèle à cure unique sous-estime le risque.
:::
<!-- /step -->

<!-- step:title="À retenir" -->
- La neutropénie est souvent la toxicité dose-limitante ; on la modélise pour prédire le nadir.
- Modèle de Friberg : prolifération (inhibée) → transits (maturation) → circulants + rétrocontrôle.
- Le délai du nadir vient du temps de maturation, pas de la PK.
- Attention à la toxicité cumulative multi-cures.
<!-- /step -->
