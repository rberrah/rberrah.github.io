import { test, expect } from '@playwright/test';

test('TDM reference starts with molecule search, not a wall of tables', async ({ page }) => {
  await page.goto('/pharmacometrie/cibles-tdm/?lang=fr');
  await expect(page.getByTestId('tdm-targets-guide')).toBeVisible();
  await expect(page.getByTestId('tdm-target-search')).toBeVisible();
  await expect(page.getByTestId('tdm-target-card')).toHaveCount(0);
  await expect(page.getByTestId('tdm-manual-entry')).toHaveCount(0);
  await expect(page.getByText('Cibles thérapeutiques', { exact: true })).toBeVisible();
});

test('MPA and MMF aliases show one molecule and four indication cards, with study evidence on demand', async ({ page }) => {
  await page.goto('/pharmacometrie/cibles-tdm/?lang=fr');
  const search = page.getByTestId('tdm-target-search');
  await search.fill('MPA');
  await expect(page.getByTestId('tdm-drug-group')).toHaveCount(1);
  await expect(page.getByTestId('tdm-target-card')).toHaveCount(4);
  const heart = page.getByTestId('tdm-target-card').filter({ has: page.getByRole('heading', { name: 'Greffe cardiaque' }) });
  await expect(heart.getByText('>36', { exact: true })).toBeVisible();
  await expect(heart.getByRole('link', { name: /Source originale/ })).toHaveAttribute('href', /pmc\.ncbi\.nlm\.nih\.gov/);
  await expect(heart.getByTestId('tdm-other-sources')).toBeHidden();
  await heart.locator('summary').click();
  await expect(heart.getByTestId('tdm-other-sources')).toBeVisible();
  await expect(heart.getByText('≈50', { exact: false })).toBeVisible();
  await search.fill('MMF');
  await expect(page.getByTestId('tdm-target-card')).toHaveCount(4);

  const kidney = page.getByTestId('tdm-target-card').filter({ has: page.getByRole('heading', { name: 'Greffe rénale', exact: true }) });
  await kidney.locator('summary').click();
  await expect(kidney.getByTestId('tdm-other-sources').getByRole('link', { name: /IATDMCT.*2021/ })).toBeVisible();
});

test('Valproate displays one primary RCP target; SFPT values and limitations are in details', async ({ page }) => {
  await page.goto('/pharmacometrie/cibles-tdm/?lang=fr');
  await page.getByTestId('tdm-target-search').fill('valproate');
  const card = page.getByTestId('tdm-target-card');
  await expect(card).toHaveCount(1);
  await expect(card.getByText('40–100', { exact: true })).toBeVisible();
  await expect(card.getByRole('link', { name: /Source originale/ })).toHaveAttribute('href', /base-donnees-publique\.medicaments\.gouv\.fr/);
  await expect(card.getByTestId('tdm-other-sources')).toBeHidden();
  await card.locator('summary').click();
  await expect(card.getByTestId('tdm-other-sources')).toBeVisible();
  await expect(card.getByTestId('tdm-other-sources').locator('.alternative-head strong').filter({ hasText: /50–100/ })).toHaveCount(2);
});

test('Different transplant regimens remain distinct; supported mobile English search', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/pharmacometrie/cibles-tdm/?lang=en');
  const search = page.getByTestId('tdm-target-search');
  await search.fill('everolimus');
  await expect(page.getByTestId('tdm-target-card')).toHaveCount(4);
  await expect(page.getByTestId('tdm-target-card').getByText('3–8', { exact: true })).toHaveCount(2);
  await search.fill('tacrolimus');
  await expect(page.getByTestId('tdm-target-card')).toHaveCount(3);
  await expect(page.getByText('Local protocol / study')).toHaveCount(3);
  await expect(page.getByRole('link', { name: /MIPD model library/ })).toBeVisible();
});

test('CHU manual-only drugs give a concise linked no-target state, never fabricated numbers', async ({ page }) => {
  await page.goto('/pharmacometrie/cibles-tdm/?lang=fr');
  const search = page.getByTestId('tdm-target-search');
  await search.fill('céfépime');
  await expect(page.getByTestId('tdm-target-card')).toHaveCount(0);
  await expect(page.getByTestId('tdm-no-target-results')).toBeVisible();
  await expect(page.getByTestId('tdm-manual-entry')).toHaveCount(1);
  await expect(page.getByRole('link', { name: /Document CHU/ })).toHaveAttribute('href', /DocumentNew\.aspx\?idDoc=41157/);
  await search.fill('no-such-molecule-xyz');
  await expect(page.getByText(/Aucune molécule trouvée/)).toBeVisible();
  await page.getByRole('button', { name: 'Effacer la recherche' }).click();
  await expect(page.getByTestId('tdm-target-card')).toHaveCount(0);
});

test('Expanded immunosuppressant references distinguish cyclosporine C0 and C2 and sirolimus regimens', async ({ page }) => {
  await page.goto('/pharmacometrie/cibles-tdm/?lang=fr');
  await page.getByTestId('tdm-target-search').fill('ciclosporine');
  await expect(page.getByTestId('tdm-target-card')).toHaveCount(6);
  await expect(page.getByTestId('tdm-target-card').getByRole('link', { name: /Source originale/ }).first()).toHaveAttribute('href', /PMC13624913/);
  await expect(page.getByText('C₂h', { exact: true })).toHaveCount(3);
  await page.getByTestId('tdm-target-search').fill('sirolimus');
  await expect(page.getByTestId('tdm-target-card')).toHaveCount(2);
  await expect(page.getByTestId('tdm-target-card').getByText('4–12', { exact: true })).toBeVisible();
  await expect(page.getByTestId('tdm-target-card').getByText('12–20', { exact: true })).toBeVisible();
});

test('Expanded antidepressant targets retain analyte and newer AGNP 2026 update warning', async ({ page }) => {
  await page.goto('/pharmacometrie/cibles-tdm/?lang=fr');
  const search = page.getByTestId('tdm-target-search');
  await search.fill('venlafaxine');
  await expect(page.getByTestId('tdm-target-card')).toHaveCount(1);
  await expect(page.getByTestId('tdm-target-card').getByText('140–600', { exact: true })).toBeVisible();
  await page.getByTestId('tdm-target-card').locator('summary').click();
  await expect(page.getByTestId('tdm-target-card').getByText(/O-desméthylvenlafaxine/)).toBeVisible();
  await expect(page.getByRole('link', { name: /AGNP update/ })).toHaveAttribute('href', /42392224/);
  await search.fill('escitalopram');
  await expect(page.getByTestId('tdm-target-card')).toHaveCount(1);
  await expect(page.getByTestId('tdm-target-card').getByText('20–40', { exact: true })).toBeVisible();
  await page.getByTestId('tdm-target-card').locator('summary').click();
  await expect(page.getByTestId('tdm-other-sources').locator('.alternative-head strong')).toContainText('15–80');
});

test('Expanded anti-infective and antiseizure targets preserve indication context and source differences', async ({ page }) => {
  await page.goto('/pharmacometrie/cibles-tdm/?lang=fr');
  const search = page.getByTestId('tdm-target-search');
  await search.fill('posaconazole');
  await expect(page.getByTestId('tdm-target-card')).toHaveCount(2);
  await expect(page.getByTestId('tdm-target-card').getByText('>0,7', { exact: true })).toBeVisible();
  await expect(page.getByTestId('tdm-target-card').getByText('>1', { exact: true })).toBeVisible();
  await search.fill('voriconazole');
  await expect(page.getByTestId('tdm-target-card')).toHaveCount(1);
  await search.fill('lévétiracétam');
  await expect(page.getByTestId('tdm-target-card')).toHaveCount(1);
  await expect(page.getByTestId('tdm-target-card').getByText('10–40', { exact: true })).toBeVisible();
  await page.getByTestId('tdm-target-card').locator('summary').click();
  await expect(page.getByTestId('tdm-other-sources').locator('.alternative-head strong')).toContainText('12–46');
  await search.fill('oxcarbazepine');
  await expect(page.getByTestId('tdm-target-card').getByText('3–36', { exact: true })).toBeVisible();
});
