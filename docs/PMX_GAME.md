# PMx Game — expérimentation pédagogique isolée

**Propriété :** PMx Explain (rberrah/rberrah.github.io), et non MIPD-Engine.

## Distribution discrète

- Page autonome /game/ (portal/game/index.html) sur le domaine racine.
- Aucune entrée de navigation, aucun lien depuis le portail ou PMx, aucune entrée de sitemap. Le script d'assemblage n'injecte pas GoatCounter dans ce sous-arbre. La page porte robots=noindex,nofollow,noarchive.
- Le contenu est **public** sur GitHub Pages ; l'absence de lien n'est **pas** un contrôle d'accès. Ne jamais y traiter de données médicales ou personnelles.
- Ne pas ajouter la route à /pharmacometrie/ ni modifier les contrats MIPD/MultiOmics.
- Les modules ES sont servis depuis portal/game/*.js, compatibles avec le serveur de prévisualisation et son MIME text/javascript.

## Périmètre scientifique (version 0)

Les nœuds du graphe sont des **compartiments mathématiques**, pas des organes. Le graphe est éditable (1–3 compartiments, repositionnement des nœuds) et les flèches décrivent les échanges massiques ; seules les topologies suivantes sont permises :

- Absorption orale d'ordre 1 depuis un dépôt, ou bolus intraveineux dans le central.
- Un central + zéro, un ou deux périphériques, avec échanges réversibles Q1 et Q2.
- Élimination d'ordre 1 du central, paramétrée par CL.
- Une à quatre administrations espacées, avec F appliquée à la dose absorbable en cas de voie orale.

En notant A les quantités (mg) et Cc = Ac/Vc (mg/L) :

- dAg/dt = −Ka·Ag (voie orale) ;
- dAc/dt = Ka·Ag − CL·Cc − Q1·(Cc − Ap1/Vp1) − Q2·(Cc − Ap2/Vp2) ;
- dApi/dt = Qi·(Cc − Api/Vpi) ;
- dAelim/dt = CL·Cc.

Les termes des périphériques absents valent zéro. En IV, Ag = 0 et le bolus est ajouté au central. F·Dose rejoint le dépôt en oral ; (1−F)·Dose n'entre pas dans la masse modélisée. Intégrateur RK4 fixe à pas 0,025 h, paramètres bornés et profils totalement déterministes. L'AUC est intégrée par trapèzes sur la durée simulée ; le temps en fenêtre est une fraction descriptive, **sans cible clinique**.

Les particules graphiques représentent les quantités et les flux approximativement. Leur animation n'est ni un calcul moléculaire, ni une carte anatomique, ni une estimation de vitesse de transit physiologique. Le défi affiche un score de proximité des courbes, non une preuve d'identifiabilité structurelle ou un BIC.

## Vérifications obligatoires

- node scripts/test_game.mjs : solution analytique IV-1C, AUC, conservation de masse six structures/voies, non-négativité, proportionnalité, bornes et route non listée.
- npx playwright test --config playwright.portal.config.js : accès direct, manipulation 1–3C, paramètres, lecture, mobile, défi et absence d'entrée dans la navigation.
- PMx CI scientific-js exécute le test numérique ; le build valide les fichiers montés, l'audit public, puis le navigateur.
- La CI complète de PMx (5 jobs requis) demeure nécessaire à la fusion et au déploiement.

Prochaines étapes éventuelles (hors MVP) : import/export JSON borné d'un graphe, objectifs pédagogiques supplémentaires, mode enseignant, couverture de nouvelles structures dans le moteur de simulation pédagogique. Ne pas considérer ces pistes comme déjà implémentées.
