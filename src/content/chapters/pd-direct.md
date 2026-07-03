---
id: "pd-direct"
slug: "pd-direct"
title: "Modèles à effet direct : Emax et Hill"
description: "Quand l'effet suit la concentration sans délai : linéaire, log-linéaire, Emax et sigmoïde de Hill."
summary: "Les modèles PD directs — linéaire, log-linéaire, Emax, Hill — et le sens de leurs paramètres."
track: "pd"
order: 60
duration: "12 min"
level: "intermediate"
tags: ["pharmacodynamics", "emax", "hill", "direct-effect"]
slides: []
quiz:
  - prompt: "Un modèle à effet direct suppose que l'effet..."
    options:
      - "suit la concentration sans délai"
      - "apparaît toujours avec un retard"
      - "est indépendant de la concentration"
    correct: 0
  - prompt: "Dans le modèle Emax, EC50 est la concentration qui donne..."
    options:
      - "la moitié de l'effet maximal"
      - "l'effet maximal"
      - "aucun effet"
    correct: 0
  - prompt: "Le coefficient de Hill (n) contrôle..."
    options:
      - "la raideur de la courbe concentration–effet"
      - "la demi-vie du médicament"
      - "le volume de distribution"
    correct: 0
---

<!-- step:title="Pourquoi ce chapitre" -->
Le plus simple des liens PD : l'effet **suit** la concentration, sans délai. C'est le point de départ de toute la pharmacodynamie, et le modèle **Emax** en est le pilier.

Comprendre ses paramètres (E0, Emax, EC50, n) éclaire tous les modèles plus complexes.
<!-- /step -->

<!-- step:title="Intuition" viz="EmaxHill" -->
À faible concentration, chaque incrément de dose ajoute beaucoup d'effet. À forte concentration, les récepteurs **saturent** : l'effet plafonne.

D'où une courbe qui **monte puis sature** — l'inverse d'une droite. La sigmoïde de Hill ajoute une **raideur** réglable.
<!-- /step -->

<!-- step:title="La formule décortiquée" viz="EmaxHill" -->
Le modèle **Emax** sigmoïde (Hill) :

$$ E = E_0 + \frac{E_{max}\,C^{\,n}}{EC_{50}^{\,n} + C^{\,n}} $$

- $E_0$ : effet de base (sans médicament) ;
- $E_{max}$ : effet maximal atteignable ;
- $EC_{50}$ : concentration pour la moitié de l'effet ;
- $n$ : coefficient de Hill (raideur ; $n=1$ = hyperbole).

Les formes **linéaire** ($E=E_0+S\cdot C$) et **log-linéaire** ($E=E_0+S\cdot\ln C$) sont des approximations valables sur une plage étroite.

:::math
Pour $C \ll EC_{50}$, l'Emax se comporte comme un modèle **linéaire** de pente $E_{max}/EC_{50}$.
:::
<!-- /step -->

<!-- step:title="Exemple concret" viz="EmaxHill" -->
Un antihypertenseur : la baisse de pression suit la concentration presque sans délai. On estime $E_{max}$ (baisse maximale) et $EC_{50}$ (concentration cible).

Au-delà de ~$5\times EC_{50}$, augmenter la dose n'apporte quasiment plus d'effet — mais peut ajouter de la toxicité.
<!-- /step -->

<!-- step:title="Piège fréquent" -->
Un modèle linéaire extrapole mal.

:::pitfall
Ajuster une **droite** sur des données concentration–effet qui saturent surestime l'effet aux fortes doses. Et un $EC_{50}$ n'est identifiable que si l'on a observé des concentrations **autour** de lui : sinon, il est mal estimé.
:::
<!-- /step -->

<!-- step:title="À retenir" -->
- Effet direct = l'effet suit la concentration sans délai.
- Emax sigmoïde : E0, Emax, EC50, n (Hill = raideur).
- Linéaire/log-linéaire = approximations sur plage étroite.
- Identifier EC50 exige des concentrations autour de sa valeur.
<!-- /step -->
