---
id: "mab-pk"
slug: "mab-pk"
title: "PK des anticorps monoclonaux"
description: "Grosses protéines, petit volume, clairance lente : pourquoi les anticorps ne suivent pas les règles des petites molécules."
summary: "La pharmacocinétique particulière des anticorps monoclonaux : FcRn, volume, demi-vie longue."
track: "mab"
order: 50
duration: "12 min"
level: "advanced"
tags: ["mab", "biologics", "fcrn", "pk"]
slides: []
sources: ["ryman-meibohm", "rowland-tozer", "mager-jusko-tmdd"]
reviewed_on: "2026-07-09"
quiz:
  - prompt: "La demi-vie longue (semaines) des anticorps IgG s'explique surtout par..."
    options:
      - "le recyclage par le récepteur FcRn"
      - "une forte lipophilie"
      - "une élimination rénale rapide"
    correct: 0
  - prompt: "Le volume de distribution d'un anticorps monoclonal est..."
    options:
      - "petit (proche du plasma et de l'interstitium)"
      - "très grand (tissus profonds)"
      - "nul"
    correct: 0
---

<!-- step:title="Pourquoi ce chapitre" -->
Les **anticorps monoclonaux** (mAbs) sont de **grosses protéines** (~150 kDa). Leur pharmacocinétique n'a presque rien à voir avec celle des petites molécules : volume faible, clairance lente, demi-vie de **plusieurs semaines**.

Comprendre ces différences est indispensable pour les biothérapies (oncologie, auto-immunité).
<!-- /step -->

<!-- step:title="Intuition" viz="10_PK2C" -->
Une grosse molécule ne diffuse pas librement dans les tissus : elle reste surtout dans le **plasma et l'interstitium** → **petit volume** (~5–8 L).

Elle n'est pas filtrée par le rein ni métabolisée par les CYP : elle est **catabolisée** (dégradée en acides aminés), lentement.
<!-- /step -->

<!-- step:title="La formule décortiquée" viz="10_PK2C" -->
La PK d'un mAb est souvent **bi-compartimentale linéaire** (aux doses thérapeutiques), avec une clairance faible et une demi-vie de **2 à 4 semaines** :

$$ t_{1/2} = \frac{\ln 2\cdot V}{CL} $$

La clé : le récepteur **FcRn** « sauve » les IgG de la dégradation (recyclage) — d'où la demi-vie longue. Par voie **sous-cutanée**, la biodisponibilité est ~50–80 % (absorption lymphatique lente).

:::note
Réf. : Ryman J.T. & Meibohm B., *CPT Pharmacometrics Syst Pharmacol* 2017 ; Dirks N.L. & Meibohm B., *Clin Pharmacokinet* 2010 (revues PK des anticorps).
:::
<!-- /step -->

<!-- step:title="Exemple concret" viz="10_PK2C" -->
Une demi-vie de ~3 semaines autorise une administration **toutes les 2 à 4 semaines** — très différent d'un antibiotique dosé plusieurs fois par jour.

La faible clairance et le petit volume rendent les concentrations relativement stables entre deux injections.
<!-- /step -->

<!-- step:title="Piège fréquent" -->
La PK des anticorps n'est pas toujours linéaire.

:::pitfall
À faible dose, la liaison à la **cible** peut créer une élimination supplémentaire saturable (TMDD, chapitre suivant) → PK **non linéaire**. De plus, l'**immunogénicité** (anticorps anti-médicament, ADA) peut accélérer la clairance chez certains patients.
:::
<!-- /step -->

<!-- step:title="À retenir" -->
- Les mAbs : grosses protéines, petit volume (~plasma+interstitium), clairance lente.
- Demi-vie de 2–4 semaines grâce au recyclage FcRn ; catabolisme, pas de rein/CYP.
- Voie SC : biodisponibilité ~50–80 %, absorption lymphatique lente.
- Non-linéarité possible (TMDD) et immunogénicité (ADA).
<!-- /step -->
