// @ts-nocheck
import {test, expect} from '@playwright/test';

test('frozen normalization is explained without promising causal decomposition FR/EN',
  async ({page}) => {
  await page.goto('/multiomics/tool?lang=fr');
  const section=page.getByTestId('multiomics-validation-evidence');
  await expect(section).toBeVisible();
  await section.locator('details > summary').first().click();
  let note=page.getByTestId('rnaseq-locked-normalization-explanation');
  await expect(note).toBeVisible();
  await expect(note).toContainText('filtre strict avec normalisation fixe');
  await expect(note).toContainText('normalisation recalculée');
  await expect(note).toContainText('réajustés à chaque étape');
  await expect(note).toContainText("pas l'effet causal isolé");
  await page.locator('.language-toggle').getByRole('button',
    {name:'EN',exact:true}).click();
  await section.locator('details > summary').first().click();
  note=page.getByTestId('rnaseq-locked-normalization-explanation');
  await expect(note).toBeVisible();
  await expect(note).toContainText('fixed normalization');
  await expect(note).toContainText('recalculated normalization');
  await expect(note).toContainText('models are refitted');
  await expect(note).toContainText('not a proof of the isolated causal effect');
});
