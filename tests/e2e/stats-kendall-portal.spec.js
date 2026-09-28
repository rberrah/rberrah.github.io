// @ts-nocheck
import { test, expect } from '@playwright/test';

const origin=process.env.PORTAL_E2E_URL||'http://127.0.0.1:4181';

test.beforeEach(async({page})=>{await page.route('**/*',route=>new URL(route.request().url()).origin===origin?route.continue():route.abort());});

test('Stats association workflow reports Kendall tau-b with exact and tied inference modes',async({page})=>{
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  const response=await page.goto(origin+'/stats/tool/');expect(response.status()).toBe(200);
  await page.locator('#analysis-mode').selectOption('association');
  await page.locator('#load-demo').click();
  await page.locator('#run-analysis').click();
  await expect(page.locator('#results .kendall-card')).toBeVisible();
  await expect(page.locator('#results .kendall-card h3')).toHaveText('Kendall τ-b');
  await expect(page.locator('#results .kendall-card')).toContainText('Exacte');
  await expect(page.locator('#results .kendall-card')).toContainText('1');
  await expect(page.locator('#results .result-card')).toHaveCount(4);

  await page.locator('#data-input').fill('x,y\n1,1\n1,2\n2,2\n3,4');
  await page.locator('#parse-data').click();
  await page.locator('#run-analysis').click();
  await expect(page.locator('#results .kendall-card')).toContainText('Asymptotique');
  await expect(page.locator('#results .kendall-card')).toContainText('0.800');
  expect(errors).toEqual([]);
});

test('Kendall result follows the FR/EN interface and remains local',async({page})=>{
  await page.goto(origin+'/stats/tool/');
  await page.locator('#analysis-mode').selectOption('association');
  await page.locator('#load-demo').click();
  await page.locator('#run-analysis').click();
  await page.locator('[data-lang-toggle]').click();
  await expect(page.locator('#results .kendall-card')).toContainText('Additional rank analysis');
  await expect(page.locator('#results .kendall-card')).toContainText('Exact');
  await expect(page.locator('#results .kendall-card')).toContainText('especially useful for ordinal values');
});
