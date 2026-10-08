// @ts-nocheck
import { test, expect } from '@playwright/test';
import { readFileSync, readdirSync } from 'node:fs';
import matter from 'gray-matter';
import { guidedActivities as activities } from '../../src/lib/content/guidedActivities.js';
const chapterDir = new URL('../../src/content/chapters/', import.meta.url);
const chapterTracks = new Map(readdirSync(chapterDir).filter(f => f.endsWith('.md') && !f.startsWith('_')).map(f => {
  const { data } = matter(readFileSync(new URL(f, chapterDir), 'utf8'));
  return [data.slug, data.track];
}));
const prefix = process.env.COVARIATES_E2E_PREFIX || '';
// Synthesis activities belong to an explicit learning track. Chapter frontmatter
// identifies the canonical course but does not override the activity's track.
const path = (activity, lang = 'fr') => `${prefix}/parcours/${activity.track || chapterTracks.get(activity.chapter)}/?lang=${lang}&chapter=${activity.chapter}#activity-${activity.id}`;
const next = panel => panel.getByRole('button', { name: /^(Suivant|Next)$/ });
const check = panel => panel.getByRole('button', { name: /^(Vérifier|Check)$/ });

for (const lang of ['fr', 'en']) for (const activity of activities) {
  test(`Learning: ${activity.id} ${lang}`, async ({ page }, testInfo) => {
    test.setTimeout(60_000);
    const mobile = lang === 'en';
    await page.setViewportSize({ width: mobile ? 390 : 1280, height: 950 });
    if (mobile) await page.emulateMedia({ colorScheme: 'dark' });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(path(activity, lang));
    const panel = page.getByTestId(`activity-${activity.id}`);
    await expect(panel).toHaveAttribute('open', '');
    for (let i = 0; i < activity.steps.length; i++) {
      const step = activity.steps[i];
      await expect(panel.getByRole('heading', { level: 4 })).toHaveText(step.prompt[lang]);
      if (step.type === 'numeric') {
        if (i === 0 && !activity.id.startsWith('cov-')) {
          await panel.getByTestId('case-number').fill(String(step.answer + 100));
          if (step.units) await panel.getByTestId('case-unit').selectOption(step.unit);
          await check(panel).click();
          await expect(next(panel)).toBeDisabled();
          await expect(panel.getByTestId('case-feedback')).not.toHaveText(/Résultat correct|Correct result/);
        }
        await panel.getByTestId('case-number').fill(String(step.answer).replace('.', lang === 'fr' ? ',' : '.'));
        if (step.units) await panel.getByTestId('case-unit').selectOption(step.unit);
        await check(panel).click();
        await expect(panel.getByTestId('case-feedback')).toHaveText(/Résultat correct|Correct result/);
      } else if (step.type === 'select') {
        for (const correct of step.correct) await panel.locator('fieldset input').nth(correct).check();
        await check(panel).click();
        await expect(panel.getByTestId('case-feedback')).toHaveText(/Résultat correct|Correct result/);
      } else if (step.type === 'tune') {
        for (const [key, value] of Object.entries(step.targets)) await panel.getByTestId(`${step.experiment ? 'experiment' : 'lesson'}-${key}`).fill(String(value));
        await panel.getByRole('button', { name: /Vérifier les paramètres|Check parameters/ }).click();
        await expect(panel.getByTestId('case-feedback')).toHaveText(/Résultat correct|Correct result/);
      } else {
        await panel.getByTestId('case-reasoning').fill('My private reasoning is never stored.');
        await panel.getByRole('button', { name: /Comparer au corrigé|Compare with the rubric/ }).click();
        await expect(panel.getByTestId('case-correction')).toContainText(step.rubric[0][lang]);
        await panel.getByTestId('case-correction').getByRole('checkbox').check();
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
      if (step.experiment) {
        const paths = panel.locator('svg[data-testid="covariate-plot"] path');
        await expect(paths).toHaveCount(2);
        for (const line of await paths.all()) expect((await line.getAttribute('d')).length).toBeGreaterThan(100);
        if (step.type === 'tune') {
          const [key, value] = Object.entries(step.targets)[0];
          await panel.getByTestId(`experiment-${key}`).fill('');
          await expect(panel.getByRole('alert')).toBeVisible();
          await expect(next(panel)).toBeDisabled();
          await panel.getByTestId(`experiment-${key}`).fill(String(value));
          await panel.getByRole('button', { name: /Vérifier les paramètres|Check parameters/ }).click();
        }
        if (activity.chapter === 'pd-direct' || activity.chapter === 'onco-tgi' || activity.chapter === 'clairance-volume-demi-vie') {
          await panel.getByTestId('activity-experiment').scrollIntoViewIfNeeded();
          await page.evaluate(() => window.scrollBy(0, -100));
          await page.screenshot({ path: testInfo.outputPath(`experiment-${lang}.png`) });
        }
      }
      if (activity.id === 'cov-synthesis' && i === 2) {
        await expect(panel.getByTestId('covariate-plot')).toBeVisible();
        expect(await panel.locator('svg[data-testid="covariate-plot"] path').count()).toBe(2);
        await panel.getByTestId('covariate-plot').scrollIntoViewIfNeeded();
        await page.evaluate(() => window.scrollBy(0, -100));
        await page.screenshot({ path: testInfo.outputPath(`synthesis-${lang}.png`) });
      }
      if (i < activity.steps.length - 1) await next(panel).click();
      else await panel.getByRole('button', { name: /^(Terminer|Finish)$/ }).click();
    }
    await expect(panel.getByTestId('activity-complete')).toContainText(/Réussi|Passed/);
    expect(await page.evaluate(() => localStorage.getItem('pmx-learning-v1'))).toBeNull();
    expect(errors).toEqual([]);
  });
}

test('Learning: mistakes, hints, solutions, opt-in persistence and clearing', async ({ page }) => {
  const activity = activities[0];
  await page.goto(path(activity));
  await page.getByTestId('save-learning').check();
  const panel = page.getByTestId(`activity-${activity.id}`);
  await expect(next(panel)).toBeDisabled();
  await panel.getByTestId('case-number').fill('2.857142857');
  await panel.getByTestId('case-unit').selectOption('L/h');
  await check(panel).click();
  await expect(panel.getByTestId('case-feedback')).toContainText('proportionnelle');
  await panel.getByRole('button', { name: 'Indice 1', exact: true }).click();
  await expect(panel).toContainText('Commencez par WT/70');
  await panel.getByTestId('case-number').fill('3.108');
  await panel.getByTestId('case-unit').selectOption('L');
  await check(panel).click();
  await expect(panel.getByTestId('case-feedback')).toContainText('unité');
  await panel.getByRole('button', { name: 'Voir le corrigé', exact: true }).click();
  await next(panel).click();
  await panel.getByRole('button', { name: 'Voir le corrigé', exact: true }).click();
  await next(panel).click();
  await panel.getByTestId('case-reasoning').fill('Never save this reasoning 12345');
  await panel.getByRole('button', { name: 'Comparer au corrigé' }).click();
  await panel.getByTestId('case-correction').getByRole('checkbox').check();
  await panel.getByRole('button', { name: 'Terminer', exact: true }).click();
  await expect(panel.getByTestId('activity-complete')).toContainText('Corrigé consulté');
  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('pmx-learning-v1')));
  expect(stored.activities[activity.id]).toBe('reviewed');
  expect(JSON.stringify(stored)).not.toContain('12345');
  expect(Object.keys(stored).sort()).toEqual(['activities', 'chapters', 'version']);
  await page.reload();
  await expect(page.getByTestId('save-learning')).toBeChecked();
  await expect(panel.locator('summary').first()).toContainText('Corrigé consulté');
  await page.getByRole('button', { name: 'Effacer ma progression', exact: true }).click();
  await page.getByRole('button', { name: 'Confirmer', exact: true }).click();
  await expect(panel.locator('summary').first()).toContainText('À commencer');
  await page.getByTestId('save-learning').uncheck();
  expect(await page.evaluate(() => localStorage.getItem('pmx-learning-v1'))).toBeNull();
});

test('Learning: multiplication glyph survives unavailable web fonts', async ({ page }, testInfo) => {
  await page.route(/\.woff2?(\?.*)?$/, route => route.abort());
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(path(activities[0]));
  const symbol = page.getByTestId('activity-cov-weight-eta').locator('.context .multiplication').first();
  await expect(symbol).toHaveText('×');
  await expect(symbol).toBeVisible();
  expect(await symbol.evaluate(el => getComputedStyle(el).fontFamily)).toContain('Arial');
  const session = await page.context().newCDPSession(page);
  await session.send('DOM.enable'); await session.send('CSS.enable');
  const { root } = await session.send('DOM.getDocument');
  const { nodeId } = await session.send('DOM.querySelector', { nodeId: root.nodeId, selector: '#activity-cov-weight-eta .context .multiplication' });
  const { fonts } = await session.send('CSS.getPlatformFontsForNode', { nodeId });
  expect(fonts.some(font => !font.isCustomFont && font.glyphCount > 0)).toBe(true);
  await page.screenshot({ path: testInfo.outputPath('multiplication-mobile.png') });
});

test('Learning: activity links open after client-side chapter navigation', async ({ page }) => {
  await page.goto(`${prefix}/parcours/core/?lang=fr`);
  const volume = activities.find(a => a.chapter === 'clairance-volume-demi-vie');
  await page.getByRole('link', { name: volume.title.fr, exact: true }).click();
  await expect(page.getByTestId(`activity-${volume.id}`)).toHaveAttribute('open', '');
  const absorption = activities.find(a => a.chapter === 'absorption-orale');
  await page.getByRole('link', { name: absorption.title.fr, exact: true }).click();
  await expect(page.getByTestId(`activity-${absorption.id}`)).toHaveAttribute('open', '');
  await expect(page.getByTestId(`activity-${absorption.id}`).getByTestId('case-number')).toBeVisible();
});

test('Learning: diagrams preserve settings between steps and invalidate changed solutions', async ({ page }) => {
  await page.goto(path(activities[1]));
  const panel = page.getByTestId('activity-cov-dispersion');
  await panel.locator('fieldset input').nth(0).check();
  await panel.locator('fieldset input').nth(1).check();
  await check(panel).click(); await next(panel).click();
  await panel.getByTestId('lesson-beta').fill('0');
  await panel.getByTestId('lesson-omega').fill('0');
  await panel.getByRole('button', { name: 'Vérifier les paramètres' }).click();
  await expect(next(panel)).toBeEnabled();
  await panel.getByTestId('lesson-beta').fill('0.5');
  await expect(next(panel)).toBeDisabled();
  await panel.getByTestId('lesson-beta').fill('0');
  await panel.getByRole('button', { name: 'Vérifier les paramètres' }).click();
  await next(panel).click();
  await panel.getByRole('button', { name: 'Précédent', exact: true }).click();
  await expect(panel.getByTestId('lesson-beta')).toHaveValue('0');
  await expect(panel.getByTestId('lesson-omega')).toHaveValue('0');
});

test('Learning: course, exercise index, track navigation and blocked storage', async ({ page }) => {
  const errors = []; page.on('pageerror', error => errors.push(error.message));
  await page.addInitScript(() => { Storage.prototype.setItem = () => { throw new Error('storage blocked'); }; });
  await page.goto(`${prefix}/parcours/covariates/?lang=en`);
  await page.getByTestId('save-learning').check();
  await expect(page.getByRole('alert')).toContainText('Local storage');
  await page.getByTestId('resume-track').click();
  await expect(page.getByTestId('chapter-title')).toBeVisible();
  await expect(page.getByTestId('chapter-exercises').getByTestId('activity-cov-weight-eta')).toBeVisible();
  await page.getByRole('link', { name: 'Track and practice', exact: true }).click();
  await expect(page).toHaveURL(/parcours\/covariates/);
  await page.goto(`${prefix}/exercices/?track=covariates&lang=en`);
  await expect(page.getByTestId('exercise-track-covariates')).toBeVisible();
  await expect(page.locator('details.activity')).toHaveCount(11);
  expect(errors).toEqual([]);
});

test('Learning: denied storage reads and dark keyboard navigation', async ({ page }, testInfo) => {
  const errors = []; page.on('pageerror', error => errors.push(error.message));
  await page.addInitScript(() => {
    Storage.prototype.getItem = () => { throw new Error('storage reads blocked'); };
    Storage.prototype.setItem = () => { throw new Error('storage writes blocked'); };
  });
  await page.emulateMedia({ colorScheme: 'dark', reducedMotion: 'reduce' });
  await page.goto(`${prefix}/parcours/covariates/`);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Covariables');
  await expect(page.getByRole('alert')).toContainText('stockage local');
  const summary = page.getByTestId('activity-cov-weight-eta').locator('summary').first();
  await summary.focus(); await page.keyboard.press('Enter');
  await expect(page.getByTestId('activity-cov-weight-eta')).toHaveAttribute('open', '');
  await expect(page.getByTestId('case-number')).toBeVisible();
  await page.getByTestId('case-number').focus();
  await page.keyboard.type('3,108');
  await page.keyboard.press('Tab');
  await expect(page.getByTestId('case-unit')).toBeFocused();
  await page.screenshot({ path: testInfo.outputPath('exercise-dark.png') });
  expect(errors).toEqual([]);
});
