# MultiOmics — protocole de publication du logiciel et qualification des conclusions

**Statut : code et tests en cours de qualification, pas de validation scientifique universelle.**
Ce dossier est une feuille de route de soumission d'un article de logiciel/méthodes,
distincte d'une validation clinique ou d'une nouvelle analyse confirmatoire.
Date de rédaction : 13 octobre 2026.

## 1. Ce qui peut être archivé dès maintenant

Le script indépendant
`scripts/build_multiomics_publication_artifact.mjs` génère, à partir d'une
**arborescence Git propre**, un dossier d'annexes comprenant :

- `multiomics-research-source.zip` : instantané limité au code du moteur
  navigateur, des adaptateurs R, des méthodes, tests et documents associés
  (pas de matrices patients ni de fichiers MS bruts) ;
- `manifest.json` : SHA du commit, SHA-256 de chaque fichier archivé, SHA-256
  de l'archive, empreinte de `package-lock.json`, versions réellement
  détectées des paquets R, commandes exécutées et leurs statuts ;
- `logs/` : sorties conservées de chaque test réellement exécuté, avec
  empreinte SHA-256 ; « non exécuté » reste **non exécuté** ;
- `README.md` : commandes permettant de cloner le dépôt complet à ce SHA et
  de relancer la suite logicielle (l'archive sélectionnée n'est pas un site
  SvelteKit autonome).

En CI (branche ou PR), le paquet est contrôlé par
`scripts/test_multiomics_publication_artifact.mjs`, avec une obligation de
lancer les **quatre vérifications R de base**. Le paquet source ne contient
aucune prédiction ou statistique non effectivement calculée. Il n'est pas
licite de renommer les vérifications logicielles « validation clinique ».

### Utilisation sous Windows PowerShell

```powershell
git status --short                # doit être vide
npm ci
node scripts/build_multiomics_publication_artifact.mjs --out tmp/multiomics/article-software
node scripts/test_multiomics_publication_artifact.mjs tmp/multiomics/article-software
```

Si R n'est pas installé, `manifest.json` marque chaque contrôle R
`not_run_missing_Rscript`. Pour un dépôt de revue, installer R puis utiliser
`--require-r` **dans les deux commandes**. Les scripts bloquent si un test
effectivement exécuté échoue. Le générateur refuse une copie non commitée
ou un dossier de sortie déjà présent.

### Vérification sur le dépôt GitHub

Workflow : `.github/workflows/multiomics-publication-artifact.yml`.
La PR conserve une archive téléchargeable des sources et des traces de tests,
même lorsqu'une vérification échoue. Le workflow vérifie la **qualité du
logiciel**, pas les propriétés inférentielles des méthodes statistiques.

Avant la soumission, créer un tag versionné, archiver le SHA dans un
dépôt d'archives pérenne et mentionner le DOI final, la licence et les
dépendances. Ne pas inclure les données patient identifiantes, même
pseudonymisées, dans une archive publique.

## 2. État des preuves et conclusion autorisée

| Dimension | Preuve déjà disponible | Interprétation permise | Ce qui manque |
| --- | --- | --- | --- |
| Logiciel et contraintes de fichiers | CI JS et R de base ; préflight des identifiants, plan, répétitions et types de mesures | Plusieurs erreurs courantes sont détectées, pas toutes | Audit de sécurité/charge, suivi de versions des API, cas de panne |
| Méthode sur données simulées | HC3 navigateur comparé à R ; stress sur MNAR, faux positifs, batch | Concordance numérique dans les scénarios testés, limites sévères identifiées | Couverture plus large et hypothèses spécifiées pour chaque moteur |
| RNA-seq de référence | DESeq2, edgeR, limma-voom exécutés sur scénarios nuls et mixtes | Résultats exploratoires de calibration avec **signaux de risque** | Taille Monte-Carlo préspécifiée suffisante, IC suffisamment étroits, validation indépendante |
| Multi-omique réel | Nutrimouse DIABLO/MOFA2 ; contrôles de désappariement et comparateurs mono-omiques | Exécution de méthodes réelles, **pas de gain additif démontré** sur le cas comparé | Cohortes appariées multiples, paramètres figés, réplication externe |
| Prédiction externe | Évaluations MAINZ–TRANSBIG et MAINZ–NKI | Transportabilité limitée, calibration parfois défavorable | Réplication multi-omique externe et calibration appropriée à chaque cible |
| Accessibilité | Navigation/contraste et scénarios automatisés ; protocole débutants | Couverture d'une partie des contrôles automatiques | Sessions débutants et NVDA/VoiceOver réelles, problèmes classés et re-testés |
| Code archivable | SHA Git, sources ciblées, tests et logs, empreintes cryptographiques | Traçabilité et audit d'un état du logiciel | **Environnement R/Bioconductor gelé** (renv + conteneur), versions d'annotation/Reactome/ChEBI |

Ces frontières sont aussi détaillées dans :
- [qualification scientifique](multiomics-research-qualification-2026.md) ;
- [calibration et limites RNA-seq](multiomics-rnaseq-r1-validation.md) ;
- [protocole d'utilisabilité](multiomics-usability-protocol.md) et
  [registre des essais réellement effectués](multiomics-usability-results.md) ;
- [explications publiques détaillées](../static/multiomics/scientific-validation.md).

## 3. Étude de validation qui permettrait un article méthodologique

Ne pas sélectionner les jeux d'essai ou les métriques après observation des
résultats. Enregistrer un protocole d'analyses **avant** les nouveaux tests.

1. **Méthode par méthode :** définir l'estimand, l'unité d'indépendance,
   le modèle d'erreur, les cas bloquants et les contrastes admissibles.
   Ne pas appliquer un test RNA-seq de comptages à des intensités MS.
2. **Vérité artificielle contrôlée :** simuler au minimum des scénarios
   sous nul global, vérité mixte, petites cohortes, déséquilibre, batch
   mesuré et confondu, mesures manquantes MCAR/MAR/MNAR, analyses répétées
   et désappariement ; rapporter FDP par jeu, FDR empirique, puissance,
   biais et couverture **avec incertitude sur les jeux indépendants**.
3. **Méthodes de référence :** réaliser un comparatif contre une
   implémentation R indépendante ; même matrice, même plan et mêmes
   paramètres déclarés. Une différence de décision doit être expliquée.
4. **Données publiques réelles :** répliquer un résultat **défini à
   l'avance** sur au moins une cohorte non employée pour construire le
   pipeline ; identifier précisément ce qui était connu à l'avance.
5. **Intégration multi-omique :** comparer aux **meilleurs modèles
   mono-omiques** évalués sur les mêmes sujets et mêmes partitions,
   avec choix et prétraitement inclus dans les folds d'entraînement.
   Inclure un désappariement négatif.
6. **Rapport complet :** afficher échecs, non-convergence, ablations,
   exclusion de sujets, taux de données manquantes, nombre de tests,
   paramètres gelés, versions, sensibilité aux normalisations.
   Conserver les résultats nuls/négatifs.
7. **Reproductibilité environnementale :** déposer le snapshot de
   dépendances R/Bioconductor et des bases d'annotation à la date de
   calcul ; identifier les systèmes sur lesquels le résultat a été
   reconstruit par une deuxième personne.

Un résultat « 0 fausse découverte sur 8 ou 12 études » ne démontre pas
un contrôle de la FDR à 5 %. La taille nécessaire dépend de la précision
demandée, des scénarios et des méthodes comparées : **ne pas fixer
arbitrairement 100, 400 ou 1000 réplications comme certificat universel**.

## 4. Accessibilité, pour un chercheur sans programmation

Préserver l'interface actuelle **une seule omique ou plusieurs**, l'import
guidé et les mots simples avant les termes statistiques. Mesurer séparément :

- taux de réussite sans aide pour charger la démo mono-omique, lancer
  l'analyse, comprendre sujet/échantillon/mesure, exporter les méthodes ;
- capacité à identifier un exemple de mauvais appariement et la limite
  des q-values ;
- lisibilité à 320 px et à zoom 200 %, clavier seul, NVDA et VoiceOver ;
- qualité de l'information sur l'exécution R requise, indisponible ou
  effectivement réalisée. Ne jamais faire passer le navigateur exploratoire
  pour l'exécution du moteur Bioconductor.

Réutiliser le protocole existant (M1–M8), publier les incidents anonymisés
et distinguer **non testé** de **réussi**. Il ne faut ni inventer des
participants ni annoncer la conformité WCAG sur la seule base de tests DOM.

## 5. Parcours pédagogique PK/PD : après la qualification

Les quatre cours FR/EN de `/pharmacometrie/domaines/` existent déjà ;
le pont réciproque avec MultiOmics relève de la PR dédiée #70.
La prochaine étude de cas sera un exemple **entièrement synthétique**
comparant un modèle PopPK de base à un modèle comportant une signature
omique avec évaluation sur de nouveaux sujets. Les covariables sélectionnées,
leur normalisation et leurs coefficients seront définis dans les seules
données d'entraînement. Une telle démonstration enseigne le workflow ;
elle ne prouve pas le bénéfice clinique d'une véritable signature.

### Formulation possible pour un article de logiciel

> MultiOmics is an open-source, deterministic exploratory and study-design-
> aware platform for single- and multi-omics analysis. The codebase includes
> reference R method adapters, reproducible software checks, transparent
> failure gates and domain-restricted benchmark reports. A passing software
> test is not an independent validation of the biological or statistical
> conclusions drawn from new data.
