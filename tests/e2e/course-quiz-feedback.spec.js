// @ts-nocheck
import { test, expect } from '@playwright/test';
const prefix = process.env.COVARIATES_E2E_PREFIX || '';

for (const lang of ['fr', 'en']) {
  test(`Course quiz shows the correct option and explains AI trees (${lang})`, async ({ page }) => {
    await page.goto(`${prefix}/chapitres/ai-trees/?lang=${lang}`);
    const quiz = page.getByTestId('chapter-quiz');
    await expect(quiz.getByTestId('quiz-block')).toHaveAttribute('data-hydrated', 'true');
    const wrongText = lang === 'fr' ? 'linéaire par morceaux' : 'piecewise-linear';
    await quiz.getByTestId('quiz-option-button').filter({ hasText: wrongText }).click();
    const feedback = quiz.getByTestId('quiz-correction-0');
    await expect(feedback).toContainText(lang === 'fr' ? 'Réponse incorrecte.' : 'Incorrect answer.');
    await expect(feedback).toContainText(lang === 'fr' ? 'Bonne réponse :' : 'Expected answer:');
    await expect(feedback).toContainText(lang === 'fr' ? 'Chaque feuille' : 'Each tree leaf');
    const rightText = lang === 'fr' ? 'en marches' : 'piecewise-constant';
    await quiz.getByTestId('quiz-option-button').filter({ hasText: rightText }).click();
    await expect(feedback).toContainText(lang === 'fr' ? 'Bonne réponse.' : 'Correct answer.');
  });
}

for (const lang of ['fr', 'en']) {
  test(`Course quiz explains the unique diagnostic pitfall in VPC (${lang})`, async ({ page }) => {
    await page.goto(`${prefix}/chapitres/validation-vpc/?lang=${lang}`);
    const quiz = page.getByTestId('chapter-quiz');
    await expect(quiz.getByTestId('quiz-block')).toHaveAttribute('data-hydrated', 'true');
    await quiz.getByTestId('quiz-option-button').filter({ hasText: lang === 'fr' ? 'seule métrique' : 'single metric' }).click();
    const feedback = quiz.getByTestId('quiz-correction-2');
    await expect(feedback).toContainText(lang === 'fr' ? 'Bonne réponse.' : 'Correct answer.');
    await expect(feedback).toContainText(lang === 'fr' ? 'Un seul diagnostic' : 'One encouraging diagnostic');
  });

  test(`Course quiz explains the combined1/combined2 maximum ratio (${lang})`, async ({ page }) => {
    await page.goto(`${prefix}/chapitres/monolix-erreur-residuelle/?lang=${lang}`);
    const quiz = page.getByTestId('chapter-quiz');
    await expect(quiz.getByTestId('quiz-block')).toHaveAttribute('data-hydrated', 'true');
    await quiz.getByTestId('quiz-option-button').filter({ hasText: 'f = a/b' }).click();
    const feedback = quiz.getByTestId('quiz-correction-0');
    await expect(feedback).toContainText(lang === 'fr' ? 'Bonne réponse.' : 'Correct answer.');
    await expect(feedback).toContainText(lang === 'fr' ? 'leur rapport est maximal' : 'their ratio is greatest');
  });
}

for (const lang of ['fr', 'en']) {
  test(`VPC explanations interpret simulated percentile bands rather than individual observations (${lang})`, async ({ page }) => {
    await page.goto(`${prefix}/chapitres/valid-vpc/?lang=${lang}`);
    const quiz = page.getByTestId('chapter-quiz');
    await expect(quiz.getByTestId('quiz-block')).toHaveAttribute('data-hydrated', 'true');
    await quiz.getByTestId('quiz-option-button').filter({ hasText: lang === 'fr' ? 'le modèle pourrait mal' : 'the model may reproduce' }).click();
    const feedback = quiz.getByTestId('quiz-correction-2');
    await expect(feedback).toContainText(lang === 'fr' ? 'Bonne réponse.' : 'Correct answer.');
    await expect(feedback).toContainText(lang === 'fr' ? 'percentiles observés' : 'observed percentiles');
  });
}

test('Switching exercise tracks resets answers from the previous quiz', async ({ page }) => {
  await page.goto(`${prefix}/exercices/?track=core&kind=quiz&lang=fr`);
  await expect(page.getByTestId('exercise-track-core')).toBeVisible();
  let panel = page.getByTestId('exercise-track-core').locator('.quiz-card').first();
  await panel.locator('summary').click();
  await expect(panel.getByTestId('quiz-block')).toHaveAttribute('data-hydrated', 'true');
  await panel.getByTestId('quiz-option-button').first().click();
  await expect(panel.getByTestId('quiz-correction-0')).toBeVisible();
  await page.getByRole('navigation', { name: "Choisir un parcours d'exercices" }).getByRole('button', { name: /Mathématiques/ }).click();
  await expect(page.getByTestId('exercise-track-math')).toBeVisible();
  panel = page.getByTestId('exercise-track-math').locator('.quiz-card').first();
  if (!(await panel.evaluate(node => node.open))) await panel.locator('summary').click();
  await expect(panel.getByTestId('quiz-block')).toHaveAttribute('data-hydrated', 'true');
  await expect(panel.getByTestId('quiz-correction-0')).toHaveCount(0);
});
