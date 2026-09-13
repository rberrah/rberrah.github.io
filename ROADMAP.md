# Roadmap - Pharmacometrie Pratique

Mise a jour : 2026-09-13. Etat publie de reference : commit `0bf97dc`.
Le lot laboratoires/navigation/enseignant ci-dessous est local, non publie.

Ce document regroupe les demandes recentes et les pistes des deux discussions
avec les agents. Il ne vaut pas autorisation de changer les licences, de rendre
un depot prive, de migrer les services ou de publier des contenus tiers.

Statuts : `[x]` livre et verifie pour le perimetre indique ; `[ ]` a faire.
Les pistes marquees **A arbitrer** ou **Exploratoire** ne sont pas des engagements.
Priorites : P0 = fondations ; P1 = prochain lot ; P2 = suite ; P3 = conditionnel.
Chaque lot doit avoir ses propres tests et peut etre livre sans refonte globale.

## 1. Etat actuel

- [x] Portail statique a `/` et application SvelteKit a `/pharmacometrie/`, assembles par le workflow Pages.
- [x] Moteur R/Shiny deploye independamment : TDM, interactions, PD generale et oncologie exploratoire.
- [x] Cours : 88 chapitres FR/EN, 99 exercices, 56 visualisations utilisees ; controles de contenu et recalcul de 23 reponses numeriques. Ces comptes ne constituent pas une validation scientifique globale.
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

- [ ] **G01 / P0** Auditer la non-conservation : pas de donnees patients ni de modeles personnels sauvegardes automatiquement, dans les journaux, le navigateur, le serveur ou les traces de test. Verifier aussi la suppression des fichiers temporaires et l'isolation des sessions.
- [ ] **G02 / P0** Verifier les paquets de publication : aucun PDF institutionnel, supplement protege, secret ou dossier patient, meme pseudonymise. Les modeles publics relus et les artefacts issus de simulations restent distincts des imports personnels.
- [ ] **G03 / P0** Conserver la compilation C++ arbitraire desactivee sur le serveur partage. Toute ouverture future exige un service isole avec limites de ressources, reseau et systeme de fichiers restreints ; un depot prive ne remplace pas ces protections.
- [ ] **G04 / P0** Distinguer explicitement : demonstration pedagogique, verification numerique, reproduction d'article et validation externe. Aucun badge de validation ne doit provenir uniquement d'un test ou d'un champ de metadonnees.
- [ ] **G05 / P0** Maintenir les limites cliniques et le renvoi vers ABIS dans Statut, les rapports et les parcours concernes. Les fonctions experimentales ne deviennent pas automatiquement des recommandations.

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
| Moteur scientifique | `tdm-engine/` | Tests et deploiement independants ; extraction possible plus tard |
| Modeles et metadonnees | `static/tdm/`, generateurs, copies dans `tdm-engine/models/` | Une source identifiee et des sorties generees deterministes |
| Echanges entre applications | `src/lib/tdm/`, specifications Lego et validateurs R | Contrats versionnes, compatibilite et validation des deux cotes |

- [x] **A01 / P0** Mettre le README en accord avec le portail, le cours et le deploiement Shiny separe ; lier cette roadmap.
- [ ] **A02 / P0** Cartographier les dependances catalogue -> generateurs -> copies -> ateliers -> moteur et identifier les fichiers sources / derives. Verifier qu'une generation repetee ne change pas le contenu.
- [ ] **A03 / P0** Formaliser les contrats existants, sans les remplacer aveuglement : versions des ateliers et dossiers, unites, voie/compartiment, messages de transfert, acquittements, erreurs et compatibilite avec les exports precedents.
- [ ] **A04 / P0** Ajouter a la CI les tests actuellement lances localement. Le workflow Pages actuel controle l'assemblage mais ne lance pas toutes les suites. Separer controles contenu/frontend, imports Lego et tests R ; commencer par les tests courts puis programmer les compilations longues.
- [ ] **A05 / P1** Extraire progressivement de `app.R` et des grosses pages les ensembles de responsabilites qui ralentissent les modifications, en reutilisant les modules Shiny deja presents. Aucun deplacement massif sans gain verifiable.
- [ ] **A06 / P1** Identifier et isoler les anciens composants illustratifs non utilises ; ne pas les reintroduire comme calculs scientifiques fiables. Charger les visualisations a la demande apres mesure du poids et des temps de chargement.
- [ ] **A07 / P2 - A arbitrer** Decider public/prive, licences, bibliotheque contributive et eventuelle valorisation avec l'auteur et les interlocuteurs institutionnels pertinents. Une bibliotheque communautaire publique n'impose pas un moteur public, mais son acces et ses contributions doivent rester possibles.
- [ ] **A08 / P2 - Conditionnel** Extraire d'abord le moteur dans un depot autonome seulement si A02-A04 sont satisfaits et qu'il existe un besoin de droits d'acces ou de releases independantes. Garder les ateliers consommateurs d'une version identifiee, sans dupliquer manuellement les schemas.
- [ ] **A09 / P2 - Conditionnel** Si extraction : tester une installation propre, les anciens JSON, les liens, les transferts et le retour arriere. Publier une version candidate, verifier le service puis basculer. Ne pas supprimer l'ancien chemin avant validation.
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
- [x] **L03 / P1 - Pilote local** Vues Intuition / Equations et prediction facultative avec explication causale pour les deux laboratoires. Cas simule retire au profit de la comparaison avec la reference.
- [x] **L04 / P1 - Pilote local** Bilan de masse, positivite, unites et cas limites ; dix scenarios compares au code mrgsolve exporte et regenere par R. Precision des petits taux preservee dans le generateur Lego.
- [x] **L05 / P1 - Pilote local** FR/EN, menu clavier, captures 320/390/768/1440 px, theme sombre, pixels non vides, mouvement reduit, pause hors scene et tableaux numeriques controles. Reservoirs/particules explicitement symboliques. Audit complet par lecteur d'ecran encore a faire.
- [x] **L05b / P1 - Retour utilisateur du 13/09** Particules sur les trajets aller/retour et vers l'elimination ; Lecture utilisable avec mouvement reduit et commandes visibles seules ; activation volontaire des particules. Sept tests navigateur passes, dont pixels des trois trajets, pause et retour au meme instant.
- [x] **L05c / P1 - Animation approfondie, verifiee localement** Identite conservee pour chaque particule, agitation et passages continus, particule traceuse, sonde de concentration deplacable et accessible au clavier, couleurs par dose, ralenti, lecture dans la scene et courbe progressive. Valeurs quantitatives toujours issues du modele PK continu, distinctes des trajectoires illustratives. Huit tests navigateur passes ; tests des identites, administrations, transitions continues, cas limites et geometries mobiles passes.
- [ ] **L06 / P1** Integrer le meme laboratoire dans le chapitre et dans Simulation. Observer son usage par quelques etudiants/enseignants avant de generaliser ; noter les incomprehensions et corrections necessaires.
- [ ] **L07 / P2** Etendre a l'accumulation : doses repetees, etat stationnaire, fluctuations, dose de charge et interruption. Conserver une reference pour comparer les intervalles.
- [ ] **L08 / P2** Etendre a PK 1 compartiment / absorption : dose, CL, V, ka, F, voie ; AUC avec fenetre explicite, Cmax/Tmax et demi-vie sous leurs hypotheses de validite.
- [ ] **L09 / P2** Etendre a la variabilite : meme population virtuelle et meme graine pour separer effets de covariables, IIV/IOV et bruit residuel ; mediane et intervalles avec definition explicite.
- [ ] **L10 / P2** Laboratoire prelevements/Bayes : verite synthetique cachee, heures choisies, resultat bruite, estimation et incertitude. Ne pas presenter une moyenne ponderee illustrative comme une estimation MAP a partir de concentrations ; montrer aussi les prelevements peu informatifs.

Dependances : L01-L06 n'attendent pas une separation des depots. L10 reutilise
les fonctions statistiques verifiees et les concepts du design de prelevement ;
les controles scientifiques font partie du lot, pas d'une phase ulterieure.

**Lot local du 12 septembre :** `/laboratoires/` contient les deux exemples
Distribution et Accumulation, lies aux chapitres concernes et a Simulation.
Le pilote accumulation couvre un nombre fini de bolus, le multiplicateur de la
premiere dose, la comparaison d'intervalles et la decroissance apres la derniere
dose. L'initialisation exacte a SS et les interruptions au milieu du calendrier
restent a ajouter (L07). L'observation avec des utilisateurs reste a faire (L06).
Voir [hypotheses et verifications](docs/teaching-laboratories.md).

## 5. Lego : import fidele des modeles complexes

- [ ] **K01 / P1** Etendre la representation des parametres avec des expressions structurees et bornees : alias, sommes, produits, puissances, fonctions autorisees et conditions. Reutiliser l'analyse AST existante ; aucune evaluation de code source arbitraire.
- [ ] **K02 / P1** Premier cas cible : Korell oral. Representer les contributions additives a CL, puis les conditions/plafonds requis. Signaler les divergences entre les fichiers MLXTRAN, NONMEM et l'article ; ne pas corriger silencieusement une equation importee.
- [ ] **K03 / P1** Propager ces expressions dans l'interface, le calcul navigateur, les exports mrgsolve/MLXTRAN/NONMEM et la regeneration R securisee. Afficher les parametres derives comme derives ; conserver les valeurs manquantes a 1 avec avertissement.
- [ ] **K04 / P2** Ajouter les administrations identifiees et leur affectation aux depots, fractions, delais, entrees d'ordre zero, unites et evenements ; preserver les branches paralleles sans compartiment technique non relie.
- [ ] **K05 / P2** Ajouter des sorties nommees, dont la somme des concentrations de plusieurs composantes. Cas cible : oral + PP1/PP3/PP6, puis parent/metabolite quand les flux correspondants sont representables.
- [ ] **K06 / P2** Refaire les tests dans les deux sens, avec et sans metadonnees embarquees : equations, courbes et covariables sur une grille de cas. Ajouter les modeles de bibliotheque et exemples primaires en ligne dont la redistribution est autorisee.
- [ ] **K07 / P2** Publier une matrice precise par format : reconnu exactement, structure populationnelle uniquement, ou refuse avec equation/raison. Ne pas annoncer un support NONMEM natif sans execution dans ce logiciel ; les tests d'export ne suffisent pas.
- [ ] **K08 / P3 - Exploratoire** Etudier separement IIV/IOV, covariance, erreurs residuelles, covariables variant dans le temps et melanges de populations. Une conversion de schema deterministe ne restaure pas un projet complet d'estimation.

**Sortie Korell :** equations preservees, valeurs/unites explicites, tests
numeriques independants et aller-retour dans les trois formats ; les parties
non representees restent signalees/refusees. A03 et L04 fournissent des bases
communes mais K01-K03 ne doivent pas attendre l'eventuelle extraction A08.

## 6. Navigation et continuite pedagogique

- [x] **U01 / P2 - Local** Menu Apprendre / Explorer / Construire / Analyser / Ressources, entrees par objectif dans l'accueil et le portail ; URL existantes conservees.
- [ ] **U02 / P2** Enrichir le glossaire en pages/liens de concepts : definition, equation, erreurs frequentes, chapitre, laboratoire et exercice associes ; harmoniser FR/EN jusqu'aux legendes et donnees du glossaire.
- [ ] **U03 / P2** Relier les exercices existants aux experiences : prediction initiale, manipulation libre, comparaison, explication. Ajouter des missions synthetiques avec objectifs explicites, sans badges ni gamification obligatoires.
- [ ] **U04 / P2** Rendre coherent le passage Simulation -> Lego -> TDM/DDI/PD. Afficher ce qui est transfere, ses unites et ce qui ne l'est pas ; ne pas promettre une reprise de dossier entre deux sessions Shiny independantes.
- [x] **U05 / P2 - Pilote local** Mode enseignant des deux laboratoires : scenarios numeriques reproductibles, resultats masquables/revelables, CSV/PNG et partage valide par liste blanche. Sans compte, suivi d'eleve ni stockage automatique de scenario.
- [ ] **U06 / P2** Generaliser la comparaison A/B pertinente : une reference stable, les parametres modifies et les ecarts numeriques. Preserver la graine de simulation et rendre le changement d'echelle visible.

**U04 partiellement livre en local :** laboratoire -> Lego / TDM / DDI / PD,
avec confirmation et liste des elements repris ou omis. TDM reprend le calendrier
complet dans une nouvelle session sans concentrations ; Lego reprend la premiere
dose, DDI/PD leur propre schema repete. La generalisation aux autres simulations
et la reprise entre sessions independantes ne sont pas annoncees comme acquises.

## 7. Bibliotheque, MIPD, ML, DDI et PD

- [ ] **S01 / P0** Poursuivre l'audit article/code : auteur et DOI, population, voies (oral / IV intermittente / IV continue), unites, parametres, covariables, IIV et erreur. Identifier explicitement les adaptations et priors ajoutes pour compatibilite MAP. Demander les articles manquants, sans les publier.
- [ ] **S02 / P1** Relier chaque version de modele a ses cas synthetiques de reference, differences par rapport a l'article, date et perimetre de relecture. Tester les incompatibilites de voie, unite et objectif avant model averaging.
- [ ] **S03 / P1** Renforcer les regressions TDM existantes : SS a t=0 et doses suivantes, horaires relatifs/dates, incertitude conditionnelle, LLOQ conditionnelle, covariables au prelevement, erreur residuelle fixee et cibles simples/multiples. Ne pas recreer ces fonctions deja livrees.
- [ ] **S04 / P1** Documenter et tester le contrat ML par artefact : cible et fenetre AUC, voie, modele source/version, plages de doses/temps/covariables, regles de prelevement. Maintenir la regle actuelle de deux concentrations dans un meme intervalle tant qu'un autre contrat n'est pas entraine et verifie.
- [ ] **S05 / P2** Consolider l'entrainement reproductible pour les nouveaux modeles : graines, separation train/validation/test par individu simule, absence de fuite d'information, erreurs par sous-groupe et disponibilite des artefacts/explications. Tester le model averaging complet et les artefacts manquants ; comparer MAP/ML sur la meme grandeur et la meme fenetre.
- [ ] **S06 / P2** Evaluer la generalisation du ML par molecule et contexte. La validation externe d'une methode sur le tacrolimus ne valide pas automatiquement tous les nouveaux artefacts ; un accord MAP/ML n'est pas une preuve d'exactitude. Conserver l'usage experimental et les avertissements hors domaine.
- [ ] **S07 / P2** Ameliorer les retours d'ajustement : adequation, identifiabilite, bornes atteintes, donnees insuffisantes, incertitude calculee ou absente. Relier les cas pedagogiques a ces diagnostics.
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
| 2 | L07-L10, U01-U06, K04-K07 | Accumulation/Bayes, continuite pedagogique et combine oral/LAI selon tests de chaque sous-lot |
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
