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

## Vérifications obligatoires

- node scripts/test_game.mjs : solution analytique IV-1C, AUC, conservation de masse six structures/voies, retard oral, pente, notation des neuf missions, intégrité des XP, non-négativité, proportionnalité, bornes et route non listée.
- npx playwright test --config playwright.portal.config.js : accès direct, tutoriel, échelles et mesure de pente, neuf quêtes, réponses numériques, XP locaux, affichage mobile, manipulation 1–3C, défi et absence d'entrée dans la navigation.
- PMx CI scientific-js exécute le test numérique ; le build valide les fichiers montés, l'audit public, puis le navigateur.
- La CI complète de PMx (5 jobs requis) demeure nécessaire à la fusion et au déploiement.

Prochaines étapes éventuelles (hors MVP) : import/export JSON borné d'un graphe, objectifs pédagogiques supplémentaires, mode enseignant, couverture de nouvelles structures dans le moteur de simulation pédagogique. Ne pas considérer ces pistes comme déjà implémentées.

## Sources pédagogiques

- Gabrielsson J, Meibohm B, Weiner D. [Pattern Recognition in Pharmacokinetic Data Analysis](https://doi.org/10.1208/s12248-015-9817-6). AAPS J. 2016 : profils mono-/multi-exponentiels, Tlag, semi-log, flip-flop.
- Mould DR, Upton RN. [Basic Concepts in Population Modeling, Simulation, and Model-Based Drug Development—Part 2](https://pmc.ncbi.nlm.nih.gov/articles/PMC3636497/) : absorption et décalage temporel, interprétation des structures PK.
- Yáñez JA et al. [Flip-flop pharmacokinetics – delivering a reversal of disposition](https://pmc.ncbi.nlm.nih.gov/articles/PMC3152312/) : distinction absorption/élimination terminale.
