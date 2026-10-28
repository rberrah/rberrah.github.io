# PMx Explain — audit de pédagogie (28 octobre 2026)

## Périmètre et méthode

Le contrôle parcourt systématiquement les **95 chapitres FR + 95 versions EN** et les **114 activités guidées/synthèses (346 étapes)**. Il contrôle les 43 corrections de QCM guidés (134 propositions) dans les deux langues. Les **26 exercices numériques courts** emploient désormais le même parseur numérique strict que les activités guidées.

Trois niveaux de preuve sont séparés :
1. **Correction fonctionnelle** : tests unitaires et navigateur des retours, saisies, réponses et corrigés.
2. **Contrôle éditorial automatisé** : phrases très longues, corrigés excessivement denses et terminologie spécialisée ; indicateur d'une lecture humaine souhaitable, pas preuve d'erreur.
3. **Validation humaine de compréhension et scientifique** : non réalisée par le seul audit ; les statuts `review_pending` et `reviewed_hash` ne sont pas modifiés.

## Défauts confirmés et corrections

| Constat | Correction |
| --- | --- |
| « Ce résultat ne respecte pas encore les conditions de l’exercice » est abstrait | « Réponse incorrecte. » et suggestion utile selon calcul, QCM, unité ou réglage (FR/EN) |
| « Résultat correct » est impersonnel | « Bonne réponse » / « Correct answer » |
| « Pourquoi ? » comme rubrique générique | « Explication » / « Explanation » |
| Justifications en jargon (« incertitude calibrée », « vraisemblance », « décorrélation », etc.) | Reformulation de **l'ensemble des 134 justifications** de choix multiples, avec causes concrètes, exemples et termes techniques définis lorsque nécessaire |
| « Moyenner des arbres » décrit la moyenne des arbres sans expliquer la portée pratique | Corrigé simple : des erreurs peuvent se compenser, mais plusieurs arbres peuvent se tromper ensemble ; la dispersion entre arbres n'est pas un IC 95 % du patient |
| Chapitres IA trop rapides dans leurs définitions | Révision bilingue des chapitres `ai-trees`, `ai-boosting` et `ai-ml-tdm`, avec exemples avant les équations |
| Saisie d'un calcul court mal formée (ex. `2abc`) acceptée par `parseFloat` | Parseur strict `numericValue`, qui rejette toute valeur mal formée |

Aucune réponse scientifique, unité, niveau de réussite, fonction de simulation ou valeur de référence n'est modifiée.

## QCM des chapitres — issue #201 traitée par PR #202

Les **282 questions à choix unique** des 95 chapitres existent en deux langues et sont distinctes des 43 sélections guidées. Chaque QCM affiche la réponse attendue et une **explication scientifique propre à la question**, en FR et EN.

- **282/282 justifications** rédigées et structurées en quatre catalogues (`quizRationalesCore`, `Methods`, `Validation`, `Software`).
- Contrôle automatique strict de la complétude des 282 entrées, des deux langues, de la cohérence des réponses FR/EN et de l'absence de questions orphelines.
- Deux erreurs de formulation scientifique corrigées dans les deux langues : la question VPC où les trois distracteurs étaient des pièges valides, et la distinction entre écart absolu et rapport maximal des modèles d'erreur `combined1`/`combined2`.
- Tests numériques sur le rapport des erreurs et tests navigateur bilingues sur les deux questions corrigées.

**Limite :** la relecture scientifique humaine de ces 282 nouvelles explications reste une étape éditoriale distincte. Le contrôle logiciel ne remplace pas une évaluation de compréhension par des apprenants.

## Contrôles permanents

- `npm run audit:pedagogy` passe sur tous les contenus, signale les phrases particulièrement longues et vérifie la clarté du retour d'échec.
- `npm run test:pmx` inclut cet audit.
- `tests/e2e/learning.spec.js` vérifie explicitement les messages d'échec et de réussite sur les questions numériques et les sélections, en FR/EN.
- Les tests existants vérifient les réponses des 114 activités, la présence de chaque justification bilingue et les résultats numériques de référence.
- Le pipeline standard vérifie le typage Svelte, le build et les parcours Playwright.

## Points à ne pas surinterpréter

Les cours avancés NONMEM, Monolix, nlmixr2 et validation statistique utilisent nécessairement des notions spécialisées. La priorité est de **les définir lors de leur première utilisation, illustrer le raisonnement et éviter la phrase inutilement abstraite**, non de supprimer le vocabulaire scientifique.

Les alertes stylistiques restantes forment une file de triage **non bloquante sur le plan logiciel**. Une relecture pédagogique individuelle des 190 versions linguistiques, puis des tests avec des étudiants débutants, restent nécessaires pour certifier leur compréhension réelle.

**Ne pas modifier les empreintes de revue humaine ni présenter cet audit automatisé comme une validation scientifique indépendante.**
