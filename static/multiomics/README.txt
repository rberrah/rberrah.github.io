Pipeline multi-omique PMx Explain — guide simple des fichiers et méthodes
=======================================================================

FRANÇAIS
========

LECTURE RAPIDE — LES MOTS UTILISÉS DANS L’OUTIL
=================================================

L’interface affiche d’abord le sens pratique. Le terme technique reste disponible entre parenthèses ou dans l’aide « ? » lorsque cela est utile pour la reproductibilité.

- Tableau des échantillons = metadata / sample sheet. Il indique qui a été étudié, quel prélèvement a été analysé, dans quel groupe et à quel moment.
- Matrice = tableau contenant les valeurs mesurées. Les lignes sont des gènes, protéines ou métabolites ; les colonnes correspondent aux mesures des échantillons.
- Critère étudié = outcome / endpoint. Exemple : réponse au traitement, concentration, score, décès ou délai jusqu’à un événement.
- Série technique = batch. Exemple : plaque, jour, run ou lot technique.
- Facteur d’ajustement = covariable. Exemple : âge, sexe, centre ou traitement concomitant.
- Variable biologique = feature. Selon la couche, il s’agit d’un gène, d’une protéine ou d’un métabolite.
- Résultat corrigé = q BH / FDR. Il tient compte du grand nombre de variables testées simultanément.
- Validation croisée = évaluation d’une prédiction sur des sujets qui n’ont pas servi à construire le modèle.

1. TABLEAU DES ÉCHANTILLONS
===========================

Le tableau des échantillons ne contient pas les milliers de valeurs moléculaires. Il explique simplement à l’outil à quoi correspondent les colonnes des matrices.

Colonnes essentielles :
- subject_id : qui ? participant, animal, culture ou unité biologique indépendante ;
- sample_id : quel prélèvement ? Le même identifiant relie les mesures provenant du même prélèvement ;
- assay_id : quelle mesure ? Il doit correspondre exactement à une colonne de la matrice concernée ;
- omic : quel type de mesure ? transcriptomics, proteomics ou metabolomics.

Colonnes utilisées selon l’étude :
- condition : groupe ou traitement ;
- timepoint : visite ou moment expérimental ;
- batch : série technique ;
- technical_replicate : répétition technique ;
- outcome : critère étudié ;
- survival_time : durée de suivi ;
- survival_event : événement observé, 0/1 ;
- sample_type : biological / pooled_qc / qc / blank pour les workflows MS ;
- injection_order : ordre d’injection MS ;
- toute autre colonne peut être sélectionnée explicitement comme facteur d’ajustement.

Exemple :
P001 / P001_T0 / RNA001  / transcriptomics
P001 / P001_T0 / PROT001 / proteomics
P001 / P001_T0 / MET001  / metabolomics

Lecture : P001 est la même personne ; P001_T0 est le même prélèvement ; RNA001, PROT001 et MET001 sont trois mesures différentes de ce prélèvement.

2. CONTRÔLE QUALITÉ ET FAISABILITÉ
===================================

Avant l’interprétation, l’outil vérifie notamment :
- nombre de sujets dans chaque groupe ;
- déséquilibre éventuel entre groupes ;
- nombre de sujets présents dans chaque couche omique ;
- chevauchement réel des sujets entre les omiques ;
- complétude des temps de suivi pour les études longitudinales ;
- valeurs manquantes ;
- variables constantes ou presque jamais observées ;
- mesures atypiques ;
- accord entre répétitions techniques ;
- structure globale des données par ACP de contrôle qualité ;
- série technique et risque de confusion avec le groupe ou le temps.

Ces diagnostics sont enregistrés dans `preAnalysisDiagnostics` avec trois niveaux simples :
- ready : aucun problème déterministe détecté ;
- usable_with_cautions : analyse possible mais certaines limites doivent être prises en compte ;
- review_required : au moins un problème de design ou de qualité doit être revu avant de mettre en avant les conclusions biologiques.

La puissance statistique n’est volontairement PAS déduite du seul nombre de sujets. Une estimation défendable de puissance nécessite au minimum un effet attendu, une variabilité et le modèle prévu ; pour les designs multi-omiques complexes, une approche par simulation est préférable.

Pour LC-MS/GC-MS, lorsque sample_type et injection_order sont fournis :
- blanks et pooled-QC ne sont pas traités comme des échantillons biologiques ;
- les signaux associés aux blanks sont signalés par défaut plutôt que supprimés automatiquement ;
- la dérive instrumentale peut être corrigée à partir des pooled-QC ordonnés ;
- la stabilité des pooled-QC peut être contrôlée par RSD ;
- aucune imputation MNAR n’est effectuée par défaut ;
- l’option « left-censored » est une hypothèse explicite et doit être accompagnée d’une analyse de sensibilité sans imputation.

3. DIFFÉRENCES TECHNIQUES ET FACTEURS D’AJUSTEMENT
===================================================

Une série technique totalement confondue avec le groupe, le temps ou un critère catégoriel bloque l’inférence : l’outil ne prétend pas séparer deux effets impossibles à distinguer.

Lorsque cela est possible, les séries techniques et facteurs d’ajustement choisis par l’utilisateur sont inclus directement dans le modèle statistique.

Aucun facteur d’ajustement n’est choisi automatiquement.

4. QUESTIONS AUXQUELLES L’OUTIL PEUT RÉPONDRE
==============================================

Explorer les données
- résumer les grandes tendances communes entre couches ;
- méthode navigateur : ACP multi-blocs équilibrée ;
- chaque couche est standardisée et pondérée pour éviter qu’une couche contenant beaucoup plus de variables domine artificiellement.

Comparer des groupes
- comparer les groupes en tenant compte du plan d’étude ;
- estimer l’amplitude et le sens des différences ;
- corriger les résultats pour les nombreux tests par Benjamini-Hochberg ;
- comparer les relations entre couches omiques sur les sujets réellement présents dans les deux couches.

Étudier l’évolution dans le temps
- relier les mesures répétées d’un même sujet ;
- modèle longitudinal à intercept aléatoire ;
- interaction groupe × temps lorsque le plan le permet ;
- les études crossover restent bloquées tant que période et séquence ne sont pas explicitement modélisées.

Relier les données à un critère
- continu : régression linéaire ;
- oui/non : régression logistique ;
- comptage : Poisson ;
- plusieurs catégories : comparaison multiclasse ajustée ;
- survie : Cox ;
- lorsque plusieurs temps omiques existent, le temps moléculaire utilisé doit être choisi explicitement.

5. MÉTHODES R DE RÉFÉRENCE
===========================

Le navigateur possède son moteur déterministe. Un backend R optionnel permet d’exécuter les implémentations de référence lorsque R est disponible.

Méthodes actuellement routées :
- RNA-seq en comptes bruts : DESeq2 ET edgeR + limma-voom lorsque les deux sont installés ;
- matrices normalisées/log : limma ;
- mesures répétées : lmerTest ;
- enrichissement sur statistique classée : fgsea ;
- intégration non supervisée : MOFA2 ;
- intégration supervisée catégorielle : mixOmics DIABLO.

Pour les comptes RNA-seq, l’outil ne force pas un consensus artificiel. DESeq2 reste une analyse complète, edgeR/limma-voom constitue une analyse de sensibilité indépendante, et un résumé de concordance indique :
- corrélation entre statistiques ;
- nombre de gènes significatifs par méthode ;
- chevauchement des gènes significatifs ;
- accord sur le sens de l’effet.

Un désaccord entre méthodes est donc visible plutôt que masqué.

Installation du backend :
Rscript multiomics-engine/install_backend_dependencies.R

Démarrage :
Rscript multiomics-engine/run_backend.R

Adresse locale par défaut :
http://127.0.0.1:8787

GitHub Pages ne démarre pas R lui-même. Un serveur distant doit ajouter TLS, authentification, limites de taille et restriction d’origine avant de recevoir des données de recherche.

6. ASSOCIATION ET PRÉDICTION SONT DEUX QUESTIONS DIFFÉRENTES
============================================================

L’analyse variable par variable demande : quelles molécules sont associées au critère ?
La prédiction demande : peut-on prévoir le critère chez un nouveau sujet ?

La validation prédictive disponible utilise des séparations apprentissage/validation sans fuite d’information :
- sélection de variables uniquement dans l’apprentissage ;
- ajustements estimés uniquement dans l’apprentissage ;
- centrage, mise à l’échelle et imputation calculés uniquement dans l’apprentissage ;
- réglage interne de la pénalisation ;
- prédiction finale sur des sujets non utilisés pour construire le modèle.

Métriques :
- binaire : AUC, accuracy, log-loss ;
- multiclasse : accuracy ;
- continu / comptage : RMSE et R² hors échantillon ;
- survie : Cox ridge avec réglage interne et C-index de Harrell sur les folds externes.

Une validation externe indépendante reste nécessaire avant tout usage clinique.

7. DONNÉES MANQUANTES
=====================

- aucune imputation cachée dans les tests différentiels ou corrélations ;
- les relations entre deux omiques utilisent les sujets présents dans les deux couches ;
- une couche entière absente peut être tolérée pour certaines analyses exploratoires si cela a été déclaré ;
- cette tolérance exploratoire n’invente jamais de valeurs pour les tests différentiels.

8. INTERPRÉTATION BIOLOGIQUE
============================

Reactome est utilisé pour replacer les résultats dans des voies biologiques connues.
L’ensemble des variables réellement conservées après contrôle qualité sert de référence lorsque le mapping le permet.
L’outil indique également combien de couches omiques soutiennent indépendamment une même voie.

9. IDENTIFIANTS
===============

Résolution conservative :
- transcriptomique : Ensembl et symboles de gènes ;
- protéomique : UniProt / Ensembl ;
- métabolomique : ChEBI, noms exacts et alias déterministes ;
- InChIKey : correspondances UniChem vers ChEBI ;
- HMDB : conversion explicite HMDB → ChEBI via UniChem ;
- KEGG Compound : recherche exacte dans ChEBI à partir de l’identifiant KEGG ; une conversion n’est acceptée que si un seul identifiant ChEBI unique est retourné ;
- PubChem CID : conversion explicite PubChem → ChEBI via UniChem lorsque l’utilisateur a déclaré ce type d’identifiant ;
- une conversion externe n’est acceptée que si elle conduit à une correspondance ChEBI unique ;
- plusieurs correspondances sont signalées « ambiguous » et aucune n’est choisie automatiquement ;
- l’absence de correspondance reste « unresolved ».

Cette politique privilégie l’absence de mapping à un mapping biologiquement incertain.

10. RAPPORT REPRODUCTIBLE
=========================

Chaque analyse peut enregistrer :
- version du moteur ;
- description de l’étude ;
- correspondance des colonnes ;
- contrôle qualité et prétraitements ;
- diagnostic de faisabilité avant interprétation ;
- facteurs d’ajustement ;
- séries techniques ;
- empreintes des fichiers d’entrée ;
- résultats statistiques ;
- intégration multi-omique ;
- validation prédictive ;
- résultats Reactome.

Téléchargements disponibles : JSON complet, CSV par couche et rapport HTML autonome.

11. COMMENT LIRE LES PRINCIPAUX RÉSULTATS
==========================================

- Amplitude / fold ratio : taille et sens du changement.
- p : résultat du test avant correction pour les nombreux tests.
- q BH / FDR : résultat corrigé pour les nombreux gènes, protéines ou métabolites testés.
- Pattern : forme générale du changement observé.
- r groupe de référence / r groupe comparé : force de la corrélation dans chacun des groupes.
- Δr : différence de corrélation entre groupes.
- FDR avec l’univers mesuré : enrichissement corrigé en utilisant comme référence les variables réellement mesurées.
- Nombre de couches concordantes : combien d’omics soutiennent indépendamment la même voie.

Les détails statistiques restent accessibles via les aides « ? », mais le libellé principal privilégie le sens biologique.

12. VALIDATION PUBLIQUE
=======================

La suite automatisée comprend notamment Nutrimouse, TCGA breast, IntLIM NCI-60/BRCA, AgingHFCD, STATegra, LRRK2 G2019S, PaintOmics à signal multi-omique planté et missRows NCI-60.

Les benchmarks cherchent des résultats attendus et ne vérifient pas uniquement que le code s’exécute.

13. LIMITES ENCORE IMPORTANTES
==============================

La pipeline est utilisable sur des matrices déjà produites. Les limites principales restantes sont :
- le traitement MS brut/vendor n’est pas pris en charge : peak picking, alignment, adducts/isotopes, standards internes, carry-over et corrections instrument-spécifiques restent en amont ;
- le mapping chimique repose sur des correspondances explicites vers ChEBI et ne tente volontairement pas de résoudre automatiquement les annotations m/z/temps de rétention ambiguës ;
- le déploiement distant du backend R doit être sécurisé avant réception de données de recherche ;
- une validation externe indépendante reste nécessaire pour tout modèle prédictif clinique ;
- la puissance statistique complète n’est pas automatiquement calculée : elle nécessite des hypothèses d’effet/variance et, pour les designs complexes, une simulation dédiée.

ENGLISH
=======

Plain-language rule: the interface shows the practical meaning first and keeps the technical term in help text or parentheses when needed for reproducibility.

Examples: metadata = sample sheet; outcome = endpoint; batch = technical series; covariate = adjustment factor; feature = measured gene/protein/metabolite; BH q/FDR = multiple-testing corrected result.

The browser pipeline implements an explicit sample-sheet contract, modality-aware QC, adjusted models, repeated-measures models, partial-block handling, balanced multiblock integration, leakage-safe cross-validated prediction, Reactome interpretation and conservative identifier resolution.

Pre-analysis diagnostics now summarize group balance, cross-omics subject overlap, missingness, repeated-measure completeness and batch structure. Statistical power is deliberately not inferred from sample size alone.

The optional reference R backend routes DESeq2, edgeR/limma-voom, limma, lmerTest, fgsea, MOFA2 and DIABLO. Raw RNA-seq counts can be analysed with both DESeq2 and edgeR/limma-voom, with an explicit concordance summary rather than hidden method substitution.

Metabolite mapping uses UniChem for explicit HMDB, PubChem CID and InChIKey links to ChEBI. KEGG Compound identifiers are resolved by an exact ChEBI cross-reference search and accepted only when one unique ChEBI accession is returned. Ambiguous cross-database mappings are never forced.

Remaining limits include full vendor/raw MS processing, secure remote R deployment, dedicated power simulations for complex designs and independent external clinical validation.
