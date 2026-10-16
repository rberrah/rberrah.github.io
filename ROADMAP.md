# Roadmap - PMx Explain

Mise à jour : 2026-10-16.
Lot actuel : validation scientifique, validation pédagogique et reproductibilité.
Le site et Shiny ont ete deployes separement. Publier le site seul ne met pas
Shiny a jour. Voir [le suivi de publication](docs/deployment-status.md).

Ce document regroupe les demandes recentes et les pistes des deux discussions
avec les agents. Il ne vaut pas autorisation de changer les licences, de rendre
un depot prive, de migrer les services ou de publier des contenus tiers.

Les nouveaux lots utilisent six statuts cumulatifs : `implemented` →
`CI verified` → `publicly verified` → `author reviewed` →
`independently reviewed` → `user tested`. Un statut n'implique jamais les suivants. Les anciennes cases
`[x]` décrivent uniquement le périmètre technique indiqué ; elles ne prouvent
ni revue scientifique indépendante ni test utilisateur.
Les pistes marquees **A arbitrer** ou **Exploratoire** ne sont pas des engagements.
Priorites : P0 = fondations ; P1 = prochain lot ; P2 = suite ; P3 = conditionnel.
Chaque lot doit avoir ses propres tests et peut etre livre sans refonte globale.

## Phase actuelle de validation

| Chantier | Statut actuel | Prochaine preuve requise |
| --- | --- | --- |
| Trois chapitres logiciels FR/EN (`pmetrics-nonparametric`, `nlmixr2-moteur`, `tools-nlmixr2`) | `implemented` | Relecture auteur, puis revue indépendante et scellement des fichiers exacts |
| Starter 12 → validation/VPC/NPDE → Bayésien/TDM → logiciels → infectiologie | `implemented` pour le contenu | Exécuter la file de revue dans cet ordre et consigner source, reviewer, date et résolution |
| `NPAGSupportPoints.svelte` | `implemented` | Relecture indépendante des poids, masses marginales et limites d'interprétation |
| Tests débutants, étudiants, enseignants et pharmacométriciens | non commencé | Sessions sans guidage selon le protocole, puis résultats anonymisés |
| Accessibilité clavier, zoom 200 %, 320 px, NVDA, VoiceOver et mobile réel | `CI verified` pour axe-core et les parcours clavier automatisés | Audit manuel sur appareils et technologies d'assistance réels ; l'automatisation ne valide ni NVDA, ni VoiceOver, ni zoom ou appareil physique |
| Non-rétention et confidentialité | `CI verified` pour le contrat du dépôt | Auditer journaux, `/tmp`, erreurs, exports et isolation de deux sessions sur l'hébergement public selon `docs/privacy-nonretention-audit.md` |
| Pmetrics | `CI verified` en local/dépôt | Backend public explicitement indisponible tant qu'un hébergement avec chaîne R/Rust compatible n'est pas validé |
| Traçabilité de la bibliothèque de modèles | `implemented` et générée pour 46/46 | Faire vérifier indépendamment les équations, domaines chiffrés et écarts aux articles consignés dans `docs/tdm-model-traceability.md` |
| Cas de référence reproductible par modèle | `CI verified` pour 8/46 | Étendre progressivement et ajouter des sorties issues d'un logiciel/source indépendant ; ne pas confondre non-régression et reproduction scientifique |
| Diagnostics TDM | `CI verified` pour les signaux numériques | Relecture utilisateur des messages et validation méthodologique ; convergence, rareté des données, bornes et covariance ne prouvent pas l'identifiabilité |
| Provenance des artefacts ML | `CI verified` pour 46/46 artefacts : contrat, split patient, domaines, métriques et empreintes modèle/RDS/DALEX | Revue indépendante des domaines et protocoles déclarés ; la complétude du registre ne constitue pas une validation externe |
| Transferts Simulation → Lego → TDM/DDI/PD | `CI verified` pour les contrats et parcours principaux | Revue utilisateur des fiches transféré/non transféré/unités/limites et complétion des anciens ponts si nécessaire |
| Graphe pédagogique transversal | `CI verified` pour la navigation générique | Revoir avec des utilisateurs si les liens comprendre → pratiquer → expérimenter → intégrer sont compris et utiles |
| Comparaisons A/B des laboratoires | `CI verified` pour 15/15 laboratoires | Vérifier avec des débutants la compréhension des écarts et du contrefactuel oncologique |
| Support Lego complexe | `CI verified` pour le sous-ensemble borné | Étendre au-delà des expressions autorisées, administrations alternatives sélectionnables et sorties combinées linéaires sans prétendre restaurer un projet d'estimation complet |
| Communication NetPK du 14 octobre 2026 | `implemented` : `Presented / Présenté`, pages FR/EN et métadonnées régénérées | `CI verified` par la règle générique interdisant un statut `upcoming` après la date de présentation ; publication publique à vérifier après déploiement |
| Actions et dépendances Node 20/24 | `implemented` pour les actions officielles | Confirmer les nouveaux majors sur les prochains runs GitHub Actions ; `punycode.js` reste transitif via `markdown-it` et aucun usage direct de `url.parse()` n'est détecté dans le projet |

**Gel de périmètre :** pas de nouveau grand laboratoire, de nouvelle grande
rubrique, de refonte UI globale ni de multiplication de cours avant l'avancement
mesurable de la revue scientifique, des tests utilisateurs et de la
reproductibilité.

## 0. Maturation pédagogique (2026-10-08)

- [x] Corriger les raccourcis du tronc commun : conversion micro/macro, créatinine/DFG, allométrie, objectif MAP simplifié et suivi de la warfarine.
- [x] Recentrer le parcours débutant sur les concepts avant les algorithmes d'estimation et ajouter un diagnostic avant/après de six concepts isomorphes.
- [x] Afficher une relecture scientifique en attente lorsque `updated_on` est postérieur à `reviewed_on`.
- [x] Rendre `prerequisites` et `glossary` explicites et obligatoires dans les 95 chapitres ; enrichir d'abord le tronc commun.
- [x] Étendre la recherche au texte des cours et aux liens directs ; remplacer le cas logiciel générique par une synthèse NONMEM/Monolix/nlmixr2.
- [x] Aligner citation, licence, portail, inventaire, nom PMx Explain et suites de tests statistiques.
- [ ] Exécuter le protocole `docs/usability-accessibility-protocol.md` avec des débutants, étudiants, enseignants et experts, puis consigner les observations sans les guider.
- [ ] Exécuter l'audit manuel clavier, zoom 200 %, 320 px, NVDA, VoiceOver et appareils réels ; consigner les résultats dans `docs/usability-accessibility-results.md`.
- [x] Relire scientifiquement les 23 versions signalées, en français puis en anglais, et aligner leurs dates de relecture.
- [x] Vérifier les prérequis réels des chapitres intermédiaires et avancés et relier les concepts utiles au glossaire.
- [x] Enrichir le glossaire structurant et ajouter unités, hypothèses, erreurs fréquentes, limites et ressources associées.

**Décision de périmètre :** aucun nouveau laboratoire majeur avant les observations utilisateurs. Les améliorations correctives, d'accessibilité et de continuité restent autorisées.

## Portail Academique (2026-09-14 / 15)

### Infectiologie PK/PD (2026-09-20)

- [x] Ajouter l'atelier infectiologie dans PD et le pont vers Shiny, avec bibliotheque PK/code libre ou reprise du TDM.
- [x] Calculer les indices PK/PD et comparer deux posologies stationnaires en PTA populationnelle/posterieure, y compris model averaging.
- [x] Tester les indices analytiques, unites, alea reproductible, covariance, invalidation et le connecteur EUCAST en lecture seule.
- [x] Verifier le transfert site vers Shiny, rapports, invalidation, mobile/ordinateur et regressions du moteur TDM.
- [x] Simplifier les champs CMI, k et cible; remplacer les deux posologies par une posologie actuelle et une grille min/max/pas/intervalles.
- [x] Ajouter l'illustration graphique du site et le retour des vraies courbes d'exposition/PTA depuis R, avec invalidation.
- [x] Placer PD generale avant oncologie et infectiologie; separer covariables patient et coefficients avances; prendre les unites de la bibliotheque automatiquement.
- [x] Raccorder les trois ateliers a l'estimation PK mapbayr dans Analyse, avec retour a l'atelier et reprise du posterior. Test d'une vraie estimation et absence de substitution ML.
- [x] Alleger l'oncologie : toxicite optionnelle, libelles explicites et reglages avances replies. Verifier les cinq parcours navigateur cibles, dont les unites d'un code PK importe, et les tests R PK/PD, PTA, oncologie et TDM.
- [x] Remplacer les concentrations d'illustration par la PK IV du modele : E(t)/C(t) a deux axes, puis E(C); retour des profils R pour les PK libres.
- [x] Ajouter une PTA IV 1 compartiment sur le site, avec variabilite PK explicite; remplacer AntibioMIC par des references methodologiques primaires.
- [x] Ajouter les blocs Exposition / CMI / Cible dans Shiny et une grille de doses/intervalles avec selection du comparateur en oncologie.
- [x] Remplacer la saisie libre de la mesure oncologique par un menu Tumeur / Neutrophiles (ANC), avec validation serveur.
- [x] Publier le site (Pages `ef0a96d`) et Shiny (bundle `12580315`); verifier les courbes mobile/ordinateur, la grille oncologique, le menu de mesures et la PTA IV sur les URL publiques.
- [ ] Validation clinique, cibles sourcees par population/site infectieux, liaison variable aux proteines, modeles de toxicite et de destruction bacterienne.

Perimetre, sources et limites : [infectiologie](docs/infectiology.md).

### Publications Et Talks (2026-09-15, local)

- [x] Ajouter neuf volets de lecture : syntheses sourcees des articles et posters, contexte de la correspondance, abstracts des deux manuscrits fournis par l'auteur.
- [x] Conserver les DOI et lier directement l'abstract PAGE 2025 ; ajouter des liens partageables vers chaque volet.
- [x] Distinguer publications, abstracts de congres et versions de travail ; ne copier aucun DOCX, PPTX, ZIP ou dossier clinique dans le site.
- [x] Controles reussis : 17 tests navigateur (clavier, liens directs, sans JavaScript, mobile et themes), captures inspectees et 3 tests de configuration du portail. Modifications locales, non publiees.
- [ ] Videos Djamzi Studio : ajouter uniquement des exports finaux approuves, avec sous-titres et transcription ; aucun lecteur vide ni diaporama provisoire.

Sources et procedure de mise a jour : [fiches de recherche](docs/research-details.md).

### Origine Publique (2026-09-15, publie)

- [x] Centraliser l'origine du site et du portail dans `PUBLIC_SITE_ORIGIN`, sans changer `/pharmacometrie/`.
- [x] Deriver metadonnees, citations, sitemaps, robots et origine autorisee du compteur ; conserver les liens externes.
- [x] Resoudre les marqueurs du portail apres assemblage et bloquer un build provenant d'une autre origine.
- [x] Builds et assemblages verifies sur le domaine de test et celui par defaut ; 16 tests compteur sur chaque origine, 13 tests portail, 3 tests de configuration, check et tests de contenu reussis. Commit `2e9a3d1` publie et verifie sur Pages.
- [ ] Avant une migration reelle : configurer DNS/Pages, les sites Internat/Stats et l'origine autorisee du pont Shiny, puis redeployer ce moteur separement.

Configuration et controles : [origine publique](docs/site-origin.md).

### Portail Publie

- [x] Recentrer la racine sur Racym Berrah, quantitative pharmacology, pharmacometrics et AI.
- [x] Ajouter Tools & Projects, Publications & Talks et Other Projects ; conserver les URL historiques.
- [x] Verifier les DOI, la contribution egale albumine et les communications PAGE ; ne pas inventer de statut de manuscrit.
- [x] Conserver les applications, modeles, contrats, licences et comportement du compteur ; aucune donnee ni PDF ajoute.
- [x] Verifier les sept pages, le clavier et les themes sur mobile/ordinateur : 13 tests navigateur.
- [x] Build de production complet, check sans erreur ni avertissement, tests de contenu et 12 tests de regression du compteur.
- [x] Revue locale validee : commit/push autorises le 15 septembre ; lien public TacDDI ajoute, GRAD reste sans lien.

Details : [refonte minimale du portail](docs/refonte/06-academic-portal.md).

## Ateliers Specialises (2026-09-13 / 14)

Revue locale terminee ; commit et publication Pages autorises par l'utilisateur.

- [x] Explorer : Translator, PK, PD, DDI, Advanced ; laboratoires et simulation sous Simuler.
- [x] Extraire l'editeur compartimental partage ; PK limite sa palette aux blocs PK, Advanced conserve les blocs metabolite/PD et les entrees complexes.
- [x] Separer l'import de code dans Translator, sans changer les equations ni masquer les refus de conversion.
- [x] PD / oncologie : un seul menu par structure, sans palette redondante ; blocs selectionnables et inspecteurs separes. PK generale de base : IV 1 compartiment (CL, V, dose, intervalle, perfusion).
- [x] DDI : menu unique des sept mecanismes, deux PK independantes, reprise explicite de la PK sur la molecule choisie.
- [x] Advanced : un seul graphe compartimental, sans sous-pages PD/DDI. Blocs TGI (trois croissances, Emax, resistance) et interaction (sept mecanismes appliques a un flux k/CL/Vmax), en plus des blocs existants.
- [x] Advanced : exemples PK + Ce + TGI et PK + auto-inhibition + TGI ; liens d'information distincts des transferts de masse ; courbes par unite, TGI traite / non traite.
- [x] Etendre le contrat Lego a la version 4 pour ces nouveaux blocs, avec regeneration R securisee. Versions 1-3 conservees. Aucun C++ arbitraire active.
- [x] Conserver les brouillons uniquement en memoire lors des navigations ; aucun code personnel dans une URL ou dans le stockage du navigateur.
- [x] Maintenir les anciennes URL et les contrats existants vers le moteur R.
- [x] Verifier les parcours navigateur, les allers-retours KOKA/PP6M dans les trois formats, les transferts Shiny locaux et les vues ordinateur/mobile. Un modele genere dans PK a ete compile et simule dans le moteur PD local.
- [x] Apres revue : commit `5b86ccd`, push, workflow Pages reussi et verification des cinq routes publiques dans Chromium. Shiny non redeploye.
- [x] GoatCounter : compteur commun portail/SvelteKit, sans parametres d'URL ni donnees saisies ; confidentialite FR/EN et desactivation. Dix tests navigateur passes, build et check valides. Aucun suivi ajoute dans Shiny.

Ce lot ne cree pas de traducteur universel. Le graphe Advanced couple maintenant
PK, modulation de flux et TGI, mais les entrees dosees paralleles partagent une
meme dose. Deux calendriers medicamenteux independants restent dans DDI.
Les effets sur les volumes ou une fraction metabolisee ne sont pas des blocs
Advanced de ce lot. Les nouveaux exports gardent leur specification embarquee
pour un aller-retour exact ; cela ne rend pas tout code externe importable.
Le pont TDM conserve l'observation PK : il ne fait pas d'ajustement tumoral
automatique a partir d'un bloc TGI.
Les tests couvrent aussi la navigation Advanced / PD, le passage du
code DDI vers Translator, le choix independant de PK 1 / PK 2 et la validation
d'un parametre dont l'inspecteur a ete masque. Les brouillons disparaissent
au rechargement ; les exports volontaires restent a la main de l'utilisateur.

## 1. Etat actuel

- [x] Portail statique a `/` et application SvelteKit a `/pharmacometrie/`, assembles par le workflow Pages.
- [x] Moteur R/Shiny deploye independamment : TDM, interactions, PD generale et oncologie exploratoire.
- [x] Cours bilingue, parcours, exercices, activités guidées, cas de synthèse, visualisations et laboratoires. Les comptes ne sont plus maintenus ici : voir [l'inventaire généré](docs/content-inventory.md). Ils ne constituent pas une validation scientifique globale.
- [x] Bibliotheque indexee de 46 modeles ; import/export des dossiers TDM, rapports, reglages d'erreur residuelle, plusieurs types de cibles et comparaison des doses futures.
- [x] Entrainement ML reutilisable et artefacts multi-modeles presents ; comparaison MAP/ML et explications disponibles. Leur disponibilite ne prouve pas une validation externe pour chaque molecule.
- [x] Ateliers DDI et PD : schemas/courbes sur le site, transfert vers Shiny et import JSON ; PK libre selon les restrictions du moteur public.
- [x] Oncologie : historique des doses en tableau editable, observations en tableau, comparaison sans traitement / maintien / modification sur une meme figure.
- [x] Boutons DDI remis dans le defilement normal ; verification ordinateur/mobile apres deploiement.
- [x] Lego : exports mrgsolve, MLXTRAN et NONMEM ; covariables continues/categorielles ; imports controles et refus explicites des structures non representees.
- [x] Imports Samtani PP1, T'jollyn PP6 et Magnusson PP3 testes ; valeurs scalaires manquantes initialisees a 1 et signalees.

**Encore incomplet :** Korell oral, le combine oral/LAI et les control streams
NONMEM complexes ne sont pas fidelement importables. L'audit actuel accepte
4/46 modeles de la bibliotheque en schema generique. Cela ne signifie pas que
les 42 autres modeles sont inutilisables nativement dans le moteur TDM.
Voir [audit d'import](docs/lego-import-audit.md) et
[audit aller-retour](docs/lego-roundtrip-audit.md).

## 2. Regles transversales

- **G01 / P0 — CI verified locally.** Le contrat statique, Playwright et le test R couvrent stockage, URL, journaux navigateur, traces désactivées, erreur d'import, isolation session A/session B et suppression des répertoires après calcul interrompu. Les journaux, `/tmp` et crashs de l'hébergement public restent `public verification pending` selon [l'audit de non-rétention](docs/privacy-nonretention-audit.md).
- [x] **G02 / P0 — CI verified.** Avant upload, l'audit de `dist/` refuse extensions et archives inattendues, noms patients/temporaires, documents hors allowlist et secrets à motif fort. Les PDF institutionnels locaux restent ignorés par Git.
- **G03 / P0 — CI verified.** La valeur par défaut, le script de déploiement et tous les workflows publics sont contrôlés : `ALLOW_CUSTOM_MODELS=true` fait échouer le garde-fou. Toute ouverture future exige un service isolé ; un dépôt privé ne remplace pas ces protections.
- **G04 / P0 — implemented.** Les manifestes distinguent contrat logiciel, régression déterministe et reproduction de source. La revue scientifique indépendante et la validation externe restent `pending`.
- **G05 / P0 — implemented, public verification pending.** Les limites cliniques et le renvoi ABIS sont conservés ; leur présence publique doit être revérifiée après chaque déploiement majeur.

Les partages par URL seront limites aux scenarios pedagogiques integres et aux
parametres synthetiques autorises. Aucune donnee patient, aucun code personnel
et aucun jeton ne doivent se retrouver dans une URL. Un export local volontaire
ou une soumission de modele pour publication doit rester une action explicite.

## 3. Architecture : modulariser puis decider d'une extraction

### Position retenue pour la planification

Conserver le portail et le cours ensemble. Clarifier les frontieres des outils
scientifiques dans le depot actuel, sans deplacer tous les fichiers ni creer
une API REST par principe. Shiny constitue deja un service distinct de Pages.
Les ateliers Lego, DDI, PD, oncologie, la bibliotheque et le ML doivent etre pris
en compte : la frontiere ne se resume plus a la page TDM.

| Responsabilite | Emplacement actuel | Direction |
| --- | --- | --- |
| Portail et cours | `portal/`, `src/content/`, routes pedagogiques | Rester publics et assembles comme aujourd'hui |
| Ateliers et interfaces d'outils | `src/routes/lego`, `tdm`, `interactions`, `pharmacodynamie` | Garder les URL, clarifier les composants et contrats |
| Calcul pedagogique dans le navigateur | `src/lib/sim/`, `src/lib/utils/`, visualisations | Fonctions testables reutilisees par les animations |
| Moteur scientifique | depot autonome `rberrah/MIPD-Engine`; miroir de transition `tdm-engine/` | Consommer un SHA qualifie, puis retirer le miroir apres cut-over public |
| Modeles et metadonnees | source autonome MIPD ; instantane public `static/tdm/` encore suivi | Verifier chaque instantane contre le SHA MIPD epingle avant publication |
| Echanges entre applications | `src/lib/tdm/`, specifications Lego et validateurs R | Contrats versionnes, compatibilite et validation des deux cotes |

- [x] **A01 / P0** Mettre le README en accord avec le portail, le cours et le deploiement Shiny separe ; lier cette roadmap.
- **A02 / P0 — CI verified.** La source statique, les copies moteur, les deux catalogues, les métadonnées et le manifeste de traçabilité des 46 modèles sont comparés automatiquement ; une divergence bloque la suite PMx.
- **A02b / P0 — CI verified.** Les générateurs de catalogues, communications, inventaires, matrice Lego et graphe pédagogique sont rejoués en CI puis `git diff --exit-code` interdit toute dérive avant le build.
- **A03 / P0 — CI verified for primary transfers.** Les nouveaux payloads Simulation/Lego/TDM/DDI/PD portent un contrat v3 (champs, unités, pertes, transformations, limites), les payloads v1/v2 restent lisibles et les incompatibilités explicites sont refusées par test. L'inventaire machine-readable `docs/tool-transfer-inventory.json` distingue les ponts v3, legacy v1/v2 et les exports auxquels le contrat ne s'applique pas ; son test vérifie les points d'implémentation.
- **A04 / P0 — CI verified / extraction complete.** MultiOmics est maintenu et qualifié dans `rberrah/MultiOmics`. PMx ne conserve plus son moteur, ses routes Svelte, ses assets ni ses tests scientifiques ; il consomme un SHA immuable, monte l'artefact vérifié sur `/multiomics/` et conserve les anciennes URL comme alias de compatibilité.
- [ ] **A05 / P1** Extraire progressivement de `app.R` et des grosses pages les ensembles de responsabilites qui ralentissent les modifications, en reutilisant les modules Shiny deja presents. Aucun deplacement massif sans gain verifiable.
- [ ] **A06 / P1** Identifier et isoler les anciens composants illustratifs non utilises ; ne pas les reintroduire comme calculs scientifiques fiables. Charger les visualisations a la demande apres mesure du poids et des temps de chargement.
- [ ] **A07 / P2 - A arbitrer** Decider public/prive, licences, bibliotheque contributive et eventuelle valorisation avec l'auteur et les interlocuteurs institutionnels pertinents. Une bibliotheque communautaire publique n'impose pas un moteur public, mais son acces et ses contributions doivent rester possibles.
- [x] **A08 / P2 - CI verified upstream.** Le moteur et la bibliotheque sont extraits dans `rberrah/MIPD-Engine`, avec runtime R verrouille, qualification autonome et deploiement independant. PMx epingle un SHA immuable et verifie sa CI ainsi que la parite des 46 modeles.
- [ ] **A09 / P2 - Cut-over en cours.** Le contrat consommateur externe couvre catalogue, sources et imports Lego. Il reste a verifier le deploiement autonome et les transferts publics avant de supprimer le miroir `tdm-engine/` et les anciens workflows R/Pmetrics de PMx.
- [ ] **A10 / P2** Definir une politique d'artefacts : versions, empreintes, provenance, compatibilite R/mrgsolve/xgboost, taille et droits. Les 98 RDS actuels occupent environ 6,2 Mio ; pas de migration LFS urgente ni de reecriture d'historique. Etudier releases/LFS uniquement si la croissance mesuree le justifie, avec recuperation reproductible au deploiement.

**Sortie du lot architecture :** le site et le moteur peuvent etre testes et
deployes independamment ; aucun ancien import n'est casse ; aucune copie de
modele ne peut diverger silencieusement. Deux depots ne sont pas un critere de
reussite en soi.

### Points strategiques a ne pas confondre

Le code actuel porte une licence MIT. Rendre un futur depot prive ne rend pas
secretes les copies deja diffusees ; GitHub indique notamment que les forks
publics restent publics. La politique des futurs developpements doit etre
verifiee avec les titulaires de droits et les licences des dependances, sans
promesse juridique de recuperer l'exclusivite du code existant.
Sources : [licence MIT](https://opensource.org/license/mit),
[visibilite des depots GitHub](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/managing-repository-settings/setting-repository-visibility).
Le JavaScript livre au navigateur reste consultable meme si son depot est prive.
Une page `/tools/` peut orienter vers Shiny ; GitHub Pages n'execute pas le moteur R.

## 4. Laboratoires interactifs inspires de PhET

Objectif commun : predire -> manipuler -> observer -> expliquer. S'appuyer sur
les visualisations existantes, sans recreer une plateforme de cours parallele.
Les experiences doivent relier plusieurs representations et une question
scientifique explicite, selon les [principes PhET](https://phet.colorado.edu/en/about).

- [x] **L01 / P1 - Pilote local** Experience deux compartiments : quantites central/peripherique, echanges, elimination, concentration et curseur temporel synchronises ; prediction sur l'effet initial de Q.
- [x] **L02 / P1 - Pilote local** Lecture/pause, remise a zero, pas temporel et vitesse ; entrees numeriques, modele actuel et reference figee sur les memes axes. Modifier un parametre relance l'experience a t=0, sans inventer une administration. Les libelles A/B sont remplaces par Modele actuel / Reference.
- [x] **L03 / P1** Vues Intuition / Equations, prediction facultative et explication causale dans les quatre laboratoires fondamentaux. Cas simule retire au profit de la comparaison avec la reference.
- [x] **L04 / P1 - Pilote local** Bilan de masse, positivite, unites et cas limites ; dix scenarios compares au code mrgsolve exporte et regenere par R. Precision des petits taux preservee dans le generateur Lego.
- [x] **L05 / P1 - Pilote local** FR/EN, menu clavier, captures 320/390/768/1440 px, theme sombre, pixels non vides, mouvement reduit, pause hors scene et tableaux numeriques controles. Reservoirs/particules explicitement symboliques. Audit complet par lecteur d'ecran encore a faire.
- [x] **L05b / P1 - Retour utilisateur du 13/09** Particules sur les trajets aller/retour et vers l'elimination ; Lecture utilisable avec mouvement reduit et commandes visibles seules ; activation volontaire des particules. Sept tests navigateur passes, dont pixels des trois trajets, pause et retour au meme instant.
- [x] **L05c / P1 - Animation approfondie, verifiee localement** Identite conservee pour chaque particule, agitation et passages continus, particule traceuse, sonde de concentration deplacable et accessible au clavier, couleurs par dose, ralenti, lecture dans la scene et courbe progressive. Valeurs quantitatives toujours issues du modele PK continu, distinctes des trajectoires illustratives. Huit tests navigateur passes ; tests des identites, administrations, transitions continues, cas limites et geometries mobiles passes.
- [ ] **L06 / P1** Integrer le meme laboratoire dans le chapitre et dans Simulation. Observer son usage par quelques etudiants/enseignants avant de generaliser ; noter les incomprehensions et corrections necessaires.
- [x] **L05d / P1** Animation cochee sans lecture automatique, suivi et sonde decoches ; trois options dans la meme barre. Courbe C(t) semi-log sous la courbe lineaire et ajout a l'export PNG.
- [x] **L05e / P1** L05d publie, deploiement Pages reussi et neuf tests navigateur passes sur le site public. Shiny HTTP 200 conserve l'ancien acquittement client, sans le transfert teaching serveur. Comparaison documentee dans `docs/deployment-status.md`.
- [x] **L08b / P1** Absorption orale/biodisponibilite et perfusion IV/arret : trajets depot/poche -> central -> elimination, perte presystemique distincte, reference, courbes lineaire/semi-log, bilans et reperes PK. Onze scenarios compares a une EDO mrgsolve independante et au code Lego regenere ; cinq nouveaux tests navigateur, dont pixels en mouvement, pause, mobile et FR/sombre. Les neuf tests precedents passent aussi.
- [x] **L08c / P1** Publication demandee par l'utilisateur apres la revue locale ; retrait du bouton Particule suivante dans les quatre laboratoires. Selection directe et clavier conservees. Aucun deploiement Shiny dans ce lot.
- [x] **L08d / P1 - CI verified** Les transferts directs Absorption/Perfusion vers TDM, DDI et PD conservent la voie, le compartiment d'administration, la dose, l'intervalle et la duree de perfusion. Seize scenarios JS deterministes et 32 comparaisons mrgsolve entre export et regeneration R couvrent les administrations ; un test navigateur parcourt les six destinations.
- [x] **L07 / P2** Accumulation : doses répétées, état stationnaire, fluctuations, dose de charge, interruption et référence comparative.
- [x] **L08 / P2** PK à un compartiment / absorption : dose, CL, V, ka, F, voie, exposition, Cmax/Tmax et demi-vie sous leurs hypothèses de validité.
- [x] **L09 / décision de périmètre** La variabilité reste une animation de cours (`12_VariabilitySandbox`) : comparaison de courbes et distributions, sans faux parcours moléculaire ni laboratoire séparé.
- [x] **L10 / décision de périmètre** La mise à jour bayésienne reste une animation de cours (`BayesUpdate`) : prior, observations et posterior, sans scène vidéo artificielle. Un futur laboratoire doit représenter un trajet ou une transformation de molécules.
- [x] **L11 / P1** Parent-métabolite : transformation, éliminations parallèles, exposition retardée et bilan de masse en équivalents de quantité.
- [x] **L12 / P1** Dépôt longue action : libération lente, injections répétées, accumulation et cinétique flip-flop.
- [x] **L13 / P1** Élimination saturable : capacité limitée par `Vmax`, relation non proportionnelle dose-exposition et comparaison à une référence.
- [x] **L14 / P1** Cycle entérohépatique : plasma, bile, intestin, réabsorption et pertes sur des voies animées distinctes.
- [x] **L15 / P1** TMDD : liaison réversible, turnover de la cible, saturation, internalisation du complexe et clairance linéaire parallèle.
- [x] **L16 / P1** Site d’effet : biophase conceptuelle, retard `ke0`, relation Emax et réponse superposée à la concentration plasmatique.
- [x] **L17 / P1** PD générale : exposition plasmatique, engagement saturable de la cible et réponse biologique retardée par turnover.
- [x] **L18 / P1** Oncologie : comparaison sur un graphique unique entre croissance sans traitement et inhibition tumorale conditionnelle sous cycles répétés, avec émergence de résistance.
- [x] **L19 / P1** Infectiologie : exposition répétée, seuil de CMI, charge bactérienne prédite et temps individuel au-dessus de la CMI, distinct d’une PTA de population.
- [x] **L20 / P1** Covariable poids-volume : reservoir liquidien redimensionne par `V = Vref (WT/WTref)^beta`, plage d’illustration explicite de 40 a 120 kg et comparaison de concentration a dose identique.
- [x] **L21 / P1** Scenes specialisees : jauge d’engagement de cible et trois modeles PD, cellules sensibles/resistantes en oncologie, tube CMI et culture bacterienne, filtre saturable et liaison/internalisation TMDD. Toutes les scenes restent pilotees par les etats ODE.
- [x] **L22 / P1** Manipulation directe : les onze laboratoires ODE permettent de cliquer ou deplacer un controle integre au mecanisme, avec synchronisation immediate du parametre, de la simulation et des courbes.
- [x] **L23 / P1** Lecture conjointe : schema interactif et trajectoires sont affiches cote a cote sur grand ecran et recalcules pendant la lecture, sans remise a zero du temps.

Dependances : L01-L06 n'attendent pas une separation des depots. Les animations
statistiques des cours restent indépendantes du moteur de laboratoires moléculaires.

`/laboratoires/` publie désormais les quinze laboratoires et les relie aux cours concernés. Le chantier restant est l'observation avec des utilisateurs (L06), pas la reconstruction d'Accumulation ou d'Absorption. Voir [hypothèses et vérifications](docs/teaching-laboratories.md).

## 5. Lego : import fidele des modeles complexes

- **K01 / P1 — CI verified for the bounded subset.** L'AST accepte alias, sommes, produits, puissances, fonctions autorisées et condition catégorielle ternaire ; budgets de profondeur/complexité et liste blanche empêchent l'évaluation arbitraire. Les blocs `if` généraux restent refusés.
- [x] **K02 / P1** Premier cas cible : Korell oral. Contributions additives a CL et plafond CrCL representes ; divergences des exemples Cirincione/Korell documentees et exemples locaux corriges d'apres les sources.
- [x] **K03 / P1** Effet lineaire additif propage dans l'interface, le calcul navigateur, les exports mrgsolve/MLXTRAN/NONMEM et la regeneration R securisee. Les valeurs manquantes restent a 1 avec avertissement.
- **K04 / P2 — CI verified for the bounded subset.** Le Builder préserve les administrations alternatives importées avec leurs cibles, fractions, compléments, délais et entrées d'ordre zéro. L'utilisateur choisit l'administration active pour la simulation et l'export ; toutes les branches restent dans la spécification versionnée. Des calendriers indépendants simultanés relèvent toujours de DDI et ne sont pas fusionnés implicitement.
- **K05 / P2 — CI verified for linear named outputs.** Les sorties nommées composées de sommes ou différences pondérées de quantités et concentrations sont conservées, affichées et sélectionnables comme prédiction dans les exports nlmixr2, mrgsolve, MLXTRAN, NONMEM et Pmetrics. Les transformations non linéaires ou ambiguës restent signalées sans approximation.
- **K06 / P2 — CI verified for parser/round-trip scope.** Les tests couvrent métadonnées présentes/absentes, covariables, équations, KOKA/PP6, exemples redistribuables et modèles de bibliothèque. La reproduction native propriétaire reste distincte.
- **K07 / P2 — implemented.** Une matrice générée de 240 contrôles publie `exact`, `structural only` ou `rejected` avec raison. Les harnesses NONMEM et Monolix rapportent `not-executed` sans licence et ne peuvent produire `passed` qu'après exécution native.
- [ ] **K08 / P3 - Exploratoire** Etudier separement IIV/IOV, covariance, erreurs residuelles, covariables variant dans le temps et melanges de populations. Une conversion de schema deterministe ne restaure pas un projet complet d'estimation.

**Sortie Korell :** equations preservees, valeurs/unites explicites, tests
numeriques independants et aller-retour dans les trois formats ; les parties
non representees restent signalees/refusees. A03 et L04 fournissent des bases
communes mais K01-K03 ne doivent pas attendre l'eventuelle extraction A08.

## 6. Navigation et continuite pedagogique

- [x] **U01 / P2 - Local** Menu Apprendre / Explorer / Construire / Analyser / Ressources, entrees par objectif dans l'accueil et le portail ; URL existantes conservees.
- [x] **U02 / P2 - CI verified** Chaque chapitre relie maintenant comprendre (définition, intuition, équations et erreurs fréquentes), pratiquer, laboratoire disponible et cas transversal du parcours. Les prérequis et termes de glossaire restent visibles en amont ; la pertinence pédagogique doit encore être testée avec des utilisateurs.
- [x] **U03 / P2 - CI verified** La recherche ouvre directement les activités et les treize cas de synthèse. Les laboratoires reliés suivent prédiction, manipulation, observation, explication et application, avec retour au cours et aux exercices, sans badges ni gamification obligatoire.
- **U04 / P2 — CI verified for primary paths.** Les fiches visibles sont complétées par un contrat v3 machine-readable indiquant champs, unités, voie, compartiment, calendrier, pertes, transformations et limites ; les contrats v1/v2 restent lisibles. La reprise du posterior reste limitée à la session moteur. Les anciens ponts et les exports hors contrat sont recensés dans `docs/tool-transfer-inventory.json`.
- [x] **U05 / P2** Mode enseignant des laboratoires : scenarios numeriques reproductibles, resultats masquables/revelables, CSV/PNG et partage valide par liste blanche. Sans compte, suivi d'eleve ni stockage automatique de scenario.
- [x] **U06 / P2 - CI verified** Les 4 laboratoires fondamentaux et les 11 parcours moléculaires affichent une référence stable, les paramètres modifiés et les écarts numériques au temps choisi. L'oncologie compare explicitement le contrefactuel sans traitement au scénario traité. Ces laboratoires sont déterministes ; une graine devra être conservée si une simulation aléatoire est ajoutée.

**U04 verifie en CI sur les parcours principaux :** laboratoire -> Lego / TDM / DDI / PD,
avec confirmation et liste des elements repris ou omis. TDM reprend le calendrier
complet dans une nouvelle session sans concentrations ; Lego reprend la premiere
dose, DDI/PD leur propre schema repete. La generalisation aux autres simulations
et la reprise entre sessions independantes ne sont pas annoncees comme acquises.

**Preuves U02/U03/U06 :** contrôle de contenu sur 95 chapitres, 114 activités et
13 cas de synthèse ; build statique ; tests Chromium ciblés sur le graphe de
chapitre, le retour au cours, la comparaison PK et les onze parcours moléculaires.
Ces preuves vérifient le logiciel, pas l'efficacité pédagogique, qui relève de L06.

## 7. Bibliotheque, MIPD, ML, DDI et PD

- **S01 / P0 — implemented as a structured inventory for 46/46.** DOI, population, voies, unités, structure, paramètres, covariables, IIV, erreur, adaptations, MAP et limites sont générés dans `docs/tdm-model-traceability.json`. La vérification article par article reste `independent review pending`.
- **S02 / P1 — CI verified for 8/46 deterministic cases.** Huit modèles prioritaires ont un profil numérique figé. Ce sont des régressions logicielles, pas des reproductions indépendantes ; extension et références externes restent requises.
- [x] **S03 / P1 - CI verified** Les regressions couvrent SS a t=0 et doses suivantes, equivalence jours relatifs/dates calendaires apres normalisation, affichage et export conditionnels des incertitudes et de la LLOQ, covariables reportees au prelevement, erreur residuelle fixee, parametres aux bornes et cibles simples/combines. Ce sont des tests logiciels ; ils ne valident ni un modele source ni une decision clinique.
- [x] **S04 / P1 - CI verified** Le registre des 46 artefacts consigne et contrôle cible/fenêtre AUC, voie et mode, modèle source et empreinte, logiciel, population, schéma de variables, domaines d'entraînement et règles de prélèvement. Maintenir la règle actuelle de deux concentrations dans un même intervalle tant qu'un autre contrat n'est pas entraîné et vérifié.
- [ ] **S05 / P2 - partially CI verified** Les 46 contrats imposent graines, separation developpement/holdout par patient simule, absence de recouvrement controlee a l'entrainement, domaines, empreintes, artefacts/explications et metriques sur une AUC24 commune. Les tests couvrent model averaging complet et refus de l'estimation agregee si un artefact manque. Les erreurs par sous-groupe et une partition de validation distincte du holdout restent a produire lors du prochain reentrainement ; elles ne sont pas deduites des artefacts actuels.
- [ ] **S06 / P2** Evaluer la generalisation du ML par molecule et contexte. La validation externe d'une methode sur le tacrolimus ne valide pas automatiquement tous les nouveaux artefacts ; un accord MAP/ML n'est pas une preuve d'exactitude. Conserver l'usage experimental et les avertissements hors domaine.
- [x] **S07 / P2 - CI verified** L'application et le rapport rendent visibles convergence de l'optimiseur, concentrations par rapport aux ETA, proximité des bornes et disponibilité/stabilité numérique de la covariance postérieure. Le texte précise que ces signaux ne démontrent ni identifiabilité ni validité clinique ; leur compréhension reste à tester avec les utilisateurs.
- [ ] **S08 / P2** DDI : clarifier concentrations libres/totales, unites de Ki/EC50, choix du parametre affecte, plancher d'effet et recuperation des mecanismes dynamiques. Verifier l'equivalence atelier/JSON/script R/C++ et distinguer code autonome et code attendant des entrees externes.
- [ ] **S09 / P2** PD/oncologie : cas documentes par molecule, sensibilite/identifiabilite, diagnostics d'ajustement et comparaisons de scenarios. L'incertitude ou une optimisation posologique demandent un lot scientifique specifique ; aucun passage implicite des structures illustratives a un protocole clinique.
- [ ] **S10 / P2** Bibliotheque contributive : faciliter la proposition par formulaire/issue/PR, controles automatiques et revue humaine. Articles comme sources, remerciement facultatif du contributeur ; pas de token client, de push automatique non relu ni de collecte de donnees patients.
- [ ] **S11 / P3 - Exploratoire** DDI mecanistique plus detaillee (fractions metabolisees, transporteurs), combinaisons anticancereuses ou nouveaux modeles statistiques. Perimetre, sources et validation a definir avant developpement.

## 8. Contenus multimedia et identite

- [ ] **M01 / P2** Ajouter objectifs, hypotheses, erreurs frequentes et liens cours/laboratoire/exercice aux contenus Markdown existants. Les videos reutilisent cette source ; pas de deuxieme base de verite.
- [ ] **M02 / P2** Definir un vocabulaire graphique commun : compartiments, doses, flux, elimination, recepteurs, prelevements et courbes ; memes significations et couleurs dans le site, les figures et les capsules.
- [ ] **M03 / P2 - A evaluer** Visionner les videos originales avant de retenir un format. Le texte fourni decrit les videos mais ne permet pas d'en verifier le contenu scientifique ou la qualite.
- [ ] **M04 / P2** Piloter une microcapsule whiteboard de 30-90 s liee au premier laboratoire : transcription, sous-titres FR/EN, image d'attente, chargement a la demande et relecture avant publication. Pas de lecture automatique.
- [ ] **M05 / P3** Shorts sociaux : contenus d'acquisition renvoyant au concept/laboratoire, separes du cours ; pas de gameplay impose dans l'apprentissage.
- [ ] **M06 / P3** Videos longues structurees par question -> intuition -> experience -> equations -> cas. Hebergement et poids a mesurer ; pas de gros catalogue video ajoute au Git par defaut.
- [ ] **M07 / P2** Pipeline editorial : brouillon genere -> controles -> relecture scientifique explicite -> publication. Ne pas automatiser la publication de contenu IA sans revue.

## 9. Ordre de livraison et suivi

| Lot | Contenu | Condition de fin |
| --- | --- | --- |
| 0 | A02-A04, G01-G05, S01-S04 | Contrats identifies, tests courts en CI, perimetres scientifiques et confidentialite documentes |
| 1A | L01-L06 | Un laboratoire deux compartiments exact, accessible, relie au cours et observe avec des utilisateurs |
| 1B | K01-K03, puis K06 pour Korell | Korell importe sans approximation cachee, calcul/export navigateur et R coherents |
| 2 | L07-L08, U01-U06, K04-K07 | Accumulation, continuite pedagogique et combine oral/LAI selon tests de chaque sous-lot |
| 3 | S05-S10, M01-M04 et M07 | Qualite des outils et contenus renforcee, premier pilote multimedia relu |
| Decision | A07-A10 | Extraction/public-prive seulement apres arbitrage et preuve de deploiement autonome |
| Plus tard | K08, S11, M05-M06 | Perimetre et benefice confirmes avant implementation |

Les lots 1A et 1B sont independants apres leurs fondations : les animations
n'attendent pas tous les imports complexes, et les imports n'attendent pas une
refonte visuelle. Aucun calendrier chiffre n'est engage a ce stade.

Pour chaque livraison : cocher uniquement les taches terminees, noter le commit,
les tests executes, les limites restantes et le deploiement concerne. Les tests
doivent couvrir les anciennes donnees exportees et les nouvelles fonctions.
Conserver des scenarios entierement synthetiques et un retour arriere deployable.

## 10. Arbitrages ouverts

- [ ] Valider l'ordre relatif du pilote pedagogique et de Korell, sans bloquer les fondations communes.
- [ ] Decider de la visibilite future du moteur, de la bibliotheque et des nouveaux developpements ; ne pas changer automatiquement les licences actuelles.
- [ ] Preciser les molecules/cas prioritaires pour approfondir PD/oncologie et la validation externe ML.
- [ ] Identifier les enseignants/etudiants disponibles pour tester le premier laboratoire, sans collecte automatique de leurs donnees.

Cette roadmap est le point de suivi unique. Les audits techniques restent dans
`docs/` et les instructions d'execution dans les README ; ne pas dupliquer leur
etat dans plusieurs listes concurrentes.
