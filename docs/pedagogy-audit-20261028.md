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

## QCM des chapitres : dette distincte, détectée pendant l'audit

Les **282 questions à choix unique** intégrées aux cours sont distinctes des 43 sélections guidées. Leur interface indiquait la bonne option après réponse, mais ne présentait pas nécessairement une justification.

- Désormais, chaque question indique explicitement **bonne réponse / réponse incorrecte** et affiche le texte de la bonne option.
- Les **8 QCM des trois chapitres IA réécrits** disposent aussi d'une explication scientifique courte et spécifique en FR/EN.
- Pour les **274 autres QCM**, l'interface invite honnêtement à relire le passage du cours au lieu de fabriquer une explication générique présentée comme une preuve.
- Le contrôle automatisé vérifie les 282 indices corrects FR/EN et suit explicitement la part des questions qui disposent d'un corrigé explicatif éditorial.

**Travail restant :** rédiger et relire humainement des explications propres aux 274 autres QCM, puis les soumettre par lots de parcours. Ne pas marquer cette partie « revue terminée » sur la base d'une simple correspondance avec l'option correcte.

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
