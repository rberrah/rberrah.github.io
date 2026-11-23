# PMx Game — parcours pédagogiques officiels de PMx Explain

**Propriété :** PMx Explain (rberrah/rberrah.github.io), et non MIPD-Engine.

## Publication officielle (23 novembre 2026)

- Source unique : `portal/game/*`, montée par `scripts/mount_game_route.mjs` dans `dist/pharmacometrie/game/*` après la construction SvelteKit. Le contenu complet est identique sur les deux routes à l'assemblage, mais **/pharmacometrie/game/** est la route canonique et celle utilisée depuis Learn et l'accueil.
- L'ancienne page Svelte `src/routes/game/+page.svelte` est retirée pour supprimer le doublon fonctionnel.
- La route historique `/game/` n’expose plus le jeu : elle redirige immédiatement vers l’adresse canonique `/pharmacometrie/game/`, en préservant la langue.
- Le jeu est publiquement référencé sans aucune donnée personnelle, médicale ou saisie patient.
- Le parcours 3 contient désormais les graphiques IIV/RUV/EBE et une carte explicite des diagnostics disponibles vs manquants. Seule ηCL est estimée ; aucun CWRES/NPDE/RSE/IOV/Ω-corrélation n'est inventé.

## Distribution historique (archive — désormais remplacée)

- Page autonome /game/ (portal/game/index.html) sur le domaine racine.
- Aucune entrée de navigation, aucun lien depuis le portail ou PMx, aucune entrée de sitemap. Le script d'assemblage n'injecte pas GoatCounter dans ce sous-arbre. La page porte robots=noindex,nofollow,noarchive.
- Le contenu est **public** sur GitHub Pages ; l'absence de lien n'est **pas** un contrôle d'accès. Ne jamais y traiter de données médicales ou personnelles.
- Ne pas ajouter la route à /pharmacometrie/ ni modifier les contrats MIPD/MultiOmics.
- Les modules ES sont servis depuis portal/game/*.js, compatibles avec le serveur de prévisualisation et son MIME text/javascript.

## Deux expériences complémentaires

- **Campagne (écran initial)** : neuf missions progressives, tutoriel en trois étapes, indice, correction explicative après validation, XP et badge final. La carte déverrouille les quêtes dans l’ordre et permet de rejouer les niveaux terminés. La progression (IDs des quêtes uniquement) est conservée en localStorage, sans identifiant personnel, sans API ni télémétrie. Elle peut être remise à zéro.
- **Atelier libre** : éditeur de modèles historiques 1C–3C, animation des flux, courbe masquée, paramètres et dose. Le bouton du parcours permet de basculer dans l’atelier ; le jeu complet est également accessible depuis la navigation Learn.
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
- Les parcours de simulation et de posologie sont fictifs. Le parcours 3 présente aussi des mesures expérimentales publiées de warfarine, sans donnée patient saisie par l’utilisateur ; aucune estimation du parcours ne constitue une recommandation thérapeutique.

Références pédagogiques consultées : [SFPT/SFAR, bêta-lactamines et fT>CMI](https://pmc.ncbi.nlm.nih.gov/articles/PMC6441232/), [revue des indices PK/PD anti-infectieux](https://pmc.ncbi.nlm.nih.gov/articles/PMC5039113/), [Principles of Pharmacokinetics, NCBI](https://www.ncbi.nlm.nih.gov/books/NBK12815/).

## Parcours 3 — Pharmacometricien : étude expérimentale et atelier de calcul distinct

**Provenance réelle.** Les étapes « Données », « Exploration » et « PK/PD » utilisent le fichier existant du dépôt `static/downloads/warfarin/warfarin_data.csv`, qui contient **32 sujets, 32 administrations orales (1,5 mg/kg), 251 concentrations PK dont 4 zéros et 232 mesures d’activité du complexe prothrombinique (PCA)**. `DVID=1` désigne PK et `DVID=2` PCA ; la source n’a **pas** de colonne EVID (les doses sont identifiées via AMT). Ces observations sont issues de l'étude historique O’Reilly (1968), distribuées dans le cas Warfarine de MonolixSuite. Le sous-ensemble affiché est exporté de façon reproductible dans `portal/game/warfarin-study.js` ; les séries graphiques sont des observations expérimentales, sans prédiction artificielle superposée.

**Frontière scientifique obligatoire.** Les étapes « Ajustements SAEM », « Diagnostics » et « Arbitrage » utilisent encore un **replay de démonstration sur une autre cohorte artificielle** : 28 sujets, 285 concentrations. Les estimations, BIC, effets aléatoires, VPC et résidus du replay **ne sont PAS des résultats de l’étude O’Reilly**. Cette différence est explicitée dans l’interface et le rapport. Le moteur `scripts/build_game_warfarin_saem.py` est un SAEM généralisé exploratoire avec Metropolis (ηCL) et M-step numérique, 170 itérations archivées ; il ne s’agit pas du SAEM Monolix ni d’un ajustement validé.

1. **Lecture des données réelles :** ID, TIME, AMT, DV et DVID ; reconnaissance des lignes de dose et des deux types de réponse.
2. **Exploration réelle :** vue populationnelle corrigée, les 32 profils réellement observés, sujet sélectionné mis en évidence et même échelle linéaire/semi-log que le profil individuel ; prise en charge des zéros et des horaires irréguliers.
3. **Atelier d’estimation artificiel, distinct :** 1C, 1C+Tlag et 2C, neuf instantanés sur 170 itérations ; le tracé d’évolution normalisée (% de la valeur finale) et l’écart au BIC minimal remplacent le graphique de paramètre brut peu lisible.
4. **Six questions successives (une par groupe de graphiques) :** GOF, résidus/QQ, IIV–EBE/covariables/shrinkage, RUV, VPC et précision/validation, chaque ensemble devant être interprété pour poursuivre. Galerie : profils DV/PRED/IPRED, DV vs PRED, DV vs IPRED, résidus conditionnels log-standardisés approximatifs vs temps/IPRED, histogramme et QQ, ηCL vs poids et histogramme des ηCL ; VPC P5/P50/P95 recalculé avec 120 réplications déterministes aux temps/sujets archivés, bandes empiriques entre réplications. **Ne pas appeler ces résidus CWRES ou NPDE.** Aucun RSE/covariance, test multi-start, pcVPC, bootstrap des paramètres ni évaluation d'identifiabilité numérique qualifiée n’est fourni.
5. **Arbitrage du replay artificiel uniquement :** BIC environ −223,78 (1C), −224,01 (1C + Tlag) et −215,27 (2C) ; ΔBIC 0,23 non décisif. **Ces valeurs ne s’appliquent pas à l’étude réelle.**
6. **Vraies observations PD :** courbes mesurées de PCA et concentrations pour le même sujet, sans inventer de trajectoire de turnover ni revendiquer l’estimation de paramètres PD.
7. **Conclusion scientifique et compte rendu FR/EN :** résultats vérifiables sur données expérimentales versus benchmark artificiel, modèle non départagé par un ΔBIC ≈0,23, IIV et RUV estimées seulement dans le benchmark, qualification/PKPD restant à mener sur l’étude réelle. Pas de checkbox générique ou disclaimer répété dans le corps du rapport.

**À réaliser pour unir les étapes en une analyse PopPK de l’étude réelle :** estimer les modèles sur le fichier original (p. ex. via Monolix/nlmixr2, SAEM/FOCEi), recalculer log-vraisemblances, BIC, EBE, VPC, diagnostics populationnels et uncertainty avec traçabilité. Tant que ce travail n’est pas fait, les sorties SAEM ne doivent pas être présentées comme issues de la publication.

Sources : [Monolix — tutoriel warfarine](https://monolixsuite.slp-software.com/tutorials/2024R1/modeling-the-pharmacokinetics-and-pharmacodynamics), [Warfarin joint dataset](https://monolixsuite.slp-software.com/monolix/2024R1/warfarin-joint-data-set).

## Parcours 4 — Greffe cardiaque, MMF / MPA et MAP-BE

**Cas clinique simulé, cible bibliographique vérifiée.** Deux mois après une transplantation cardiaque, personne traitée par **MMF oral 1 000 mg q12h** avec tacrolimus et corticostéroïdes. L’analyte dosé est le **MPA**. Le guide Cibles‑TDM contient `mpa-heart-auc` : **AUC₀–₁₂h du MPA supérieure à 36 mg·h/L**, source Liu 2025 / consensus IATDMCT. Aucune borne supérieure cardiaque consensuelle dans cette entrée. La C0 est présentée comme une mesure complémentaire imparfaitement corrélée à l’AUC. Les recommandations ISHLT ne préconisent pas un suivi MPA systématique pour tous les greffés cardiaques : l’exercice ne doit pas laisser penser à une indication universelle.

**Modèle explicitement distinct de la source de cible :** approximation orale à 1 compartiment, absorption du premier ordre à l’équilibre ; paramètres apparents CL/F et V/F, posterior MAP sur grille 65 × 61 ; ne modélise pas la recirculation entérohépatique, la double absorption, MPAG, ni les effets des comédications. Les dosages sont générés pour un cas fictif : **0,5, 1 et 2 h**, temps étudiés pour l’échantillonnage limité après MMF en transplantation cardiaque, non applicables à tous les modèles.

1. **Dossier et cible :** différencier MMF administré et MPA dosé ; choisir l’AUC plutôt que C0 comme représentation de l’exposition dans ce contexte ; lien direct vers `/pharmacometrie/cibles-tdm/?drug=mpa&lang=fr|en`.
2. **Évaluer le plan de prélèvement :** justifier (0,5 / 1 / 2 h) et ses limites selon modèle/formulation, sans inventer des horaires universels.
3. **Mise à jour MAP-BE :** choisir prior / 1 dosage / 3 dosages ; visualiser CL/F et V/F avec histogrammes/traits comparatifs et légendes ; le prior reste constant, la vraisemblance change.
4. **Sensibilité IIV–RUV–prior :** modifier séparément l’échelle de Ω (×0,5/1/1,75), la RUV proportionnelle (1/12/25 %) et le poids du prior (MAP = 1, aplati = 1/8). Visualiser les effets sur MAP CL/F, MAP V/F, intervalles et AUC. L’essai RUV ne re-estime pas l’erreur populationnelle ; la dispersion résiduelle comporte un plancher à 0,08 mg/L. **Une RUV diminuée n’est pas systématiquement meilleure : risque de surajustement**. Inspiration : Berrah, Minichmayr & Woillard (travaux sur RUV) ; Hughes & Keizer, CPT:PSP 2021 (flattened priors). Les alternatives sont des sensibilités, pas une sélection ML individualisée validée.
5. **Tester une posologie :** saisir librement 250–3 000 mg q12h ; afficher profil MPA, AUC₀–₁₂h, intervalle d’incertitude et C0 ; cible AUC >36 contextualisée et affichée. Pas de colonne « toxic trough », aucune cible CMI et aucune liste de quatre régimes. Une exposition >60 déclenche discussion contextuelle, **sans prétendre au seuil de toxicité cardiaque validé**.
6. **Changer CL/F :** diminuer hypothétiquement CL/F de 40 % et saisir une **nouvelle dose libre** pour préserver l’AUC ; comparer AUC et C0 avant/après ; ne pas fournir d’emblée quatre régimes ou le dose ratio correct.
7. **Compte rendu pharmacométrique :** contexte, cible sourcée, concentrations simulées, paramètres et incertitudes MAP, sensibilité IIV/RUV/prior, dose évaluée, scénario de clairance et conclusion conditionnelle centrée sur les limites de qualification/modèle et sur la clinique/NFS. Disponible en français et anglais.

**Sources :** [cibles MPA de PMx Explain](/pharmacometrie/cibles-tdm/?drug=mpa), [consensus IATDMCT Bergan 2021](https://doi.org/10.1097/FTD.0000000000000871), [ISHLT 2023](https://www.ishlt.org/docs/default-source/standards-guidelines/2022_guideline_ishlt_careofhtxrecipients.pdf), [stratégie de prélèvement MMF cardiaque](https://pubmed.ncbi.nlm.nih.gov/18641552/), [Hughes & Keizer 2021](https://doi.org/10.1002/psp4.12684).

## Vérifications obligatoires

- node scripts/test_game.mjs (inclut test_game_careers.mjs) : analytique IV-1C, AUC, conservation de masse, retard oral, pente, correction des neuf quêtes, vérification du graphe et des quatre ODE, fT>CMI, AUC∞ linéaire/saturable, C0 et AUCτ après DDI, dose de charge et entretien, accumulation, fractionnement à AUC conservée, ambiguïté F/CL et absence de référencement.
- npx playwright test --config playwright.portal.config.js : accès direct, tutoriel, échelles, mesure de pente, neuf quêtes et leurs réponses, parcours de neuf défis avancés, sept missions PopPK et sept étapes MIPD, vérification des ODE et des cibles MPA bibliographiques/contextualisées, versions graphique desktop/mobile, persistance locale, et lien officiel Learn / accueil et URL canonique unique.
- PMx CI scientific-js exécute le test numérique ; le build valide les fichiers montés, l'audit public, puis le navigateur.
- La CI complète de PMx (5 jobs requis) demeure nécessaire à la fusion et au déploiement.

Prochaines étapes éventuelles (hors MVP) : import/export JSON borné d'un graphe, objectifs pédagogiques supplémentaires, mode enseignant, couverture de nouvelles structures dans le moteur de simulation pédagogique. Ne pas considérer ces pistes comme déjà implémentées.

## Sources pédagogiques

- Gabrielsson J, Meibohm B, Weiner D. [Pattern Recognition in Pharmacokinetic Data Analysis](https://doi.org/10.1208/s12248-015-9817-6). AAPS J. 2016 : profils mono-/multi-exponentiels, Tlag, semi-log, flip-flop.
- Mould DR, Upton RN. [Basic Concepts in Population Modeling, Simulation, and Model-Based Drug Development—Part 2](https://pmc.ncbi.nlm.nih.gov/articles/PMC3636497/) : absorption et décalage temporel, interprétation des structures PK.
- Yáñez JA et al. [Flip-flop pharmacokinetics – delivering a reversal of disposition](https://pmc.ncbi.nlm.nih.gov/articles/PMC3152312/) : distinction absorption/élimination terminale.

- [A unified pharmacokinetic approach to individualized drug dosing](https://bpspubs.onlinelibrary.wiley.com/doi/10.1111/j.1365-2125.2011.04089.x) : distinctions V/CL/dose de charge, entretien et demi-vie.
- [Steady State Concentration — NCBI Bookshelf](https://www.ncbi.nlm.nih.gov/books/NBK553132/) : accumulation et logique de concentrations à l’état stationnaire.
