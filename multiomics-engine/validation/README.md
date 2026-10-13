# P0 RNA-seq — investigation indépendante de la FDR DESeq2

**Protocole fixé le 13 octobre 2026, avant le lancement des nouvelles
simulations.** Cette étude est séparée des travaux de Codex sur la
[PR #52](https://github.com/rberrah/rberrah.github.io/pull/52) et
[PR #54](https://github.com/rberrah/rberrah.github.io/pull/54).
Aucun des moteurs de production, scripts de Codex ou écrans publics n'est modifié.

## Constat initial (observé, non reproduit dans cette nouvelle campagne)

La campagne indépendante de la PR #52 a exécuté 400 jeux RNA-seq et 1 200
ajustements R. À q = 5 %, la FDR empirique de DESeq2 était 11 % sous nul
global équilibré et 13 % sous nul global déséquilibré ; les méthodes
edgeR QL et limma-voom obtenaient environ 4–5 % dans les deux scénarios.
En vérité mixte, les FDR empiriques DESeq2 étaient 6,96 % et 7,09 %.
Ces mesures concernent **le générateur testé et 100 répétitions par cas**.
Elles ne prouvent pas un défaut universel de DESeq2.

Preuve : https://github.com/rberrah/rberrah.github.io/actions/runs/38169339122

Sous nul global, FDP est zéro quand aucun gène n'est appelé et un quand
au moins un gène est appelé. Par conséquent, **FDR moyenne = probabilité
d'au moins une fausse découverte = FWER**, dans ces scénarios uniquement.

## Question scientifique

Quels éléments du générateur et de l'analyse expliquent l'inflation
apparente du risque de faux appel dans les données simulées ? L'objectif
est un diagnostic causalement prudent, pas de chercher une méthode qui
fournit un nombre supérieur de gènes significatifs.

## Plan fixé avant exécution

Le programme `deseq2_fdr_attribution.R` génère des comptages suivant la
même famille de loi binomiale négative que la PR #52, 40 sujets,
400 gènes tous **nuls** et un contraste traité − contrôle.
La correction du lot est incluse dans tous les modèles
`~ batch + condition`.

Cinq cas sont définis sans connaissance des nouvelles sorties :

1. Design original équilibré 20/20, dispersion par gène hétérogène
   U(0,08 ; 0,32), taille de bibliothèque variable, lot observé.
2. Design original déséquilibré 12/28, avec lot partiellement associé au
   groupe (non parfaitement confondu).
3. Comme le cas 1, mais dispersion identique 0,20 pour tous les gènes.
4. Comme le cas 1, mais facteur de bibliothèque fixé à 1 pour tous.
5. Comme le cas 1, mais effet générateur du lot fixé à 0 ; lot toujours
   inclus dans la formule pour conserver la structure du modèle.

**60 réalisations indépendantes par cas** : 300 jeux de données simulés.
Les graines sont indépendantes de celles utilisées par la PR #52.

Pour chaque jeu, trois résultats sont obtenus à partir des **mêmes
comptages, du même modèle et des mêmes dispersions ajustées** :

- DESeq2 Wald normal, avec filtrage indépendant par défaut ;
- DESeq2 Wald normal sans filtrage indépendant, analyse de sensibilité ;
- DESeq2 Wald avec loi t de référence (`useT=TRUE`), option de diagnostic
  explicitement disponible dans la documentation DESeq2. **Aucune
  substitution automatique du workflow utilisateur n'est proposée.**

Les deux dernières variantes sont des analyses de sensibilité non
corrigées pour comparaisons multiples entre méthodes. Les bras modifiés
sont des **refits sur données simulées différentes** : toute différence
observée peut aussi résulter de variations Monte-Carlo ; ne pas attribuer
de causalité unique sur cette seule campagne.

## Mesures et incertitude

Par réalisation : nombre de gènes testés, nombre d'appels BH q ≤ 0,05,
au moins un faux appel, exclusions par filtrage, p-values non finies,
type d'ajustement dispersion et ratio médian dispersion estimée / vraie.

Par cas et variante : proportion de réalisations avec au moins un faux
appel (FWER empirique et donc FDR sous nul global), **intervalle
binomial exact à 95 %** et nombre de réalisations. Les cinq cas sont
analysés sans choisir le plus favorable. Le rapport inclut les échecs
de convergence ou d'installation ; il ne remplace pas les simulations
sur vérité mixte ni les vérifications externes.

**Règle de qualification :** aucune CI réussie et aucun score mesuré ici
ne constituent une certification de FDR contrôlée nominalement à 5 %.
Même 0 faux appel sur 60 études ne prouve pas une FWER < 5 %.
Si une variante présente un résultat favorable, un protocole
indépendant sur de nouvelles graines sera nécessaire avant une
recommandation de modification du moteur.

## Exécution et preuve

```bash
Rscript multiomics-engine/validation/deseq2_fdr_attribution.R tmp/deseq2-fdr
```

Le workflow `.github/workflows/multiomics-deseq2-fdr-attribution.yml`
exécute les véritables packages R et archive les CSV par réalisation,
les synthèses avec intervalles et le manifeste des versions.

Voir également [l'issue #74](https://github.com/rberrah/rberrah.github.io/issues/74).
