---
id: "trois-approches"
slug: "trois-approches"
title: "NCA vs PopPK vs PBPK"
description: "Comparer les trois piliers de la pharmacométrie."
order: 2
tags: ["approches","nca","poppk","pbpk"]
slides: ["s06","s07","s08","s09"]
---

<!-- step:title="NCA : décrire" slides="s06" viz="04_ThreeApproaches" -->
**Ce que l’on voit** : courbe avec trapèzes AUC.
**Pourquoi** : la NCA calcule l’exposition sans modèle.
**Implication** : robuste mais ne prédit pas de nouveaux scénarios.
**Piège** : utiliser la NCA pour simuler une autre dose.
<!-- /step -->

<!-- step:title="PopPK : expliquer variabilité" slides="s07,s08" viz="04_ThreeApproaches" -->
**Ce que l’on voit** : spaghetti + distribution.
**Pourquoi** : modèle compartimental + effets aléatoires pour moyenne et variabilité.
**Implication** : permet de simuler et individualiser.
**Piège** : mal coder la variabilité résiduelle et confondre IIV/IOV.
<!-- /step -->

<!-- step:title="PBPK : reconstruire la physiologie" slides="s09" viz="04_ThreeApproaches" -->
**Ce que l’on voit** : réseau d’organes.
**Pourquoi** : mécanisme bottom-up, interactions médicamenteuses.
**Implication** : utile quand on manque de données cliniques, mais complexe.
**Piège** : sur-paramétriser sans données pour identifier chaque organe.
<!-- /step -->
