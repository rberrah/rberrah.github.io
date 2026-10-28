// @ts-nocheck
import { test, expect } from '@playwright/test';
const prefix = process.env.COVARIATES_E2E_PREFIX || '';

for (const lang of ['fr', 'en']) {
  test(`Course quiz shows the correct option and explains AI trees (${lang})`, async ({ page }) => {
    await page.goto(`${prefix}/chapitres/ai-trees/?lang=${lang}`);
    const quiz = page.getByTestId('chapter-quiz');
    const wrongText = lang === 'fr' ? 'linéaire par morceaux' : 'piecewise-linear';
    await quiz.getByTestId('quiz-option-button').filter({ hasText: wrongText }).click();
    const feedback = quiz.getByTestId('quiz-correction-0');
    await expect(feedback).toContainText(lang === 'fr' ? 'Réponse incorrecte.' : 'Incorrect answer.');
    await expect(feedback).toContainText(lang === 'fr' ? 'Bonne réponse :' : 'Expected answer:');
    await expect(feedback).toContainText(lang === 'fr' ? 'chaque feuille' : 'Each tree leaf');
    const rightText = lang === 'fr' ? 'en marches' : 'piecewise-constant';
    await quiz.getByTestId('quiz-option-button').filter({ hasText: rightText }).click();
    await expect(feedback).toContainText(lang === 'fr' ? 'Bonne réponse.' : 'Correct answer.');
  });
}
