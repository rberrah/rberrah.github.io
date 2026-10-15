import {test,expect} from '@playwright/test';

test('Beginner omics lessons: method selection, warnings and return to analyzer (FR)',async({page})=>{
  /** @type {string[]} */
  const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto('/multiomics/learn?lang=fr');
  await expect(page.getByRole('heading',{name:/Choisir une méthode et comprendre ses résultats/i})).toBeVisible();
  await expect(page.getByRole('heading',{name:/Comment lire les figures et statistiques/i})).toBeVisible();
  const deseq=page.locator('details.lesson').filter({has:page.locator('summary', {hasText:'DESeq2 / edgeR-QL'})});
  await deseq.locator('summary').click();
  await expect(deseq).toContainText(/comptages RNA-seq bruts entiers/i);
  await expect(page.locator('.caution')).toContainText(/JavaScript.*simplifiés/i);
  await expect(page.getByText(/ANALYSE_REPRODUCTIBLE.Rmd/)).toBeVisible();
  await expect(page.getByText(/Rscript render_notebook.R/)).toBeVisible();
  await page.getByRole('link',{name:/Ouvrir MultiOmics/}).click();
  await expect(page).toHaveURL(/\/multiomics\/tool/);
  expect(errors).toEqual([]);
});

test('Omics homepage links to a readable course',async({page})=>{
  await page.goto('/multiomics');
  const course=page.getByRole('link',{name:/Cours : méthodes et résultats|Learn methods and interpretation/});
  await expect(course).toBeVisible();
  await course.click();
  await expect(page).toHaveURL(/\/multiomics\/learn/);
});
