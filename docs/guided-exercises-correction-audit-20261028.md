# PMx Explain — audit des corrigés des activités guidées (28 octobre 2026)

## Périmètre

- 101 activités guidées et 13 cas de synthèse dans l'inventaire courant (114 activités ; 346 étapes).
- Données et contenus bilingues FR/EN dans `src/lib/content/activities/` et `covariateActivities.js`.
- Correction des quatre formes d'étape : calcul numérique, sélection de plusieurs propositions, réglages de paramètres, raisonnement libre.
- Aucun changement des valeurs de réponse, des critères de notation, des données de simulation ou des contrats MIPD.

## Défauts confirmés

1. **Instruction ambiguë** : « Toutes les propositions correctes » apparaît comme légende de la sélection, sans préciser clairement qu'il faut cocher toutes les affirmations vraies.
2. **Corrigé de sélection incomplet** : une réponse juste ou l'ouverture du corrigé n'affiche qu'une remarque générale, sans récapituler les bonnes/mauvaises propositions.
3. **Résultats attendus peu explicites** : les calculs et réglages ne présentent pas systématiquement la valeur ou les paramètres attendus à côté de leur démonstration.
4. **Contrôle automatique insuffisant** : les tests vérifiaient les indices des réponses sélectionnées, mais ne garantissaient pas l'existence d'une justification par option.

## Correctifs apportés dans la PR

- La consigne demande explicitement de **cocher toutes les affirmations exactes**.
- Les **43 étapes de sélection**, correspondant à **134 propositions**, exposent après validation ou révélation : réponse correcte/incorrecte, texte intégral, justification spécifique en FR et en EN, puis explication d'ensemble.
- Les calculs affichent la valeur cible et son unité avec suffisamment de chiffres pour ne pas induire en erreur sur une tolérance étroite.
- Les réglages affichent chaque paramètre et sa valeur cible.
- Les questions ouvertes conservent leurs critères de raisonnement et l'autoévaluation : elles ne deviennent pas artificiellement notées.
- Le scénario *Moyenner des arbres*, étape 2, distingue explicitement les réponses **1 et 3** (correctes) de la **2** (fausse : dispersion entre arbres ≠ IC 95 % d'un patient).

## Couverture de non-régression

- `scripts/test_learning_content.mjs` : toutes les activités, les 43 sélections, la présence de justifications par option et par langue, le rejet des références de corrigés orphelines et le cas spécifique des arbres.
- `scripts/test_learning.mjs` : valeurs numériques indépendamment spécifiées et unités dans les activités de covariables.
- `tests/e2e/learning.spec.js` : parcours sur chaque activité et langue, affichage des valeurs et corrigés, test spécifique d'une mauvaise sélection puis de la révélation du corrigé.
- L'inventaire historique contient aussi des tests numériques de référence pour les exercices des autres parcours, dans `test_learning_content.mjs`.

## Limite de ce contrôle

Ces contrôles assurent la cohérence du barème, la complétude des corrigés et les fonctionnalités de l'interface. Ils ne remplacent pas une **relecture scientifique humaine indépendante** de toutes les hypothèses et démonstrations : aucune empreinte `reviewed` ni statut de validation scientifique n'est modifié automatiquement.

## Vérifications avant fusion

- [ ] Qualification GitHub Actions : sécurité, tests, typage, build.
- [ ] Tests navigateur Playwright FR/EN (desktop/mobile), dont « Moyenner des arbres ».
- [ ] Relecture visuelle finale des corrigés et de leur lisibilité en mobile.
