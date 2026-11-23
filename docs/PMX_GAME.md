# PMx Game — expérimentation pédagogique isolée

**Propriété :** PMx Explain (rberrah/rberrah.github.io), et non MIPD-Engine.

## Distribution discrète

- Page autonome /game/ (portal/game/index.html) sur le domaine racine.
- Aucune entrée de navigation, aucun lien depuis le portail ou PMx, aucune entrée de sitemap. Le script d'assemblage n'injecte pas GoatCounter dans ce sous-arbre. La page porte robots=noindex,nofollow,noarchive.
- Le contenu est **public** sur GitHub Pages ; l'absence de lien n'est **pas** un contrôle d'accès. Ne jamais y traiter de données médicales ou personnelles.
- Ne pas ajouter la route à /pharmacometrie/ ni modifier les contrats MIPD/MultiOmics.
- Les modules ES sont servis depuis portal/game/*.js, compatibles avec le serveur de prévisualisation et son MIME text/javascript.

## Deux expériences complémentaires

- **Campagne (écran initial)** : neuf missions progressives, tutoriel en trois étapes, indice, correction explicative après validation, XP et badge final. La carte déverrouille les quêtes dans l’ordre et permet de rejouer les niveaux terminés. La progression (IDs des quêtes uniquement) est conservée en localStorage, sans identifiant personnel, sans API ni télémétrie. Elle peut être remise à zéro.
- **Atelier libre** : éditeur de modèles historiques 1C–3C, animation des flux, courbe masquée, paramètres et dose. Le bouton du parcours permet de basculer dans l’atelier sans rendre publique la route via les menus du site.
- **Représentation physiologique** : silhouette stylisée avec circulation, tractus digestif, tissus et organes d’élimination. Les points lumineux reflètent les masses *mathématiques* au temps choisi ; **ils ne représentent pas des trajectoires anatomiques, ni l’attribution quantitative au foie/rein**.
- **Instrument de mesure** : chaque courbe se visualise sur une échelle normale ou semi-logarithmique. Deux clics dans le graphique estiment la pente log locale et une demi-vie apparente lorsque cette pente est négative ; une concentration nulle ne peut pas être portée en semi-log.

### Quêtes intégrées

| Niveau | Activité vérifiable | Nuance scientifique |
| --- | --- | --- |
| 1 | Tutoriel voyage oral et dépôt → central ↔ périphérie | Compartiments ≠ organes |
| 2 | Distinguer une exponentielle IV-1C en semi-log | Une droite ne prouve pas l’unicité de 1C |
| 3 | Détecter une décroissance bi-exponentielle IV-2C | Élimination et distribution peuvent être simultanées |
| 4 | Estimer numériquement un Tlag oral | Un délai apparent peut résulter du dosage ou de l’échantillonnage |
| 5 | Estimer k et t½ sur deux concentrations IV-1C | k=CL/Vc uniquement dans ce contexte simple |
| 6 | Évaluer un candidat 3C et ses limites | La forme ne prouve pas l’identifiabilité |
| 7 | Choisir des prélèvements précoces + tardifs | Meilleure observabilité ≠ estimation garantie |
| 8 | Reconnaître une pente d’absorption limitante (flip-flop) | La pente terminale orale peut représenter Ka |
| 9 | Diagnostic synthétique final : voie et structure | Compatibilité n’est pas preuve |

Les réponses aux exercices sont déterministes et calculées depuis le moteur PK local ; elles ne constituent ni une classification fiable de données réelles ni un outil médical.

## Périmètre scientifique (version 1)

Les nœuds du graphe sont des **compartiments mathématiques**, pas des organes. Le graphe est éditable (1–3 compartiments, repositionnement des nœuds) et les flèches décrivent les échanges massiques ; seules les topologies suivantes sont permises :

- Absorption orale d'ordre 1 depuis un dépôt, ou bolus intraveineux dans le central.
- Un central + zéro, un ou deux périphériques, avec échanges réversibles Q1 et Q2.
- Élimination d'ordre 1 du central, paramétrée par CL. Un Tlag facultatif (0–6 h) retarde les événements d’entrée orale sans retarder les bolus IV.
- Une à quatre administrations espacées, avec F appliquée à la dose absorbable en cas de voie orale.

En notant A les quantités (mg) et Cc = Ac/Vc (mg/L) :

- dAg/dt = −Ka·Ag (voie orale) ;
- dAc/dt = Ka·Ag − CL·Cc − Q1·(Cc − Ap1/Vp1) − Q2·(Cc − Ap2/Vp2) ;
- dApi/dt = Qi·(Cc − Api/Vpi) ;
- dAelim/dt = CL·Cc.

Les termes des périphériques absents valent zéro. En IV, Ag = 0 et le bolus est ajouté au central. F·Dose rejoint le dépôt en oral ; (1−F)·Dose n'entre pas dans la masse modélisée. Intégrateur RK4 fixe à pas 0,025 h, paramètres bornés et profils totalement déterministes. L'AUC est intégrée par trapèzes sur la durée simulée ; le temps en fenêtre est une fraction descriptive, **sans cible clinique**.

Les particules graphiques représentent les quantités et les flux approximativement. Leur animation n'est ni un calcul moléculaire, ni une carte anatomique, ni une estimation de vitesse de transit physiologique. Le défi affiche un score de proximité des courbes, non une preuve d'identifiabilité structurelle ou un BIC.

## Deuxième parcours — constructions et défis avancés

La campagne initiale de neuf quêtes reste intacte, mais un troisième onglet indépendant propose **neuf défis qui exigent des actions ou des hypothèses**. Les progrès sont stockés localement et les réponses ne sont pas préremplies.

1. **Enquête de structure à partir d’indices.** Sans annoncer « 2C » dans la question, identifier les blocs nécessaires à partir d’un profil oral multiexponentiel. Un bolus IV et un second compartiment périphérique sont proposés comme leurres. Dessiner les transferts dirigés et retirer les éléments erronés. La solution cible du scénario fictif reste un modèle oral 2C ; les données cliniques ne permettraient pas à elles seules de prouver cette structure.
2. **Assembler toutes les ODE.** Composer les équations de quantité pour Ag, Ac, Ap et Ae en choisissant séparément signes et termes. Le contrôleur vérifie le système complet, y compris conservation de masse, flux intercompartimentaux et élimination.
3. **Défi antibiotique synthétique / CMI.** Modèle IV bolus 1C répété à l'état stationnaire, CL=5 L/h, V=20 L, fraction libre=0,8, CMI=2 mg/L. Ajuster dose et intervalle pour satisfaire deux critères **inventés pour le jeu seulement**, fT>CMI ≥70 % et AUC24 ≤150 mg·h/L. Ce cas n'est **pas** un modèle clinique d'antibiothérapie, ni d'infusion de bêta-lactamine ; les seuils ne sont pas des recommandations.
4. **Dose linéaire vs Michaelis–Menten.** Après bolus IV, viser la même AUC∞=60 mg·h/L pour deux molécules hypothétiques, l'une linéaire (AUC=D/CL), l'autre saturable (dA/dt=−Vmax·C/(Km+C)). L'AUC∞ saturable est calculée exactement pour ce schéma 1C, puis les profils sont affichés pour illustrer la disproportionnalité.
5. **DDI et baisse de clairance.** Avec oral 1C à l'état stationnaire (sans changement de F ou Ka), régler CL et comparer la variation relative de l’AUCτ et celle de C0, à partir d’un tableau avant/après et d’un comparateur graphique. Le rapport C0 n’est plus exigé de tête : l’utilisateur choisit quel indicateur augmente proportionnellement le plus ; la valeur numérique est révélée après validation. CL divisée par deux donne ici AUCτ ×2 et C0 environ ×3,93.

6. **Dose de charge et entretien IV.** V=20 L, CL=3 L/h, intervalle 12 h, cible fictive 3 mg/L immédiatement après bolus et 3 mg/L de concentration moyenne à l'équilibre. Ajustement indépendant de Dcharge et Dentretien ; distinction entre V et CL.
7. **Accumulation.** Comparer CL = 0,75, 1 et 2 L/h ; identifier le **premier** nombre d'administrations q12h pour lequel l'accumulation post-dose est ≥90 % de sa limite. k=CL/V et fraction = 1−exp(−n·k·τ).
8. **Fractionnement de la dose journalière.** À dose totale fixe (240 mg/24 h), comparer q6h/q8h/q12h/q24h. L'AUC24 reste constante en PK linéaire ; le rapport pic/creux change. Le but fictif est Cmax/Cmin inférieur à 4.
9. **Indétermination F/CL après voie orale.** Faire correspondre l'AUC∞ de deux patients fictifs en choisissant **deux couples F et CL différents**. Une seule AUC orale fournit F/CL, pas F et CL séparément ; une courbe complète ou des données IV peuvent apporter des informations supplémentaires.

### Politique pédagogique

- Aucune bonne réponse ne doit être déjà cochée, ni suggérée par le placeholder d'une saisie numérique, ni révélée par l'intitulé de l'exercice. L'ordre des options des QCM est mélangé.
- Le graphique de **Tlag** ne marque plus la vraie position du délai avant la résolution.
- Le chapitre historique **« piège de la demi-vie »** demande désormais si une pente terminale *orale* peut servir à inférer CL ; il ne demande plus une valeur de CL en proposant Ka comme réponse.
- Le dessin du corps utilise une illustration vectorielle originale à organes stylisés (dépôt digestif, circulation, tissus, organes d’élimination), des cartes lisibles et une représentation dynamique des masses. Les flèches montrent dépôt→central, central↔périphérie et central→élimination. Un SVG **portrait natif** empêche de réduire illisiblement les inscriptions sur mobile.
- L'illustration est **inspirée de la physiologie sans être PBPK** : les périphériques ne correspondent pas à des organes, et le schéma n'infère ni contribution rénale ni contribution hépatique à CL.
- Tous les exercices sont synthétiques, sans ordonnance patient. Aucun calcul ne peut être présenté comme un ajustement thérapeutique réel.

Références pédagogiques consultées : [SFPT/SFAR, bêta-lactamines et fT>CMI](https://pmc.ncbi.nlm.nih.gov/articles/PMC6441232/), [revue des indices PK/PD anti-infectieux](https://pmc.ncbi.nlm.nih.gov/articles/PMC5039113/), [Principles of Pharmacokinetics, NCBI](https://www.ncbi.nlm.nih.gov/books/NBK12815/).

## Parcours 3 — Pharmacometricien : du fichier au rapport de PopPK

Le dossier « warfarine » de ce jeu est intégralement **synthétique** : 28 individus artificiels, 285 concentrations, une dose orale unique de 1,5 mg/kg. Aucun dossier clinique réel n'a été copié. Le tutoriel Monolix de warfarine sert de **référence méthodologique**, sans reprendre ses résultats SAEM ni prétendre avoir ajusté le jeu original.

1. Données : attribuer ID, TIME, AMT, DV et contrôler unités/historique d'administration.
2. EDA : explorer les profils sujets, les échelles linéaire et semi-log, les premières données manquantes et les hypothèses initiales.
3. Estimation : **trois modèles réellement pré-calculés**, oral 1C, oral 1C avec Tlag, oral 2C. Le bouton relit neuf instantanés de 170 itérations par modèle, et **ne lance jamais un SAEM navigateur**. CL, V, Ka, Q, Vp, Tlag (selon le candidat), variabilité interindividuelle de CL, résidu et critères sont archivés dans portal/game/saem-replay.js.
4. Diagnostics : courbes de population et conditionnelles individuelles, et contrôle prédictif illustratif (120 simulations par temps, sans bande d'incertitude). GOF, VPC, stabilité, précision et identifiabilité sont complémentaires ; NPDE, bootstrap et validation externe **ne sont pas réalisés**.
5. Arbitrage : BIC approximatifs : 1C sans Tlag −223,78 ; 1C + Tlag −224,01 ; 2C sans Tlag −215,27. ΔBIC de **0,23** entre 1C ± Tlag = différence non décisive malgré la vérité de simulation ; le 2C est pénalisé.
6. PK/PD : simulation **indépendante** et illustrative d'une PCA retardée par turnover. Aucune estimation SAEM des paramètres PD n'a été faite. Un lien PK→PD doit être formulé comme hypothèse à tester.
7. Rapport : résultat copiable avec provenance, limites et refus d'une interprétation clinique.

**Calcul pré-enregistré reproductible** : scripts/build_game_warfarin_saem.py (NumPy et SciPy ; seed 20261123), petit SAEM **généralisé pédagogique**, avec Metropolis pour ηCL, approximation stochastique des moments de variance et M-step numérique conditionnelle. −2LL marginal et BIC via quadrature Gauss–Legendre 1D à 161 nœuds. La procédure est une implémentation exploratoire **non qualifiée**, distincte de Monolix/nlmixr2 ; les nombres ne sont pas des estimations de leur logiciel. Les différentes initialisations et l'identifiabilité ne sont pas validées sur ce banc.

**Pour prolonger vers des données publiques réelles :** la warfarine dans nlmixr2data comprend 519 lignes, 9 colonnes et 32 sujets, avec concentrations et PCA. Ce jeu historique n'est pas embarqué ici. Sources :
[Monolix : tutoriel PK/PD de warfarine](https://monolixsuite.slp-software.com/tutorials/2024R1/modeling-the-pharmacokinetics-and-pharmacodynamics),
[nlmixr2data : warfarin](https://nlmixr2.github.io/nlmixr2data/reference/warfarin.html),
[FeRx : oral warfarin SAEM/FOCEI](https://ferx-nlme.org/examples/warfarin.html).

## Parcours 4 — MIPD : du dosage à une prévision Bayésienne

Cas « antibiotique V » entièrement fictif, sans référence de prescription : perfusion IV de 1 h q12h, modèle 1C, dose initiale 750 mg q12h ; CL simulée 3,6 L/h et V 29 L. Prior lognormal artificiel : CL médiane 4,5 L/h (log-SD 0,28) et V médian 32 L (log-SD 0,22). Deux dosages simulés, à 2 h et 11 h, donnent 28,71 et 8,67 mg/L.

1. Audit des conditions d'emploi du modèle.
2. Choix de deux prélèvements horodatés informatifs.
3. **Bayes/MAP réellement recalculé** dans le navigateur sur une grille CL × V de 57 × 49 points ; posterior proportionnel au prior et à la vraisemblance des 0, 1 ou 2 dosages, avec CV analytique fictif de 9 % et SD plancher 0,35 mg/L. Maximum a posteriori conjoint (MAP CL/V), moyennes postérieures (distinctes du MAP), intervalle P5–P95 de CL et distribution des paramètres.
4. Grille de cinq doses fictives q12h : 600/750/900/1050/1200 mg. Cible **inventée pour le jeu** : AUC24 de 440–560 mg·h/L, avec seuil de passage P(cible) ≥ 68 %. Intégration de la distribution postérieure, pas uniquement de CL moyenne.
5. Scénario hypothétique CL ×0,6 : prévision conditionnelle sans nouveau dosage et **sans mise à jour du posterior**, avec exigence de recontrôle.
6. Portes de sécurité : validation externe, indication, dose et horaire, données analytiques, nouvelle appréciation de CL et interdiction de transposer les doses simulées à des patients.

Ces outils ne sont PAS MIPD Engine, n'utilisent aucune information médicale réelle et ne constituent pas un modèle de vancomycine validé. Comparaison de référence : [consensus vancomycine 2020](https://www.idsociety.org/practice-guideline/vancomycin), [recommandations d'intégration des modèles populationnels dans le MIPD](https://pmc.ncbi.nlm.nih.gov/articles/PMC11992666/). Les paramètres et la fenêtre cible de ce jeu ne sont pas repris des recommandations cliniques.

## Vérifications obligatoires

- node scripts/test_game.mjs (inclut test_game_careers.mjs) : analytique IV-1C, AUC, conservation de masse, retard oral, pente, correction des neuf quêtes, vérification du graphe et des quatre ODE, fT>CMI, AUC∞ linéaire/saturable, C0 et AUCτ après DDI, dose de charge et entretien, accumulation, fractionnement à AUC conservée, ambiguïté F/CL et absence de référencement.
- npx playwright test --config playwright.portal.config.js : accès direct, tutoriel, échelles, mesure de pente, neuf quêtes et leurs réponses, parcours de neuf défis avancés, sept missions PopPK et six missions MIPD, vérification des ODE et des cibles de jeu, versions graphique desktop/mobile, persistance locale, et absence d'entrée dans la navigation.
- PMx CI scientific-js exécute le test numérique ; le build valide les fichiers montés, l'audit public, puis le navigateur.
- La CI complète de PMx (5 jobs requis) demeure nécessaire à la fusion et au déploiement.

Prochaines étapes éventuelles (hors MVP) : import/export JSON borné d'un graphe, objectifs pédagogiques supplémentaires, mode enseignant, couverture de nouvelles structures dans le moteur de simulation pédagogique. Ne pas considérer ces pistes comme déjà implémentées.

## Sources pédagogiques

- Gabrielsson J, Meibohm B, Weiner D. [Pattern Recognition in Pharmacokinetic Data Analysis](https://doi.org/10.1208/s12248-015-9817-6). AAPS J. 2016 : profils mono-/multi-exponentiels, Tlag, semi-log, flip-flop.
- Mould DR, Upton RN. [Basic Concepts in Population Modeling, Simulation, and Model-Based Drug Development—Part 2](https://pmc.ncbi.nlm.nih.gov/articles/PMC3636497/) : absorption et décalage temporel, interprétation des structures PK.
- Yáñez JA et al. [Flip-flop pharmacokinetics – delivering a reversal of disposition](https://pmc.ncbi.nlm.nih.gov/articles/PMC3152312/) : distinction absorption/élimination terminale.

- [A unified pharmacokinetic approach to individualized drug dosing](https://bpspubs.onlinelibrary.wiley.com/doi/10.1111/j.1365-2125.2011.04089.x) : distinctions V/CL/dose de charge, entretien et demi-vie.
- [Steady State Concentration — NCBI Bookshelf](https://www.ncbi.nlm.nih.gov/books/NBK553132/) : accumulation et logique de concentrations à l’état stationnaire.
