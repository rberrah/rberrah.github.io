# MultiOmics — critères de sortie pour un logiciel de recherche (13 octobre 2026)

**Objectif** : produire une analyse mono- ou multi-omique exploitable, transparente et reproductible pour un article scientifique *du chercheur*. Ce document n'annonce ni une certification universelle des analyses, ni un article sur l'outil.

## Décision de diffusion

**Ne pas labelliser « confirmatoire validé » sur la base des seuls tests internes ou du succès CI.** Autoriser une analyse confirmatoire seulement pour les combinaisons de données, plan, modèle et moteur dont les critères ci-dessous sont documentés. Dans les autres cas : exploration explicitement marquée, ou blocage avec explication courte.

## État d'intégration vérifié — 14 octobre 2026

Les changements MultiOmics suivants ont été fusionnés dans `main` après des CI de branche réussies au premier passage :

- #73 : environnement R/Bioconductor figé et rejeu indépendant ; #77 : acceptation navigateur, FDR/puissance et jeux TCGA ; #79 : ZIP du navigateur ; #89 : import MS peak-AUC avec gestion d'état explicite.
- #90 : intention confirmatoire et contraste RNA-seq choisi par le chercheur, transmis à R et contrôlé dans les résultats.
- #91 : export intégral des variables ajustées DESeq2/voom/limma ; limites de transfert et archivage privé local explicites.
- #92 : séparation des tables exploratoires et des CSV R exhaustifs, vérification d'intégrité et ZIP.
- #93 : RNA-seq apparié avec blocage sujet, matrice/metadata concordants, erreurs bloquantes et tests réels de modèles R.
- #94 : aide débutant, template 4 paires/8 échantillons, obligation de R apparié, sans second sélecteur de contraste contradictoire.
- #95 : vraie session Chromium → R/DESeq2 → CSV R complet → ZIP → vérificateur Python ; cohorte publique Airway GSE52778 et confrontation au DESeq2 natif. Tests sur le code assemblé, non sur un ancien backend épinglé.

L'ancienne liste de dépendances #54/#81/#82/#83/#84/#86/#87 correspond aux branches de développement, **pas** à leur intégration effective. Les validations de branche ne remplacent pas la recette du dernier commit déployé. Suivre le SHA de `main`, ses workflows de déploiement, puis le smoke test public. **Ne jamais convertir des CI vertes en certification statistique ou clinique.**

## Alerte scientifique ouverte — inflation FDR sous simulations

La PR diagnostique #75 reste **ouverte et non fusionnée comme correction inférentielle**. Son exécution réelle : [GitHub Actions #38369835987](https://github.com/rberrah/rberrah.github.io/actions/runs/38369835987). Cinq nuls globaux préspécifiés × 60 réalisations, trois variantes DESeq2 par jeu = 900 fits. Pour la variante DESeq2 Wald par défaut, le nombre de jeux avec au moins une fausse découverte est respectivement **10/60, 11/60, 13/60, 7/60 et 6/60**, soit des fréquences observées de **16,7 %, 18,3 %, 21,7 %, 11,7 % et 10,0 %**, dans cet ordre de scénarios (dispersion fixée, tailles de librairies fixées, effet de lot absent, nul initial équilibré, nul initial déséquilibré).

En nul global, cet indicateur est à la fois la fréquence empirique FWER et l'estimateur FDR sur ces simulations ; sa hausse ne prouve pas que DESeq2 soit généralement mal calibré sur des données biologiques réelles. Avec seulement 60 réalisations/scénario, les intervalles de confiance sont larges. Les variantes de test évaluées ne doivent **jamais être choisies a posteriori** d'après leurs faux positifs. L'attribution du signal (génération NB, estimation de dispersion, formulation des tailles de librairie, indépendance, lot, filtrage, tests de référence) exige des contrôles supplémentaires.

Conséquence produit : l'exécution du moteur R et un contrat d'entrée validé ne signifient **pas** `FDR universellement contrôlé à 5 %` ; l'interface et les rapports doivent conserver le statut de revue indépendante requise. Ne pas masquer ce résultat négatif. Distinguer toujours validité du câblage, calibration fréquentiste, validité biologique externe et généralisation prédictive.

## Matrice d'acceptation minimale

| ID | Cas | Vérification observable | Critère bloquant |
| --- | --- | --- | --- |
| R1 | RNA-seq indépendant, comptages entiers | Intention + contraste explicites, matrice/metadata concordants, covariables et lots identifiables | Pas d'inférence confirmatoire par repli sur navigateur |
| R2 | RNA-seq apparié | `subject_id` relie exactement deux conditions, `sample_id` identifie chaque prélèvement, modèle `~ subject_id + condition` ajustable | Une paire incomplète/doublon, modèle déficient ou contraste non défini bloque |
| R3 | Données transformées/non entières | Déclaration du type de données et branche de méthode adéquate | Interdire DESeq2 sur quantification non entière sans justification/méthode adaptée |
| R4 | Protéomique / métabolomique | QC manquants, blanks, dérive, filtres, imputations et limites explicités selon plate-forme | Ne pas inférer de validation biologique générale depuis un QC réussi |
| R5 | Mono-omique et trois omiques | Import réel → exécution moteur réel → rapport → ZIP → réimport | Aucun résultat synthétique maquillé en résultat expérimental |
| R6 | Sorties R | Tous les gènes/features ajustés, NA conservés, IDs et contraste inchangés ; `reference_r/` séparé des exports navigateur | Aperçu 100 lignes / sortie `too_large` ≠ export complet |
| R7 | Archivage | `methods.md`, paramètres, versions, checksums SHA-256, identifiants originaux, scripts de vérification | La corruption d'un octet et un fichier manquant doivent être détectés |
| R8 | Protection | Aucun fichier patient envoyé sans opt-in; ZIP privé explicite ; aucune fuite vers logs/télémétrie | Les données privées ne figurent jamais dans les traces publiques |
| R9 | Accessibilité débutant | Parcours FR/EN sur plan, appariement, groupe de référence, q-value et statut d'analyse | Éviter les contrôles avancés avant le parcours guidé |
| R10 | Reproductibilité externe | Jeu public figé, provenance SHA/versions, comparaison numérique ligne à ligne avec méthode indépendante ou appel de référence | Un benchmark démonstratif seul ne constitue pas validation indépendante |
| R11 | Déploiement | Test depuis l'URL Pages, base path, hydration, import CSV MS AUC, export ZIP et réimport | CI de branche verte mais application publique cassée = échec |

## Qualification statistique — règles non négociables

1. Séparer **erreur de câblage** (wrapper identique à l'appel R natif), **calibration statistique** (type I / FDR sous scénarios), **validité externe biologique** (jeu indépendant) et **validité prédictive** (split hors-échantillon / cohorte externe). Une preuve d'une catégorie ne vaut pas pour les autres.
2. Signaler pour chaque scénario N, taille du groupe, taux de filtrage, dispersion, batch/paired/correlation, pourcentage de NA, méthode et version des packages, seed, nombre de répétitions, faux positifs et incertitudes Monte Carlo.
3. Évaluer FDR réalisé et fréquence de découvertes séparément, avec IC binomiaux ou incertitude de simulation; éviter de conclure sur la moyenne de FDP seule dans les scénarios sans découvertes. Distinguer contrôle FDR et puissance.
4. Ne pas « corriger » une inflation FDR en changeant arbitrairement vers une loi t. #75 doit rester un diagnostic jusqu'à comparaison avec appels natifs, hypothèses, calibrage et erreurs de mise en œuvre.
5. Pour MOFA2/DIABLO et tout gain multi-omique : inclure chaque omique seule, fusion naïve, permutation des appariements, split au niveau sujet/cohorte, métriques de calibration, analyses par sous-groupe et contrôles d'informations fuyantes. Un résultat multi-omique inférieur doit rester visible.
6. Le jeu Airway (GSE52778) teste un design apparié connu. Confronter toutes les lignes, pas seulement les 100 premières, à un appel de référence; confirmer les attentes biologiques sans qualifier un effet isolé de sensibilité universelle.

## Artefacts requis pour chaque scénario

- `data_manifest.json` : provenance, téléchargements, empreintes, conditions de partage, structure des échantillons.
- `analysis_config.json` : plan, intention, contraste directionnel, filtres, méthodes, versions, seed.
- `qc.json` : tailles entrantes/sortantes, avertissements et blocages, décisions reproductibles.
- `reference_r/<method>.csv` : lignes exhaustives *si et seulement si* le backend les a effectivement produites.
- `results_browser/` : résultats d'exploration clairement séparés.
- `methods.md` : texte compréhensible, limites et détails suffisants pour Methods.
- `manifest.json` et vérification hors ligne de l'intégrité de l'archive.
- `validation_summary.json` : statut de chaque gate, version du code, commandement CI, preuves et échecs.

Ces noms constituent un **contrat cible** : ne pas prétendre qu'ils existent tous déjà dans la version publiée. La structure implémentée peut utiliser des chemins équivalents si le manifeste les décrit sans ambiguïté.

## Définition de « prêt pour les chercheurs »

- Un nouvel utilisateur peut réaliser le chemin complet avec une démo documentée puis ses propres fichiers, sans connaître `metadata` ni modèle linéaire à l'avance.
- Chaque analyse indique ce qui a été réellement exécuté (navigateur versus R de référence), le nombre d'échantillons indépendants, les exclusions et les limitations de validité.
- Les erreurs du design sont bloquées avant inférence, jamais converties silencieusement en une autre méthode.
- Le dossier d'export se vérifie, s'ouvre et conserve toutes les variables réellement analysées.
- Des jeux publics **externes** et des contrôles négatifs révèlent aussi les échecs, y compris les cas où intégrer plusieurs omiques n'améliore pas les résultats.
- Un test humain (débutant et expert) reste requis avant de revendiquer une accessibilité démontrée.

**Pas de fusion / déploiement « confirmatoire » avant passage documenté de cette matrice sur le SHA intégré.**
