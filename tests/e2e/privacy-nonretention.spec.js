import { test, expect } from '@playwright/test';

test('model and patient-shaped inputs stay out of storage, URLs, logs and a second browser session', async ({ browser }) => {
  const secrets = [
    'PRIVATE_MODEL_7f61b3',
    'PRIVATE_PATIENT_7f61b3',
    'PRIVATE_CONCENTRATION_7f61b3',
    'PRIVATE_COVARIATE_7f61b3'
  ];
  const first = await browser.newContext();
  const page = await first.newPage();
  /** @type {string[]} */
  const logs = [];
  /** @type {string[]} */
  const requests = [];
  page.on('console', (message) => logs.push(message.text()));
  page.on('request', (request) => requests.push(request.url()));
  await page.goto('/translator/?lang=en');
  const importer = page.locator('.mlxtran-import');
  await importer.getByRole('tab', { name: 'mrgsolve', exact: true }).click();
  await importer.locator('textarea').fill(`$PARAM ${secrets.join('=1 ')}=1\n$ODE\ndxdt_CENT = system("unsupported");`);
  await importer.getByRole('button', { name: 'Build the diagram', exact: true }).click();
  await expect(importer.getByRole('alert')).toBeVisible();
  const persisted = await page.evaluate(() => JSON.stringify({ local: { ...localStorage }, session: { ...sessionStorage } }));
  for (const secret of secrets) {
    expect(persisted).not.toContain(secret);
    expect(page.url()).not.toContain(secret);
    expect(logs.join('\n')).not.toContain(secret);
    expect(requests.join('\n')).not.toContain(secret);
  }
  await page.reload();
  for (const secret of secrets) await expect(importer.locator('textarea')).not.toHaveValue(new RegExp(secret));
  await first.close();

  const second = await browser.newContext();
  const other = await second.newPage();
  await other.goto('/translator/?lang=en');
  await other.locator('.mlxtran-import').getByRole('tab', { name: 'mrgsolve', exact: true }).click();
  const secondStorage = await other.evaluate(() => JSON.stringify({ local: { ...localStorage }, session: { ...sessionStorage } }));
  for (const secret of secrets) {
    await expect(other.locator('.mlxtran-import textarea')).not.toHaveValue(new RegExp(secret));
    expect(secondStorage).not.toContain(secret);
  }
  await second.close();
});
