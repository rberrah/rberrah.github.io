# Qualification biologique indépendante — MultiOmics / Airway GSE52778

> **Statut :** validation d'intégration sur données biologiques publiques, **pas** certification scientifique universelle, ni validation clinique, ni réplication sur une cohorte indépendante.
>
> **Audit reproductible :** [PR #84](https://github.com/rberrah/rberrah.github.io/pull/84) ; [exécution GitHub Actions 38465980430 — SUCCESS](https://github.com/rberrah/rberrah.github.io/actions/runs/38465980430). Les chiffres ci-dessous sont extraits du véritable rapport JSON émis dans l'artefact `airway-GSE52778-biological-reference-validation` du workflow (conservation CI : 60 jours).

## Données et question biologique

Source : package Bioconductor `airway`, Himes et al., *PLOS ONE* 2014, e99625, **GEO GSE52778**, PMID 24926665. Huit prélèvements de **quatre lignées / unités biologiques** humaines de muscle lisse bronchique : pour chaque lignée, un échantillon contrôle non traité (`untrt`) et un échantillon sous dexaméthasone (`trt`). Les huit mesures ne constituent donc **pas huit donneurs indépendants**.

Question : les transcrits répondent-ils au traitement, **en contrôlant la lignée cellulaire** ?

- Plan DESeq2 : `~ cell + condition`, et non `~ condition` seul.
- Contraste : `condition trt versus untrt` ; le signe positif signifie une expression accrue sous dexaméthasone.
- Préfiltrage prédéfini et commun aux deux analyses : comptage ≥ 10 dans au moins 2 des 8 prélèvements.
- La comparaison se fait sur **les mêmes variables testées**, le même contraste, le même plan, avec les mêmes règles NA/FDR.

## Résultats réellement vérifiés — 13/10/2026

| Élément | Valeur |
|---|---:|
| Version de R | 4.5.2 |
| Bioconductor airway | 1.30.0 |
| DESeq2 | 1.50.2 |
| Unités biologiques indépendantes | 4 (appariées) |
| Échantillons observés | 8 (4 traités, 4 témoins) |
| Gènes dans les données d'origine | 63 677 |
| Gènes conservés après préfiltrage | **17 199** |
| Gènes écartés avant ajustement | 46 478 |
| Lignes CSV R conservées | **17 199 / 17 199** |
| Gènes q BH < 0,05 sur les variables testées | 4 100 |
| CRISPLD2 (`ENSG00000103196`) log2 fold-change, traité/témoin | **+2,63** |
| CRISPLD2 q BH | **2,0511 × 10⁻⁴⁵** |

Un appel séparé de `DESeq2::DESeqDataSetFromMatrix`, `DESeq2::DESeq` et `DESeq2::results`, réalisé sur les mêmes entrées avec `~ cell + condition`, est comparé à `run_deseq2_counts`. Pour les 17 199 transcrits, les **écarts numériques maximaux observés sont nuls** pour `baseMean`, `log2FoldChange`, `lfcSE`, `stat`, `pvalue` et `padj` dans ce run. La position des valeurs manquantes est également identique. Le CSV réimporté puis le CSV traversant JSON conservent l'intégralité des variables, leurs identifiants, et les q-values.

Le signe de CRISPLD2 est biologiquement cohérent avec le résultat rapporté dans la littérature. C'est un **contrôle de plausibilité prédéfini**, pas une estimation indépendante de la sensibilité ou de la spécificité.

## Comment reproduire

Depuis la racine du dépôt avec R 4.5.2, Bioconductor 3.22 et les packages `airway`, `DESeq2`, `jsonlite` :

```bash
PMX_AIRWAY_REPORT_DIR=airway-evidence Rscript multiomics-engine/tests/test_public_airway_reference_replay.R
```

Le code source doit être exécuté avec un backend contenant `multiomics-engine/reference_full_results.R`, tel que la [PR #81](https://github.com/rberrah/rberrah.github.io/pull/81). Dans le workflow #84, cette dépendance est épinglée au commit `f75bcbfc1c8538751eeb26eb5a666b7f94b7442c` ; les données viennent du **package public `airway`**, sans recopier de données de patients privées. Le rapport `airway_public_reference_replay.json` est généré à l'exécution.

La validation englobe l'analyse réelle, la fidélité de son wrapper R, l'identité des résultats de référence et l'intégrité du tableau exporté. Elle ne comprend pas encore la preuve que la **page web sait configurer le plan apparié Airway sans erreur**.

## Limites et corrections restantes

1. **Même algorithme sous-jacent :** l'appel de contrôle utilise aussi DESeq2. Il ne s'agit donc pas d'une validation statistique indépendante par edgeR/limma-voom ; cette dernière est à faire sur plusieurs cohortes avec des critères et des seuils pré-spécifiés.
2. **Plan apparié dans l'UI :** [issue #85](https://github.com/rberrah/rberrah.github.io/issues/85). Le backend actuel n'exécute automatiquement DESeq2/voom que dans le parcours de groupes indépendants. Un appariement Airway ne doit surtout pas être maquillé en analyse indépendante.
3. **Vraie réplication externe :** un deuxième jeu public de source indépendante, les contrôles de lots, la puissance et le comportement FDR restent à documenter avant toute qualification plus large.
4. **Grandes tables et confidentialité :** [PR #81](https://github.com/rberrah/rberrah.github.io/pull/81) teste séparément la rétention locale optionnelle pour les exports dépassant le budget JSON ; ces fichiers ne doivent jamais être transmis automatiquement à un serveur tiers.
5. **Logiciel de recherche, pas outil clinique :** les utilisateurs restent responsables du plan expérimental, des exclusions, de l'annotation moléculaire, des vérifications biologiques et des versions logicielles.

**Références** : Himes et al. 2014 (doi:10.1371/journal.pone.0099625) ; [package Bioconductor airway](https://www.bioconductor.org/packages/release/data/experiment/manuals/airway/man/airway.pdf) ; [atelier DESeq2 Bioconductor — plan `~cell + dex`](https://bioconductor.github.io/BiocWorkshops/rna-seq-data-analysis-with-deseq2.html).
